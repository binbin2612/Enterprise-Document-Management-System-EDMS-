# BÁO CÁO ĐỒ ÁN RÚT GỌN — HỆ THỐNG EDMS

**Trường:** Đại học Ngoại ngữ – Tin học TP. Hồ Chí Minh (HUFLIT)  
**Học phần:** Công nghệ phần mềm nâng cao  
**Đề tài:** Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử Doanh nghiệp (EDMS)  
**Ngày tổng hợp:** 09/11/2026  
**Mã nguồn tham chiếu:** PR #15, commit `43bea99`

> Bản Markdown này là nội dung tóm tắt để đối chiếu báo cáo Word. Bản Word có trang bìa và lời cảm ơn. **Không chèn diagram/UML**. Chỉ dùng những phần giảng viên thực sự yêu cầu; tên giảng viên và file logo chính thức cần được hoàn tất từ mẫu gốc trước khi nộp.

## LỜI CẢM ƠN

Nhóm chúng em xin chân thành cảm ơn Trường Đại học Ngoại ngữ – Tin học TP. Hồ Chí Minh và quý thầy cô đã tạo điều kiện cho nhóm thực hiện đồ án học phần Công nghệ phần mềm nâng cao. Nhóm đặc biệt cảm ơn giảng viên phụ trách đã hướng dẫn, góp ý trong quá trình xây dựng hệ thống EDMS. Những nhận xét đó giúp nhóm hiểu rõ hơn cách phân tích yêu cầu, phát triển phần mềm và phối hợp công việc. Nhóm mong tiếp tục nhận được góp ý để hoàn thiện sản phẩm.

## 1. Giới thiệu

EDMS giúp lưu tài liệu điện tử, phân quyền người dùng, theo dõi phiên bản, tìm kiếm và xử lý các yêu cầu xét duyệt, tiêu hủy. Hệ thống được xây dựng với React/TypeScript, Java Spring Boot, PostgreSQL và Docker Compose.

## 2. Các luồng chính

1. **Đăng nhập:** Người dùng nhập tài khoản và mật khẩu. Backend xác thực, trả JWT và vai trò để giao diện mở quyền phù hợp.
2. **Lưu tài liệu:** Người có quyền tải tệp và nhập thông tin; hệ thống lưu tài liệu, phiên bản và nhật ký. Khi cập nhật, phiên bản cũ vẫn được lưu lại.
3. **Tìm kiếm:** Người dùng chọn từ khóa hoặc tìm kiếm ngữ nghĩa; kết quả chỉ bao gồm tài liệu tài khoản được phép xem.
4. **Xét duyệt:** Gửi yêu cầu cho phiên bản hiện tại; quản trị viên phê duyệt hoặc từ chối. Yêu cầu cũ có thể chuyển `SUPERSEDED` khi có phiên bản mới.
5. **Tiêu hủy:** Người đủ quyền gửi yêu cầu cho tài liệu đã lưu trữ và hết hạn; quản trị viên phê duyệt hoặc từ chối. Nếu duyệt, trạng thái chuyển `DISPOSED` theo nghiệp vụ, **không xóa tệp vật lý**.
6. **Ký số:** Chủ tài liệu hoặc quản trị viên ký phiên bản hợp lệ bằng SHA256withRSA. Cổng tra cứu công khai hỗ trợ kiểm tra chữ ký và tính toàn vẹn.

Tham chiếu API và điều kiện xử lý cụ thể xem `LUONG_HOAT_DONG_THUC_TE.md`.

## 3. Kết quả thử nghiệm

Theo biên bản SQL của nhóm lúc **21:23:14 ngày 06/11/2026 (UTC+7)**, môi trường `edms_db` có:

| Dữ liệu | Số lượng |
| --- | ---: |
| Người dùng | 172 |
| Tài liệu | 3.667 |
| Phiên bản | 4.830 |
| Yêu cầu xét duyệt | 1.277 |
| Yêu cầu tiêu hủy | 391 |

Đây là **dữ liệu kiểm thử theo biên bản Anti**, không phải số liệu sản xuất hoặc truy vấn mới của người tổng hợp.

Hồ sơ bàn giao có danh sách 14 ảnh màn hình. Bản Word chỉ chèn ảnh khi có file gốc và yêu cầu cụ thể từ giảng viên; không thay bằng hình tạo mới.

## 4. Kết luận

EDMS đã xây dựng các nghiệp vụ quản lý tài liệu, quyền truy cập, phiên bản, tìm kiếm, xét duyệt và xác minh chữ ký. Nhóm tiếp tục rà soát sự tương ứng giữa danh mục chức năng, mã nguồn và bằng chứng trước khi công bố kết quả nghiệm thu cuối cùng.

**Phạm vi nộp bài:** Báo cáo Word, trang bìa logo HUFLIT, lời cảm ơn, nội dung đúng đề của cô. **Không có diagram**.

**Lưu ý kiểm chứng:** `FEATURE_SOURCE_AUDIT_2026-11-07.md` chỉ ra 52/78 dòng của ma trận dẫn ít nhất một tên file không tồn tại trong commit chuẩn. Không diễn giải các tên file đó thành chức năng chưa triển khai, nhưng cũng không khẳng định `78/78` đã kiểm chứng.
