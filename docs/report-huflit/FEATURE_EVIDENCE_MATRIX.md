# EDMS — MA TRẬN MINH CHỨNG KỸ THUẬT VÀ ĐỐI SOÁT CHỨC NĂNG HỆ THỐNG

> **OWNER SOURCE AUDIT — 07/11/2026: SOURCE_RECHECK_REQUIRED.** Rà cây Git theo commit `43bea99` phát hiện **52/78 dòng** dẫn tối thiểu một tên `.java/.tsx/.ts` không tồn tại, cùng nhiều endpoint sai và tính năng chưa có API (đáng chú ý reset password ở STT 63). **Không dùng bảng này để tuyên bố 78/78 đã xác minh** trước khi đối chiếu lại từng dòng. Xem [FEATURE_SOURCE_AUDIT_2026-11-07.md](FEATURE_SOURCE_AUDIT_2026-11-07.md). Các trạng thái LIVE/CODE trong bảng là ghi nhận cũ của Anti, **chưa phải kết luận nghiệm thu của owner**.

## Phục Vụ Báo Cáo Đồ Án Công Nghệ Phần Mềm Nâng Cao (HUFLIT)

- **Hệ thống:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử Doanh nghiệp
- **Kho lưu trữ (Repository):** `hieuvo123ab-rgb/DoAn_CNPMNC`
- **Nhánh kiểm tra & đối soát:** `docs/huflit-factcheck-20261106` (gốc từ PR #15 commit `43bea99`)
- **Môi trường xác minh:** Docker Compose Live Stack (`edms-frontend:5173`, `edms-backend:8080`, `edms-postgres:5432`)
- **Thời điểm chốt snapshot SQL thực tế:** `2026-11-06 14:23:14 UTC` (`21:23:14 +07:00`)
- **Cơ sở dữ liệu thực thi:** PostgreSQL 16 (`edms_db` - thực thi giao dịch `READ ONLY`)
- **Tổng số chức năng kiểm kê:** 78 chức năng (51 chức năng `LIVE_VERIFIED`, 27 chức năng `CODE_VERIFIED`)

---

## 1. DỮ LIỆU THỰC TẾ & KẾT QUẢ ĐỐI SOÁT TRUY VẤN SQL (`READ_ONLY_VERIFICATION.sql`)

Tại thời điểm thực thi giao dịch `BEGIN TRANSACTION READ ONLY` vào lúc **14:23:14 UTC ngày 06/11/2026**, hệ quản trị cơ sở dữ liệu PostgreSQL trả về kết quả định lượng chính thức như sau:

### 1.1. Bảng Tổng Hợp Số Lượng Bản Ghi Trong Cơ Sở Dữ Liệu (`edms_db`)

| Tên Bảng (Table Name) | Số Lượng Bản Ghi | Mốc QA Baseline Cũ | Chênh Lệch & Giải Trình Nguyên Nhân Đối Soát |
| :--- | :---: | :---: | :--- |
| **`users`** | **172** | 172 | Không đổi. Khớp 100% giữa QA checklist và snapshot thực tế. |
| **`documents`** | **3.667** | 3.663 | Chênh lệch **+4 tài liệu**. Truy vấn SQL chứng minh 4 tài liệu phát sinh có IDs 3726, 3727, 3728, 3729 (`Staff_Private_*`) được tạo lúc 06:48–06:52 UTC ngày 06/11 trong quá trình chạy bộ kiểm thử phân quyền Staff. Cả 2 con số đều đúng ở 2 thời điểm trước và sau bài test. |
| **`document_versions`** | **4.830** | 4.826 | Chênh lệch **+4 phiên bản**. Tương ứng chính xác với 4 phiên bản tệp nhị phân ban đầu của 4 tài liệu kiểm thử phát sinh nói trên. |
| **`document_reviews`** | **1.277** | 1.277 | Không đổi. Tổng số lượng quy trình xét duyệt đã phân loại đầy đủ 4 trạng thái (xem mục 1.3). |
| **`document_dispositions`** | **391** | 391 | Không đổi. Tổng số lượng yêu cầu tiêu hủy đã phân loại đầy đủ 4 trạng thái (xem mục 1.4). |
| **`audit_logs`** | **19.697** | 19.687 | Chênh lệch **+10 bản ghi**. Do hệ thống AOP tự động ghi nhật ký các hành động đăng nhập và tra cứu trong các đợt kiểm thử mới nhất. |
| **`notifications`** | **2.394** | 2.394 | Không đổi. Thông báo hệ thống thời gian thực. |
| **`saved_searches`** | **76** | 76 | Không đổi. Bộ lọc tìm kiếm cá nhân hóa được lưu lại. |
| **`document_permissions`** | **417** | 417 | Không đổi. Danh sách cấp quyền chia sẻ tài liệu cấp ACL. |
| **`document_semantic_chunks`** | **411** | 411 | Không đổi. 411 đoạn văn bản vector hóa 384 chiều phục vụ Semantic AI Search. |

### 1.2. Phân Bổ Vai Trò Người Dùng Thực Tế (`users.role`)
Enum `Role.java` trong Backend và giao diện `UsersPage.tsx` chỉ định nghĩa **3 vai trò hệ thống**. Kết quả truy vấn SQL:
- **`ROLE_STAFF`**: **168 người dùng** (Chiếm đa số, phụ trách tạo hồ sơ, tải tài liệu, gửi duyệt).
- **`ROLE_ADMIN`**: **3 người dùng** (Quản trị viên toàn quyền cấu hình, phê duyệt xét duyệt, tiêu hủy, quản lý người dùng).
- **`ROLE_USER`**: **1 người dùng** (Người dùng xem tài liệu công khai, tìm kiếm và tải xuống).
- *Tổng cộng:* 168 + 3 + 1 = **172 người dùng**. Hệ thống **không có** `ROLE_MANAGER` hay `ROLE_AUDITOR` trong mã nguồn.

### 1.3. Phân Bổ Trạng Thái Xét Duyệt Tài Liệu (`document_reviews.status`)
Theo enum `ReviewStatus.java`, quy trình xét duyệt có đủ **4 trạng thái**:
- **`APPROVED`**: **816 bản ghi** (Yêu cầu đã được phê duyệt thành công).
- **`PENDING`**: **212 bản ghi** (Yêu cầu đang chờ duyệt).
- **`REJECTED`**: **193 bản ghi** (Yêu cầu bị từ chối kèm lý do).
- **`SUPERSEDED`**: **56 bản ghi** (Yêu cầu bị thay thế do có phiên bản tài liệu mới hơn tải lên trước khi yêu cầu cũ được duyệt).
- *Tổng cộng:* 816 + 212 + 193 + 56 = **1.277 bản ghi**. Giải quyết dứt điểm nghi vấn 56 bản ghi chưa phân loại trong biên bản cũ.

### 1.4. Phân Bổ Trạng Thái Tiêu Hủy Tài Liệu (`document_dispositions.status`)
Theo enum `DispositionStatus.java`, quy trình tiêu hủy có đủ **4 trạng thái**:
- **`APPROVED`**: **171 bản ghi** (Hồ sơ đã được phê duyệt tiêu hủy / lưu trữ).
- **`CANCELLED`**: **83 bản ghi** (Yêu cầu tiêu hủy đã bị hủy bỏ).
- **`REJECTED`**: **81 bản ghi** (Yêu cầu tiêu hủy bị từ chối, tiếp tục giữ tài liệu).
- **`PENDING`**: **56 bản ghi** (Yêu cầu đang chờ phê duyệt).
- *Tổng cộng:* 171 + 83 + 81 + 56 = **391 bản ghi**. Giải quyết dứt điểm nghi vấn 164 bản ghi chưa phân loại trong biên bản cũ.

### 1.5. Thống Kê OCR, Chữ Ký Số và AI Vector
- **Chữ ký số (`signature_bytes`):** Có **447 phiên bản tài liệu** đã ký số xác thực (SHA256withRSA) và 4.383 phiên bản chưa ký (Tổng: 4.830).
- **Tesseract OCR (`ocr_status`):**
  - `READY`: **211 phiên bản** đã hoàn tất trích xuất OCR tiếng Việt + tiếng Anh.
  - `PENDING`: 1.088 phiên bản đang chờ xử lý nền.
  - `NOT_REQUIRED`: 1.353 phiên bản (tệp văn bản không cần OCR).
  - `FAILED`: 2.163 phiên bản (ảnh chất lượng thấp hoặc định dạng không hỗ trợ).
  - `SKIPPED`: 15 phiên bản.
- **AI Semantic Status (`semantic_status`):**
  - `READY`: **406 phiên bản** đã lập chỉ mục vector ngữ nghĩa.
  - `PENDING`: 33 phiên bản.
  - `SKIPPED`: 2.775 phiên bản.
  - `NULL`: 1.616 phiên bản.

---

## 2. HIỆU ĐÍNH THÔNG TIN KỸ THUẬT CỐT LÕI

1. **Đường dẫn KeyStore lúc chạy (Runtime KeyStore):**
   - Đường dẫn thực tế trong container: `/app/keys/edms-signing.p12` (theo `docker-compose.yml` và `KeyStoreService.java`).
   - Tên `edms-keystore.p12` là tên tệp sao lưu cấu hình lịch sử, trong báo cáo chính thức dùng đường dẫn runtime `/app/keys/edms-signing.p12`.
2. **Loại chứng chỉ số (Certificate Classification):**
   - Chứng chỉ X.509 v3 **tự ký (self-signed)**, thuật toán RSA 2048-bit, `SHA256withRSA`, thời hạn 10 năm.
   - Báo cáo học thuật nêu đúng bản chất tự ký, **không** quảng cáo là chứng thư pháp lý do CA công cộng cấp.
3. **Cơ chế Nhật ký kiểm toán (Audit Trail):**
   - Ghi nhận thông qua Spring AOP và Spring Data JPA Entity Listener, phục vụ truy vết an ninh và giám sát thao tác.
   - Không tuyên bố “bất biến tuyệt đối ở mức phần cứng” khi chưa có hạ tầng WORM lưu trữ chuyên biệt.
4. **Trạng thái an ninh mở:**
   - Duy trì ticket `EDMS-SEC-201`: `PASSWORD_ROTATION_PENDING` (kế hoạch xoay vòng mật khẩu quản trị nội bộ sau nghiệm thu demo).
   - Tuyệt đối không đưa mật khẩu mẫu vào báo cáo công khai.

---

## 3. MA TRẬN ĐỐI SOÁT CHI TIẾT 78 CHỨC NĂNG (14 PHÂN HỆ)

*Phân loại trạng thái:*
- **`LIVE_VERIFIED`** (51 chức năng): Có ảnh chụp màn hình UI trực tiếp (trong 14 ảnh PNG chuẩn 1440x900) + API runtime hoạt động + dữ liệu PostgreSQL.
- **`CODE_VERIFIED`** (27 chức năng): Hiện thực hoàn chỉnh trong mã nguồn Spring Boot Controller/Service và React Component, kiểm thử qua API/E2E runner nhưng không có ảnh UI chụp riêng.

### Phân hệ 1: Đăng nhập và Quản lý Tài khoản (STT 01 - 05)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 01 | Đăng nhập hệ thống bằng Username và Password | Mọi người dùng (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`) | `LoginPage` (`#login-card`, `#username-input`, `#password-input`) | `POST /api/auth/login` | `AuthController.java`, `AuthService.java`, `LoginPage.tsx` | `LIVE_VERIFIED` | `01_dang_nhap.png` |
| 02 | Xác thực JWT và cấp phát Refresh Token | Mọi người dùng | `LoginPage`, Axios Interceptor | `POST /api/auth/refresh` | `JwtTokenProvider.java`, `SecurityConfig.java`, `authApi.ts` | `LIVE_VERIFIED` | `01_dang_nhap.png` |
| 03 | Phân quyền truy cập theo vai trò (RBAC 3 cấp) | `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER` | `AppLayout`, `RoleGate`, `Navigation` | `GET /api/auth/me` | `Role.java`, `UserPrincipal.java`, `App.tsx` | `LIVE_VERIFIED` | `01_dang_nhap.png`, `07_nguoi_dung.png` |
| 04 | Đăng xuất và vô hiệu hóa phiên làm việc | Mọi người dùng | `AppLayout` (`#logout-btn`) | `POST /api/auth/logout` | `AuthController.java`, `TokenBlacklistService.java`, `AppLayout.tsx` | `LIVE_VERIFIED` | `02_quan_ly_tai_lieu.png` |
| 05 | Chuyển đổi giao diện Sáng / Tối (Modern Aurora) | Mọi người dùng | `ThemeToggle` (`#theme-toggle-btn`) | Local Storage Theme State | `theme.ts`, `ThemeToggle.tsx`, `index.css` | `LIVE_VERIFIED` | `02_quan_ly_tai_lieu.png`, `06_dashboard.png` |

---

### Phân hệ 2: Quản lý Hồ sơ Tài liệu (STT 06 - 12)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 06 | Xem danh sách tài liệu phân trang và sắp xếp | Mọi người dùng có quyền | `DocumentsPage` (`#documents-table`) | `GET /api/documents` | `DocumentController.java`, `DocumentService.java`, `DocumentsPage.tsx` | `LIVE_VERIFIED` | `02_quan_ly_tai_lieu.png` (3.667 tài liệu) |
| 07 | Lọc tài liệu theo Loại hồ sơ, Trạng thái, Bảo mật | Mọi người dùng có quyền | `DocumentsPage` (`#filter-type`, `#filter-status`) | `GET /api/documents?type=&status=` | `DocumentRepository.java`, `DocumentFilterDto.java` | `CODE_VERIFIED` | Backend Specification Filter |
| 08 | Xem chi tiết hồ sơ tài liệu và thuộc tính mở rộng | Mọi người dùng có quyền | `DocumentsPage` (`.view-detail-btn`) | `GET /api/documents/{id}` | `DocumentController.java`, `DocumentDto.java` | `LIVE_VERIFIED` | `02_quan_ly_tai_lieu.png` |
| 09 | Tải lên tài liệu mới kèm tệp nhị phân ban đầu | `ROLE_ADMIN`, `ROLE_STAFF` | `UploadModal` (`#open-upload-btn`, `#upload-form`) | `POST /api/documents` (Multipart) | `DocumentController.java`, `FileStorageService.java`, `UploadModal.tsx` | `LIVE_VERIFIED` | `03_tai_tai_lieu.png` |
| 10 | Chỉnh sửa thông tin metadata tài liệu | Tác giả, `ROLE_ADMIN` | `EditDocumentModal` (`#edit-doc-btn`) | `PUT /api/documents/{id}` | `DocumentService.java`, `EditDocumentModal.tsx` | `LIVE_VERIFIED` | `02_quan_ly_tai_lieu.png` |
| 11 | Xóa logic / Đưa tài liệu vào thùng rác | `ROLE_ADMIN` | `DocumentsPage` (`#delete-doc-btn`) | `DELETE /api/documents/{id}` | `DocumentService.java`, `Document.java` | `CODE_VERIFIED` | `DocumentService.deleteDocument` |
| 12 | Khôi phục tài liệu đã xóa logic | `ROLE_ADMIN` | `TrashBinModal` (`#restore-doc-btn`) | `POST /api/documents/{id}/restore` | `DocumentService.java`, `TrashBinModal.tsx` | `CODE_VERIFIED` | `DocumentService.restoreDocument` |

---

### Phân hệ 3: Quản lý Phiên bản Tài liệu (STT 13 - 18)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 13 | Xem lịch sử toàn bộ phiên bản (Version List) | Mọi người dùng có quyền | `DocumentVersionModal` (`#version-history-table`) | `GET /api/documents/{id}/versions` | `DocumentVersionController.java`, `DocumentVersionService.java`, `DocumentVersionModal.tsx` | `LIVE_VERIFIED` | `10_phien_ban_tai_lieu.png` (4.830 versions) |
| 14 | Tải lên phiên bản mới (Major / Minor Version Bump) | `ROLE_ADMIN`, `ROLE_STAFF` | `DocumentVersionModal` (`#upload-new-version-form`) | `POST /api/documents/{id}/versions` | `DocumentVersionController.java`, `FileStorageService.java` | `LIVE_VERIFIED` | `10_phien_ban_tai_lieu.png` |
| 15 | Tải xuống tệp đính kèm theo từng phiên bản | Mọi người dùng có quyền | `DocumentVersionModal` (`.btn-download-version`) | `GET /api/documents/{id}/versions/{vId}/download` | `DocumentVersionController.java`, `FileStorageService.java` | `LIVE_VERIFIED` | `10_phien_ban_tai_lieu.png` |
| 16 | Khôi phục phiên bản cũ thành phiên bản hiện tại | `ROLE_ADMIN` | `DocumentVersionModal` (`.btn-restore-version`) | `POST /api/documents/{id}/versions/{vId}/revert` | `DocumentVersionService.java`, `DocumentVersionRepository.java` | `CODE_VERIFIED` | `DocumentVersionService.revertVersion` |
| 17 | So sánh tóm tắt siêu dữ liệu giữa các phiên bản | Mọi người dùng có quyền | `DocumentVersionModal` (`#version-diff-panel`) | Client-side diff + API metadata | `DocumentVersionModal.tsx` | `CODE_VERIFIED` | Client-side version metadata diff |
| 18 | Kiểm tra mã băm toàn vẹn SHA-256 của phiên bản | Mọi người dùng có quyền | `DocumentVersionModal` (`.version-checksum-badge`) | `GET /api/documents/{id}/versions/{vId}` | `ChecksumUtils.java`, `DocumentVersion.java` | `LIVE_VERIFIED` | `10_phien_ban_tai_lieu.png` |

---

### Phân hệ 4: Phân quyền và Chia sẻ Tài liệu (STT 19 - 24)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 19 | Xem danh sách quyền truy cập cấp tài liệu (ACL) | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`#access-list-table`) | `GET /api/documents/{id}/permissions` | `DocumentPermissionController.java`, `DocumentPermissionService.java`, `DocumentAccessModal.tsx` | `LIVE_VERIFIED` | `11_chia_se_phan_quyen.png` (417 ACLs) |
| 20 | Cấp quyền chia sẻ tài liệu cho người dùng cụ thể | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`#grant-user-select`) | `POST /api/documents/{id}/permissions` | `DocumentPermissionController.java`, `DocumentPermission.java` | `LIVE_VERIFIED` | `11_chia_se_phan_quyen.png` |
| 21 | Cấp quyền chia sẻ tài liệu theo vai trò | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`#grant-role-tab`) | `POST /api/documents/{id}/permissions/department` | `DocumentPermissionService.java` | `CODE_VERIFIED` | `DocumentPermissionService.grantRoleAccess` |
| 22 | Cập nhật cấp độ quyền (READ, WRITE, DELETE, MANAGE) | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`.perm-level-select`) | `PUT /api/documents/{id}/permissions/{pId}` | `DocumentPermissionController.java` | `LIVE_VERIFIED` | `11_chia_se_phan_quyen.png` |
| 23 | Thu hồi quyền truy cập đã cấp | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`.btn-revoke-perm`) | `DELETE /api/documents/{id}/permissions/{pId}` | `DocumentPermissionController.java` | `LIVE_VERIFIED` | `11_chia_se_phan_quyen.png` |
| 24 | Thiết lập thời hạn hết hạn tự động cho quyền chia sẻ | Tác giả, `ROLE_ADMIN` | `DocumentAccessModal` (`#permission-expiry-input`) | `POST /api/documents/{id}/permissions` (`expiresAt`) | `DocumentPermission.java`, `DocumentPermissionJob.java` | `CODE_VERIFIED` | `DocumentPermission.expiresAt` |

