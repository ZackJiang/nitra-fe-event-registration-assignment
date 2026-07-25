# Phase One — Wizard Foundation 實作計劃

## 摘要

建立可供後續四個步驟共用的 Quasar wizard shell，包含 Header、QStepper、內容容器與 Action Bar；同步完成 Figma design tokens、Inter variable font、正式圖像資產及 Vitest 測試環境。本階段不實作表單、報名狀態或商業規則。

## 實作順序與變更

1. **鎖定執行環境與測試底座**
   - 所有安裝、測試與建置改用專案指定的 Node.js `22.17.0`；目前環境是 `24.10.0`，且 `yarn build` 已因 runtime 不符而提前失敗。
   - 使用 Quasar 官方 [Vitest App Extension](https://testing.quasar.dev/packages/unit-vitest/) 建立 JavaScript＋happy-dom 設定，不啟用 UI、coverage 或範例檔。
   - 固定新增 `vitest@3.2.4`、`@vue/test-utils@2.4.11`、`happy-dom@15.11.7`、Quasar testing extension `1.2.4`；Vitest 3 可搭配現有 Vite 6.4.2，且不升級既有依賴。
   - 新增 `test:unit`（單次執行）與 `test:unit:watch` scripts，建立共用 Quasar plugin test setup 與一個 smoke test。

2. **Design tokens、字型與資產**
   - 加入 `@fontsource-variable/inter@5.3.0`，全域設定 Inter，保留 UnoCSS 現有 `485／570／610／630` weight mapping。
   - 保留現有 semantic color tokens；新增 spacing、content gutter、header/stepper/action bar height、6/8/10px radius、full radius 與 card shadow CSS variables。
   - 擴充 UnoCSS shortcuts，提供 wizard container、section padding、surface/card、divider 與 focus ring 等語意樣式，避免元件內散落硬編碼尺寸或色碼。
   - 將 Figma MCP 的三個 Nitra emblem SVG 分別保存為 center、top-right、bottom-left 資產並在 Header 中固定組合；保存 success icon 供 Phase 7 使用。不得保留七天後失效的遠端 URL，也不得手繪替代 SVG。
   - 在 `docs/PLAN.md` 的 Phase One 記錄新增套件、資產來源與選擇理由。

3. **Wizard shell 與共用元件**
   - `RegistrationWizardShell` 使用 `QLayout`／`QPage` 組合 Header、Stepper、內容 slot 與正常文件流中的 Action Bar，確保 Action Bar 不遮住內容。
   - `RegistrationHeader` 使用語意 `<header>`、`QToolbar`、40px brand logo 與 mock 的 `WebDev Summit 2028`；桌面高度固定 72px。
   - `RegistrationStepper` 使用 `QStepper`／`QStep`，透過 `prefix`、Quasar `check`／`priority_high` icons 與 scoped semantic styles完成：
     - active：brand circle、白字、semibold label；
     - completed：brand check circle與已完成 connector；
     - pending：surface-l2 circle、quiet text；
     - error：danger circle／label。
   - `RegistrationActionBar` 使用 `QBtn`，支援 Back、primary action、disabled 與 loading 狀態；Phase One 首頁只顯示 `Next: Session Selection`，點擊僅發出事件，不加入業務驗證。
   - `IndexPage` 只保存展示 shell 所需的 `currentStep = 1`，不建立 attendee、ticket、session 或 add-on state；主要內容保持空白占位，Phase 2 再接入 composable。

4. **Responsive 規格**
   - `>=1024px`：主內容／Stepper／Action Bar 最大寬 1200px、左右 120px；Header 左右 48px。
   - `768–1023px`：左右 gutter 32px。
   - `<768px`：左右 gutter 16px；Stepper 隱藏文字、四個 circles 平均分布，保留 `aria-label`；Action Bar 允許按鈕文字換行。
   - Shell 使用 `min-height: 100vh` 與 flex content，使空白內容時 Action Bar 仍位於視窗底部，內容增長時則自然向下延伸。

## 元件介面

- `RegistrationWizardShell`
  - `eventName: string`
  - `currentStep`：使用 `defineModel()`，值域 `1...4`
  - `errorStepIds: number[]`
  - `default` content slot、`actions` slot
- `RegistrationStepper`
  - `currentStep`：使用 `defineModel()`
  - `steps`：預設使用共享常數 `[{ id, label }]`
  - `errorStepIds: number[]`
  - 只有已到訪或錯誤步驟可請求導航，發出 `step-request(stepId)`
- `RegistrationActionBar`
  - `showBack`、`primaryLabel`、`primaryDisabled`、`primaryLoading`
  - 發出 `back`、`primary`
- 共用 `WIZARD_STEPS` 常數固定四步名稱；本階段不新增 business composable 或 registration models。

## 測試與驗收

- Unit tests：
  - Header 顯示 2028 event name、logo 為裝飾圖並有可理解的品牌文字。
  - Stepper 正確產生 active、completed、pending、error 狀態及可存取名稱。
  - 未到訪的 future step 不可導航；錯誤／已到訪步驟發出正確事件。
  - Action Bar 的 Back 顯示規則、primary/back events、disabled/loading 防重複操作正確。
  - Shell 能掛載 Quasar components 並渲染 content/actions slots。
- 驗證命令：在 Node `22.17.0` 執行 `yarn test:unit` 與 `yarn build`。
- 人工對照 Figma `1:3525`、`1:3925`：檢查 1440px 的 72px Header、80px Stepper、1200px content、72px Action Bar，以及四種 Stepper 狀態。
- 在 1024、768、375px 檢查 gutter、無水平捲動、mobile circles 與鍵盤 focus。
- 完整依 `REVIEW.md` 自審 Vue patterns、Quasar usage、設計 fidelity、accessibility、效能與 AI review；低於 95/100 必須先修正。
- 完成後建議 commit：`feat: establish wizard foundation and design system`

## 假設

- mock data 的 `WebDev Summit 2028` 優先於 Figma 畫面中的 2025 範例文字。
- Phase One 僅提供 UI/navigation contracts，不提前建立 Phase 2 的 registration state 或任何驗證規則。
- Quasar 的 `check` 與 `priority_high` glyph 足以精確對應 Stepper 狀態；品牌 emblem 與 success icon 則必須使用 Figma 原始匯出資產。
- 不加入 Pinia、其他 UI library、E2E、coverage、視覺回歸平台，也不升級 Vue、Quasar、Vite、Node 或 Yarn。
