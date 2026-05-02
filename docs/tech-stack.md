# KIS-Points Tech Stack

This document defines the strict technology stack for KIS-Points. Do not install or suggest alternative libraries, ORMs, or frameworks without explicit permission.

## Current Prototype Stack
* **Framework:** Next.js (React)
* **Language:** TypeScript (Strict typing enforced)
* **Styling:** Tailwind CSS 
* **Database & Authentication:** Supabase (PostgreSQL, 6-digit OTP Auth)
* **Deployment:** Vercel

## ⚠️ Final Production Target: The "Vite" Migration
*Note for AI and Developers: The prototype was built on Next.js, but the final production version of KIS-Points will migrate to **Vite**.*

**Why Vite?**
KIS-Points is a highly interactive, native-feeling dashboard application (using a locked "GOD Box" layout). It does not require SEO optimization or Server-Side Rendering (SSR). 
1. **Pure Client-Side Rendering (CSR):** Vite allows us to drop Next.js Server Components, removing the need for `"use client"` directives everywhere.
2. **State Management:** Moving to Vite perfectly aligns with our planned use of **Zustand** for local UI state, which thrives in a pure CSR environment.
3. **Routing:** The final architecture will swap the Next.js App Router for React Router.

## Data Layer Tooling
* **Database Client:** `@supabase/supabase-js` (Strictly isolated to `/src/api/` Service Layer).
* **State Management (Data):** React Context API (The "Desk" holding Supabase data).
* **State Management (Visuals):** Zustand (Planned for the Vite migration to handle UI toggles like sidebars and modals).

## Strict Styling Rules (The "Paint" vs. "Physics")
We enforce a **Zero Custom CSS** policy. Do not create `.css` or `.scss` files for component styling. 

1. **The Paint (Strictly Tailwind):** All static visuals (colors, shadows, typography, flex/grid layouts, borders) MUST be handled by Tailwind CSS utility classes. 
2. **The Dynamic Physics Exception (Inline Styles):** You are permitted to use React inline `style={{}}` attributes **ONLY** for high-performance, real-time mathematical positioning. 
   * *Example:* The Seating Chart drag-and-drop editor updates `x` and `y` coordinates 60 times a second. Trying to inject dynamic Tailwind classes for this causes extreme browser lag. Use `style={{ transform: \`translate(${x}px, ${y}px)\` }}` for the physics, and Tailwind `className` for the paint.

## Core Architectural Rules tied to Stack
* **No Prisma or Drizzle:** We use the native Supabase client.
* **No Redux:** If global state is needed outside of Context, use Zustand.
* **No Bootstrap/Material UI:** Strictly Tailwind CSS using custom UI Atoms (`/src/components/ui`).