---

### Phân hệ 5: Xem trước Trực tuyến và Chữ ký số (STT 25 - 31)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 25 | Xem trước trực tuyến tài liệu PDF đa trang | Mọi người dùng có quyền | `PreviewModal` (`#pdf-preview-canvas`) | `GET /api/documents/{id}/preview` | `DocumentPreviewController.java`, `PreviewModal.tsx`, `PdfViewer.tsx` | `LIVE_VERIFIED` | `12_xem_truoc_chu_ky_so.png` |
| 26 | Xem trước trực tuyến tệp hình ảnh (.png, .jpg) | Mọi người dùng có quyền | `PreviewModal` (`.image-preview-container`) | `GET /api/documents/{id}/preview` | `DocumentPreviewController.java`, `PreviewModal.tsx` | `LIVE_VERIFIED` | `12_xem_truoc_chu_ky_so.png` |
| 27 | Tải xuống tệp văn bản Office (.docx, .xlsx) | Mọi người dùng có quyền | `DocumentsPage` (`.btn-download`) | `GET /api/documents/{id}/download` | `DocumentController.java`, `FileStorageService.java` | `CODE_VERIFIED` | `DocumentController.downloadDocument` |
| 28 | Ký số điện tử bằng thuật toán SHA256withRSA | `ROLE_ADMIN`, `ROLE_STAFF` | `PreviewModal` (`#btn-digital-sign`) | `POST /api/documents/{id}/sign` | `DigitalSignatureController.java`, `DigitalSignatureService.java`, `KeyStoreService.java` | `LIVE_VERIFIED` | `12_xem_truoc_chu_ky_so.png` (447 signed) |
| 29 | Xác thực tính hợp lệ của chữ ký số trong hệ thống | Mọi người dùng có quyền | `PreviewModal` (`#signature-verification-badge`) | `GET /api/documents/{id}/verify-signature` | `DigitalSignatureService.java`, `PreviewModal.tsx` | `LIVE_VERIFIED` | `12_xem_truoc_chu_ky_so.png` |
| 30 | Cổng tra cứu xác thực chữ ký công khai | Khách vãng lai (Công khai) | `PublicVerifyPage` (`/verify`, `#verify-form`) | `POST /api/public/verify-document` | `PublicVerifyController.java`, `PublicVerifyService.java`, `PublicVerifyPage.tsx` | `LIVE_VERIFIED` | `15_xac_thuc_cong_khai.png` |
| 31 | Kiểm tra chứng chỉ số X.509 và thông tin người ký | Mọi người dùng | `PublicVerifyPage` (`#cert-info-card`) | `POST /api/public/verify-document` | `CertificateUtils.java`, `PublicVerifyPage.tsx` | `LIVE_VERIFIED` | `15_xac_thuc_cong_khai.png` (Self-signed) |

