# Shared Library (`src/lib`)

## Purpose
This folder contains shared technical utilities, typed helpers, and foundational modules.

## What Belongs Here
- Core utilities used by many layers.
- App-level shared types.
- Client setup helpers and cross-cutting event utilities.

## What Does Not Belong Here
- Feature-specific orchestration logic.
- UI components.
- Route-specific code.

## Rules
- Keep utilities side-effect-light unless explicitly required.
- Prefer pure functions where practical.
- Keep type definitions stable and domain-agnostic when possible.

## Typical Imports
- Can be imported by almost any layer.
- Should avoid importing feature or modal UI to prevent circular layering.
