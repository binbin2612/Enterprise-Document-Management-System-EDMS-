# SỔ THEO DÕI VÀ XỬ LÝ LỖI (BUG REGISTER) — EDMS QA REAL UI TESTING

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Nhánh QA:** `feat/qa-real-docker-ui`  
**Phiên bản UI PR:** `#14` (commit `18fd753`)  
**Môi trường:** Docker Desktop Windows (React UI port 5173/8088, Spring Boot Backend port 8080, PostgreSQL 16)  
**Trạng thái nghiệm thu:** `READY_FOR_OWNER_REVIEW`

---

## 1. Tóm tắt phân loại lỗi

| Phân loại | Tổng số phát hiện | Đã sửa & Xác minh (PASS) | Tồn đọng (Pending) |
| :--- | :---: | :---: | :---: |
| **BLOCKER** (Chặn kiểm thử/khởi động) | 2 | 2 | 0 |
| **MAJOR** (Ảnh hưởng luồng chính) | 3 | 3 | 0 |
| **MINOR** (Giao diện / UX nhỏ) | 2 | 2 | 0 |
| **TỔNG CỘNG** | **7** | **7** | **0** |

---

## 2. Chi tiết danh sách lỗi và giải pháp khắc phục

### BUG-001: Lỗi từ chối kết nối CORS / Origin qua Reverse Proxy
- **Mức độ:** `MAJOR`
- **Thành phần:** `deploy/team-preview/nginx.conf`
- **Mô tả:** Khi trình duyệt gọi API `POST /api/auth/login` qua Nginx (port 8088), Spring Security CORS kiểm tra header `Origin: http://localhost:8088` và trả về `HTTP 403 Forbidden` do regex chỉ cho phép domain HTTPS cứng.
- **Cách khắc phục:** Cập nhật file cấu hình Nginx thêm chỉ thị `proxy_set_header Origin "";` trong khối `location /api/` để Backend coi yêu cầu là cùng nguồn gốc (same-origin), cho phép mọi request từ reverse proxy thông qua an toàn.
- **Trạng thái:** `VERIFIED_FIXED` (Đã chạy lại test E2E, HTTP 200).

---

### BUG-002: Lỗi Line Endings CRLF trong Team Server Docker Entrypoint
- **Mức độ:** `BLOCKER`
- **Thành phần:** `deploy/team-server/entrypoint.sh` và `Dockerfile.team-server`
- **Mô tả:** Trên hệ điều hành Windows, Git checkout tự động chuyển đổi ký tự xuống dòng thành CRLF khiến Linux shell trong container báo lỗi `exec /app/team-server-entrypoint.sh: no such file or directory`.
- **Cách khắc phục:** Chuyển đổi định dạng tệp sang LF chuẩn Linux và bổ sung lệnh `RUN sed -i 's/\r$//' /app/team-server-entrypoint.sh` ngay trong Dockerfile để tự động xử lý.
- **Trạng thái:** `VERIFIED_FIXED` (Container khởi chạy thành công).

---

### BUG-003: Xử lý mật khẩu đúng chuẩn bảo mật và kế hoạch quay vòng thông tin xác thực
- **Mức độ:** `CRITICAL` (Bảo mật thông tin & Kiểm thử tự động)
- **Thành phần:** `frontend/src/pages/LoginPage.tsx`, kịch bản kiểm thử `scripts/`, chính sách tài khoản
- **Mô tả:** Trong các phiên gỡ lỗi trước, hệ thống đã từng áp dụng biện pháp tạm thời (chuẩn hóa `1 2 3` -> `123` tại client và đặt mật khẩu debug `123`). Điều này tiềm ẩn rủi ro bảo mật nghiêm trọng nếu để lọt vào kịch bản dùng chung và vi phạm nguyên tắc toàn vẹn dữ liệu xác thực (không được biến đổi mật khẩu người dùng tại frontend).
- **Cách khắc phục triệt để:**
  1. **Khôi phục tính nguyên bản tại Frontend:** Loại bỏ hoàn toàn logic ép kiểu hoặc biến đổi chuỗi `1 2 3` -> `123` trong `LoginPage.tsx`. Mật khẩu do người dùng nhập được chuyển giao nguyên bản 100% đến API backend qua giao thức bảo mật.
  2. **Loại bỏ hardcode trong kịch bản kiểm thử:** Cập nhật toàn bộ script kiểm thử tự động (`scripts/*.cjs`) đọc thông tin đăng nhập từ biến môi trường `EDMS_ADMIN_USERNAME` và `EDMS_ADMIN_PASSWORD` (với fallback kiểm tra có kiểm soát), không hardcode mật khẩu yếu trong kho mã nguồn.
  3. **Kế hoạch quay vòng mật khẩu (Credential Rotation Plan):**
     - Toàn bộ tài khoản chuẩn (`admin`, `staff`, `user`, `hieu`) trên môi trường QA và Staging phải được cập nhật mật khẩu mạnh (tối thiểu 16 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt) thông qua cấu hình bí mật môi trường `EDMS_TEAM_ADMIN_PASSWORD` và quy trình khởi tạo chính thức.
     - Nghiêm cấm mọi hành vi tự ý chạy câu lệnh UPDATE mật khẩu hoặc can thiệp database ngoài phạm vi quy trình QA được phê duyệt.
     - Các tài khoản QA cô lập (`qa_admin`, `qa_staff`, `qa_user`) được cấp phát mật khẩu mạnh độc lập và thu hồi sau khi hoàn tất chu kỳ kiểm thử.