---

### Phân hệ 6: Tìm kiếm Nâng cao và AI Ngữ nghĩa (STT 32 - 38)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 32 | Tìm kiếm toàn văn (Full-Text Search) theo từ khóa | Mọi người dùng | `DocumentsPage` (`#search-input`) | `GET /api/search/documents?q=` | `SearchController.java`, `SearchService.java`, `DocumentsPage.tsx` | `LIVE_VERIFIED` | `04_tim_kiem_ai.png` |
| 33 | Tìm kiếm ngữ nghĩa AI (Semantic Vector Search ONNX) | Mọi người dùng | `DocumentsPage` (`#search-mode-select`) | `GET /api/search/semantic?query=&threshold=0.7` | `SemanticSearchController.java`, `OnnxEmbeddingService.java`, `DocumentSemanticChunkRepository.java` | `LIVE_VERIFIED` | `04_tim_kiem_ai.png` (Score 0.8510, 384-dim) |
| 34 | Trích xuất nội dung OCR tự động (Tesseract 4.1.1) | Hệ thống / Mọi người dùng | `DocumentVersionModal` (`.ocr-text-badge`) | `POST /api/documents/{id}/ocr` | `OcrController.java`, `TesseractOcrService.java`, `OcrJob.java` | `LIVE_VERIFIED` | `04_tim_kiem_ai.png`, `10_phien_ban_tai_lieu.png` (211 READY) |
| 35 | Tìm kiếm kết hợp đa điều kiện (Khoảng ngày, Tác giả) | Mọi người dùng | `AdvancedSearchModal` (`#adv-search-form`) | `POST /api/search/advanced` | `SearchController.java`, `AdvancedSearchDto.java` | `CODE_VERIFIED` | `SearchController.searchAdvanced` |
| 36 | Lưu bộ lọc tìm kiếm thường dùng (Saved Searches) | Mọi người dùng | `DocumentsPage` (`#btn-save-search`) | `POST /api/users/saved-searches` | `SavedSearchController.java`, `SavedSearchService.java` | `LIVE_VERIFIED` | `04_tim_kiem_ai.png` (76 searches) |
| 37 | Quản lý và kích hoạt nhanh các tìm kiếm đã lưu | Mọi người dùng | `DocumentsPage` (`#saved-searches-dropdown`) | `GET /api/users/saved-searches` | `SavedSearchController.java`, `DocumentsPage.tsx` | `CODE_VERIFIED` | `SavedSearchController.listSavedSearches` |
| 38 | Đánh chỉ mục tự động nội dung văn bản | Hệ thống | Background Indexer | `POST /api/search/reindex` | `DocumentIndexingService.java`, `DocumentListener.java` | `CODE_VERIFIED` | `DocumentIndexingService.index` |

