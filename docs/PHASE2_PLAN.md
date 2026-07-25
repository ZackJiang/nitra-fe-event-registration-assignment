# Phase Two — Registration State 與 Business Utilities 實作計劃

## 摘要

建立報名流程唯一狀態來源 `useRegistrationWizard()`，並將日期、容量、時段衝突、金額計算與跨步驟驗證拆成可獨立測試的純函式。Phase Two 僅接通既有 wizard shell，不實作各步驟內容 UI；Phase Three 至 Phase Seven 直接消費本階段提供的 state、computed 與 actions。

維持 JavaScript 與 JSDoc，不加入 Pinia、日期或金額套件，也不升級既有 dependencies。

## 架構與實作

1. **Shared models 與 state factory**
   - 使用 JSDoc 定義 `AttendeeInformation`、`AddonSelection`、`RegistrationState`、`ValidationIssue`、`PricingLine`、`PricingBreakdown` 與 schedule conflict model。
   - attendee 六個欄位初始為空字串；ticket 為 `null`；sessions 為空陣列。
   - 每個 mock add-on 建立獨立的 `{ quantity: 0, size: null }` selection，避免不同 composable instances 或 reset 共用可變資料。
   - submission 初始為 `{ status: 'idle', confirmationId: null }`。

2. **純 business utilities**
   - 依 ISO timestamp 的 UTC 日期分組，且不改寫或重排 mock source arrays；格式化固定使用 `en-US` 與 `timeZone: 'UTC'`。
   - 容量剩餘值 clamp 至零；`registered >= capacity` 視為 sold out。
   - 時段採半開區間判斷，結束時間等於下一項開始時間不衝突；conflict finder 回傳唯一 pairs。
   - 所有價格先轉 integer cents。VIP 10% discount 只套用 workshop subtotal，合計後 round 一次；輸出 itemized breakdown 與非負 total。
   - unified validation 涵蓋 attendee、ticket、conditional shipping、session conflicts／availability、workshop conflicts／availability、quantity、size 與未知 IDs。

3. **`useRegistrationWizard()`**
   - 支援注入 event、sessions、addons 與 confirmation ID factory，預設使用專案 mocks。
   - 公開 state：`currentStep`、`attendee`、`ticketTypeId`、`selectedSessionIds`、`addonSelections`、`hasAttemptedSubmit`、`submission`。
   - 公開 computed：selected entities、grouped sessions、merchandise state、schedule conflicts、pricing breakdown、validation issues、visible issues、error steps 與 submit state。
   - 公開 navigation、ticket/session/add-on selection、submit 與 reset actions。
   - sold-out item 不可新增，但可移除既有異常選取；session conflicts 允許建立，留到 Step Four submit 驗證。
   - workshop 與目前 session 衝突時拒絕新增；若 workshop 先選再新增 session，保留兩者並由 unified validation 回報。
   - submit 前不公開 errors；首次失敗後由 computed 自動更新錯誤與 disabled 狀態。成功 confirmation ID 只產生一次，格式為 `WDS2028-xxxxx`。
   - `IndexPage` 以 composable 驅動現有 shell、stepper 與 action bar；不使用 `watch()` 或 `watchEffect()`。

## 公開介面

`ValidationIssue`：

```js
{
  code: string,
  stepId: 1 | 2 | 3,
  targetType: 'field' | 'ticket' | 'session' | 'addon',
  targetIds: string[],
  message: string
}
```

`PricingBreakdown`：

```js
{
  ticketLine: PricingLine | null,
  addonLines: PricingLine[],
  discountCents: number,
  subtotalCents: number,
  totalCents: number
}
```

`PricingLine` 包含 `sourceId`、`label`、`category`、`quantity`、`unitPriceCents` 與 `lineTotalCents`。

## 測試與驗收

- 測試 fresh state／reset 不共用 references，且 add-on selections 完整歸零。
- 測試 UTC 分組排序、顯示格式、相接／重疊／無效區間、容量邊界與唯一 conflict pairs。
- 測試 integer cents、quantity subtotal、VIP workshop-only discount、rounding 與 USD 格式。
- 測試 attendee、email、phone、ticket、conditional shipping、session conflicts、sold-out、workshop conflicts、quantity 與 size validation。
- 測試 domain actions、submit 前後 error visibility、修正後自動恢復、stable confirmation ID 與完整 reset。
- 測試 `IndexPage` 使用 composable 前後導航，且 Phase One tests 不回歸。
- 在 Node `22.17.0` 執行 `yarn test:unit` 與 `yarn build`，最後依 `REVIEW.md` 完成自審。

## 假設與取捨

- mock timestamps 代表活動表定 UTC 時間，不依使用者時區轉換。
- confirmation ID 只作前端展示，不提供全域唯一或安全性保證。
- Phase Two 不處理付款、稅金、庫存預留、後端提交、持久化或步驟內容 UI。
- Figma 本階段只提供狀態語意參考，不改變 README 與 mock 定義的 business rules。
- 建議 commit：`feat: add registration state and business rules`
