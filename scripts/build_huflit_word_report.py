import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()

    # Page setup: Standard A4 with 2.5cm margins
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles setup
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(30, 41, 59)
    style_normal.paragraph_format.line_spacing = 1.25
    style_normal.paragraph_format.space_after = Pt(6)

    # Helper function for headings
    def add_custom_heading(text, level, space_before=12, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        if level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(15, 23, 42)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        elif level == 2:
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(30, 58, 138)
        elif level == 3:
            run.font.size = Pt(12.5)
            run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_callout(text, bold_prefix="LƯU Ý: "):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.right_indent = Inches(0.4)
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(6)
        run_b = p.add_run(bold_prefix)
        run_b.bold = True
        run_b.font.color.rgb = RGBColor(194, 65, 12)
        run_t = p.add_run(text)
        run_t.italic = True
        run_t.font.color.rgb = RGBColor(71, 85, 105)

    def add_image_with_caption(img_rel_path, fig_num, caption_text, width_inches=6.0):
        full_path = os.path.join(r"docs\report-huflit\screenshots", img_rel_path)
        if os.path.exists(full_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.add_run().add_picture(full_path, width=Inches(width_inches))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(12)
            run_lbl = p_cap.add_run(f"Hình {fig_num}: ")
            run_lbl.bold = True
            run_lbl.font.size = Pt(11)
            run_txt = p_cap.add_run(caption_text)
            run_txt.italic = True
            run_txt.font.size = Pt(11)
        else:
            p_err = doc.add_paragraph(f"[Chưa tìm thấy ảnh: {img_rel_path}]")
            p_err.runs[0].font.color.rgb = RGBColor(220, 38, 38)

    # ==================== COVER PAGE ====================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(20)
    p_inst.paragraph_format.space_after = Pt(4)
    run = p_inst.add_run("TRƯỜNG ĐẠI HỌC NGOẠI NGỮ - TIN HỌC TP. HỒ CHÍ MINH (HUFLIT)\nKHOA CÔNG NGHỆ THÔNG TIN")
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(15, 23, 42)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_after = Pt(60)
    p_div.add_run("-------------------***-------------------").bold = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    run_t1 = p_title.add_run("BÁO CÁO ĐỒ ÁN MÔN HỌC\nCÔNG NGHỆ PHẦN MỀM NÂNG CAO\n\n")
    run_t1.bold = True
    run_t1.font.size = Pt(15)
    run_t1.font.color.rgb = RGBColor(30, 58, 138)

    run_t2 = p_title.add_run("XÂY DỰNG HỆ THỐNG QUẢN LÝ VÀ LƯU TRỮ\nTÀI LIỆU ĐIỆN TỬ DOANH NGHIỆP (EDMS)\n")
    run_t2.bold = True
    run_t2.font.size = Pt(18)
    run_t2.font.color.rgb = RGBColor(15, 23, 42)

    run_t3 = p_title.add_run("(HỒ SƠ ĐỐI SOÁT KỸ THUẬT & MINH CHỨNG SẢN PHẨM HOÀN THIỆN)")
    run_t3.italic = True
    run_t3.font.size = Pt(12)
    run_t3.font.color.rgb = RGBColor(71, 85, 105)

    p_info = doc.add_paragraph()
    p_info.paragraph_format.space_before = Pt(80)
    p_info.paragraph_format.space_after = Pt(60)
    p_info.paragraph_format.left_indent = Inches(1.5)
    
    info_lines = [
        ("Mã môn học:", "CNPMNC"),
        ("Khóa học:", "2026 - 2027"),
        ("Nhóm sinh viên:", "Nhóm 5 thành viên (Đồ án môn học)"),
        ("Trưởng nhóm & BA:", "Võ Trọng Hiếu"),
        ("Phân tích hệ thống (UML):", "Viên Bảo Đức"),
        ("Lập trình Backend:", "Trần Quyền Minh"),
        ("Lập trình Frontend:", "Nguyễn Quốc Huy"),
        ("Cơ sở dữ liệu & DevOps:", "Đinh Thanh Tùng"),
        ("Thực hành Lab 1 (Cuốn chiếu):", "Võ Trọng Hiếu (47 SP) & Tạ Gia Tín (32 SP)")
    ]
    for lbl, val in info_lines:
        r1 = p_info.add_run(f"{lbl:<32}")
        r1.bold = True
        r1.font.size = Pt(11.5)
        r2 = p_info.add_run(f"{val}\n")
        r2.font.size = Pt(11.5)

    p_footer = doc.add_paragraph()
    p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_footer.add_run("TP. HỒ CHÍ MINH — THÁNG 11/2026").bold = True
    doc.add_page_break()

    # ==================== EXECUTIVE SUMMARY ====================
    add_custom_heading("TỔNG QUAN HỒ SƠ ĐỐI SOÁT SẢN PHẨM (06/11/2026)", 1)
    
    p = doc.add_paragraph(
        "Báo cáo này là bản đối soát kỹ thuật toàn diện phục vụ nghiệm thu đồ án môn học Công nghệ phần mềm nâng cao "
        "tại Trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT). Hồ sơ được thiết lập dựa trên mã nguồn thực tế tại "
        "nhánh docs/huflit-factcheck-20261106 (tham chiếu PR #15 commit 43bea99) và cơ sở dữ liệu PostgreSQL 16 (edms_db) "
        "đang vận hành trực tiếp trong môi trường Docker Compose."
    )
    
    add_callout(
        "Báo cáo tuân thủ nghiêm ngặt nguyên tắc trung thực học thuật: Mọi số liệu báo cáo đều có căn cứ từ câu lệnh SQL "
        "chỉ đọc (READ ONLY), 14 ảnh chụp màn hình được trích xuất tự động từ giao diện thực tế ở độ phân giải 1440x900 "
        "với 0 lỗi console, và toàn bộ 78 chức năng được phân loại rõ ràng giữa chức năng kiểm chứng trực tiếp (LIVE_VERIFIED) "
        "và chức năng kiểm chứng qua mã nguồn (CODE_VERIFIED). Tuyệt đối không sử dụng dữ liệu giả lập hay vẽ biểu đồ Gantt giả mạo."
    )

    # Key metrics table
    t_sum = doc.add_table(rows=1, cols=3)
    t_sum.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = t_sum.rows[0].cells
    hdr_cells[0].text = "Chỉ số hệ thống"
    hdr_cells[1].text = "Giá trị kiểm chứng SQL (06/11/2026)"
    hdr_cells[2].text = "Ý nghĩa kỹ thuật & Đối soát"
    for c in hdr_cells:
        set_cell_shading(c, "1E3A8A")
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        c.paragraphs[0].runs[0].bold = True

    metrics = [
        ("Số người dùng hoạt động", "172 tài khoản", "168 ROLE_STAFF, 3 ROLE_ADMIN, 1 ROLE_USER (Khớp enum Role.java)"),
        ("Tổng số hồ sơ tài liệu", "3.667 hồ sơ", "Gồm 3.663 tài liệu baseline QA + 4 tài liệu kiểm thử phân quyền phát sinh"),
        ("Tổng số phiên bản tệp", "4.830 phiên bản", "Lưu trữ tệp nhị phân, kiểm tra toàn vẹn mã băm SHA-256"),
        ("Hồ sơ quy trình xét duyệt", "1.277 quy trình", "816 APPROVED, 212 PENDING, 193 REJECTED, 56 SUPERSEDED"),
        ("Hàng đợi tiêu hủy hồ sơ", "391 yêu cầu", "171 APPROVED, 83 CANCELLED, 81 REJECTED, 56 PENDING"),
        ("Nhật ký kiểm toán hệ thống", "19.697 bản ghi", "Ghi nhận bất biến qua AOP phục vụ an ninh và truy vết"),
        ("Chữ ký số điện tử PKI", "447 phiên bản đã ký", "Thuật toán SHA256withRSA, chứng chỉ X.509 self-signed RSA-2048"),
        ("Mô hình AI nhúng (ONNX)", "multilingual-e5-small", "Chạy offline cục bộ, 384 chiều, điểm Cosine thực tế 0.8510"),
        ("Công cụ OCR quang học", "Tesseract OCR 4.1.1", "211 phiên bản có ocr_status = READY (tiếng Việt + tiếng Anh)")
    ]

    for m, v, n in metrics:
        row = t_sum.add_row()
        row.cells[0].text = m
        row.cells[0].paragraphs[0].runs[0].bold = True
        row.cells[1].text = v
        row.cells[2].text = n
        for c in row.cells:
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)

    doc.add_page_break()

    # ==================== CHƯƠNG 1 ====================
    add_custom_heading("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ MÔ HÌNH PHÁT TRIỂN", 1)
    
    add_custom_heading("1.1. Đặt vấn đề và Mục tiêu đề tài", 2)
    doc.add_paragraph(
        "Trong bối cảnh chuyển đổi số của các cơ quan nhà nước và doanh nghiệp, khối lượng văn bản, hợp đồng, chứng từ "
        "điện tử gia tăng nhanh chóng đòi hỏi một giải pháp lưu trữ tập trung, an toàn, có khả năng tra cứu thông minh "
        "và kiểm soát chặt chẽ vòng đời tài liệu. Hệ thống Quản lý và Lưu trữ Tài liệu Điện tử (Enterprise Document "
        "Management System - EDMS) được nghiên cứu và xây dựng nhằm giải quyết toàn diện bài toán này."
    )
    doc.add_paragraph(
        "Mục tiêu cốt lõi của đồ án bao gồm:\n"
        "1. Quản lý vòng đời tài liệu toàn diện: từ tiếp nhận, lập chỉ mục, phân loại, chia sẻ, xét duyệt cho đến tiêu hủy an toàn.\n"
        "2. Tích hợp công nghệ hiện đại: Tìm kiếm ngữ nghĩa AI bằng mô hình nhúng cục bộ ONNX (hoạt động 100% offline bảo mật), "
        "nhận dạng ký tự quang học Tesseract OCR tiếng Việt, và chữ ký số điện tử PKI theo tiêu chuẩn X.509.\n"
        "3. Đảm bảo an toàn thông tin: Phân quyền truy cập 3 cấp (RBAC), kiểm soát quyền chi tiết trên từng tài liệu (ACL), "
        "mã hóa mật khẩu bằng BCrypt, xác thực JWT không trạng thái và ghi nhật ký kiểm toán bất biến."
    )

    add_custom_heading("1.2. Phân định rõ ràng giữa Bài tập Lab 1 và Đồ án nhóm chuyên trách", 2)
    doc.add_paragraph(
        "Để bảo đảm sự minh bạch học thuật, đồ án làm rõ ranh giới giữa hai hình thức phân công trong môn học:"
    )
    doc.add_paragraph(
        "a) Phân công bài tập thực hành Lab 1 (Mô hình cuốn chiếu 2 sinh viên - Tỉ lệ 60/40):\n"
        "- Căn cứ tài liệu: Product Backlog chuẩn Lab1_EDMS_2SV_CuonChieu_60-40.xlsx.\n"
        "- Sinh viên 1: Võ Trọng Hiếu — Phụ trách 47 Story Points (59.5% khối lượng).\n"
        "- Sinh viên 2: Tạ Gia Tín — Phụ trách 32 Story Points (40.5% khối lượng).\n"
        "- Quy mô: 26 User Stories, 79 Story Points qua 4 Sprints, đạt tỉ lệ hoàn thành 100%.\n\n"
        "b) Phân công kỹ thuật Đồ án nhóm môn học (5 thành viên chuyên trách):\n"
        "- Võ Trọng Hiếu: Trưởng nhóm & Phân tích nghiệp vụ (Project Lead & Business Analyst).\n"
        "- Trần Quyền Minh: Trưởng nhóm kỹ thuật Backend (Backend Technical Lead).\n"
        "- Nguyễn Quốc Huy: Lập trình viên Frontend chính (Frontend Developer).\n"
        "- Viên Bảo Đức: Phân tích hệ thống & Thiết kế UML (System Analyst & Designer).\n"
        "- Đinh Thanh Tùng: Quản trị cơ sở dữ liệu & Vận hành (DBA & DevOps Specialist)."
    )

    # ==================== CHƯƠNG 2 ====================
    add_custom_heading("CHƯƠNG 2: PHÂN TÍCH YÊU CẦU & PRODUCT BACKLOG", 1)
    
    add_custom_heading("2.1. Ma trận 26 User Stories và 79 Story Points (Lab 1 Traceability)", 2)
    doc.add_paragraph(
        "Bảng dưới đây thống kê đầy đủ 26 User Stories thuộc Product Backlog chính thức của môn học, được hiện thực "
        "qua 4 Sprint liên tục không ngắt quãng và không reset cơ sở dữ liệu:"
    )

    t_backlog = doc.add_table(rows=1, cols=5)
    t_backlog.alignment = WD_TABLE_ALIGNMENT.CENTER
    b_hdrs = t_backlog.rows[0].cells
    b_hdrs[0].text = "User Story"
    b_hdrs[1].text = "Tên chức năng"
    b_hdrs[2].text = "SP"
    b_hdrs[3].text = "Sprint"
    b_hdrs[4].text = "Phân công & Trạng thái"
    for c in b_hdrs:
        set_cell_shading(c, "1E3A8A")
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        c.paragraphs[0].runs[0].bold = True

    stories_data = [
        ("US-01", "Đăng nhập hệ thống (JWT Authentication)", "2", "Sprint 1", "Tạ Gia Tín — DONE"),
        ("US-02", "Đăng xuất và hủy token", "1", "Sprint 1", "Tạ Gia Tín — DONE"),
        ("US-03", "Xem danh sách hồ sơ tài liệu", "3", "Sprint 1", "Võ Trọng Hiếu — DONE"),
        ("US-10", "Tải lên tệp tài liệu mới (Multipart)", "5", "Sprint 1", "Võ Trọng Hiếu — DONE"),
        ("US-11", "Tạo bản ghi dữ liệu tài liệu", "3", "Sprint 1", "Tạ Gia Tín — DONE"),
        ("US-12", "Nhập và cập nhật siêu dữ liệu tài liệu", "3", "Sprint 1", "Võ Trọng Hiếu — DONE"),
        ("US-15", "Xem danh sách tài liệu cá nhân", "2", "Sprint 1", "Tạ Gia Tín — DONE"),
        ("US-04", "Tìm kiếm tài liệu đa tiêu chí", "5", "Sprint 2", "Võ Trọng Hiếu — DONE"),
        ("US-05", "Lọc kết quả tìm kiếm theo loại và trạng thái", "3", "Sprint 2", "Võ Trọng Hiếu — DONE"),
        ("US-06", "Tùy chọn hiển thị cột bảng kết quả", "3", "Sprint 2", "Tạ Gia Tín — DONE"),
        ("US-08", "Xem trước tệp và chi tiết tài liệu", "3", "Sprint 2", "Tạ Gia Tín — DONE"),
        ("US-09", "Tải xuống tệp tài liệu", "2", "Sprint 2", "Võ Trọng Hiếu — DONE"),
        ("US-13", "Chỉnh sửa thông tin hồ sơ tài liệu", "3", "Sprint 2", "Võ Trọng Hiếu — DONE"),
        ("US-14", "Phân loại hồ sơ tài liệu doanh nghiệp", "3", "Sprint 2", "Tạ Gia Tín — DONE"),
        ("US-07", "Lưu và tái sử dụng bộ lọc tìm kiếm", "3", "Sprint 3", "Võ Trọng Hiếu — DONE"),
        ("US-21", "Xem danh sách tài khoản người dùng", "2", "Sprint 3", "Võ Trọng Hiếu — DONE"),
        ("US-22", "Tạo mới tài khoản người dùng", "3", "Sprint 3", "Tạ Gia Tín — DONE"),
        ("US-23", "Cập nhật thông tin người dùng", "3", "Sprint 3", "Tạ Gia Tín — DONE"),
        ("US-24", "Khóa / Kích hoạt tài khoản người dùng", "2", "Sprint 3", "Võ Trọng Hiếu — DONE"),
        ("US-25", "Gán vai trò cho người dùng (RBAC)", "3", "Sprint 3", "Tạ Gia Tín — DONE"),
        ("US-26", "Quản lý vai trò và quyền hạn", "5", "Sprint 3", "Võ Trọng Hiếu — DONE"),
        ("US-16", "Bảng điều khiển trung tâm (Dashboard)", "5", "Sprint 4", "Võ Trọng Hiếu — DONE"),
        ("US-17", "Thống kê phân bổ loại tài liệu", "3", "Sprint 4", "Tạ Gia Tín — DONE"),
        ("US-18", "Thống kê tần suất truy cập và sử dụng", "3", "Sprint 4", "Võ Trọng Hiếu — DONE"),
        ("US-19", "Xem lịch sử hoạt động tải lên gần đây", "3", "Sprint 4", "Tạ Gia Tín — DONE"),
        ("US-20", "Xem nhật ký kiểm toán hệ thống (Audit Logs)", "3", "Sprint 4", "Võ Trọng Hiếu — DONE")
    ]

    for sid, sname, sp, spr, stt in stories_data:
        row = t_backlog.add_row()
        row.cells[0].text = sid
        row.cells[0].paragraphs[0].runs[0].bold = True
        row.cells[1].text = sname
        row.cells[2].text = sp
        row.cells[3].text = spr
        row.cells[4].text = stt
        for c in row.cells:
            set_cell_margins(c, top=60, bottom=60, left=80, right=80)

    # ==================== CHƯƠNG 3 ====================
    add_custom_heading("CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC & CƠ SỞ DỮ LIỆU", 1)
    
    add_custom_heading("3.1. Kiến trúc Tổng thể và Công nghệ 3 Tầng", 2)
    doc.add_paragraph(
        "Hệ thống EDMS được thiết kế theo mô hình kiến trúc phân tầng chuyên nghiệp (3-Tier Architecture), đóng gói "
        "hoàn chỉnh trong Docker Compose để dễ dàng triển khai và kiểm thử:\n"
        "- Frontend Tier: Xây dựng bằng React 18, Vite, TypeScript và hệ thống thiết kế Modern Aurora UI. Giao diện "
        "hỗ trợ chuyển đổi mượt mà giữa Light Mode và Dark Mode, đáp ứng đa độ phân giải (từ màn hình desktop 1440x900 "
        "đến màn hình di động 390x844).\n"
        "- Backend Tier: Xây dựng bằng Spring Boot 3.3.4 trên nền tảng Java 17. Cung cấp hệ thống REST API bảo mật với "
        "Spring Security 6, xử lý bất đồng bộ lập chỉ mục AI qua ONNX Runtime và nhận diện ký tự qua Tesseract OCR 4.1.1.\n"
        "- Database Tier: Sử dụng PostgreSQL 16 (database edms_db) với 10 bảng dữ liệu quan hệ, tích hợp ràng buộc khóa ngoại, "
        "chỉ mục tìm kiếm B-Tree và lưu trữ tệp nhị phân trên persistent volume."
    )

    add_custom_heading("3.2. Mô hình Phân quyền RBAC 3 Cấp Thực Tế", 2)
    doc.add_paragraph(
        "Đối soát trực tiếp mã nguồn Backend (com.edms.entity.Role) và Frontend (UsersPage.tsx) xác nhận hệ thống áp dụng "
        "chính xác 3 vai trò, không có vai trò ảo:\n"
        "1. Quản trị viên (ROLE_ADMIN - 3 tài khoản): Toàn quyền cấu hình, phê duyệt yêu cầu xét duyệt, phê duyệt tiêu hủy, "
        "quản lý tài khoản người dùng, xem KPI Dashboard và nhật ký kiểm toán.\n"
        "2. Chuyên viên nghiệp vụ (ROLE_STAFF - 168 tài khoản): Soạn thảo, tải lên tài liệu mới, tạo phiên bản mới, gửi yêu cầu "
        "xét duyệt, ký số trên văn bản được giao, chia sẻ quyền tài liệu.\n"
        "3. Người dùng cơ bản (ROLE_USER - 1 tài khoản): Tra cứu danh sách tài liệu công khai / nội bộ được chia sẻ, xem trước "
        "trực tuyến, tải xuống và lưu bộ lọc tìm kiếm cá nhân."
    )

    add_custom_heading("3.3. Lược đồ Cơ sở Dữ liệu Quan hệ 10 Bảng (edms_db)", 2)
    doc.add_paragraph(
        "Cơ sở dữ liệu gồm 10 bảng nghiệp vụ có cấu trúc chặt chẽ:\n"
        "1. users: Quản lý thông tin tài khoản, mật khẩu băm BCrypt, vai trò và trạng thái.\n"
        "2. documents: Quản lý hồ sơ tài liệu, tiêu đề, loại hồ sơ, trạng thái vòng đời (ACTIVE, DRAFT, APPROVED, DESTROYED), hạn lưu trữ.\n"
        "3. document_versions: Quản lý tệp nhị phân từng phiên bản, kích thước, mã băm SHA-256, chữ ký số và trạng thái OCR/Semantic.\n"
        "4. document_permissions: Quản lý danh sách phân quyền chia sẻ cấp tài liệu (ACL: READ, WRITE, DELETE, MANAGE_ACCESS).\n"
        "5. document_reviews: Quản lý quy trình phê duyệt tài liệu (4 trạng thái: PENDING, APPROVED, REJECTED, SUPERSEDED).\n"
        "6. document_dispositions: Quản lý hàng đợi tiêu hủy tài liệu hết hạn (4 trạng thái: PENDING, APPROVED, REJECTED, CANCELLED).\n"
        "7. audit_logs: Ghi nhận nhật ký kiểm toán bất biến phục vụ an ninh và truy vết thao tác.\n"
        "8. notifications: Quản lý thông báo hệ thống gửi theo thời gian thực.\n"
        "9. saved_searches: Lưu trữ các bộ lọc tìm kiếm thường dùng của từng người dùng.\n"
        "10. document_semantic_chunks: Lưu trữ 411 đoạn văn bản vector hóa 384 chiều phục vụ tìm kiếm ngữ nghĩa AI."
    )

    # ==================== CHƯƠNG 4 ====================
    add_custom_heading("CHƯƠNG 4: THIẾT KẾ HỆ THỐNG HƯỚNG ĐỐI TƯỢNG (UML)", 1)
    doc.add_paragraph(
        "Mô hình hóa hệ thống được thiết kế đồng bộ 1:1 với mã nguồn đang vận hành, bàn giao đầy đủ cho thành viên phụ trách "
        "UML (Viên Bảo Đức) tại tài liệu docs/report-huflit/STARUML_HANDOFF.md để dựng sơ đồ StarUML:"
    )
    doc.add_paragraph(
        "- 4 Actor hệ thống: ROLE_ADMIN, ROLE_STAFF, ROLE_USER và Public Guest (Khách tra cứu công khai không cần tài khoản).\n"
        "- 6 Gói Use Case: Quản lý Xác thực & Tài khoản, Quản lý Hồ sơ & Phiên bản, Phân quyền Truy cập (ACL), Tìm kiếm Nâng cao "
        "& AI Ngữ nghĩa, Quy trình Xét duyệt & Vòng đời Tiêu hủy, Chữ ký số PKI & Tra cứu Công khai.\n"
        "- Sơ đồ Hoạt động (Activity Diagrams): Thể hiện luồng tải lên và xử lý bất đồng bộ đa luồng (Tệp -> Lưu đĩa -> OCR -> AI Vector), "
        "luồng chuyển trạng thái xét duyệt (4 trạng thái) và luồng quét tiêu hủy định kỳ.\n"
        "- Sơ đồ Trình tự (Sequence Diagrams): Mô tả chi tiết tương tác thông điệp giữa React Component -> Controller -> Service -> "
        "Repository -> Database/Engine cho các ca nghiệp vụ trọng yếu."
    )

    # ==================== CHƯƠNG 5 ====================
    add_custom_heading("CHƯƠNG 5: HIỆN THỰC HỆ THỐNG & MINH CHỨNG SẢN PHẨM", 1)
    doc.add_paragraph(
        "Toàn bộ 14 ảnh chụp màn hình minh chứng dưới đây được chụp trực tiếp từ môi trường Chromium headless tại độ phân giải "
        "chuẩn 1440x900 trên giao diện Modern Aurora đang chạy thực tế (không có dữ liệu mẫu mockData, 0 lỗi console):"
    )

    # Insert 14 screenshots
    add_image_with_caption("01_dang_nhap.png", "5.1", "Giao diện Đăng nhập hệ thống EDMS Modern Aurora, xác thực JWT và phân quyền")
    add_image_with_caption("02_quan_ly_tai_lieu.png", "5.2", "Màn hình Quản lý Danh sách 3.667 Hồ sơ Tài liệu doanh nghiệp và bộ lọc đa tiêu chí")
    add_image_with_caption("03_tai_tai_lieu.png", "5.3", "Hộp thoại Tải lên Tài liệu mới (UploadModal), kiểm tra dung lượng 20MB và nhập siêu dữ liệu")
    add_image_with_caption("04_tim_kiem_ai.png", "5.4", "Tìm kiếm Ngữ nghĩa AI nhúng ONNX (multilingual-e5-small) với điểm tương đồng Cosine thực tế 0.8510")
    add_image_with_caption("05_xet_duyet.png", "5.5", "Hàng đợi Công việc và Xét duyệt Tài liệu (1.277 yêu cầu: 816 duyệt, 212 chờ, 193 từ chối, 56 superseded)")
    add_image_with_caption("06_dashboard.png", "5.6", "Bảng điều khiển Trung tâm Thống kê Dashboard: 4 thẻ KPI tổng quan, biểu đồ loại hồ sơ và hoạt động mới")
    add_image_with_caption("07_nguoi_dung.png", "5.7", "Quản trị 172 Tài khoản Người dùng, phân quyền RBAC 3 vai trò và khóa/kích hoạt tài khoản")
    add_image_with_caption("08_kiem_toan_thong_bao.png", "5.8", "Nhật ký Kiểm toán Hệ thống (19.697 bản ghi) kết hợp Bảng thông báo trượt thời gian thực")
    add_image_with_caption("10_phien_ban_tai_lieu.png", "5.9", "Quản lý Lịch sử 4.830 Phiên bản Tài liệu, đối chiếu mã băm SHA-256 và khôi phục phiên bản")
    add_image_with_caption("11_chia_se_phan_quyen.png", "5.10", "Phân quyền Chia sẻ Tài liệu Động cấp ACL (417 bản ghi cấp quyền READ, WRITE, DELETE, MANAGE)")
    add_image_with_caption("12_xem_truoc_chu_ky_so.png", "5.11", "Xem trước Tài liệu PDF Trực tuyến và Huy hiệu Xác thực Chữ ký số RSA-2048 (447 tệp đã ký)")
    add_image_with_caption("13_hang_doi_tieu_huy.png", "5.12", "Hàng đợi Tiêu hủy Tài liệu Quá hạn Lưu trữ (391 hồ sơ: 171 đã duyệt, 83 hủy, 81 từ chối, 56 chờ duyệt)")
    add_image_with_caption("14_trang_thai_he_thong.png", "5.13", "Giám sát Sức khỏe và Trạng thái Hệ thống (Liveness, Readiness, PostgreSQL, Dung lượng ổ đĩa, AI ONNX)")
    add_image_with_caption("15_xac_thuc_cong_khai.png", "5.14", "Cổng Tra cứu Xác thực Chữ ký số Công khai Độc lập (/verify) không yêu cầu đăng nhập")

    # ==================== CHƯƠNG 6 ====================
    add_custom_heading("CHƯƠNG 6: CÁC PHÂN HỆ NÂNG CAO (AI, OCR & CHỮ KÝ SỐ)", 1)
    
    add_custom_heading("6.1. Phân hệ Tìm kiếm Ngữ nghĩa AI ONNX Cục bộ", 2)
    doc.add_paragraph(
        "Khác với các hệ thống thông thường phụ thuộc vào API bên ngoài (như OpenAI) tiềm ẩn nguy cơ rò rỉ bí mật kinh doanh, "
        "EDMS nhúng trực tiếp mô hình AI đa ngôn ngữ multilingual-e5-small-onnx-int8-v1 vào bộ nhớ nội bộ của container backend:\n"
        "- Trọng lượng mô hình: 118MB (file model.onnx) kết hợp bộ mã hóa từ vựng 17MB (tokenizer.json).\n"
        "- Không gian vector: 384 chiều biểu diễn ngữ nghĩa chính xác.\n"
        "- Khả năng vận hành: Hoạt động hoàn toàn Offline, tốc độ suy luận dưới 50ms trên CPU chuẩn.\n"
        "- Kết quả kiểm thử thực tế: Khi tìm kiếm bằng ngôn ngữ tự nhiên, hệ thống trả về điểm tương đồng Cosine đạt 0.8510 "
        "và đánh dấu cờ semanticMatched = true."
    )

    add_custom_heading("6.2. Phân hệ Nhận dạng Ký tự Quang học (Tesseract OCR)", 2)
    doc.add_paragraph(
        "Tích hợp engine Tesseract OCR 4.1.1 hỗ trợ ngôn ngữ tiếng Việt (vie) và tiếng Anh (eng). Khi tải lên các tệp tài liệu "
        "dạng scan hoặc hình ảnh, tiến trình nền tự động trích xuất nội dung văn bản thuần vào trường ocr_text của bảng "
        "document_versions. Trong cơ sở dữ liệu thực tế, đã có 211 phiên bản tài liệu hoàn tất OCR sẵn sàng phục vụ tìm kiếm toàn văn."
    )

    add_custom_heading("6.3. Phân hệ Chữ ký số Doanh nghiệp PKI RSA", 2)
    doc.add_paragraph(
        "Bảo đảm tính toàn vẹn và chống chối bỏ cho hồ sơ tài liệu theo chuẩn PKI:\n"
        "- Thuật toán mật mã: SHA256withRSA kết hợp khóa RSA 2048-bit.\n"
        "- Lưu trữ khóa: Java KeyStore PKCS#12 đặt tại đường dẫn runtime mặc định /app/keys/edms-signing.p12 (khóa riêng được bảo vệ tuyệt đối).\n"
        "- Phân loại chứng chỉ: Chứng chỉ số X.509 v3 tự ký (self-signed) do hệ thống tự sinh với thời hạn 10 năm.\n"
        "- Cổng xác minh công khai: Đối tác bên ngoài có thể tải tệp lên /verify để đối soát mã băm và kiểm tra chứng chỉ mà không cần quyền truy cập nội bộ."
    )

    # ==================== CHƯƠNG 7 ====================
    add_custom_heading("CHƯƠNG 7: KẾT QUẢ ĐỐI SOÁT, VẬN HÀNH & KẾT LUẬN", 1)
    
    add_custom_heading("7.1. Kết quả Vận hành và Kiểm thử Chất lượng", 2)
    doc.add_paragraph(
        "Hệ thống đã trải qua quá trình kiểm thử chất lượng đa tầng nghiêm ngặt:\n"
        "- 57 ca kiểm thử hồi quy tự động (test_regression.py) đạt tỉ lệ đạt 100% (57/57 PASS).\n"
        "- 31 ca kiểm thử QA thực tế (12 Visual Pass, 7 Integration Pass, 12 E2E Pass) ghi nhận trong TEST_CASE_MATRIX.csv.\n"
        "- Vận hành liên tục không lỗi trên 3 Docker containers (Frontend, Backend, PostgreSQL)."
    )

    add_custom_heading("7.2. Quản lý An toàn Thông tin và Vấn đề An ninh Mở", 2)
    doc.add_paragraph(
        "Dự án tuân thủ các quy tắc an toàn thông tin doanh nghiệp:\n"
        "- Mật khẩu người dùng được băm một chiều bằng thuật toán BCrypt với Salt ngẫu nhiên.\n"
        "- Phiên làm việc quản lý qua JWT Access Token và Refresh Token có cơ chế thu hồi (Token Blacklist).\n"
        "- Ghi nhận rủi ro còn mở tại Ticket EDMS-SEC-201: Kế hoạch xoay vòng mật khẩu quản trị (PASSWORD_ROTATION_PENDING) "
        "được duy trì quản lý nội bộ, bảo đảm không đưa thông tin mật khẩu kiểm thử vào báo cáo công khai."
    )

    add_custom_heading("7.3. Kết luận và Hướng phát triển", 2)
    doc.add_paragraph(
        "Đồ án EDMS đã hoàn thành xuất sắc các mục tiêu đề ra cho môn học Công nghệ phần mềm nâng cao tại HUFLIT. "
        "Sản phẩm không chỉ đáp ứng trọn vẹn nghiệp vụ quản lý tài liệu điện tử theo chuẩn doanh nghiệp mà còn tiên phong "
        "tích hợp thành công mô hình AI ngữ nghĩa ONNX chạy offline và chữ ký số PKI. Toàn bộ mã nguồn, dữ liệu thực tế "
        "và hình ảnh minh chứng đã được đối soát đồng bộ, minh bạch và hoàn toàn sẵn sàng cho buổi bảo vệ trước Hội đồng chấm thi."
    )

    output_path1 = r"docs\report-huflit\BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx"
    output_path2 = r"phân công và báo cáo\báo cáo\tiến độ\BAO_CAO_DO_AN_EDMS_HUFLIT_DaDoiSoat.docx"

    doc.save(output_path1)
    print(f"Saved: {output_path1}")
    doc.save(output_path2)
    print(f"Saved: {output_path2}")

if __name__ == "__main__":
    create_report()
