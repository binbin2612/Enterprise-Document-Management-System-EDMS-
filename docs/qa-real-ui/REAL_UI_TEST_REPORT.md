# BÁO CÁO KIỂM THỬ GIAO DIỆN THỰC TẾ & CHẤP NHẬN CHỨC NĂNG (REAL DOCKER UI TEST REPORT)

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh thực hiện:** `feat/edms-modern-aurora-ui`  
**Nhánh kiểm định hạ tầng:** `feat/qa-real-docker-ui`  
**Kỹ sư thực hiện:** Senior Full-Stack QA & Browser Automation Tester  
**Thời điểm cập nhật:** 2026-11-03  
**Kết luận tổng thể:** **`READY_FOR_OWNER_REVIEW`**

---

## 1. Môi trường Thực thi & Kiểm thử Thực tế

- **Giao diện Web:**  
  👉 **`http://localhost:5173`** (Vite / React 18 / Docker Desktop Windows)  
  👉 **`http://127.0.0.1:8088`** (Nginx Reverse Proxy, cấu hình bind an toàn localhost)
- **Backend API:** `http://localhost:8080/api/` (Spring Boot 3.3.3 / Java 21)
- **Database:** PostgreSQL 16 Alpine (`edms-postgres`, port 5432 nội bộ)
- **Trình duyệt điều khiển tự động:** Google Chrome thật (`C:\Program Files\Google\Chrome\Application\chrome.exe`) qua `puppeteer-core`.
- **Chính sách xác thực kiểm thử:** Bắt buộc sử dụng biến môi trường `EDMS_ADMIN_USERNAME` và `EDMS_ADMIN_PASSWORD`. Mọi fallback hardcode tài khoản/mật khẩu yếu đã bị loại bỏ hoàn toàn khỏi các test runner.

---

## 2. Xác Minh Thực Tế Từng Phân Hệ Chức Năng

### A. Xác thực và Bảo mật (Authentication & Authorization)
1. **Tải trang đăng nhập (`TC-AUTH-01`):**  
   Giao diện đăng nhập Modern Aurora tải hoàn chỉnh, form input thẳng hàng, nhãn tiếng Việt chuẩn Enterprise UI.
2. **Kiểm tra mật khẩu sai (`TC-AUTH-02`):**  
   Gửi yêu cầu đăng nhập với mật khẩu sai $\rightarrow$ Backend trả về mã lỗi thực tế:
   ```json
   HTTP/1.1 401 Unauthorized
   {"correlationId":"f5d1d4ff-2cf4-4d21-bbe0-e9f3bf2d855b","error":"Unauthorized","message":"Tên đăng nhập hoặc mật khẩu không chính xác.","status":401}
   ```
   Giao diện hiển thị banner cảnh báo tiếng Việt tương ứng.
3. **Đăng nhập quản trị viên qua biến môi trường (`TC-AUTH-03`):**  
   Đăng nhập bằng thông tin truyền qua biến môi trường $\rightarrow$ Backend cấp phát Bearer JWT token thành công (`HTTP 200 OK`).
4. **Lưu trữ phiên xác thực (`TC-AUTH-04`):**  
   Xác minh token được lưu trữ an toàn trong `localStorage` dưới khóa `edms_token`, tự động gắn header `Authorization: Bearer <token>` vào tất cả các yêu cầu tiếp theo.

### B. Quản trị Người dùng & Phân quyền (User Management)
1. **Xem danh sách người dùng (`TC-ADM-01`):**  
   Tải danh sách tài khoản từ cơ sở dữ liệu PostgreSQL thật qua `GET /api/admin/users` (`HTTP 200 OK`).
2. **Tạo tài khoản STAFF (`TC-ADM-03`):**  
   Mở `CreateUserModal`, tạo tài khoản `qa_staff` thành công, backend lưu mật khẩu mã hóa BCrypt vào bảng `users`.
3. **Tạo tài khoản USER (`TC-ADM-04`):**  
   Modal tạo người dùng đã được bổ sung tùy chọn `ROLE_USER`, tạo thành công tài khoản người dùng cơ bản `qa_user`.
4. **Kiểm soát truy cập theo vai trò (Role Boundary Verification - `TC-ROLE-02`):**  
   Khi tài khoản `ROLE_STAFF` cố gắng truy cập endpoint quản trị `GET /api/admin/users`, Backend trả về mã lỗi thực tế:
   ```json
   HTTP/1.1 403 Forbidden
   {"status":403,"error":"Forbidden","message":"Bạn không có quyền thực hiện thao tác này.","correlationId":"b3f40f08-a5af-42e6-a6b6-df2a1a84d29e"}
   ```
   Đồng thời trên giao diện, thanh điều hướng của STAFF tự động ẩn các mục quản trị (`#nav-users-btn`).

