# Shared Hooks (`src/hooks`)

## Purpose
This folder contains reusable hooks that support multiple features or layouts.

## What Belongs Here
- Cross-feature hooks (toolbar state, point log pagination, generic flow helpers).
- Hooks that package reusable state/effect logic.

## What Does Not Belong Here
- Feature-only hooks that are tightly coupled to one feature file tree (keep those near the feature).

## Rules
- Prefix hook names with `use`.
- Return stable, well-typed interfaces.
- Keep hook responsibilities focused and testable.

## Typical Imports
- Can import from `src/api`, `src/lib`, and context providers.
- Should avoid importing feature presentation components.
