# 親子教育架構（parenting-framework）

把「四湖國中親職教育」講座的內容整理成一個可重複使用的模組：依情境（例如：孩子憤怒、拖延作業、手機衝突、人際衝突）產生不同的講座段落。

## 目前的情境
- `emotion_outburst`：孩子憤怒到極點（師生衝突）
- `exam_drop`：考試退步（小安的故事）
- `school_anxiety`：上學焦慮，說肚子痛
- `procrastination`：拖延作業
- `phone_conflict`：手機使用與親子衝突（行為領域延伸，含系統觀）
- `family_rules`：家庭規範被挑戰
- `interpersonal_conflict`：人際衝突與不敢表達

## 檔案
- `framework.json`：架構資料（I do / You do / We do、4F、SEL 五大核心、冰山、系統觀、各情境的例子與腳本）。
- `generator.js`：`buildPlan(fw, { situation, resultsDisplay })` 依情境產生段落。
- `validate.js`：檢查每個情境的欄位、4F 與 SEL 代碼是否一致（`node validate.js`）。
- `index.html`：簡單的檢視頁，選情境即可看到產生的內容。

## 已納入的修正（對應講座內容檢查的 8 點）
1. 結尾順序改為 Facts → Feelings → Findings → Future，與 4F 一致。
2. 手機衝突列為行為領域的延伸，並可加上過場說明（`leadIn`）與系統觀。
3. 「[講師自己的經驗]」改為明確的 TODO 欄位，產生時會列在「待確認」。
4. 「3C」列為待定義欄位（`tbdFields`），提出的定義僅為建議。
5. 冰山例子「鳥屎」改為待確認的替代用語（`settings.iceExampleReplacement`）。
6. SEL 對應由情境的 `selFocus` 決定，不再用單一台語句硬配。
7. 網頁版與 Slides 的差異改由 `settings.deckVariant` 控制，不再各自維護。
8. 結果顯示方式由 `resultsDisplay`（projector / phone）決定，文字自動跟著改。

## 注意
- 本模組不修改 `sihu-parent-survey` 的 deck.html、deck-offline.html 或 Slides。
- 標註 TODO 的內容需要講師確認後再定稿。