### C. Quản lý Tài liệu & Tải lên Tệp Thật (Document Management)
1. **Tải danh sách tài liệu (`TC-DOC-01`):**  
   Tải danh sách tài liệu từ cơ sở dữ liệu qua `GET /api/documents`.
2. **Kiểm tra giới hạn dung lượng 20MB (`TC-DOC-03`):**  
   Tệp `oversized_22mb.bin` bị client chặn ngay lập tức kèm cảnh báo `Dung lượng tệp vượt quá 20MB`.
3. **Kiểm tra định dạng không hợp lệ (`TC-DOC-04`):**  
   Tệp `invalid_script.exe` bị bộ lọc định dạng từ chối.
4. **Tải lên tệp mẫu thật (`TC-DOC-UP-1` đến `TC-DOC-UP-4`):**  
   Tải lên các tệp mẫu hợp lệ qua `UploadModal`:
   - `sample_report.pdf` (PDF tài liệu kiểm toán)
   - `sample_contract.txt` (Hợp đồng cung cấp hạ tầng)
   - `sample_diagram.png` (Sơ đồ kiến trúc)
   - `sample_specification.docx` (Quy cách kỹ thuật)  
   Tất cả yêu cầu trả về `HTTP 201 Created`, tệp được lưu trữ tại `storage/uploads` và ghi nhận metadata vào PostgreSQL `documents`.

### D. Bảng điều khiển Modern Aurora (Dashboard Repair)
1. **Bố cục 3 hàng độc lập:**
   - Hàng 1: 4 thẻ KPI đồng đều kích thước, khoảng cách 18px.
   - Hàng 2: Tỷ lệ phân chia 45% (Phân loại tài liệu) và 55% (Tần suất sử dụng).
   - Hàng 3: Bảng lịch sử hoạt động gần đây phong cách Zeit với action badge tiếng Việt.
2. **Khả năng phục hồi dữ liệu (Data Resilience):**  
   Xử lý an toàn các bản ghi có `document_type` chuỗi byte dài bằng cơ chế ellipsis truncation và hover tooltip, tuyệt đối không làm biến dạng layout.

### E. Kiểm thử Đa Thiết bị (Responsive) & Dark Mode
Đã chạy kiểm thử và chụp ảnh màn hình nghiệm thu trên 5 độ phân giải mục tiêu:
- 1440×900 (Desktop tiêu chuẩn)
- 1366×768 (Laptop phổ biến)
- 768×1024 (Tablet iPad)
- 390×844 (Mobile iPhone 14 Pro)
- 375×812 (Mobile iPhone X)  
Tất cả các viewports đều đạt tiêu chuẩn: **0 hiện tượng tràn màn hình ngang (horizontal overflow)**. Chế độ Dark Mode hoạt động đồng bộ với độ tương phản cao, 0 chói.

---

## 3. Tổng Hợp Ma Trận Kết Quả Kiểm Thử Thực Tế

Ma trận chi tiết được lưu trữ tại [`docs/qa-real-ui/TEST_CASE_MATRIX.csv`](file:///f:/DoAn_CNPMNC/docs/qa-real-ui/TEST_CASE_MATRIX.csv):
- Tổng số ca kiểm thử: **30 ca**
- Ca đạt chuẩn trực quan (VISUAL_PASS): **13 ca**
- Ca đạt chuẩn nghiệp vụ đầu cuối (E2E_PASS): **17 ca**
- Ca thất bại (FAILED): **0 ca**
- Số lỗi Console bắt được trong quá trình kiểm thử: **0 lỗi**

---

## 4. Kế Hoạch Quay Vòng Thông Tin Xác Thực (Credential Rotation Plan)

1. **Nguyên tắc cốt lõi:** Tuyệt đối không can thiệp, cập nhật hay đặt lại database thủ công trên môi trường hiện tại (`không tự ý reset database`).
2. **Quy trình áp dụng khi triển khai:**
   - Khi triển khai lên môi trường Staging/Production, toàn bộ tài khoản hệ thống sẽ được cấp phát mật khẩu mạnh mới ngẫu nhiên (tối thiểu 16 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt) thông qua biến môi trường bí mật hoặc quy trình quản trị người dùng chính thức.
   - Các kịch bản kiểm thử tự động đọc thông tin xác thực từ biến môi trường của hệ thống CI/CD (`EDMS_ADMIN_USERNAME`, `EDMS_ADMIN_PASSWORD`), tuyệt đối không lưu trữ thông tin nhạy cảm trong mã nguồn.

---

## 5. Kết Luận & Trạng Thái Nghiệm Thu

Hệ thống đã được kiểm thử toàn diện trên trình duyệt Chrome thật, kết nối cơ sở dữ liệu và API Backend thật, giải quyết triệt để tất cả các yêu cầu từ Owner Review.

**Trạng thái nghiệm thu:** **`READY_FOR_OWNER_REVIEW`**
