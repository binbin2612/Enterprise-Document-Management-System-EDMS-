# ĐẶC TẢ SƠ ĐỒ UML EDMS — PHIÊN BẢN ĐỐI CHIẾU MÃ NGUỒN

**Học phần:** Công nghệ phần mềm nâng cao — HUFLIT  
**Người thực hiện sơ đồ:** Viên Bảo Đức  
**Mã nguồn đối chiếu:** commit 43bea99cc2804ec661dc3fde331c4a0ddbf14a44, nhánh feat/edms-modern-aurora-ui  
**Ngày hiệu đính:** 07/11/2026  
**Trạng thái:** SOURCE_CORRECTED — CHỜ ĐỨC VẼ STARUML VÀ OWNER KIỂM TRA HÌNH XUẤT

> Đây là bản mô tả để vẽ lại bằng StarUML, không phải bản xuất trực tiếp từ StarUML. Các tuyến API đã đối chiếu với Controller Java; tên entity/field đối chiếu với mã JPA. Phần ràng buộc FK/CASCADE vật lý chỉ được xác nhận khi có kết quả đọc schema PostgreSQL. Danh sách tính năng và ảnh màn hình thuộc hồ sơ chứng cứ riêng và có thể cần sửa theo báo cáo kiểm toán mã nguồn bổ sung.

## 1. Phạm vi, tác nhân và ranh giới hệ thống

| Tác nhân ngoài hệ thống | Vai trò và hành động |
| --- | --- |
| **Quản trị viên** (ROLE_ADMIN) | Đăng nhập, quản lý người dùng, xem báo cáo/nhật ký, duyệt hoặc từ chối yêu cầu xét duyệt và tiêu hủy, xử lý tài liệu theo quyền |
| **Nhân viên** (ROLE_STAFF) | Đăng nhập, quản lý tài liệu theo quyền sở hữu và ACL, gửi yêu cầu xét duyệt/tiêu hủy khi đủ điều kiện |
| **Người dùng** (ROLE_USER) | Đăng nhập, xem/tìm/tải các tài liệu được cho phép, quản lý bộ lọc tìm kiếm cá nhân; các thao tác ghi phụ thuộc kiểm tra quyền cụ thể |
| **Khách tra cứu công khai** | Truy cập trang /verify và API /api/public/verify, /api/public/verify-file không cần tài khoản |

**Chỉ có 3 vai trò tài khoản** trong backend/entity/Role.java: ROLE_ADMIN, ROLE_STAFF, ROLE_USER. Khách tra cứu là tác nhân ngoài hệ thống, **không phải Role thứ tư**.

Các thành phần nội bộ **không đặt thành Actor bên ngoài**: DocumentController, DocumentService, SemanticSearchService, LocalEmbeddingService, OcrService, SignatureService, KeyStoreService, NotificationService, PostgreSQL, bộ lưu trữ tệp. Chúng thuộc ranh giới hệ thống hoặc là lifeline ở sơ đồ trình tự.

## 2. Sơ đồ Use Case

Vẽ **một khung hệ thống EDMS**, đặt 4 tác nhân bên ngoài; chia Use Case thành 6 package. Nối actor vào đúng các tác vụ có quyền, không tùy tiện gán toàn quyền cho Staff/User. Các thao tác có kiểm tra ACL phải có ghi chú guard: người sở hữu, Admin hoặc người được cấp quyền tương ứng.

