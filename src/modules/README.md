# Modules Layer (`src/modules`)

## Purpose
Modules assemble complete screens by composing Layouts and Features.

## Responsibilities
- Compose page-level structure for each route.
- Wire feature components together at a high level.
- Pass route-level props (view mode, ids, flags) down to features and layouts.

## Rules
- Keep modules thin (composition only).
- Avoid business logic, side effects, and database calls.
- Import from `src/layouts` and `src/components/features`.
- Keep one primary module per route/screen.

## Recommended Pattern
- `src/app/**/page.tsx` should usually return a Module directly.
- The Module chooses which feature view to render (for example, classes vs students).
- Feature components own state and behavior.
