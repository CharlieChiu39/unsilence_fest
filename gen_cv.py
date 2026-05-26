import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT

pdfmetrics.registerFont(TTFont('JhengHei', 'C:/Windows/Fonts/msjh.ttc'))
pdfmetrics.registerFont(TTFont('JhengHeiBold', 'C:/Windows/Fonts/msjhbd.ttc'))

OUT = 'C:/Users/Acer/Downloads/413410095-邱鉦仁-CV.pdf'
PAGE_W, PAGE_H = A4
MARGIN_L, MARGIN_R = 2.2 * cm, 2.2 * cm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN_L, rightMargin=MARGIN_R,
    topMargin=1.3 * cm, bottomMargin=1.3 * cm,
)

ZH, ZHB = 'JhengHei', 'JhengHeiBold'
ACCENT = colors.HexColor('#2c3e50')
SUBTLE = colors.HexColor('#7f8c8d')
DARK = colors.HexColor('#1a1a1a')
GRAY = colors.HexColor('#444444')
LIGHT = colors.HexColor('#666666')
LINK = colors.HexColor('#2980b9')

S = {
    'name': ParagraphStyle('name', fontName=ZHB, fontSize=22, textColor=DARK,
                            leading=26, spaceAfter=4, alignment=TA_LEFT),
    'contact': ParagraphStyle('contact', fontName=ZH, fontSize=9.5,
                               textColor=LIGHT, leading=14, alignment=TA_LEFT),
    'section_zh': ParagraphStyle('section_zh', fontName=ZHB, fontSize=13,
                                  textColor=ACCENT, leading=16),
    'section_en': ParagraphStyle('section_en', fontName=ZH, fontSize=9,
                                  textColor=SUBTLE, leading=16, alignment=TA_RIGHT),
    'item_title': ParagraphStyle('item_title', fontName=ZHB, fontSize=11.5,
                                  textColor=DARK, leading=15, spaceAfter=1),
    'item_sub': ParagraphStyle('item_sub', fontName=ZH, fontSize=10,
                                textColor=GRAY, leading=14),
    'item_date': ParagraphStyle('item_date', fontName=ZH, fontSize=9.5,
                                 textColor=LIGHT, leading=15, alignment=TA_RIGHT),
    'project_desc': ParagraphStyle('project_desc', fontName=ZH, fontSize=10,
                                    textColor=GRAY, leading=14, spaceAfter=5),
    'bullet': ParagraphStyle('bullet', fontName=ZH, fontSize=9.5,
                              textColor=DARK, leading=13.5, leftIndent=14,
                              firstLineIndent=-14, spaceAfter=2),
    'normal': ParagraphStyle('normal', fontName=ZH, fontSize=10.5,
                              textColor=DARK, leading=15, spaceAfter=4),
    'link': ParagraphStyle('link', fontName=ZH, fontSize=9.5,
                            textColor=LINK, leading=14, spaceAfter=2, spaceBefore=3),
}


def section(zh, en):
    inner = Table(
        [[Paragraph(zh, S['section_zh']),
          Paragraph(en.upper(), S['section_en'])]],
        colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.5]
    )
    inner.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 1.2, ACCENT),
    ]))
    return inner


def two_col_row(left_html, right_html):
    t = Table(
        [[Paragraph(left_html, S['item_title']),
          Paragraph(right_html, S['item_date'])]],
        colWidths=[CONTENT_W * 0.72, CONTENT_W * 0.28]
    )
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


story = []

# === 頁首 ===
story.append(Paragraph('邱鉦仁　<font size="13" color="#7f8c8d">Charlie Chiu</font>', S['name']))
story.append(Paragraph(
    '資工系大二　｜　'
    '<link href="mailto:charlie940115@gmail.com" color="#666666">charlie940115@gmail.com</link>'
    '　｜　'
    '<link href="https://github.com/CharlieChiu39" color="#666666">github.com/CharlieChiu39</link>',
    S['contact']
))
story.append(Spacer(1, 14))

# === 學歷 ===
story.append(section('學歷', 'Education'))
story.append(Spacer(1, 8))
story.append(two_col_row('國立中正大學　資訊工程學系', '2024 – 至今'))
story.append(Paragraph('大學部二年級', S['item_sub']))
story.append(Spacer(1, 9))

# === 技術能力 ===
story.append(section('技術能力', 'Technical Skills'))
story.append(Spacer(1, 8))
skill_table = Table([
    [Paragraph('<b>程式語言</b>', S['normal']),
     Paragraph('C / C++、JavaScript、HTML / CSS、Python', S['normal'])],
    [Paragraph('<b>相關課程</b>', S['normal']),
     Paragraph('資料結構 (99 分)、數位電子學、組合語言、電路學', S['normal'])],
], colWidths=[3.2 * cm, CONTENT_W - 3.2 * cm])
skill_table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ('TOPPADDING', (0, 0), (-1, -1), 1),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
]))
story.append(skill_table)
story.append(Spacer(1, 9))