| Nhóm | Use Case chính | API/điểm tích hợp đã đối chiếu |
| --- | --- | --- |
| 1. Đăng nhập và quản lý tài khoản | Đăng nhập; đăng xuất; quản lý người dùng; sửa vai trò; khóa/mở tài khoản | POST /api/auth/login; POST /api/auth/logout; GET/POST /api/admin/users; PUT /api/admin/users/{id}; PATCH hoặc PUT /api/admin/users/{id}/status |
| 2. Tài liệu và phiên bản | Danh sách, chi tiết, tải lên, tải xuống, xem trước, sửa metadata, thêm phiên bản, xem lịch sử, khôi phục phiên bản, lưu trữ/khôi phục hoạt động | GET/POST /api/documents; GET /api/documents/{id}; PUT /api/documents/{id}; GET /api/documents/{id}/preview; GET /api/documents/{id}/download; POST/GET /api/documents/{id}/versions; POST /api/documents/{id}/versions/{versionNumber}/restore; POST /api/documents/{id}/archive; POST /api/documents/{id}/unarchive |
| 3. Quyền truy cập tài liệu | Xem quyền; cấp quyền; thay đổi quyền; thu hồi quyền; đổi access mode | GET/POST /api/documents/{id}/permissions; PUT/DELETE /api/documents/{id}/permissions/{userId}; PUT /api/documents/{id}/access-mode |
| 4. Tìm kiếm và lọc đã lưu | Tìm theo từ khóa; tìm ngữ nghĩa AI; tìm kết hợp; lưu/xem/xóa bộ lọc | GET /api/documents với q, documentType, searchScope, searchMode, topK; POST/GET /api/saved-searches; DELETE /api/saved-searches/{id} |
| 5. Xét duyệt và tiêu hủy | Gửi xét duyệt, xem lịch sử, duyệt/từ chối; gửi/hủy yêu cầu tiêu hủy, xem hàng đợi, duyệt/từ chối | POST /api/documents/{id}/review; GET /api/documents/{id}/reviews; GET /api/admin/reviews; POST /api/admin/reviews/{reviewId}/approve hoặc /reject; POST /api/documents/{id}/disposition hoặc /disposition/cancel; GET /api/admin/dispositions; POST /api/admin/dispositions/{requestId}/approve hoặc /reject |
| 6. Chữ ký, xác thực và quản trị | Ký phiên bản, kiểm tra toàn vẹn, xác thực công khai, xem dashboard/nhật ký | POST /api/documents/{id}/versions/{vn}/sign; GET /api/documents/{id}/versions/{vn}/integrity; GET /api/public/verify?hash=... hoặc ?docId=...&version=...; POST /api/public/verify-file; GET /api/admin/dashboard; GET /api/admin/audit-logs |

**Quy tắc biểu diễn Use Case:**
- Dùng quan hệ association actor–use case; dùng include cho bước bắt buộc thật sự (ví dụ yêu cầu JWT và kiểm tra quyền ở nghiệp vụ bảo vệ), không bắt buộc vẽ thành một tác nhân riêng.
- Phê duyệt và từ chối do Admin thao tác; người có quyền sửa tài liệu có thể gửi yêu cầu xét duyệt theo kiểm tra của DocumentReviewService.
- Không vẽ Use Case "Đặt lại mật khẩu quản trị": EDMS-SEC-201 là chức năng **chưa triển khai**.
- Không vẽ "Quét tiêu hủy hằng ngày tự tạo yêu cầu" hoặc "Xuất chứng nhận tiêu hủy": chưa có controller/job xác minh cho các hành vi này.
- Tên package là cách tổ chức sơ đồ, không bắt buộc tương ứng 1:1 với package Java.

## 3. Activity Diagram 1 — Tải tài liệu và xử lý nội dung

**Swimlane:** Người dùng được phép tải lên | Giao diện React | Spring Boot | PostgreSQL và bộ lưu trữ.

1. Bắt đầu → chọn "Tải tài liệu" trên DocumentsPage → mở UploadModal.
2. Nhập metadata và chọn tệp. **Decision:** dữ liệu/định dạng/dung lượng hợp lệ? Không → thông báo lỗi và cho chọn lại; có → gửi multipart POST /api/documents.
3. Spring Security kiểm tra JWT; DocumentController chuyển dữ liệu cho DocumentService và các dịch vụ lưu trữ. **Decision:** xác thực, quyền và tệp hợp lệ? Không → phản hồi lỗi phù hợp; có → tiếp tục.
4. Lưu tệp vật lý và bản ghi tài liệu, phiên bản, thông tin liên quan; tạo response theo mã nguồn. Quá trình trích xuất văn bản, OCR và lập chỉ mục ngữ nghĩa được thực hiện bởi dịch vụ tương ứng theo pipeline triển khai.
5. **Decision:** xử lý trích xuất/OCR/semantic có thành công? Ghi trạng thái kết quả hoặc trạng thái lỗi tương ứng; không vẽ xóa tài liệu hoặc retry tự động khi chưa được code xác nhận.
6. Trả response lên UI, cập nhật danh sách; kết thúc.

