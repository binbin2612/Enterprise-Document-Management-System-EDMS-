# Kết quả kiểm tra chéo StarUML — bắt buộc sửa trước khi vẽ

**Thời điểm review:** 06/11/2026 (owner review).  
**Mã nguồn đối chiếu:** `feat/edms-modern-aurora-ui`, commit `43bea99cc2804ec661dc3fde331c4a0ddbf14a44`.  
**Tài liệu cần chỉnh:** `docs/report-huflit/STARUML_HANDOFF.md`, sau đó kiểm tra các mục mô tả tương ứng trong báo cáo Word `BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx`.

## 1. Kết luận

**UML DESIGN REVIEW: CHANGES_REQUIRED.** Bộ đặc tả hiện tại có nhiều endpoint/tên lớp/luồng chưa khớp source. Chưa giao thành viên dựng lại nguyên văn trên StarUML hoặc nhận định báo cáo Word là bản cuối. Các số đếm SQL và ảnh trong gói ZIP là **kết quả Anti báo cáo**, độc lập với chất lượng đặc tả UML; review này không chạy lại Docker/SQL hoặc mở Word nhị phân trên máy cục bộ.

## 2. Endpoint bắt buộc đổi (đã xác minh Controller Java)

| Mô tả sai/chưa đúng trong handoff | Endpoint / file mã nguồn đúng tại commit tham chiếu |
| --- | --- |
| `GET /api/users`, `POST /api/users` | `GET /api/admin/users`, `POST /api/admin/users` — `AdminUserController.java` |
| `PUT /api/users/{id}/role` | `PUT /api/admin/users/{id}` (DTO update chứa role) — `AdminUserController.java` |
| `PUT /api/users/{id}/status` | `PUT` hoặc `PATCH /api/admin/users/{id}/status` — `AdminUserController.java` |
| `POST /api/documents/{id}/versions/{vId}/revert` | `POST /api/documents/{id}/versions/{versionNumber}/restore` — `DocumentController.java` |
| `DELETE /api/documents/{id}/permissions/{pId}` | `DELETE /api/documents/{id}/permissions/{userId}` — `DocumentController.java` |
| `GET /api/search/documents?q=...` | `GET /api/documents?q=...` — `DocumentController.java` |
| `GET /api/search/semantic?query=...` | `GET /api/documents?q=...&searchMode=SEMANTIC&topK=...` — `DocumentController.java` |
| `POST /api/users/saved-searches` | `POST /api/saved-searches` — `SavedSearchController.java` |
| `POST /api/reviews` | `POST /api/documents/{id}/review` hoặc `POST /api/documents/{id}/reviews` — `DocumentReviewController.java` |
| `POST /api/reviews/{id}/approve` | `POST /api/admin/reviews/{reviewId}/approve` — `AdminReviewController.java` |
| `POST /api/reviews/{id}/reject` | `POST /api/admin/reviews/{reviewId}/reject` — `AdminReviewController.java` |
| `GET /api/dispositions` | `GET /api/admin/dispositions` — `AdminDispositionController.java` |
| `POST /api/dispositions/{id}/approve` | `POST /api/admin/dispositions/{requestId}/approve` — `AdminDispositionController.java` |
| `POST /api/dispositions/{id}/cancel` | `POST /api/documents/{id}/disposition/cancel` — `DocumentDispositionController.java` |
| `POST /api/documents/{id}/sign` | `POST /api/documents/{id}/versions/{vn}/sign` — `DocumentIntegrityController.java` |
| `GET /api/documents/{id}/verify-signature` | `GET /api/documents/{id}/versions/{vn}/integrity` — `DocumentIntegrityController.java` |
| `POST /api/public/verify-document` | `POST /api/public/verify-file` (upload) hoặc `GET /api/public/verify?hash=...` (lookup) — `PublicVerificationController.java` |

Lưu ý: Phải kiểm tra HTTP request/response **theo đúng method**, `@RequestMapping` cấp lớp và các DTO thực. Không dùng tên giả `SemanticSearchController`, `OnnxEmbeddingService`, `SignatureController`, `PublicVerifyController`, `TesseractOcrService` hoặc `DispositionJob` khi không có class này tại `backend/src/main/java/com/edms/`. Các class có thực bao gồm `DocumentController`, `SemanticSearchService`, `LocalEmbeddingService`, `OcrService`, `DocumentIntegrityController`, `PublicVerificationController`, `DocumentDispositionService`.

## 3. Những lỗi luồng nghiệp vụ nghiêm trọng

