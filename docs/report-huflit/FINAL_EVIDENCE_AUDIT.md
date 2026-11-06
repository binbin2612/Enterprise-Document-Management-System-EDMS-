# BÁO CÁO TỔNG KẾT ĐỐI SOÁT & KIỂM CHỨNG MINH CHỨNG SẢN PHẨM EDMS (HUFLIT)
## HỒ SƠ CHÍNH THỨC DÀNH CHO HỘI ĐỒNG BẢO VỆ VÀ CHỦ DỰ ÁN

- **Hệ thống:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử Doanh nghiệp
- **Đơn vị đào tạo:** Khoa Công nghệ Thông tin — Trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT)
- **Môn học:** Công nghệ phần mềm nâng cao (CNPMNC)
- **Kho lưu trữ mã nguồn (Repository):** [`hieuvo123ab-rgb/DoAn_CNPMNC`](https://github.com/hieuvo123ab-rgb/DoAn_CNPMNC)
- **Nhánh làm việc & đối soát:** `docs/huflit-factcheck-20261106` (gốc từ PR #15 commit `43bea99`)
- **Môi trường đối soát:** Docker Compose 3 containers (`edms-frontend`, `edms-backend`, `edms-postgres`)
- **Thời điểm chốt dữ liệu (Timestamp):** `2026-11-06 14:23:14 UTC` (`21:23:14 +07:00`)
- **Trạng thái an ninh & bảo mật:** Tuân thủ giới hạn an toàn tuyệt đối (Không UPDATE/DELETE PostgreSQL, Không đổi KeyStore, Không merge PR tự động).

---

## 1. TIẾP NHẬN & KIỂM CHỨNG GÓI TỆP `EDMS_HUFLIT_PRODUCT_EVIDENCE.zip`

Tệp nén minh chứng đặt tại thư mục gốc dự án đã được tiếp nhận, giải nén và kiểm tra mã băm SHA-256 độc lập:

- **Đường dẫn tệp nén:** `F:\DoAn_CNPMNC\EDMS_HUFLIT_PRODUCT_EVIDENCE.zip`
- **Dung lượng tệp:** `2.489.921 bytes` (~2.49 MB)
- **Mã băm toàn vẹn SHA-256:** `7698DC7C1B615EDB4C5B90D0CA732E352D5A0196AD3EDBF9277E7331E20AA981`
- **Tính đầy đủ của gói bàn giao:** **PASS** (100% khớp danh mục yêu cầu gồm 14 ảnh PNG và các tệp đối soát).

### Bảng Kiểm Tra Chi Tiết 14 Ảnh Chụp Màn Hình Minh Chứng Thực Tế

| Tên Tệp Ảnh | Dung Lượng | Độ Phân Giải | Mã Băm SHA-256 | Màn Hình / Chức Năng Xác Minh | Đánh Giá Tính Chân Thực |
| :--- | :---: | :---: | :--- | :--- | :---: |
| `01_dang_nhap.png` | 554.093 B | 1440 × 900 | `13E7AEDD7FF0B2F7F7E7AA4587CA4DC9B235B14CAD87EC52B915FBA6B5480CB5` | Trang đăng nhập hệ thống EDMS Modern Aurora, JWT login | **PASS** (Giao diện thật, không mock) |
| `02_quan_ly_tai_lieu.png` | 101.160 B | 1440 × 900 | `FB70ED0140CB629CABBA4CBF9E9CB976FA42CEB954EB657CCAD0525FD8379D28` | Danh sách 3.667 hồ sơ tài liệu, bộ lọc loại/trạng thái | **PASS** (Dữ liệu thật từ PostgreSQL) |
| `03_tai_tai_lieu.png` | 166.835 B | 1440 × 900 | `63849296A84C3A9F7850AC04A11C18FAA4A72262C421B81EDB17EA88D237C4D8` | Hộp thoại tải lên tệp tin multipart và nhập metadata | **PASS** (Modal React thật) |
| `04_tim_kiem_ai.png` | 129.345 B | 1440 × 900 | `287248F91E17D3652330101B9F81A04B05CC141F24078866FC093E148A4823D8` | Tìm kiếm ngữ nghĩa AI ONNX, điểm Cosine thực tế 0.8510 | **PASS** (Mô hình ONNX cục bộ hoạt động) |
| `05_xet_duyet.png` | 187.676 B | 1440 × 900 | `A564BD759EC1A3A908259A7AB04643894FCB20F59EBDE494655B7C6703818B40` | Hàng đợi công việc và xét duyệt tài liệu (1.277 hồ sơ) | **PASS** (Dữ liệu quy trình thực tế) |
| `06_dashboard.png` | 153.707 B | 1440 × 900 | `8731AE5765BDAC1483D9065776D03532E12F4860B3EF8A9F15DF2452230CD23B` | Bảng điều khiển KPI, biểu đồ phân bổ loại hồ sơ | **PASS** (Đồng bộ Modern Aurora) |
| `07_nguoi_dung.png` | 195.045 B | 1440 × 900 | `0A83ADB6696EF82B5FD735929759572F51E5842D4311529ACD9E8E9A90BEDD12` | Quản trị 172 tài khoản người dùng, phân quyền RBAC | **PASS** (Bảng người dùng thực tế) |
| `08_kiem_toan_thong_bao.png` | 218.799 B | 1440 × 900 | `AD4F5930BA418AE68AB0E9795B80AB0C1838900170BB93662E05E8E7FF94A73D` | Bảng 19.697 nhật ký kiểm toán + 2.394 thông báo hệ thống | **PASS** (Audit trail & Realtime panel) |
| `10_phien_ban_tai_lieu.png` | 146.753 B | 1440 × 900 | `36E2621BC8239A07FE15A8D312014629CA3E4B5F747172A61B19CC8756640360` | Lịch sử 4.830 phiên bản, băm SHA-256, khôi phục | **PASS** (Version management thật) |
| `11_chia_se_phan_quyen.png` | 168.029 B | 1440 × 900 | `3B54DD210F13D8058509851C6E49FF59BB9352EF952D64754797681213EE5A3F` | Cấp và thu hồi quyền chia sẻ tài liệu cấp ACL (417 ACLs) | **PASS** (Dynamic ACL controls) |
| `12_xem_truoc_chu_ky_so.png` | 98.839 B | 1440 × 900 | `D4A1EFFDA9782C5AA2DA85D799A680E60A5447D84FBCBCDFF90C73B6D52688A0` | Xem trước PDF trực tuyến và huy hiệu chữ ký số RSA-2048 | **PASS** (Canvas render & signature badge) |
| `13_hang_doi_tieu_huy.png` | 148.425 B | 1440 × 900 | `13E6327FE423C431AD2B9C27755E22BE457C2AAAE3790DABB9FD912B6DC8190A` | Hàng đợi tiêu hủy tài liệu hết hạn lưu trữ (391 hồ sơ) | **PASS** (Retention & disposition queue) |
| `14_trang_thai_he_thong.png` | 170.131 B | 1440 × 900 | `83EF8CCCCCA8FDA6992C88AFFA2D125400F6BB876BB39DD5E264DBA9E0BA2BEE` | Giám sát sức khỏe hệ thống (DB, Disk, AI ONNX, OCR) | **PASS** (Actuator health indicators) |
| `15_xac_thuc_cong_khai.png` | 73.469 B | 1440 × 900 | `10944FC66673F2335A20E24B49C639D9524DBBE63F264C99F21BB09D35113E02` | Cổng tra cứu xác minh chữ ký số công khai độc lập (`/verify`) | **PASS** (Public verify portal) |

---

## 2. KẾT QUẢ ĐỐI SOÁT TRUY VẤN SQL CHỈ ĐỌC (`READ_ONLY_VERIFICATION.sql`)

Các câu lệnh SQL truy vấn trực tiếp trên container `edms-postgres` lúc **14:23:14 UTC ngày 06/11/2026** (Transaction `READ ONLY`) đã giải quyết dứt điểm các nghi vấn về số liệu:

### 2.1. Giải trình chênh lệch số lượng tài liệu (3.663 vs 3.667) và phiên bản (4.826 vs 4.830)
- **Hiện tượng:** Báo cáo QA checklist trước đây ghi nhận `3.663 tài liệu` và `4.826 phiên bản`. Biên bản bàn giao mới ghi nhận `3.667 tài liệu` và `4.830 phiên bản` (+4 tài liệu / +4 phiên bản).
- **Kết quả điều tra SQL:** Truy vấn bảng `documents` với `ORDER BY id DESC` chỉ rõ:
  - Tài liệu ID 3726: `Staff_Private_1793947723088` (tạo lúc 06:48:43 UTC ngày 06/11 bởi `staff`)
  - Tài liệu ID 3727: `Staff_Private_1793947779718` (tạo lúc 06:49:39 UTC ngày 06/11 bởi `staff`)
  - Tài liệu ID 3728: `Staff_Private_1793947837113` (tạo lúc 06:50:37 UTC ngày 06/11 bởi `staff`)
  - Tài liệu ID 3729: `Staff_Private_1793947936116` (tạo lúc 06:52:16 UTC ngày 06/11 bởi `staff`)
- **Kết luận:** Chênh lệch đúng **4 tài liệu** là do việc chạy bộ kiểm thử tự động phân quyền chuyên viên (`test_showcase_runner.cjs`) trên container live sau mốc chụp QA ban đầu. Cả 2 con số đều chính xác tương ứng với 2 mốc thời gian trước và sau test run. Không có số liệu nào bị bịa đặt.

### 2.2. Giải trình 56 bản ghi xét duyệt chưa phân loại
- **Hiện tượng:** Biên bản cũ chỉ nêu: 212 PENDING + 816 APPROVED + 193 REJECTED = 1.221 bản ghi, thiếu 56 bản ghi so với tổng số 1.277.
- **Kết quả truy vấn SQL:**
  ```sql
  SELECT status, count(*) FROM document_reviews GROUP BY status;
  ```
  - `APPROVED`: 816
  - `PENDING`: 212
  - `REJECTED`: 193
  - **`SUPERSEDED`: 56**
- **Kết luận:** Chính xác toàn bộ **56 bản ghi** này thuộc trạng thái `SUPERSEDED` (yêu cầu xét duyệt đã bị thay thế tự động do tác giả tải lên phiên bản tài liệu mới hơn trước khi yêu cầu cũ được duyệt).

### 2.3. Giải trình 164 bản ghi tiêu hủy chưa phân loại
- **Hiện tượng:** Biên bản cũ chỉ nêu: 56 PENDING + 171 APPROVED = 227 bản ghi, thiếu 164 bản ghi so với tổng số 391.
- **Kết quả truy vấn SQL:**
  ```sql
  SELECT status, count(*) FROM document_dispositions GROUP BY status;
  ```
  - `APPROVED`: 171
  - **`CANCELLED`: 83**
  - **`REJECTED`: 81**
  - `PENDING`: 56
- **Kết luận:** 164 bản ghi còn lại gồm **83 bản ghi `CANCELLED`** (Admin quyết định hủy yêu cầu tiêu hủy, giữ lại hồ sơ) và **81 bản ghi `REJECTED`** (Admin từ chối đề xuất tiêu hủy). Tổng số 4 trạng thái khớp chính xác 391.

### 2.4. Xác nhận 3 vai trò người dùng thực tế
- Backend enum `Role.java` và React page `UsersPage.tsx` chỉ định nghĩa đúng 3 vai trò:
  - `ROLE_STAFF`: **168 tài khoản**
  - `ROLE_ADMIN`: **3 tài khoản**
  - `ROLE_USER`: **1 tài khoản**
- Tổng cộng: **172 tài khoản**. Tuyệt đối không có `ROLE_MANAGER` hay `ROLE_AUDITOR`.

---

## 3. TỔNG KẾT ĐỐI SOÁT 78 CHỨC NĂNG

Hồ sơ đối soát kỹ thuật tại [`FEATURE_INVENTORY.csv`](file:///f:/DoAn_CNPMNC/docs/report-huflit/FEATURE_INVENTORY.csv) và [`FEATURE_CORRECTIONS.csv`](file:///f:/DoAn_CNPMNC/docs/report-huflit/FEATURE_CORRECTIONS.csv) ghi nhận:

- **Tổng số chức năng kiểm kê:** 78 chức năng.
- **`LIVE_VERIFIED`:** **51 chức năng (65.4%)** — Có ảnh chụp UI thực tế 1440x900 + API endpoint phản hồi thành công + dữ liệu bảng PostgreSQL thật.
- **`CODE_VERIFIED`:** **27 chức năng (34.6%)** — Đã hiện thực đầy đủ trong mã nguồn Controller / Service / Repository / Component, kiểm thử qua API/E2E runner nhưng không có ảnh chụp giao diện riêng biệt.
- **`UNVERIFIED`:** **0 chức năng** — Không có chức năng nào bị thiếu mã nguồn.
- **`DOC_ONLY` (Chỉ có tài liệu):** **0 chức năng** — Toàn bộ đều đã chuyển đổi thành mã nguồn hoạt động.

---

## 4. XÁC MINH CÔNG NGHỆ NÂNG CAO & BẢO MẬT

1. **AI Semantic Vector Search (ONNX Runtime):**
   - Mô hình cục bộ: `multilingual-e5-small-onnx-int8-v1` (118MB `model.onnx`, 17MB `tokenizer.json` tại `/app/models/multilingual-e5-small-onnx-int8`).
   - Vector: 384 dimensions.
   - Trạng thái kiểm tra live qua `/api/health`: `"semanticModel": "AVAILABLE"`.
   - Kết quả truy vấn thử nghiệm: Cosine similarity score đạt **0.8510**, cờ `"semanticMatched": true`.
   - Bảng cơ sở dữ liệu: 411 bản ghi trong `document_semantic_chunks`. Hoạt động 100% offline, không gọi API Internet bên ngoài.
2. **Tesseract OCR 4.1.1:**
   - Cài đặt trong container `edms-backend`, gói ngôn ngữ `vie` + `eng`.
   - Có **211 phiên bản tài liệu** có trạng thái `ocr_status = READY` với nội dung văn bản trích xuất hoàn chỉnh.
3. **Chữ ký số PKI RSA:**
   - Thuật toán `SHA256withRSA`, lưu trong Java KeyStore PKCS#12 tại runtime path mặc định: `/app/keys/edms-signing.p12`.
   - Chứng chỉ X.509 v3 là chứng chỉ **tự ký (self-signed)** của hệ thống, không phải chứng thư do CA công cộng cấp.
   - Có **447 phiên bản tài liệu** đã ký số xác thực trong cơ sở dữ liệu. Cổng tra cứu công khai độc lập tại `/verify` hoạt động bình thường.
4. **Vấn đề an ninh mở (Open Risk):**
   - Ticket `EDMS-SEC-201` (`PASSWORD_ROTATION_PENDING`): Ghi nhận kế hoạch xoay vòng mật khẩu quản trị nội bộ sau nghiệm thu demo. Mật khẩu kiểm thử được bảo mật, không đưa vào tài liệu công khai.

---

## 5. ĐỐI SOÁT KẾ HOẠCH & TIẾN ĐỘ (LAB 1 VS NHÓM ĐỒ ÁN)

1. **Phân định 2 sinh viên Lab 1 (Workbook Product Backlog):**
   - 26 User Stories, 79 Story Points, 4 Sprints (Mô hình cuốn chiếu 60/40):
     - Võ Trọng Hiếu: 47 SP (59.5%)
     - Tạ Gia Tín: 32 SP (40.5%)
     - Tổng cộng: 79 SP (100% hoàn thành).
2. **Phân định 5 chuyên trách Đồ án Nhóm:**
   - Võ Trọng Hiếu: Trưởng nhóm & BA
   - Trần Quyền Minh: Backend Lead
   - Nguyễn Quốc Huy: Frontend Developer
   - Viên Bảo Đức: System Analyst / UML Designer
   - Đinh Thanh Tùng: Database Administrator & DevOps
3. **Biểu đồ Gantt MS Project:**
   - Hồ sơ ghi nhận báo cáo tiến độ tuần `BC1_00.docx` đến `BC4_00.docx` đầy đủ.
   - **Tệp MS Project gốc (.mpp) chưa tìm thấy trong repository.** Báo cáo phản ánh trung thực tình trạng này, không tạo biểu đồ giả mạo bằng AI.

---

## 6. KẾT LUẬN NGHIỆM THU ĐỐI SOÁT

| Hạng mục kiểm tra | Tiêu chuẩn đánh giá | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Gói minh chứng ZIP** | Đầy đủ 14 ảnh PNG 1440x900 + 5 tài liệu, đúng SHA-256 | Đã kiểm tra tệp 2.46MB, hash khớp, 14 ảnh thật | **PASS** |
| **Xác minh SQL chỉ đọc** | Trích xuất thời gian, tên DB, bảng đếm, phân bổ trạng thái | Snapshot `14:23:14 UTC 06/11`, edms_db, 10 bảng | **PASS** |
| **Khớp vai trò RBAC** | Chỉ sử dụng 3 vai trò thực tế (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`) | Đã hiệu đính 100% danh mục và ma trận | **PASS** |
| **Khớp trạng thái quy trình** | Đầy đủ 4 trạng thái review và 4 trạng thái disposition | Review: 816/212/193/56; Disp: 171/83/81/56 | **PASS** |
| **Tính chân thực mã nguồn** | Không có chức năng giả lập, mô tả đúng X.509 self-signed | KeyStore `/app/keys/edms-signing.p12`, ONNX offline | **PASS** |
| **Trạng thái an ninh mở** | Ghi nhận ticket `EDMS-SEC-201`, giấu mật khẩu QA | Tuân thủ an toàn thông tin | **PASS** |

**KẾT LUẬN CHUNG:** Toàn bộ hồ sơ minh chứng, số liệu thống kê và tài liệu thiết kế đã được hiệu đính đồng bộ **1:1 với mã nguồn và dữ liệu thực tế tại commit `43bea99`**. Hồ sơ hoàn toàn đủ điều kiện tin cậy phục vụ báo cáo và bảo vệ đồ án trước Hội đồng chấm thi HUFLIT.
