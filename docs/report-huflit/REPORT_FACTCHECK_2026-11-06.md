# Đối soát thông tin báo cáo EDMS — 06/11/2026

**Mốc mã nguồn:** `43bea99cc2804ec661dc3fde331c4a0ddbf14a44` (HEAD của PR #15 tại thời điểm đối soát).  
**Phạm vi:** Đọc mã nguồn, tài liệu và ma trận kiểm thử trên GitHub; **không** chạy hệ thống cục bộ hoặc xác minh ZIP/DB mới.  
**Nguồn mô tả cần đối chiếu:** Báo cáo bàn giao `EDMS_HUFLIT_PRODUCT_EVIDENCE.zip` do nhóm cung cấp.

## A. Kết quả có căn cứ từ mã nguồn và tài liệu

| Mục | Nguồn kiểm tra | Kết luận và cách ghi đúng |
| --- | --- | --- |
| Vai trò RBAC | `backend/src/main/java/com/edms/entity/Role.java`; `frontend/src/pages/UsersPage.tsx` | **3 vai trò**: `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`. Chưa có `ROLE_MANAGER`, `ROLE_AUDITOR` trong enum và lựa chọn giao diện đã xem. |
| Trạng thái xét duyệt | `backend/src/main/java/com/edms/entity/ReviewStatus.java`; `DocumentReviewService.java` | `PENDING`, `APPROVED`, `REJECTED`, `SUPERSEDED`. `SUPERSEDED` phát sinh khi yêu cầu đang chờ được thay thế bởi phiên bản mới. |
| Trạng thái yêu cầu tiêu hủy | `backend/src/main/java/com/edms/entity/DispositionStatus.java`; `DocumentDispositionService.java` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`. |
| Đường dẫn KeyStore lúc chạy | `docker-compose.yml`; `KeyStoreService.java` | Runtime mặc định `/app/keys/edms-signing.p12`. Tên `edms-keystore.p12` trong báo cáo khác với đường dẫn runtime; có thể là tên bản sao lưu, cần kiểm tra trước khi thay thế cách ghi. |
| Chứng chỉ ký | `KeyStoreService.java` | X.509 v3 **self-signed**, RSA-2048, SHA256withRSA, lưu PKCS#12; **không** nhận là chứng chỉ do CA công cộng cấp. |
| Kết quả QA đã ghi nhận | `docs/final-acceptance/TEST_CASE_MATRIX.csv` | **31 dòng ca kiểm thử**: 12 `VISUAL_PASS`, 7 `INTEGRATION_PASS`, 12 `E2E_PASS`. Đây là kết quả được tài liệu QA ghi lại, không phải kết quả vừa chạy lại. |
| Rủi ro còn tồn tại | `docs/final-acceptance/FINAL_QA_REPORT.md`; `SECURITY_TEST_REPORT.md` | `EDMS-SEC-201`: `PASSWORD_ROTATION_PENDING`. Không diễn đạt là đã giải quyết; không công bố mật khẩu QA trong báo cáo công khai. |

## B. Các số liệu cần xác minh bằng truy vấn mới

| Mục | Báo cáo QA trong repo | Biên bản bàn giao mới | Hướng xử lý |
| --- | ---: | ---: | --- |
| Số người dùng | 172 | 172 | Đối chiếu `COUNT(*)` và `GROUP BY role`; lưu thời điểm đo. |
| Số tài liệu | 3.663 | 3.667 | Có chênh **4 tài liệu**; chưa rõ do phát sinh sau mốc QA hay sai số. |
| Số phiên bản | 4.826 | 4.830 | Có chênh **4 phiên bản**; chưa rõ do phát sinh sau mốc QA hay sai số. |
| Số yêu cầu xét duyệt | Chưa dùng cùng mốc snapshot | 1.277 | Tổng 3 trạng thái được nêu: 212 + 816 + 193 = **1.221**; còn **56 bản ghi** chưa được phân loại trong biên bản. Có trạng thái `SUPERSEDED`, **chưa chứng minh 56 đều thuộc trạng thái này**. |
| Số yêu cầu tiêu hủy | Chưa dùng cùng mốc snapshot | 391 | Hai trạng thái được nêu: 56 + 171 = **227**; còn **164 bản ghi** chưa được phân loại. `REJECTED` và `CANCELLED` cần truy vấn số lượng riêng. |

Báo cáo cũ `docs/final-evidence/03_DATABASE_SCHEMA_SUMMARY.md` có snapshot **21 users / 49 documents**; không sử dụng các số liệu đó làm mốc dữ liệu cho bản báo cáo ngày 06/11. Tài liệu này hữu ích để đọc lịch sử cấu trúc, nhưng cần đối chiếu entity/migration mới nhất trước khi đưa ERD và Data Dictionary vào bản cuối.

## C. Các tuyên bố chưa được đối soát trực tiếp

- `78/78 LIVE_VERIFIED` trên 14 phân hệ: **cần đọc `FEATURE_INVENTORY.csv` và ma trận evidence trong ZIP**. Không suy ra từ 31 ca QA.
- 14 ảnh PNG 1440×900: **cần giải nén và xem từng ảnh, so với URL/chức năng thực tế**.
- AI Semantic Search (384 chiều, score 0.8510), OCR tiếng Việt và số lượng phiên bản đã ký: số liệu trong biên bản **cần evidence/API/SQL tương ứng**.
- Kiểm thử “0 console error”, backup/restore, 15/15 security: có **báo cáo mô tả** trong repo; để khẳng định vừa chạy lại phải có log hoặc lần thực thi mới.
- Tệp MS Project `.mpp`: chưa có bằng chứng file gốc; không tự tái tạo rồi nhận là tệp gốc.

## D. Đoạn nội dung đề xuất cho báo cáo Word

> EDMS được xây dựng với React/TypeScript ở giao diện, Spring Boot/Java 21 ở tầng dịch vụ và PostgreSQL ở tầng dữ liệu, vận hành trong Docker Compose. Hệ thống thực hiện xác thực bằng JWT và phân quyền theo ba vai trò ADMIN, STAFF, USER, kết hợp quyền truy cập theo từng tài liệu. Các nghiệp vụ chính gồm quản lý tài liệu và phiên bản, tìm kiếm, xét duyệt, tiêu hủy theo quy trình, nhật ký hoạt động và xác minh chữ ký. Hệ thống được kiểm tra bằng dữ liệu mẫu lưu trong PostgreSQL và các ca kiểm thử có minh chứng. Các số liệu thống kê được trích từ môi trường kiểm thử tại thời điểm chốt dữ liệu, không đại diện cho dữ liệu sản xuất của một doanh nghiệp thực tế.

**Lưu ý:** Đoạn đề xuất chỉ dùng sau khi thống nhất số lượng tại thời điểm chốt. Không chèn số `3.667` hay `3.663` vào bản cuối trước khi truy vấn.

## E. Cách kết luận

Đạt ở mức **đối soát tài liệu/mã nguồn** cho các điểm thuộc mục A. **Chưa đủ điều kiện chốt toàn bộ báo cáo và nghiệm thu cuối cùng** cho các dữ liệu, ảnh và tuyên bố trong mục B–C. Không thay đổi trạng thái PR #14/#15 và không sửa dữ liệu PostgreSQL.
