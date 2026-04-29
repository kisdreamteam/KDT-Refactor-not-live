# UI Components (`src/components/ui`)

## Purpose
This folder contains reusable UI building blocks used across multiple features.

## What Belongs Here
- Presentational components with minimal business knowledge.
- Reusable controls (`Button`, `Input`, `Card`, state components like loading/error/empty).
- Components that can be reused by different domains.

## What Does Not Belong Here
- Supabase/API calls.
- Feature-specific orchestration logic.
- Routing or URL synchronization logic.

## Rules
- Keep props explicit and small.
- Prefer composition over one large configurable component.
- Keep styling consistent with design tokens and shared utility patterns.

## Typical Imports
- Can import from `src/lib` and other `src/components/ui` files.
- Should not import from `src/components/features`.
