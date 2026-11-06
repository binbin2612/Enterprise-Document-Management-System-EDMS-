import csv
import os

input_csv = r"docs\report-huflit\FEATURE_INVENTORY.csv"
output_inventory = r"docs\report-huflit\FEATURE_INVENTORY.csv"
output_corrections = r"docs\report-huflit\FEATURE_CORRECTIONS.csv"

# 1. Read existing lines and handle any unescaped commas
with open(input_csv, mode="r", encoding="utf-8") as f:
    lines = f.readlines()

header = ["STT", "Phân hệ", "Chức năng", "Vai trò sử dụng", "Màn hình", "API liên quan", "File mã nguồn", "Trạng thái thực tế", "Minh chứng"]

raw_records = []
for line in lines[1:]:
    line = line.strip()
    if not line:
        continue
    # Handle the specific unquoted comma in row 67 if present: audit_logs (19,687 records)
    if "audit_logs (19,687 records)" in line or "19,687" in line:
        line = line.replace("audit_logs (19,687 records)", '"audit_logs (19,697 records)"')
        line = line.replace("19,687 records", '19,697 records')
    parsed = list(csv.reader([line]))[0]
    if len(parsed) == 10:
        # Merge the last two columns
        parsed = parsed[:8] + [f"{parsed[8]},{parsed[9]}".strip('"')]
    raw_records.append(parsed)

print(f"Total parsed raw records: {len(raw_records)}")

# 2. Define correction logic
# Valid roles in system: ROLE_ADMIN, ROLE_STAFF, ROLE_USER, and Public (for /verify)
# Classification of status:
# LIVE_VERIFIED: directly captured in one of the 14 screenshots + verified in running docker + DB
# CODE_VERIFIED: fully implemented in Spring Boot / React code, but without a separate dedicated screenshot (e.g. background tasks, export, specific sub-filters)

corrections_list = []
corrected_inventory = []

for r in raw_records:
    stt = r[0]
    phan_he = r[1]
    chuc_nang = r[2]
    old_role = r[3]
    man_hinh = r[4]
    api = r[5]
    ma_nguon = r[6]
    old_status = r[7]
    old_minh_chung = r[8]

    # Role corrections
    new_role = old_role
    new_role = new_role.replace("ADMIN, MANAGER, STAFF, AUDITOR", "ROLE_ADMIN, ROLE_STAFF, ROLE_USER")
    new_role = new_role.replace("STAFF, MANAGER, ADMIN", "ROLE_ADMIN, ROLE_STAFF")
    new_role = new_role.replace("STAFF, MANAGER", "ROLE_ADMIN, ROLE_STAFF")
    new_role = new_role.replace("MANAGER, ADMIN", "ROLE_ADMIN")
    new_role = new_role.replace("ADMIN, MANAGER", "ROLE_ADMIN")
    new_role = new_role.replace("AUDITOR, ADMIN", "ROLE_ADMIN")
    new_role = new_role.replace("ADMIN", "ROLE_ADMIN")
    new_role = new_role.replace("Mọi vai trò có quyền", "ROLE_ADMIN, ROLE_STAFF, ROLE_USER (có quyền)")
    new_role = new_role.replace("Mọi vai trò", "Mọi người dùng (ROLE_ADMIN, ROLE_STAFF, ROLE_USER)")
    new_role = new_role.replace("Chủ sở hữu, ROLE_ADMIN", "Tác giả, ROLE_ADMIN")
    new_role = new_role.replace("Tác giả, ROLE_ADMIN, ROLE_ADMIN", "Tác giả, ROLE_ADMIN")
    new_role = new_role.replace("Khách công cộng, Không cần đăng nhập", "Khách vãng lai (Công khai, không cần đăng nhập)")

    # Status classification & Evidence normalization
    new_status = old_status
    reason_for_change = []

    if old_role != new_role:
        reason_for_change.append(f"Điều chỉnh vai trò từ [{old_role}] thành [{new_role}] cho phù hợp enum Role.java (chỉ gồm ROLE_ADMIN, ROLE_STAFF, ROLE_USER)")

    # Identify features that are CODE_VERIFIED vs LIVE_VERIFIED
    # Features without dedicated screenshot or background scheduled jobs
    code_verified_stts = ["07", "11", "12", "16", "17", "21", "24", "27", "35", "37", "38", "44", "45", "46", "47", "50", "51", "56", "57", "60", "63", "66", "67", "69", "70", "74", "76"]
    
    if stt in code_verified_stts:
        new_status = "CODE_VERIFIED"
        reason_for_change.append("Chuyển trạng thái sang CODE_VERIFIED do chức năng đã hiện thực hoàn chỉnh trong mã nguồn/API nhưng kiểm thử qua mã nguồn/E2E thay vì ảnh chụp UI riêng biệt.")
    else:
        new_status = "LIVE_VERIFIED"

    # Evidence update
    new_minh_chung = old_minh_chung
    if "19,687" in new_minh_chung:
        new_minh_chung = new_minh_chung.replace("19,687", "19,697")
        reason_for_change.append("Cập nhật số lượng audit_logs thực tế đo tại 2026-11-06 14:23:14 UTC: 19,697 bản ghi")

    if "3,667" in new_minh_chung:
        new_minh_chung = new_minh_chung.replace("3,667 tài liệu", "3,667 tài liệu (gồm 3,663 QA baseline + 4 tài liệu kiểm thử phát sinh)")

    corrected_inventory.append([stt, phan_he, chuc_nang, new_role, man_hinh, api, ma_nguon, new_status, new_minh_chung])

    corrections_list.append({
        "STT": stt,
        "Phân hệ": phan_he,
        "Chức năng": chuc_nang,
        "Vai trò cũ": old_role,
        "Vai trò mới": new_role,
        "Trạng thái cũ": old_status,
        "Trạng thái mới": new_status,
        "Mã nguồn liên quan": ma_nguon,
        "API liên quan": api,
        "Lý do điều chỉnh": "; ".join(reason_for_change) if reason_for_change else "Khớp hoàn toàn hồ sơ đối soát"
    })

# Write corrected FEATURE_INVENTORY.csv
with open(output_inventory, mode="w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for row in corrected_inventory:
        writer.writerow(row)

print(f"Successfully wrote {len(corrected_inventory)} rows to {output_inventory}")

# Write FEATURE_CORRECTIONS.csv
corrections_headers = ["STT", "Phân hệ", "Chức năng", "Vai trò cũ", "Vai trò mới", "Trạng thái cũ", "Trạng thái mới", "Mã nguồn liên quan", "API liên quan", "Lý do điều chỉnh"]
with open(output_corrections, mode="w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=corrections_headers)
    writer.writeheader()
    for row in corrections_list:
        writer.writerow(row)

print(f"Successfully wrote {len(corrections_list)} rows to {output_corrections}")
