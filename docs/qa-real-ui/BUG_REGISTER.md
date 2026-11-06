# SỔ THEO DÕI VÀ XỬ LÝ LỖI (BUG REGISTER) — EDMS QA REAL UI TESTING

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh thực hiện:** `feat/edms-modern-aurora-ui`  
**Nhánh kiểm định hạ tầng:** `feat/qa-real-docker-ui`  
**Môi trường:** Docker Desktop Windows (React UI port 5173, Spring Boot Backend port 8080, PostgreSQL 16)  
**Trạng thái nghiệm thu:** `READY_FOR_OWNER_REVIEW`

---

## 1. Tóm tắt Phân loại và Tình trạng Xử lý Lỗi

| Phân loại | Tổng số phát hiện | Đã sửa & Xác minh (PASS) | Tồn đọng / Pending Action |
| :--- | :---: | :---: | :---: |
| **CRITICAL / BLOCKER** | 3 | 2 | 1 (EDMS-SEC-201 / RISK-SEC-01) |
| **MAJOR** (Ảnh hưởng luồng chính / Runner) | 2 | 2 | 0 |
| **MINOR** (Giao diện / Khả năng dùng) | 3 | 3 | 0 |
| **TỔNG CỘNG** | **8** | **7** | **1 (Bảo mật - Chờ quay vòng)** |

---

## 2. Chi tiết Danh sách Lỗi và Biện pháp Khắc phục

### BUG-001: Lỗi từ chối kết nối CORS / Origin qua Reverse Proxy
- **Mức độ:** `MAJOR`
- **Thành phần:** `deploy/team-preview/nginx.conf`
- **Mô tả:** Khi trình duyệt gọi API qua Nginx reverse proxy, CORS filter kiểm tra header Origin không khớp dẫn đến `HTTP 403 Forbidden`.
- **Cách khắc phục:** Cập nhật cấu hình Nginx thiết lập header Origin đồng nhất cho reverse proxy để Backend tiếp nhận request an toàn.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-002: Lỗi Line Endings CRLF trong Team Server Docker Entrypoint
- **Mức độ:** `BLOCKER`
- **Thành phần:** `deploy/team-server/entrypoint.sh` và `Dockerfile.team-server`
- **Mô tả:** Trên Windows, ký tự xuống dòng CRLF khiến Linux shell container không thể thực thi file script.
- **Cách khắc phục:** Chuẩn hóa định dạng tệp sang LF chuẩn Linux và thêm xử lý `sed -i 's/\r$//'` trong Dockerfile.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-003: Xử lý mật khẩu đúng chuẩn bảo mật, Trạng thái API Đổi mật khẩu và Quản lý Rủi ro (RISK-SEC-01)
- **Mức độ:** `CRITICAL` (Bảo mật thông tin & Toàn vẹn hệ thống xác thực)
- **Thành phần:** `frontend/src/pages/LoginPage.tsx`, Backend `AdminUserController.java`, `UserService.java`, kịch bản kiểm thử `scripts/`
- **Mô tả:** Trong các phiên gỡ lỗi trước, hệ thống từng áp dụng biện pháp tạm thời (chuẩn hóa chuỗi `1 2 3` -> `123` tại client và dùng mật khẩu debug). Đồng thời, tài khoản kiểm thử sử dụng mật khẩu đơn giản (`admin/123`, `staff/123`, `user/123`).
- **Kết quả Audit Backend:**
  - Đã rà soát toàn diện `AdminUserController.java`, `UserService.java` và các DTO liên quan: Endpoint `PUT /api/admin/users/{id}/password` **chưa tồn tại** trong mã nguồn backend hiện tại (`UpdateUserRequest` chỉ hỗ trợ `fullName`, `email`, `role`, `enabled`).
  - Ghi nhận trạng thái chính thức: **`PASSWORD_ROTATION_PENDING`** (Ticket kỹ thuật: **`EDMS-SEC-201`**).
  - Phân loại rủi ro bảo mật: **`RISK-SEC-01`** (Mật khẩu kiểm thử mặc định yếu trên môi trường QA/nội bộ, bắt buộc phải quay vòng trước khi mở truy cập Internet/Production).
- **Cách khắc phục & Đề xuất quy trình quay vòng:**
  1. **Khôi phục tính nguyên bản tại Frontend:** Đã xóa bỏ hoàn toàn logic ép kiểu hoặc biến đổi chuỗi `1 2 3` -> `123` trong `LoginPage.tsx`. Mật khẩu do người dùng nhập được chuyển giao nguyên bản 100% đến API backend qua giao thức bảo mật.
  2. **Loại bỏ hardcode và bắt buộc biến môi trường:** Cập nhật toàn bộ script kiểm thử tự động (`scripts/*.cjs`) đọc thông tin đăng nhập từ biến môi trường `EDMS_ADMIN_USERNAME` và `EDMS_ADMIN_PASSWORD`. Xóa bỏ hoàn toàn mọi giá trị fallback (`|| 'admin'`, `|| '123'`); nếu thiếu biến môi trường, runner lập tức dừng với exit code 1.
  3. **Quy trình quay vòng mật khẩu an toàn (không tự ý can thiệp DB):**
     - Tuyệt đối tuân thủ nguyên tắc: **Không chạy UPDATE/DELETE trực tiếp trên PostgreSQL production/QA và không tự ý tạo endpoint ngoài phạm vi PR**.
     - Khi thực hiện Ticket `EDMS-SEC-201`, đội ngũ Backend sẽ phát triển endpoint chính thức có kiểm tra quyền hạn chặt chẽ (hoặc CLI migration tool) cùng cơ chế hash BCrypt có Salt.
     - Triển khai Secrets Manager để sinh mật khẩu ngẫu nhiên tối thiểu 16 ký tự (gồm chữ hoa, chữ thường, số, ký tự đặc biệt) cho các tài khoản quản trị.
