# Phase Six — Review、Unified Validation 與 Error Navigation 實作計劃

## 摘要

依 Figma `1:3819`（Review）與 `1:3925`（Validation Error State）完成 Step 4。沿用 `useRegistrationWizard()` 的集中狀態、既有 validation issues、pricing breakdown 與 QStepper error state；不新增依賴、Pinia、持久化或後端 API。

Review 只負責呈現 Steps 1–3 的目前資料；所有驗證、價格與導航規則仍由 composable／utils 提供。

## 實作變更

1. **Review 摘要與共用元件**
   - 建立 `ReviewStep`，以 full-width cards 顯示 Attendee Information、Selected Sessions、Add-ons 與 Pricing Summary。
   - 建立 `ReviewSection`，統一 section header、`Edit → Step N` link、neutral border 與 danger 2px border。
   - 建立 `ReviewRows`，共用 attendee、session、add-on 的 label/value rows；支援 empty state、換行與 danger value。
   - 建立 `ReviewErrorBanner`，使用 `QBanner` 顯示所有 validation issues，每一項都能以鍵盤操作跳到對應 step。
   - 建立 `useRegistrationReview()`，將排序、分類、價格 label、shipping row 與 issue target mapping 從 UI component 抽離。

2. **Attendee、Sessions 與 Add-ons 摘要**
   - Attendee 顯示姓名、Email、Phone、Company、Job Title、Ticket Type；shipping address 在已有內容或選取 merchandise 時顯示。
   - 缺少 required field 顯示 `— (required)`；商品地址顯示 `— (required for merchandise)`。
   - Sessions 使用 UTC date/time formatter 並依開始時間排序；空選擇顯示 neutral empty state。
   - Add-ons 顯示 category、名稱、尺寸、商品數量與行項價格；空選擇顯示 neutral empty state。
   - 已選資料無法對應 mock、售罄、數量／尺寸無效或產生 session/workshop conflict 時，保留 section-level issue message，避免錯誤只存在 banner。

3. **Pricing Summary variant**
   - 泛化既有 `OrderSummary`，新增 `title`、`totalLabel` 與 `variant: 'sidebar' | 'review'` props。
   - 預設 sidebar 行為維持 Phase 5 不變；Review variant 使用 full-width layout、`Pricing Summary` 標題與 `Grand Total`。
   - 持續共用 `PricingBreakdown`、`formatUsd()`、商品數量與 VIP workshop 10% discount。

4. **Submit 與 Error Navigation**
   - `IndexPage` 在 Step 4 傳入 selected ticket、sessions、add-ons、attendee、pricing 與 visible issues。
   - Submit 呼叫既有 `submit()`；失敗時停留 Step 4，更新 DOM 後聚焦 error banner heading。
   - Error banner、Review section Edit links 與 Stepper 都透過 `goToStep()` 導航，並保留所有 registration state。
   - `errorStepIds` 繼續驅動 Stepper danger states；`isSubmitDisabled` 由 computed validation 決定，修正全部問題後自動恢復。
   - Submit 前不顯示 validation；只有首次 Step 4 submit 失敗後才顯示 banner、danger sections 與 inline error values。

## 元件與介面

- `ReviewStep`
  - Props：`attendee`、`selectedTicket`、`selectedSessions`、`selectedAddons`、`pricingBreakdown`、`visibleIssues`、`hasSelectedMerchandise`
  - Emits：`edit-step(stepId)`
  - Expose：`focusErrorSummary()`
- `ReviewSection`
  - Props：`title`、`stepId`、`hasError`
  - Emits：`edit(stepId)`
- `ReviewErrorBanner`
  - Props：`issues`
  - Emits：`navigate(stepId)`
  - Expose：`focus()`
- `ReviewRows`
  - Props：`rows`、`emptyMessage`、`issues`
- `OrderSummary`
  - 新增 `title`、`totalLabel`、`variant`；未傳入時維持既有 sidebar contract。
- `ValidationIssue` schema 不變，沿用 `stepId`、`targetType`、`targetIds` 與 `message`。

## 測試與驗收

- Review component：完整資料、UTC session 排序、空 sessions／add-ons、ticket、尺寸、商品數量、VIP discount 與 Grand Total。
- Error state：所有 issues 同時顯示、錯誤 section／row 使用 danger style、無關 section 維持 neutral、shipping conditional state 正確。
- Navigation：Edit link、banner item、Stepper error state 可到達正確 step；資料跨步驟往返保持不變。
- Accessibility：error banner 使用 `role="alert"`；摘要 heading 可聚焦；Edit、banner item 與 action buttons 可鍵盤操作；內容在窄畫面可換行。
- Integration：空白資料 submit 後停留 Step 4、顯示全部錯誤、Submit disabled；修正後 banner／danger state 清除且 Submit re-enabled。
- 驗證結果：`yarn test:unit` 通過 21 個 test files、88 個 tests；production `yarn build` 通過。

## 假設與取捨

- Figma 的 2025 與人物資料只作視覺／狀態參考；實際內容使用 WebDev Summit 2028 mocks。
- Sessions 與 add-ons 均可不選；空選擇不是 validation error。
- Phase 6 不實作成功畫面；confirmation UI、reset 與完整 responsive polish 留在 Phase 7。
- 不新增 assets、dependencies、Pinia、provide/inject、localStorage 或後端提交。
- 建議 commit：`feat: add review and unified validation`
