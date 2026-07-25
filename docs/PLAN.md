# Event Registration Wizard 修訂版開發計劃

## 摘要

依據 README、mock data 與 Figma `My Nitra / Event Registration Wizard` 完成四步驟報名流程。資料內容以 `WebDev Summit 2028` mock 為準，Figma 負責版面、元件狀態與視覺規格。

Figma 實作基準：

- Desktop 1440px；主內容寬 1200px、左右 padding 120px。
- Header 72px、Stepper 80px、底部 Action Bar 72px。
- Step 3 採 788px 選項區＋32px gap＋380px Order Summary。
- 初始表單、ticket、sessions、add-ons 全部未選；Figma 範例資料只作 selected/error/success state 參考。
- 使用 Vue 3 Composition API、Quasar 與既有 UnoCSS semantic tokens；不加入其他 UI library。

## 分階段實作

### Phase 1 — 基礎架構、Design Tokens 與測試環境

- 建立 wizard page shell、共用 Header、Stepper、Action Bar 和響應式 content container。
- 使用 QStepper 管理步驟，但透過 slots 與 semantic styles 對齊 Figma 的 active、completed、pending、error 狀態。
- 將 Figma spacing、radius、shadow 映射成 CSS variables／UnoCSS shortcuts；既有色彩 token 不直接覆寫，依解析後色值與語意選擇最接近的 scaffold token。
- 加入 Inter variable font，支援 Figma 使用的 485、570、610、630 字重。
- 下載並提交 Nitra emblem、success icon 等無法由 Quasar icon 精確取代的 Figma assets，避免使用七天後失效的 MCP URL。
- 加入與現有 Quasar/Vite 相容的 Vitest、Vue Test Utils 與 DOM environment，不升級既有 dependencies。

驗收：空白 wizard shell 在 1440px 對齊 Header、Stepper、content、Action Bar；測試指令與 `yarn build` 成功。

建議 commit：`feat: establish wizard foundation and design system`

### Phase 2 — Registration State 與 Business Utilities

- 建立 `useRegistrationWizard`，集中管理：
  - `currentStep`
  - attendee fields
  - `ticketTypeId`
  - `selectedSessionIds`
  - addon selections
  - `hasAttemptedSubmit`
  - submission result 與 confirmation ID
- Shared models 使用 JSDoc typedef；維持現有 JavaScript，不全面遷移 TypeScript。
- 建立純函式處理日期分組、時間格式、剩餘容量、時間重疊、價格與驗證。
- 時間重疊採半開區間：`startA < endB && startB < endA`；前一項結束時間等於下一項開始時間不算衝突。
- 金額轉為整數 cents 計算，最後使用 `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`。
- 使用 computed 衍生 selected items、merchandise state、pricing breakdown 與 step errors，不以 watch 同步可推導狀態。

驗收：核心 utils 單元測試通過，空資料與 undefined 不造成例外。

建議 commit：`feat: add registration state and business rules`

### Phase 3 — Step 1：Ticket 與 Attendee Information

對照 Figma node `1:3525`：

- 三張 ticket cards 在桌面呈三欄；selected card 使用 brand subtle background、2px brand border、shadow 與 Selected badge。
- 使用可鍵盤操作的單選語意，ticket 初始未選且提交時為必填。
- Attendee form 使用 QForm/QInput：
  - Full Name／Email 與 Phone／Company 在桌面各為雙欄。
  - Job Title、Shipping Address 為全寬。
- Next 不驗證；README 要求的 inline errors 只在使用者提交 Step 4 後顯示。
- 驗證規則：
  - 必填文字 trim 後不得為空。
  - Email 必須符合有效格式。
  - 電話允許 `+`、空格、括號、連字號，移除格式後須為 7–15 位數。
  - 商品數量總和大於零時，Shipping Address label 改為必填並套用 Figma conditional/error state。
- 錯誤返回 Step 1 時聚焦第一個無效欄位。

驗收：ticket 單選、條件式地址與 submit-after-validation 狀態符合 README/Figma。

建議 commit：`feat: implement attendee and ticket selection`

### Phase 4 — Step 2：Session Selection

對照 Figma node `1:3641`：

- 使用日期 tabs 顯示 Nov 15／Nov 16，並呈現目前選取數量。
- Sessions 依日期分組、開始時間排序；桌面使用兩欄 card grid。
- 每張 card 顯示 track badge、標題、speaker/title、時間、capacity bar 與剩餘名額。
- `registered >= capacity` 顯示 Sold Out、disabled style，且不可選取。
- 可用 session 支援 selected、hover、focus-visible；可自由選取互相衝突的 sessions。
- session-session conflict 只在 Step 4 submit 後產生錯誤；使用者返回 Step 2 時，所有衝突 cards 使用 danger state 標示。

驗收：日期切換、selected count、sold-out、capacity 與延後衝突驗證正確。

建議 commit：`feat: implement session selection`

### Phase 5 — Step 3：Add-ons、Merchandise 與 Order Summary

對照 Figma nodes `1:3746`、`1:4190`、`1:4322`：

- 使用 Workshops／Meal Packages／Merchandise tabs，而不是同頁長列表。
- Desktop 使用左側 788px 選項區與右側 380px Order Summary；tablet/mobile 改為上下排列。
- Workshops：
  - 顯示名稱、價格、描述、時間與剩餘容量。
  - 滿額 workshop 顯示 Sold Out 並 disabled。
  - 與已選 session 衝突時立即顯示 unavailable 並禁止新選取。
  - 若使用者先選 workshop、再回 Step 2 建立衝突，保留原選擇並在提交時要求修正，不靜默刪除。
