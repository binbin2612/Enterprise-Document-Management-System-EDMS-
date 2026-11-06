# BÁO CÁO ĐỐI SOÁT PRODUCT BACKLOG, SPRINT & KẾ HOẠCH DỰ ÁN (HUFLIT REPORT)

**Học phần:** Công nghệ Phần mềm Nâng cao (CNPMNC) — Đồ án Chuyên ngành  
**Trường Đại học:** HUFLIT (Đại học Ngoại ngữ – Tin học TP.HCM)  
**Hệ thống:** EDMS — Hệ thống Quản trị & Lưu trữ Tài liệu Điện tử Doanh nghiệp  
**Mã nguồn Pull Request:** PR #15 (`feat/edms-modern-aurora-ui`) & PR #14 (`feat/edms-ui-consistency-final`)  
**Commit xác minh:** `43bea99`  
**Ngày lập báo cáo:** 06/11/2026  

---

## 1. Phân định Rõ ràng Hai Hồ sơ Nhân sự và Phạm vi Nghiệm thu

Theo đúng dữ liệu lịch sử và hồ sơ gốc của dự án, hệ thống có sự phân tách rạch ròi giữa hai góc nhìn: **Hồ sơ Học thuật Lab 1** (phân bổ cuốn chiếu cho 2 sinh viên làm bài tập lớn) và **Hồ sơ Tiến độ Dự án Thực tế** (nhóm 5 thành viên chuyên môn hóa qua 4 đợt triển khai).

> [!IMPORTANT]
> **Tuyệt đối không tự ý gộp hai danh sách nhân sự hoặc phân chia lại Story Points.** Mỗi hồ sơ phản ánh một góc nhìn quản lý quy trình phần mềm độc lập và nhất quán trong dự án.

### 1.1. Hồ sơ Product Backlog Lab 1 (Workbook `Lab1_EDMS_2SV_CuonChieu_60-40.xlsx`)
- **Mô hình triển khai:** Code cuốn chiếu (Incremental Vertical Slices) theo tỷ lệ phân công 60% – 40%.
- **Tổng phạm vi kế hoạch:** **26 User Stories** (US-01 đến US-26) | **79 Story Points (SP)** | **4 Sprints**.
- **Thành viên & Phân bổ điểm chính thức:**
  1. **Võ Trọng Hiếu** (Team Lead / Software Architect / Lead Dev) — **47 SP** (59.5% ~ 60%)
  2. **Tạ Gia Tín** (Fullstack Developer / QA & Test Specialist) — **32 SP** (40.5% ~ 40%)
  - *Tổng cộng:* $47 + 32 = \mathbf{79\text{ SP}}$ (Khớp chính xác 100% với workbook gốc).

### 1.2. Hồ sơ Tiến độ Triển khai Dự án Chuyên ngành (Nhóm 5 Thành viên Kỹ thuật)
- **Tài liệu nguồn:** Hồ sơ tiến độ lưu trữ tại thư mục `phân công và báo cáo/báo cáo/Dot_1` đến `Dot_4`.
- **Đội ngũ 5 thành viên theo chuyên môn hóa:**
  1. **Võ Trọng Hiếu** — Business Analyst / Project Lead / Requirements Owner
  2. **Trần Quyền Minh** — Backend Developer / Technical Lead
  3. **Nguyễn Quốc Huy** — Frontend Developer
  4. **Viên Bảo Đức** — System Analyst / UML & Software Modeling
  5. **Đinh Thanh Tùng** — Database Administrator / DevOps & System Integration

---

## 2. Bảng Đối chiếu 4 Sprint và Thời gian Thực tế

Toàn bộ thời gian bắt đầu và kết thúc của từng giai đoạn được trích xuất nguyên bản từ tài liệu kế hoạch và báo cáo tiến độ gốc (`BC1_00` đến `BC4_00`), không tự ý suy đoán hoặc thay đổi ngày tháng:

