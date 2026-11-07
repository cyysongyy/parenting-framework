# 親子教育架構（parenting-framework）

把「四湖國中親職教育」講座整理成可重複使用的模組：同一個情境，依孩子的年段（國小／國中／高中）產生六個層次的內容，並支援家長／學生問卷統計。

## 六個層次
1. **邏輯一貫性**：每個情境有一條主線（水面上行為 → 感受與需求 → 價值信念 → 用到的能力 → 約定）。4F 與冰山對應：Facts→行為、Feelings→感受與需求、Findings→價值信念、Future→把新做法帶回水面（與講座 rel 頁一致）。
2. **冰山模式**：先孩子、後父母，三層；並說明兩座冰山如何碰撞。
3. **I do · You do · We do**：每個階段有目的、講師與家長的動作、成果。
4. **4F 模式**：每一步有提問、示範說法、要避免的話，以及對應的冰山層與 SEL 核心。
5. **對象**：國小／國中／高中。步驟不變，改變語氣、決策權、冰山深度與約定方式。
6. **提問與互動**：提問階梯、猜一猜（逐次揭曉）、冰山配對、4F 排序、角色換位、承諾約定；加上問卷統計。

## 問卷：家長／學生
- 兩種身分用同一組選項（家長版為原文，學生版為第一人稱改寫），統計時以原選項對應。
- 統計並排顯示家長與學生的比例，落差達 15 個百分點時標示「家長更多／學生更多」。
- 依兩邊比例（落差加權）把 30 個情境（情緒、行為、人際各 10 個）排序，決定今天先討論哪些。
- 送到 Apps Script 的格式：`{ role, emotion, behavior, social }`。`sihu-parent-survey` 的 Code.gs 需另外新增 `role` 欄；本模組不修改該專案。

## 情境（8 個 × 3 個年段）
孩子憤怒到極點、考試退步、上學焦慮、拖延作業、手機使用與親子衝突、家庭規範被挑戰、人際衝突與不敢表達、被排擠／孤立／網路霸凌。

## 檔案
- `framework.json`：架構資料。
- `generator.js`：`buildPlan`、`buildInteractions`、`surveySpec`、`tally`、`compare`、`insights`、`recommendFromSurvey`、`checkCoherence`。
- `index.html`：GitHub Pages 的入口頁，是視覺改版後的單一檔案版本（內嵌資料，雙擊即可開啟）。
- `src/index.src.html`：檢視頁原始碼（讀取 framework.json，需 GitHub Pages 或本機伺服器）。
- `demo-offline.html`：由原始碼產生的單一檔案離線版，`node build-offline.js`。
- 若修改了 framework.json 或 generator.js，`index.html` 內嵌的資料不會自動更新，需要重新產生。
- `validate.js`：`node validate.js` 檢查所有情境與年段是否完整一致。

## 待確認（TODO）
- 各情境的「[講師自己的經驗]」。
- 「3C」的定義（`tbdFields`）。
- 冰山例子「鳥屎」的替代用語（`settings.iceExampleReplacement`）。
- 各年段的情境內容為草稿，請依實際經驗調整。

本模組不修改 `sihu-parent-survey` 的 deck.html、deck-offline.html、Slides 或問卷。

## 首頁（講師主線）

`index.html` 是給講師用的一條邏輯主線，不是遊戲：

1. 開場：情境、一條「行為→感受→信念→能力→約定」的邏輯鏈、開場問卷
2. I do：家長的冰山（先看自己）＋講師示範＋聽眾一句話
3. You do：孩子的冰山、SEL 五大核心對應、系統層次、年段對話重點
4. We do：4F 逐步對照冰山層與 SEL 核心（Facts→Feelings→Findings→Future）
5. 約定：約定選擇、收束四句話、可複製或列印的約定卡

每一階段結尾有「承接語」，把上一段留下的問題交給下一段。頂端可切換情境、年段，並有「投影大字」模式與「問卷統計」。
`full.html` 是完整六層次總覽。重新產生：`node build-home.js`（來源 `src/home.src.html`、`src/home.css`）。

## 輔導式內容與「我的問題」（v2.1）

- 每個情境新增：`counselorQuestions`（例外／量尺／期待／資源四種啟發式提問）、`selQuestions`（SEL 五核心各一個提問）、每個年段的 `options`（孩子可選的做法）；`future` 與 `chain.agreement` 改寫成「孩子參與決定、大人也承擔」；`wedoScript` 四個 F 都補齊。`core.counselorStance` 是六項輔導立場。
- 首頁頂端「✨ 我的問題」：內建 30 個情境（情緒、行為、人際各 10 個）以外的問題，可先比對內建情境，沒有符合再用 AI 依同一套架構產生新情境（需要自己的 Anthropic API key，在「⚙ API key 設定」輸入）。key 只存在使用者的瀏覽器（預設關閉分頁即清除，可勾選記住），呼叫只送到 api.anthropic.com，不會進入程式碼或 repo。
- AI 產生的內容是草稿，需由輔導專業判斷後使用；涉及自傷、虐待、暴力或霸凌時，會要求附上轉介建議。

## 兩種講題模式（v2.3）

首頁頂端可切換：

- **問題導引**（原本的模式，未更動）：情境 → 冰山 → SEL → 4F → 約定。
- **理論到實務**（講者模式，80 分鐘）：破題 5 → 理論一冰山 8 → 理論二 SEL 7 → 方法 4F 12 → 操作程序（I do 15 → You do 12 → We do 13）→ 帶回家 8。I do / You do / We do 是帶領全場的**操作程序**，不是理論：每一步有「講者做什麼、學員做什麼、產出、時間」。
- 理論內容在 `framework.json` 的 `theory`；各理論的 `source` 是「待講者確認出處」的建議，不是已查證的引用。

## 問卷診斷（理論模式第 5 階段）
- 問卷結果 → 往水面下問兩層（結構層、價值信念層）→ 診斷結論（水面上／結構層／信念）、4F 起手式、建議進入 I do 的情境、轉介提醒。
- 資料在 `framework.json` 的 `theory.diagnosis`，內容取自講座 deck 的冰山分析、You do、4F 頁；邏輯在 `generator.js` 的 `diagnose()`。
- 理論模式時間軸改為 9 階段（仍為 80 分鐘）。

## 現場 QR 問卷（即時統計）
- 首頁「現場問卷」：投影 QR Code（指向 sihu-parent-survey 問卷）＋已填人數＋最常勾選項目，每 5 秒讀取一次後端。
- 後端沿用 `sihu-parent-survey` 的 Apps Script（`framework.json` → `survey.live.api`，只讀 GET，不修改該專案）。該後端只收家長答案、不分角色。
- 即時資料會合併進「問卷統計」與理論模式的「問卷診斷」；可一鍵從現場資料進入診斷。
- QR 圖檔：`assets/survey-qr.png`（內嵌進 index.html，離線也能顯示）。

## 第三個模式：簡化版（冰山＋4F）
只用兩個工具：開場（情境）→ 冰山（兩座冰山、往下問三次）→ 4F（含 What/How/Why/When 與句型）→ 約定卡。不含 SEL 與 I/You/We do。與其他兩個模式共用同一組 30 情境與三個年段。
