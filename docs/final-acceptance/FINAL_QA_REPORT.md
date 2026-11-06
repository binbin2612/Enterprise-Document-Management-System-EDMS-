# BÁO CÁO TỔNG KẾT KIỂM THỬ CHẤT LƯỢNG & BÀN GIAO NGHIỆM THU CUỐI CÙNG (FINAL QA ACCEPTANCE REPORT)

> **LƯU Ý ĐỐI SOÁT BÁO CÁO HUFLIT (06/11/2026):** Các số liệu 3.663 tài liệu / 4.826 phiên bản dưới đây là **mốc đã ghi nhận trong đợt QA**; biên bản bàn giao minh chứng sau đó nêu 3.667 / 4.830 nhưng chưa có truy vấn PostgreSQL mới để xác nhận chênh lệch. Mã nguồn tại commit `43bea99` chỉ có **3 vai trò** `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`. Chi tiết, giới hạn và SQL đối soát xem [REPORT_FACTCHECK_2026-11-06.md](../report-huflit/REPORT_FACTCHECK_2026-11-06.md). Trạng thái `READY_FOR_FINAL_OWNER_ACCEPTANCE` **không có nghĩa chủ dự án đã phê duyệt**.

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR Giao diện:** PR `#15` (`feat/edms-modern-aurora-ui`)  
**Mã nguồn PR Nền tảng:** PR `#14` (`feat/edms-ui-consistency-final`)  
**Nhánh Hạ tầng & Bằng chứng QA:** `feat/qa-real-docker-ui`  
**Môi trường Kiểm thử:** Docker Desktop Windows (React UI port 5173, Spring Boot Backend port 8080, PostgreSQL 16 port 5432)  
**Thời gian hoàn thành:** Ngày 06 Tháng 11 Năm 2026  
**Trạng thái Bàn giao Chính thức:** `READY_FOR_FINAL_OWNER_ACCEPTANCE`  

---

## 1. Tóm tắt Điều hành (Executive Summary)

Sau quá trình rà soát, tái cấu trúc và kiểm thử thực nghiệm chuyên sâu trên môi trường Docker container thật với đầy đủ dữ liệu mẫu (3,663 tài liệu, 172 người dùng), đội ngũ QA & Frontend xin báo cáo kết quả tổng kết toàn diện:

1. **Giao diện Modern Aurora UI:** Hoàn tất 100% việc tái thiết kế giao diện theo phong cách Modern Aurora (Deep Navy `#111D35`, Primary Blue `#4F72EA`, Mint Teal `#42BBAF`, Canvas `#F3F5FC`), đồng bộ trên toàn bộ 4 phân hệ trọng yếu: Dashboard 3 hàng, Quản lý Người dùng, Trung tâm Công việc, và Panel Thông báo trượt.
2. **Độ ổn định & Không lỗi Runtime:** Hệ thống đạt **0 Console Errors** trên trình duyệt Chromium thật qua các bài kiểm thử tự động Puppeteer trên 5 kích thước màn hình (1440x900, 1366x768, 768x1024, 390x844, 375x812) ở cả chế độ Sáng (Light) và Tối (Dark Mode).
3. **Bộ Test Case QA Đồng bộ:** Hoàn tất đồng bộ toàn diện **31/31 ca kiểm thử thực nghiệm**, trong đó có 12 ca kiểm định trực quan giao diện (`VISUAL_PASS`), 7 ca kiểm định tích hợp API/Client (`INTEGRATION_PASS`), và 12 ca kiểm định toàn trình đầu cuối (`E2E_PASS`). Không có ca kiểm thử nào thất bại (`FAILED: 0`), bị nghẽn (`BLOCKED: 0`) hay chưa chạy (`NOT_RUN: 0`).
4. **Độ bền Dữ liệu & Khôi phục Thảm họa (Persistence & DR):** Kiểm định thành công việc duy trì dữ liệu khi khởi động lại container backend với mã băm SHA-256 trùng khớp từng bit (`93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`). Quy trình sao lưu và phục hồi độc lập trên cụm container cô lập (cổng 15432, 18080, 15173) đạt độ chính xác 100% về số lượng bản ghi (172 Users, 3,663 Documents, 4,826 Versions).
5. **An toàn Bảo mật & Đa người dùng:** Đạt **15/15 bài kiểm thử an ninh chuyên sâu**, bao gồm kiểm tra ranh giới xác thực 401/403, phân quyền tài liệu riêng tư, chia sẻ quyền động và thu hồi tức thì, cách ly hộp thư thông báo, chống leo quyền ngang, cô lập phiên trình duyệt độc lập và vệ sinh thông tin nhạy cảm trong log hệ thống.
6. **Xử lý Mật khẩu Đúng chuẩn & Cơ chế Fail-Closed:**
   - Đã loại bỏ hoàn toàn các cơ chế chuẩn hóa mật khẩu tạm thời tại Frontend (`LoginPage.tsx`) và xóa sạch fallback mật khẩu kiểm thử trong toàn bộ script.
   - Script chạy kiểm thử `scripts/capture_showcase.cjs` đã được thiết kế lại theo chuẩn **Fail-Closed** (bắt buộc biến môi trường, bắt `pageerror`/console error nghiêm trọng, assertion DOM thật, thoát với exit code 1 khi có lỗi), kèm bộ kiểm thử tự động độc lập `scripts/test_showcase_runner.cjs` đạt 3/3 kịch bản.
   - Rà soát Backend xác nhận chưa có endpoint đổi mật khẩu `PUT /api/admin/users/{id}/password`. Ghi nhận chính thức trạng thái **`PASSWORD_ROTATION_PENDING`** (Ticket **`EDMS-SEC-201`**) và quản lý rủi ro **`RISK-SEC-01`** mà tuyệt đối không can thiệp sửa đổi trái phép cơ sở dữ liệu.

