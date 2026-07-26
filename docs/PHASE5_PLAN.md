# Phase Five — Add-ons、Merchandise 與 Order Summary 實作計劃

## 摘要

依 Figma `1:3746`、`1:4190`、`1:4322` 實作 Step 3。Mock add-ons 作為內容、年份、容量與數量限制來源；Figma 負責 tabs、cards、shipping banner、selected／disabled／error states 與 Order Summary 視覺。

沿用 `useRegistrationWizard()` 的集中狀態、衝突判斷及 pricing utilities，不增加依賴、圖片資產或重複商業邏輯。

## 實作變更

1. **Add-on 衍生狀態**
   - 建立 Workshops／Meal Packages／Merchandise category 設定與固定順序。
   - `useRegistrationWizard()` 公開 `groupedAddons` 與 `addonAvailabilityById`；availability 包含 sold-out、衝突 session IDs 與是否禁止新選取。
   - 所有更新仍經 `setAddonQuantity()`／`setAddonSize()`；UI 不直接修改 registration state。

2. **分類與 selectable cards**
   - `AddonStep` 使用 `QTabs`／`QTab` 管理元件內 active category，預設 Workshops。
   - Workshop／Meal 共用 `AddonCard`；workshop 額外顯示 UTC 時間、容量、Sold Out 與 session conflict。
   - 新的衝突 workshop 禁止選取；先選 workshop 後建立的衝突會保留並允許取消。
   - Submit 後的 add-on issues 會切換到第一個錯誤分類、顯示 danger state 並聚焦錯誤控制項。

3. **Merchandise**
   - `MerchandiseCard` 使用 `QSelect` 選尺寸；`QuantityPicker` 透過 `defineModel()` 與 `QBtn` 將數量限制在 `0...maxQuantity`。
   - 數量歸零時由 composable 清除 size；數量大於零顯示 Added state。
   - 任一商品被加入後以 `QBanner` 顯示 shipping notice，並驅動 Step 1 shipping required state。

4. **Order Summary 與 responsive**
   - `OrderSummary` 共用既有 `PricingBreakdown`／`formatUsd()`，顯示 ticket、add-ons、商品數量、VIP workshop discount 與 total。
   - 空選擇顯示 `No items selected yet.` 與 `$0.00`。
   - Desktop 採 788px options、32px gap、380px summary；`<1024px` 改為上下排列，mobile controls 可換行。

## 測試與驗收

- Composable：分類順序、sold-out／conflict availability、拒絕新衝突 workshop、保留及取消既有衝突。
- Components：tabs、empty category、cards、quantity bounds、size、shipping banner、error navigation 與 summary。
- Integration：session 改變 workshop availability、跨步驟保留商品、live total 與 conflict correction。
- Accessibility：keyboard controls、disabled reasons、`aria-invalid`、`aria-describedby`、alerts 與錯誤聚焦。
- 實作驗證結果：Node 22.17.0 下 20 個 test files、82 個 tests 全數通過。
- Production source 已使用同版本 JavaScript Sass fallback 成功完成 Quasar/Vite build；本機直接執行 `yarn build` 仍會因 `sass-embedded` 內附 Dart binary 的 `cpuinfo_macos.cc: unreachable code` 環境錯誤早退。

## 假設與取捨

- Mock 的 WebDev Summit 2028 文案與數值優先於 Figma 的 2025 sample。
- Add-ons 全部選填；初始 quantity 為 0、size 為 null。
- Meal Packages 沿用 workshop selectable-card 視覺，但維持 0/1 數量且不顯示時間／容量。
- Summary 不採 sticky positioning，避免與 tablet/mobile action bar 重疊。
- 不新增 dependencies、assets、Pinia、watch 或其他 UI library。
- 建議 commit：`feat: implement add-ons and live order summary`