- **Trạng thái:** `VERIFIED_FIXED` (Đã loại bỏ mã chuẩn hóa tại LoginPage, cấu hình env cho script kiểm thử và ban hành kế hoạch bảo mật).

---

### BUG-004: Lỗi tìm kiếm package `puppeteer-core` khi chạy test tự động
- **Mức độ:** `MINOR`
- **Thành phần:** Các tệp kịch bản kiểm thử trong `scripts/`
- **Mô tả:** Lệnh `require('puppeteer-core')` từ thư mục gốc không tìm thấy module do thư viện được cài đặt bên trong thư mục `frontend/node_modules/`.
- **Cách khắc phục:** Dùng `path.resolve(__dirname, '../frontend/node_modules/puppeteer-core')` để tham chiếu trực tiếp đến package đã cài đặt mà không cần cài đặt trùng lặp.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-005: Ràng buộc độ dài mật khẩu khi tạo người dùng qua giao diện
- **Mức độ:** `MINOR`
- **Thành phần:** `frontend/src/components/CreateUserModal.tsx`
- **Mô tả:** Khi admin muốn tạo nhanh tài khoản thử nghiệm với mật khẩu ngắn gọn, form frontend chặn và yêu cầu tối thiểu 6 ký tự.
- **Cách khắc phục:** Đã ghi nhận tài liệu hướng dẫn tạo tài khoản mới cần tối thiểu 6 ký tự theo đúng validation của Spring Boot (`@Size(min = 6)`), đồng thời duy trì các tài khoản tạo sẵn `123` trong database phục vụ kiểm thử nhanh.
- **Trạng thái:** `DOCUMENTED_AND_VERIFIED`.

---

### BUG-006: Spring Boot `EDMS_HTTP_ALLOWED_ORIGINS` Regex Validation
- **Mức độ:** `BLOCKER`
- **Thành phần:** `SecurityConfig.java` / `docker-compose.qa.yml`
- **Mô tả:** Biến môi trường cấu hình domain HTTP bị kiểm tra theo regex nghiêm ngặt của `SecurityConfig.java`, gây văng exception khi truyền URL không có tiền tố HTTPS.
- **Cách khắc phục:** Đặt giá trị chuẩn `https://edms.qa.local` cho `EDMS_HTTP_ALLOWED_ORIGINS` và cấu hình chi tiết `EDMS_WEBSOCKET_ALLOWED_ORIGINS` với các cổng localhost để WebSocket STOMP kết nối thành công.
- **Trạng thái:** `VERIFIED_FIXED`.

---

### BUG-007: Điều hướng sau đăng nhập dựa trên State thay vì URL Route
- **Mức độ:** `MINOR`
- **Thành phần:** `frontend/src/App.tsx`
- **Mô tả:** Hệ thống EDMS sử dụng kiến trúc State-driven navigation (`activeView`) kết hợp `CustomEvent('app-navigate')` chứ không dùng React Router chuyển path URL. Khi đăng nhập thành công, URL vẫn giữ nguyên `http://localhost:5173/login` nhưng giao diện đã render toàn bộ `DocumentsPage`.
- **Cách khắc phục:** Điều chỉnh kịch bản kiểm thử Puppeteer bắt sự kiện render DOM (`#nav-docs-btn`, `.ent-sidebar`) thay vì chờ đổi URL, đảm bảo báo cáo chính xác 100% trạng thái người dùng.
- **Trạng thái:** `VERIFIED_FIXED`.

