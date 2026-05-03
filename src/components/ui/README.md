# UI Components (`src/components/ui`)

## Purpose
This folder contains reusable UI building blocks used across multiple features.

## What Belongs Here
- Presentational components with minimal business knowledge.
- Reusable controls (`Button`, `Input`, `Card`, state components like loading/error/empty).
- Components that can be reused by different domains.

## What Does Not Belong Here
- Supabase or `@/api/*` imports (Layer 3 belongs in `/src/api` only; see `docs/architecture.md` §3).
- Feature-specific orchestration logic.
- Routing or URL synchronization logic.

## Rules
- Do not import `@/api/*`, `createClient`, or `@supabase/*` from this folder.
- Prefer `@/lib` for shared types and pure formatters; avoid pulling in `@/hooks` when the hook file also contains integration logic (co-locate pure helpers in `lib` instead).
- Keep props explicit and small.
- Prefer composition over one large configurable component.
- Keep styling consistent with design tokens and shared utility patterns.

## Typical Imports
- Can import from `src/lib` and other `src/components/ui` files.
- Should not import from `src/components/features`.
