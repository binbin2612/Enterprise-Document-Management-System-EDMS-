import csv
import os
import hashlib

folder = r"docs\report-huflit\screenshots"
manifest_path = r"docs\report-huflit\SCREENSHOT_MANIFEST.csv"

data = [
    {
        "Tên ảnh": "01_dang_nhap.png",
        "Màn hình": "Trang Đăng nhập (LoginPage)",
        "Vai trò": "Khách vãng lai / Mọi người dùng",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Đăng nhập hệ thống Modern Aurora, xác thực JWT token và phân quyền 3 vai trò",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "02_quan_ly_tai_lieu.png",
        "Màn hình": "Quản lý Tài liệu (DocumentsPage)",
        "Vai trò": "ROLE_ADMIN, ROLE_STAFF, ROLE_USER",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Danh sách 3.667 hồ sơ tài liệu, bộ lọc loại tài liệu, trạng thái vòng đời, nút thao tác",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "03_tai_tai_lieu.png",
        "Màn hình": "Tải lên Tài liệu (UploadModal)",
        "Vai trò": "ROLE_ADMIN, ROLE_STAFF",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Hộp thoại tải lên tệp tin multipart, ràng buộc dung lượng 20MB và nhập siêu dữ liệu",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "04_tim_kiem_ai.png",
        "Màn hình": "Tìm kiếm Ngữ nghĩa AI (DocumentsPage)",
        "Vai trò": "ROLE_ADMIN, ROLE_STAFF, ROLE_USER",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Tìm kiếm ngữ nghĩa ONNX Embedding (multilingual-e5-small) với điểm Cosine thực tế 0.8510",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "05_xet_duyet.png",
        "Màn hình": "Hàng đợi Xét duyệt (ReviewQueuePage)",
        "Vai trò": "ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Hàng đợi và thao tác phê duyệt/từ chối tài liệu (1.277 yêu cầu: 816 duyệt, 212 chờ, 193 từ chối, 56 superseded)",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "06_dashboard.png",
        "Màn hình": "Bảng điều khiển (DashboardPage)",
        "Vai trò": "Mọi người dùng",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Dashboard Modern Aurora: 4 thẻ KPI tổng quan, biểu đồ loại tài liệu và hoạt động gần đây",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "07_nguoi_dung.png",
        "Màn hình": "Quản lý Người dùng (UsersPage)",
        "Vai trò": "ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Quản trị 172 tài khoản người dùng, phân vai trò RBAC (ROLE_ADMIN, ROLE_STAFF, ROLE_USER), khóa/mở",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "08_kiem_toan_thong_bao.png",
        "Màn hình": "Nhật ký Kiểm toán & Thông báo",
        "Vai trò": "ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Nhật ký kiểm toán hệ thống (19.697 bản ghi) kết hợp bảng thông báo trượt (2.394 thông báo)",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "10_phien_ban_tai_lieu.png",
        "Màn hình": "Lịch sử Phiên bản (DocumentVersionModal)",
        "Vai trò": "ROLE_ADMIN, ROLE_STAFF, ROLE_USER (có quyền)",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Quản lý 4.830 phiên bản tệp, đối chiếu mã băm SHA-256, tải xuống và khôi phục phiên bản",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "11_chia_se_phan_quyen.png",
        "Màn hình": "Phân quyền Chia sẻ (DocumentAccessModal)",
        "Vai trò": "Tác giả, ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Cấp và thu hồi quyền truy cập tài liệu chi tiết (READ, WRITE, DELETE, MANAGE) cho người dùng (417 ACLs)",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "12_xem_truoc_chu_ky_so.png",
        "Màn hình": "Xem trước & Chữ ký số (PreviewModal)",
        "Vai trò": "ROLE_ADMIN, ROLE_STAFF, ROLE_USER (có quyền)",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Xem trước tài liệu PDF trực tuyến, hiển thị huy hiệu chữ ký số RSA-2048 xác thực toàn vẹn (447 tệp đã ký)",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "13_hang_doi_tieu_huy.png",
        "Màn hình": "Hàng đợi Tiêu hủy (DispositionQueuePage)",
        "Vai trò": "ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Hàng đợi tiêu hủy và lưu trữ tài liệu (391 hồ sơ: 171 đã duyệt, 83 hủy, 81 từ chối, 56 chờ duyệt)",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "14_trang_thai_he_thong.png",
        "Màn hình": "Giám sát Hệ thống (SystemStatusPage)",
        "Vai trò": "ROLE_ADMIN",
        "URL": "http://localhost:5173",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Giám sát sức khỏe container, kết nối PostgreSQL, ổ đĩa, trạng thái mô hình AI ONNX và OCR",
        "Trạng thái": "LIVE_VERIFIED"
    },
    {
        "Tên ảnh": "15_xac_thuc_cong_khai.png",
        "Màn hình": "Xác thực Chữ ký Công khai (PublicVerifyPage)",
        "Vai trò": "Khách vãng lai / Đối tác công cộng",
        "URL": "http://localhost:5173/verify",
        "Độ phân giải": "1440x900",
        "Chức năng minh chứng": "Cổng tra cứu xác minh chữ ký số X.509 self-signed công khai độc lập không yêu cầu đăng nhập",
        "Trạng thái": "LIVE_VERIFIED"
    }
]

headers = ["Tên ảnh", "Dung lượng (Bytes)", "Mã băm SHA-256", "Độ phân giải", "Màn hình", "Vai trò sử dụng", "URL giao diện", "Chức năng minh chứng", "Trạng thái xác minh"]

rows = []
for item in data:
    img_name = item["Tên ảnh"]
    img_path = os.path.join(folder, img_name)
    size = os.path.getsize(img_path)
    with open(img_path, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest().upper()
    rows.append([
        img_name,
        size,
        sha256,
        item["Độ phân giải"],
        item["Màn hình"],
        item["Vai trò"],
        item["URL"],
        item["Chức năng minh chứng"],
        item["Trạng thái"]
    ])

with open(manifest_path, mode="w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for r in rows:
        writer.writerow(r)

print(f"Successfully generated {manifest_path} with {len(rows)} items.")