1. **Không có Refresh Token trong DTO đăng nhập hiện tại.** `LoginResponse.java` chỉ có `token`, `tokenType`, `username`, `fullName`, `role`; `AuthService.login()` sinh một JWT bằng `generateToken(authentication)`. Không ghi `generateRefreshToken` hoặc thời hạn access/refresh 15 phút/7 ngày nếu chưa có cấu hình và implementation tương ứng.
2. **Logout không chứng minh blacklist JWT.** `AuthService.logout()` chỉ ghi audit `LOGOUT`; `AuthController.logout()` gọi service và clear `SecurityContextHolder`. Không vẽ token blacklist/revocation server-side nếu không có source xác nhận.
3. **Tiêu hủy là logic, không xóa vật lý.** `DocumentDispositionService.approveDisposition()` chuyển `DocumentDisposition.status = APPROVED` và `Document.lifecycleStatus = DISPOSED`; code có chú thích rõ `NO PHYSICAL DELETION`. Không vẽ `DESTROYED`, xóa file trong `/app/storage/uploads` hoặc “chứng nhận bất biến” không có evidence.
4. **Không vẽ Scheduled Job tạo yêu cầu tiêu hủy tự động** nếu chưa tìm được lớp/job thật trong source. Luồng có căn cứ: actor được phép gửi yêu cầu qua `POST /api/documents/{id}/disposition`, sau kiểm tra điều kiện; admin phê duyệt/từ chối, hoặc yêu cầu bị hủy theo quy tắc nghiệp vụ.
5. **CANCELLED không chỉ do Admin chủ động hủy.** `DocumentDispositionService.cancelDisposition()` sử dụng `requireRequestDisposition()`; `cancelPendingDispositionsOnUnarchive()` cũng tự hủy yêu cầu khi chuyển tài liệu từ lưu trữ sang hoạt động. Không mặc định mọi bản ghi CANCELLED do “Admin quyết định giữ lại hồ sơ”.
6. **SUPERSEDED không tự đồng nghĩa tạo review mới.** `supersedePendingReviews()` đánh dấu các review cũ PENDING thành SUPERSEDED; việc tạo một yêu cầu mới cần action/request độc lập, trừ khi tìm được source chứng minh tự tạo.
7. **Semantic Search thực hiện bằng Java, không chạy SQL cosine ở DB.** `DocumentController.getAllDocuments()` gọi `SemanticSearchService.search()` với `searchMode=SEMANTIC`; `DocumentSemanticChunk.java` mô tả embedding lưu dưới dạng `BYTEA`, cosine ở Java sau ACL filtering. Không vẽ `SemanticChunkRepository.findTopSimilarChunks`/SQL `cosine_similarity()` nếu không có.
8. **SystemEngine không phải actor bên ngoài hệ thống** khi vẽ Use Case; chuyển OCR/embedding thành internal services/async processing trong Activity/Sequence. Actors bên ngoài có thể gồm Admin, Staff, User, PublicGuest — 3 roles tài khoản và 1 khách công khai.
9. **Sơ đồ lớp hiện chứa field không khớp JPA.** Ví dụ `User` có `enabled`, không phải `active`; không có `department`, `updatedAt`. `SavedSearch` lưu `createdBy` dạng username, không có `userId` JPA. `DocumentReview` dùng `versionNumber`, `submittedBy`, `reviewedBy`, `reviewComment`; không có `versionId` hoặc `reviewerUsername`. `AuditLog.resourceId` là String và `description` thay vì `details`. `DocumentSemanticChunk` có `documentVersionId` Long và `embeddingBytes` BYTEA; không có quan hệ JPA `@ManyToOne` trong class này.
10. **ERD phải dựa schema thật.** Không tự kết luận `ON DELETE CASCADE` trên mọi khóa ngoại chỉ vì có `@ManyToOne`; `saved_searches.user_id` không phải FK theo `SavedSearch.java` (class hiện dùng `createdBy`). Xác minh `information_schema` / PostgreSQL `pg_constraint` trước khi ghi chính xác FK và cascade.

## 4. Điều kiện hoàn tất

- [ ] Sửa **tất cả** endpoint ở bảng mục 2, đối chiếu link tới các Controller/Service thật.
- [ ] Sửa ba Activity, ba Sequence; không giữ refresh JWT/blacklist, tiêu hủy vật lý, background job giả.
- [ ] Dựng lại Class Diagram (10 JPA entity chính), các field và mối quan hệ theo source.
- [ ] Rà Physical ERD: PK, FK, index, unique constraint từ database schema.
- [ ] Soát lại nội dung Word, ma trận 78 feature, bảng SQL, ảnh; chỉnh chỗ mô tả nhầm API hoặc nghiệp vụ.
- [ ] Có file `.mdj` StarUML sau khi thành viên vẽ, và PNG xuất từ sơ đồ đó.
- [ ] Không sửa dữ liệu đang demo, KeyStore, code nghiệp vụ, `main` hoặc PR #14/#15; chỉ commit tài liệu đã sửa.
- [ ] Owner review lần cuối trước khi gắn `APPROVED`/đổi PR Draft.

**Trạng thái:** `CHANGES_REQUIRED` cho đặc tả UML; không phủ nhận các thống kê SQL Anti đã báo cáo.
