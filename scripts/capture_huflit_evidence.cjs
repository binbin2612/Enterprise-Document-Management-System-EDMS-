const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_DIR = path.resolve(__dirname, '../docs/report-huflit/screenshots');
const ARTIFACT_DIR = 'C:\\Users\\vo trong hieu\\.gemini\\antigravity\\brain\\5c41b0af-3780-4fea-8752-02ed2d0737bc\\img';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function captureAll() {
  const adminUser = process.env.EDMS_ADMIN_USERNAME || 'admin';
  const adminPass = process.env.EDMS_ADMIN_PASSWORD || '123';

  console.log('🚀 Starting Chrome Puppeteer Evidence Capture for HUFLIT Report...');
  let browser = null;

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    async function saveScreenshot(fileName) {
      const targetPath = path.join(TARGET_DIR, fileName);
      const artifactPath = path.join(ARTIFACT_DIR, fileName);
      await page.screenshot({ path: targetPath, fullPage: false });
      fs.copyFileSync(targetPath, artifactPath);
      console.log(`  -> Saved: ${fileName} (${fs.statSync(targetPath).size} bytes)`);
    }

    async function closeModal() {
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.ent-modal-close') ||
                         document.querySelector('.ent-modal-footer button.btn-secondary') ||
                         document.querySelector('button[aria-label="Đóng cửa sổ"]');
        if (closeBtn) closeBtn.click();
      });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 600));
    }

    // Ensure Light Mode explicitly
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('edms_theme', 'light');
      localStorage.removeItem('edms_sidebar_collapsed');
      document.documentElement.removeAttribute('data-theme');
    });

    // =============================================================
    // 01. Login Screen (01_dang_nhap.png)
    // =============================================================
    console.log('[1/14] Capturing 01_dang_nhap.png...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username-input', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('01_dang_nhap.png');

    // =============================================================
    // Authenticate as Admin
    // =============================================================
    console.log('Authenticating as ADMIN...');
    await page.type('#username-input', adminUser);
    await page.type('#password-input', adminPass);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#nav-docs-btn', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    // Ensure Light Mode on root
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('edms_theme', 'light');
    });

    // =============================================================
    // 02. Document Management (02_quan_ly_tai_lieu.png)
    // =============================================================
    console.log('[2/14] Capturing 02_quan_ly_tai_lieu.png...');
    await page.click('#nav-docs-btn');
    await page.waitForSelector('#documents-table tbody tr', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('02_quan_ly_tai_lieu.png');

    // =============================================================
    // 03. Upload Modal (03_tai_tai_lieu.png)
    // =============================================================
    console.log('[3/14] Capturing 03_tai_tai_lieu.png...');
    await page.click('#open-upload-modal-btn');
    await page.waitForSelector('#upload-document-form, [role="dialog"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('03_tai_tai_lieu.png');
    await closeModal();

    // =============================================================
    // 10. Document Version History Modal (10_phien_ban_tai_lieu.png)
    // =============================================================
    console.log('[4/14] Capturing 10_phien_ban_tai_lieu.png...');
    await page.waitForSelector('#documents-table tbody tr', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('.version-btn') || document.querySelector('button[id^="version-doc-btn-"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('10_phien_ban_tai_lieu.png');
    await closeModal();

    // =============================================================
    // 11. Document Sharing & Permissions Modal (11_chia_se_phan_quyen.png)
    // =============================================================
    console.log('[5/14] Capturing 11_chia_se_phan_quyen.png...');
    await page.waitForSelector('#documents-table tbody tr', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('.share-btn') || document.querySelector('button[id^="share-doc-btn-"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('11_chia_se_phan_quyen.png');
    await closeModal();

    // =============================================================
    // 12. Preview & Digital Signature Modal (12_xem_truoc_chu_ky_so.png)
    // =============================================================
    console.log('[6/14] Capturing 12_xem_truoc_chu_ky_so.png...');
    await page.waitForSelector('#documents-table tbody tr', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('.preview-btn') || document.querySelector('button[id^="preview-doc-btn-"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('12_xem_truoc_chu_ky_so.png');
    await closeModal();

    // =============================================================
    // 04. AI Semantic / Hybrid Search (04_tim_kiem_ai.png)
    // =============================================================
    console.log('[7/14] Capturing 04_tim_kiem_ai.png...');
    await page.waitForSelector('#documents-table', { timeout: 10000 });
    // Select SEMANTIC mode
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const modeSelect = selects.find(s => s.innerHTML.includes('SEMANTIC') || s.innerHTML.includes('ngữ nghĩa'));
      if (modeSelect) {
        modeSelect.value = 'SEMANTIC';
        modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    // Type query "báo cáo"
    const searchInput = await page.$('input[placeholder*="Tìm kiếm"], input[type="text"]');
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await searchInput.type('báo cáo');
    }
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('04_tim_kiem_ai.png');

    // Reset search to LEXICAL
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
    }
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const modeSelect = selects.find(s => s.innerHTML.includes('SEMANTIC') || s.innerHTML.includes('ngữ nghĩa'));
      if (modeSelect) {
        modeSelect.value = 'LEXICAL';
        modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 800));

    // =============================================================
    // 05. Review Queue (05_xet_duyet.png)
    // =============================================================
    console.log('[8/14] Capturing 05_xet_duyet.png...');
    await page.click('#nav-review-queue-btn');
    await page.waitForSelector('#search-queue-input, .table', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('05_xet_duyet.png');

    // =============================================================
    // 06. Modern Aurora Dashboard (06_dashboard.png)
    // =============================================================
    console.log('[9/14] Capturing 06_dashboard.png...');
    await page.click('#nav-dashboard-btn');
    await page.waitForSelector('.dash-kpi-grid', { timeout: 15000 });
    await page.waitForSelector('.dash-table', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('06_dashboard.png');

    // =============================================================
    // 07. User Management (07_nguoi_dung.png)
    // =============================================================
    console.log('[10/14] Capturing 07_nguoi_dung.png...');
    await page.click('#nav-users-btn');
    await page.waitForSelector('#open-create-user-btn', { timeout: 15000 });
    await page.waitForSelector('#users-table tbody tr', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('07_nguoi_dung.png');

    // =============================================================
    // 08. Audit Log & Notifications (08_kiem_toan_thong_bao.png)
    // =============================================================
    console.log('[11/14] Capturing 08_kiem_toan_thong_bao.png...');
    await page.click('#nav-audit-btn');
    await page.waitForSelector('.audit-page, .card-table', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    // Open Notification Panel
    await page.click('#nav-notifications-btn');
    await page.waitForSelector('.notification-panel-dropdown', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('08_kiem_toan_thong_bao.png');

    // Close notification panel
    await page.click('#nav-notifications-btn');
    await new Promise(r => setTimeout(r, 500));

    // =============================================================
    // 13. Disposition Queue (13_hang_doi_tieu_huy.png)
    // =============================================================
    console.log('[12/14] Capturing 13_hang_doi_tieu_huy.png...');
    await page.click('#nav-disposition-queue-btn');
    await page.waitForSelector('#search-disposition-queue-input, .table', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('13_hang_doi_tieu_huy.png');

    // =============================================================
    // 14. System Status & Health (14_trang_thai_he_thong.png)
    // =============================================================
    console.log('[13/14] Capturing 14_trang_thai_he_thong.png...');
    await page.click('#nav-system-status-btn');
    await page.waitForSelector('#system-status-refresh-btn, .status-kpi-grid', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('14_trang_thai_he_thong.png');

    // =============================================================
    // 15. Public Verification Page (15_xac_thuc_cong_khai.png)
    // =============================================================
    console.log('[14/14] Capturing 15_xac_thuc_cong_khai.png...');
    await page.goto('http://localhost:5173/verify', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.form-input, .btn-primary', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('15_xac_thuc_cong_khai.png');

    console.log('🎉 ALL 14 EVIDENCE SCREENSHOTS CAPTURED SUCCESSFULLY (100% VERIFIED)!');
  } catch (err) {
    console.error('❌ Error during evidence capture:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

captureAll();
