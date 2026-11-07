# Ticket Anti — Kiểm chứng minh chứng EDMS và cập nhật báo cáo HUFLIT

> **ƯU TIÊN P0 MỚI — OWNER REVIEW 07/11/2026:** Bản `STARUML_HANDOFF.md` đã được chủ dự án **viết lại theo mã nguồn** để làm cơ sở vẽ tiếp. Nhiệm vụ Anti tiếp theo là đối chiếu **52/78 dòng có tệp nguồn không tồn tại** và các chức năng/API sai trong [FEATURE_SOURCE_AUDIT_2026-11-07.md](FEATURE_SOURCE_AUDIT_2026-11-07.md), sửa cả ma trận/kiểm kê/Word. Không khẳng định 78/78 LIVE/CODE khi chưa kiểm chứng toàn bộ; không đưa chức năng chưa có code vào báo cáo hoàn tất. Chốt `.mdj`/PNG và Word sau khi đối chiếu, giữ PR #16 Draft.


**Bối cảnh:** Chủ dự án là BA/Project Lead; nhóm đồ án HUFLIT 5 thành viên. Repository: `hieuvo123ab-rgb/DoAn_CNPMNC`. Mã nguồn tham chiếu: `feat/edms-modern-aurora-ui` (PR #15), HEAD đã đối soát `43bea99cc2804ec661dc3fde331c4a0ddbf14a44`. Nhánh riêng chứa đính chính: `docs/huflit-factcheck-20261106`.

## Phạm vi bắt buộc

1. Mở thư mục làm việc **`F:\DoAn_CNPMNC`**. Trước mọi thao tác, ghi nhận `git status`, nhánh hiện tại và commit. Nếu có thay đổi chưa commit: **không stash, không reset, không ghi đè**; báo lại owner.
2. Đọc `docs/report-huflit/README.md`, `REPORT_FACTCHECK_2026-11-06.md` và `READ_ONLY_VERIFICATION.sql` từ nhánh `docs/huflit-factcheck-20261106`. Không sửa trực tiếp `main`, `feat/edms-modern-aurora-ui` hoặc `feat/edms-ui-consistency-final`; không merge PR #14/#15, không Railway.
3. Kiểm tra thực tế gói **`EDMS_HUFLIT_PRODUCT_EVIDENCE.zip`** trong thư mục dự án. Xác minh dung lượng, SHA-256 của ZIP, cấu trúc, **14 PNG 1440×900 và 5 tài liệu** (`README.md`, `FEATURE_INVENTORY.csv`, `FEATURE_EVIDENCE_MATRIX.md`, `BACKLOG_SPRINT_VERIFICATION.md`, `SCREENSHOT_MANIFEST.csv`). Lập bảng file–byte–hash–kích thước ảnh; kiểm tra từng ảnh là kết quả giao diện thật, không ảnh mock. Nếu thiếu tệp hay nội dung không khớp thì ghi **CHƯA XÁC MINH**, không tự bù.
4. Đọc đủ 78 dòng kiểm kê; đối chiếu **từng mục** với màn hình, API Backend, mã nguồn và ảnh. Tách `LIVE_VERIFIED`, `CODE_VERIFIED`, `DOC_ONLY`, `UNVERIFIED`; không sao chép nhãn `78/78 LIVE_VERIFIED` nếu thiếu chứng cứ. Đặc biệt kiểm tra Semantic AI ONNX, OCR, chữ ký RSA, cổng `/verify`, quyền ACL.
5. Chạy **chỉ truy vấn SELECT** từ `docs/report-huflit/READ_ONLY_VERIFICATION.sql` trên đúng `edms_db` đang được sử dụng để demo. Ghi lại thời gian, tên DB, kết quả và lệnh/đường dẫn bằng chứng. Không chạy UPDATE/DELETE/INSERT/DDL; không tác động data Docker/KeyStore. Nếu không truy cập được DB, ghi chưa xác minh, không suy đoán.
6. Sửa báo cáo HUFLIT Word và các tài liệu Markdown/CSV liên quan cho thống nhất **một mốc dữ liệu**. Dữ kiện từ mã nguồn phải dùng: **3 vai trò** `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER` (không sử dụng ROLE_MANAGER/ROLE_AUDITOR khi thiếu nguồn); `ReviewStatus` có PENDING/APPROVED/REJECTED/SUPERSEDED; `DispositionStatus` có PENDING/APPROVED/REJECTED/CANCELLED. Số liệu 3.663/4.826 ở QA và 3.667/4.830 ở bàn giao **không được tự chọn**; xác nhận SQL trước. 56 review và 164 disposition còn thiếu phân loại không được suy ra toàn bộ một trạng thái.
7. Runtime KeyStore mặc định: `/app/keys/edms-signing.p12`; nếu tài liệu nói `edms-keystore.p12` phải phân biệt rõ tên bản backup và đường dẫn runtime; **không mở, đổi, sao chép public private key hoặc thay file KeyStore**. Certificate X.509 **self-signed**, không quảng cáo là chứng thư pháp lý CA. Audit trail dùng để truy vết, không tự khẳng định bất biến tuyệt đối.
8. Kiểm tra Word theo template HUFLIT hiện có. Chèn 14 ảnh tại đúng mục, đánh số hình/chú thích chuẩn, kích thước dễ đọc. Làm mục kiến trúc–Use Case–Activity–Sequence–Class–ERD rõ ràng, đầy đủ **theo code thật**. Nếu thiếu diagram, bàn giao bảng ký hiệu/actor, bước xử lý, guard, API và quan hệ dữ liệu để thành viên dựng bằng StarUML. **Không bịa luồng, bảng DB, test hoặc biểu đồ Gantt .mpp gốc**.
9. Giữ rõ hai phân công: **Lab 1 hai sinh viên Võ Trọng Hiếu 47 SP / Tạ Gia Tín 32 SP (79 SP, 26 user stories, 4 sprint)**; **đồ án nhóm 5 người** Võ Trọng Hiếu (lead/BA), Trần Quyền Minh (Backend), Nguyễn Quốc Huy (Frontend), Viên Bảo Đức (UML), Đinh Thanh Tùng (DB/DevOps). Không gộp các phần phân công thành 1 nhóm.
10. Báo cáo rủi ro còn mở: `EDMS-SEC-201 PASSWORD_ROTATION_PENDING`; thông tin mật khẩu QA **không xuất hiện trong file công khai**. Nếu phát hiện mật khẩu hiện trong lịch sử Git hoặc PR cũ, ghi cảnh báo an toàn và đề xuất owner thay đổi theo quy trình riêng; không sửa DB.
11. Trước khi push tài liệu, đọc diff; không thêm binary nặng/ZIP vào Git nếu chưa được owner phê duyệt, không để lộ secret. Đẩy **chỉ các thay đổi tài liệu đã đối soát** lên nhánh `docs/huflit-factcheck-20261106`, không tạo merge tự động. Nếu phải sửa runtime/code thì ghi issue/ticket riêng để owner duyệt, không tự triển khai.

## Sản phẩm bàn giao

- `docs/report-huflit/FINAL_EVIDENCE_AUDIT.md`: các hạng mục PASS/FAIL/UNVERIFIED, danh sách file và mốc dữ liệu.
- `docs/report-huflit/FEATURE_CORRECTIONS.csv`: từng tính năng đã kiểm chứng, vị trí mã nguồn, API, ảnh liên quan; ghi rõ lý do nếu khác hồ sơ cũ.
- Báo cáo Word HUFLIT mới (tên có hậu tố `_DaDoiSoat`), bản cũ giữ nguyên.
- `docs/report-huflit/STARUML_HANDOFF.md`: sơ đồ thiếu, actor, quan hệ, luồng chính/ngoại lệ, traceability.
- Danh sách cảnh báo có mức độ ưu tiên (đặc biệt role, snapshot, password rotation).
- Bản tổng kết ngắn cho owner: file đã tạo/sửa, commit, log kiểm chứng, vấn đề chờ owner; rõ **không có thao tác ghi DB/merge PR**.

**Nguyên tắc:** Chỉ kết luận đạt khi có minh chứng. Dùng tiếng Việt tự nhiên, học thuật, ngắn gọn; không chèn ghi chú AI hoặc văn phong quảng cáo vào báo cáo.
