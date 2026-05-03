import { create } from 'zustand';

export type ViewState = 'classes' | 'students' | 'seating_chart';

interface LayoutStore {
  activeView: ViewState;
  isSidebarOpen: boolean;
  setActiveView: (view: ViewState) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  activeView: 'classes', // Default starting view
  isSidebarOpen: true,   // Sidebar open by default
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));