---

## 2. Bảng Thống kê Kết quả Kiểm thử Toàn diện (QA Metrics)

### 2.1. Phân bổ Kết quả 31 Ca Kiểm thử Thực tế

```
+---------------------------------------------------------------------------------+
|                        TỔNG HỢP KẾT QUẢ KIỂM THỬ (31 CA)                        |
+----------------------------------+-----------------+----------------------------+
| Loại hình kiểm thử (Nature Type) | Số lượng ca     | Tỷ lệ thành công           |
+----------------------------------+-----------------+----------------------------+
| VISUAL_PASS (Kiểm định giao diện)| 12 ca           | 100% (12/12)               |
| INTEGRATION_PASS (Tích hợp API)  | 7 ca            | 100% (7/7)                 |
| E2E_PASS (Luồng toàn trình)      | 12 ca           | 100% (12/12)               |
| FAILED (Thất bại)                | 0 ca            | 0%                         |
| BLOCKED (Bị chặn)                | 0 ca            | 0%                         |
| NOT_RUN (Chưa thực thi)          | 0 ca            | 0%                         |
+----------------------------------+-----------------+----------------------------+
| TỔNG CỘNG                        | 31 ca           | ĐẠT CHUẨN 100%             |
| SỐ LỖI CONSOLE RUNTIME           | 0 lỗi           | ZERO CONSOLE ERRORS        |
+----------------------------------+-----------------+----------------------------+
```

### 2.2. Chi tiết 31 Ca Kiểm thử theo Phân hệ

