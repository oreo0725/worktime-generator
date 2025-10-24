# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a lightweight Chrome extension (popup) that generates N rows of three unique
"worktime" timestamps per row, formatted "YYYY-MM-DD HH:MM", constrained to:
- weekdays (Mon–Fri),
- time window 08:30–16:30 (minute resolution),
- dates within the chosen calendar month (first-to-last day),
- excluding Taiwan public holidays (via public API).

Primary approach:
- Implement generator logic in a modular, testable plain-vanilla JavaScript module.
- Fetch Taiwan holiday data per-year from the public API and cache results in localStorage.
- Ensure uniqueness by sampling available valid minute-resolution time slots and
  shuffling/allocating without replacement.
- Expose a small accessible UI in the extension popup with controls for row count,
  month offset, generate/re-generate, and copy-to-clipboard.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020+), HTML, CSS (no framework).
**Primary Dependencies**: Browser extension platform (Chrome extension APIs). No external
runtime libraries required; small utilities permitted (bundled) only if justified.
**Storage**: localStorage (for cached holiday maps keyed by year, e.g., "taiwan_holidays_2025").
**Testing**: Unit tests for generator and holiday-cache logic (recommend simple runner or
Node + Jest for generator logic during CI). Tests should live under `tests/unit/`.
**Target Platform**: Chrome (desktop) extension popup; must work in Chromium-based browsers.
**Project Type**: Single-browser extension repository subtree (chrome-extension/).
**Performance Goals**: Generate up to 1000 rows (3000 timestamps) within 2s on a modern
laptop; holiday cache lookups O(1).
**Constraints**: Offline operation for generation only if holiday cache exists; otherwise
require network to fetch holiday data on first run.
**Scale/Scope**: Single-user, local-only extension; no backend services required except
the public holiday API for lookups.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Separation of Concerns: Architecture section in plan MUST map components to constitution layers (entities → use-cases → interfaces → frameworks).
- Test-First evidence: Plan MUST list required unit, contract, and integration tests and where they will live.
- Contract & Interfaces: Any external interface MUST reference or include the contract/schema to be used and versioning notes.
- Observability: Plan MUST include logging, metrics, and health probes for deliverables that run in production-like environments.
- Versioning & Migration: If the plan changes public contracts, include version bump recommendation and migration approach.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
