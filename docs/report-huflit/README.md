# Hồ sơ đối soát minh chứng EDMS phục vụ báo cáo HUFLIT

**Ngày lập:** 06/11/2026  
**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử Doanh nghiệp  
**Môn học:** Công nghệ phần mềm nâng cao — HUFLIT  
**Repository:** `hieuvo123ab-rgb/DoAn_CNPMNC`

## 1. Phạm vi và trạng thái

Thư mục này ghi nhận kết quả đối soát **tài liệu và mã nguồn trên nhánh** `feat/edms-modern-aurora-ui` tại commit `43bea99cc2804ec661dc3fde331c4a0ddbf14a44`. Đây **không** phải biên bản chạy lại toàn bộ kiểm thử, truy vấn trực tiếp cơ sở dữ liệu hay nghiệm thu cuối cùng của chủ dự án.

- [Bảng đối soát dữ kiện cho báo cáo](REPORT_FACTCHECK_2026-11-06.md).
- [SQL kiểm tra chỉ đọc](READ_ONLY_VERIFICATION.sql).
- Báo cáo QA gốc: [FINAL_QA_REPORT.md](../final-acceptance/FINAL_QA_REPORT.md).
- Ma trận ca kiểm thử: [TEST_CASE_MATRIX.csv](../final-acceptance/TEST_CASE_MATRIX.csv).
- Kiến trúc và hiện trạng cần đối chiếu: [docs/final-evidence](../final-evidence/).

## 2. Gói minh chứng cục bộ cần tiếp nhận

Theo biên bản bàn giao từ nhóm, gói `F:\DoAn_CNPMNC\EDMS_HUFLIT_PRODUCT_EVIDENCE.zip` gồm 14 ảnh PNG (1440×900) và 5 tài liệu: `README.md`, `FEATURE_INVENTORY.csv`, `FEATURE_EVIDENCE_MATRIX.md`, `BACKLOG_SPRINT_VERIFICATION.md`, `SCREENSHOT_MANIFEST.csv`.

**Chưa xác minh trên GitHub:** Tại commit được đối soát, thư mục `docs/report-huflit/` chưa tồn tại; gói ZIP và ảnh chụp cục bộ chưa được mở/kiểm tra độc lập trong lần đối soát này. Không ghi `78/78 LIVE_VERIFIED` là kết quả kiểm thử mới chỉ từ biên bản bàn giao.

## 3. Quy tắc cập nhật báo cáo và UML

1. Mỗi con số trong Word/Slide phải có ngày chốt và nguồn xác minh (SQL `SELECT`, log kiểm thử, ảnh chụp, commit hoặc file kiểm kê).
2. Dùng **3 vai trò** theo mã nguồn `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`; không viết `ROLE_MANAGER` hoặc `ROLE_AUDITOR` khi chưa có bằng chứng từ bản triển khai khác.
3. Trình bày đủ 4 trạng thái xét duyệt và 4 trạng thái yêu cầu tiêu hủy; **không tự suy ra số lượng từng trạng thái còn thiếu**.
4. Nêu chứng chỉ X.509 là **tự ký (self-signed)**; không khẳng định hiệu lực pháp lý của chứng thư CA công cộng.
5. Không dùng cách diễn đạt “audit log bất biến tuyệt đối” nếu chưa chứng minh cơ chế bất biến ở mức hệ thống/lưu trữ.
6. Sơ đồ Use Case, Activity, Sequence, Class, ERD phải phù hợp API, service và entity trên cùng commit; vẽ lại bằng StarUML khi chốt bản cuối.
7. Tách biệt phân công Lab 1 (2 sinh viên, 79 SP) và nhóm đồ án (5 thành viên); không đánh đồng tiến độ Lab 1 với toàn bộ phạm vi sản phẩm.
8. Không sửa mã nguồn nghiệp vụ, không thay dữ liệu, không tự thay KeyStore/secret, không merge PR #14/#15 hay triển khai Railway trong đợt đối soát tài liệu.

## 4. Điều kiện để chốt nghiệm thu

- Tiếp nhận và kiểm tra toàn bộ nội dung ZIP cục bộ (số tệp, hash, 14 ảnh, liên kết giữa ảnh và chức năng).
- Thực thi truy vấn trong `READ_ONLY_VERIFICATION.sql` trên đúng PostgreSQL của phiên bản demo (tài khoản chỉ đọc nếu có).
- Khóa mốc dữ liệu và chỉnh nhất quán tất cả số liệu xuất hiện trong Word/Slide.
- Đánh dấu rõ ràng các hạn chế còn mở, đặc biệt `EDMS-SEC-201` (đổi mật khẩu quản trị).
- Chủ dự án nghiệm thu các phần đã đủ chứng cứ; hồ sơ này không thay thế bước nghiệm thu đó.
