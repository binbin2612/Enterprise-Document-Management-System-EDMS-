const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_IMG_DIR = 'C:\\Users\\vo trong hieu\\.gemini\\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

if (!fs.existsSync(ARTIFACT_IMG_DIR)) {
  fs.mkdirSync(ARTIFACT_IMG_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Login Page
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_login_screen.png') });
  console.log('1. Captured edms_login_screen.png');

  // 2. Login as admin using environment variables (no fallback)
  const adminUser = process.env.EDMS_ADMIN_USERNAME;
  const adminPass = process.env.EDMS_ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    console.error('❌ FATAL: Environment variables EDMS_ADMIN_USERNAME and EDMS_ADMIN_PASSWORD are required (no fallback allowed).');
    process.exit(1);
  }
  await page.type('#username-input', adminUser);
  await page.type('#password-input', adminPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_documents.png') });
  console.log('2. Captured edms_admin_documents.png');

  // 3. Navigate to Dashboard
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'dashboard' }));
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_dashboard.png') });
  console.log('3. Captured edms_admin_dashboard.png');

  // 4. Navigate to Users & Roles
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'users' }));
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_users.png') });
  console.log('4. Captured edms_admin_users.png');

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(console.error);

