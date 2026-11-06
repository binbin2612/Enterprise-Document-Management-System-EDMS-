const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_IMG_DIR = 'C:\\Users\\vo trong hieu\\.gemini\\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

if (!fs.existsSync(ARTIFACT_IMG_DIR)) {
  fs.mkdirSync(ARTIFACT_IMG_DIR, { recursive: true });
}

async function capture() {
  const adminUser = process.env.EDMS_ADMIN_USERNAME;
  const adminPass = process.env.EDMS_ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    console.error('❌ FATAL: Environment variables EDMS_ADMIN_USERNAME and EDMS_ADMIN_PASSWORD are required (no fallback allowed).');
    process.exit(1);
  }

  let browser = null;
  const consoleErrors = [];

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Sanitize: do not log credentials/tokens
        if (!text.includes('Bearer') && !text.includes('token') && !text.includes('password')) {
          consoleErrors.push(text);
        } else {
          consoleErrors.push('[REDACTED_SECURITY_ERROR]');
        }
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message || err.toString());
    });

    // 1. Capture Login Page
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    const userInput = await page.waitForSelector('#username-input', { timeout: 10000 });
    if (!userInput) throw new Error('Assertion failed: #username-input not found on login page');
    const passInput = await page.waitForSelector('#password-input', { timeout: 10000 });
    if (!passInput) throw new Error('Assertion failed: #password-input not found on login page');

    await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_login_screen.png') });
    console.log('1. Captured edms_login_screen.png');

    // 2. Login as admin using environment variables (sanitized, no credentials printed)
    console.log(`2. Logging in as user: ${adminUser.substring(0, 3)}***...`);
    await page.type('#username-input', adminUser);
    await page.type('#password-input', adminPass);
    await page.click('button[type="submit"]');

    // Wait for authenticated app shell
    const appShell = await page.waitForSelector('#nav-docs-btn, .ent-sidebar, nav', { timeout: 15000 });
    if (!appShell) throw new Error('Assertion failed: Authenticated app shell not loaded after login');
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_documents.png') });
    console.log('2. Captured edms_admin_documents.png');

    // 3. Navigate to Dashboard
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'dashboard' }));
    });
    const kpiGrid = await page.waitForSelector('.dash-kpi-grid', { timeout: 10000 });
    if (!kpiGrid) throw new Error('Assertion failed: .dash-kpi-grid not rendered on dashboard');
    const activityTable = await page.waitForSelector('.dash-table', { timeout: 10000 });
    if (!activityTable) throw new Error('Assertion failed: .dash-table not rendered on dashboard');
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_dashboard.png') });
    console.log('3. Captured edms_admin_dashboard.png');

    // 4. Navigate to Users & Roles
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'users' }));
    });
    const usersTable = await page.waitForSelector('#create-user-btn, .table-responsive-card, .data-table, .ent-table', { timeout: 10000 });
    if (!usersTable) throw new Error('Assertion failed: Users table or Create button not rendered');
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_IMG_DIR, 'edms_admin_users.png') });
    console.log('4. Captured edms_admin_users.png');

    if (consoleErrors.length > 0) {
      console.error(`❌ FATAL: Detected ${consoleErrors.length} console errors during showcase capture:`, consoleErrors);
      process.exit(1);
    }

    console.log('All showcase screenshots captured successfully.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

capture()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FATAL Showcase capture failed:', err.message);
    process.exit(1);
  });
