---
description: "Task list for Worktime Generator Chrome Extension"
---

# Tasks: Worktime Generator Chrome Extension

**Input**: Design docs from `specs/001-worktime-generator/`
**Prerequisites**: `specs/001-worktime-generator/plan.md`, `specs/001-worktime-generator/spec.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create chrome extension folder structure at specs/001-worktime-generator/chrome-extension/ (confirm existing files: manifest.json, popup.html, popup.css, popup.js)
- [x] T002 [P] Initialize linting (ESLint) config file at .eslintrc.json
- [x] T003 [P] Add Node dev dependencies and npm scripts in package.json (for tests/lint) at package.json
- [x] T004 [P] Create tests directory for unit tests at tests/unit/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules and test harness required before user stories

- [x] T005 Implement HolidayCalendar module at specs/001-worktime-generator/chrome-extension/lib/holiday.js (fetch + localStorage cache + O(1) lookup)
- [x] T006 Implement Worktime candidate builder module at specs/001-worktime-generator/chrome-extension/lib/candidates.js (enumerate valid minute slots per month)
- [x] T007 Implement Shuffle & selector utility at specs/001-worktime-generator/chrome-extension/lib/selector.js (Fisher–Yates using crypto.getRandomValues if available)
- [x] T008 Implement Generator orchestration module at specs/001-worktime-generator/chrome-extension/lib/generator.js (combine holiday, candidates, selector to produce rows)
- [x] T009 [P] Add unit test harness and example test for generator in tests/unit/test_generator.js
- [x] T010 Add README stub and update quickstart at specs/001-worktime-generator/quickstart.md describing local dev reload steps
- [x] T011 Configure basic error/display utilities in popup UI at specs/001-worktime-generator/chrome-extension/popup.js (setStatus, disableButtons)

**Checkpoint**: Foundational modules and tests present; user story implementation may proceed

---

## Phase 3: User Story 1 - Generate single row (Priority: P1) 🎯 MVP

**Goal**: On popup load, generate 1 row with three valid unique worktimes for default month (previous month)

**Independent Test**: Load popup, observe exactly 1 row rendered and each timestamp validates against worktime rules (weekday, time window, not holiday)

### Tests for User Story 1

- [x] T012 [P] [US1] Add unit test: default-generation produces one row in tests/unit/test_default_generation.js

### Implementation for User Story 1

- [x] T013 [US1] Wire generator module into popup load logic in specs/001-worktime-generator/chrome-extension/popup.js (call generator on DOMContentLoaded)
- [x] T014 [US1] Ensure popup.html contains output container at specs/001-worktime-generator/chrome-extension/popup.html (element id used by popup.js)
- [x] T015 [US1] Render single row output format in popup.js using generator output and ensure formatting "YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM"
- [x] T016 [US1] Add status messages for success and error cases in popup.js
- [x] T034 [P] [US1] Add unit test: row timestamps must be from distinct dates in tests/unit/test_generator.js (covers FR-015, SC-006)
- [x] T035 [US1] Update generator logic to enforce distinct dates per row in specs/001-worktime-generator/chrome-extension/lib/generator.js (covers FR-015)

**Checkpoint**: US1 should be independently executable and testable

---

## Phase 4: User Story 2 - Adjust rows and regenerate (Priority: P1)

**Goal**: Allow user to set N rows and generate N rows on demand; ensure global uniqueness across all timestamps

**Independent Test**: Set rows=N, click Generate, observe N lines rendered within performance constraints and no duplicate timestamps

### Tests for User Story 2

- [x] T017 [P] [US2] Add unit test: generator produces N rows and enforces uniqueness in tests/unit/test_multiple_rows.js

### Implementation for User Story 2

- [x] T018 [US2] Add number-of-rows input control binding in specs/001-worktime-generator/chrome-extension/popup.html and popup.js (id rows input)
- [x] T019 [US2] Implement generation button handler in popup.js to pass rows count to generator and re-render results
- [x] T020 [US2] Add UI validation for rows input (integer ≥ 1) and show inline errors in popup.html/popup.js

**Checkpoint**: US2 complete and independently testable

---

## Phase 5: User Story 3 - Copy to clipboard (Priority: P1)

**Goal**: Copy generated rows to clipboard as newline-separated lines so pasting into Google Sheets produces rows

**Independent Test**: After generating N rows, click Copy — verify clipboard contains N newline-separated lines with three comma-separated timestamps each

### Tests for User Story 3

- [x] T021 [P] [US3] Add unit test for copy formatting utility in tests/unit/test_copy.js (mock clipboard)

### Implementation for User Story 3

- [x] T022 [US3] Implement copy-to-clipboard function in specs/001-worktime-generator/chrome-extension/popup.js and ensure button with id "copy" exists in popup.html
- [x] T023 [US3] Ensure copy uses Clipboard API with fallback to document.execCommand when necessary
- [x] T024 [US3] Add UI feedback on successful copy (status message) in popup.js

**Checkpoint**: US3 complete and independently testable

---

## Phase 6: User Story 4 - Adjust month range (Priority: P2)

**Goal**: Provide +/- controls to change month offset and ensure generation respects selected month (first-to-last day) and fetches holidays for involved years

**Independent Test**: Change month offset, click Generate, verify timestamps fall within the selected month's date range and holiday exclusions apply

### Tests for User Story 4

- [x] T025 [P] [US4] Add unit test for month offset handling and holiday-year fetches in tests/unit/test_month_offset.js

### Implementation for User Story 4

- [x] T026 [US4] Bind month offset controls in popup.html (ids offset-decr, offset, offset-incr) to popup.js and update UI
- [x] T027 [US4] Make ensureHolidayDataForYears(years) call as part of generator orchestration in generator.js and wire error handling in popup.js
- [x] T028 [US4] Add UI guidance when holiday data is missing or generator must fallback to cached data

**Checkpoint**: US4 complete and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, docs, CI, and release readiness

- [x] T029 [P] Add ARIA labels and keyboard support in popup.html and popup.js to meet NFR-003
- [x] T030 [P] Add unit test coverage target and CI workflow files at .github/workflows/ci.yml to run tests and lint
- [x] T031 [P] Performance tune generator for N ≤ 1000 rows and add benchmark script in scripts/benchmark.js
- [x] T032 Update specs/001-worktime-generator/quickstart.md with exact developer steps and test commands
- [x] T033 [P] Run quick manual validation steps and document results in specs/001-worktime-generator/checklists/requirements.md

---

## Dependencies & Execution Order

- Phase 1 Setup: start immediately
- Phase 2 Foundational: depends on Phase 1
- User Stories (US1..US4): depend on Phase 2
- Polish: depends on user stories

### Story completion order (recommended MVP path)

1. US1 (P1) → MVP
2. US2 (P1)
3. US3 (P1)
4. US4 (P2)

---

## Parallel execution examples

- US1: T013, T014, T015 can be worked in parallel by separate engineers (wiring vs rendering)
- US2: T018, T019, T020 can be done in parallel (UI control, handler, validation)
- US3: T022, T023, T024 can be parallelized

---

## Implementation strategy

- MVP first: Complete Phase 1 + Phase 2 + US1, validate, then add US2/US3
- Incremental delivery: Each story is independently testable and can be merged after passing its tests

---

## Output summary

- Generated file: specs/001-worktime-generator/tasks.md
- Total tasks: 35
- Tasks per story:
  - Foundational: 7
  - US1: 6
  - US2: 4
  - US3: 4
  - US4: 3
  - Setup: 4
  - Polish: 5
- Parallel opportunities: many [P]-marked tasks (see above)
- Suggested MVP scope: Phase 1 + Phase 2 + US1 (T001..T016)

## Format validation

All listed tasks use the checklist format `- [ ] T### [P?] [US?] Description` and include file paths where applicable.