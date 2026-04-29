# Layouts Layer (`src/layouts`)

## Purpose
Layouts define screen structure and shared visual framing for pages/modules.

## What Belongs Here
- Structural scaffolding (nav regions, stage areas, containers, spacing physics).
- Shared frame behavior that is not domain-specific business logic.

## What Does Not Belong Here
- Feature-specific data orchestration.
- Direct backend query logic.

## Rules
- Keep layouts focused on structure and composition.
- Delegate feature behavior to modules/features/hooks.
- Keep route-level decisions in modules/app shells where possible.

## Typical Imports
- May import from `src/components/features` and `src/context`.
- Should not become a second feature orchestration layer.