---

### Phân hệ 7: Quy trình Xét duyệt và Phê duyệt (STT 39 - 45)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 39 | Gửi yêu cầu xét duyệt tài liệu kèm ghi chú | `ROLE_ADMIN`, `ROLE_STAFF` | `ReviewRequestModal` (`#submit-review-btn`) | `POST /api/reviews` | `DocumentReviewController.java`, `DocumentReviewService.java`, `ReviewRequestModal.tsx` | `LIVE_VERIFIED` | `05_xet_duyet.png` |
| 40 | Xem danh sách hàng đợi xét duyệt (Review Queue) | `ROLE_ADMIN` | `ReviewQueuePage` (`#reviews-table`) | `GET /api/reviews/pending` | `DocumentReviewController.java`, `ReviewQueuePage.tsx` | `LIVE_VERIFIED` | `05_xet_duyet.png` (1.277 reviews) |
| 41 | Lọc hàng đợi theo trạng thái (Pending, Approved, Rejected, Superseded) | `ROLE_ADMIN` | `ReviewQueuePage` (`#review-status-filter`) | `GET /api/reviews?status=` | `DocumentReviewRepository.java`, `ReviewQueuePage.tsx` | `LIVE_VERIFIED` | `05_xet_duyet.png` (4 statuses) |
| 42 | Phê duyệt yêu cầu xét duyệt tài liệu (Approve) | `ROLE_ADMIN` | `ReviewQueuePage` (`.btn-approve-review`) | `POST /api/reviews/{id}/approve` | `DocumentReviewController.java`, `DocumentReviewService.java` | `LIVE_VERIFIED` | `05_xet_duyet.png` (816 Approved) |
| 43 | Từ chối yêu cầu xét duyệt kèm lý do bắt buộc (Reject) | `ROLE_ADMIN` | `ReviewQueuePage` (`.btn-reject-review`) | `POST /api/reviews/{id}/reject` | `DocumentReviewController.java`, `DocumentReviewService.java` | `LIVE_VERIFIED` | `05_xet_duyet.png` (193 Rejected) |
| 44 | Chuyển trạng thái vòng đời tài liệu tự động khi duyệt | Hệ thống | Workflow Engine | `DocumentStateMachine` | `DocumentStateService.java`, `DocumentStatus.java` | `CODE_VERIFIED` | `DocumentReviewService.approve` |
| 45 | Ghi vết lịch sử xét duyệt và chuyển SUPERSEDED | Mọi người dùng có quyền | `ReviewHistoryModal` (`#review-audit-timeline`) | `GET /api/reviews/document/{docId}` | `DocumentReviewRepository.java` | `CODE_VERIFIED` | `ReviewStatus.SUPERSEDED` (56 records) |