# === 語言能力 ===
story.append(section('語言能力', 'Language Skills'))
story.append(Spacer(1, 8))
lang_table = Table([
    [Paragraph('<b>多益 (TOEIC)</b>', S['normal']),
     Paragraph('855 分', S['normal'])],
], colWidths=[3.2 * cm, CONTENT_W - 3.2 * cm])
lang_table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
]))
story.append(lang_table)
story.append(Spacer(1, 9))

# === 專案經歷 ===
story.append(section('專案經歷', 'Projects'))
story.append(Spacer(1, 10))

# 寧靜音樂節
story.append(two_col_row(
    '寧靜音樂節官方網站　<font color="#7f8c8d" size="10">UNSILENCE FESTIVAL 2026</font>',
    'Vanilla HTML / CSS / JS'
))
story.append(Paragraph(
    '中正大學熱音社音樂節官方網站，個人獨立完成並部署上線，活動兩天服務數百名觀眾',
    S['project_desc']
))
for b in [
    '<b>多視窗並存系統</b>：每個視窗獨立管理 Z-index 與焦點，使用 Pointer Events API 同時相容滑鼠與觸控，以級聯演算法自動排列視窗位置',
    '<b>預載與快取機制</b>：頁面初始化時 fetch 預載全部子頁面並存入 cache 物件，點擊時零延遲注入 DOM；三主題切換（Noise / Tranquil / Pineapple）透過 CSS 變數動態覆寫',
    '<b>Canvas 應用</b>：隱藏彩蛋遊戲（固定時間步迴圈 60 FPS、AABB 碰撞檢測）；動態生成時刻表 PNG 海報，透過 Web Share API 分享至手機相簿',
    '<b>完整 SEO</b>：自訂網域 <link href="https://unsilence-fest.com" color="#2980b9"><u>unsilence-fest.com</u></link> 串接 Cloudflare DNS、Schema.org 三套結構化資料（MusicEvent / FAQPage / Organization）、Python Pillow 生成 1200×630 OG image、sitemap.xml + robots.txt',
    '<b>資安強化</b>：Content Security Policy、Referrer-Policy、JS frame-buster 防 clickjacking、外部連結 URL 白名單、textContent + DOM API 取代 innerHTML 防 XSS',
    '<b>效能與無障礙</b>：PNG 圖片 quantize 壓縮 90%（1.2 MB → 127 KB）、Mobile 端關閉 backdrop-filter 與降低背景動畫頻率、WCAG 觸控目標 ≥ 44 px、focus-visible 鍵盤導覽',
]:
    story.append(Paragraph(f'•　{b}', S['bullet']))
story.append(Paragraph(
    '🔗　<link href="https://unsilence-fest.com" color="#2980b9"><u>unsilence-fest.com</u></link>',
    S['link']
))
story.append(Spacer(1, 9))

# 中正大學吃什麼？
story.append(two_col_row(
    '中正大學吃什麼？　<font color="#7f8c8d" size="10">CCU FOOD ROULETTE</font>',
    'Vanilla HTML / CSS / JS'
))
story.append(Paragraph(
    '解決中正大學周邊餐廳「選擇困難」的隨機推薦網頁應用，個人獨立完成',
    S['project_desc']
))
for b in [
    '建立 <b>80+ 間餐廳結構化資料庫</b>（料理類型、餐期、價位、每日營業時段），實作多維篩選邏輯與即時營業狀態判斷',
    '收藏／封鎖清單以 <b>localStorage 持久化</b>；Canvas 轉盤依篩選結果動態更新',
]:
    story.append(Paragraph(f'•　{b}', S['bullet']))
story.append(Paragraph(
    '🔗　<link href="https://charliechiu39.github.io/Don-t-know-what-to-eat-" color="#2980b9"><u>charliechiu39.github.io/Don-t-know-what-to-eat-</u></link>',
    S['link']
))
story.append(Spacer(1, 9))

# === 課外經歷 ===
story.append(section('課外經歷', 'Activities'))
story.append(Spacer(1, 8))
story.append(two_col_row(
    '中正大學熱門音樂社　<font color="#444444" size="10">網路管理幹部</font>',
    '2025 – 至今'
))
story.append(Paragraph('•　負責社團網路基礎設施管理與技術支援、社團活動官方網站開發', S['bullet']))

doc.build(story)
import os
print(f'OK: {OUT}  ({os.path.getsize(OUT) // 1024} KB)')
