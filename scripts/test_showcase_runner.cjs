const { spawnSync } = require('child_process');
const path = require('path');
const assert = require('assert');

const scriptPath = path.resolve(__dirname, 'capture_showcase.cjs');

console.log('🧪 Starting Automated Tests for capture_showcase.cjs Runner Integrity...');

// Test 1: Missing environment variables must fail with exit code 1
console.log('Test 1: Verify fail-closed exit code when env vars are missing...');
const res1 = spawnSync(process.execPath, [scriptPath], {
  env: { ...process.env, EDMS_ADMIN_USERNAME: '', EDMS_ADMIN_PASSWORD: '' },
  encoding: 'utf8'
});
assert.strictEqual(res1.status, 1, `Expected exit code 1 for missing env vars, got ${res1.status}`);
assert(res1.stderr.includes('FATAL: Environment variables'), 'Expected FATAL error message in stderr');
console.log('  -> PASS: Test 1 exited with code 1 as expected.');

// Test 2: Invalid password must fail with exit code 1
console.log('Test 2: Verify fail-closed exit code when password is wrong...');
const res2 = spawnSync(process.execPath, [scriptPath], {
  env: { ...process.env, EDMS_ADMIN_USERNAME: 'admin', EDMS_ADMIN_PASSWORD: 'InvalidPasswordXYZ!' },
  encoding: 'utf8'
});
assert.strictEqual(res2.status, 1, `Expected exit code 1 for wrong password, got ${res2.status}`);
assert(res2.stderr.includes('FATAL Showcase capture failed'), 'Expected FATAL Showcase capture failed message');
assert(!res2.stdout.includes('InvalidPasswordXYZ!'), 'Security assertion: Password must not be leaked in stdout');
assert(!res2.stderr.includes('InvalidPasswordXYZ!'), 'Security assertion: Password must not be leaked in stderr');
console.log('  -> PASS: Test 2 exited with code 1 and zero credentials leaked.');

// Test 3: Valid credentials must succeed with exit code 0
console.log('Test 3: Verify clean exit code 0 with valid credentials...');
const res3 = spawnSync(process.execPath, [scriptPath], {
  env: { ...process.env, EDMS_ADMIN_USERNAME: 'admin', EDMS_ADMIN_PASSWORD: '123' },
  encoding: 'utf8'
});
assert.strictEqual(res3.status, 0, `Expected exit code 0 for valid credentials, got ${res3.status}`);
assert(res3.stdout.includes('All showcase screenshots captured successfully'), 'Expected success output message');
console.log('  -> PASS: Test 3 exited with code 0 cleanly.');

console.log('\n🎉 ALL capture_showcase.cjs TEST RUNNER ASSERTIONS PASSED (100% Verified)!');
