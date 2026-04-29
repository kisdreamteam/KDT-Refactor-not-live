# Modal Components (`src/components/modals`)

## Purpose
This folder contains modal shells and domain-specific modal flows.

## What Belongs Here
- Modal containers and modal content for user workflows.
- Modal-level state and callback wiring.
- Composition of forms/cards inside modal surfaces.

## What Does Not Belong Here
- Shared low-level primitives (move to `src/components/ui`).
- Directly duplicated backend logic that should live in services/hooks.

## Rules
- Keep close/submit/cancel behavior explicit through props.
- Keep callback contracts stable (`onClose`, `onRefresh`, etc.).
- For complex flows, keep business orchestration in hooks/services and keep TSX focused on UI.

## Typical Imports
- May import from `src/components/ui`, `src/components/forms`, `src/hooks`, `src/features/*`.
