# KIS-Points Zustand Migration Plan

**Goal:** Systematically migrate global state from React Context to Zustand to eradicate massive rendering bottlenecks (view switching, modal rendering, class switching, and student card updates) via selector-based rendering.

**Rules of Engagement:**
1. **Maintain the 3-Layer Data Boundary:** Zustand stores live at Tier 2 (The "Desk"). They hold data and setter functions but MUST NOT contain direct Supabase calls or complex business logic. Layer 1 hooks will orchestrate API calls and then update the store.
2. **Strict Selectors:** Tier 3 UI Components must subscribe *only* to the specific slice of state they need (e.g., `useDashboardStore(state => state.activeClass)`). 
3. **Verify Before Checking:** Mark rows `[x]` only after a manual browser smoke test confirms optimistic UI updates are functioning.

---

## Phase 1: View Switching (The UI Store)
**Target:** Eliminate layout cascades when switching between Classes, Students, and Seating Chart views.

- [x] **Setup:** Run `npm install zustand`.
- [x] **Typings:** Define the UI state shape in `/src/lib/types.ts` or at the top of the store file (e.g., `activeView`, `isSidebarOpen`).
- [x] **Create Store:** Create [`/src/stores/useLayoutStore.ts`](../src/stores/useLayoutStore.ts) with basic state and setter functions.
- [x] **Reroute Readers:** Update [`DashboardMainStage`](../src/components/features/dashboard/DashboardMainStage.tsx) (Tier 2b) to subscribe purely to `useLayoutStore((state) => state.activeView)`; [`DashboardStage`](../src/components/features/dashboard/DashboardStage.tsx) reads seating chrome from the same store. URL is synced from [`DashboardLayout`](../src/layouts/dashboard/DashboardLayout.tsx) via `useLayoutEffect`.
- [x] **Reroute Writers:** Update [`LeftNav`](../src/components/features/navbars/LeftNav.tsx) and [`ViewModeModal`](../src/components/modals/ViewModeModal.tsx) to call `setActiveView` from `useLayoutStore` (TopNav has no view switches).
- [x] **Verification:** `npm run build` passed; confirm in the browser: `/dashboard` ↔ class routes, grid ↔ seating via View modal, deep link `?view=seating`, and stage chrome (TopNav / toolbar) still match seating vs non-seating.

---

## Phase 2: Modals (The Modal Store)
**Target:** Prevent dashboard grid re-renders when a modal overlay opens.

- [x] **Typings:** Modal state in [`/src/stores/useModalStore.ts`](../src/stores/useModalStore.ts): `isOpen`, `modalType`, `selectedStudentId`, `awardTargetStudentIds`, `openModal` / `closeModal`.
- [x] **Create Store:** [`/src/stores/useModalStore.ts`](../src/stores/useModalStore.ts).
- [x] **Reroute Readers:** [`DashboardClassModalsHost`](../src/components/features/dashboard/DashboardClassModalsHost.tsx) in [`DashboardLayout`](../src/layouts/dashboard/DashboardLayout.tsx) renders `AwardPointsModal`, `EditStudentModal`, `AddStudentsModal`, and `PointsAwardedConfirmationModal` (with `useAwardPointsFlow`) using strict store selectors.
- [x] **Reroute Writers:** [`useStudentsModalsState`](../src/components/features/dashboard/hooks/useStudentsModalsState.ts), [`useStudentsSelection`](../src/components/features/dashboard/hooks/useStudentsSelection.ts), and [`SeatingChartView`](../src/components/features/dashboard/SeatingChartView.tsx) call `useModalStore.getState().openModal(...)`. Seating roster patch via [`SEATING_STUDENT_POINTS_DELTA`](../src/lib/events/students.ts); multi-select clear via [`MULTI_STUDENT_AWARD_COMPLETE`](../src/lib/events/students.ts).
- [x] **Verification:** `npm run build` passed; manually confirm award (single / whole / multi), edit student, add students, seating group/single award, and confirmation modal.

---

## Phase 3: Core Data & Class Switching (The Dashboard Store)
**Target:** Eliminate overarching cascade when changing the active class. 

- [x] **Typings:** Dashboard data state in [`/src/stores/useDashboardStore.ts`](../src/stores/useDashboardStore.ts): `activeClassId`, `classes`, `students`, loading flags, functional `setStudents`.
- [x] **Create Store:** [`/src/stores/useDashboardStore.ts`](../src/stores/useDashboardStore.ts).
- [x] **Reroute Writers (Layer 1):** [`/src/hooks/useDashboardStudentSync.ts`](../src/hooks/useDashboardStudentSync.ts) syncs URL → `activeClassId`, fetches roster via Layer 3 API (`fetchStudentsByClassId`), updates the store, and exports `refreshDashboardStudents(force?)`. `useClassPointLog` still receives `(classId, students)` from parents that read `students` via store selectors (e.g. [`StudentsView.tsx`](../src/components/features/dashboard/StudentsView.tsx)).
- [x] **Reroute Readers:** [`TopNav.tsx`](../src/components/features/navbars/TopNav.tsx) remains title + logo only. Class switching is via URL, [`LeftNav.tsx`](../src/components/features/navbars/LeftNav.tsx) (`setActiveClassId` on class link click before navigation), and [`useDashboardStudentSync.ts`](../src/hooks/useDashboardStudentSync.ts) keeping the store aligned with the route.
- [x] **Verification:** `npm run build` passed. Manually confirm: LeftNav class links, deep link to `/dashboard/classes/[id]`, grid ↔ seating then back to grid (triggers `refreshDashboardStudents` via [`useStudentsUrlState.ts`](../src/components/features/dashboard/hooks/useStudentsUrlState.ts)).

---

## Phase 4: Point Awarding (The Selector Magic)
**Target:** Prevent the entire grid from flashing when a single student receives a point.

- [ ] **Reroute Writers (Layer 1):** Update `useAwardPointsService.ts` to push the new calculated point total to the specific student object in the Zustand store.
- [ ] **Reroute Readers (Tier 3):** Refactor `StudentCard` components to use a strict selector: subscribe *only* to their specific student object's points.
- [ ] **Verification:** Award a point to "Alice". Confirm ONLY Alice's card flashes the update, while the rest of the grid remains un-rendered.

---

## Phase 5: The Cleanup
**Target:** Remove the old "God Box" wrappers.

- [ ] **Remove Context:** Delete the `<DashboardContext.Provider>` wrapper from `DashboardLayout.tsx`.
- [ ] **Delete Files:** Once fully verified, safely delete `DashboardContext.tsx` from the codebase.