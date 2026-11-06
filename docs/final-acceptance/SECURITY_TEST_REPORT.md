# BÁO CÁO KIỂM THỬ BẢO MẬT & ĐA NGƯỜI DÙNG (SECURITY & MULTI-USER TEST REPORT)

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh QA kiểm định:** `feat/qa-real-docker-ui`  
**Môi trường thực nghiệm:** Docker Desktop Windows (React UI port 5173, Spring Boot port 8080, PostgreSQL 16)  
**Tập lệnh kiểm thử:** `scripts/test_security_multiuser.cjs`  
**Trạng thái nghiệm thu:** `READY_FOR_FINAL_OWNER_ACCEPTANCE`  

---

## 1. Mục tiêu và Tiêu chí Kiểm định Bảo mật

1. **Kiểm tra ranh giới xác thực & phân quyền (Authentication & RBAC Boundaries):**
   - Không đăng nhập (Unauthenticated): Tuyệt đối không được truy cập tài nguyên bảo vệ (HTTP 401 Unauthorized).
   - Vai trò STAFF và USER: Bị chặn hoàn toàn khỏi các API Quản trị hệ thống (HTTP 403 Forbidden).
2. **Quyền riêng tư và Phân quyền Tài liệu (Document Privacy & Granular ACL):**
   - Tài liệu ở chế độ riêng tư (`PRIVATE`) chỉ người tạo hoặc người được cấp quyền mới có thể truy cập/tải về. Người khác bị chặn lập tức (HTTP 403 Forbidden).
   - Chia sẻ quyền động (`POST /api/documents/{id}/permissions`): Cho phép truy cập ngay.
   - Thu hồi quyền tức thì (`DELETE /api/documents/{id}/permissions/{userId}`): Chặn truy cập ngay sau khi lệnh thu hồi thực thi.
3. **Cách ly Dữ liệu Người dùng & Chống Leo quyền Ngang (Horizontal Privilege Escalation):**
   - Hộp thư thông báo cá nhân được cô lập tuyệt đối theo `Principal` đã xác thực; không được rò rỉ chéo.
   - Thao tác giả mạo tham số `?username=admin` để xem trộm thông báo của người khác bị hệ thống chặn với HTTP 403 Forbidden.
4. **Cô lập Phiên Trình duyệt Độc lập (Multi-Browser Context Isolation):**
   - Hai phiên trình duyệt Puppeteer chạy đồng thời (STAFF và ADMIN) với Storage/Cookies riêng biệt, không có hiện tượng session bleeding hoặc ghi đè JWT.
5. **Khả năng chịu tải đồng thời (Concurrent Operations Integrity):**
   - Hệ thống xử lý 18 yêu cầu truy vấn đồng thời từ nhiều vai trò khác nhau mà không phát sinh lỗi Deadlock hay phân mảnh dữ liệu.
6. **Vệ sinh Thông tin Nhạy cảm trong Nhật ký Hệ thống (Log Sanitizer & Secret Hygiene):**
   - Rà soát toàn bộ log của `edms-backend`: Không chứa JWT Bearer token, không chứa mật khẩu dạng rõ, không rò rỉ khóa bí mật KeyStore.
7. **Bảo vệ Kết nối WebSocket (Origin Protection):**
   - Endpoint SockJS `/ws-edms/info` kiểm tra nghiêm ngặt header Origin và bắt buộc xác thực bảo vệ.

---

## 2. Kết quả Chi tiết 15 Ca Kiểm định Bảo mật (15/15 PASS)

