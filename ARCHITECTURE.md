# Architecture Guide

This file is a quick index to the folder-level architecture docs in this project.

## Core Layers
- [`src/app/README.md`](src/app/README.md)
- [`src/modules/README.md`](src/modules/README.md)
- [`src/layouts/README.md`](src/layouts/README.md)
- [`src/components/features/README.md`](src/components/features/README.md)
- [`src/components/ui/README.md`](src/components/ui/README.md)

## Domain UI
- [`src/components/modals/README.md`](src/components/modals/README.md)
- [`src/components/forms/README.md`](src/components/forms/README.md)

## Data and Logic
- [`src/api/README.md`](src/api/README.md)
- [`src/api/_shared/README.md`](src/api/_shared/README.md)
- [`src/hooks/README.md`](src/hooks/README.md)
- [`src/context/README.md`](src/context/README.md)
- [`src/lib/README.md`](src/lib/README.md)

## Feature Domain Example
- [`src/features/points/README.md`](src/features/points/README.md)

## Recommended Reading Order
1. `src/app` -> routes and entry points.
2. `src/modules` -> page assembly.
3. `src/layouts` -> structural screen scaffolding.
4. `src/components/features` -> feature orchestration.
5. `src/components/ui` -> reusable presentational building blocks.
6. `src/api` + `src/api/_shared` -> data access and error/auth conventions.
7. `src/hooks`, `src/context`, `src/lib` -> shared logic and utilities.
