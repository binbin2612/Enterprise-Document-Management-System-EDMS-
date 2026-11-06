const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const assert = require('assert');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8080/api';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ADMIN_CRED = { username: process.env.EDMS_ADMIN_USERNAME || 'admin', password: process.env.EDMS_ADMIN_PASSWORD || '123' };
const STAFF_CRED = { username: 'staff', password: '123' };
const USER_CRED = { username: 'user', password: '123' };

async function loginApi(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed for ${username}: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return data.token;
}

async function uploadDoc(token, title, accessMode = 'PRIVATE') {
  const boundary = '----Boundary' + crypto.randomBytes(8).toString('hex');
  const crlf = '\r\n';
  const content = `Security Test Document Content - ${Date.now()}`;
  let body = '';
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="title"${crlf}${crlf}${title}${crlf}`;
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="documentType"${crlf}${crlf}Hợp đồng${crlf}`;
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="accessMode"${crlf}${crlf}${accessMode}${crlf}`;
  body += `--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="sec_test.txt"${crlf}Content-Type: text/plain${crlf}${crlf}${content}${crlf}--${boundary}--${crlf}`;

  const res = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: Buffer.from(body, 'utf8')
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  return await res.json();
}

async function run() {
  console.log('=============================================================');
  console.log('   EDMS SECURITY & MULTI-USER ACCESS CONTROL VERIFICATION');
  console.log('=============================================================\n');

  const results = [];
  function record(testId, name, status, details) {
    console.log(`[${testId}] ${name} -> ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}: ${details}`);
    results.push({ testId, name, status, details });
  }

  // 1. HTTP 401 when unauthenticated
  console.log('--- 1. UNAUTHENTICATED ACCESS BOUNDARY (HTTP 401) ---');
  const unauthRes1 = await fetch(`${API_URL}/admin/users`);
  if (unauthRes1.status === 401) {
    record('SEC-01', 'Unauthenticated call to /api/admin/users', 'PASS', 'HTTP 401 Unauthorized returned');
  } else {
    record('SEC-01', 'Unauthenticated call to /api/admin/users', 'FAIL', `Expected 401, got ${unauthRes1.status}`);
  }

  const unauthRes2 = await fetch(`${API_URL}/documents`);
  if (unauthRes2.status === 401) {
    record('SEC-02', 'Unauthenticated call to /api/documents', 'PASS', 'HTTP 401 Unauthorized returned');
  } else {
    record('SEC-02', 'Unauthenticated call to /api/documents', 'FAIL', `Expected 401, got ${unauthRes2.status}`);
  }

  // 2. HTTP 403 on insufficient permissions
  console.log('\n--- 2. ROLE PRIVILEGE BOUNDARY (HTTP 403) ---');
  const staffToken = await loginApi(STAFF_CRED.username, STAFF_CRED.password);
  const userToken = await loginApi(USER_CRED.username, USER_CRED.password);
  const adminToken = await loginApi(ADMIN_CRED.username, ADMIN_CRED.password);

  const staffAdminRes = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  if (staffAdminRes.status === 403) {
    record('SEC-03', 'STAFF forbidden from /api/admin/users', 'PASS', 'HTTP 403 Forbidden properly enforced');
  } else {
    record('SEC-03', 'STAFF forbidden from /api/admin/users', 'FAIL', `Expected 403, got ${staffAdminRes.status}`);
  }

  const userAdminRes = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userAdminRes.status === 403) {
    record('SEC-04', 'USER forbidden from /api/admin/users', 'PASS', 'HTTP 403 Forbidden properly enforced');
  } else {
    record('SEC-04', 'USER forbidden from /api/admin/users', 'FAIL', `Expected 403, got ${userAdminRes.status}`);
  }

  const userStatusRes = await fetch(`${API_URL}/admin/system/status`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userStatusRes.status === 403) {
    record('SEC-05', 'USER forbidden from /api/admin/system/status', 'PASS', 'HTTP 403 Forbidden properly enforced');
  } else {
    record('SEC-05', 'USER forbidden from /api/admin/system/status', 'FAIL', `Expected 403, got ${userStatusRes.status}`);
  }

  // 3. PRIVATE Document Isolation
  console.log('\n--- 3. PRIVATE DOCUMENT ACCESS ISOLATION ---');
  const privateDoc = await uploadDoc(staffToken, `Staff_Private_${Date.now()}`, 'PRIVATE');
  console.log(`   Staff created PRIVATE document ID: ${privateDoc.id}`);

  // User attempts to view private document
  const userDocRes = await fetch(`${API_URL}/documents/${privateDoc.id}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userDocRes.status === 403) {
    record('SEC-06', 'Unauthorized USER blocked from viewing PRIVATE doc', 'PASS', 'HTTP 403 Forbidden returned');
  } else {
    record('SEC-06', 'Unauthorized USER blocked from viewing PRIVATE doc', 'FAIL', `Expected 403, got ${userDocRes.status}`);
  }

  // User attempts to download private document
  const userDownloadRes = await fetch(`${API_URL}/documents/${privateDoc.id}/download`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userDownloadRes.status === 403) {
    record('SEC-07', 'Unauthorized USER blocked from downloading PRIVATE doc', 'PASS', 'HTTP 403 Forbidden returned');
  } else {
    record('SEC-07', 'Unauthorized USER blocked from downloading PRIVATE doc', 'FAIL', `Expected 403, got ${userDownloadRes.status}`);
  }

  // 4. Access Sharing and Immediate Revocation
  console.log('\n--- 4. PERMISSION SHARING & IMMEDIATE REVOCATION ---');
  const targetUserId = 172; // 'user' account ID
  const shareRes = await fetch(`${API_URL}/documents/${privateDoc.id}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${staffToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: targetUserId,
      permission: 'READ'
    })
  });
  if (!shareRes.ok) throw new Error(`Share failed (${shareRes.status}): ${await shareRes.text()}`);

  // User now accesses document
  const userSharedRes = await fetch(`${API_URL}/documents/${privateDoc.id}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userSharedRes.status === 200) {
    record('SEC-08', 'Shared document accessible by granted USER', 'PASS', 'HTTP 200 OK after permission granted');
  } else {
    record('SEC-08', 'Shared document accessible by granted USER', 'FAIL', `Expected 200, got ${userSharedRes.status}`);
  }

  // Staff revokes permission
  const revokeRes = await fetch(`${API_URL}/documents/${privateDoc.id}/permissions/${targetUserId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  if (!revokeRes.ok) throw new Error(`Revoke failed (${revokeRes.status}): ${await revokeRes.text()}`);

  // User immediately blocked again
  const userAfterRevokeRes = await fetch(`${API_URL}/documents/${privateDoc.id}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (userAfterRevokeRes.status === 403) {
    record('SEC-09', 'Revocation takes immediate effect', 'PASS', 'HTTP 403 Forbidden immediately after revocation');
  } else {
    record('SEC-09', 'Revocation takes immediate effect', 'FAIL', `Expected 403, got ${userAfterRevokeRes.status}`);
  }

  // 5. Notification Privacy & Parameter Tampering Block
  console.log('\n--- 5. NOTIFICATION ISOLATION & PARAMETER TAMPERING DEFENSE ---');
  const staffNotifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  const staffNotifsPage = staffNotifsRes.ok ? await staffNotifsRes.json() : { content: [] };
  const staffNotifs = staffNotifsPage.content || [];

  const userNotifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const userNotifsPage = userNotifsRes.ok ? await userNotifsRes.json() : { content: [] };
  const userNotifs = userNotifsPage.content || [];

  const staffNotifIds = new Set(staffNotifs.map(n => n.id));
  const userNotifIds = new Set(userNotifs.map(n => n.id));
  let overlap = 0;
  for (const id of staffNotifIds) {
    if (userNotifIds.has(id)) overlap++;
  }
  if (overlap === 0) {
    record('SEC-10', 'Notification privacy between accounts', 'PASS', `Staff has ${staffNotifs.length} notifs, User has ${userNotifs.length} notifs. 0 overlap.`);
  } else {
    record('SEC-10', 'Notification privacy between accounts', 'FAIL', `Found ${overlap} overlapping notifications between accounts`);
  }

  // Attempt horizontal privilege escalation via ?username=admin
  const tamperNotifsRes = await fetch(`${API_URL}/notifications?username=admin`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (tamperNotifsRes.status === 403) {
    record('SEC-11', 'Horizontal privilege escalation via ?username= param rejected', 'PASS', 'HTTP 403 Forbidden returned when user attempts ?username=admin');
  } else {
    record('SEC-11', 'Horizontal privilege escalation via ?username= param rejected', 'FAIL', `Expected 403, got ${tamperNotifsRes.status}`);
  }

  // 6. Two Independent Browser Sessions (Puppeteer Multi-Context)
  console.log('\n--- 6. MULTI-BROWSER INDEPENDENT SESSIONS ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const ctx1 = await browser.createBrowserContext();
    const ctx2 = await browser.createBrowserContext();

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    // Session 1: Login as STAFF
    await page1.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page1.type('#username-input', 'staff');
    await page1.type('#password-input', '123');
    await page1.click('button[type="submit"]');
    await page1.waitForSelector('#nav-docs-btn', { timeout: 10000 });
    const staffNavHasAdmin = await page1.$('#nav-users-btn');
    assert.strictEqual(staffNavHasAdmin, null, 'Session 1 STAFF should not see #nav-users-btn');

    // Session 2: Login as ADMIN
    await page2.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page2.type('#username-input', 'admin');
    await page2.type('#password-input', '123');
    await page2.click('button[type="submit"]');
    await page2.waitForSelector('#nav-docs-btn', { timeout: 10000 });
    const adminNavHasAdmin = await page2.$('#nav-users-btn');
    assert.notStrictEqual(adminNavHasAdmin, null, 'Session 2 ADMIN must see #nav-users-btn');

    record('SEC-12', 'Multi-browser independent sessions isolation', 'PASS', 'Context 1 (STAFF) and Context 2 (ADMIN) completely isolated simultaneously');

    await ctx1.close();
    await ctx2.close();
  } finally {
    await browser.close();
  }

  // 7. Concurrent Operations Data Integrity
  console.log('\n--- 7. CONCURRENT OPERATIONS INTEGRITY ---');
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(fetch(`${API_URL}/documents?page=0&size=10`, { headers: { 'Authorization': `Bearer ${staffToken}` } }));
    promises.push(fetch(`${API_URL}/documents?page=0&size=10`, { headers: { 'Authorization': `Bearer ${userToken}` } }));
    promises.push(fetch(`${API_URL}/documents?page=0&size=10`, { headers: { 'Authorization': `Bearer ${adminToken}` } }));
  }
  const conRes = await Promise.all(promises);
  const all200 = conRes.every(r => r.status === 200);
  if (all200) {
    record('SEC-13', '18 Concurrent multi-user requests', 'PASS', 'All 18 requests returned HTTP 200 OK without deadlocks');
  } else {
    record('SEC-13', '18 Concurrent multi-user requests', 'FAIL', 'Some concurrent requests failed');
  }

  // 8. Log Sanitizer & Secret Hygiene
  console.log('\n--- 8. SERVER LOG SANITIZER & SECRET HYGIENE AUDIT ---');
  const serverLogs = execSync('docker logs --tail 250 edms-backend', { encoding: 'utf8' });
  const hasJwt = /Bearer\s+ey[A-Za-z0-9_-]{20,}/.test(serverLogs);
  const hasPlainPass = serverLogs.includes('"password":"123"') || serverLogs.includes('password=123');
  const hasKeyHeader = serverLogs.includes('BEGIN PRIVATE KEY') || serverLogs.includes('BEGIN RSA PRIVATE KEY');

  if (!hasJwt && !hasPlainPass && !hasKeyHeader) {
    record('SEC-14', 'Backend log sanitizer secret hygiene', 'PASS', 'Zero JWT, zero plaintext passwords, zero private keys detected in server logs');
  } else {
    record('SEC-14', 'Backend log sanitizer secret hygiene', 'FAIL', `Leak detected: JWT=${hasJwt}, Pass=${hasPlainPass}, Key=${hasKeyHeader}`);
  }

  // 9. WebSocket Handshake & Security
  console.log('\n--- 9. WEBSOCKET ENDPOINT & RECONNECT ---');
  const wsInfoRes = await fetch('http://localhost:8080/ws-edms/info', {
    headers: { 'Origin': 'http://localhost:5173' }
  });
  if (wsInfoRes.ok) {
    const wsInfo = await wsInfoRes.json();
    record('SEC-15', 'WebSocket SockJS handshake endpoint', 'PASS', `WebSocket endpoint active, entropy: ${wsInfo.entropy}`);
  } else {
    record('SEC-15', 'WebSocket SockJS handshake endpoint', 'FAIL', `Expected 200, got ${wsInfoRes.status}`);
  }

  console.log('\n=============================================================');
  console.log(`   🎉 SECURITY TEST SUMMARY: ${results.filter(r => r.status === 'PASS').length} / ${results.length} PASSED`);
  console.log('=============================================================');

  const rootDir = path.resolve(__dirname, '..');
  fs.writeFileSync(path.join(rootDir, 'scratch', 'security_test_results.json'), JSON.stringify(results, null, 2), 'utf8');

  const failed = results.filter(r => r.status !== 'PASS');
  if (failed.length > 0) {
    console.error(`❌ FATAL: ${failed.length} security tests failed!`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('❌ FATAL Security test failure:', err);
  process.exit(1);
});
