const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIMARY_API = 'http://localhost:8080/api';
const RECOVERY_API = 'http://localhost:18080/api';
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

const ADMIN_USER = process.env.EDMS_ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.EDMS_ADMIN_PASSWORD || '123';

function computeSha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').toLowerCase();
}

function execCmd(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForHealth(baseUrl, maxAttempts = 35) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'UP') return true;
      }
    } catch (_) {}
    await sleep(1000);
  }
  throw new Error(`Timeout waiting for ${baseUrl}/health to be UP`);
}

async function login(baseUrl, username, password) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed for ${username} on ${baseUrl} (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.token;
}

async function uploadDocument(baseUrl, token, title, docType, filename, contentBuf, accessMode = 'INTERNAL') {
  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');
  const crlf = '\r\n';

  let body = '';
  // Field: title
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="title"${crlf}${crlf}${title}${crlf}`;
  // Field: documentType
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="documentType"${crlf}${crlf}${docType}${crlf}`;
  // Field: accessMode
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="accessMode"${crlf}${crlf}${accessMode}${crlf}`;
  // Field: file
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}Content-Type: text/plain${crlf}${crlf}`;

  const headBuf = Buffer.from(body, 'utf8');
  const tailBuf = Buffer.from(`${crlf}--${boundary}--${crlf}`, 'utf8');
  const fullPayload = Buffer.concat([headBuf, contentBuf, tailBuf]);

  const res = await fetch(`${baseUrl}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: fullPayload
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed (${res.status}): ${err}`);
  }
  return await res.json();
}

