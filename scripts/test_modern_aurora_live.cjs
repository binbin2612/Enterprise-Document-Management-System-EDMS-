const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/ui-modernization/screenshots');
const ARTIFACT_DIR = 'C:\\Users\\vo trong hieu\\.gemini\\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

// Ensure directories
[
  OUTPUT_DIR,
  path.join(OUTPUT_DIR, 'notifications'),
  path.join(OUTPUT_DIR, 'users'),
  path.join(OUTPUT_DIR, 'tasks'),
  path.join(OUTPUT_DIR, 'responsive'),
  path.join(OUTPUT_DIR, 'dark-mode'),
  path.join(OUTPUT_DIR, 'roles'),
  ARTIFACT_DIR,
].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function runTests() {
  console.log('Launching Chrome for Modern Aurora UI Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Login as ADMIN
    const adminUser = process.env.EDMS_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.EDMS_ADMIN_PASSWORD || '123';
    console.log(`1. Logging in as ${adminUser}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username-input');
    await page.type('#username-input', adminUser);
    await page.type('#password-input', adminPass);
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ent-sidebar', { timeout: 10000 });
    console.log('   Admin logged in successfully.');

    // 2. Test Notification Panel
    console.log('2. Testing Notification Panel...');
    await page.waitForSelector('#nav-notifications-btn');
    await page.click('#nav-notifications-btn');
    await page.waitForSelector('#notification-panel', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));

    // Capture Notification Panel Open
    const notifPath = path.join(OUTPUT_DIR, 'notifications', '01_notification_panel_open.png');
    await page.screenshot({ path: notifPath });
    fs.copyFileSync(notifPath, path.join(ARTIFACT_DIR, 'aurora_notif_panel_open.png'));
    console.log('   Captured Notification Panel open.');

    // Test filter pills inside Notification Panel
    const unreadPill = await page.$('.filter-pill:nth-child(2)');
    if (unreadPill) {
      await unreadPill.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'notifications', '02_notification_filter_unread.png') });
    }

    // Close notification panel
    const closeBtn = await page.$('.btn-icon-close');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 300));

    // 3. Test Task Center Page
    console.log('3. Testing Task Center Page...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'tasks' }));
    });
    await page.waitForSelector('.task-kpi-grid', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));

    const taskPath = path.join(OUTPUT_DIR, 'tasks', '01_task_center_overview.png');
    await page.screenshot({ path: taskPath });
    fs.copyFileSync(taskPath, path.join(ARTIFACT_DIR, 'aurora_task_center_overview.png'));
    console.log('   Captured Task Center Page overview.');

    // Click on Review Pending KPI Card
    const reviewCard = await page.$('.task-kpi-card--review');
    if (reviewCard) {
      await reviewCard.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'tasks', '02_task_center_filter_review.png') });
    }

    // 4. Test User Management Page
    console.log('4. Testing User Management Page...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'users' }));
    });
    await page.waitForSelector('#users-table', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));

    const usersPath = path.join(OUTPUT_DIR, 'users', '01_users_table_paginated.png');
    await page.screenshot({ path: usersPath });
    fs.copyFileSync(usersPath, path.join(ARTIFACT_DIR, 'aurora_users_table_paginated.png'));
    console.log('   Captured Users Table Page (page 1).');

    // Test Pagination (Click next page)
    const nextPageBtn = await page.$('.ent-pagination__btn[title="Trang sau"]');
    if (nextPageBtn && !(await nextPageBtn.evaluate(el => el.disabled))) {
      await nextPageBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'users', '02_users_table_page_2.png') });
      console.log('   Captured Users Table Page 2.');
    }

    // Test Create User Modal
    console.log('   Testing Create User Modal...');
    const createUserBtn = await page.$('#open-create-user-btn');
    if (createUserBtn) {
      await createUserBtn.click();
      await page.waitForSelector('.ent-modal', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 500));
      const modalPath = path.join(OUTPUT_DIR, 'users', '03_create_user_modal.png');
      await page.screenshot({ path: modalPath });
      fs.copyFileSync(modalPath, path.join(ARTIFACT_DIR, 'aurora_create_user_modal.png'));
      console.log('   Captured Create User Modal.');

      // Close modal
      const cancelBtn = await page.$('#close-create-user-btn');
      if (cancelBtn) await cancelBtn.click();
      await new Promise(r => setTimeout(r, 300));
    }

    // Test Role Matrix Tab
    console.log('   Testing Role Matrix Tab...');
    const matrixTab = await page.$('#tab-roles-matrix');
    if (matrixTab) {
      await matrixTab.click();
      await page.waitForSelector('.matrix-table', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 500));
      const matrixPath = path.join(OUTPUT_DIR, 'users', '04_role_permissions_matrix.png');
      await page.screenshot({ path: matrixPath });
      fs.copyFileSync(matrixPath, path.join(ARTIFACT_DIR, 'aurora_role_permissions_matrix.png'));
      console.log('   Captured Role Permissions Matrix.');
    }

    // 5. Test Document Management Page
    console.log('5. Testing Document Management Page...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'documents' }));
    });
    await page.waitForSelector('#nav-docs-btn', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));

    const docsPath = path.join(OUTPUT_DIR, 'users', '05_document_management_aurora.png');
    await page.screenshot({ path: docsPath });
    fs.copyFileSync(docsPath, path.join(ARTIFACT_DIR, 'aurora_document_management.png'));
    console.log('   Captured Document Management Page.');

    // 6. Test Responsive Viewports
    console.log('6. Testing Responsive Viewports...');
    const viewports = [
      { name: 'laptop_1366x768', width: 1366, height: 768 },
      { name: 'tablet_768x1024', width: 768, height: 1024 },
      { name: 'mobile_390x844', width: 390, height: 844 },
      { name: 'mobile_375x812', width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 400));
      const vpPath = path.join(OUTPUT_DIR, 'responsive', `vp_${vp.name}.png`);
      await page.screenshot({ path: vpPath });
      if (vp.name === 'mobile_390x844') {
        fs.copyFileSync(vpPath, path.join(ARTIFACT_DIR, 'aurora_mobile_390x844.png'));
      }
      console.log(`   Captured responsive viewport: ${vp.name}`);
    }

    // 7. Test Dark Mode
    console.log('7. Testing Dark Mode...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await new Promise(r => setTimeout(r, 500));

    const darkPath = path.join(OUTPUT_DIR, 'dark-mode', '01_dark_mode_documents.png');
    await page.screenshot({ path: darkPath });
    fs.copyFileSync(darkPath, path.join(ARTIFACT_DIR, 'aurora_dark_mode_documents.png'));

    // Open notification panel in dark mode
    await page.click('#nav-notifications-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'dark-mode', '02_dark_mode_notifications.png') });
    await page.click('.btn-icon-close');
    console.log('   Captured Dark Mode states.');

    console.log('Console Errors caught:', consoleErrors);
    if (consoleErrors.length > 0) {
      console.error(`⚠️ Found ${consoleErrors.length} console errors during execution.`);
    }
    console.log('ALL VERIFICATION TESTS FINISHED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();