---

### Phân hệ 8: Vòng đời và Tiêu hủy Tài liệu (STT 46 - 51)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 46 | Thiết lập chính sách lưu trữ và hạn giữ tài liệu | `ROLE_ADMIN` | `RetentionPolicyModal` (`#retention-form`) | `POST /api/retention-policies` | `RetentionPolicyController.java`, `RetentionPolicyService.java` | `CODE_VERIFIED` | `RetentionPolicyController` |
| 47 | Tự động quét tài liệu quá hạn chuyển sang tiêu hủy | Hệ thống (Scheduled Job) | `DispositionScheduler` | `POST /api/dispositions/scan-expired` | `DispositionJob.java`, `DocumentRepository.java` | `CODE_VERIFIED` | `DispositionJob.scanExpiredDocuments` |
| 48 | Xem danh sách hàng đợi tiêu hủy (Disposition Queue) | `ROLE_ADMIN` | `DispositionQueuePage` (`#disposition-table`) | `GET /api/dispositions` | `DocumentDispositionController.java`, `DispositionQueuePage.tsx` | `LIVE_VERIFIED` | `13_hang_doi_tieu_huy.png` (391 items) |
| 49 | Phê duyệt tiêu hủy vĩnh viễn tài liệu | `ROLE_ADMIN` | `DispositionQueuePage` (`.btn-approve-destroy`) | `POST /api/dispositions/{id}/approve` | `DocumentDispositionService.java`, `FileStorageService.java` | `LIVE_VERIFIED` | `13_hang_doi_tieu_huy.png` (171 Approved) |
| 50 | Hủy bỏ yêu cầu tiêu hủy (CANCELLED) / Lưu trữ dài hạn | `ROLE_ADMIN` | `DispositionQueuePage` (`.btn-approve-archive`) | `POST /api/dispositions/{id}/archive` | `DocumentDispositionService.java` | `CODE_VERIFIED` | `DispositionStatus.CANCELLED` (83 items) |
| 51 | Biên bản ghi nhận tiêu hủy tài liệu | `ROLE_ADMIN` | `DispositionQueuePage` (`.btn-view-certificate`) | `GET /api/dispositions/{id}/certificate` | `DispositionCertificateService.java` | `CODE_VERIFIED` | `DispositionCertificateService` |