- Meal packages 使用可選 card，數量限定為 0/1。
- Merchandise：
  - 使用 QSelect 選尺寸，QBtn 組成 Figma quantity picker。
  - 數量限制 `0...maxQuantity`；零代表未選。
  - 有 sizes 且數量大於零時必須選尺寸。
  - 數量回到零時清除 size。
  - 顯示 Added to order state 與 max quantity。
- 任一商品數量大於零時顯示 Figma shipping banner。
- Order Summary 共用 pricing breakdown，顯示 ticket、addons、商品數量、VIP workshop discount、divider 與 total。
- VIP 10% 只套用 workshop；General／Student 不折扣。

驗收：三分類、容量、衝突、尺寸、數量、shipping banner 與所有價格計算正確。

建議 commit：`feat: implement add-ons and live order summary`

### Phase 6 — Step 4：Review、Unified Validation 與 Error Navigation

對照 Figma nodes `1:3819`、`1:3925`：

- Review 頁以 full-width cards 顯示：
  - Attendee Information／Ticket
  - Selected Sessions
  - Add-ons
  - Pricing Summary
- 每區提供 Edit → Step N，回到指定步驟並保留所有資料。
- Submit 一次驗證全部步驟：
  - attendee、ticket、條件式 shipping address
  - session-session conflicts
  - session-workshop conflicts
  - addon availability、quantity、size
- 驗證失敗時維持在 Step 4，符合 Figma：
  - 頂部顯示 danger error banner。
  - Stepper 標記所有錯誤步驟。
  - 對應 review section 使用 danger border，缺漏值顯示 danger text。
  - Error banner 項目與 Edit links 均可跳至對應步驟。
  - Submit 在錯誤未修正前 disabled；修正後由 computed validation 自動恢復。
- 不在下一步操作時提前顯示錯誤。

驗收：一次提交能列出全部錯誤，錯誤步驟與 review sections 對應正確。

建議 commit：`feat: add review and unified validation`

### Phase 7 — Success State、Responsive 與最終審查

對照 Figma node `1:3912`：

- 成功後移除 Stepper，保留 Header，顯示置中的 success icon、標題、confirmation ID、姓名、ticket 與 email。
- 因 README 要求成功頁含 summary，在 Figma hero 下方增加精簡的 sessions、addons 與 total summary card。
- confirmation ID 在成功提交時產生一次並保持穩定，格式使用 `WDS2028-xxxxx`。
- Back to Home 清空報名狀態並回到 Step 1。

響應式規格：

- `>=1024px`：採 Figma 1440px desktop layout，內容最大 1200px。
- `768–1023px`：左右 padding 32px；Step 3 summary 移至選項下方；ticket/session grid 維持兩欄。
- `<768px`：左右 padding 16px；ticket、form、session、review rows 全部單欄；Stepper 隱藏文字只保留平均分布的 circles，使用 aria-label 保留語意；tabs 可水平捲動；內容與錯誤訊息允許換行。
- Action Bar 保持畫面底部視覺區隔，但不遮蔽可捲動內容。

最終執行：

- 對照 Figma 檢查 spacing、typography、radius、shadow、colors 與所有互動狀態。
- 執行測試與 production build。
- 完整審查 `REVIEW.md`，包含 Vue patterns、Quasar usage、accessibility、效能與 AI review。
- 自評不足 95/100 時繼續修正。
- 更新 `PLAN.md`，記錄新增 font/test dependencies、AI 使用與 trade-offs。

建議 commit：`refactor: polish responsive registration experience`

## 內部介面與元件責任

- `useRegistrationWizard()`：唯一報名狀態來源，提供 navigation、computed pricing、validation 與 submit/reset actions。
- `RegistrationState`：
  - attendee object
  - nullable ticket ID
  - session ID array
  - `Record<addonId, { quantity, size }>`
- `ValidationIssue`：包含 step、field/item ID、message；同時驅動 banner、Stepper、fields/cards 與 review sections。
- `PricingBreakdown`：包含 ticket line、addon lines、discount line、subtotal、total；Step 3、Step 4、success 共用。
- 共用 UI 元件包含 TicketCard、SessionCard、AddonCard、QuantityPicker、OrderSummary、ReviewSection；可編輯 child state 優先使用 `defineModel()`。
- 不使用 Pinia、provide/inject、localStorage 或後端 API。

## 測試計劃

- Utils：日期分組、UTC 顯示、容量邊界、時間相接／重疊、整數價格與 VIP 折扣。
- Step 1：ticket 單選、必填、email/phone、shipping address 三種 conditional states。
- Step 2：tabs、selected count、sold-out disabled、submit 後 conflict state。
- Step 3：workshop conflict、商品尺寸、quantity 上下限、shipping banner、order summary。
- Step 4：全步驟驗證、全部錯誤呈現、Edit navigation、disabled/re-enabled submit。
- Success：confirmation ID 只產生一次、摘要正確、Back to Home 完整重置。
- 人工驗收：1440px、1024px、768px、375px；mouse、keyboard、focus、hover、disabled、error、success。

## 假設與優先順序

- Official Interview Doc > README/mock data > Figma content samples。
- 活動名稱、日期及年份使用 mock 的 WebDev Summit 2028；Figma 的 2025 文字只視為範例。
- 初始狀態全部為空，ticket 必選；sessions 與 add-ons 可全部不選。
- mock timestamps 的 UTC 欄位代表活動表定時間，不依瀏覽器所在地轉換。
- 不處理付款、稅金、後端庫存預留或資料持久化。
- Figma 僅提供 desktop frames；tablet/mobile 行為採本計劃定義的 breakpoints。
- 不升級 Vue、Quasar、Node 或既有依賴版本。