| Sprint / Đợt | Trọng tâm Nghiệp vụ & Kỹ thuật | Phạm vi User Stories | Tổng Story Points | Thời gian Thực hiện Gốc (Start – End) | Phân bổ Thành viên Lab 1 (Workbook) | Trạng thái Đạt |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **Sprint 1** | **Authentication, Ingestion & Document Repository**<br>Xác thực JWT, nạp tài liệu, tạo bản ghi, nhập metadata, xem danh mục của tôi | US-01, US-02, US-03, US-10, US-11, US-12, US-15 | **19 SP** | **27/09/2026 – 03/10/2026**<br>*(Đợt 1 hoàn thành sớm 02/10/2026)* | Võ Trọng Hiếu: 11 SP<br>Tạ Gia Tín: 8 SP | **100% PASS** |
| **Sprint 2** | **Discovery, Retrieval & Classification**<br>Tìm kiếm, bộ lọc, xem trước trực tiếp, tải xuống, sửa thông tin, phân loại tài liệu<br>*(Mở rộng: Print Metadata Sheet — 0 SP)* | US-04, US-05, US-06, US-08, US-09, US-13, US-14 | **22 SP** | **04/10/2026 – 10/10/2026**<br>*(Đợt 2 hoàn thành chuẩn hạn 10/10/2026)* | Võ Trọng Hiếu: 13 SP<br>Tạ Gia Tín: 9 SP | **100% PASS** |
| **Sprint 3** | **Saved Search & Access Administration**<br>Lưu bộ lọc tìm kiếm, quản lý người dùng, tạo/sửa tài khoản, kích hoạt/khóa, phân quyền vai trò<br>*(Mở rộng: Delete Saved Search — 0 SP)* | US-07, US-21, US-22, US-23, US-24, US-25, US-26 | **21 SP** | **11/10/2026 – 17/10/2026**<br>*(Đợt 3 hoàn thành chuẩn hạn 17/10/2026)* | Võ Trọng Hiếu: 12 SP<br>Tạ Gia Tín: 9 SP | **100% PASS** |
| **Sprint 4** | **Monitoring, Statistics & Audit**<br>Dashboard Modern Aurora, thống kê tài liệu, thống kê sử dụng, lịch sử hoạt động, nhật ký kiểm toán | US-16, US-17, US-18, US-19, US-20 | **17 SP** | **18/10/2026 – 24/10/2026**<br>*(Đợt 4 hoàn tất nghiệm thu tổng thể)* | Võ Trọng Hiếu: 11 SP<br>Tạ Gia Tín: 6 SP | **100% PASS** |
| **TỔNG CỘNG** | **Toàn bộ Product Backlog Hệ thống EDMS** | **26 User Stories** | **79 SP** | **27/09/2026 – 24/10/2026** | **Hiếu: 47 SP \| Tín: 32 SP** | **100% HOÀN THÀNH** |

---

## 3. Ma trận Truy vết Chi tiết 26 User Stories (US-01 → US-26)

