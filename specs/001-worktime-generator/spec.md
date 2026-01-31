# Feature Specification: Worktime Generator Chrome Extension

**Feature Branch**: `001-worktime-generator`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "實作一個 chrome extension, 讓user 可以快速產生3個隨機的工作時間並進行copy

- user 可以指定產生幾列資料，每一列則包含3個隨機工作時間
- 每個產生的隨機工作時間需符合以下規則
    - 附合工作時間的定義
    - 必須在指定的月份範圍內
    - 每個時間則都是unique的，不能與其他所產生的時間重複
- user 可以按下按鈕來copy這些工作時間到剪貼簿，每列資料以換行分隔，讓user可以方便貼上到 google sheet 的表格中成為多列資料

需求重點：
- user點擊 extension icon 後，才會顯示generator介面，打開後會直接產生1列（3個時間），可修改列數
- 預設月份範圍為上個月，能用 +/- 調整月份 offset
- 時間格式輸出為 MMDDHHMM（例如 2025-04-29 13:43 → "04291343"），範圍 08:30-16:30，工作日 (Mon-Fri)，排除台灣國定假日
- 每列為 3 個 Tab 分隔時間，如 "04291343\t05011402\t05281115"

## Clarifications

### Session 2025-12-01
- Q: What is the separator for timestamps in a row? → A: Tab character (`\t`) to support direct pasting into spreadsheet columns.
- Q: Can a row contain multiple timestamps from the same day? → A: No, the 3 timestamps in a single row must be from 3 distinct days.

### Session 2026-01-31
- Q: What is the final produced timestamp format? → A: MMDDHHMM (e.g., 2025-04-29 13:43 → 04291343).

## User Scenarios & Testing *(mandatory)*

### User Scenario 1 - Generate single row (P1)

Given the user opens the Chrome extension popup,
When the popup loads,
Then the extension displays one generated row containing three valid, unique worktimes
And the row is shown as "MMDDHHMM\tMMDDHHMM\tMMDDHHMM"

### User Scenario 2 - Adjust rows and regenerate (P1)

Given the user sets "rows" to N and selects a month offset,
When the user clicks "Generate",
Then the extension produces N rows, each with three unique worktimes
And no generated timestamp duplicates any other generated timestamp within the set

### User Scenario 3 - Copy to clipboard (P1)

Given generated rows are visible,
When the user clicks "Copy",
Then the clipboard contains the rows separated by newline characters,
So the user can paste into Google Sheets as multiple rows

### User Scenario 4 - Adjust month range (P2)

Given the default month offset is  -1 (previous month),
When the user clicks +/- to change offset,
Then the next generation uses the new month range's first-to-last day

## Edge Cases

- Month with fewer available worktimes than required rows×3 must be handled gracefully (see Requirements).
- Leap year and month boundary handling for February.
- Timezone assumptions: use user's local timezone (Asia/Taipei assumed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Extension MUST open a popup UI only when the user clicks the extension icon.
- **FR-002**: On popup load, the extension MUST generate 1 row with 3 random worktimes within the default month range.
- **FR-003**: The user MUST be able to specify the number of rows to generate (integer ≥ 1).
- **FR-004**: The user MUST be able to adjust month offset via +/- controls; offset is integer (can be negative or positive).
- **FR-005**: Generated timestamps MUST be formatted as "MMDDHHMM" (month, day, hour, minute). Example: 2025-04-29 13:43 → "04291343".
- **FR-006**: Each generated timestamp MUST satisfy Worktime Definition: weekday (Mon-Fri), time between 08:30 and 16:30 inclusive, and not on Taiwan public holidays.
- **FR-007**: All timestamps generated in a single run MUST be unique (no duplicates across any rows).
- **FR-008**: Each row MUST contain exactly three timestamps separated by a tab character.
- **FR-009**: A "Generate" button MUST re-generate according to current settings.
- **FR-010**: A "Copy" button MUST copy all rows to the clipboard as newline-separated lines.
- **FR-011**: If the generator cannot produce enough unique timestamps within the month, the UI MUST show a clear error and provide a reduced result or guidance.
- **FR-012**: The extension MUST default month range to the previous calendar month relative to user current date.
- **FR-013**: Holiday source for Taiwan public holidays MUST be defined (assumption documented) and applied to exclusion logic.
- **FR-014**: All randomization MUST be deterministic only per-run; no persistent storage required for uniqueness between runs unless user requests.
- **FR-015**: The three timestamps within a single row MUST fall on three distinct dates (no two timestamps in the same row can share the same date).

### Non-Functional Requirements

- **NFR-001**: Generation for up to 1000 rows (3000 timestamps) MUST complete within 2 seconds on a modern laptop.
- **NFR-002**: Clipboard copy operation MUST succeed for the generated payload size under typical browser limits.
- **NFR-003**: UI MUST be accessible and keyboard-operable for the main controls (Generate, Copy, +/-).

## Key Entities

- **Worktime**: timestamp string "MMDDHHMM" representing allowed worktime (month, day, hour, minute).
- **Row**: collection of three Worktimes presented as a single tab-separated line.
- **Generator Settings**: number_of_rows (int), month_offset (int), timezone (implicit local).
- **Holiday Calendar**: set of dates excluded from generation (Taiwan public holidays for target year).

## Success Criteria *(mandatory)*

- **SC-001**: When user requests N rows, N lines are generated and visible within the popup within 2 seconds for N ≤ 1000.
- **SC-002**: All generated timestamps pass Worktime Definition validation (weekday, time window, not a Taiwan holiday).
- **SC-003**: No duplicate timestamp appears among the entire generated set.
- **SC-004**: Copy to clipboard places exactly N newline-separated lines, each with three tab-separated timestamps, and pasting into Google Sheets results in N rows populated.
- **SC-005**: When month offset is changed, generated results reflect the specified month range's first-to-last day.
- **SC-006**: Each generated row contains timestamps from three different dates.

## Acceptance Scenarios

1. Given default state on 2024-06-10, the popup loads and shows three timestamps all within 2024-05-01–2024-05-31.
2. For N=2 and offset=0 on 2024-06-10, timestamps fall within 2024-06-01–2024-06-30 and rows distinct.
3. When a month has only 3 available valid days with distinct times but user requests 10 rows, the UI shows an error explaining insufficient unique times.

## Assumptions

- User local timezone used for date calculations; if not Taiwan locale, times still generated in user local time.
- Taiwan public holidays data will be sourced from an authoritative API or embedded static list maintained in the extension and updated periodically.
- Worktimes minutes resolution is to the minute (HH:MM), no seconds.
- Random times may reuse the same hour/minute across different days but timestamps must be globally unique per run.

## Implementation Constraints *(informative, remove from spec if not needed)*

- The specification avoids mandating frameworks or APIs; implementation details belong to planning.

## Edge Case Handling

- If available unique timestamps < requested_total (rows×3), algorithm SHOULD attempt to maximize unique timestamps and present partial results with an explicit notice.
- If month_offset shifts to a future month beyond supported holiday data, extension MUST warn and fallback to last-known holiday dataset.

## Notes

- Output format MMDDHHMM and time window MUST be strictly enforced for copy/paste compatibility.

## Key Metrics to Monitor (for future iterations)

- Average generation time for N rows
- Frequency of "insufficient unique timestamps" errors by month

<!-- End of spec -->
