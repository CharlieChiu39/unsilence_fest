# Goods Page Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 `goods.html` 換成 5 類 7 件實際商品，採反差萌（白底圖片 + 暗色 Win95 卡片）佈局。

**Architecture:** `goods.html` 是純 HTML 片段，由 `index.html` 透過 fetch 注入 `.window-content`，所有樣式使用 inline style + CSS 變數（`--highlight-color`、`--win-border`）。圖片檔放在 `images/goods/`，用 `<img>` 標籤載入；圖片就位前會顯示白色空白區塊（非破圖）。

**Tech Stack:** Vanilla HTML / CSS（無框架、無建置步驟）

---

## 檔案結構

| 動作 | 路徑 | 說明 |
|------|------|------|
| 建立目錄 | `images/goods/` | 商品圖片放置處 |
| 修改 | `goods.html` | 完全重寫商品內容 |

圖片命名（需從 .ai 匯出 PNG 透明背景後放入）：
- `images/goods/goods-acrylic.png` — 壓克力吊飾
- `images/goods/goods-towel.png` — 毛巾
- `images/goods/goods-sticker-zh.png` — 貼紙・哪會素勢
- `images/goods/goods-sticker-en.png` — 貼紙・UNILENCE
- `images/goods/goods-sticker-char.png` — 貼紙・光頭大叔
- `images/goods/goods-cupsleeve.png` — 杯套
- `images/goods/goods-lighter.png` — 打火機

---

## Task 1: 建立圖片目錄

**Files:**
- Create: `images/goods/` (空目錄 + .gitkeep)

- [ ] **Step 1: 建立目錄與 .gitkeep**

```bash
mkdir -p images/goods
touch images/goods/.gitkeep
```

Windows PowerShell：
```powershell
New-Item -ItemType Directory -Force "images\goods"
New-Item -ItemType File "images\goods\.gitkeep"
```

- [ ] **Step 2: Commit**

```bash
git add images/goods/.gitkeep
git commit -m "feat: add goods image directory"
```

---

## Task 2: 重寫 goods.html

**Files:**
- Modify: `goods.html` (完全替換)

- [ ] **Step 1: 用以下內容完整替換 goods.html**

```html
<h2 class="blink">> 庫存清單: STORE_DATA</h2>
<div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">

    <!-- 壓克力吊飾 -->
    <div style="border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; padding:10px; text-align:center; background:rgba(10,5,20,0.85);">
        <div style="height:120px; background:#fff; margin-bottom:8px; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden;">
            <img src="images/goods/goods-acrylic.png" alt="壓克力吊飾" style="max-height:100%; max-width:100%; object-fit:contain;">
        </div>
        <strong>壓克力吊飾</strong><br>
        <span style="color:#888; font-size:11px;">Guitar Acrylic Charm</span><br>
        <span style="color:var(--highlight-color); font-size:16px;">NT$ 60</span>
    </div>

    <!-- 毛巾 -->
    <div style="border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; padding:10px; text-align:center; background:rgba(10,5,20,0.85);">
        <div style="height:120px; background:#fff; margin-bottom:8px; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden;">
            <img src="images/goods/goods-towel.png" alt="毛巾" style="max-height:100%; max-width:100%; object-fit:contain;">
        </div>
        <strong>毛巾</strong><br>
        <span style="color:#888; font-size:11px;">Festival Towel</span><br>
        <span style="color:var(--highlight-color); font-size:16px;">NT$ 300</span>
    </div>

    <!-- 貼紙（全寬） -->
    <div style="grid-column:1 / -1; border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; padding:10px; background:rgba(10,5,20,0.85);">
        <div style="text-align:center; margin-bottom:10px;">
            <strong>貼紙 Stickers</strong>
            <span style="color:var(--highlight-color); margin-left:10px;">NT$ 20 / 款</span>
        </div>
        <div style="display:flex; gap:10px;">
            <div style="flex:1; text-align:center;">
                <div style="height:120px; background:#fff; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden; margin-bottom:6px;">
                    <img src="images/goods/goods-sticker-zh.png" alt="哪會素勢貼紙" style="max-height:100%; max-width:100%; object-fit:contain;">
                </div>
                <span style="font-size:11px; color:#aaa;">> 哪會素勢・嘉義限定款</span>
            </div>
            <div style="flex:1; text-align:center;">
                <div style="height:120px; background:#fff; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden; margin-bottom:6px;">
                    <img src="images/goods/goods-sticker-en.png" alt="UNILENCE貼紙" style="max-height:100%; max-width:100%; object-fit:contain;">
                </div>
                <span style="font-size:11px; color:#aaa;">> UNILENCE・霓虹閃電款</span>
            </div>
            <div style="flex:1; text-align:center;">
                <div style="height:120px; background:#fff; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden; margin-bottom:6px;">
                    <img src="images/goods/goods-sticker-char.png" alt="角色版貼紙" style="max-height:100%; max-width:100%; object-fit:contain;">
                </div>
                <span style="font-size:11px; color:#aaa;">> 角色版・音樂節吉祥物款</span>
            </div>
        </div>
    </div>

    <!-- 杯套 -->
    <div style="border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; padding:10px; text-align:center; background:rgba(10,5,20,0.85);">
        <div style="height:120px; background:#fff; margin-bottom:8px; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden;">
            <img src="images/goods/goods-cupsleeve.png" alt="杯套" style="max-height:100%; max-width:100%; object-fit:contain;">
        </div>
        <strong>杯套</strong><br>
        <span style="color:#888; font-size:11px;">Cup Sleeve</span><br>
        <span style="color:var(--highlight-color); font-size:16px;">NT$ 80</span>
    </div>

    <!-- 打火機 -->
    <div style="border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; padding:10px; text-align:center; background:rgba(10,5,20,0.85);">
        <div style="height:120px; background:#fff; margin-bottom:8px; display:flex; align-items:center; justify-content:center; border:inset 2px #555; overflow:hidden;">
            <img src="images/goods/goods-lighter.png" alt="打火機" style="max-height:100%; max-width:100%; object-fit:contain;">
        </div>
        <strong>打火機</strong><br>
        <span style="color:#888; font-size:11px;">Festival Lighter</span><br>
        <span style="color:var(--highlight-color); font-size:16px;">NT$ 40</span>
    </div>

</div>

<!-- 傳輸須知 -->
<div style="margin-top:20px; padding:10px; border:1px dashed var(--win-border); font-size:12px;">
    <strong style="color:var(--highlight-color);">> 傳輸須知：</strong><br>
    > 所有商品為預購制，請填寫表單後保留取貨代碼。<br>
    > 音樂節當日（5/30–31）至周邊攤位出示代碼領取。<br>
    > 如有疑問請透過 IG 私訊聯繫。
</div>
```

