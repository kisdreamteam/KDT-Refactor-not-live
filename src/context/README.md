# Context Providers (`src/context`)

## Purpose
This folder contains React Context providers for shared state across larger UI areas.

## What Belongs Here
- State that must be shared across distant components (dashboard data, sort state, seating nav state).
- Provider + hook pairs (`Provider`, `useXxxContext`).

## What Does Not Belong Here
- Short-lived local component state.
- Domain logic that can live in hooks/services.

## Rules
- Keep provider value shape explicit and documented.
- Expose narrow, intention-revealing actions in context values.
- Avoid overloading one context with unrelated concerns.

## Typical Imports
- Can import `src/api` and shared hooks.
- Should not import feature presentation components.
