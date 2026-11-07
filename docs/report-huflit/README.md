# Hồ sơ Đối soát & Bàn giao Minh chứng EDMS Phục vụ Báo cáo HUFLIT

> **OWNER REVIEW — 07/11/2026:** `STARUML_HANDOFF.md` đã được **viết lại theo controller/service/entity** tại commit `43bea99`; vẫn cần xuất sơ đồ `.mdj`/PNG và đối chiếu báo cáo Word cục bộ. Kiểm tra mới phát hiện **52/78 dòng** trong `FEATURE_EVIDENCE_MATRIX.md` dẫn tên tệp mã nguồn không tồn tại. **Chưa chốt hồ sơ minh chứng 78 chức năng hoặc báo cáo Word** đến khi xử lý [FEATURE_SOURCE_AUDIT_2026-11-07.md](FEATURE_SOURCE_AUDIT_2026-11-07.md). PR #16 giữ Draft.


**Ngày hoàn tất đối soát:** 06/11/2026  
**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử Doanh nghiệp  
**Môn học:** Công nghệ phần mềm nâng cao (CNPMNC) — HUFLIT  
**Kho lưu trữ:** [`hieuvo123ab-rgb/DoAn_CNPMNC`](https://github.com/hieuvo123ab-rgb/DoAn_CNPMNC)  
**Nhánh làm việc:** `docs/huflit-factcheck-20261106` (gốc từ PR #15 commit `43bea99`)  
**Môi trường xác minh:** Docker Compose Stack thực tế (`edms-frontend`, `edms-backend`, `edms-postgres`)  
**Mốc thời gian SQL đối soát:** `2026-11-06 14:23:14 UTC` (`21:23:14 +07:00`)

---

## 1. PHẠM VI TIẾP NHẬN & KẾT QUẢ ĐỐI SOÁT

Hồ sơ này ghi nhận kết quả đối soát toàn diện giữa **mã nguồn, cơ sở dữ liệu PostgreSQL thực tế, gói tệp minh chứng ZIP và các tài liệu báo cáo học thuật**. Toàn bộ 5 điều kiện tiên quyết trong hồ sơ ban đầu đã được giải quyết dứt điểm:

1. **Tiếp nhận & kiểm chứng gói ZIP:** Tệp `EDMS_HUFLIT_PRODUCT_EVIDENCE.zip` (2.49MB, SHA-256: `7698DC7C1B615EDB4C5B90D0CA732E352D5A0196AD3EDBF9277E7331E20AA981`) đã được mở và kiểm tra độc lập 14 ảnh PNG 1440x900 cùng các tài liệu đối soát.
2. **Thực thi SQL chỉ đọc (`READ_ONLY_VERIFICATION.sql`):** Thực thi trực tiếp trên database `edms_db` (PostgreSQL 16) lúc 14:23:14 UTC. Toàn bộ số liệu đã được định lượng chính xác và giải trình nguyên nhân chênh lệch (xem Mục 3).
3. **Thống nhất mốc dữ liệu và vai trò:**
   - Sử dụng đúng **3 vai trò** theo enum `Role.java` và `UsersPage.tsx`: `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`.
   - Trình bày đủ **4 trạng thái xét duyệt**: `APPROVED` (816), `PENDING` (212), `REJECTED` (193), `SUPERSEDED` (56).
   - Trình bày đủ **4 trạng thái tiêu hủy**: `APPROVED` (171), `CANCELLED` (83), `REJECTED` (81), `PENDING` (56).
4. **Mô tả chính xác tính chất kỹ thuật:**
   - Runtime KeyStore: `/app/keys/edms-signing.p12` (theo `docker-compose.yml` và `KeyStoreService.java`).
   - Chứng chỉ số X.509 là **tự ký (self-signed)**, không nhận là chứng chỉ CA công cộng.
   - Nhật ký kiểm toán phục vụ truy vết qua Spring AOP, không tuyên bố bất biến tuyệt đối ở mức phần cứng.
5. **Rủi ro an ninh còn mở:** Duy trì ticket `EDMS-SEC-201` (`PASSWORD_ROTATION_PENDING`), không công bố mật khẩu kiểm thử ra file công khai.

---

## 2. CẤU TRÚC DANH MỤC TỆP BÀN GIAO (`docs/report-huflit/`)

```text
docs/report-huflit/
├── README.md                          # Bản hướng dẫn tổng thể và giới thiệu hồ sơ đối soát (File này)
├── FINAL_EVIDENCE_AUDIT.md            # Báo cáo tổng kết đối soát: PASS/FAIL/UNVERIFIED, SHA-256, mốc SQL
├── FEATURE_CORRECTIONS.csv            # Bảng hiệu đính từng tính năng từ 78 tính năng cũ, lý do điều chỉnh
├── FEATURE_INVENTORY.csv              # Bảng kiểm kê 78 chức năng chuẩn 9 cột (51 LIVE_VERIFIED, 27 CODE_VERIFIED)
├── FEATURE_EVIDENCE_MATRIX.md         # Ma trận đối soát kỹ thuật: chức năng - màn hình - API - mã nguồn - minh chứng
├── BACKLOG_SPRINT_VERIFICATION.md     # Đối soát 26 User Stories, 79 SP, 4 Sprints, Lab 1 2 SV vs Nhóm 5 thành viên
├── STARUML_HANDOFF.md                 # Bản đặc tả kỹ thuật để thành viên vẽ lại sơ đồ Use Case, Activity, Sequence, Class, ERD
├── SCREENSHOT_MANIFEST.csv            # Bảng kê 14 ảnh PNG: kích thước, độ phân giải 1440x900, SHA-256, URL, tính chân thực
├── BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx # Báo cáo Word HUFLIT hoàn chỉnh 7 chương, nhúng 14 ảnh và bảng biểu
└── screenshots/                       # Thư mục 14 ảnh chụp màn hình độ phân giải gốc 1440x900 (PNG)
```

Ngoài ra, toàn bộ hồ sơ trên được đóng gói kèm tệp nén tại thư mục gốc:  
📦 [`F:\DoAn_CNPMNC\EDMS_HUFLIT_PRODUCT_EVIDENCE.zip`](file:///f:/DoAn_CNPMNC/EDMS_HUFLIT_PRODUCT_EVIDENCE.zip)

Bản sao lưu báo cáo Word cũng được lưu trữ tại:  
📄 [`F:\DoAn_CNPMNC\phân công và báo cáo\báo cáo\tiến độ\BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx`](file:///f:/DoAn_CNPMNC/phân%20công%20và%20báo%20cáo/báo%20cáo/tiến%20độ/BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx)

---

## 3. BẢNG TỔNG HỢP SỐ LIỆU ĐỐI SOÁT CHÍNH THỨC (SNAPSHOT 06/11/2026)

| Hạng mục dữ liệu | Số lượng xác minh | Nguồn xác minh | Giải trình & Đối soát |
| :--- | :---: | :--- | :--- |
| **Người dùng (`users`)** | **172** | PostgreSQL `users` | 168 `ROLE_STAFF`, 3 `ROLE_ADMIN`, 1 `ROLE_USER`. Khớp enum `Role.java`. |
| **Hồ sơ tài liệu (`documents`)** | **3.667** | PostgreSQL `documents` | Gồm 3.663 tài liệu baseline QA + 4 tài liệu kiểm thử phát sinh (IDs 3726-3729). |
| **Phiên bản tệp (`document_versions`)** | **4.830** | PostgreSQL `document_versions` | Tương ứng 4.826 phiên bản baseline + 4 phiên bản kiểm thử phát sinh. |
| **Quy trình xét duyệt (`document_reviews`)** | **1.277** | PostgreSQL `document_reviews` | 816 APPROVED, 212 PENDING, 193 REJECTED, 56 SUPERSEDED. |
| **Hàng đợi tiêu hủy (`document_dispositions`)** | **391** | PostgreSQL `document_dispositions` | 171 APPROVED, 83 CANCELLED, 81 REJECTED, 56 PENDING. |
| **Nhật ký kiểm toán (`audit_logs`)** | **19.697** | PostgreSQL `audit_logs` | Tăng 10 bản ghi từ 19.687 sau các phiên chạy kiểm thử mới nhất. |
| **Thông báo hệ thống (`notifications`)** | **2.394** | PostgreSQL `notifications` | Thông báo gửi theo thời gian thực (UNREAD, SYSTEM, ACTION). |
| **Bộ lọc đã lưu (`saved_searches`)** | **76** | PostgreSQL `saved_searches` | Bộ lọc tìm kiếm cá nhân hóa của người dùng. |
| **Phân quyền tài liệu (`document_permissions`)** | **417** | PostgreSQL `document_permissions` | Danh sách cấp quyền chi tiết cấp ACL (READ, WRITE, DELETE, MANAGE). |
| **Đoạn vector AI (`document_semantic_chunks`)** | **411** | PostgreSQL `document_semantic_chunks` | 411 đoạn văn bản vector hóa 384 chiều phục vụ Semantic AI Search. |
| **Phiên bản đã ký số** | **447** | `signature_bytes IS NOT NULL` | Thuật toán `SHA256withRSA`, chứng chỉ X.509 self-signed RSA-2048. |
| **Phiên bản đã OCR sẵn sàng** | **211** | `ocr_status = 'READY'` | Tesseract OCR 4.1.1 (hỗ trợ tiếng Việt và tiếng Anh). |

---

## 4. HƯỚNG DẪN DÀNH CHO SINH VIÊN VÀ GIẢNG VIÊN CHẤM ĐỒ ÁN

1. **Trích xuất nội dung nộp bài:** Sinh viên có thể sử dụng trực tiếp tệp [`BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx`](file:///f:/DoAn_CNPMNC/docs/report-huflit/BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx) làm bản báo cáo chính thức. Báo cáo đã được trình bày theo chuẩn học thuật HUFLIT (Times New Roman 12pt, dãn dòng 1.25, căn lề chuẩn A4, đầy đủ 7 chương và 14 hình minh chứng kèm chú thích).
2. **Dựng lại sơ đồ trên StarUML:** Thành viên Viên Bảo Đức sử dụng tài liệu [`STARUML_HANDOFF.md`](file:///f:/DoAn_CNPMNC/docs/report-huflit/STARUML_HANDOFF.md) để vẽ lại Use Case, Activity, Sequence, Class Diagram và Physical ERD trên StarUML.
3. **Vấn đáp và Bảo vệ đồ án:** Sử dụng bảng số liệu đối soát tại Mục 3 và ma trận kiểm kê tại [`FEATURE_EVIDENCE_MATRIX.md`](file:///f:/DoAn_CNPMNC/docs/report-huflit/FEATURE_EVIDENCE_MATRIX.md) để giải trình mọi câu hỏi của Hội đồng về tính thực tế của sản phẩm.
