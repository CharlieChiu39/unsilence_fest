# skill.md - 寧靜音樂節開發速查手冊

> 實作導向的程式碼食譜。所有範例皆基於 `index.html` 的現有模式。

---

## 目錄

1. [新增子頁面](#1-新增子頁面)
2. [新增導航按鈕](#2-新增導航按鈕)
3. [新增 Teaser 視窗](#3-新增-teaser-視窗)
4. [呼叫特效函式](#4-呼叫特效函式)
5. [CSS 變數速查表](#5-css-變數速查表)
6. [子頁面 HTML 模板](#6-子頁面-html-模板)
7. [常用 CSS Class 速查](#7-常用-css-class-速查)
8. [主題模式判斷](#8-主題模式判斷)

---

## 1. 新增子頁面

### Step 1 — 建立 HTML 片段檔案

在根目錄新增 `newpage.html`（**片段格式，不是完整 HTML 文件**）：

```html
<h2 class="blink" style="color:var(--highlight-color);">> NEWPAGE.exe</h2>
<p style="color:var(--win-text);">頁面說明文字</p>

<!-- 內容放這裡 -->
```

### Step 2 — 加入預載清單（index.html）

找到 `preloadApps()` 函式，在陣列末端加入：

```javascript
const filesToPreload = [
    'news.html', 'lineup.html', 'timetable.html', 'map.html',
    'goods.html', 'guidelines.html', 'credits.html',
    'newpage.html'  // ← 新增
];
```

### Step 3 — 新增導航按鈕（見下節）

---

## 2. 新增導航按鈕

在 `index.html` 的 `.nav-links` 清單中插入：

```html
<li>
    <a data-text="> NEWPAGE_名稱"
       onclick="signalClick(this, 'NEWPAGE.exe', 'newpage.html')">
       >> NEWPAGE_名稱
    </a>
</li>
```

**規則：**
- `data-text` = 亂碼特效的原始文字，與 `a` 標籤內文保持一致
- `onclick` 第一個參數 `this` 固定不變
- 第二個參數為視窗標題（顯示在標題列）
- 第三個參數為 HTML 片段檔案名稱

**最後一項加色（highlight color）：**
```html
<li>
    <a data-text="> CREDITS_名單"
       onclick="signalClick(this, 'CREDITS.txt', 'credits.html')"
       style="color:var(--highlight-color)">
       >> CREDITS_名單
    </a>
</li>
```

---

## 3. 新增 Teaser 視窗

Teaser 視窗是首頁預設顯示的小視窗。

### HTML 結構（放在 `#main-content` 內）

```html
<div class="window teaser-win" id="win-N">
    <div class="window-header">
        <span class="title">🆕 NEWPAGE.exe</span>
        <span class="close-btn">X</span>
    </div>
    <div class="window-content">
        <p>簡短預告文字</p>
        <button class="sys-btn yes"
                onclick="signalClick(this, 'NEWPAGE.exe', 'newpage.html')">
            開啟(Y)
        </button>
    </div>
</div>
```

> `id="win-N"` 中的 N 請接續現有視窗編號（目前最大為 win-7）

### CSS 定位（加在 `<style>` 的媒體查詢前）

```css
#win-N { top: 30vh; left: 60vw; }

@media (max-width: 800px) {
    #win-N { top: 10px; left: 10px; width: 150px; }
}
```

---

## 4. 呼叫特效函式

以下函式已定義於 `index.html`，可在任何 JS 中直接呼叫。

### 爆炸粒子
```javascript
createExplosion(x, y)
// 生成 12 個文字粒子（ERROR / NULL / FATAL / NaN 等）
// 在 pointerdown 事件中取得 e.clientX, e.clientY 傳入
```

### 視窗破裂
```javascript
createShatter(x, y)
// 生成 15 個紫色方塊，向四方射出
// 用在視窗內點擊的回饋效果
```

### 星塵（通常不需手動呼叫）
```javascript
createStardust(x, y)
// 已綁定於 pointermove，通常不需手動呼叫
// Tranquil 模式下自動禁用
```

### 文字亂碼
```javascript
triggerGlitch(el, originalText)
// el: DOM 元素
// originalText: 還原用的原始文字

// 使用範例
const btn = document.querySelector('#my-btn');
btn.addEventListener('mouseover', () => {
    triggerGlitch(btn, btn.textContent);
});
```

### 開啟外部連結（帶警告視窗）
```javascript
openExternalLink('https://example.com')
// 彈出確認視窗，使用者確認後才跳轉
// 所有對外連結都應使用此函式
```

### 導航信號點擊（導航列專用）
```javascript
signalClick(btnElement, windowTitle, fileUrl)
// 觸發 300ms 亂碼 + shake 動畫，然後開啟視窗
// 通常在 onclick 屬性中使用，btnElement 傳入 this
```

---

## 5. CSS 變數速查表

在子頁面中**永遠使用 CSS 變數**，確保三種主題皆正常顯示。

| 變數 | 用途 | Noise | Tranquil | Pineapple |
|------|------|-------|----------|-----------|
| `--bg-color` | 網頁背景 | `#0a0510` | `#111` | `#1a1a00` |
| `--text-color` | 主文字色 | `#0f0` | `#666` | `#00ff00` |
| `--highlight-color` | 強調色 | `#ff00ff` | `#444` | `#ff6600` |
| `--win-bg` | 視窗背景 | `rgba(230,204,255,0.9)` | `rgba(51,45,59,0.9)` | `rgba(255,251,230,0.9)` |
| `--win-border` | 視窗邊框 | `#9d00ff` | `#444` | `#ffcc00` |
| `--win-text` | 視窗內文字 | `#000` | `#e6ccff` | `#004d00` |
| `--btn-bg` | 按鈕背景 | `#d1b3ff` | `#443b4d` | `#ffee99` |
| `--logo-color` | Logo 色 | `#b829ff` | `#888` | `#ffaa00` |
| `--crt-opacity` | CRT 掃描線 | `1` | `0` | `1` |

**使用範例：**
```html
<h2 style="color:var(--highlight-color);">標題</h2>
<p style="color:var(--win-text);">內文</p>
<div style="border:1px solid var(--win-border); background:var(--win-bg);">卡片</div>
```

---

## 6. 子頁面 HTML 模板

以下為可直接複製貼上的標準片段。

### 基本頁面
```html
<h2 class="blink" style="color:var(--highlight-color);">> TITLE.exe</h2>
<p style="color:var(--win-text);">說明文字</p>

<hr style="border-color:var(--win-border); margin:10px 0;">

<p style="color:var(--win-text);">內容段落</p>
```

### 資訊列表
```html
<ul style="list-style:none; padding:0; color:var(--win-text);">
    <li>> 項目一</li>
    <li>> 項目二</li>
    <li style="color:var(--highlight-color);">> 強調項目</li>
</ul>
```

### 卡片（單欄，含圖示區）
```html
<div style="border:1px solid var(--win-border); padding:10px;
            display:flex; gap:15px; align-items:center;
            background:rgba(0,0,0,0.05); margin-bottom:10px;">
    <div style="width:80px; height:80px; background:#333;
                border:inset 2px #555; flex-shrink:0;
                display:flex; align-items:center;
                justify-content:center; color:#fff;
                font-size:10px; text-align:center;">
        [ 圖片 ]
    </div>
    <div style="flex-grow:1; color:var(--win-text);">
        <h3 style="margin:0 0 5px 0;">卡片標題</h3>
        <span style="background:#000; color:#0f0;
                     padding:2px 5px; font-size:12px;">[ 標籤 ]</span>
        <p style="margin:5px 0 0 0; font-size:13px;">描述文字</p>
    </div>
    <a href="#" onclick="event.preventDefault();
                openExternalLink('https://');"
       class="sys-btn yes">連結</a>
</div>
```

### 商品 Grid（2 欄）
```html
<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
    <div style="border:1px solid var(--win-border);
                padding:10px; text-align:center;
                color:var(--win-text);">
        <div style="height:80px; background:#eee; margin-bottom:8px;
                    display:flex; align-items:center;
                    justify-content:center; font-size:12px;">
            [ 圖片 ]
        </div>
        <strong>商品名稱</strong><br>
        <span style="color:var(--highlight-color);">NT$ 000</span>
    </div>
    <!-- 複製上方 div 新增更多商品 -->
</div>
```

### 全寬 CTA 按鈕
```html
<a href="#" onclick="event.preventDefault();
              openExternalLink('https://');"
   class="sys-btn yes blink"
   style="display:block; padding:12px; text-align:center;
          margin-top:15px; font-size:14px;">
    >> 按鈕文字
</a>
```

### 表格
```html
<table style="width:100%; border-collapse:collapse;
              color:var(--win-text); font-size:13px;">
    <thead>
        <tr style="border-bottom:2px solid var(--win-border);">
            <th style="padding:5px; text-align:left;">欄位一</th>
            <th style="padding:5px; text-align:left;">欄位二</th>
        </tr>
    </thead>
    <tbody>
        <tr style="border-bottom:1px solid var(--win-border);">
            <td style="padding:5px;">資料</td>
            <td style="padding:5px;">資料</td>
        </tr>
    </tbody>
</table>
```

---

## 7. 常用 CSS Class 速查

| Class | 用途 | 備註 |
|-------|------|------|
| `.window` | 浮動視窗外框 | 含邊框、陰影、拖曳 |
| `.teaser-win` | 首頁小預告視窗 | 240px 寬 |
| `.window-header` | 視窗標題列（拖曳區） | 背景色 `--win-border` |
| `.window-content` | 視窗內容區（含捲軸） | 背景色 `--win-bg` |
| `.close-btn` | 關閉按鈕 `X` | 已有點擊事件 |
| `.sys-btn` | 復古 3D 按鈕 | 凹陷邊框效果 |
| `.sys-btn.yes` | 確認按鈕（藍色調） | |
| `.sys-btn.no` | 取消按鈕 | |
| `.blink` | 文字閃爍動畫 | 0.5s 週期 |
| `.transmitting` | RGB shake 動畫 | 0.3s，導航按鈕點擊時 |
| `.focused` | 視窗聚焦狀態 | 由 JS 動態加減 |
| `.tranquil-mode` | 寧靜主題（加在 body） | 低對比，禁特效 |
| `.pineapple-mode` | 鳳梨主題（加在 body） | 橘綠配色，鳳梨游標 |

---

## 8. 主題模式判斷

### 在 JS 中判斷當前主題
```javascript
const body = document.body;

if (body.classList.contains('tranquil-mode')) {
    // 寧靜模式
} else if (body.classList.contains('pineapple-mode')) {
    // 鳳梨模式
} else {
    // Noise 模式（預設）
}

// 或使用全局變數
// currentModeIndex: 0 = Noise, 1 = Tranquil, 2 = Pineapple
```

### 在特效中禁用寧靜模式
```javascript
function myEffect(x, y) {
    if (document.body.classList.contains('tranquil-mode')) return;
    // 執行特效...
}
```

### 矩陣背景字符切換（參考模式）
```javascript
// Pineapple 模式使用不同字符集
const isPineapple = document.body.classList.contains('pineapple-mode');
const chars = isPineapple
    ? ['🍍']
    : 'アイウエオカキクケコ寧靜0123456789'.split('');
```
