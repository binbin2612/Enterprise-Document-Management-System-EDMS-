-- EDMS / HUFLIT — ĐỐI SOÁT CHỈ ĐỌC
-- Chạy bằng tài khoản chỉ có quyền SELECT trên đúng database edms_db của phiên bản demo.
-- Không sử dụng UPDATE, DELETE, INSERT, ALTER, TRUNCATE hoặc lệnh ghi nào.
-- Ghi lại thời gian thực thi, tên môi trường và kết quả để cập nhật Word/Slide.

BEGIN TRANSACTION READ ONLY;

SELECT CURRENT_TIMESTAMP AS snapshot_time, current_database() AS database_name;

-- Tổng số liệu
SELECT 'users' AS bang, COUNT(*) AS so_luong FROM users
UNION ALL SELECT 'documents', COUNT(*) FROM documents
UNION ALL SELECT 'document_versions', COUNT(*) FROM document_versions
UNION ALL SELECT 'document_reviews', COUNT(*) FROM document_reviews
UNION ALL SELECT 'document_dispositions', COUNT(*) FROM document_dispositions
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'saved_searches', COUNT(*) FROM saved_searches
UNION ALL SELECT 'document_permissions', COUNT(*) FROM document_permissions
UNION ALL SELECT 'document_semantic_chunks', COUNT(*) FROM document_semantic_chunks
ORDER BY bang;

-- Vai trò sử dụng thực tế
SELECT role, COUNT(*) AS so_luong
FROM users GROUP BY role ORDER BY role;

-- Toàn bộ trạng thái xét duyệt, kể cả SUPERSEDED
SELECT status, COUNT(*) AS so_luong
FROM document_reviews GROUP BY status ORDER BY status;

-- Toàn bộ trạng thái tiêu hủy, kể cả REJECTED và CANCELLED
SELECT status, COUNT(*) AS so_luong
FROM document_dispositions GROUP BY status ORDER BY status;

-- Thử nghiệm read-only hoàn tất: không có sửa đổi dữ liệu
COMMIT;

-- Những thuộc tính có thể khác giữa các phiên bản schema (ocr_status,
-- signature_status, semantic_status...) cần xác minh tên cột ở schema mới nhất
-- trước khi bổ sung truy vấn; không giả định tên cột.
