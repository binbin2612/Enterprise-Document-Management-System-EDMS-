# BÁO CÁO KIỂM THỬ GIAO DIỆN THỰC TẾ & CHẤP NHẬN CHỨC NĂNG (REAL DOCKER UI TEST REPORT)

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh thực hiện:** `feat/edms-modern-aurora-ui`  
**Nhánh kiểm định hạ tầng & QA:** `feat/qa-real-docker-ui`  
**Kỹ sư thực hiện:** Senior Full-Stack QA & Browser Automation Tester  
**Thời điểm cập nhật:** 2026-11-06  
**Kết luận tổng thể:** **`READY_FOR_FINAL_OWNER_ACCEPTANCE`**

---

## 1. Môi trường Thực thi & Kiểm thử Thực tế

- **Giao diện Web:**  
  👉 **`http://localhost:5173`** (Vite / React 18 / Docker Desktop Windows)  
  👉 **`http://127.0.0.1:8088`** (Nginx Reverse Proxy, cấu hình bind an toàn localhost)
- **Backend API:** `http://localhost:8080/api/` (Spring Boot 3.3.3 / Java 21)
- **Database:** PostgreSQL 16 Alpine (`edms-postgres`, port 5432 nội bộ)
- **Trình duyệt điều khiển tự động:** Google Chrome thật (`C:\Program Files\Google\Chrome\Application\chrome.exe`) qua `puppeteer-core`.
- **Chính sách xác thực kiểm thử:** Bắt buộc sử dụng biến môi trường `EDMS_ADMIN_USERNAME` và `EDMS_ADMIN_PASSWORD`. Mọi fallback hardcode tài khoản/mật khẩu yếu đã bị loại bỏ hoàn toàn khỏi các test runner; kịch bản tự động dừng với exit code 1 nếu thiếu biến môi trường.

---

## 2. Xác Minh Thực Tế Từng Phân Hệ Chức Năng

### A. Xác thực và Bảo mật (Authentication & Authorization)
1. **Tải trang đăng nhập (`TC-AUTH-01`):**  
   Giao diện đăng nhập Modern Aurora tải hoàn chỉnh, form input thẳng hàng, nhãn tiếng Việt chuẩn Enterprise UI (`VISUAL_PASS`).
2. **Kiểm tra mật khẩu sai (`TC-AUTH-02`):**  
   Gửi yêu cầu đăng nhập với mật khẩu sai $\rightarrow$ Backend trả về mã lỗi thực tế (`INTEGRATION_PASS`):
   ```json
   HTTP/1.1 401 Unauthorized
   {"correlationId":"f5d1d4ff-2cf4-4d21-bbe0-e9f3bf2d855b","error":"Unauthorized","message":"Tên đăng nhập hoặc mật khẩu không chính xác.","status":401}
   ```
   Giao diện hiển thị banner cảnh báo tiếng Việt tương ứng.
3. **Đăng nhập quản trị viên qua biến môi trường (`TC-AUTH-03`):**  
   Đăng nhập bằng thông tin truyền qua biến môi trường $\rightarrow$ Backend cấp phát Bearer JWT token thành công (`HTTP 200 OK`, `E2E_PASS`).
4. **Lưu trữ phiên xác thực (`TC-AUTH-04`):**  
   Xác minh token được lưu trữ an toàn trong `localStorage` dưới khóa `edms_token`, tự động gắn header `Authorization: Bearer <token>` vào tất cả các yêu cầu tiếp theo (`INTEGRATION_PASS`).

### B. Quản trị Người dùng & Phân quyền (User Management)
1. **Xem danh sách người dùng (`TC-ADM-01`):**  
   Tải danh sách tài khoản từ cơ sở dữ liệu PostgreSQL thật qua `GET /api/admin/users` (`HTTP 200 OK`, `E2E_PASS`).
2. **Mở Modal tạo người dùng (`TC-ADM-02`):**  
   Modal tạo người dùng chuẩn EnterpriseModal với focus trap, form input chuẩn (`VISUAL_PASS`).
3. **Tạo tài khoản STAFF (`TC-ADM-03`):**  
   Mở `CreateUserModal`, tạo tài khoản `qa_staff` thành công, backend lưu mật khẩu mã hóa BCrypt vào bảng `users` (`E2E_PASS`).
4. **Tạo tài khoản USER (`TC-ADM-04`):**  
   Modal tạo người dùng đã được bổ sung tùy chọn `ROLE_USER`, tạo thành công tài khoản người dùng cơ bản `qa_user` (`E2E_PASS`).
5. **Hiển thị danh sách phân trang người dùng (`TC-ADM-05`):**  
   Bảng người dùng hiển thị đầy đủ tài khoản với phân trang Modern Aurora 10 tài khoản/trang (`VISUAL_PASS`).