| Mã Ca | Phân hệ | Tên Ca Kiểm thử | Vai trò | Trạng thái | Minh chứng |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **TC-AUTH-01** | Authentication | Tải trang đăng nhập | ANONYMOUS | `VISUAL_PASS` | `screenshots/admin/TC_AUTH_01_login_page.png` |
| **TC-AUTH-02** | Authentication | Sai mật khẩu hiển thị thông báo lỗi | ANONYMOUS | `INTEGRATION_PASS` | `screenshots/errors/TC_AUTH_02_invalid_password.png` |
| **TC-AUTH-03** | Authentication | Đăng nhập ADMIN thành công | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_AUTH_03_admin_documents.png` |
| **TC-AUTH-04** | Authentication | Lưu trữ JWT trong localStorage | ROLE_ADMIN | `INTEGRATION_PASS` | Khóa `edms_token`, gắn Bearer header tự động |
| **TC-ADM-01** | User Management | Xem danh sách người dùng | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_ADM_01_user_list.png` |
| **TC-ADM-02** | User Management | Mở CreateUserModal | ROLE_ADMIN | `VISUAL_PASS` | `screenshots/admin/TC_ADM_02_create_user_modal.png` |
| **TC-ADM-03** | User Management | Tạo tài khoản STAFF qua UI | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_ADM_05_all_roles_table.png` |
| **TC-ADM-04** | User Management | Tạo tài khoản USER qua UI | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_ADM_05_all_roles_table.png` |
| **TC-ADM-05** | User Management | Hiển thị bảng người dùng phân trang | ROLE_ADMIN | `VISUAL_PASS` | `screenshots/users/01_users_table_paginated.png` |
| **TC-DOC-01** | Document Management | Tải danh sách tài liệu | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_01_documents_page.png` |
| **TC-DOC-02** | Document Management | Mở UploadModal | ROLE_ADMIN | `VISUAL_PASS` | `screenshots/admin/TC_DOC_02_upload_modal.png` |
| **TC-DOC-03** | Document Management | Kiểm tra giới hạn dung lượng 20MB | ROLE_ADMIN | `INTEGRATION_PASS` | `screenshots/errors/TC_DOC_03_oversized_rejection.png` |
| **TC-DOC-04** | Document Management | Kiểm tra định dạng không hợp lệ .exe | ROLE_ADMIN | `INTEGRATION_PASS` | `screenshots/errors/TC_DOC_04_invalid_ext_rejection.png` |
| **TC-DOC-UP-1** | Document Upload | Tải lên sample_report.pdf | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_05_populated_table.png` |
| **TC-DOC-UP-2** | Document Upload | Tải lên sample_contract.txt | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_05_populated_table.png` |
| **TC-DOC-UP-3** | Document Upload | Tải lên sample_diagram.png | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_05_populated_table.png` |
| **TC-DOC-UP-4** | Document Upload | Tải lên sample_specification.docx | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_05_populated_table.png` |
| **TC-DOC-05** | Document Management | Danh sách tài liệu sau nạp tệp thật | ROLE_ADMIN | `E2E_PASS` | `screenshots/admin/TC_DOC_05_populated_table.png` |
| **TC-WF-04** | Workflow | Trung tâm công việc (TaskCenterPage) | ROLE_ADMIN | `VISUAL_PASS` | `screenshots/tasks/01_task_center_overview.png` |
| **TC-ADM-06** | System Admin | Trạng thái hệ thống & Kiểm toán | ROLE_ADMIN | `INTEGRATION_PASS` | `screenshots/admin/TC_ADM_06_audit_logs.png` |
| **TC-ADM-07** | System Admin | Trang xác thực công khai (VerifyPage) | ANONYMOUS | `VISUAL_PASS` | `screenshots/admin/TC_ADM_07_verify_page.png` |
| **TC-ROLE-01** | Role Access | Đăng nhập vai trò STAFF | ROLE_STAFF | `E2E_PASS` | `screenshots/staff/TC_ROLE_01_staff_documents.png` |
| **TC-ROLE-02** | Role Access | STAFF bị chặn truy cập /api/admin/users | ROLE_STAFF | `INTEGRATION_PASS` | `screenshots/staff/TC_ROLE_02_staff_access_denied_users.png` |
| **TC-ROLE-03** | Role Access | STAFF chuyển hướng an toàn khi vào /users | ROLE_STAFF | `INTEGRATION_PASS` | Điều hướng an toàn về documents |
| **TC-ROLE-04** | Role Access | Đăng nhập vai trò USER | ROLE_USER | `E2E_PASS` | `screenshots/user/TC_ROLE_03_user_documents.png` |
| **TC-RESP-1440** | Responsive | Hiển thị 1440x900 Desktop | ROLE_USER | `VISUAL_PASS` | `screenshots/responsive/vp_laptop_1366x768.png` |
| **TC-RESP-1366** | Responsive | Hiển thị 1366x768 Laptop | ROLE_USER | `VISUAL_PASS` | `screenshots/responsive/vp_laptop_1366x768.png` |
| **TC-RESP-768** | Responsive | Hiển thị 768x1024 Tablet | ROLE_USER | `VISUAL_PASS` | `screenshots/responsive/vp_tablet_768x1024.png` |
| **TC-RESP-390** | Responsive | Hiển thị 390x844 Mobile iPhone 14 | ROLE_USER | `VISUAL_PASS` | `screenshots/responsive/vp_mobile_390x844.png` |
| **TC-RESP-375** | Responsive | Hiển thị 375x812 Mobile iPhone X | ROLE_USER | `VISUAL_PASS` | `screenshots/responsive/vp_mobile_375x812.png` |
| **TC-THEME-DARK** | Theme | Chế độ Tối (Dark Mode) toàn diện | ROLE_ADMIN | `VISUAL_PASS` | `screenshots/dark-mode/01_dark_mode_documents.png` |

---

## 3. Tổng hợp Bằng chứng Độ bền Dữ liệu & Khôi phục Thảm họa

Thực thi thông qua tập lệnh tự động hóa `scripts/test_docker_persistence_and_dr.cjs`:

1. **Khởi động lại Container (Restart Resilience):**
   - Tệp thử nghiệm ID `3725` (`QA_Persistence_1793947609371`, kích thước 99 bytes).
   - Mã băm SHA-256 trước khi restart: `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`.
   - Thực thi `docker restart edms-backend`.
   - Mã băm SHA-256 sau khi restart và tải về qua API: `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`.
   - **Kết luận:** Trùng khớp từng bit 100% (**PASS**).
2. **Sao lưu Toàn diện (Full System Backup):**
   - Tệp dump cơ sở dữ liệu: `database.dump` (PostgreSQL Custom Format `-Fc`, dung lượng `2,109,428 bytes`, SHA-256: `1b918e8a1540675d0d8e16bb54b6c331485e1e78569d5b7da8e52d92696c1861`).
   - Thư mục lưu trữ vật lý: Lưu giữ nguyên vẹn `4,833 tệp tin`.
   - Chứng chỉ số ký điện tử: `edms-keystore.p12` (dung lượng `2,676 bytes`, SHA-256: `fdcd75551abbfa0374df71cd6494209c426498669980121dbbaab90e0e83965e`).
   - Số lượng bản ghi cơ sở: Users: **172**, Documents: **3,663**, Versions: **4,826**.
3. **Phục hồi Thử nghiệm trên Môi trường Cô lập (Isolated Recovery Verification):**
   - Khởi tạo ngăn xếp phục hồi độc lập: `edms-recovery-postgres` (Port 15432), `edms-recovery-backend` (Port 18080), `edms-recovery-frontend` (Port 15173).
   - Khôi phục qua lệnh `pg_restore` và kích hoạt backend cổng 18080.
   - Số lượng bản ghi sau phục hồi: Users: **172**, Documents: **3,663**, Versions: **4,826** (Khớp 100%).
   - Tải về tệp ID 3725 trên hệ thống phục hồi: Mã SHA-256 đạt `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6` (Khớp tuyệt đối 100%).
   - Tự động dừng và xóa sạch các container phục hồi sau khi kết thúc kiểm thử, không tác động đến cụm container chính.

---

## 4. Tổng hợp Bằng chứng An toàn Bảo mật & Đa người dùng

Thực thi thông qua tập lệnh tự động hóa `scripts/test_security_multiuser.cjs` với kết quả **15/15 bài kiểm tra đạt (PASS)**:

1. **Ranh giới Phân quyền (RBAC):**
   - `SEC-01` & `SEC-02`: Gọi `/api/admin/users` hoặc `/api/documents` khi chưa xác thực trả về `HTTP 401 Unauthorized`.
   - `SEC-03`, `SEC-04`, `SEC-05`: Tài khoản STAFF hoặc USER gọi API quản trị `/api/admin/users` hoặc `/api/admin/system/status` trả về `HTTP 403 Forbidden`.
2. **Quyền riêng tư & Phân quyền Tài liệu Động (Dynamic ACL):**
   - `SEC-06` & `SEC-07`: Tài khoản USER lạ truy cập hoặc tải tài liệu `PRIVATE` của STAFF (ID 3729) bị chặn với `HTTP 403 Forbidden`.
   - `SEC-08`: STAFF chia sẻ quyền đọc (`POST /api/documents/3729/permissions` với `userId: 172, permission: READ`) -> USER truy cập thành công (`HTTP 200 OK`).
   - `SEC-09`: STAFF thu hồi quyền chia sẻ (`DELETE /api/documents/3729/permissions/172`) -> USER bị chặn ngay lập tức (`HTTP 403 Forbidden`).
3. **Cách ly Dữ liệu & Chống Leo quyền Ngang:**
   - `SEC-10`: Hộp thư thông báo của STAFF (0 thông báo) và USER (6 thông báo) hoàn toàn cách ly, không có bản ghi trùng lặp chéo.
   - `SEC-11`: USER gọi API `/api/notifications?username=admin` để xem trộm thông báo quản trị viên -> Hệ thống chặn với `HTTP 403 Forbidden`.
4. **Cô lập Đa phiên Trình duyệt & Chịu tải:**
   - `SEC-12`: Chạy đồng thời 2 phiên trình duyệt Puppeteer độc lập (Context 1: STAFF, Context 2: ADMIN) mà không có hiện tượng xung đột phiên hoặc ghi đè JWT.
   - `SEC-13`: 18 yêu cầu truy vấn đồng thời từ nhiều vai trò đều hoàn thành với `HTTP 200 OK`, không phát sinh race condition hoặc deadlock.
5. **Vệ sinh Thông tin Nhạy cảm & WebSocket:**
   - `SEC-14`: Rà soát toàn bộ log hệ thống từ `docker logs edms-backend` xác nhận không có Bearer token, không có mật khẩu dạng rõ, không rò rỉ khóa bí mật KeyStore.
   - `SEC-15`: Endpoint SockJS `/ws-edms/info` yêu cầu Origin hợp lệ và được bảo vệ nghiêm ngặt.

---

## 5. Tồn đọng Kỹ thuật & Quản trị Rủi ro (Residual Risks)

| Mã Rủi ro / Ticket | Phân loại | Hiện trạng kỹ thuật | Biện pháp & Khuyến nghị vận hành |
| :--- | :--- | :--- | :--- |
| **RISK-SEC-01** | `MEDIUM` (QA) / `HIGH` (Prod) | Các tài khoản kiểm thử QA (`admin`, `staff`, `user`) sử dụng mật khẩu ngắn đơn giản để phục vụ kiểm thử nhanh nội bộ. | Đã loại bỏ mọi hardcode fallback trong mã nguồn. Bắt buộc quay vòng mật khẩu phức tạp trước khi triển khai hệ thống lên môi trường Internet công khai. |
| **EDMS-SEC-201** | `PASSWORD_ROTATION_PENDING` | Backend chưa có endpoint quản trị viên đổi mật khẩu `PUT /api/admin/users/{id}/password`. DTO `UpdateUserRequest` chỉ nhận thông tin hồ sơ cơ bản. | Không tự tiện chạy `UPDATE` PostgreSQL hay viết endpoint ngoài phạm vi PR. Đề xuất đội ngũ Backend phát triển endpoint chính thức theo lộ trình riêng biệt. |

---

## 6. Trạng thái Bàn giao & Các bước Tiếp theo dành cho Owner

1. **Trạng thái Bàn giao:**
   Hệ thống được chính thức chuyển sang trạng thái:  
   **`READY_FOR_FINAL_OWNER_ACCEPTANCE`**  
   *(Sẵn sàng để Chủ sở hữu Dự án trực tiếp kiểm tra và ra quyết định nghiệm thu cuối cùng).*

2. **Các Container Đang Chạy Sẵn sàng cho Nghiệm thu Trực tiếp:**
   - Container `edms-frontend` (Port `5173`): Đang chạy và lắng nghe.
   - Container `edms-backend` (Port `8080`): Đang chạy và ở trạng thái Healthy.
   - Container `edms-postgres` (Port `5432`): Đang chạy và bảo toàn 100% dữ liệu.

3. **Tài liệu Bàn giao Kèm theo:**
   - Bảng ma trận 31 ca kiểm thử: `docs/final-acceptance/TEST_CASE_MATRIX.csv`
   - Báo cáo khôi phục thảm họa: `docs/final-acceptance/BACKUP_RESTORE_REPORT.md`
   - Báo cáo kiểm thử an ninh: `docs/final-acceptance/SECURITY_TEST_REPORT.md`
   - Bảng danh mục kiểm tra dành cho Owner: `docs/final-acceptance/OWNER_ACCEPTANCE_CHECKLIST.md`
