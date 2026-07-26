# Phase Three — Ticket 與 Attendee Information 實作計劃

## 摘要

依 Figma `1:3525` 實作 Step 1，將既有 `useRegistrationWizard()` 的 ticket、attendee、merchandise 與 validation state 接到 Quasar UI。初始畫面不顯示錯誤，Next 直接前往 Step 2；只有 Step 4 提交失敗後，返回 Step 1 才呈現 inline errors 並聚焦第一個無效控制項。

不新增依賴、不修改既有驗證規則，也不使用 Figma 的 2025 範例資料；ticket 與活動內容以 `WebDev Summit 2028` mocks 為準。

## 實作變更

1. **Step 1 畫面與資料串接**
   - 建立 Step 1 容器、Ticket Selection、Ticket Card 與 Attendee Form 元件；`IndexPage` 僅在 `currentStep === 1` 掛載，其他步驟暫時維持空內容。
   - 直接消費既有 `ticketTypeId`、`attendee`、`hasSelectedMerchandise`、`visibleValidationIssues`、`selectTicket()` 與 `nextStep()`，不建立第二份 local state。
   - Next 保持無條件導航，不呼叫 `QForm.validate()`、`submit()` 或提前設定 touched/error 狀態。

2. **Ticket Selection**
   - 使用 `QCard`、`QRadio`、`QBadge` 與 `QIcon`；整張 card 可點擊，radio group 具備 `role="radiogroup"`、可存取名稱與鍵盤 Space／方向鍵操作。
   - 從 mock 渲染名稱、whole-dollar USD 價格、描述及 perks；generic check icon 使用 Quasar glyph，不新增圖片資產。
   - Desktop `>=1024px` 三欄、tablet `768–1023px` 兩欄、mobile 單欄；desktop cards 等高且至少 288px。
   - Default card 使用 surface-l1、1px neutral border、6px radius 與 card shadow；selected 使用 brand-subtle background、2px brand border 及 `✓ Selected` badge，並補齊 hover、active、focus-visible 狀態。
   - Ticket issue 顯示 danger border 與 group-level error message，透過 `aria-invalid`／`aria-describedby` 關聯；submit 前不顯示。

3. **Attendee Form**
   - 使用 `QForm` 與六個 `QInput`；可編輯欄位透過 named `defineModel()` 接回唯一 registration state，避免 prop mutation、watch 或 duplicated state。
   - Full Name／Email、Phone／Company 在 `>=768px` 為雙欄；Job Title／Shipping Address 全寬；mobile 全部單欄。
   - 套用 Figma 的 32px section gap、24px column gap、20px row gap、6px label gap 與 44px input 高度；樣式只使用既有 semantic tokens、CSS variables 及 UnoCSS shortcuts。
   - 設定正確的 `type`、`autocomplete` 與 input semantics：name、email、tel、organization、organization-title、street-address。
   - Inline error 完全由 `visibleValidationIssues` 驅動：required、email 及 phone 訊息沿用既有 validation utility，使用 QInput `error`／`error-message`，修正後由 computed state 即時清除。
   - 無商品時顯示 `Shipping Address (Optional)`；商品數量大於零時改為 `Shipping Address` 並視為必填。提交後仍為空時顯示 Figma danger border 與 shipping error message。

4. **錯誤導覽與整合**
   - Step 1 容器將 issues 依 `targetType`／`targetIds` 建立 computed lookup，僅處理 Step 1 presentation mapping，不搬移或重複 business validation。
   - 元件因錯誤導覽返回 Step 1 而重新掛載時，在 `nextTick()` 後依 DOM 順序聚焦第一個無效控制項：ticket error 聚焦第一張 radio，否則聚焦第一個 invalid `QInput`。
   - 聚焦只在掛載且已有 visible issues 時執行，不使用 `watch()` 持續搶回焦點。
   - 更新 `IndexPage` 的 composable destructuring 與 bindings；`useRegistrationWizard()` 公開 contract、validation schema 及 Action Bar contract 維持不變。

## 元件介面

- `AttendeeStep`
  - Props：`ticketTypes`、`visibleIssues`、`shippingRequired`
  - Models：`ticketTypeId` 與六個 attendee string fields
  - 負責 section 組合、issue mapping 及首次錯誤聚焦。
- `TicketSelection`
  - Model：nullable ticket ID
  - Props：ticket list、ticket issue
  - `TicketCard` 保持純展示，以 props 呈現 ticket／selected／error，發出 select action。
- `AttendeeInformationForm`
  - 六個 named models、field issues 及 `shippingRequired`
  - 不自行執行或定義 business validation rules。

## 測試與驗收

- Ticket tests：初始未選、單選與切換、selected badge/style、整卡點擊、Space／方向鍵操作、roving tabindex、radio ARIA 與 submit-after-error state。
- Form tests：六欄雙向綁定、required、trimmed-empty、email、phone、errors 延後顯示及修正後即時清除。
- Shipping tests：optional、merchandise-required、required-plus-error 三種 Figma states。
- Integration tests：空白 Step 1 點 Next 可直接到 Step 2 且不顯示錯誤；資料跨步驟保留；Step 4 submit 失敗後返回 Step 1，Stepper／ticket／fields error 一致並聚焦第一個 invalid control。
- 人工比對 1440、1024、768、375px，檢查 spacing、typography、card 高度、兩欄／單欄切換、hover、focus、selected 與 error states，且不得出現水平捲動。
- Ticket 與表單各完成一個 logical slice 後執行 targeted tests；最後執行完整 `yarn test:unit`、`yarn build` 及 `REVIEW.md` 自審，修正所有 Vue、Quasar、accessibility 與 design fidelity 問題。
- 建議 commit：`feat: implement attendee and ticket selection`

## 假設與取捨

- Full Name、Email、Phone、Company 及 Job Title 皆必填；Shipping Address 僅在有 merchandise 時必填。
- Figma selected VIP 與已填表單只作狀態參考，實際初始值全部為空。
- Phase 3 不實作 Step 2–4 內容、不改驗證訊息、不加入即時 blur validation，也不下載新的 Figma assets。
- 使用 Quasar 的 generic icons 與 form controls，並以 scoped semantic styling 修正視覺；不重建既有 Quasar 行為。