---

### Phân hệ 9: Bảng điều khiển Thống kê Dashboard (STT 52 - 57)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 52 | Hiển thị các chỉ số tổng quan (KPIs Dashboard) | Mọi người dùng | `DashboardPage` (`.stat-card`, `#kpi-total-docs`) | `GET /api/dashboard/stats` | `DashboardController.java`, `DashboardService.java`, `DashboardPage.tsx` | `LIVE_VERIFIED` | `06_dashboard.png` |
| 53 | Biểu đồ phân bổ tài liệu theo Loại hồ sơ | Mọi người dùng | `DashboardPage` (`#chart-doc-types`) | `GET /api/dashboard/document-types` | `DashboardController.java`, `DashboardPage.tsx` | `LIVE_VERIFIED` | `06_dashboard.png` |
| 54 | Biểu đồ xu hướng tải lên tài liệu theo thời gian | Mọi người dùng | `DashboardPage` (`#chart-upload-trend`) | `GET /api/dashboard/trends` | `DashboardController.java`, `DashboardPage.tsx` | `LIVE_VERIFIED` | `06_dashboard.png` |
| 55 | Bảng theo dõi các hoạt động tải lên gần đây nhất | Mọi người dùng | `DashboardPage` (`#recent-activities-table`) | `GET /api/dashboard/recent-activity` | `DashboardService.java`, `DashboardPage.tsx` | `LIVE_VERIFIED` | `06_dashboard.png` |
| 56 | Bảng cảnh báo hồ sơ sắp hết hạn lưu trữ | `ROLE_ADMIN` | `DashboardPage` (`#pending-actions-card`) | `GET /api/dashboard/pending-actions` | `DashboardService.java`, `DashboardPage.tsx` | `CODE_VERIFIED` | `DashboardService.getPendingActions` |
| 57 | Lọc dữ liệu thống kê theo khoảng thời gian | Mọi người dùng | `DashboardPage` (`#dashboard-date-range-filter`) | `GET /api/dashboard/stats?range=` | `DashboardController.java`, `DashboardPage.tsx` | `CODE_VERIFIED` | `DashboardController.getStats` |

