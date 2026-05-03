import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewPreference } from '@/api/auth';

export type SortOption = 'number' | 'alphabetical' | 'points';

interface PreferenceStore {
  sortBy: SortOption;
  viewMode: 'active' | 'archived';
  viewPreference: ViewPreference;
  setSortBy: (sortBy: SortOption) => void;
  setViewMode: (viewMode: 'active' | 'archived') => void;
  setViewPreference: (viewPreference: ViewPreference) => void;
}

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set) => ({
      sortBy: 'number',
      viewMode: 'active',
      viewPreference: 'students',
      setSortBy: (sortBy) => set({ sortBy }),
      setViewMode: (viewMode) => set({ viewMode }),
      setViewPreference: (viewPreference) => set({ viewPreference }),
    }),
    {
      name: 'kis-dashboard-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sortBy: s.sortBy }),
    }
  )
);