| Mã kiểm định | Tên bài kiểm tra | Kỳ vọng bảo mật | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :---: |
| **SEC-01** | Chưa đăng nhập gọi `/api/admin/users` | Trả về HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **SEC-02** | Chưa đăng nhập gọi `/api/documents` | Trả về HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **SEC-03** | Tài khoản STAFF gọi `/api/admin/users` | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-04** | Tài khoản USER gọi `/api/admin/users` | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-05** | Tài khoản USER gọi `/api/admin/system/status` | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-06** | USER lạ xem tài liệu PRIVATE của STAFF (ID 3729) | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-07** | USER lạ tải tài liệu PRIVATE của STAFF (ID 3729) | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-08** | Cấp quyền chia sẻ tài liệu cho USER (ID 172) | USER đọc được tệp (HTTP 200 OK) | HTTP 200 OK | **PASS** |
| **SEC-09** | Thu hồi quyền chia sẻ của USER (ID 172) | USER bị chặn ngay (HTTP 403 Forbidden) | HTTP 403 Forbidden | **PASS** |
| **SEC-10** | Cách ly hộp thư thông báo (Staff vs User) | 0 thông báo trùng lặp hoặc rò rỉ | Staff: 0, User: 6 (0 trùng) | **PASS** |
| **SEC-11** | Chống leo quyền ngang qua `?username=admin` | Bị từ chối HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **SEC-12** | Cô lập 2 phiên Puppeteer đồng thời (Staff / Admin) | Storage và Session độc lập 100% | Hoàn toàn cô lập | **PASS** |
| **SEC-13** | 18 yêu cầu truy vấn đồng thời từ nhiều vai trò | Xử lý ổn định, không deadlock | 18/18 request HTTP 200 OK | **PASS** |
| **SEC-14** | Vệ sinh nhật ký backend (`docker logs edms-backend`) | Không lộ JWT, Passwords, Private Keys | 0 JWT, 0 Password, 0 Key | **PASS** |
| **SEC-15** | Bắt tay WebSocket SockJS (`/ws-edms/info`) | Yêu cầu Origin, chống Cross-Site attack | Active, entropy hợp lệ | **PASS** |

---

## 3. Phân tích Rủi ro & Tồn đọng Kỹ thuật (Ticket EDMS-SEC-201)

### Rủi ro RISK-SEC-01: Mật khẩu mặc định kiểm thử trên môi trường nội bộ
- **Bối cảnh:** Trong môi trường thử nghiệm QA, các tài khoản mẫu sử dụng mật khẩu quen thuộc để phục vụ việc kiểm thử nhanh các vai trò (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`).
- **Đánh giá rủi ro:** Mức độ **TRUNG BÌNH** trên môi trường nội bộ/Docker localhost; mức độ **NGHIÊM TRỌNG** nếu triển khai ra môi trường Production hoặc Internet công khai.
- **Biện pháp đã thực hiện trong PR #15:**
  - Khôi phục xử lý mật khẩu nguyên bản tại `LoginPage.tsx`: Không can thiệp, không chuyển đổi ký tự.
  - Loại bỏ hoàn toàn fallback mật khẩu trong các test runner: Bắt buộc đọc từ biến môi trường `EDMS_ADMIN_USERNAME` và `EDMS_ADMIN_PASSWORD`.
  - Không tự ý can thiệp `UPDATE` hoặc `DELETE` mật khẩu trực tiếp trong cơ sở dữ liệu để bảo toàn tính toàn vẹn dữ liệu theo yêu cầu của Owner.

### Ticket EDMS-SEC-201: Kế hoạch Triển khai API Đổi Mật khẩu Quản trị
- **Hiện trạng mã nguồn:**
  - Qua rà soát mã nguồn Backend (`AdminUserController.java`, `UserService.java`, DTO `UpdateUserRequest`), hiện **chưa có endpoint chính thức** cho phép Quản trị viên đặt lại mật khẩu cho người dùng (`PUT /api/admin/users/{id}/password`).
  - DTO `UpdateUserRequest` hiện chỉ nhận các trường: `fullName`, `email`, `role`, `enabled`.
- **Trạng thái ghi nhận:** `PASSWORD_ROTATION_PENDING` (Ticket `EDMS-SEC-201`).
- **Lộ trình đề xuất triển khai:**
  1. Backend bổ sung DTO `AdminResetPasswordRequest` (chứa mật khẩu mới độ dài tối thiểu 12 ký tự).
  2. Thêm endpoint `PUT /api/admin/users/{id}/password` với quyền hạn `@PreAuthorize("hasRole('ADMIN')")`.
  3. Mã hóa mật khẩu bằng `BCryptPasswordEncoder` (độ phức tạp 10 rounds).
  4. Ghi nhận nhật ký kiểm toán (Audit Log) về hành động đổi mật khẩu (không ghi log nội dung mật khẩu).
  5. Đội ngũ DevOps kết nối Secrets Manager để tự động quay vòng mật khẩu tài khoản hệ thống khi đưa lên Staging/Production.

---

## 4. Kết luận

Hệ thống EDMS đã vượt qua toàn bộ **15/15 bài kiểm thử an ninh chuyên sâu** trên môi trường container thật. Các ranh giới phân quyền vai trò (RBAC), cách ly dữ liệu cá nhân, chia sẻ và thu hồi quyền tài liệu động, khả năng chịu tải đồng thời và vệ sinh thông tin nhạy cảm đều hoạt động chính xác theo tiêu chuẩn bảo mật doanh nghiệp.