| Story ID | Tên User Story (Workbook Gốc) | Điểm SP | Sprint | Thành viên Phụ trách | Tệp Mã nguồn Chính | REST API / Giao diện Tương ứng | Minh chứng Kiểm thử | Trạng thái |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **US-01** | Login | 2 SP | Sprint 1 | Tạ Gia Tín | `AuthService.java`<br>`LoginPage.tsx` | `POST /api/auth/login`<br>Giao diện Đăng nhập | TEST 1, TEST 2, TEST 31 | **DONE** |
| **US-02** | Logout | 1 SP | Sprint 1 | Tạ Gia Tín | `AuthController.java`<br>`Navbar.tsx` | `POST /api/auth/logout`<br>Nút Đăng xuất | TEST 8, TEST 9 | **DONE** |
| **US-03** | View Document List | 3 SP | Sprint 1 | Võ Trọng Hiếu | `DocumentService.java`<br>`DocumentsPage.tsx` | `GET /api/documents`<br>Bảng danh sách tài liệu | TEST 5, TEST 6 | **DONE** |
| **US-04** | Search Documents | 5 SP | Sprint 2 | Võ Trọng Hiếu | `DocumentService.java`<br>`buildSearchSpec()` | `GET /api/documents?q=...`<br>Ô tìm kiếm tài liệu | TEST 15, TEST 16 | **DONE** |
| **US-05** | Filter Search Results | 3 SP | Sprint 2 | Võ Trọng Hiếu | `DocumentService.java`<br>`documentType filter` | `GET /api/documents?documentType=...`<br>Dropdown loại tài liệu | TEST 17, TEST 18 | **DONE** |
| **US-06** | Select Result Display Fields | 3 SP | Sprint 2 | Tạ Gia Tín | `DocumentsPage.tsx`<br>`visibleColumns state` | Menu ẩn/hiện cột hiển thị trên bảng | Manual UI Inspection | **DONE** |
| **US-07** | Save and Reuse Search Conditions | 3 SP | Sprint 3 | Võ Trọng Hiếu | `SavedSearchService.java`<br>`SaveSearchModal.tsx` | `POST/GET /api/saved-searches`<br>Modal lưu bộ lọc | TEST 23, TEST 24, TEST 25 | **DONE** |
| **US-08** | View Document Details / Preview | 3 SP | Sprint 2 | Tạ Gia Tín | `DocumentController.java`<br>`PreviewModal.tsx` | `GET /api/documents/{id}/preview`<br>Modal xem trước nhúng | TEST 12, TEST 44 | **DONE** |
| **US-09** | Download Document | 2 SP | Sprint 2 | Võ Trọng Hiếu | `DocumentController.java`<br>`FileStorageService.java` | `GET /api/documents/{id}/download`<br>Nút tải tệp đính kèm | TEST 11, TEST 45 | **DONE** |
| **US-10** | Upload Document | 5 SP | Sprint 1 | Võ Trọng Hiếu | `DocumentController.java`<br>`UploadModal.tsx` | `POST /api/documents`<br>Modal tải tệp kéo thả 20MB | TEST 4, TEST 43 | **DONE** |
| **US-11** | Create Document Record | 3 SP | Sprint 1 | Tạ Gia Tín | `DocumentService.java`<br>`Document.java` | Lưu bản ghi bảng `documents` PostgreSQL | TEST 4, TEST 7 | **DONE** |
| **US-12** | Enter / Update Document Metadata | 3 SP | Sprint 1 | Võ Trọng Hiếu | `DocumentMetadataRequest.java`<br>`UploadModal.tsx` | Nhập tiêu đề, mô tả, quyền truy cập | TEST 4, TEST 13 | **DONE** |
| **US-13** | Update Document Information | 3 SP | Sprint 2 | Võ Trọng Hiếu | `DocumentService.java`<br>`EditModal.tsx` | `PUT /api/documents/{id}`<br>Modal sửa tài liệu | TEST 19, TEST 20, TEST 21 | **DONE** |
| **US-14** | Classify Document | 3 SP | Sprint 2 | Tạ Gia Tín | `DocumentService.java`<br>`EditModal.tsx` | `PUT /api/documents/{id}` (`documentType`) | TEST 22 | **DONE** |
| **US-15** | View Managed Documents | 2 SP | Sprint 1 | Tạ Gia Tín | `DocumentService.java`<br>`DocumentsPage.tsx` | `GET /api/documents/mine`<br>Tab "Tài liệu của tôi" | TEST 10 | **DONE** |
| **US-16** | View Dashboard | 5 SP | Sprint 4 | Võ Trọng Hiếu | `StatisticsService.java`<br>`DashboardPage.tsx` | `GET /api/admin/dashboard`<br>Dashboard Modern Aurora | TEST 41, TEST 42, TEST 55 | **DONE** |
| **US-17** | View Document Statistics | 3 SP | Sprint 4 | Tạ Gia Tín | `StatisticsService.java`<br>`DashboardPage.tsx` | Biểu đồ phân loại tài liệu (45% cột trái) | TEST 52, TEST 53 | **DONE** |
| **US-18** | View Usage Statistics | 3 SP | Sprint 4 | Võ Trọng Hiếu | `StatisticsService.java`<br>`DashboardPage.tsx` | Thống kê tần suất sử dụng (55% cột phải) | TEST 54 | **DONE** |
| **US-19** | View Activity History | 3 SP | Sprint 4 | Tạ Gia Tín | `AuditService.java`<br>`DashboardPage.tsx` | Bảng nhật ký hoạt động gần đây (Hàng 3) | TEST 49 | **DONE** |
| **US-20** | View Audit Log | 3 SP | Sprint 4 | Võ Trọng Hiếu | `AuditService.java`<br>`AuditLogPage.tsx` | `GET /api/admin/audit-logs`<br>Trang nhật ký kiểm toán | TEST 50, TEST 51, TEST 56 | **DONE** |
| **US-21** | View User List | 2 SP | Sprint 3 | Võ Trọng Hiếu | `AdminUserService.java`<br>`UsersPage.tsx` | `GET /api/admin/users`<br>Bảng quản lý tài khoản | TEST 27, TEST 28 | **DONE** |
| **US-22** | Create User | 3 SP | Sprint 3 | Tạ Gia Tín | `AdminUserService.java`<br>`CreateUserModal.tsx` | `POST /api/admin/users`<br>Modal thêm tài khoản | TEST 29, TEST 30, TEST 31 | **DONE** |
| **US-23** | Update User | 3 SP | Sprint 3 | Tạ Gia Tín | `AdminUserService.java`<br>`EditUserModal.tsx` | `PUT /api/admin/users/{id}`<br>Modal sửa người dùng | TEST 32 | **DONE** |
| **US-24** | Enable / Disable User | 2 SP | Sprint 3 | Võ Trọng Hiếu | `AdminUserService.java`<br>`UsersPage.tsx` | `PATCH /api/admin/users/{id}/status`<br>Công tắc kích hoạt | TEST 33, TEST 34, TEST 35 | **DONE** |
| **US-25** | Assign Role to User | 3 SP | Sprint 3 | Tạ Gia Tín | `AdminUserService.java`<br>`EditUserModal.tsx` | Phân vai trò `ROLE_USER`/`STAFF`/`ADMIN` | TEST 32, TEST 36, TEST 37 | **DONE** |
| **US-26** | Manage Roles and Permissions | 5 SP | Sprint 3 | Võ Trọng Hiếu | `AdminUserController.java`<br>`UsersPage.tsx` | `GET /api/admin/roles/permissions`<br>Tab Ma trận phân quyền | TEST 38, TEST 57 | **DONE** |

---

## 4. Xác minh Tình trạng Biểu đồ Gantt (MS Project)

- **Quy trình kiểm tra:** Đã tiến hành rà soát tự động và thủ công trên toàn bộ kho mã nguồn và tài liệu lưu trữ:
  - Tìm kiếm tệp tin định dạng Microsoft Project: `*.mpp`, `*.mpt`, `*.mpd`.
  - Tìm kiếm tệp ảnh biểu đồ Gantt xuất bản từ MS Project: `*gantt*.png`, `*gantt*.jpg`.
- **Kết quả đối soát thực tế:** **CHƯA TÌM THẤY BẰNG CHỨNG TỆP MS PROJECT GỐC TRONG KHO DỮ LIỆU HIỆN TẠI.**
- **Nguyên tắc an toàn:** Tuyệt đối không tự ý dùng công cụ AI để vẽ giả lập biểu đồ Gantt hay tạo tệp ảnh `09_ke_hoach_gantt.png` không có căn cứ. Thông tin tiến độ được bảo toàn tính trung thực 100% dựa trên bảng mốc thời gian 4 Đợt đã đối chiếu tại Mục 2.

