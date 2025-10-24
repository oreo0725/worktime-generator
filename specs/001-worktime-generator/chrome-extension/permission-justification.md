# 權限說明（Permission Justification） — Worktime Generator

說明：此文件說明 Chrome Web Store 審核表格中所需之權限用途與最小化理由，供審核人員快速核驗。對應清單請參考清單檔案：[`specs/001-worktime-generator/chrome-extension/manifest.json`](specs/001-worktime-generator/chrome-extension/manifest.json:1)。

## 功能摘要
Worktime Generator 是一個純客戶端（client-only）的 Chrome extension。使用者在 popup UI 中產生 N 列工作時間（每列 3 個時間戳），並可一鍵複製到剪貼簿以貼入試算表。假日資料來源為公開 Taiwan holiday API，僅作為排除條件。

---

## 所需權限與理由

1. permission: "storage"  
   - 用途：快取每一年度的台灣假期資料（JSON）於 localStorage，格式示範 key: `taiwan_holidays_{year}`。快取可避免每次產生都需網路請求，並允許離線檢視已快取之月份結果。  
   - 最小化：只儲存公開假期清單（YYYYMMDD → boolean），不儲存使用者產生的工作時間或任何個資。  
   - 參考實作：[`specs/001-worktime-generator/chrome-extension/lib/holiday.js`](specs/001-worktime-generator/chrome-extension/lib/holiday.js:1)

2. permission: "clipboardWrite"  
   - 用途：當使用者按下「Copy」按鈕時，將產生的文字（每列為一行，三個逗號分隔時間）寫入系統剪貼簿，方便貼入 Google Sheets。此操作是由明確的使用者互動觸發。  
   - 最小化：僅在使用者操作時寫入剪貼簿；不會在背景或未經授權時讀寫剪貼簿。  
   - 參考實作：[`specs/001-worktime-generator/chrome-extension/popup.js`](specs/001-worktime-generator/chrome-extension/popup.js:193)

3. host_permissions: "https://api.pin-yi.me/*"  
   - 用途：向公開的台灣假期 API 取得當年度假期清單以作排除（isHoliday 標記）。僅進行 GET 請求，僅用於產生可用工作日候選清單。  
   - 最小化：僅請求年份範圍所需的 API (e.g., 2025)，不上傳或傳送任何使用者資料。若 API 無回應，程式會提示並可使用先前快取資料。  
   - 參考合約：[`specs/001-worktime-generator/contracts/holiday-api.md`](specs/001-worktime-generator/contracts/holiday-api.md:1)；實作：[`specs/001-worktime-generator/chrome-extension/lib/holiday.js`](specs/001-worktime-generator/chrome-extension/lib/holiday.js:1)

---

## 隱私與安全性保證（供審核引用）
- 本 extension 不會上傳、收集或傳送任何個人識別資訊（PII）。  
- 所有使用者操作（產生時間、copy）僅在本地端執行；唯一的外部請求僅為公開假期 API 的 GET 呼叫。  
- 快取內容僅包含公開假期對應表（YYYYMMDD → boolean），無使用者識別或行為資料。

---

## 審核表格建議回覆（可直接貼入審核說明欄位）
- "Why does your extension need the 'storage' permission?"  
  建議回覆：This extension caches Taiwan public-holiday JSON per year in localStorage to avoid repeated network calls and to allow offline generation of worktimes. Only public holiday flags (date → boolean) are stored; no personal data is recorded.

- "Why does your extension need the 'clipboardWrite' permission?"  
  建議回覆：To copy the user-requested worktime rows to the clipboard when the user clicks the Copy button. The write is user-initiated and no background clipboard access is performed.

- "Why does your extension need host permission for api.pin-yi.me?"  
  建議回覆：To fetch authoritative Taiwan public-holiday data (GET requests) used to exclude holidays from generated worktimes. No user data is sent.

---

## 驗證步驟（建議審核人員手動驗證）
1. 安裝 unpacked extension（或使用提供的 ZIP）。  
2. 開啟 popup，確定初次會觸發對 `https://api.pin-yi.me/{year}/` 的 GET（Network tab）。  
3. 按 Copy，驗證剪貼簿內容包含 N 行、每行三個逗號分隔時間。  
4. 在 DevTools Application → Local Storage 檢查 `taiwan_holidays_{year}` 欄位內容（僅 holiday map）。

---

如需我將此說明自動填入 Chrome Web Store 的審核說明格式或產生英文版簡短文字（供上傳表單使用），我可以再產出一個短版英文說明檔。若要我也把此檔案加入 repo（已加入此路徑），或調整內容以符合你要填的表單欄位，請回覆「Yes」。