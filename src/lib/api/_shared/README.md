# API Shared Primitives (`src/lib/api/_shared`)

## Purpose
This folder contains shared primitives used by API modules for consistent behavior.

## What Belongs Here
- Shared error contracts and mappers (`ApiError`, mapping helpers).
- Shared auth/session helpers for API methods.
- Small, dependency-light helpers that reduce duplication in `src/lib/api/*.ts`.

## What Does Not Belong Here
- Domain endpoint functions (keep those in `src/lib/api/points.ts`, `students.ts`, `classes.ts`, etc.).

## Rules
- Keep helpers framework-agnostic where possible.
- Preserve a stable API contract for all endpoint modules.
- Use these helpers to standardize throw-based error flow.

## Typical Imports
- Imported by files in `src/lib/api`.
