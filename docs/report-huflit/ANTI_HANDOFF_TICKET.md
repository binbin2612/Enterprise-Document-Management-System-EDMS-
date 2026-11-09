# Bàn giao Anti — chốt báo cáo Word HUFLIT theo yêu cầu giảng viên

> **CHỈ ĐẠO MỚI 09/11/2026:** Xem [ANTI_PROMPT_HOAN_THIEN_BAO_CAO_2026-11-09.md](ANTI_PROMPT_HOAN_THIEN_BAO_CAO_2026-11-09.md) (bản giao việc ngắn nhất), [LUONG_HOAT_DONG_THUC_TE.md](LUONG_HOAT_DONG_THUC_TE.md) và [BAO_CAO_TOM_TAT_EDMS_2026-11-09.md](BAO_CAO_TOM_TAT_EDMS_2026-11-09.md). Chỉ rà báo cáo Word, giao diện và bằng chứng; **không diagram**. Các mục trước đây về vẽ UML không còn hiệu lực cho lần bàn giao này.


**Chỉ đạo mới nhất của chủ dự án (08/11/2026):** **Không cần diagram/UML** trong lần chỉnh sửa này. Ưu tiên **đúng những yêu cầu của cô**, **logo HUFLIT**, **Lời cảm ơn giảng viên**, và kiểm tra hình thức báo cáo trước khi nộp.

Đọc và thực hiện đầy đủ: **[WORD_FINAL_REQUIREMENTS_2026-11-08.md](WORD_FINAL_REQUIREMENTS_2026-11-08.md)**. Tài liệu này **thay thế** các yêu cầu cũ về việc vẽ StarUML, .mdj, Physical ERD hay thêm các chương sơ đồ trong Word. Tài liệu UML cũ được lưu làm tham khảo kỹ thuật nhưng không nằm trong phạm vi đầu ra.

**Thực hiện:** 
1. Kiểm tra `git status` và tìm đề bài, mẫu/bảng yêu cầu thật của cô trong hồ sơ cục bộ. Không tự đặt ra tiêu chuẩn cô chưa giao.
2. Chỉnh bản **Word cục bộ** hiện có, giữ bản gốc; trình bày trang bìa đẹp, chèn **logo HUFLIT thật**, ghi đúng tên đề tài/học phần/giảng viên nếu tìm thấy thông tin đáng tin cậy.
3. Thêm trang **LỜI CẢM ƠN** ngắn, lịch sự, mang giọng văn của sinh viên; không bịa tên giảng viên. Nếu chưa có tên, đánh dấu chờ xác minh.
4. Chỉ giữ nội dung/ảnh/bảng thực sự cần thiết theo mẫu cô. Bỏ yêu cầu tạo/chèn Use Case, Activity, Sequence, Class, ERD, Gantt, mô hình .mdj và các hạng mục ngoài đề.
5. Rà nội dung sai hiển nhiên và các mô tả có cảnh báo trong `FEATURE_SOURCE_AUDIT_2026-11-07.md`; không nâng kết luận nghiệm thu hoặc bịa chức năng. Giữ mốc dữ liệu SQL đã báo cáo.
6. Xuất bản DOCX mới và PDF kiểm tra bản in; kiểm tra ảnh logo, số trang, mục lục, chính tả, chữ tiếng Việt, trang trắng, lề và bố cục theo **mẫu giảng viên nếu có**.
7. Bàn giao Word, PDF, bảng checklist đối chiếu mẫu cô và danh sách thông tin còn thiếu. Không làm thêm diagram.

**An toàn:** Không sửa mã nguồn/DB/KeyStore, không deploy, không merge PR #14/#15/#16, không ghi đè Word gốc; không đẩy file binary/ZIP lên GitHub nếu chưa được phép.

**Trạng thái:** `WORD_FINALIZATION_ONLY` — chờ kiểm chứng tên giảng viên và yêu cầu cô trước khi nộp.
