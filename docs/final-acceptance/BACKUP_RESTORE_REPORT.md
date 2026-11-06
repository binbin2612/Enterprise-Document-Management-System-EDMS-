# BÁO CÁO KIỂM THỬ SAO LƯU, PHỤC HỒI & ĐỘ BỀN DỮ LIỆU (DISASTER RECOVERY REPORT)

**Dự án:** EDMS — Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử  
**Mã nguồn PR:** `#15` — `feat(ui): modern aurora redesign, dashboard overhaul & data resilience safeguards`  
**Nhánh QA kiểm định:** `feat/qa-real-docker-ui`  
**Môi trường thực nghiệm:** Docker Desktop Windows (Containerized Postgres 16, Spring Boot 3.2, React 18)  
**Thời gian kiểm định:** 2026-11-06T06:46:49.068Z  
**Trạng thái nghiệm thu:** `READY_FOR_FINAL_OWNER_ACCEPTANCE`  

---

## 1. Mục tiêu và Nguyên tắc Kiểm định

1. **Kiểm tra độ bền dữ liệu khi Container khởi động lại (Container Persistence):**
   - Đảm bảo tài liệu được tải lên hệ thống không bị biến đổi nội dung, không thất thoát metadata, và mã băm SHA-256 sau khi container backend/postgres khởi động lại phải trùng khớp từng bit (bit-exact match).
2. **Kiểm định quy trình Sao lưu An toàn (Zero-Data Mutation Backup):**
   - Thực thi sao lưu toàn diện cả 3 thành phần cốt lõi: Cơ sở dữ liệu PostgreSQL (Custom Format `pg_dump -Fc`), Thư mục lưu trữ vật lý (`storage/uploads`), và Chứng chỉ số/KeyStore (`edms-keystore.p12`).
   - Tuyệt đối không can thiệp lệnh `UPDATE` hoặc `DELETE` trên dữ liệu thật của hệ thống.
3. **Kiểm định Phục hồi trên Môi trường Cô lập (Isolated Disaster Recovery):**
   - Khởi tạo ngăn xếp phục hồi độc lập (`edms-recovery-postgres` cổng 15432, `edms-recovery-backend` cổng 18080, `edms-recovery-frontend` cổng 15173).
   - Nạp lại bản sao lưu qua `pg_restore`, kích hoạt backend độc lập, xác thực đăng nhập, tải lại tài liệu và đối chiếu SHA-256.

---

## 2. Kết quả Thử nghiệm Độ bền Dữ liệu (Container Persistence)

- **Quy trình thực hiện:**
  1. Đăng nhập tài khoản kiểm thử thông qua API `/api/auth/login`.
  2. Tải lên tệp tài liệu kiểm định độ bền với tiêu đề: `QA_Persistence_1793947609371`.
  3. Ghi nhận Document ID: `3725`, kích thước `99 bytes`.
  4. Tính toán mã băm SHA-256 trước khi khởi động lại:
     `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`
  5. Thực hiện lệnh khởi động lại container backend: `docker restart edms-backend`.
  6. Sau khi backend đạt trạng thái Healthy, đăng nhập lại và tải nội dung tệp ID `3725` qua API `/api/documents/3725/download`.
  7. Tính toán mã băm SHA-256 tệp nhận được.

- **Kết quả đối chiếu:**
  - **Mã SHA-256 ban đầu:** `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`
  - **Mã SHA-256 sau restart:** `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`
  - **Đánh giá:** **TRÙNG KHỚP 100% (Bit-exact match)**.
  - **Trạng thái:** `PASS`.

---

## 3. Kết quả Sao lưu Hệ thống (System Backup)