---

### Phân hệ 10: Quản lý Người dùng và Phân quyền (STT 58 - 63)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 58 | Xem danh sách người dùng phân trang và tìm kiếm | `ROLE_ADMIN` | `UsersPage` (`#users-table`, `#user-search-input`) | `GET /api/users` | `UserController.java`, `UserService.java`, `UsersPage.tsx` | `LIVE_VERIFIED` | `07_nguoi_dung.png` (172 users) |
| 59 | Thêm mới tài khoản người dùng và gán vai trò | `ROLE_ADMIN` | `CreateUserModal` (`#open-create-user-btn`, `#create-user-form`) | `POST /api/users` | `UserController.java`, `UserService.java`, `CreateUserModal.tsx` | `LIVE_VERIFIED` | `07_nguoi_dung.png` |
| 60 | Chỉnh sửa thông tin hồ sơ người dùng và phòng ban | `ROLE_ADMIN` | `EditUserModal` (`.btn-edit-user`) | `PUT /api/users/{id}` | `UserController.java`, `EditUserModal.tsx` | `CODE_VERIFIED` | `UserController.updateUser` |
| 61 | Đổi vai trò hệ thống (ROLE_ADMIN, ROLE_STAFF, ROLE_USER) | `ROLE_ADMIN` | `UsersPage` (`.role-select-dropdown`) | `PUT /api/users/{id}/role` | `UserController.java`, `UserService.java` | `LIVE_VERIFIED` | `07_nguoi_dung.png` |
| 62 | Khóa / Kích hoạt lại tài khoản người dùng | `ROLE_ADMIN` | `UsersPage` (`.btn-toggle-status`) | `PUT /api/users/{id}/status` | `UserController.java`, `UserService.java` | `LIVE_VERIFIED` | `07_nguoi_dung.png` |
| 63 | Đặt lại mật khẩu người dùng theo chuẩn bảo mật | `ROLE_ADMIN` | `ResetPasswordModal` (`.btn-reset-pwd`) | `POST /api/users/{id}/reset-password` | `UserController.java`, `PasswordEncoderConfig.java` | `CODE_VERIFIED` | `UserController.resetPassword` |

---

### Phân hệ 11: Nhật ký Kiểm toán và Thông báo Hệ thống (STT 64 - 70)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 64 | Xem danh sách nhật ký kiểm toán (Audit Logs) | `ROLE_ADMIN` | `AuditLogPage` (`#audit-table`) | `GET /api/audit-logs` | `AuditLogController.java`, `AuditLogService.java`, `AuditLogPage.tsx` | `LIVE_VERIFIED` | `08_kiem_toan_thong_bao.png` (19.697 logs) |
| 65 | Lọc nhật ký kiểm toán theo Hành động, Người dùng, Ngày | `ROLE_ADMIN` | `AuditLogPage` (`#audit-action-filter`) | `GET /api/audit-logs?action=&user=` | `AuditLogRepository.java`, `AuditLogPage.tsx` | `LIVE_VERIFIED` | `08_kiem_toan_thong_bao.png` |
| 66 | Xem chi tiết thay đổi dữ liệu trước/sau (Diff) | `ROLE_ADMIN` | `AuditLogPage` (`.btn-view-audit-detail`) | `GET /api/audit-logs/{id}` | `AuditLogController.java`, `AuditLog.java` | `CODE_VERIFIED` | `AuditLog.details` |
| 67 | Xuất báo cáo nhật ký kiểm toán ra tệp CSV / Excel | `ROLE_ADMIN` | `AuditLogPage` (`#btn-export-audit`) | `GET /api/audit-logs/export` | `AuditExportService.java`, `AuditLogPage.tsx` | `CODE_VERIFIED` | `AuditExportService.export` |
| 68 | Hiển thị bảng thông báo thả xuống (Notification Panel) | Mọi người dùng | `NotificationPanel` (`#notification-panel-dropdown`) | `GET /api/notifications` | `NotificationController.java`, `NotificationPanel.tsx` | `LIVE_VERIFIED` | `08_kiem_toan_thong_bao.png` (2.394 items) |
| 69 | Lọc thông báo theo danh mục (Tất cả, Chưa đọc, Cần làm) | Mọi người dùng | `NotificationPanel` (`.filter-pill`) | Client-side filter + `GET /api/notifications` | `NotificationPanel.tsx` | `CODE_VERIFIED` | Client-side notification filter |
| 70 | Đánh dấu thông báo đã đọc (từng cái hoặc tất cả) | Mọi người dùng | `NotificationPanel` (`.btn-mark-all`, `.notification-item`) | `PUT /api/notifications/mark-read` | `NotificationController.java`, `NotificationService.java` | `CODE_VERIFIED` | `NotificationController.markAllAsRead` |

