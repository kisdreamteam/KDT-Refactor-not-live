import { create } from 'zustand';

export type ViewState = 'classes' | 'students' | 'seating_chart';

interface LayoutStore {
  activeView: ViewState;
  isSidebarOpen: boolean;
  isMultiSelectMode: boolean;
  setActiveView: (view: ViewState) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMultiSelectMode: (v: boolean) => void;
  toggleMultiSelectMode: () => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  activeView: 'classes',
  isSidebarOpen: true,
  isMultiSelectMode: false,
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setMultiSelectMode: (isMultiSelectMode) => set({ isMultiSelectMode }),
  toggleMultiSelectMode: () => set((state) => ({ isMultiSelectMode: !state.isMultiSelectMode })),
}));