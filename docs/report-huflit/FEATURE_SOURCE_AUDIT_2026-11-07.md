# KIỂM TOÁN TRUY VẾT MÃ NGUỒN CHO MA TRẬN 78 CHỨC NĂNG — 07/11/2026

**Mã nguồn chuẩn đối chiếu:** `43bea99cc2804ec661dc3fde331c4a0ddbf14a44` (PR #15). **Hồ sơ cần rà lại:** `FEATURE_EVIDENCE_MATRIX.md`, `FEATURE_INVENTORY.csv`, `FEATURE_CORRECTIONS.csv`, báo cáo Word cục bộ. **Kết quả:** `SOURCE_TRACEABILITY_BLOCKED` — chưa duyệt kết luận “78/78 đều verified”.

## Phương pháp và giới hạn

Đọc cây tệp Git theo commit cố định (461 tệp, cây Git không bị cắt cụt), tìm các tên `.java/.tsx/.ts/.jsx` được trích trong **78 dòng chức năng** của ma trận, đối chiếu tên tệp có tồn tại trong repository hay không. Bước này kiểm tra **tính có thật của chỉ dẫn mã nguồn**, chưa chạy lại UI, API, Docker hoặc SQL. **Tên tệp không tồn tại không nhất thiết có nghĩa tính năng không tồn tại**, vì tính năng có thể nằm ở service/controller khác. Ngược lại, tên tệp có tồn tại **không chứng minh** chức năng chạy đúng hoặc endpoint có thật.

- Tổng dòng chức năng trong ma trận: **78**.
- Số dòng dẫn ít nhất một tên tệp không có trong Git tree: **52/78**.
- Số dòng không bị phát hiện lỗi tên tệp trong bước này: **26/78**; các dòng này vẫn cần kiểm tra API/function thực tế.
- Báo cáo Anti ghi **51 LIVE_VERIFIED / 27 CODE_VERIFIED** là phân loại tại thời điểm Anti bàn giao. **Không thể dùng các nhãn này làm chứng cứ nghiệm thu mã nguồn khi ma trận dẫn nguồn còn sai**.

## Những lỗi nghiệp vụ/API đã xác định cần sửa ngay

| STT trong ma trận | Vấn đề |
| --- | --- |
| 02 | Không có POST /api/auth/refresh; LoginResponse không chứa refreshToken. |
| 04 | Logout chỉ ghi nhật ký và clear context, không có TokenBlacklistService. |
| 11–12 | DocumentController không có DELETE /api/documents/{id} hoặc POST /api/documents/{id}/restore (có restore phiên bản). |
| 21,24 | Không tìm thấy API cấp quyền theo phòng ban/role hoặc expiresAt trong DocumentPermission entity. |
| 35 | Không thấy POST /api/search/advanced; API tìm kiếm dùng GET /api/documents với query params đã triển khai. |
| 44 | ReviewStatus không tương ứng thay đổi Document.lifecycleStatus thành APPROVED hay DRAFT. |
| 46–47 | Không thấy POST /api/retention-policies hoặc /api/dispositions/scan-expired; retention cập nhật qua PUT /api/documents/{id}/retention. |
| 49 | Approve disposition là DISPOSED logic, không tiêu hủy vật lý. |
| 51 | Không thấy GET /api/dispositions/{id}/certificate. |
| 63 | Không có POST /api/users/{id}/reset-password; EDMS-SEC-201 chưa hoàn tất. |
| 66–67 | Không thấy GET /api/audit-logs/{id} hoặc /export trong các controller đã kiểm tra. |
| 76 | SecurityConfig vô hiệu hóa CSRF cho REST; không mô tả là đã bật bảo vệ CSRF. |

## 52 dòng có tệp dẫn nguồn không khớp Git tree

| STT | Chức năng trong hồ sơ | Tên tệp không tìm thấy tại commit chuẩn |
| ---: | --- | --- |
| 3 | /P/h/â/n/ /q/u/y/ề/n/ /t/r/u/y/ /c/ậ/p/ /t/h/e/o/ /v/a/i/ /t/r/ò/ /(/R/B/A/C/ /3/ /c/ấ/p/)/ | `UserPrincipal.java` |
| 4 | /Đ/ă/n/g/ /x/u/ấ/t/ /v/à/ /v/ô/ /h/i/ệ/u/ /h/ó/a/ /p/h/i/ê/n/ /l/à/m/ /v/i/ệ/c/ | `TokenBlacklistService.java` |
| 5 | /C/h/u/y/ể/n/ /đ/ổ/i/ /g/i/a/o/ /d/i/ệ/n/ /S/á/n/g/ /// /T/ố/i/ /(/M/o/d/e/r/n/ /A/u/r/o/r/a/)/ | `theme.ts`, `ThemeToggle.tsx` |
| 7 | /L/ọ/c/ /t/à/i/ /l/i/ệ/u/ /t/h/e/o/ /L/o/ạ/i/ /h/ồ/ /s/ơ/,/ /T/r/ạ/n/g/ /t/h/á/i/,/ /B/ả/o/ /m/ậ/t/ | `DocumentFilterDto.java` |
| 8 | /X/e/m/ /c/h/i/ /t/i/ế/t/ /h/ồ/ /s/ơ/ /t/à/i/ /l/i/ệ/u/ /v/à/ /t/h/u/ộ/c/ /t/í/n/h/ /m/ở/ /r/ộ/n/g/ | `DocumentDto.java` |
| 10 | /C/h/ỉ/n/h/ /s/ử/a/ /t/h/ô/n/g/ /t/i/n/ /m/e/t/a/d/a/t/a/ /t/à/i/ /l/i/ệ/u/ | `EditDocumentModal.tsx` |
| 12 | /K/h/ô/i/ /p/h/ụ/c/ /t/à/i/ /l/i/ệ/u/ /đ/ã/ /x/ó/a/ /l/o/g/i/c/ | `TrashBinModal.tsx` |
| 13 | /X/e/m/ /l/ị/c/h/ /s/ử/ /t/o/à/n/ /b/ộ/ /p/h/i/ê/n/ /b/ả/n/ /(/V/e/r/s/i/o/n/ /L/i/s/t/)/ | `DocumentVersionController.java`, `DocumentVersionService.java` |
| 14 | /T/ả/i/ /l/ê/n/ /p/h/i/ê/n/ /b/ả/n/ /m/ớ/i/ /(/M/a/j/o/r/ /// /M/i/n/o/r/ /V/e/r/s/i/o/n/ /B/u/m/p/)/ | `DocumentVersionController.java` |
| 15 | /T/ả/i/ /x/u/ố/n/g/ /t/ệ/p/ /đ/í/n/h/ /k/è/m/ /t/h/e/o/ /t/ừ/n/g/ /p/h/i/ê/n/ /b/ả/n/ | `DocumentVersionController.java` |
| 16 | /K/h/ô/i/ /p/h/ụ/c/ /p/h/i/ê/n/ /b/ả/n/ /c/ũ/ /t/h/à/n/h/ /p/h/i/ê/n/ /b/ả/n/ /h/i/ệ/n/ /t/ạ/i/ | `DocumentVersionService.java` |
| 18 | /K/i/ể/m/ /t/r/a/ /m/ã/ /b/ă/m/ /t/o/à/n/ /v/ẹ/n/ /S/H/A/-/2/5/6/ /c/ủ/a/ /p/h/i/ê/n/ /b/ả/n/ | `ChecksumUtils.java` |
| 19 | /X/e/m/ /d/a/n/h/ /s/á/c/h/ /q/u/y/ề/n/ /t/r/u/y/ /c/ậ/p/ /c/ấ/p/ /t/à/i/ /l/i/ệ/u/ /(/A/C/L/)/ | `DocumentPermissionController.java`, `DocumentPermissionService.java` |
| 20 | /C/ấ/p/ /q/u/y/ề/n/ /c/h/i/a/ /s/ẻ/ /t/à/i/ /l/i/ệ/u/ /c/h/o/ /n/g/ư/ờ/i/ /d/ù/n/g/ /c/ụ/ /t/h/ể/ | `DocumentPermissionController.java` |
| 21 | /C/ấ/p/ /q/u/y/ề/n/ /c/h/i/a/ /s/ẻ/ /t/à/i/ /l/i/ệ/u/ /t/h/e/o/ /v/a/i/ /t/r/ò/ | `DocumentPermissionService.java` |
| 22 | /C/ậ/p/ /n/h/ậ/t/ /c/ấ/p/ /đ/ộ/ /q/u/y/ề/n/ /(/R/E/A/D/,/ /W/R/I/T/E/,/ /D/E/L/E/T/E/,/ /M/A/N/A/G/E/)/ | `DocumentPermissionController.java` |
| 23 | /T/h/u/ /h/ồ/i/ /q/u/y/ề/n/ /t/r/u/y/ /c/ậ/p/ /đ/ã/ /c/ấ/p/ | `DocumentPermissionController.java` |
| 24 | /T/h/i/ế/t/ /l/ậ/p/ /t/h/ờ/i/ /h/ạ/n/ /h/ế/t/ /h/ạ/n/ /t/ự/ /đ/ộ/n/g/ /c/h/o/ /q/u/y/ề/n/ /c/h/i/a/ /s/ẻ/ | `DocumentPermissionJob.java` |
| 25 | /X/e/m/ /t/r/ư/ớ/c/ /t/r/ự/c/ /t/u/y/ế/n/ /t/à/i/ /l/i/ệ/u/ /P/D/F/ /đ/a/ /t/r/a/n/g/ | `DocumentPreviewController.java`, `PdfViewer.tsx` |
| 26 | /X/e/m/ /t/r/ư/ớ/c/ /t/r/ự/c/ /t/u/y/ế/n/ /t/ệ/p/ /h/ì/n/h/ /ả/n/h/ /(/./p/n/g/,/ /./j/p/g/)/ | `DocumentPreviewController.java` |
| 28 | /K/ý/ /s/ố/ /đ/i/ệ/n/ /t/ử/ /b/ằ/n/g/ /t/h/u/ậ/t/ /t/o/á/n/ /S/H/A/2/5/6/w/i/t/h/R/S/A/ | `DigitalSignatureController.java`, `DigitalSignatureService.java` |
| 29 | /X/á/c/ /t/h/ự/c/ /t/í/n/h/ /h/ợ/p/ /l/ệ/ /c/ủ/a/ /c/h/ữ/ /k/ý/ /s/ố/ /t/r/o/n/g/ /h/ệ/ /t/h/ố/n/g/ | `DigitalSignatureService.java` |
| 30 | /C/ổ/n/g/ /t/r/a/ /c/ứ/u/ /x/á/c/ /t/h/ự/c/ /c/h/ữ/ /k/ý/ /c/ô/n/g/ /k/h/a/i/ | `PublicVerifyController.java`, `PublicVerifyService.java`, `PublicVerifyPage.tsx` |
| 31 | /K/i/ể/m/ /t/r/a/ /c/h/ứ/n/g/ /c/h/ỉ/ /s/ố/ /X/./5/0/9/ /v/à/ /t/h/ô/n/g/ /t/i/n/ /n/g/ư/ờ/i/ /k/ý/ | `CertificateUtils.java`, `PublicVerifyPage.tsx` |
| 32 | /T/ì/m/ /k/i/ế/m/ /t/o/à/n/ /v/ă/n/ /(/F/u/l/l/-/T/e/x/t/ /S/e/a/r/c/h/)/ /t/h/e/o/ /t/ừ/ /k/h/ó/a/ | `SearchController.java`, `SearchService.java` |
| 33 | /T/ì/m/ /k/i/ế/m/ /n/g/ữ/ /n/g/h/ĩ/a/ /A/I/ /(/S/e/m/a/n/t/i/c/ /V/e/c/t/o/r/ /S/e/a/r/c/h/ /O/N/N/X/)/ | `SemanticSearchController.java`, `OnnxEmbeddingService.java` |
| 34 | /T/r/í/c/h/ /x/u/ấ/t/ /n/ộ/i/ /d/u/n/g/ /O/C/R/ /t/ự/ /đ/ộ/n/g/ /(/T/e/s/s/e/r/a/c/t/ /4/./1/./1/)/ | `OcrController.java`, `TesseractOcrService.java`, `OcrJob.java` |
| 35 | /T/ì/m/ /k/i/ế/m/ /k/ế/t/ /h/ợ/p/ /đ/a/ /đ/i/ề/u/ /k/i/ệ/n/ /(/K/h/o/ả/n/g/ /n/g/à/y/,/ /T/á/c/ /g/i/ả/)/ | `SearchController.java`, `AdvancedSearchDto.java` |
| 38 | /Đ/á/n/h/ /c/h/ỉ/ /m/ụ/c/ /t/ự/ /đ/ộ/n/g/ /n/ộ/i/ /d/u/n/g/ /v/ă/n/ /b/ả/n/ | `DocumentIndexingService.java`, `DocumentListener.java` |
| 39 | /G/ử/i/ /y/ê/u/ /c/ầ/u/ /x/é/t/ /d/u/y/ệ/t/ /t/à/i/ /l/i/ệ/u/ /k/è/m/ /g/h/i/ /c/h/ú/ | `ReviewRequestModal.tsx` |
| 44 | /C/h/u/y/ể/n/ /t/r/ạ/n/g/ /t/h/á/i/ /v/ò/n/g/ /đ/ờ/i/ /t/à/i/ /l/i/ệ/u/ /t/ự/ /đ/ộ/n/g/ /k/h/i/ /d/u/y/ệ/t/ | `DocumentStateService.java`, `DocumentStatus.java` |
| 46 | /T/h/i/ế/t/ /l/ậ/p/ /c/h/í/n/h/ /s/á/c/h/ /l/ư/u/ /t/r/ữ/ /v/à/ /h/ạ/n/ /g/i/ữ/ /t/à/i/ /l/i/ệ/u/ | `RetentionPolicyController.java`, `RetentionPolicyService.java` |
| 47 | /T/ự/ /đ/ộ/n/g/ /q/u/é/t/ /t/à/i/ /l/i/ệ/u/ /q/u/á/ /h/ạ/n/ /c/h/u/y/ể/n/ /s/a/n/g/ /t/i/ê/u/ /h/ủ/y/ | `DispositionJob.java` |
| 51 | /B/i/ê/n/ /b/ả/n/ /g/h/i/ /n/h/ậ/n/ /t/i/ê/u/ /h/ủ/y/ /t/à/i/ /l/i/ệ/u/ | `DispositionCertificateService.java` |
| 52 | /H/i/ể/n/ /t/h/ị/ /c/á/c/ /c/h/ỉ/ /s/ố/ /t/ổ/n/g/ /q/u/a/n/ /(/K/P/I/s/ /D/a/s/h/b/o/a/r/d/)/ | `DashboardController.java`, `DashboardService.java` |
| 53 | /B/i/ể/u/ /đ/ồ/ /p/h/â/n/ /b/ổ/ /t/à/i/ /l/i/ệ/u/ /t/h/e/o/ /L/o/ạ/i/ /h/ồ/ /s/ơ/ | `DashboardController.java` |
| 54 | /B/i/ể/u/ /đ/ồ/ /x/u/ /h/ư/ớ/n/g/ /t/ả/i/ /l/ê/n/ /t/à/i/ /l/i/ệ/u/ /t/h/e/o/ /t/h/ờ/i/ /g/i/a/n/ | `DashboardController.java` |
| 55 | /B/ả/n/g/ /t/h/e/o/ /d/õ/i/ /c/á/c/ /h/o/ạ/t/ /đ/ộ/n/g/ /t/ả/i/ /l/ê/n/ /g/ầ/n/ /đ/â/y/ /n/h/ấ/t/ | `DashboardService.java` |
| 56 | /B/ả/n/g/ /c/ả/n/h/ /b/á/o/ /h/ồ/ /s/ơ/ /s/ắ/p/ /h/ế/t/ /h/ạ/n/ /l/ư/u/ /t/r/ữ/ | `DashboardService.java` |
| 57 | /L/ọ/c/ /d/ữ/ /l/i/ệ/u/ /t/h/ố/n/g/ /k/ê/ /t/h/e/o/ /k/h/o/ả/n/g/ /t/h/ờ/i/ /g/i/a/n/ | `DashboardController.java` |
| 58 | /X/e/m/ /d/a/n/h/ /s/á/c/h/ /n/g/ư/ờ/i/ /d/ù/n/g/ /p/h/â/n/ /t/r/a/n/g/ /v/à/ /t/ì/m/ /k/i/ế/m/ | `UserController.java`, `UserService.java` |
| 59 | /T/h/ê/m/ /m/ớ/i/ /t/à/i/ /k/h/o/ả/n/ /n/g/ư/ờ/i/ /d/ù/n/g/ /v/à/ /g/á/n/ /v/a/i/ /t/r/ò/ | `UserController.java`, `UserService.java` |
| 60 | /C/h/ỉ/n/h/ /s/ử/a/ /t/h/ô/n/g/ /t/i/n/ /h/ồ/ /s/ơ/ /n/g/ư/ờ/i/ /d/ù/n/g/ /v/à/ /p/h/ò/n/g/ /b/a/n/ | `UserController.java` |
| 61 | /Đ/ổ/i/ /v/a/i/ /t/r/ò/ /h/ệ/ /t/h/ố/n/g/ /(/R/O/L/E/_/A/D/M/I/N/,/ /R/O/L/E/_/S/T/A/F/F/,/ /R/O/L/E/_/U/S/E/R/)/ | `UserController.java`, `UserService.java` |
| 62 | /K/h/ó/a/ /// /K/í/c/h/ /h/o/ạ/t/ /l/ạ/i/ /t/à/i/ /k/h/o/ả/n/ /n/g/ư/ờ/i/ /d/ù/n/g/ | `UserController.java`, `UserService.java` |
| 63 | /Đ/ặ/t/ /l/ạ/i/ /m/ậ/t/ /k/h/ẩ/u/ /n/g/ư/ờ/i/ /d/ù/n/g/ /t/h/e/o/ /c/h/u/ẩ/n/ /b/ả/o/ /m/ậ/t/ | `UserController.java`, `PasswordEncoderConfig.java` |
| 64 | /X/e/m/ /d/a/n/h/ /s/á/c/h/ /n/h/ậ/t/ /k/ý/ /k/i/ể/m/ /t/o/á/n/ /(/A/u/d/i/t/ /L/o/g/s/)/ | `AuditLogController.java`, `AuditLogService.java` |
| 66 | /X/e/m/ /c/h/i/ /t/i/ế/t/ /t/h/a/y/ /đ/ổ/i/ /d/ữ/ /l/i/ệ/u/ /t/r/ư/ớ/c///s/a/u/ /(/D/i/f/f/)/ | `AuditLogController.java` |
| 67 | /X/u/ấ/t/ /b/á/o/ /c/á/o/ /n/h/ậ/t/ /k/ý/ /k/i/ể/m/ /t/o/á/n/ /r/a/ /t/ệ/p/ /C/S/V/ /// /E/x/c/e/l/ | `AuditExportService.java` |
| 72 | /K/i/ể/m/ /t/r/a/ /k/ế/t/ /n/ố/i/ /c/ơ/ /s/ở/ /d/ữ/ /l/i/ệ/u/ /P/o/s/t/g/r/e/S/Q/L/ /&/ /D/i/s/k/ | `CustomHealthIndicator.java` |
| 75 | /B/ă/m/ /m/ậ/t/ /k/h/ẩ/u/ /n/g/ư/ờ/i/ /d/ù/n/g/ /a/n/ /t/o/à/n/ /b/ằ/n/g/ /B/C/r/y/p/t/ | `PasswordEncoderConfig.java` |
| 77 | /K/h/ả/ /n/ă/n/g/ /h/o/ạ/t/ /đ/ộ/n/g/ /h/o/à/n/ /t/o/à/n/ /O/f/f/l/i/n/e/ /c/ủ/a/ /P/h/â/n/ /h/ệ/ /A/I/ | `OnnxEmbeddingService.java` |

## Phạm vi xử lý bắt buộc cho Anti

1. Với **mỗi dòng** 1–78: đối chiếu endpoint thực tế từ @RequestMapping + @GetMapping/@PostMapping… trong Controller; đối chiếu class/service, nguồn UI, database và bằng chứng chạy thật. Ghi đường dẫn và phương thức chính xác. Không dùng tên file tưởng tượng.
2. **Đổi trạng thái** tính năng chưa hiện thực / endpoint không có thành `NOT_IMPLEMENTED`, hoặc `NOT_VERIFIED` nếu thiếu bằng chứng; không giữ nhãn `CODE_VERIFIED` cho chức năng không có code.
3. Các tính năng có chức năng tương tự nhưng khác cách triển khai (ví dụ restore version thay vì recycle bin) phải đổi tên mô tả hoặc tách riêng — không tự nhận hai chức năng là tương đương.
4. Làm đồng nhất **cả ba** `FEATURE_EVIDENCE_MATRIX.md`, `FEATURE_INVENTORY.csv`, `FEATURE_CORRECTIONS.csv` và báo cáo Word. Ghi bảng `trước → sau` cho từng dòng sửa.
5. Không cập nhật trạng thái `LIVE_VERIFIED` từ screenshot riêng: phải có bằng chứng hành vi. Screenshot chủ yếu xác nhận trang hiển thị, không chứng minh chức năng backend đã xử lý.
6. Không sửa chức năng sản phẩm, database, KeyStore, PR #14/#15, main hoặc Railway trong nhiệm vụ hiệu đính này.

**Kết luận:** Tài liệu cần **SOURCE_RECHECK** trước khi được dùng làm cơ sở minh chứng 78/78. Chỉ chốt sau khi tất cả dòng dẫn nguồn và nghiệp vụ khớp mã nguồn hiện hành, hoặc phần chưa triển khai được mô tả trung thực.
