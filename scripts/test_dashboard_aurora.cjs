const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/ui-modernization/screenshots/dashboard');
const ARTIFACT_DIR = 'C:\\Users\\vo trong hieu\\.gemini\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runDashboardTests() {
  console.log('🚀 Launching Chrome for Modern Aurora Dashboard testing...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Login
    const adminUser = process.env.EDMS_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.EDMS_ADMIN_PASSWORD || '123';
    console.log(`Logging in as ${adminUser}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username-input', { timeout: 8000 });
    await page.type('#username-input', adminUser);
    await page.type('#password-input', adminPass);
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ent-sidebar', { timeout: 10000 });
    console.log('✅ Logged in successfully.');

    // 2. Navigate to Dashboard
    console.log('Navigating to Dashboard...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'dashboard' }));
    });

    // Wait for Dashboard to load
    await page.waitForSelector('.dash-kpi-grid', { timeout: 10000 });
    await page.waitForSelector('.dash-table', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));
    console.log('✅ Dashboard content rendered.');

    // 3. Capture Desktop 1440x900 (Viewport & Full Page)
    console.log('Capturing Desktop 1440x900 (Light Mode)...');
    const desktopPath = path.join(OUTPUT_DIR, '01_dashboard_desktop_1440.png');
    await page.screenshot({ path: desktopPath });
    fs.copyFileSync(desktopPath, path.join(ARTIFACT_DIR, 'aurora_dashboard_1440.png'));

    const desktopFullPath = path.join(OUTPUT_DIR, '01_dashboard_desktop_1440_full.png');
    await page.screenshot({ path: desktopFullPath, fullPage: true });
    fs.copyFileSync(desktopFullPath, path.join(ARTIFACT_DIR, 'aurora_dashboard_1440_full.png'));

    // Capture Activity Card Element close-up
    const activityCard = await page.$('.dash-activity-card');
    if (activityCard) {
      const actPath = path.join(OUTPUT_DIR, '01_activity_card_light.png');
      await activityCard.screenshot({ path: actPath });
      fs.copyFileSync(actPath, path.join(ARTIFACT_DIR, 'aurora_activity_card_light.png'));
    }
    console.log('✅ Captured 01_dashboard_desktop_1440.png & full page.');

    // 4. Responsive Viewports
    const viewports = [
      { name: '1366x768', width: 1366, height: 768, filename: '02_dashboard_laptop_1366.png', artifact: 'aurora_dashboard_1366.png' },
      { name: '768x1024', width: 768, height: 1024, filename: '03_dashboard_tablet_768.png', artifact: 'aurora_dashboard_768.png' },
      { name: '390x844', width: 390, height: 844, filename: '04_dashboard_mobile_390.png', artifact: 'aurora_dashboard_390.png' },
      { name: '375x812', width: 375, height: 812, filename: '05_dashboard_mobile_375.png', artifact: 'aurora_dashboard_375.png' },
    ];

    for (const vp of viewports) {
      console.log(`Setting viewport ${vp.name}...`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 600));
      const vpPath = path.join(OUTPUT_DIR, vp.filename);
      await page.screenshot({ path: vpPath, fullPage: true });
      fs.copyFileSync(vpPath, path.join(ARTIFACT_DIR, vp.artifact));
      console.log(`✅ Captured ${vp.filename}`);
    }

    // 5. Dark Mode
    console.log('Switching to Dark Mode on Desktop 1440x900...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await new Promise(r => setTimeout(r, 800));

    const darkPath = path.join(OUTPUT_DIR, '06_dashboard_dark_mode_1440.png');
    await page.screenshot({ path: darkPath });
    fs.copyFileSync(darkPath, path.join(ARTIFACT_DIR, 'aurora_dashboard_dark_1440.png'));

    const darkFullPath = path.join(OUTPUT_DIR, '06_dashboard_dark_mode_1440_full.png');
    await page.screenshot({ path: darkFullPath, fullPage: true });
    fs.copyFileSync(darkFullPath, path.join(ARTIFACT_DIR, 'aurora_dashboard_dark_1440_full.png'));

    const darkActivityCard = await page.$('.dash-activity-card');
    if (darkActivityCard) {
      const darkActPath = path.join(OUTPUT_DIR, '06_activity_card_dark.png');
      await darkActivityCard.screenshot({ path: darkActPath });
      fs.copyFileSync(darkActPath, path.join(ARTIFACT_DIR, 'aurora_activity_card_dark.png'));
    }
    console.log('✅ Captured 06_dashboard_dark_mode_1440.png & full page.');

    console.log('\n🎉 ALL DASHBOARD SCREENSHOTS & AUDITS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during Dashboard tests:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runDashboardTests();