async function run() {
  console.log('=============================================================');
  console.log('   EDMS DOCKER DATA RESILIENCE, PERSISTENCE & DISASTER RECOVERY');
  console.log('=============================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    persistence: {},
    backup: {},
    restore: {},
    verdict: 'PENDING'
  };

  // STEP 0: Pre-flight check
  console.log('0. Pre-flight isolation & health check...');
  const dockerPs = execCmd('docker ps --format "{{.Names}}\t{{.Status}}"');
  console.log('Active containers:\n' + dockerPs);
  await waitForHealth(PRIMARY_API);
  console.log('✅ Primary backend health verified: UP\n');

  // PART A: PERSISTENCE TESTING
  console.log('--- PART A: DOCKER PERSISTENCE VERIFICATION ---');
  const token = await login(PRIMARY_API, ADMIN_USER, ADMIN_PASS);
  const testDocContent = Buffer.from(`EDMS QA Persistence Test Content. Generated at ${new Date().toISOString()} - Random: ${crypto.randomBytes(8).toString('hex')}\n`, 'utf8');
  const expectedSha256 = computeSha256(testDocContent);
  const testDocTitle = `QA_Persistence_${Date.now()}`;
  const testFilename = `qa_persist_${Date.now()}.txt`;

  console.log(`1. Uploading test document: "${testDocTitle}"...`);
  console.log(`   Expected SHA-256: ${expectedSha256}`);
  const uploadedDoc = await uploadDocument(PRIMARY_API, token, testDocTitle, 'Báo cáo', testFilename, testDocContent);
  console.log(`   Created Document ID: ${uploadedDoc.id}, File Name: ${uploadedDoc.originalFileName}`);

  // Verify DB record
  const dbDocCheck = execCmd(`docker exec edms-postgres psql -U edms_user -d edms_db -t -A -c "SELECT d.id, d.title, d.document_type, d.file_size, v.file_hash FROM documents d JOIN document_versions v ON d.id = v.document_id WHERE d.id = ${uploadedDoc.id};"`);
  console.log(`   Database verification: ${dbDocCheck}`);

  // 2. Restart backend container gracefully
  console.log('2. Gracefully restarting edms-backend container to test persistence...');
  execCmd('docker restart edms-backend');
  console.log('   Waiting for edms-backend to re-initialize...');
  await waitForHealth(PRIMARY_API, 45);
  console.log('✅ edms-backend restarted and healthy.');

  // 3. Re-login & fetch document
  console.log('3. Re-authenticating and fetching document after container restart...');
  const tokenAfterRestart = await login(PRIMARY_API, ADMIN_USER, ADMIN_PASS);
  const docAfterRestartRes = await fetch(`${PRIMARY_API}/documents/${uploadedDoc.id}`, {
    headers: { 'Authorization': `Bearer ${tokenAfterRestart}` }
  });
  if (!docAfterRestartRes.ok) throw new Error(`Failed to fetch document after restart: ${docAfterRestartRes.status}`);
  const docAfterRestart = await docAfterRestartRes.json();
  console.log(`   Document retrieved: ID ${docAfterRestart.id}, Title: "${docAfterRestart.title}"`);

  // 4. Download file and verify SHA-256
  console.log('4. Downloading file and verifying SHA-256 hash integrity...');
  const downloadRes = await fetch(`${PRIMARY_API}/documents/${uploadedDoc.id}/download`, {
    headers: { 'Authorization': `Bearer ${tokenAfterRestart}` }
  });
  if (!downloadRes.ok) throw new Error(`Failed to download file after restart: ${downloadRes.status}`);
  const downloadedBuf = Buffer.from(await downloadRes.arrayBuffer());
  const actualSha256 = computeSha256(downloadedBuf);
  console.log(`   Downloaded SHA-256: ${actualSha256}`);
  if (actualSha256 !== expectedSha256) {
    throw new Error(`Data corruption detected! Expected ${expectedSha256}, got ${actualSha256}`);
  }
  console.log('✅ PERSISTENCE VERIFIED: 100% bit-exact hash match after container restart!\n');

  report.persistence = {
    docId: uploadedDoc.id,
    title: testDocTitle,
    fileSize: testDocContent.length,
    expectedSha256,
    actualSha256,
    match: actualSha256 === expectedSha256,
    status: 'PASS'
  };

  // PART B: BACKUP CREATION
  console.log('--- PART B: CREATING ISOLATED QA BACKUP ---');
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  const backupFolder = path.join(BACKUPS_DIR, `qa_resilience_backup_${Date.now()}`);
  fs.mkdirSync(backupFolder, { recursive: true });
  fs.mkdirSync(path.join(backupFolder, 'keystore'), { recursive: true });

  console.log(`1. Dumping PostgreSQL database edms_db to custom format (-Fc)...`);
  const dbDumpPath = path.join(backupFolder, 'database.dump');
  execSync(`docker exec edms-postgres pg_dump -U edms_user -Fc edms_db > "${dbDumpPath}"`);
  const dbDumpSize = fs.statSync(dbDumpPath).size;
  console.log(`   database.dump created: ${dbDumpSize.toLocaleString()} bytes`);

  console.log('2. Copying uploaded files storage archive...');
  execSync(`docker cp edms-backend:/app/storage/uploads "${path.join(backupFolder, 'storage_uploads')}"`);
  const storageFiles = fs.readdirSync(path.join(backupFolder, 'storage_uploads'));
  console.log(`   Copied ${storageFiles.length} storage files.`);

  console.log('3. Copying signing KeyStore...');
  const ksPath = path.join(backupFolder, 'keystore', 'edms-signing.p12');
  execSync(`docker cp edms-backend:/app/keys/edms-signing.p12 "${ksPath}"`);
  console.log(`   KeyStore copied: ${fs.statSync(ksPath).size} bytes`);

  // Record baseline counts from DB
  const userCount = parseInt(execCmd('docker exec edms-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM users;"'), 10);
  const docCount = parseInt(execCmd('docker exec edms-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM documents;"'), 10);
  const verCount = parseInt(execCmd('docker exec edms-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM document_versions;"'), 10);

  const manifest = {
    timestamp: new Date().toISOString(),
    counts: { userCount, docCount, verCount },
    checksums: {
      dbDumpSha256: computeSha256(fs.readFileSync(dbDumpPath)),
      keystoreSha256: computeSha256(fs.readFileSync(ksPath))
    }
  };
  fs.writeFileSync(path.join(backupFolder, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`   Baseline counts: Users=${userCount}, Documents=${docCount}, Versions=${verCount}`);
  console.log(`✅ BACKUP CREATION COMPLETED.\n`);

  report.backup = {
    backupFolder,
    dbDumpSize,
    storageFilesCount: storageFiles.length,
    counts: manifest.counts,
    checksums: manifest.checksums,
    status: 'PASS'
  };

  // PART C: RESTORE VERIFICATION IN ISOLATED EDMS-RECOVERY ENVIRONMENT
  console.log('--- PART C: RESTORE TO ISOLATED RECOVERY ENVIRONMENT ---');
  console.log('1. Starting isolated edms-recovery-postgres on port 15432...');
  execCmd('docker compose -f docker-compose.recovery.yml up -d recovery-postgres');
  
  // Wait for recovery-postgres healthcheck
  console.log('   Waiting for edms-recovery-postgres to become healthy...');
  for (let i = 0; i < 25; i++) {
    try {
      const st = execCmd('docker inspect edms-recovery-postgres --format "{{.State.Health.Status}}"');
      if (st === 'healthy') break;
    } catch (_) {}
    await sleep(1000);
  }
  console.log('   edms-recovery-postgres is healthy.');

  console.log('2. Restoring PostgreSQL dump into edms-recovery-postgres...');
  execSync(`docker exec -i edms-recovery-postgres pg_restore -U edms_user -d edms_db --clean --if-exists < "${dbDumpPath}"`);
  console.log('   pg_restore completed successfully.');

  console.log('3. Restoring storage and keystore files into recovery environment...');
  // Start recovery-backend and recovery-frontend
  execCmd('docker compose -f docker-compose.recovery.yml up -d recovery-backend recovery-frontend');
  
  // Copy storage files into recovery-backend
  console.log('   Copying storage files to edms-recovery-backend...');
  execSync(`docker cp "${path.join(backupFolder, 'storage_uploads')}/." edms-recovery-backend:/app/storage/uploads/`);
  execSync(`docker cp "${ksPath}" edms-recovery-backend:/app/keys/edms-signing.p12`);

  // Restart recovery-backend to pick up restored storage and keystore cleanly
  execCmd('docker restart edms-recovery-backend');
  console.log('   Waiting for recovery backend on port 18080 to become healthy...');
  await waitForHealth(RECOVERY_API, 45);
  console.log('✅ edms-recovery-backend is healthy and UP on port 18080!');

  // 4. Verify counts in restored database
  console.log('4. Verifying record counts in restored database...');
  const recUserCount = parseInt(execCmd('docker exec edms-recovery-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM users;"'), 10);
  const recDocCount = parseInt(execCmd('docker exec edms-recovery-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM documents;"'), 10);
  const recVerCount = parseInt(execCmd('docker exec edms-recovery-postgres psql -U edms_user -d edms_db -t -A -c "SELECT COUNT(*) FROM document_versions;"'), 10);
  console.log(`   Restored counts: Users=${recUserCount} (exp: ${userCount}), Docs=${recDocCount} (exp: ${docCount}), Versions=${recVerCount} (exp: ${verCount})`);
  
  if (recUserCount !== userCount || recDocCount !== docCount || recVerCount !== verCount) {
    throw new Error(`Count mismatch between primary and recovery environments!`);
  }
  console.log('   Record count assertion: 100% MATCH.');

  // 5. Test login and document download on recovery backend
  console.log('5. Testing authentication & document download on recovery stack (port 18080)...');
  const recToken = await login(RECOVERY_API, ADMIN_USER, ADMIN_PASS);
  const recDownloadRes = await fetch(`${RECOVERY_API}/documents/${uploadedDoc.id}/download`, {
    headers: { 'Authorization': `Bearer ${recToken}` }
  });
  if (!recDownloadRes.ok) throw new Error(`Download on recovery stack failed: ${recDownloadRes.status}`);
  const recDownloadedBuf = Buffer.from(await recDownloadRes.arrayBuffer());
  const recSha256 = computeSha256(recDownloadedBuf);
  console.log(`   Recovery downloaded SHA-256: ${recSha256}`);
  if (recSha256 !== expectedSha256) {
    throw new Error(`SHA-256 mismatch in recovery environment!`);
  }
  console.log('✅ 100% Exact SHA-256 match on restored recovery environment!');

  // 6. Stop recovery containers to keep resources clean
  console.log('6. Stopping isolated recovery containers...');
  execCmd('docker compose -f docker-compose.recovery.yml stop');
  console.log('   Recovery stack stopped.');

  report.restore = {
    recUserCount,
    recDocCount,
    recVerCount,
    expectedSha256,
    recSha256,
    match: recSha256 === expectedSha256,
    status: 'PASS'
  };

  report.verdict = 'ALL_RESILIENCE_TESTS_PASSED';

  console.log('\n=============================================================');
  console.log('   🎉 SUMMARY: PERSISTENCE, BACKUP & RESTORE ALL PASSED 100%');
  console.log('=============================================================');
  console.log(JSON.stringify(report, null, 2));

  fs.writeFileSync(path.join(ROOT_DIR, 'scratch', 'persistence_and_dr_report.json'), JSON.stringify(report, null, 2), 'utf8');
}

run().catch(err => {
  console.error('❌ FATAL Error in Docker Resilience Test:', err);
  process.exit(1);
});
