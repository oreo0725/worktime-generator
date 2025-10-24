<!--
Sync Impact Report
Version change: unknown -> 1.0.0
Modified principles:
  - [PRINCIPLE_1_NAME] -> Clean Architecture (layered dependencies: entities → use-cases → interfaces → frameworks)
  - [PRINCIPLE_2_NAME] -> Explicit Interfaces & Contracts (port/adapter, contract-first)
  - [PRINCIPLE_3_NAME] -> Test-First & Quality Gates (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] -> Observability & Operational Readiness
  - [PRINCIPLE_5_NAME] -> Versioning, Simplicity & Backward Compatibility
Added sections:
  - Development Workflow (detailed gates and PR requirements)
Removed sections:
  - none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check expanded)
  - .specify/templates/spec-template.md ⚠ pending (verify acceptance criteria reflect test-first requirement)
  - .specify/templates/tasks-template.md ⚠ pending (ensure task categories include observability, contract tests, versioning tasks)
  - .specify/templates/checklist-template.md ⚠ pending (align checklist items with constitution)
  - .specify/templates/agent-file-template.md ⚠ pending (pull active guidelines from constitution)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): ratification date unknown — confirm original adoption date or set upon next governance meeting.
  - Verify automated CI checks include constitution compliance rules (if CI present).
-->

# Project Constitution

## Core Principles

### Clean Architecture
The system MUST be organized into clearly separated layers: Entities (domain), Use Cases (application business rules), Interfaces/Ports (abstract boundaries), and Frameworks & Drivers (external systems). Dependencies MUST point inward; inner layers MUST not depend on outer frameworks or infrastructure. Implementation detail: define ports/interfaces for all external I/O and provide adapters that translate between domain models and outer representations.

Rationale: Enforces maintainability, testability, and independent evolution of business rules.

### Explicit Interfaces & Contracts
All modules and services MUST publish explicit, versioned contracts (API, CLI, file formats, message schemas). Contracts are the authoritative surface for integration and MUST be reviewed and tested as part of any change. Contract changes MUST follow the versioning and deprecation policy defined below.

Rationale: Minimizes accidental coupling and supports independent implementation of adapters.

### Test-First & Quality Gates (NON-NEGOTIABLE)
Tests MUST be authored as the first artifact for new behavior: unit tests, contract tests, and integration tests as appropriate. Tests MUST fail before implementation begins and be checked into the repository. Pull requests MUST include passing test suites for the scope they change and evidence of contract and integration testing for cross-service changes.

Rationale: Prevents regressions and documents expected behavior as executable specification.

### Observability & Operational Readiness
Every service or library that runs in production-like environments MUST expose structured logging, metrics, and health/readiness probes. Design for observability: logs MUST be structured (JSON or equivalent), critical operations MUST emit metrics with defined units, and long-running flows MUST be traceable.

Rationale: Enables debugging, incident response, and performance verification without ad-hoc instrumentation.

### Versioning, Simplicity & Backward Compatibility
Follow semantic versioning MAJOR.MINOR.PATCH for released artifacts. Backward-incompatible changes MUST increment MAJOR and be accompanied by a migration plan. Prefer the simplest implementation that satisfies requirements (YAGNI) while keeping code understandable and refactorable.

Rationale: Keeps upgrade paths predictable and reduces maintenance burden.

## Additional Constraints

- Security: Sensitive data MUST be encrypted at rest and in transit where applicable. Secrets MUST be stored in a secrets manager; do not commit credentials.
- Performance: Performance targets and constraints MUST be defined in each plan where relevant (see plan.md).
- Dependencies: External dependencies SHOULD be minimized and scoped per-adapter; critical dependency updates MUST pass full test matrix.

## Development Workflow

- Feature work MUST start from a Feature Spec and Plan (spec.md + plan.md).
- PR requirements:
  - Passing CI and test suites relevant to the change.
  - AT LEAST one code reviewer and one architecture reviewer for cross-cutting changes.
  - Link to research/plan and migration steps for breaking changes.
- Release process:
  - Tag releases following semantic versioning.
  - Publish change log entries and migration notes for MAJOR and MINOR releases.
- Compliance reviews:
  - Quarterly governance reviews to ensure ongoing compliance with this constitution.
  - Ad-hoc reviews for MAJOR changes.

## Governance

- Amendment procedure:
  1. Propose amendment as PR against this file with rationale and impact analysis.
  2. Obtain approval from at least two maintainers, including one with architecture responsibility.
  3. Provide a migration plan for any breaking changes.
  4. Merge and update the Last Amended date and CONSTITUTION_VERSION per versioning rules below.
- Versioning policy:
  - MAJOR: Backward-incompatible governance/principle removal or redefinition.
  - MINOR: New principle/section added or materially expanded guidance.
  - PATCH: Clarifications, wording, typo fixes, or non-semantic refinements.
  - The author of the PR MUST state the recommended bump and rationale; maintainers confirm before merging.
- Compliance expectations:
  - All PRs MUST include a checklist referencing affected principles.
  - Project leaders MUST run a constitution compliance check during release candidate reviews.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-10-24
