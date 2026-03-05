# CLAUDE.md - 寧靜音樂節 Unsilence Festival OS

## 專案概覽

**寧靜音樂節 (Unsilence Festival)** 官方網站，風格定位為復古賽博龐克 OS（仿 Windows 95/98）。

- **活動日期**：2026 年 5 月 20 日
- **地點**：嘉義文化創意產業園區（G9 園區，嘉義市中山路 616 號）
- **主辦**：中正大學熱音社
- **協辦**：嘉義文化創意產業園區、中正大學學生會
- **票價**：全程免費入場

---

## 技術棧

- **純靜態網站**：Vanilla HTML / CSS / JavaScript，無框架、無建置步驟
- **字體**：Google Fonts
  - `DotGothic16`：點陣像素字體（導航、UI 文字）
  - `Shippori Mincho B1`：日文襯線字體（Logo）
- **繪圖**：Canvas 2D API（遊戲 + 矩陣背景動畫）
- **版本控制**：Git

---

## 檔案結構

```
WEB/
├── index.html        # 主頁面（核心 HTML + 所有 CSS + JS 邏輯）
├── game.js           # 火雞跑酷遊戲（隱藏彩蛋）
├── news.html         # 最新消息（內容片段，由 index.html 動態載入）
├── lineup.html       # 演出陣容
├── timetable.html    # 時刻表
├── map.html          # 地圖導航
├── goods.html        # 周邊商品
├── guidelines.html   # 安全須知
└── credits.html      # 製作人員名單
```

**注意**：`news.html` ~ `credits.html` 都是 HTML 片段，不是獨立頁面，透過 `fetch` 注入到 `index.html` 的浮動視窗中。

---

## 架構

### 頁面載入機制

1. 頁面初始化時，`preloadAllPages()` 用 `fetch` 預先下載所有子頁面，存入記憶體 `cache` 物件
2. 點擊導航按鈕時，從 `cache` 取出 HTML 注入浮動視窗（`.window-content`）
3. 每個視窗獨立管理，可多視窗並存

### 視窗管理

- 視窗可拖曳（支援滑鼠 `pointerdown` 與觸控）
- 點擊視窗帶到最前（Z-index 提升，加 `focused` class）
- 新視窗位置使用級聯排版（`cascadeX += 30`, `cascadeY += 30`）
- 手機版自動置中

### Z-index 層級

| 元素 | Z-index |
|------|---------|
| 背景矩陣動畫 | 0 |
| 主內容區域 | 1 |
| 浮動視窗 | 100+ (動態) |
| 特效粒子 | 9999 |
| BIOS 開機畫面 | 10000 |

---

## 主題系統

三種模式透過在 `<body>` 上切換 class 實作（CSS 變數覆寫）：

| Class | 模式 | 主色 | 背景色 |
|-------|------|------|--------|
| 無（預設） | Noise 雜訊 | `#0f0`（霓虹綠）+ `#ff00ff`（霓虹粉紫） | `#0a0510`（深紫黑） |
| `tranquil-mode` | Tranquil 寧靜 | `#666`（中灰） | `#111`（深灰） |
| `pineapple-mode` | Pineapple 鳳梨 | `#00ff00`（純綠）+ `#ff6600`（橘） | `#1a1a00`（橄欖綠） |

**寧靜模式特別行為**：
- 禁用星塵效果（`stardustEnabled = false`）
- CRT 掃描線隱藏（`opacity: 0`）
- 矩陣背景停止

**鳳梨模式特別行為**：
- 游標改為鳳梨 emoji（`cursor: url(...) 12 12, auto`）
- 矩陣背景改為 `🍍` 字符

---

## 視覺特效

| 特效 | 觸發條件 | 主要實作位置 |
|------|---------|------------|
| **星塵 (Stardust)** | 滑鼠移動 | `mousemove` listener，符號：`+ □ 0 1 ·` |
| **爆炸粒子 (Explosion)** | 點擊背景空白處 | 粒子文字：`ERROR NULL 0xFF † ⚠ FATAL NaN █` |
| **破裂 (Shatter)** | 點擊視窗內容區 | 15 個紫色方塊（`#9d00ff`）射出 |
| **亂碼 (Glitch)** | Logo/導航連結懸停 | 逐字替換為隨機字符，30ms 更新率 |
| **信號干擾** | 點擊導航按鈕 | 文字亂碼 0.3s + RGB shake 動畫 |
| **矩陣背景** | 常駐（寧靜模式除外） | Canvas，50ms 刷新（20 FPS） |
| **CRT 掃描線** | 常駐（寧靜模式除外） | CSS `animation: rollDown 8s linear infinite` |
| **BIOS 開機** | 頁面首次載入 | CRT 轉開動畫 + 逐行文字列印 |

---

## 遊戲系統（game.js）

**入口**：點擊側邊欄隱藏的 🦃 按鈕。

**遊戲：賽博火雞大逃亡**

| 參數 | 數值 |
|------|------|
| 目標分數 | 100 分 |
| 初始速度 | 8 px/frame |
| 重力加速度 | 1.0 px/frame² |
| 跳躍力量 | -16 px/frame |
| 難度遞增 | 每 30 分加速 0.5 px/frame |
| 幀率 | 60 FPS（requestAnimationFrame） |

**障礙物**：隨機生成 📺 電視 或 🍍 鳳梨

**碰撞檢測**：邊距 15px 的 AABB 包圍盒

**獲勝獎勵**：顯示折扣碼 `TURKEY_BREACH_2026`

---

## CSS 設計慣例

### 復古 OS 邊框（凹陷效果）
```css
border: 2px solid #fff;
border-right-color: #555;
border-bottom-color: #555;
```

### 玻璃擬物化（視窗背景）
```css
backdrop-filter: blur(5px);
-webkit-backdrop-filter: blur(5px);
background: rgba(230, 204, 255, 0.9);
box-shadow: 4px 4px 0px #000;
```

### 標準 blink 動畫（各頁面標題使用）
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

---

## 開發注意事項

1. **無建置步驟**：直接編輯檔案，用瀏覽器開啟 `index.html` 預覽。
2. **新增子頁面**：在根目錄新增 `.html` 檔，並在 `index.html` 的 `preloadAllPages()` 函式與導航按鈕中對應加入。
3. **特效只在 Noise/Pineapple 模式生效**：加入新特效時注意檢查 `stardustEnabled` 旗標。
4. **觸控適配**：所有互動都使用 Pointer Events API，同時支援滑鼠與觸控，不要單獨綁 `mousedown`/`touchstart`。
5. **游標**：Pineapple 模式下游標為鳳梨 SVG，切換模式時需同步更新 `body` style。
6. **外部連結**：所有外部連結（Spotify、Google 表單）都需彈出警告視窗確認，不直接跳轉。
7. **靜態部署**：網站為純靜態，可直接部署到 GitHub Pages 或任何靜態主機。

---

## 演出陣容

| 藝人 | 風格 | 舞台 |
|------|------|------|
| 午夜終端機 (Midnight Terminal) | 迷幻搖滾 / 獨立電子 | NOISE_STAGE |
| 中正熱音社 (CCU Rock) | 開場嘉賓 | SILENCE_STAGE |

**舞台位置**：
- `NOISE_STAGE`：園區左側廣場
- `SILENCE_STAGE`：園區右側倉庫群
