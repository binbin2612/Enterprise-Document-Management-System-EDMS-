# CÁC LUỒNG HOẠT ĐỘNG CHÍNH CỦA EDMS

**Học phần:** Công nghệ phần mềm nâng cao — HUFLIT  
**Đối chiếu mã nguồn:** commit `43bea99` (nhánh `feat/edms-modern-aurora-ui`)  
**Ngày rà soát:** 09/11/2026

Tài liệu này trình bày cách sử dụng và xử lý nghiệp vụ thật của chương trình. Không phải sơ đồ UML.

## 1. Đăng nhập và phân quyền

Người dùng nhập tài khoản, mật khẩu → giao diện gửi `POST /api/auth/login` → backend kiểm tra giới hạn đăng nhập và xác thực → trả JWT và vai trò → giao diện mở các chức năng được phép.

Hệ thống có **3 vai trò**: `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`. Ngoài vai trò, quyền đối với tài liệu còn được kiểm tra qua chủ sở hữu và ACL.

**Đăng xuất:** `POST /api/auth/logout` ghi nhật ký; phía giao diện bỏ thông tin đăng nhập. Không mô tả refresh token hay blacklist JWT vì mã nguồn được kiểm tra chưa có các cơ chế đó.

**Nguồn:** `AuthController.java`, `AuthService.java`, `LoginResponse.java`, `SecurityConfig.java`, `Role.java`.

## 2. Quản lý tài liệu và phiên bản

Người được phép chọn tệp, nhập thông tin → gửi `POST /api/documents` → hệ thống lưu tệp và bản ghi tài liệu/phiên bản → trả kết quả cho giao diện. Các tác vụ trích xuất nội dung, OCR và lập chỉ mục ngữ nghĩa được thực hiện theo trạng thái xử lý của từng phiên bản.

Khi cần sửa nội dung tệp, người dùng có quyền gửi `POST /api/documents/{id}/versions`. Hệ thống tạo phiên bản mới và giữ lịch sử. Có thể xem lại bằng `GET /api/documents/{id}/versions`, tải từng phiên bản hoặc khôi phục bằng `POST /api/documents/{id}/versions/{versionNumber}/restore`.

**Nguồn:** `DocumentController.java`, `DocumentService.java`, `DocumentVersion.java`.

## 3. Tìm kiếm tài liệu

Người dùng nhập từ khóa, chọn chế độ → gọi `GET /api/documents` với các tham số `q`, `searchMode`, `topK` khi cần.

- **LEXICAL:** tìm theo thông tin tài liệu và bộ lọc.
- **SEMANTIC:** lọc các tài liệu được phép truy cập, lấy vector từ phiên bản đã lập chỉ mục, tính độ tương đồng cosine bằng Java rồi trả kết quả.
- **HYBRID:** phối hợp tìm kiếm từ khóa và ngữ nghĩa.

Chỉ trả tài liệu mà tài khoản có quyền xem.

**Nguồn:** `DocumentController.java`, `SemanticSearchService.java`, `HybridSearchService.java`, `LocalEmbeddingService.java`.

## 4. Xét duyệt tài liệu

Người dùng có quyền sửa gửi `POST /api/documents/{id}/review` → hệ thống tạo yêu cầu **PENDING** → quản trị viên xem hàng đợi và **APPROVED** hoặc **REJECTED**, kèm nhật ký/thông báo.

Nếu phiên bản mới được tải lên trong lúc yêu cầu cũ đang chờ, yêu cầu cũ chuyển sang **SUPERSEDED**. Hệ thống **không tự tạo một yêu cầu xét duyệt mới** nếu người dùng chưa gửi.

**Nguồn:** `DocumentReviewController.java`, `AdminReviewController.java`, `DocumentReviewService.java`.

## 5. Lưu trữ và tiêu hủy

Tài liệu được lưu trữ và đủ thời hạn, không bị giữ lại vì lý do pháp lý, không còn xét duyệt đang chờ → chủ tài liệu hoặc quản trị viên đủ quyền gửi yêu cầu tiêu hủy `POST /api/documents/{id}/disposition` → trạng thái **PENDING**.

Quản trị viên phê duyệt hoặc từ chối. Khi phê duyệt, trạng thái tài liệu thành **DISPOSED**. Đây là **tiêu hủy logic**, không xóa tệp vật lý. Yêu cầu chờ cũng có thể thành **CANCELLED** khi bị hủy hoặc tài liệu trở lại trạng thái hoạt động.

**Nguồn:** `DocumentDispositionController.java`, `AdminDispositionController.java`, `DocumentDispositionService.java`, `LifecycleStatus.java`.

## 6. Ký và xác minh tài liệu

Chủ tài liệu hoặc quản trị viên chọn phiên bản hợp lệ → `POST /api/documents/{id}/versions/{vn}/sign` → hệ thống kiểm tra quyền, trạng thái và mã băm tệp → ký bằng **SHA256withRSA** → lưu chữ ký cùng phiên bản.

Người nhận có thể xác minh qua `GET /api/public/verify` hoặc tải tệp lên bằng `POST /api/public/verify-file`. Chứng chỉ X.509 của hệ thống là **tự ký**, không phải chứng chỉ do tổ chức CA công cộng cấp.

**Nguồn:** `DocumentIntegrityController.java`, `SignatureService.java`, `PublicVerificationController.java`, `KeyStoreService.java`.

## Ghi chú trình bày báo cáo

Chỉ giữ 6 luồng trên bằng văn bản ngắn và hình minh chứng phù hợp. **Không tạo/chèn Use Case, Activity, Sequence, Class, ERD hay sơ đồ tự vẽ** vì chủ dự án đã xác nhận không cần. Không đưa chức năng thiếu mã nguồn vào phần đã hoàn thành (tham khảo `FEATURE_SOURCE_AUDIT_2026-11-07.md`). Báo cáo phải ưu tiên đề/mẫu thật của giảng viên.
