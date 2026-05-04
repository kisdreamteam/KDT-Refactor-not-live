# KIS-Points Architecture Plan

This document outlines the strict structural boundaries for the KIS-Points Prototype 1. We employ a dual-architecture system: a **Visual 3-Tier** system for the UI, and a **Data 3-Layer** system for state and database interactions.

---

## 1. Visual 3-Tier Separation (The Theater)

This defines how React components are structured and rendered.

### Tier 1: Scaffolding (The Theater Building)
* **Responsibility:** Persistent layout, routing bounds, and navigation. 
* **Components:** `RootLayout`, `DashboardLayout`, `TopNav`, `LeftNav`.
* **Rules:** Rarely re-renders. Reads from the Zustand UI store (e.g., to highlight the active nav link) but does not handle complex business logic or data fetching.

### Tier 2: The Main Stage (The Sets)
* **Responsibility:** Layout containers that decide *what* gets rendered based on the active view.
* **Components:** `DashboardViewSwitch`, `ClassView`, `StudentView`, `SeatingChart`.
* **Rules:** Subscribes to Zustand UI state via strict selectors (e.g., `useDashboardUIStore(state => state.activeView)`). Acts as a grid or container for Tier 3 components.

### Tier 3: The Actors (Pure UI Components)
* **Responsibility:** Render data, handle user clicks, and look good.
* **Components:** `StudentCard`, `ActionButtons`, `Avatar`, Modals.
* **Rules:** * Highly reusable and modular.
  * Subscribes to Zustand Data state via **strict, deep selectors** (e.g., subscribing ONLY to a single student's point total, not the whole roster) to prevent grid-wide re-renders.
  * Calls Layer 1 Hooks or Zustand setter functions on click.

---

## 2. Data 3-Layer Separation (The Flow)

This defines how data moves from Supabase to the screen. **React Context is strictly forbidden for global state.**

### Layer 1: The Orchestrators (Custom Hooks)
* **Responsibility:** Business logic and coordination. 
* **Location:** `/src/hooks/`
* **Flow:** 1. Triggered by a Tier 3 UI event (e.g., "Award Point").
  2. Updates Layer 2 (Zustand) immediately for Optimistic UI.
  3. Calls Layer 3 (Supabase) to persist the change.
  4. Reverts Layer 2 if Layer 3 fails.
* **Examples:** `useAwardPointsService`, `useClassLog`.

### Layer 2: The Desk (Zustand Stores)
* **Responsibility:** Global Application State (UI and Data).
* **Location:** `/src/stores/`
* **Rules:**
  * **No Complex Logic:** Stores only hold variables and basic setter functions. 
  * **No Database Calls:** Zustand must never import or call Supabase.
  * **Granular Stores:** State is split logically (e.g., `useDashboardUIStore`, `useDashboardDataStore`, `useModalStore`) to avoid massive god-objects.
* **Flow:** Receives data from Layer 1; feeds data to Tiers 2 & 3 via strict selectors.

### Layer 3: The Vault (API / Supabase)
* **Responsibility:** Pure database interactions.
* **Location:** `/src/lib/api/` or direct Supabase client calls.
* **Rules:** Dumb pipes. They take parameters, run SQL/RPC queries, and return raw arrays or objects. They know nothing about React or Zustand.

---

## 3. Directory Structure Map

During the migration, old Context files will remain until fully deprecated. The target structure is:

```text
/src
  /components
    /layout       # Tier 1 (Navbars, Shells)
    /dashboard    # Tier 2 (Main Stage, Views)
    /ui           # Tier 3 (StudentCards, Buttons, Modals)
  /hooks          # Layer 1 (Business Logic & Orchestration)
  /stores         # Layer 2 (Zustand - Global State)
      useDashboardUIStore.ts
      useDashboardDataStore.ts
      useModalStore.ts
  /lib            
    /api          # Layer 3 (Supabase queries)
    types.ts      # Global TypeScript definitions