**Chú thích khi vẽ:** Không mặc định OCR/AI và audit chạy ba nhánh Fork song song hoặc Join chặn trả response nếu chưa kiểm tra lớp service thực thi. Tham chiếu: DocumentController, DocumentService, ContentExtractionService, OcrService, SemanticIndexingService, LocalEmbeddingService, FileStorageService.

## 4. Activity Diagram 2 — Xét duyệt phiên bản tài liệu

**Swimlane:** Người được quyền sửa | Backend | Admin.

1. Chọn tài liệu đang ở lifecycle ACTIVE, có quyền sửa → gửi POST /api/documents/{id}/review.
2. Backend từ chối nếu tài liệu ARCHIVED/DISPOSED, thiếu quyền, hoặc phiên bản hiện tại đã có yêu cầu PENDING/APPROVED/REJECTED theo quy tắc DocumentReviewService.
3. Hợp lệ → tạo DocumentReview(versionNumber hiện tại, status=PENDING), lưu SQL, ghi nhật ký và gửi thông báo.
4. Admin xem GET /api/admin/reviews và quyết định:
   - **Phê duyệt:** POST /api/admin/reviews/{reviewId}/approve → chỉ từ PENDING sang APPROVED; ghi người xử lý, thời điểm, audit, thông báo.
   - **Từ chối:** POST /api/admin/reviews/{reviewId}/reject với lý do bắt buộc → PENDING sang REJECTED; ghi audit, thông báo.
5. **Nhánh thay thế:** Nếu tải lên phiên bản mới trong khi bản cũ PENDING, DocumentReviewService.supersedePendingReviews() chuyển yêu cầu chờ của phiên bản cũ thành SUPERSEDED. **Không tự tạo yêu cầu PENDING cho phiên bản mới nếu người dùng chưa gửi yêu cầu.**
6. Kết thúc. **Không đổi documents.lifecycle_status sang APPROVED hoặc DRAFT** vì enum LifecycleStatus chỉ có ACTIVE/ARCHIVED/DISPOSED. Review status và lifecycle status là hai khái niệm khác nhau.

## 5. Activity Diagram 3 — Yêu cầu tiêu hủy tài liệu

**Swimlane:** Chủ tài liệu/Admin được phép | Backend | Admin xét duyệt.

1. Gửi POST /api/documents/{id}/disposition, kèm reason.
2. Backend kiểm tra: người gửi có quyền; tài liệu lifecycle=ARCHIVED; legalHold=false; retentionUntil đã đến hạn; không có review PENDING và không có disposition PENDING trùng.
3. **Decision:** sai một điều kiện → từ chối và trả lỗi; đủ điều kiện → tạo disposition=PENDING, ghi audit và thông báo.
4. Admin xem GET /api/admin/dispositions, quyết định:
   - **Approve:** POST /api/admin/dispositions/{requestId}/approve. Backend **kiểm tra lại tất cả điều kiện**; nếu hợp lệ → disposition=APPROVED, document.lifecycleStatus=DISPOSED, ghi người xử lý/audit/thông báo.
   - **Reject:** POST /api/admin/dispositions/{requestId}/reject → disposition=REJECTED, ghi lý do/audit.
   - **Cancel:** POST /api/documents/{id}/disposition/cancel với quyền tương ứng → disposition=PENDING thành CANCELLED; hoặc yêu cầu chờ được hủy khi tài liệu unarchive thông qua DocumentDispositionService.cancelPendingDispositionsOnUnarchive().
5. Kết thúc. **Không xóa tệp vật lý**: approveDisposition() ghi rõ logical disposition, NO PHYSICAL DELETION. Không vẽ lifecycle DESTROYED; enum LifecycleStatus dùng DISPOSED.

## 6. Sequence Diagram 1 — Đăng nhập và đăng xuất

**Lifeline:** User | LoginPage | AuthController | AuthService | AuthenticationManager | UserRepository | PostgreSQL | JwtTokenProvider | AuditService.