- **Thư mục lưu trữ sao lưu:** `backups/qa_resilience_backup_1793947629581`
- **Các thành phần được lưu trữ:**
  1. **Cơ sở dữ liệu (PostgreSQL Dump):**
     - Lệnh thực thi: `pg_dump -U edms_user -d edms_db -Fc -f database.dump`
     - Dung lượng tệp: `2,109,428 bytes` (~2.1 MB)
     - Mã băm SHA-256: `1b918e8a1540675d0d8e16bb54b6c331485e1e78569d5b7da8e52d92696c1861`
  2. **Thư mục tệp tin tải lên (Storage Archive):**
     - Tổng số tệp tin lưu trữ vật lý: `4,833 tệp`
     - Cấu trúc thư mục được bảo toàn nguyên vẹn.
  3. **Chứng chỉ số ký điện tử (KeyStore):**
     - Tệp sao lưu: `edms-keystore.p12`
     - Dung lượng tệp: `2,676 bytes`
     - Mã băm SHA-256: `fdcd75551abbfa0374df71cd6494209c426498669980121dbbaab90e0e83965e`
  4. **Tệp kê khai toàn vẹn (manifest.json):**
     - Lưu trữ metadata kiểm định, số lượng bản ghi cơ sở, checksum và dấu thời gian.

- **Số lượng bản ghi cơ sở (Baseline Record Counts):**
  - Số lượng người dùng (`users`): **172**
  - Số lượng tài liệu (`documents`): **3,663**
  - Số lượng phiên bản tài liệu (`document_versions`): **4,826**

---

## 4. Kết quả Phục hồi trên Môi trường Cô lập (Isolated Recovery)

- **Cấu hình môi trường phục hồi:**
  - Database: `edms-recovery-postgres` chạy trên cổng độc lập `15432` (không trùng cổng 5432 của hệ thống chính).
  - Backend: `edms-recovery-backend` chạy trên cổng `18080` (không trùng cổng 8080).
  - Frontend: `edms-recovery-frontend` chạy trên cổng `15173` (không trùng cổng 5173).

- **Quy trình thực hiện phục hồi:**
  1. Khởi tạo container PostgreSQL phục hồi sạch.
  2. Thực thi khôi phục cơ sở dữ liệu:
     `pg_restore -U edms_user -d edms_db --clean --if-exists database.dump`
  3. Kiểm tra số lượng bản ghi sau khi phục hồi trên DB cổng 15432:
     - Số lượng người dùng phục hồi: **172** (Khớp 100% với baseline 172)
     - Số lượng tài liệu phục hồi: **3,663** (Khớp 100% với baseline 3,663)
     - Số lượng phiên bản tài liệu phục hồi: **4,826** (Khớp 100% với baseline 4,826)
  4. Khởi động backend phục hồi kết nối tới DB 15432 và thư mục lưu trữ đã phục hồi.
  5. Đăng nhập xác thực qua cổng `18080` và yêu cầu tải về tài liệu kiểm định ID `3725`.
  6. Tính toán mã SHA-256 của tệp phục hồi:
     - **Mã SHA-256 nhận được:** `93c96aa1647b9ddd792b91b3de63797fc5f688383cdfde3e86ac9410488d98c6`
     - **Đối chiếu với SHA-256 gốc:** `TRÙNG KHỚP TUYỆT ĐỐI (100% match)`
  7. Dọn dẹp an toàn các container phục hồi, giải phóng tài nguyên mà không ảnh hưởng cụm container chính.

---

## 5. Kết luận & Cam kết Vận hành

| Chỉ số kiểm định | Tiêu chuẩn chấp thuận | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Tính toàn vẹn tệp tin (File Integrity)** | SHA-256 trùng khớp từng bit | Khớp 100% | **PASS** |
| **Độ bền khi khởi động lại (Restart Resilience)** | Không mất dữ liệu, không lỗi kết nối | Khớp 100% | **PASS** |
| **Bảo toàn số lượng bản ghi (Record Consistency)** | Users: 172, Docs: 3663, Vers: 4826 | Khớp 100% | **PASS** |
| **Tính cô lập môi trường khôi phục (DR Isolation)** | Không can thiệp DB chính, cổng riêng biệt | Hoàn toàn cô lập | **PASS** |
| **Toàn vẹn khóa ký số (KeyStore Hygiene)** | Checksum khớp, không lộ private key | Bảo toàn | **PASS** |

**Kết luận chung:** Cơ chế lưu trữ và phục hồi thảm họa của hệ thống EDMS đáp ứng đầy đủ các yêu cầu khắt khe về độ tin cậy và an toàn thông tin doanh nghiệp.
