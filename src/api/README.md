# API Layer (`src/api`)

## Purpose
This folder contains direct data access and backend-facing logic (Supabase queries, RPC calls, and database mutations).

## Responsibilities
- Read and write data from backend services.
- Encapsulate table names, RPC names, and query details.
- Return typed data to callers.
- Throw consistent errors (or return standardized result objects).

## Rules
- Do not include UI logic or React component state.
- Do not import from `src/components/*`.
- Keep each file domain-focused (`students.ts`, `classes.ts`, `points.ts`, etc.).
- Prefer shared helpers for repeated auth/session fetching and error normalization.

## Recommended Function Naming
- `listXxx(...)` for collections.
- `getXxxById(...)` for single entities.
- `createXxx(...)`
- `updateXxx(...)`
- `deleteXxx(...)`
- `archiveXxx(...)` for soft-deletes.

## Return Shape Guidelines
- Use explicit return types for every exported function.
- Map DB rows into stable app models before returning (when needed).
- Avoid leaking inconsistent nullable/optional DB fields into UI without mapping.