1. User nhập username/password → LoginPage gửi POST /api/auth/login.
2. AuthController.login(request, clientIp) → AuthService.login().
3. AuthService kiểm tra LoginRateLimiterService; nếu vượt ngưỡng → trả lỗi, ghi audit.
4. AuthenticationManager.authenticate() sử dụng UserDetails/BCrypt và UserRepository. **alt [sai thông tin/không hợp lệ]:** trả lỗi xác thực, ghi LOGIN_FAILED; **alt [thành công]:** JwtTokenProvider.generateToken(authentication), lấy User, ghi LOGIN_SUCCESS.
5. AuthService trả LoginResponse gồm **token, tokenType, username, fullName, role**; UI lưu một token và điều hướng.
6. Đăng xuất: POST /api/auth/logout → AuthService.logout(username) ghi LOGOUT, AuthController clear SecurityContextHolder; frontend xóa token bên client theo hành vi UI.

**Không vẽ** refreshToken, generateRefreshToken(), JWT blacklist hoặc thời hạn 15 phút/7 ngày vì không có trong LoginResponse/AuthService trên commit kiểm tra. Logout server-side **không chứng minh JWT cũ đã bị thu hồi ngay**.

## 7. Sequence Diagram 2 — Tìm kiếm ngữ nghĩa ONNX

**Lifeline:** Người dùng | DocumentsPage | DocumentController | SemanticSearchService | DocumentRepository/DocumentVersionRepository | DocumentSemanticChunkRepository | LocalEmbeddingService | PostgreSQL.

1. Người dùng chọn tìm kiếm ngữ nghĩa và nhập q → GET /api/documents?q=...&searchMode=SEMANTIC&topK=....
2. DocumentController xác thực tham số, gọi SemanticSearchService.search(query, username, isAdmin, topK).
3. Dịch vụ xác định **tài liệu có quyền truy cập theo ACL**, chỉ lấy phiên bản hiện tại đã semantic READY và đúng model.
4. Đọc chunks được phép từ PostgreSQL bằng DocumentSemanticChunkRepository.
5. LocalEmbeddingService.embedQuery() sinh vector truy vấn từ mô hình cục bộ ONNX.
6. SemanticSearchService tính **cosine similarity trong Java** (LocalEmbeddingService.cosineSimilarity()), lấy điểm lớn nhất theo tài liệu, lọc minScore, sắp xếp và giới hạn topK.
7. DocumentController dựng DocumentResponse với semanticMatched, semanticScore, matchSnippet; trả kết quả về DocumentsPage.

**Không vẽ** SemanticSearchController, OnnxEmbeddingService, câu SQL cosine_similarity hoặc bảng vector chuyên dụng không tồn tại. DocumentSemanticChunk lưu embedding dưới dạng BYTEA.

## 8. Sequence Diagram 3 — Ký và tra cứu chữ ký

**Lifeline ký:** Chủ tài liệu/Admin | PreviewModal | DocumentIntegrityController | SignatureService | DocumentRepository/DocumentVersionRepository | FileStorageService | IntegrityService | KeyStoreService | PostgreSQL | AuditService.

1. Người có quyền chọn phiên bản → POST /api/documents/{id}/versions/{vn}/sign.
2. SignatureService kiểm tra tài liệu tồn tại, lifecycle không ARCHIVED/DISPOSED, caller là **owner hoặc Admin**, đúng phiên bản và chưa ký.
3. Đọc bytes tệp; so sánh SHA-256 với hash đã lưu (hoặc stamp hash với bản cũ chưa có), từ chối nếu tệp bị sửa đổi.
4. KeyStoreService cung cấp private key và X.509 self-signed; SignatureService ký bytes bằng SHA256withRSA.
5. Lưu signatureBytes, signatureAlgorithm, signerUsername, signedAt, certSerialNumber của DocumentVersion; ghi nhật ký; trả SignDocumentResponse.
6. **alt [thiếu quyền, sai trạng thái, ký lại, hash mismatch, lỗi IO]:** phản hồi lỗi; không tạo chữ ký thành công.

**Lifeline kiểm chứng công khai:** PublicGuest | VerifyPage | PublicVerificationController | IntegrityService | Repository | PostgreSQL.

1. Khách chọn một cách tra cứu:
   - GET /api/public/verify?hash=... hoặc ?docId=...&version=..., hoặc
   - POST /api/public/verify-file với multipart file.