6. **Kiểm soát truy cập theo vai trò (Role Boundary Verification - `TC-ROLE-02`):**  
   Khi tài khoản `ROLE_STAFF` cố gắng truy cập endpoint quản trị `GET /api/admin/users`, Backend trả về mã lỗi thực tế (`INTEGRATION_PASS`):
   ```json
   HTTP/1.1 403 Forbidden
   {"status":403,"error":"Forbidden","message":"Bạn không có quyền thực hiện thao tác này.","correlationId":"b3f40f08-a5af-42e6-a6b6-df2a1a84d29e"}
   ```
   Đồng thời trên giao diện, thanh điều hướng của STAFF tự động ẩn các mục quản trị (`#nav-users-btn`).
7. **Chuyển hướng an toàn (`TC-ROLE-03`):**  
   App.tsx tự động điều hướng STAFF về trang documents an toàn khi cố tình gõ đường dẫn quản trị (`INTEGRATION_PASS`).

### C. Quản lý Tài liệu & Tải lên Tệp Thật (Document Management)
1. **Tải danh sách tài liệu (`TC-DOC-01`):**  
   Tải danh sách tài liệu từ cơ sở dữ liệu qua `GET /api/documents` (`E2E_PASS`).
2. **Mở Modal Upload (`TC-DOC-02`):**  
   UploadModal chuẩn Modern Aurora với dropzone, role="dialog" (`VISUAL_PASS`).
3. **Kiểm tra giới hạn dung lượng 20MB (`TC-DOC-03`):**  
   Tệp `oversized_22mb.bin` bị client chặn ngay lập tức kèm cảnh báo `Dung lượng tệp vượt quá 20MB` (`INTEGRATION_PASS`).
4. **Kiểm tra định dạng không hợp lệ (`TC-DOC-04`):**  
   Tệp `invalid_script.exe` bị bộ lọc định dạng từ chối (`INTEGRATION_PASS`).
5. **Tải lên tệp mẫu thật (`TC-DOC-UP-1` đến `TC-DOC-UP-4`):**  
   Tải lên các tệp mẫu hợp lệ qua `UploadModal`:
   - `sample_report.pdf` (PDF tài liệu kiểm toán)
   - `sample_contract.txt` (Hợp đồng cung cấp hạ tầng)
   - `sample_diagram.png` (Sơ đồ kiến trúc)
   - `sample_specification.docx` (Quy cách kỹ thuật)  
   Tất cả yêu cầu trả về `HTTP 201 Created`, tệp được lưu trữ tại `storage/uploads` và ghi nhận metadata vào PostgreSQL `documents` (`E2E_PASS`).
6. **Danh sách tài liệu sau khi nạp tệp thật (`TC-DOC-05`):**  
   Hiển thị danh sách tài liệu đầy đủ metadata thật, người tạo, ngày tạo, trạng thái (`E2E_PASS`).

### D. Bảng điều khiển Modern Aurora (Dashboard Repair) & Workflow
1. **Bố cục 3 hàng độc lập:**
   - Hàng 1: 4 thẻ KPI đồng đều kích thước, khoảng cách 18px.
   - Hàng 2: Tỷ lệ phân chia 45% (Phân loại tài liệu) và 55% (Tần suất sử dụng).
   - Hàng 3: Bảng lịch sử hoạt động gần đây phong cách Zeit với action badge tiếng Việt.
2. **Khả năng phục hồi dữ liệu (Data Resilience):**  
   Xử lý an toàn các bản ghi có `document_type` chuỗi byte dài bằng cơ chế ellipsis truncation và hover tooltip, tuyệt đối không làm biến dạng layout.
3. **Trung tâm công việc TaskCenterPage (`TC-WF-04`):**  
   Hiển thị 4 thẻ KPI công việc, phân loại 4 tab công việc rõ ràng (`VISUAL_PASS`).
4. **Trạng thái hệ thống & Kiểm toán (`TC-ADM-06`):**  
   HTTP 200 OK từ Backend Actuator & Audit API (`INTEGRATION_PASS`).
5. **Trang xác thực công khai VerifyPage (`TC-ADM-07`):**  
   Giao diện xác thực tài liệu công khai chuẩn Modern Aurora (`VISUAL_PASS`).

### E. Kiểm thử Đa Thiết bị (Responsive) & Dark Mode
Đã chạy kiểm thử và chụp ảnh màn hình nghiệm thu trên 5 độ phân giải mục tiêu:
- 1440×900 (Desktop tiêu chuẩn - `TC-RESP-1440`): `VISUAL_PASS`
- 1366×768 (Laptop phổ biến - `TC-RESP-1366`): `VISUAL_PASS`
- 768×1024 (Tablet iPad - `TC-RESP-768`): `VISUAL_PASS`
- 390×844 (Mobile iPhone 14 Pro - `TC-RESP-390`): `VISUAL_PASS`
- 375×812 (Mobile iPhone X - `TC-RESP-375`): `VISUAL_PASS`  
Tất cả các viewports đều đạt tiêu chuẩn: **0 hiện tượng tràn màn hình ngang (horizontal overflow)**. Chế độ Dark Mode (`TC-THEME-DARK`) hoạt động đồng bộ với độ tương phản cao, 0 chói (`VISUAL_PASS`).

