# Points Feature (`src/features/points`)

## Purpose
This folder contains points-domain logic extracted from UI so behavior is reusable and testable.

## What Belongs Here
- Domain services for points workflows (`services/`).
- Feature-facing hooks that adapt service logic for UI components (`hooks/`).

## What Does Not Belong Here
- Modal/page markup.
- Generic helpers unrelated to points.

## Rules
- Keep business rules in TypeScript services.
- Keep hooks thin adapters for UI state and callback sequencing.
- Preserve stable behavior for all award modes (single student, whole class, selected students, selected classes).

## Typical Imports
- Services may import from `src/api`.
- Hooks may import services and lightweight shared types.