2. PublicVerificationController tra bản ghi phù hợp, đối chiếu hash/toàn vẹn và trạng thái chữ ký qua IntegrityService, trả PublicVerificationResponse.
3. UI hiển thị có tìm thấy hay không, toàn vẹn, trạng thái chữ ký và thông tin chứng chỉ có sẵn.
4. Chứng chỉ X.509 là **tự ký nội bộ**; không khẳng định chứng thư do CA công cộng cấp hoặc chữ ký đáp ứng mọi yêu cầu pháp lý.

## 9. Class Diagram — mười JPA Entity

**Nguồn:** backend/src/main/java/com/edms/entity. Phần liệt kê chọn các field trọng yếu để bố cục dễ đọc. Khi dựng lớp chi tiết, giữ **đúng tên, kiểu và thuộc tính thật**; không tự thêm trường.

| Entity | Trường quan trọng trong source | Ghi chú |
| --- | --- | --- |
| User | id:Long; username:String; password:String; fullName:String; email:String; role:Role; enabled:boolean; createdAt:Instant | Không có department, active, updatedAt |
| Document | id:Long; title:String; description:String; documentType:String; originalFileName:String; storedFileName:String; contentType:String; fileSize:Long; createdBy:String; accessMode:AccessMode; currentVersionNumber:Integer; lifecycleStatus:LifecycleStatus; retentionUntil:LocalDate; legalHold:boolean; archivedAt:Instant; disposedAt:Instant; createdAt:Instant; updatedAt:Instant | lifecycle: ACTIVE/ARCHIVED/DISPOSED |
| DocumentVersion | id:Long; document:Document; versionNumber:Integer; uploadedBy:String; storedFileName:String; fileHash:String; hashAlgorithm:String; ocrStatus:OcrStatus; ocrText:String; semanticStatus:SemanticStatus; semanticChunkCount:Integer; signatureBytes:byte[]; signatureAlgorithm:String; signedAt:Instant; certSerialNumber:String | Có các field extraction/semantic khác, tham chiếu Entity.java |
| DocumentPermission | id:Long; document:Document; user:User; permission:PermissionType; createdAt:Instant | user là quan hệ JPA; không có expiresAt |
| DocumentReview | id:Long; document:Document; versionNumber:Integer; status:ReviewStatus; submittedBy:String; submittedAt:Instant; reviewedBy:String; reviewedAt:Instant; reviewComment:String | Không có versionId, reviewerUsername |
| DocumentDisposition | id:Long; document:Document; versionNumber:Integer; status:DispositionStatus; reason:String; requestedBy:String; requestedAt:Instant; reviewedBy:String; reviewedAt:Instant; reviewComment:String; disposedAt:Instant; disposedBy:String | Không có scheduledDate/approvedBy |
| AuditLog | id:Long; username:String; action:String; resourceType:String; resourceId:String; description:String; timestamp:Instant; ipAddress:String | resourceId kiểu String |
| Notification | id:Long; recipientUsername:String; type:NotificationType; title:String; message:String; documentId:Long; versionNumber:Integer; relatedEntityType:String; relatedEntityId:Long; read:boolean; createdAt:Instant; readAt:Instant; actionKey:String; eventKey:String | Không giả định mọi Long là FK |
| SavedSearch | id:Long; name:String; query:String; documentType:String; searchScope:String; searchMode:String; createdBy:String; createdAt:Instant | createdBy là username dạng String, **không có userId** |
| DocumentSemanticChunk | id:Long; documentVersionId:Long; chunkIndex:Integer; chunkText:String; embeddingBytes:byte[]; embeddingModel:String; embeddingDimension:Integer; contentHash:String; createdAt:Instant | documentVersionId là Long, **không có @ManyToOne** |

**Enums cần vẽ khi hữu ích:** Role (ROLE_ADMIN, ROLE_STAFF, ROLE_USER); ReviewStatus (PENDING, APPROVED, REJECTED, SUPERSEDED); DispositionStatus (PENDING, APPROVED, REJECTED, CANCELLED); LifecycleStatus (ACTIVE, ARCHIVED, DISPOSED).

