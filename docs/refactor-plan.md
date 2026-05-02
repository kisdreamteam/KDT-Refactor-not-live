# KIS-Points Refactor Checklist

**Goal:** Migrate the codebase to the 3-Tier/3-Layer blueprint defined in `architecture.md` without changing existing behavior.

**Rules of Engagement:**
1. **One Task = One PR/Session.** Do not mix structural moves with feature additions or cosmetic cleanups.
2. **Verify Before Checking.** Only mark a task `[x]` after verifying the behavior still works in the browser.
3. **Bottom-Up Data Extraction:** Always extract the `supabase` calls to `/api/` before changing the React component's UI structure.

---

## Phase 1: Baseline & Smoke Test
*Goal: Ensure we know exactly what is broken before we fix it.*

- [ ] Run a manual smoke test (Log in, view dashboard, award a point, view seating chart). Note any existing bugs so we don't blame the refactor later.
- [ ] Ensure `.cursorrules` and `architecture.md` are in the root directory.

---

## Phase 2: The Plumbing (Data Layer 3)
*Goal: Remove ALL direct `createClient` and `supabase` imports from React UI components and Contexts. Move them strictly to `/src/api/`.*

**Auth & Users**
- [x] Move `LoginForm.tsx` supabase calls to `/src/api/auth.ts`
- [x] Move `SignupForm.tsx` supabase calls to `/src/api/auth.ts`
- [x] Move `ForgotPasswordForm` & `ResetPasswordForm` calls to `/src/api/auth.ts`

**Core Dashboard Data**
- [x] Move `DashboardContext.tsx` initial fetching calls to `/src/api/students.ts` and `/src/api/classes.ts`
- [x] Move `CreateClassForm.tsx` calls to `/src/api/classes.ts`
- [x] Move `StudentsView.tsx` calls to `/src/api/students.ts` (Layer 3 verified: no `createClient` in view/modals/grid; points via `awardPointsService` → `@/api/points`; students via context + API modals)
- [x] Move `ClassesView.tsx` calls to `/src/api/classes.ts` (no `ClassesView.tsx` in repo; use this name for the classes grid view)
- [x] Classes UI sub-components (`EditClassModal.tsx`, `CreateClassModal.tsx`, `ClassCardsGrid.tsx`): Layer 3 verified — no direct Supabase; `@/api/*` only
- [x] Extract Supabase from SeatingChartView.tsx and SeatingChartEditorView.tsx

**Features**
- [x] Move `points.ts` (Ensure it aligns with standard API formatting)
- [x] Move `SeatingChartView.tsx` and `SeatingChartEditorView.tsx` calls to `/src/api/seating.ts`
- [x] Move all Student/Skill Modal calls (Add, Edit, Delete) to respective API files.
- [x] implement Layer 3 seating chart extraction with real-time cross-tab sync

---

## Phase 3: The Bridge & State Management
*Goal: Connect the UI to the new `/src/api/` layer using optimized, modular custom hooks and Contexts.*

- [x] **Auth:** Auth state managed cleanly via standard layout/context orchestrators.
- [x] **Points:** Implemented `useAwardPointsService.ts` and `useAwardPointsFlow.ts` to cleanly separate UI flow from domain-level point math.
- [x] **Seating:** Implemented `SeatingChartContext.tsx` and view-specific hooks to manage drag-and-drop state and real-time syncing prior to API saves.
- [x] **Students:** Implemented highly modular hooks (`useStudentsSelection.ts`, `useStudentsModalsState.ts`, `useStudentsToolbarEvents.ts`) to avoid a single monolithic student hook.
- [x] **Performance Optimization:** Wrapped all Context provider values in `useMemo` and orchestrator functions in `useCallback` (e.g., `DashboardContext.tsx`, `SeatingChartContext.tsx`) to prevent unnecessary UI re-renders.

---

## Phase 4: The Skeletons (Visual Tiers 1 & 2)
*Goal: Enforce the "GOD Box" layout and clean up routing.*

- [ ] **Tier 1:** Audit `/src/app/**/page.tsx` files. Ensure they are <15 lines and contain zero logic/state.
- [ ] **Tier 2:** Implement `DashboardLayout.tsx` strictly enforcing `h-screen w-screen overflow-hidden`.
- [ ] **Tier 2:** Implement `DashboardModule.tsx` to handle the CSS Grid routing (LeftNav + Main Stage).
- [ ] **Providers:** Move Context Providers out of UI components and wrap them cleanly in the Module or Root layout.

---

## Phase 5: The Furniture (Visual Tier 3)
*Goal: Make UI components "dumb" and agnostic.*

- [ ] **Navbars:** Decouple `BottomNavStudents` and `BottomNavSeatingEdit` from database logic; pass actions via props/hooks.
- [ ] **Modals:** Ensure modals (e.g., `EditStudentModal`) only manage local visual state (open/close, form text) and fire a hook function on submit.
- [ ] **Atoms:** Ensure