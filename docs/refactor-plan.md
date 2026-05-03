# KIS-Points Refactor Checklist

**Goal:** Migrate the codebase to the 3-Tier/3-Layer blueprint defined in [`architecture-plan.md`](architecture-plan.md) (see **§4 Final Directory Map** for the canonical folder layout) without changing existing behavior.

**Rules of Engagement:**
1. **One Task = One PR/Session.** Do not mix structural moves with feature additions or cosmetic cleanups.
2. **Verify Before Checking.** Only mark a task `[x]` after verifying the behavior still works in the browser.
3. **Bottom-Up Data Extraction:** Always extract the `supabase` calls to [`/src/api/`](../src/api/) before changing the React component's UI structure.

---

## Phase 1: Baseline & Smoke Test
*Goal: Ensure we know exactly what is broken before we fix it.*

- [ ] Run a manual smoke test (Log in, view dashboard, award a point, view seating chart). Note any existing bugs so we don't blame the refactor later.
- [ ] Ensure `.cursorrules` is in the root directory and [`architecture-plan.md`](architecture-plan.md) is in `/docs/`.

---

## Phase 2: The Plumbing (Data Layer 3)
*Goal: Remove ALL direct `createClient` and `supabase` imports from React UI components and Contexts. Move them strictly to [`/src/api/`](../src/api/) (Layer 3 in [architecture-plan.md](architecture-plan.md) §3).*

**Auth & Users**
- [x] Move [`LoginForm.tsx`](../src/components/features/auth/LoginForm.tsx) supabase calls to [`auth.ts`](../src/api/auth.ts)
- [x] Move [`SignupForm.tsx`](../src/components/features/auth/SignupForm.tsx) supabase calls to [`auth.ts`](../src/api/auth.ts)
- [x] Move [`ForgotPasswordForm.tsx`](../src/components/features/auth/ForgotPasswordForm.tsx) & [`ResetPasswordForm.tsx`](../src/components/features/auth/ResetPasswordForm.tsx) calls to [`auth.ts`](../src/api/auth.ts)

**Core Dashboard Data**
- [x] Move [`DashboardContext.tsx`](../src/context/DashboardContext.tsx) initial fetching calls to [`students.ts`](../src/api/students.ts) and [`classes.ts`](../src/api/classes.ts)
- [x] Move [`CreateClassForm.tsx`](../src/components/forms/CreateClassForm.tsx) calls to [`classes.ts`](../src/api/classes.ts)
- [x] Move [`StudentsView.tsx`](../src/components/features/dashboard/StudentsView.tsx) calls to [`students.ts`](../src/api/students.ts) (Layer 3 verified: no `createClient` in view/modals/grid; points via [`awardPointsService`](../src/features/points/services/awardPointsService.ts) → [`points.ts`](../src/api/points.ts); students via context + API modals)
- [x] Move [`ClassesView.tsx`](../src/components/features/dashboard/ClassesView.tsx) calls to [`classes.ts`](../src/api/classes.ts) (classes grid view)
- [x] Classes UI sub-components ([`EditClassModalRoot.tsx`](../src/features/classes/components/EditClassModalRoot.tsx) via [`EditClassModal` façade](../src/components/modals/EditClassModal.tsx), [`CreateClassModal.tsx`](../src/components/modals/CreateClassModal.tsx), [`ClassCardsGrid.tsx`](../src/components/features/dashboard/maincontent/viewClassesGrid/ClassCardsGrid.tsx)): Layer 3 verified — no direct Supabase; `@/api/*` only
- [x] Extract Supabase from [`SeatingChartView.tsx`](../src/components/features/dashboard/SeatingChartView.tsx) and [`SeatingChartEditorView.tsx`](../src/components/features/dashboard/SeatingChartEditorView.tsx)

**Features**
- [x] Align [`points.ts`](../src/api/points.ts) with standard API formatting
- [x] Move [`SeatingChartView.tsx`](../src/components/features/dashboard/SeatingChartView.tsx) and [`SeatingChartEditorView.tsx`](../src/components/features/dashboard/SeatingChartEditorView.tsx) calls to [`seating.ts`](../src/api/seating.ts)
- [x] Move Student/Skill modal flows to respective API files ([`students.ts`](../src/api/students.ts), [`skills.ts`](../src/api/skills.ts), etc.)
- [x] Layer 3 seating chart extraction with real-time cross-tab sync ([`seating.ts`](../src/api/seating.ts) + editor/view listeners)