- **Trạng thái:** `VERIFIED_FIXED` (Phần Frontend & Script QA); `PASSWORD_ROTATION_PENDING` (Ticket `EDMS-SEC-201` / `RISK-SEC-01` chuyển giao Owner & Backend Team).

---

### BUG-004: Test Runner không trả exit code khác 0 khi phát hiện lỗi Console hoặc Assertion thất bại
- **Mức độ:** `MAJOR`
- **Thành phần:** `scripts/capture_showcase.cjs`, `scripts/test_dashboard_aurora.cjs`, `scripts/test_modern_aurora_live.cjs`, `scripts/capture_remaining_screenshots.cjs`
- **Mô tả:** Runner trước đây bắt lỗi console và chỉ in cảnh báo hoặc kết thúc với `exit code 0` ngầm định (`capture().catch(console.error)`), khiến các công cụ CI/CD có thể báo cáo thành công giả dù có lỗi runtime hoặc assertion không đạt.
- **Cách khắc phục triệt để:**
  - Bổ sung bộ lắng nghe sự kiện `page.on('console')` và `page.on('pageerror')`.
  - Nếu phát hiện bất kỳ lỗi console nghiêm trọng nào hoặc assertion DOM không thỏa mãn (như `#username-input`, `#nav-docs-btn`, `.dash-kpi-grid`, `.dash-table`, users table), runner lập tức in thông tin chi tiết và gọi `process.exit(1)`.
  - Khối `catch (err)` luôn kết thúc bằng `process.exit(1)` với cơ chế fail-closed.
  - Khối `finally` đảm bảo `browser.close()` được thực thi an toàn, không rò rỉ tiến trình nền.
  - Che giấu an toàn thông tin nhạy cảm trong log (không in mật khẩu hoặc JWT token ra console).
  - Đã xây dựng bộ kiểm thử tự động độc lập `scripts/test_showcase_runner.cjs` kiểm chứng 3 kịch bản:
    1. Thiếu biến môi trường -> Runner dừng với exit code 1 (PASS).
    2. Sai thông tin đăng nhập -> Runner dừng với exit code 1 và không rò rỉ credential (PASS).
    3. Thông tin đăng nhập hợp lệ -> Runner hoàn thành với exit code 0 (PASS).
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-005: Ràng buộc độ dài mật khẩu khi tạo người dùng qua giao diện
- **Mức độ:** `MINOR`
- **Thành phần:** `frontend/src/components/CreateUserModal.tsx`
- **Mô tả:** Form tạo người dùng yêu cầu tối thiểu 6 ký tự theo đúng validation `@Size(min = 6)` của Backend DTO.
- **Cách khắc phục:** Đã bổ sung nhãn gợi ý rõ ràng và đảm bảo tuân thủ validation cả hai phía Client và Server.
- **Trạng thái:** `DOCUMENTED_AND_VERIFIED`.

---

### BUG-006: Thiếu vai trò ROLE_USER trong giao diện tạo người dùng
- **Mức độ:** `MINOR`
- **Thành phần:** `frontend/src/components/CreateUserModal.tsx`
- **Mô tả:** Thẻ `<select id="create-role-select">` chỉ chứa `ROLE_STAFF` và `ROLE_ADMIN`, thiếu tùy chọn tạo tài khoản `ROLE_USER`.
- **Cách khắc phục:** Đã bổ sung `<option value="ROLE_USER">ROLE_USER (Người dùng cơ bản)</option>` vào modal.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-007: Tràn layout khi xuất hiện tên loại tài liệu dạng chuỗi nhị phân dài
- **Mức độ:** `MAJOR`
- **Thành phần:** `frontend/src/pages/DashboardPage.tsx`
- **Mô tả:** Các bản ghi lịch sử có trường `document_type` chứa chuỗi byte dài (ví dụ `b'%PDF-1.4 Content draft...'`) làm vỡ tỷ lệ thanh tiến trình và tràn bảng phân loại.
- **Cách khắc phục:** Bổ sung cơ chế Ellipsis Truncation (giới hạn độ rộng tối đa 200px) kết hợp Full Tooltip hiển thị đầy đủ chuỗi gốc khi rê chuột, gom nhóm các mục nhỏ vào nhóm phụ mà không can thiệp sửa đổi cơ sở dữ liệu.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-008: Điều hướng sau đăng nhập dựa trên State thay vì đổi URL Path
- **Mức độ:** `MINOR`
- **Thành phần:** `frontend/src/App.tsx`, test runner
- **Mô tả:** EDMS sử dụng kiến trúc State-driven navigation (`CustomEvent('app-navigate')`). URL trình duyệt không đổi path khi chuyển màn hình.
- **Cách khắc phục:** Cập nhật script kiểm thử lắng nghe sự kiện render DOM (`#nav-docs-btn`, `.ent-sidebar`) thay vì chờ đợi sự kiện thay đổi URL pathname.
- **Trạng thái:** `VERIFIED_FIXED`.

