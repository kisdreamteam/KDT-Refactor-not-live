# App Routes (`src/app`)

## Purpose
This folder contains Next.js route entry points and top-level route shells.

## What Belongs Here
- Route files (`page.tsx`, `layout.tsx`) and route segment structure.
- Thin page shells that delegate composition to modules.

## What Does Not Belong Here
- Heavy feature orchestration logic.
- Direct backend data logic that belongs in API/services/hooks.

## Rules
- Keep route files minimal and readable.
- Prefer returning module components from page files.
- Keep route concerns (segment structure, metadata, route-level wrappers) here.

## Typical Imports
- Primarily imports from `src/components/layout`, `src/components/dashboard`, `src/components/ui`, and route-level wrappers.