---

## Phase 3: The Bridge & State Management
*Goal: Connect the UI to the new [`/src/api/`](../src/api/) layer using optimized, modular custom hooks and Contexts.*

- [x] **Auth:** Auth state managed cleanly via standard layout/context orchestrators.
- [x] **Points:** Implemented [`useAwardPointsService.ts`](../src/features/points/hooks/useAwardPointsService.ts) (integration) + [`awardPointsService.ts`](../src/features/points/services/awardPointsService.ts) (domain), and [`useAwardPointsFlow.ts`](../src/hooks/useAwardPointsFlow.ts) for confirmation/modal glue.
- [x] **Seating:** Implemented [`SeatingChartContext.tsx`](../src/context/SeatingChartContext.tsx) and [`useSeatingChartEditor`](../src/features/seating/hooks/useSeatingChart.ts) for editor “desk” state, DnD, and real-time sync prior to API saves.
- [x] **Students:** Implemented modular hooks under [`/src/components/features/dashboard/hooks/`](../src/components/features/dashboard/hooks/) (`useStudentsSelection.ts`, `useStudentsModalsState.ts`, `useStudentsToolbarEvents.ts`, …).
- [x] **Performance Optimization:** Wrapped Context provider values in `useMemo` and orchestrators in `useCallback` (e.g. [`DashboardContext.tsx`](../src/context/DashboardContext.tsx), [`SeatingChartContext.tsx`](../src/context/SeatingChartContext.tsx)).

---

## Phase 4: The Final Polish (Sweeping the Dust)
*Goal: Remove tech debt, orphaned files, and unused imports left over from rapid prototyping without breaking the new 3-Layer architecture.*

- [x] **Unused Imports:** Run a workspace-wide audit and safely remove unused React hooks, components, and Supabase imports.
- [x] **Dead Variables:** Clean up declared but unread parameters in hooks/components (e.g., renaming unused props to `_studentId` for TS compliance).
- [x] **Orphaned Files:** Safely delete disconnected components and outdated documentation (e.g., `AddGroupModal.tsx`, legacy `README.md` files).
- [x] **Guardrails:** Verify that no Layer 3 API files under [`/src/api/`](../src/api/) or optimized Contexts ([`DashboardContext`](../src/context/DashboardContext.tsx), [`SeatingChartContext`](../src/context/SeatingChartContext.tsx)) were altered during the sweep.
- [x] **Seating editor hook:** Extracted complex state from [`SeatingChartEditorView.tsx`](../src/components/features/dashboard/SeatingChartEditorView.tsx) into [`useSeatingChart.ts`](../src/features/seating/hooks/useSeatingChart.ts) (**named export:** `useSeatingChartEditor`; not the context hook `useSeatingChart`). The hook holds the “Desk” and coordinates with [`@/api/seating`](../src/api/seating.ts) for batch saves.

---

## Phase 5: The Furniture (Visual Tier 3)
*Goal: Make UI components "dumb" and agnostic.*

- [x] **Navbars:** Decouple [`BottomNavStudents`](../src/components/features/navbars/BottomNavStudents.tsx) / [`BottomNavSeatingEdit`](../src/components/features/navbars/BottomNavSeatingEdit.tsx) from persistence; shell + [`SeatingEditBottomNavBridge`](../src/components/features/navbars/SeatingEditBottomNavBridge.tsx) + [`useSeatingEditBottomNav`](../src/features/seating/hooks/useSeatingEditBottomNav.ts).
- [x] **Modals:** Presentational modals with `onSubmit` / parents wiring API (e.g. [`EditStudentModal`](../src/components/modals/EditStudentModal.tsx), [`AddSkillForm`](../src/components/forms/AddSkillForm.tsx)); class edit lives in [`EditClassModalRoot`](../src/features/classes/components/EditClassModalRoot.tsx) with a thin [`EditClassModal`](../src/components/modals/EditClassModal.tsx) façade.
- [x] **Atoms:** Keep shared UI under [`/src/components/ui/`](../src/components/ui/) free of `@/api` / Supabase; compose only via props and callbacks (see [architecture-plan.mdd](architecture-plan.md) §2 Tier 3).