- [ ] **Step 2: 在瀏覽器開啟 index.html，點擊周邊商品按鈕，確認：**
  - 2 欄 × 2 列（壓克力+毛巾、杯套+打火機）排列正確
  - 貼紙卡橫跨全寬，3 張圖並排
  - 圖片區顯示白色空白（圖檔尚未放入是正常的，不應出現破圖 icon）
  - NT$ 價格文字顯示為 neon 主色（Noise 模式下為綠色）
  - 卡片有 Win95 凸起邊框效果

- [ ] **Step 3: Commit**

```bash
git add goods.html
git commit -m "feat: replace goods page with actual merchandise"
```

---

## Task 3: 放入商品圖片（人工步驟）

**Files:**
- Add: `images/goods/*.png`（7 張）

- [ ] **Step 1: 從 Adobe Illustrator 匯出各 .ai 檔**

  每個檔案匯出設定：
  - 格式：PNG
  - 背景：透明
  - 解析度：150 dpi（網頁用，不需要 300）
  - 命名對照：

  | .ai 檔 | 匯出命名 |
  |--------|----------|
  | 26寧靜壓克力＿琴.ai | `goods-acrylic.png` |
  | 26寧靜毛巾_exp.ai | `goods-towel.png` |
  | 26寧靜＿打火機.ai | `goods-lighter.png` |
  | 26寧靜杯套.ai | `goods-cupsleeve.png` |
  | 26寧靜＿貼紙＿嘉_exp.ai | `goods-sticker-zh.png` |
  | 26寧靜＿貼紙＿英文.ai | `goods-sticker-en.png` |
  | 光頭大叔貼紙（第3款） | `goods-sticker-char.png` |

- [ ] **Step 2: 將 7 張 PNG 放入 `WEB/images/goods/`**

- [ ] **Step 3: 重新整理瀏覽器，確認：**
  - 7 張商品圖正確顯示
  - 圖片在白色區域內正常縮放（`object-fit: contain`）
  - 貼紙 3 張並排比例正常

- [ ] **Step 4: Commit**

```bash
git add images/goods/
git commit -m "feat: add merchandise product images"
```

---

## 完成標準

- [ ] 周邊商品視窗內顯示 5 張卡（壓克力、毛巾、貼紙全寬、杯套、打火機）
- [ ] 貼紙卡橫跨全寬，3 款並列
- [ ] 每張卡有商品名、英文副標、NT$ 售價
- [ ] 傳輸須知文字正確，無 Google 表單按鈕
- [ ] 圖片就位後，所有商品圖正確顯示（白底、`object-fit: contain`）
