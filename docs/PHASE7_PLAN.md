# Phase Seven — Success State、Responsive 與最終審查實作計劃

## 摘要

依 Figma `1:3912` 完成報名成功頁，串接既有 `submission`、confirmation ID 與 `reset()`。成功後保留 Header，移除 Stepper 與 Action Bar，並嚴格維持 Figma 的 success hero 範圍。

沿用 Vue 3、Quasar、UnoCSS semantic tokens、既有 SVG assets 與 `useRegistrationWizard()`；不新增依賴、持久化、Pinia 或後端 API。

## 實作變更

1. **Success State**
   - 建立 `RegistrationSuccess`，使用既有 `registration-success.svg`、`QCard`、`QBtn` 與 semantic tokens。
   - 對齊 Figma hero：80px success icon、28/32 heading、confirmation ID、姓名／ticket／email 說明與 `Back to Home`。
   - 顯示 mock 的 WebDev Summit 2028 資料；Figma 2025 文案僅作視覺參考。
   - 成功 heading 使用 `tabindex="-1"`；成功提交後聚焦 heading，讓鍵盤與讀屏使用者得知狀態變更。

2. **Wizard 串接與重置**
   - `IndexPage` 以 `submission.status === 'succeeded'` 切換 wizard 與 success view。
   - `RegistrationWizardShell` 新增 `showStepper` prop，預設為 `true`；成功時不渲染 Stepper。
   - 成功 view 接收 event name、confirmation ID、attendee 與 selected ticket。
   - `Back to Home` 呼叫既有 `reset()`，清除所有 registration、validation、submission 與 confirmation 狀態，回到 Step 1。
   - reset 後以 `nextTick()` 聚焦 ticket-selection heading；重複 submit 維持既有 confirmation ID，不重新產生。

3. **Responsive 與可及性收尾**
   - `>=1024px`：維持最大 1440px shell、1200px content 與 Figma desktop spacing；flex/grid items 可收縮且不產生水平捲軸。
   - `768–1023px`：使用 32px gutter，ticket/session 維持兩欄，Step 3 summary 移到 options 下方。
   - `<768px`：使用 16px gutter，ticket、form、session 與 review rows 改為單欄；成功文案與長文字可換行。
   - Mobile Stepper 隱藏視覺文字但保留 visually hidden label，因此維持 Quasar tab 的名稱與 current/error 語意。
   - Session／add-on tabs 使用 Quasar mobile arrows；Action Bar 維持正常 document flow，不遮蔽內容。
   - 檢查 existing card transitions 的 `prefers-reduced-motion` fallback；success button 維持至少 40px 高與 focus-visible ring。

## 元件與介面

- `RegistrationSuccess`
  - Props：`eventName`、`confirmationId`、`attendee`、`selectedTicket`
  - Emits：`back-home`
  - Expose：`focusHeading()`
- `RegistrationWizardShell`
  - 新增 `showStepper: Boolean = true`，維持現有 wizard 預設行為。
- `useRegistrationWizard()`、`RegistrationState`、`PricingBreakdown` 與 validation schema 不變。

## 測試與驗收

- Success component：確認 event、confirmation ID、姓名、ticket 與 email；測試 heading focus、Figma scope（無 summary）與 `back-home` emit。
- Integration：有效 submit 顯示 success page；Stepper／Action Bar 不存在；Back to Home 清空所有狀態並回到 Step 1；success/reset focus target 正確。
- Responsive 人工驗收：1440px、1024px、768px、375px，檢查 grids、Step 3 stacking、tabs、Stepper circles、Action Bar 與 overflow。
- Quality gate：執行 `git diff --check`、`yarn test:unit`、`yarn build`，並逐項完成 `REVIEW.md` 的 Vue patterns、Quasar usage、design fidelity、accessibility、performance 與 AI review。

## 假設與取捨

- Figma 僅提供 desktop success hero；不因 README 的 summary 描述新增 Figma 中不存在的內容。
- Sessions 與 add-ons 可為空；ticket 與 attendee 在成功提交時必定有效。
- `Back to Home` 只重置目前 SPA 的 wizard，不進行 router navigation。
- 不處理 email 寄送、付款、後端 submission、庫存預留或資料持久化。
- 若 restricted sandbox 重現 `cpuinfo_macos.cc: unreachable code`，以正常 host／CI build 驗證為準，並將其記錄為環境問題。
- 建議 commits：`feat: add registration success state`、`style: polish responsive registration experience`、`docs: record final implementation review`
