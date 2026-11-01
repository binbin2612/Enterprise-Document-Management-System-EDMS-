const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/ui-modernization/screenshots');
const ARTIFACT_DIR = 'C:\\Users\\vo trong hieu\\.gemini\\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

async function captureRemaining() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // Login
    const adminUser = process.env.EDMS_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.EDMS_ADMIN_PASSWORD || '123';
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username-input');
    await page.type('#username-input', adminUser);
    await page.type('#password-input', adminPass);
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ent-sidebar', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Documents Page Screenshot
    console.log('Capturing Documents Page...');
    const docsPath = path.join(OUTPUT_DIR, 'users', '05_document_management_aurora.png');
    await page.screenshot({ path: docsPath });
    fs.copyFileSync(docsPath, path.join(ARTIFACT_DIR, 'aurora_document_management.png'));
    console.log('   Captured Documents Page.');

    // 2. Responsive Viewports
    const viewports = [
      { name: 'laptop_1366x768', width: 1366, height: 768 },
      { name: 'tablet_768x1024', width: 768, height: 1024 },
      { name: 'mobile_390x844', width: 390, height: 844 },
      { name: 'mobile_375x812', width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      console.log(`Setting viewport ${vp.name}...`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 600));
      const vpPath = path.join(OUTPUT_DIR, 'responsive', `vp_${vp.name}.png`);
      await page.screenshot({ path: vpPath });
      if (vp.name === 'mobile_390x844') {
        fs.copyFileSync(vpPath, path.join(ARTIFACT_DIR, 'aurora_mobile_390x844.png'));
      }
      console.log(`   Captured ${vp.name}`);
    }

    // 3. Dark Mode
    console.log('Testing Dark Mode...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await new Promise(r => setTimeout(r, 600));

    const darkDocsPath = path.join(OUTPUT_DIR, 'dark-mode', '01_dark_mode_documents.png');
    await page.screenshot({ path: darkDocsPath });
    fs.copyFileSync(darkDocsPath, path.join(ARTIFACT_DIR, 'aurora_dark_mode_documents.png'));
    console.log('   Captured Dark Mode Documents.');

    // Open notification panel in dark mode
    await page.click('#nav-notifications-btn');
    await new Promise(r => setTimeout(r, 600));
    const darkNotifPath = path.join(OUTPUT_DIR, 'dark-mode', '02_dark_mode_notifications.png');
    await page.screenshot({ path: darkNotifPath });
    fs.copyFileSync(darkNotifPath, path.join(ARTIFACT_DIR, 'aurora_dark_mode_notifications.png'));
    console.log('   Captured Dark Mode Notifications.');

    // Switch to Task Center in dark mode
    await page.click('.btn-icon-close');
    await new Promise(r => setTimeout(r, 300));
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'tasks' }));
    });
    await new Promise(r => setTimeout(r, 800));
    const darkTaskPath = path.join(OUTPUT_DIR, 'dark-mode', '03_dark_mode_tasks.png');
    await page.screenshot({ path: darkTaskPath });
    fs.copyFileSync(darkTaskPath, path.join(ARTIFACT_DIR, 'aurora_dark_mode_tasks.png'));
    console.log('   Captured Dark Mode Tasks.');

    // Switch to Users in dark mode
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'users' }));
    });
    await new Promise(r => setTimeout(r, 800));
    const darkUsersPath = path.join(OUTPUT_DIR, 'dark-mode', '04_dark_mode_users.png');
    await page.screenshot({ path: darkUsersPath });
    fs.copyFileSync(darkUsersPath, path.join(ARTIFACT_DIR, 'aurora_dark_mode_users.png'));
    console.log('   Captured Dark Mode Users.');

    console.log('REMAINING SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during captureRemaining:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureRemaining();

