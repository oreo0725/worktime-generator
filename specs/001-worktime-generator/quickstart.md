# Quickstart: Worktime Generator Chrome Extension

This document explains how to run and test the Worktime Generator extension locally.

Prerequisites
- Chrome or Chromium-based browser.
- git and a code editor.
- (Optional) Node.js if you want to run unit tests for generator logic locally.

Directory layout (top-level for this feature)
```
specs/001-worktime-generator/
├── plan.md
├── research.md
├── data-model.md
├── spec.md
├── quickstart.md
├── contracts/
└── chrome-extension/
    ├── manifest.json
    ├── popup.html
    ├── popup.css
    ├── popup.js
    └── lib/
```

Load extension in Chrome (development)
1. Open Chrome → chrome://extensions
2. Enable "Developer mode" (top-right).
3. Click "Load unpacked" and select `specs/001-worktime-generator/chrome-extension/`
4. Click the extension icon to open the popup. On first open the extension will:
   - ensure holiday data for the relevant year is cached (localStorage),
   - generate one row (3 timestamps) for the default month (previous month).

Development cycle
- Modify `popup.js`, `popup.html`, and `popup.css` under `chrome-extension/`.
- Use the research.md and data-model.md as references for generator and holiday cache behavior.
- When updating code, reload the extension in chrome://extensions or use the "Reload" button.

Testing the generator (unit)
- Generator logic is pure JS and can be run under Node for unit tests.
- Proposed test runner (optional): use a lightweight runner (Node + Jest) in `tests/unit/`.
- Key unit tests:
  - holiday JSON parsing & cache read/write
  - candidate slot generation for edge months (Feb, leap years)
  - uniqueness & grouping logic when selecting required timestamps
  - error handling when insufficient candidates or when holiday API unreachable

Holiday data source
- The extension fetches Taiwan holidays from:
  `https://api.pin-yi.me/taiwan-calendar/{year}/`
- Cached values stored in localStorage under key `taiwan_holidays_{year}`.
- If fetch fails and cache missing, the popup will show an error and provide a retry action.

Manual validation
- Generate N rows, click "Copy", paste into Google Sheets — verify N rows populated with three comma-separated timestamps each.
- Verify all timestamps are weekdays, within 08:30–16:30, and not on Taiwan holidays.

Notes
- This quickstart assumes implementation uses vanilla JS; no build step is required unless you choose to use a bundler.
- See `plan.md` and `data-model.md` for algorithmic details and performance considerations.