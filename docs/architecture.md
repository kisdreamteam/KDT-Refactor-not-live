# KIS-Points Master Architecture Blueprint

This document defines the structural laws of the KIS-Points codebase. All refactoring and new feature development MUST adhere to these tiers, layers, and boundaries.

## 1. Core Architectural Philosophy
* **"Zero-Spaghetti" Separation:** Visual rendering (React/UI) is strictly separated from Data fetching/logic (Supabase/Math). UI components must never contain direct database calls.
* **Hybrid Feature-First:** Complex logic is grouped by feature domain (e.g., `/features/points`) rather than technical type, ensuring high cohesion. Generic UI remains global (`/components/ui`).
* **The "Desk vs. Library" Flow:** We fetch data from Supabase (The Library) once on mount, store it in local Context/Zustand (The Desk), and UI components read/write from The Desk for zero-latency optimistic updates.
* **The "GOD Box" Physics:** The application operates as a locked, native workstation. The root layout enforces `h-screen w-screen overflow-hidden` to prevent browser-level scrolling, delegating all scrolling to specific internal module panes.

---

## 2. The 3-Tier Visual Architecture (Front-of-House)
This system governs exactly what renders on the screen and how the CSS grid is managed.

* **Tier 1: Routing (The Front Door)**
  * **Path:** `/src/app/`
  * **Rule:** Files here are under 15 lines. No logic, no state. They simply import a Module and return it.
* **Tier 2: Layouts & Modules (The Skeletons & Stage Managers)**
  * **Path:** `/src/layouts/`, `/src/modules/`
  * **Rule:** Layouts control global physics. Modules act as "Stage Managers," dynamically dictating CSS Grid/Flex allocations (e.g., deciding if the sidebar takes 2 columns or is hidden). Context Providers wrap these modules.
* **Tier 3: Features & Atoms (The Furniture)**
  * **Path:** `/src/components/ui/`, `/src/components/features/`
  * **Rule:** Completely "Dumb" components. They accept props, handle local visual toggles (like opening a dropdown), and execute callback functions.

---

## 3. The 3-Layer Data Architecture (Back-of-House)
This system governs how data is validated, calculated, and securely saved.

* **Layer 1: Integration (The Bridge)**
  * **Path:** `/src/hooks/` or `/src/features/[domain]/hooks/`
  * **Rule:** Custom React hooks. The ONLY layer allowed to talk to both the UI (React) and the pure logic. Manages loading states, toasts, and context updates.
* **Layer 2: Domain (Business Logic)**
  * **Path:** `/src/features/[domain]/services/`
  * **Rule:** Pure TypeScript/JavaScript math and rules. NO React (`useState`), NO database queries. Data in, calculated data out.
* **Layer 3: Service (The Plumbing)**
  * **Path:** `/src/api/`
  * **Rule:** The ONLY place where `import { supabase }` is permitted. Blindly executes database reads, inserts, and soft deletes based on the Domain layer's output.

---

## 4. Final Directory Map