---

## 3. Tổng Hợp Ma Trận Kết Quả Kiểm Thử Thực Tế

Ma trận chi tiết được lưu trữ tại [`docs/qa-real-ui/TEST_CASE_MATRIX.csv`](file:///f:/DoAn_CNPMNC/docs/qa-real-ui/TEST_CASE_MATRIX.csv):
- **Tổng số ca kiểm thử:** **31 ca** (100% khớp danh mục Test ID thực thi)
- **Ca đạt chuẩn trực quan giao diện (`VISUAL_PASS`):** **12 ca** (Giao diện đăng nhập, modal, phân trang, responsive viewports, dark mode, task center, verify page)
- **Ca đạt chuẩn tích hợp & ranh giới bảo mật (`INTEGRATION_PASS`):** **7 ca** (Chặn 401 unauthenticated, chặn 403 role boundary, kiểm tra token localStorage, chặn 20MB, lọc .exe, audit logs, route guard)
- **Ca đạt chuẩn nghiệp vụ đầu cuối (`E2E_PASS`):** **12 ca** (Đăng nhập thật, tạo tài khoản thật vào PostgreSQL, upload và lưu trữ 4 tệp vật lý thật, tải danh sách tài liệu từ cơ sở dữ liệu)
- **Ca thất bại (`FAILED`):** **0 ca**
- **Ca bị chặn (`BLOCKED`):** **0 ca**
- **Ca chưa chạy (`NOT_RUN`):** **0 ca**
- **Số lỗi Console bắt được trong quá trình kiểm thử:** **0 lỗi**

---

## 4. Báo Cáo Quy Trình Đổi Mật Khẩu & Kế Hoạch Quay Vòng (Credential Rotation Plan)

### A. Kết quả Rà soát Backend về Endpoint Đổi Mật Khẩu
1. **Rà soát toàn bộ Backend Java (`AdminUserController.java`, `UserService.java`, DTOs):**  
   Kết quả kiểm tra mã nguồn cho thấy hiện tại Backend **chưa có endpoint `PUT /api/admin/users/{id}/password`** hoặc API đổi mật khẩu chuyên biệt. Endpoint `PUT /api/admin/users/{id}` hiện chỉ tiếp nhận DTO `UpdateUserRequest` (gồm các trường: `fullName`, `email`, `role`, `enabled`) và không cập nhật trường `password`.
2. **Xác nhận trạng thái kỹ thuật:** **`PASSWORD_ROTATION_PENDING`** (Ghi nhận Ticket kỹ thuật Backend: `EDMS-SEC-201`).
3. **Nhận diện rủi ro bảo mật (`RISK-SEC-01`):**  
   Các tài khoản dùng chung kiểm thử nội bộ (`admin/123`, `staff/123`, `user/123`) có mật khẩu yếu và bắt buộc phải được xử lý quay vòng mật khẩu an toàn trước khi đưa hệ thống lên mạng Internet công cộng.

### B. Quy trình Đổi Mật Khẩu An Toàn Đề Xuất
1. **Nguyên tắc cốt lõi đã cam kết:**  
   - Tuyệt đối **không tự tạo endpoint mới khi chưa có phê duyệt của Owner**.
   - Tuyệt đối **không tự ý reset mật khẩu của các tài khoản hiện tại**.
   - Tuyệt đối **không chạy câu lệnh `UPDATE` hoặc `DELETE` thủ công trên PostgreSQL `edms_db`**.
2. **Kế hoạch triển khai chính thức (Production Handoff):**  
   - **Ticket `EDMS-SEC-201`:** Bổ sung API `PUT /api/admin/users/{id}/password` (dành cho Admin) và `PUT /api/users/profile/password` (tự đổi mật khẩu của người dùng hiện tại), áp dụng `@Size(min = 12)` kèm chính sách độ phức tạp (chữ hoa, chữ thường, số, ký tự đặc biệt).
   - Khi triển khai môi trường Staging/Production, mật khẩu quản trị ban đầu sẽ được khởi tạo qua biến môi trường an toàn của Docker / Kubernetes Secret (`EDMS_INITIAL_ADMIN_PASSWORD`), được mã hóa BCrypt ngay tại thời điểm khởi động lần đầu.
   - Các kịch bản kiểm thử tự động đọc thông tin xác thực từ biến môi trường của hệ thống CI/CD (`EDMS_ADMIN_USERNAME`, `EDMS_ADMIN_PASSWORD`), tuyệt đối không lưu trữ thông tin nhạy cảm trong mã nguồn.

---

## 5. Kết Luận & Trạng Thái Nghiệm Thu

Hệ thống đã được kiểm thử toàn diện trên trình duyệt Chrome thật, kết nối cơ sở dữ liệu và API Backend thật, giải quyết triệt để tất cả các yêu cầu từ Owner Review.

**Trạng thái bàn giao chính thức:** **`READY_FOR_FINAL_OWNER_ACCEPTANCE`**
