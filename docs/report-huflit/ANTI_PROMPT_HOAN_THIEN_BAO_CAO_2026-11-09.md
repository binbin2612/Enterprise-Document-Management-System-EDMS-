# PROMPT GỬI ANTIGRAVITY — HOÀN THIỆN EDMS VÀ BÁO CÁO HUFLIT

Tiếp tục công việc tại `F:\DoAn_CNPMNC`, repository `hieuvo123ab-rgb/DoAn_CNPMNC`, nhánh `docs/huflit-factcheck-20261106`. Đọc commit mới nhất và kiểm tra `git status` trước khi làm. Không làm mất bất kỳ tệp cục bộ nào.

**Chỉ đạo mới nhất của chủ dự án:**
- Giao diện và lời mô tả phải ngắn, tiếng Việt tự nhiên, sát chương trình thật. Không chèn ghi chú AI, tên chức năng hoa mỹ, nội dung quảng cáo hoặc những chức năng không có.
- **Không cần vẽ hoặc chèn diagram/UML.** Không làm .mdj, Gantt hoặc ERD.
- Chỉ hoàn thiện những mục **cô đã yêu cầu**, gồm đặc biệt trang bìa có **logo HUFLIT thật** và trang **LỜI CẢM ƠN GIẢNG VIÊN**.
- Không bịa tên giảng viên, mã lớp, rubric, hoặc tự nhận một định dạng là chuẩn bắt buộc của cô khi chưa có mẫu.

## Công việc

1. Đọc `docs/report-huflit/LUONG_HOAT_DONG_THUC_TE.md`, `WORD_FINAL_REQUIREMENTS_2026-11-08.md`, `FEATURE_SOURCE_AUDIT_2026-11-07.md`. Chỉ dùng các luồng đã kiểm chứng bằng mã nguồn.
2. Kiểm tra 3 thay đổi nhãn UI vừa push: LoginPage dùng “Nhập mật khẩu”; DocumentsPage dùng “Tìm kiếm kết hợp”; UsersPage dùng “Quyền của từng vai trò”. Chạy kiểm thử/frontend build trên máy cục bộ; nếu có lỗi, báo cụ thể, không tự sửa nghiệp vụ.
3. Xem đề bài và mẫu giảng viên có sẵn trong dự án hoặc do chủ dự án cung cấp. Nếu không có, lập danh sách thông tin còn thiếu thay vì tự đoán.
4. Mở `docs/report-huflit/BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx` (nếu có) và giữ nguyên bản gốc. Tạo phiên bản mới `BAO_CAO_EDMS_HUFLIT_HoanThien.docx`.
5. Bìa Word: chèn **logo HUFLIT chính thức** từ mẫu của trường hoặc website `sta.huflit.edu.vn/assets/web/images/huflit-logo.png`, giữ nguyên tỷ lệ; ghi tên trường, học phần, tên đề tài EDMS, nhóm thực hiện và giảng viên theo nguồn thực.
6. Lời cảm ơn: viết ngắn 2–3 đoạn, cảm ơn giảng viên và HUFLIT, giọng văn nhóm sinh viên. Chỉ điền tên cô khi đã xác minh.
7. Nội dung: trình bày ngắn dựa trên `LUONG_HOAT_DONG_THUC_TE.md`. Giữ những ảnh sản phẩm có giá trị, chỉ đưa số liệu snapshot ngày 06/11/2026 như số liệu kiểm thử; không dùng câu “78/78 đã xác minh” khi ma trận còn chưa được đối chiếu xong.
8. Rà lại toàn bộ DOCX: bố cục A4, logo, dấu tiếng Việt, mục lục, số trang, ảnh, tên thành viên và giảng viên; tách các ghi chú kỹ thuật/chờ duyệt khỏi **bản Word nộp cô**. Xuất PDF để xem thử và kiểm tra từng trang.
9. Tạo bảng đối chiếu yêu cầu cô: **Đạt / Chưa có thông tin / Không yêu cầu**. Bàn giao bản Word, bản PDF, danh sách tệp đã sửa, kết quả build và thông tin còn chờ xác minh.

## Giới hạn

Không đổi chức năng backend, không xóa/refactor nghiệp vụ, không ghi dữ liệu PostgreSQL, không sửa KeyStore/secret, không deploy Railway, không merge PR #14/#15/#16, không tự đưa tài liệu nhị phân hoặc ZIP lên GitHub. Chỉ commit thay đổi tài liệu đã được kiểm tra trên nhánh hiện tại và để PR #16 ở Draft.

**Đầu ra:** Báo cáo Word rõ ràng, gọn, có logo HUFLIT và lời cảm ơn; frontend build chạy được; không có diagram; không thông tin bịa.