```text
/kis-points
├── /docs                                      # Blueprints & domain reference
│   ├── architecture.md                        # (This file)
│   ├── refactor-plan.md                       # Refactor checklist
│   ├── tech-stack.md
│   └── seat-index-logic.md                    # Seating seat-index rules
│
├── /src
│   ├── /app                                   # TIER 1: ROUTING
│   │   ├── layout.tsx
│   │   ├── /dashboard/...                     # Thin pages → modules + layouts
│   │   └── /login, /signup, /forgot-password, /reset-password
│   │
│   ├── /layouts                               # TIER 2a: SKELETONS (shell layout, auth pages)
│   │   ├── /dashboard
│   │   │   └── DashboardLayout.tsx            # Dashboard “GOD box”; stage + nav bridges + modals
│   │   └── /auth
│   │       └── AuthPageLayout.tsx
│   │
│   ├── /modules                               # TIER 2b: STAGE MANAGERS (route-level composition)
│   │   ├── /dashboard
│   │   │   └── DashboardModule.tsx
│   │   ├── /auth                              # LoginModule, SignupModule
│   │   └── /landing
│   │       └── LandingModule.tsx
│   │
│   ├── /context                               # TIER 2: SHARED “DESK” STATE (React Context)
│   │   ├── DashboardContext.tsx               # Classes, students, seating layout id, …
│   │   ├── SeatingChartContext.tsx            # Unseated students, pick-for-group (namespaced hook)
│   │   ├── SeatingLayoutNavContext.tsx        # Left-nav layout list for seating view
│   │   └── StudentSortContext.tsx             # Student grid sort preference
│   │
│   ├── /hooks                                 # LAYER 1: CROSS-FEATURE INTEGRATION
│   │   ├── useAwardPointsFlow.ts              # Award confirmation / modal flow glue
│   │   ├── useClassPointLog.ts
│   │   └── useDashboardToolbarInset.ts
│   │
│   ├── /components                            # TIER 3: VISUAL COMPONENTS
│   │   ├── /ui                                # Atoms (BaseCard, CanvasToolbar, …)
│   │   ├── /forms                             # Forms; persistence via parent `onSubmit` where refactored
│   │   ├── /modals                            # Modal shells; some re-export feature implementations
│   │   │   └── EditClassModal.tsx             # Façade → `@/features/classes/components/EditClassModalRoot`
│   │   └── /features
│   │       ├── /auth                          # Login, signup, password forms
│   │       ├── /landing
│   │       ├── /dashboard                     # Students / classes / seating views, stage, tools
│   │       │   ├── /hooks                     # useStudentsSelection, useStudentsModalsState, …
│   │       │   ├── /maincontent               # Grids, StudentsModals, …
│   │       │   ├── /seating                   # SeatingCanvasDecor, …
│   │       │   └── /tools                     # Timer, Random
│   │       └── /navbars                       # TopNav, LeftNav*, BottomNav*; seating edit bridge
│   │           └── SeatingEditBottomNavBridge.tsx   # Mount-only → useSeatingEditBottomNav
│   │
│   ├── /features                              # LAYER 1 & 2: FEATURE DOMAINS
│   │   ├── /points
│   │   │   ├── /hooks
│   │   │   │   └── useAwardPointsService.ts   # Award RPC + UI-oriented helpers
│   │   │   └── /services
│   │   │       └── awardPointsService.ts      # Pure point math / payload shaping
│   │   ├── /seating
│   │   │   ├── /hooks
│   │   │   │   ├── useSeatingChart.ts         # Editor “desk” (named export: useSeatingChartEditor)
│   │   │   │   └── useSeatingEditBottomNav.ts # Seating edit bottom bar view settings + events
│   │   │   └── /services
│   │   │       └── seatingLogic.ts            # Pure seat/slot/coordinate helpers
│   │   └── /classes
│   │       └── /components
│   │           └── EditClassModalRoot.tsx     # Class edit UI + persistence (not under /modals)
│   │
│   ├── /api                                   # LAYER 3: SERVICE LAYER (Supabase / RPC)
│   │   ├── /_shared                           # Shared helpers for API modules
│   │   │   ├── auth.ts
│   │   │   ├── errors.ts
│   │   │   └── README.md
│   │   ├── auth.ts
│   │   ├── classes.ts
│   │   ├── points.ts
│   │   ├── seating.ts
│   │   ├── skills.ts
│   │   └── students.ts
│   │
│   ├── /lib                                   # TOOLBOX (no direct DB from UI helpers)
│   │   ├── client.ts                          # Supabase browser client (used from /api)
│   │   ├── types.ts
│   │   ├── iconUtils.ts
│   │   ├── /hooks                             # e.g. useAvailableIcons
│   │   └── /events
│   │       └── students.ts                    # Cross-widget CustomEvent names + emit helpers
│   │
│   └── /styles
│       └── globals.css
```

**Notes**

- **`useSeatingChartEditor`** is exported from [`src/features/seating/hooks/useSeatingChart.ts`](../src/features/seating/hooks/useSeatingChart.ts). Do not confuse it with **`useSeatingChart`** in [`src/context/SeatingChartContext.tsx`](../src/context/SeatingChartContext.tsx) (see file header on the hook).
- **Tier 3 modals:** Several modals are thin shells; persistence is wired in parents (e.g. `StudentsView`, `AwardPointsModal`) or implemented under **`/features/classes`** for class edit.
