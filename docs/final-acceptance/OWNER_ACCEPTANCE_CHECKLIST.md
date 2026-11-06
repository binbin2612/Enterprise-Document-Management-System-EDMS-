# BẢNG DANH MỤC KIỂM TRA NGHIỆM THU DÀNH CHO OWNER (OWNER ACCEPTANCE CHECKLIST)

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh giao diện:** `feat/edms-modern-aurora-ui`  
**Nhánh QA kiểm định:** `feat/qa-real-docker-ui`  
**Trạng thái bàn giao:** `READY_FOR_FINAL_OWNER_ACCEPTANCE`  

---

## 1. Hướng dẫn Truy cập Môi trường Kiểm thử Đang Hoạt động

Các container EDMS hiện đang chạy ổn định trên Docker Desktop máy cục bộ để phục vụ Owner trực tiếp thao tác và đánh giá:

- **Giao diện người dùng (Frontend):** [http://localhost:5173](http://localhost:5173)
- **Cổng API dịch vụ (Backend):** [http://localhost:8080](http://localhost:8080)
- **Tài liệu API Swagger/OpenAPI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Cơ sở dữ liệu PostgreSQL:** `localhost:5432` (Database: `edms_db`, User: `edms_user`)

### Tài khoản kiểm thử môi trường QA nội bộ

> **Bảo mật:** Không công bố mật khẩu kiểm thử trên repository hoặc tài liệu nộp công khai. Thông tin đăng nhập phải được cung cấp qua kênh nội bộ an toàn; chỉ chạy trên môi trường Docker QA được cho phép. Việc đổi mật khẩu vẫn **chưa hoàn tất** theo ticket `EDMS-SEC-201` (`PASSWORD_ROTATION_PENDING`). Không đem tài khoản QA vào môi trường Internet công khai.

| Vai trò | Tài khoản mẫu QA | Nguồn mật khẩu |
| :--- | :--- | :--- |
| Quản trị viên (`ROLE_ADMIN`) | `admin` | Cung cấp nội bộ; không lưu trong Git |
| Chuyên viên (`ROLE_STAFF`) | `staff` | Cung cấp nội bộ; không lưu trong Git |
| Người dùng (`ROLE_USER`) | `user` | Cung cấp nội bộ; không lưu trong Git |

**Đối soát khi nghiệm thu:** Tại commit `43bea99`, Backend enum `Role.java` định nghĩa **ba** vai trò trên. Thống kê 3.663 tài liệu trong checklist là snapshot QA; biên bản bàn giao mới nêu 3.667 và phải kiểm tra SQL trước khi dùng trong báo cáo cuối. Xem [bảng đối soát HUFLIT](../report-huflit/REPORT_FACTCHECK_2026-11-06.md).
---

## 2. Danh mục 8 Nhóm Tính năng Cốt lõi Cần Nghiệm thu

### Nhóm 1: Xác thực & Đăng nhập (Authentication)
- [ ] **1.1. Giao diện Đăng nhập Modern Aurora:** Truy cập `http://localhost:5173`, kiểm tra bảng đăng nhập, hiệu ứng chuyển màu Aurora gradient mượt mà, căn giữa hoàn hảo.
- [ ] **1.2. Kiểm tra mật khẩu sai:** Nhập sai mật khẩu, kiểm tra thông báo lỗi tiếng Việt hiển thị rõ ràng từ Backend ("Tên đăng nhập hoặc mật khẩu không chính xác").
- [ ] **1.3. Đăng nhập ADMIN thành công:** Đăng nhập với tài khoản `admin`, kiểm tra hệ thống chuyển hướng vào giao diện chính mà không phát sinh lỗi console.
- [ ] **1.4. Đăng xuất:** Nhấp nút Đăng xuất trên thanh điều hướng, kiểm tra xóa JWT token và quay về trang đăng nhập.

### Nhóm 2: Quản lý Người dùng & Phân quyền RBAC (Users & Roles)
- [ ] **2.1. Danh sách Người dùng:** Truy cập menu "Quản lý người dùng", kiểm tra bảng hiển thị đầy đủ các cột (ID, Tên đăng nhập, Họ và tên, Email, Vai trò, Trạng thái).
- [ ] **2.2. Modal Thêm Người dùng mới:** Nhấp "Thêm người dùng mới", kiểm tra hiển thị hộp thoại Modern Aurora, có đầy đủ 3 vai trò: `ROLE_USER`, `ROLE_STAFF`, `ROLE_ADMIN`.
- [ ] **2.3. Ràng buộc mật khẩu:** Nhập mật khẩu dưới 6 ký tự, kiểm tra thông báo nhắc nhở tuân thủ quy chuẩn Backend.
- [ ] **2.4. Phân quyền STAFF/USER:** Đăng nhập bằng `staff` hoặc `user`, xác nhận menu "Quản trị người dùng" bị ẩn; nếu gõ trực tiếp URL `/users` thì được chuyển hướng an toàn về `/documents`.

### Nhóm 3: Quản lý & Tải lên Tài liệu (Document Management)
- [ ] **3.1. Danh mục Tài liệu:** Kiểm tra danh sách hiển thị tên tài liệu, loại tài liệu, kích thước, người tạo, ngày tạo và nhãn trạng thái.
- [ ] **3.2. Modal Tải lên (UploadModal):** Nhấp nút "Tải lên tài liệu", kiểm tra vùng kéo thả (Dropzone) và các trường thông tin.
- [ ] **3.3. Kiểm tra chặn tệp quá khổ:** Thử tải tệp dung lượng > 20MB, kiểm tra hệ thống từ chối ngay tại giao diện.
- [ ] **3.4. Kiểm tra chặn định dạng nguy hiểm:** Thử kéo thả tệp `.exe`, kiểm tra giao diện cảnh báo định dạng không hỗ trợ.
- [ ] **3.5. Tải lên tệp hợp lệ:** Thử tải lên một tệp `.pdf` hoặc `.png`, kiểm tra thông báo tải lên thành công và danh sách tự động cập nhật.
- [ ] **3.6. Xem chi tiết & Tải xuống:** Nhấp nút xem chi tiết tài liệu và tải tệp về máy, kiểm tra tệp mở bình thường.

### Nhóm 4: Trung tâm Công việc & Luồng Phê duyệt (Task Center & Workflow)
- [ ] **4.1. Thẻ chỉ số KPI Công việc:** Truy cập menu "Công việc", kiểm tra 4 thẻ KPI thống kê (Tổng số công việc, Chờ xử lý, Đang thực hiện, Đã hoàn thành).
- [ ] **4.2. Bảng Tác vụ:** Kiểm tra danh sách công việc phân bổ rõ ràng theo mức độ ưu tiên và hạn chót.
- [ ] **4.3. Thao tác Phê duyệt / Từ chối:** Thử nhấp duyệt một tác vụ đang chờ xử lý, kiểm tra trạng thái cập nhật mượt mà.

### Nhóm 5: Trung tâm Thông báo Modern Aurora (Notification Center)
- [ ] **5.1. Mở Panel Thông báo:** Nhấp biểu tượng Chuông thông báo trên thanh tiêu đề, kiểm tra bảng thông báo trượt ra nhẹ nhàng với bóng đổ chuẩn Aurora.
- [ ] **5.2. Bộ lọc thông báo:** Nhấp các nút lọc (Tất cả, Chưa đọc, Quan trọng), kiểm tra danh sách lọc tương ứng.
- [ ] **5.3. Đánh dấu đã đọc:** Nhấp nút "Đánh dấu tất cả là đã đọc", kiểm tra số đếm thông báo chưa đọc trở về 0.

### Nhóm 6: Dashboard Phân tích & Bố cục 3 Hàng (Dashboard Redesign)
- [ ] **6.1. Hàng 1 — 4 Thẻ KPI:** Kiểm tra chiều cao đồng đều, chỉ số số liệu to rõ, biểu tượng tương ứng (Tổng tài liệu, Người dùng hoạt động, Dung lượng lưu trữ, Tác vụ đang chờ).
- [ ] **6.2. Hàng 2 — Phân loại & Tần suất:** 
  - Cột trái: Phân loại tài liệu dạng thanh tiến trình, kiểm tra các loại tài liệu dài có hiển thị dấu ba chấm (...) và tooltip khi rê chuột.
  - Cột phải: Tần suất sử dụng tài liệu và tóm tắt dung lượng.
- [ ] **6.3. Hàng 3 — Lịch sử Hoạt động gần đây:** Kiểm tra bảng nhật ký thao tác thời gian thực, nhãn hành vi tiếng Việt rõ nghĩa, kiểu dáng phẳng hiện đại.

### Nhóm 7: Giao diện Sáng/Tối & Khả năng Tương thích (Theme & Responsive)
- [ ] **7.1. Chế độ Tối (Dark Mode):** Nhấp nút chuyển đổi giao diện Sáng / Tối trên thanh điều hướng, kiểm tra toàn bộ Dashboard, Bảng người dùng, Tài liệu và Panel thông báo chuyển sang nền tối tương phản cao, chữ dễ đọc, không chói mắt.
- [ ] **7.2. Tương thích Màn hình lớn (Desktop 1440x900):** Bố cục hiển thị cân đối, không có khoảng trống bất hợp lý.
- [ ] **7.3. Tương thích Laptop (1366x768):** Không xuất hiện thanh cuộn ngang toàn trang (No horizontal scroll).
- [ ] **7.4. Tương thích Di động (Mobile 390x844):** Thu nhỏ cửa sổ trình duyệt về kích thước điện thoại, kiểm tra thanh điều hướng tự động co gọn, các thẻ KPI tự động xếp chồng dọc.

### Nhóm 8: Độ bền Dữ liệu & An toàn Bảo mật (Data Resilience & Security)
- [ ] **8.1. Kiểm tra không mất dữ liệu:** Toàn bộ 3,663 tài liệu và 172 người dùng trong cơ sở dữ liệu mẫu được bảo toàn 100%.
- [ ] **8.2. Ranh giới Phân quyền chặt chẽ:** Đã xác minh qua 15 bài kiểm thử bảo mật tự động đạt 15/15 PASS.
- [ ] **8.3. Cơ chế Khôi phục Thảm họa:** Bản sao lưu `database.dump` và thư mục lưu trữ đã được kiểm định phục hồi thành công trên cổng độc lập 15432 / 18080 với mã SHA-256 trùng khớp tuyệt đối.

---

## 3. Xác nhận Nghiệm thu của Owner

- **Đại diện Kiểm định QA:** Senior Full-Stack QA Engineer — *Đã hoàn tất kiểm định tự động và thực nghiệm*  
- **Đại diện Nghiệm thu (Owner):** ___________________________  
- **Ngày nghiệm thu:** _____ / _____ / 2026  
- **Kết luận:**
  - [ ] **CHẤP THUẬN NGHIỆM THU (APPROVED):** PR #15 và các kết quả nâng cấp giao diện Modern Aurora đạt yêu cầu chất lượng.
  - [ ] **YÊU CẦU ĐIỀU CHỈNH THÊM:** __________________________________________________
