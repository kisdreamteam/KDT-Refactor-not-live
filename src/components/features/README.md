# Features Layer (`src/components/features`)

## Purpose
Feature components contain domain-specific UI behavior (stateful UI, orchestration, interaction flows).

## Responsibilities
- Manage feature state and interactions.
- Coordinate hooks and services for a domain workflow.
- Render feature-specific UI sections and connect reusable UI atoms.

## Rules
- Keep shared visual primitives in `src/components/ui`.
- Keep direct backend access in `src/api` (or domain services that call API).
- Split large feature files into:
  - `hooks/` for behavior and state.
  - `components/` for presentational sections.
  - `services/` for domain workflow orchestration.
- Prefer typed event helpers over raw window event string literals.

## Suggested Internal Structure (per feature)
- `FeatureNameView.tsx` (orchestrator/composer)
- `FeatureNameContent.tsx` (presentational layout)
- `FeatureNameModals.tsx` (modal composition)
- `hooks/useFeatureName*.ts` (logic extraction)
- `services/featureNameService.ts` (domain workflows)

## Naming Guidance
- `*View` for top-level feature entry.
- `*Content` for main visual section.
- `*Modals` for modal composition.
- `use*` prefix for hooks only.