**Quan hệ JPA có khai báo rõ:** DocumentVersion → Document (ManyToOne); DocumentPermission → Document và User (ManyToOne); DocumentReview → Document (ManyToOne); DocumentDisposition → Document (ManyToOne). Từ các quan hệ này có thể vẽ multiplicity Document 1 — 0..* Version/Permission/Review/Disposition và User 1 — 0..* Permission.

**Không áp đặt composition cho mọi liên hệ:** Có trường Long trỏ đến ID không có nghĩa là có association JPA hoặc FK. SavedSearch.createdBy, Notification.documentId, DocumentSemanticChunk.documentVersionId là các field thông thường theo entity đã kiểm tra.

## 10. Physical ERD — đối chiếu cột vật lý và khóa

**Mười bảng nghiệp vụ:** users, documents, document_versions, document_permissions, document_reviews, document_dispositions, audit_logs, notifications, saved_searches, document_semantic_chunks.

**Các cột kết nối có căn cứ từ @JoinColumn:** document_versions.document_id → documents.id; document_permissions.document_id → documents.id; document_permissions.user_id → users.id; document_reviews.document_id → documents.id; document_dispositions.document_id → documents.id.

**Các liên hệ định danh, chưa được xác nhận là FK vật lý:** document_semantic_chunks.document_version_id; saved_searches.created_by; notifications.document_id; audit_logs.resource_id. Không dựng đường FK bắt buộc cho các trường này nếu PostgreSQL không có constraint.

**Các unique/index được thấy trên JPA:**
- users.username là UNIQUE.
- document_versions có UNIQUE (document_id, version_number).
- document_semantic_chunks có UNIQUE (document_version_id, chunk_index, embedding_model).
- document_reviews có index trên document_id, version_number, status, submitted_at.
- audit_logs có index trên username, timestamp, action.

**BẮT BUỘC kiểm tra schema PostgreSQL trước khi chốt ERD vật lý:** tên FK thật, unique constraint, kiểu cột, nullable và hành động DELETE. Không viết ON DELETE CASCADE nếu chưa tra pg_constraint. Không vẽ saved_searches.user_id (cột đó không xuất hiện trong Entity hiện tại).

Câu SQL **chỉ đọc** để đối chiếu khóa ngoại và hành động xóa:

    SELECT c.conname AS ten_khoa,
           c.conrelid::regclass AS bang_con,
           pg_get_constraintdef(c.oid) AS dinh_nghia
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.connamespace = 'public'::regnamespace
    ORDER BY c.conrelid::regclass::text, c.conname;

## 11. Hướng dẫn xuất sơ đồ và nghiệm thu

1. Dựng trong StarUML các diagram: 1 Use Case tổng quát và các package cần thiết; 3 Activity; 3 Sequence; 1 Class; 1 Physical ERD (có thể dùng mô hình ERD chuyên dụng tương đương nếu StarUML thiếu extension).
2. Đặt nhãn nghiệp vụ **bằng tiếng Việt**, giữ nguyên tên class/API/enums kỹ thuật để truy vết. Không thêm actor, service, endpoint hoặc nhánh xử lý tưởng tượng.
3. Xuất file nguồn StarUML .mdj và PNG chất lượng đủ đọc. Kiểm tra lại từng ảnh với Controller/Service trước khi chèn Word.
4. Soát báo cáo Word 7 chương và ma trận chức năng theo các sửa đổi này. Các file Word/ZIP cục bộ chưa được sửa trong lần cập nhật GitHub này.
5. Hồ sơ chỉ đạt **DESIGN_REVIEW_READY** sau khi sơ đồ thực tế và Word được kiểm tra; bản Markdown này không tự xác lập kết luận OWNER APPROVED.

**Tài liệu truy vết:** OWNER_UML_CORRECTIONS_2026-11-06.md; Role.java; SecurityConfig.java; AuthController.java; AuthService.java; LoginResponse.java; DocumentController.java; DocumentReviewController.java; AdminReviewController.java; DocumentDispositionController.java; AdminDispositionController.java; DocumentIntegrityController.java; PublicVerificationController.java; SemanticSearchService.java; SignatureService.java; KeyStoreService.java; các entity JPA tại commit 43bea99.
