# Phase Four — Session Selection 實作計劃

## 摘要

依 Figma `My Nitra` 節點 `1:3641` 實作 Step 2。使用 mock sessions 作為內容與容量真實來源，Figma 負責版面及 default、selected、sold-out、disabled、error 狀態。

Session 可跨日期自由複選；時間衝突不阻止操作，只在 Step 4 提交後，返回 Step 2 時標示相關 cards。不新增依賴或圖片資產。

## 實作變更

1. **Step 2 畫面與狀態串接**
   - 建立 `SessionStep` 與可重用的 `SessionCard`；`IndexPage` 在 `currentStep === 2` 掛載 Step 2。
   - 直接使用 `groupedSessions`、`selectedSessionIds`、`toggleSession()` 與 `visibleValidationIssues`，不複製 registration state。
   - 日期 tab 是元件內 presentation state，每次掛載預設第一個有效 UTC 日期；切換步驟不影響已選 sessions。
   - 無 sessions 時顯示 `No sessions are available.`，仍可正常前往下一步。

2. **日期導覽與版面**
   - 使用 `QTabs`／`QTab`，日期文字由各 group 第一筆 session 經 `formatUtcDate()` 產生，不硬編 Nov 15／Nov 16。
   - Selected count 顯示跨日期總數，處理 `0 sessions selected`、`1 session selected` 與複數。
   - 套用 Figma 的 40px content padding、24px section gap、4px tab gap、40px segmented control 與 16px card grid gap。
   - `>=768px` 使用兩欄；`<768px` 改為單欄，tabs 可水平捲動，長標題與 speaker 資訊可換行。

3. **Session Card**
   - 使用 `QCard`、`QCheckbox`、`QBadge` 與 `QLinearProgress`；整張可用 card 可點擊，checkbox 保留鍵盤、名稱及 focus semantics，並避免一次點擊觸發兩次 toggle。
   - 顯示 track、title、`speaker, speakerTitle`、UTC time range、容量進度與剩餘名額；description 不顯示。
   - Track 採固定 semantic tone：main／neutral、frontend／accent、backend／info、devops／warning。
   - Default 為 surface card；selected 使用 brand subtle background、2px brand border；補齊 hover、active、focus-visible 與 reduced-motion。
   - `registered >= capacity` 顯示完整 danger progress 與 `Sold Out`。未選的 sold-out card disabled 且不可新增；若 state 中已有 sold-out selection，仍允許取消。
   - 新增純函式計算並 clamp 容量使用率。色階為 `<50%` brand、`50–<75%` warning、`75–<100%` accent、`100%` danger；零容量視為 sold out。

4. **延後衝突錯誤**
   - Submit 前不檢查或顯示 session conflict，Next 仍直接前往 Step 3。
   - Submit 後從 Step 2 的 visible session issues 建立 computed lookup；所有 `targetIds` 對應 cards 使用 danger border／subtle background。
   - Grid 下方顯示既有 validation issue message，使用 `role="alert"`；相關 checkbox 透過 `aria-invalid`、`aria-describedby` 關聯。
   - 返回 Step 2 時於 `nextTick()` 後聚焦第一張 invalid card 的 checkbox；只在掛載時執行，不使用 `watch()` 搶回焦點。
   - Error state 優先於 selected state，但仍允許取消衝突選擇；修正後由 computed validation 即時清除。

## 元件與介面

- `SessionStep`
  - Props：`groupedSessions`、`selectedSessionIds`、`visibleIssues`
  - Emits：`toggle-session(sessionId)`
  - 負責 active date、count、issue mapping、empty state 與首次錯誤聚焦。
- `SessionCard`
  - Props：`session`、`selected`、`soldOut`、`hasError`、`errorMessageId`
  - Emits：`toggle(sessionId)`
  - 保持純展示，不自行檢查 conflicts 或修改 selection array。
- `registrationSchedule`
  - 新增具 JSDoc 的容量使用率函式；現有 grouping、UTC formatting、remaining capacity 與 conflict APIs 維持不變。
- `useRegistrationWizard()` 公開 contract 不變，繼續由 `toggleSession()` 保證 sold-out sessions 不可新增。

## 測試與驗收

- Utility：容量百分比的 0%、邊界、超額、零容量及無效輸入。
- Tabs：UTC 日期排序、日期切換、只顯示 active date sessions、總 selected count、單複數及 empty state。
- Cards：default、selected、sold-out、selected-sold-out、error、track badge、time、remaining spots 與 progress 色階。
- Interaction：整卡點擊、checkbox 點擊只 toggle 一次、Space 操作、disabled session 不可選、跨日期 selections 保留。
- Integration：Step 2 選擇跨時 sessions 後前往 Step 4 提交，返回 Step 2 時所有 conflict cards 顯示 danger state 並聚焦第一張；取消衝突後錯誤即時清除。
- 人工比對 1440、1024、768、375px，檢查 162px desktop card、spacing、wrapping、hover、focus、selected、disabled、error 及無水平溢出。
- 每個 logical slice 後執行 targeted tests；最後在專案指定的 Node `22.17.0` 執行 `yarn test:unit`、`yarn build` 與完整 `REVIEW.md` 自審，總分未達 95/100 前持續修正。
- 實作驗證結果：15 個 test files、60 個 tests 與 production build 均通過。
- 建議 commit：`feat: implement session selection`

## 假設與取捨

- Mock 的 WebDev Summit 2028、timestamps、容量與 sold-out 狀態優先於 Figma 的 2025 範例內容。
- Sessions 為選填；零選取不構成 validation issue。
- Figma 中與 mock 不一致的 selected／disabled cards 僅用於視覺狀態參考。
- Active date tab 不納入 registration state；只保留實際 session selections。
- 不新增 dependencies、assets、Pinia、watch 或額外 UI library。