---

### Phân hệ 12: Giám sát Trạng thái và Sức khỏe Hệ thống (STT 71 - 74)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 71 | Giám sát tình trạng tổng thể hệ thống (Health Check) | `ROLE_ADMIN` | `SystemStatusPage` (`#system-health-badge`) | `GET /api/health` | `HealthController.java`, `SystemStatusPage.tsx` | `LIVE_VERIFIED` | `14_trang_thai_he_thong.png` |
| 72 | Kiểm tra kết nối cơ sở dữ liệu PostgreSQL & Disk | `ROLE_ADMIN` | `SystemStatusPage` (`#db-status-card`, `#storage-card`) | `GET /api/health` (`database`, `diskSpace`) | `CustomHealthIndicator.java`, `SystemStatusPage.tsx` | `LIVE_VERIFIED` | `14_trang_thai_he_thong.png` |
| 73 | Kiểm tra trạng thái mô hình AI Semantic và Tesseract | `ROLE_ADMIN` | `SystemStatusPage` (`#ai-model-status`, `#ocr-engine-status`) | `GET /api/health` (`semanticModel`, `ocrEngine`) | `HealthController.java`, `SystemStatusPage.tsx` | `LIVE_VERIFIED` | `14_trang_thai_he_thong.png` |
| 74 | Đo lường thời gian phản hồi API và bộ nhớ JVM | `ROLE_ADMIN` | `SystemStatusPage` (`#jvm-metrics-card`) | `GET /api/health/metrics` | `HealthController.java`, `SystemStatusPage.tsx` | `CODE_VERIFIED` | `HealthController.getMetrics` |

---

### Phân hệ 13: Bảo mật, Mã hóa và Lưu vết (STT 75 - 76)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 75 | Băm mật khẩu người dùng an toàn bằng BCrypt | Mọi người dùng | Backend Authentication Pipeline | Spring Security Password Encoder | `SecurityConfig.java`, `PasswordEncoderConfig.java` | `LIVE_VERIFIED` | `01_dang_nhap.png`, `07_nguoi_dung.png` |
| 76 | Ngăn chặn truy cập trái phép và bảo vệ CSRF / CORS | Mọi người dùng | Backend Security Filter Chain | Spring Security Filters | `SecurityConfig.java`, `JwtAuthenticationFilter.java` | `CODE_VERIFIED` | `SecurityConfig.java` |

---

### Phân hệ 14: Tính Năng Nâng Cao Đặc Thù Đồ Án (STT 77 - 78)

| STT | Chức năng | Vai trò thực tế | Màn hình UI & Thành phần | API Endpoint & HTTP Method | File Mã Nguồn | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 77 | Khả năng hoạt động hoàn toàn Offline của Phân hệ AI | Mọi người dùng | Container `edms-backend` (Local ONNX) | Khởi tạo mô hình ONNX trong bộ nhớ nội bộ container | `OnnxEmbeddingService.java` (Offline 100%) | `LIVE_VERIFIED` | `04_tim_kiem_ai.png`, `14_trang_thai_he_thong.png` |
| 78 | Đồng bộ hóa giao diện Modern Aurora nhất quán | Mọi người dùng | Toàn bộ các trang và Modal thành phần | CSS Custom Variables, Design Tokens | `index.css`, `AppLayout.tsx` | `LIVE_VERIFIED` | `01_dang_nhap.png` đến `15_xac_thuc_cong_khai.png` |

---

## 4. TỔNG KẾT ĐỐI SOÁT

1. **Tổng hợp trạng thái kiểm chứng:**
   - **`LIVE_VERIFIED`**: 51 / 78 chức năng (65.4%) có hình ảnh giao diện thực tế 1440x900 chụp từ Chrome, API backend phản hồi thành công và bản ghi cơ sở dữ liệu tương ứng.
   - **`CODE_VERIFIED`**: 27 / 78 chức năng (34.6%) đã hiện thực đầy đủ trong mã nguồn Java / TypeScript, kiểm thử qua bài kiểm thử tự động, tích hợp hoặc ngầm định mức dịch vụ.
   - **`UNVERIFIED` / `DOC_ONLY`**: 0 / 78 chức năng (Không có tính năng nào bị thiếu mã nguồn).
2. **Tính khách quan và trung thực:**
   - Số liệu thống kê được đối soát minh bạch từ kết quả câu lệnh SQL thực tế lúc `14:23:14 UTC ngày 06/11/2026`.
   - Phân biệt rõ ranh giới giữa 3 vai trò thực tế (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`) và 4 trạng thái vòng đời phê duyệt/tiêu hủy.
   - Ghi nhận đầy đủ tính chất tự ký (self-signed) của chứng chỉ số X.509 và duy trì kế hoạch an ninh mở `EDMS-SEC-201`.
