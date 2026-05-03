# KIS-Points Zustand Migration Plan

**Goal:** Systematically migrate global state from React Context to Zustand to eradicate massive rendering bottlenecks (view switching, modal rendering, class switching, and student card updates) via selector-based rendering.

**Rules of Engagement:**
1. **Maintain the 3-Layer Data Boundary:** Zustand stores live at Tier 2 (The "Desk"). They hold data and setter functions but MUST NOT contain direct Supabase calls or complex business logic. Layer 1 hooks will orchestrate API calls and then update the store.
2. **Strict Selectors:** Tier 3 UI Components must subscribe *only* to the specific slice of state they need (e.g., `useDashboardStore(state => state.activeClass)`). 
3. **Verify Before Checking:** Mark rows `[x]` only after a manual browser smoke test confirms optimistic UI updates are functioning.

---

## Phase 1: View Switching (The UI Store)
**Target:** Eliminate layout cascades when switching between Classes, Students, and Seating Chart views.

- [ ] **Setup:** Run `npm install zustand`.
- [ ] **Typings:** Define the UI state shape in `/src/lib/types.ts` or at the top of the store file (e.g., `activeView`, `isSidebarOpen`).
- [ ] **Create Store:** Create `/src/stores/useDashboardUIStore.ts` with basic state and setter functions.
- [ ] **Reroute Readers:** Update `DashboardMainStage` (Tier 2b) to subscribe purely to `useDashboardUIStore(state => state.activeView)`. 
- [ ] **Reroute Writers:** Update Left Navbar and Top Navbar buttons to use the Zustand setter functions instead of Context.
- [ ] **Verification:** Switch views in the browser. Confirm the main stage swaps instantly without the navbar or toolbars re-rendering.

---

## Phase 2: Modals (The Modal Store)
**Target:** Prevent dashboard grid re-renders when a modal overlay opens.

- [ ] **Typings:** Define modal state (e.g., `isOpen`, `modalType`, `selectedStudentId`).
- [ ] **Create Store:** Create `/src/stores/useModalStore.ts`.
- [ ] **Reroute Readers:** Update root modal shells (e.g., `EditClassModalRoot`, `AwardPointsModal`) to subscribe to the modal store.
- [ ] **Reroute Writers:** Update Tier 3 buttons (e.g., clicking a student card) to call `useModalStore.getState().openModal(id)`.
- [ ] **Verification:** Open and close various modals. Confirm the background dashboard remains completely static.

---

## Phase 3: Core Data & Class Switching (The Dashboard Store)
**Target:** Eliminate overarching cascade when changing the active class. 

- [ ] **Typings:** Define data state (e.g., `students`, `classes`, `activeClassId`).
- [ ] **Create Store:** Create `/src/stores/useDashboardStore.ts`.
- [ ] **Reroute Writers (Layer 1):** Update Layer 1 hooks (e.g., `useClassPointLog`) to silently fetch the new roster from Layer 3 API when `activeClassId` changes, then call `setStudents()` in Zustand.
- [ ] **Reroute Readers (TopNav):** Update TopNav dropdown to call `setActiveClassId(newId)`.
- [ ] **Verification:** Swap classes in the dropdown. Confirm the grid smoothly swaps student data without the overarching layout re-rendering.

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