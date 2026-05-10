'use client';

import type { SortOption } from '@/stores/usePreferenceStore';

interface StudentsSortingMenuProps {
  isOpen: boolean;
  sortBy: SortOption;
  onPick: (next: SortOption) => void;
}

export default function StudentsSortingMenu({ isOpen, sortBy, onPick }: StudentsSortingMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 z-[100] mb-2 min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg">
      <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Sort by:</div>
      <button
        type="button"
        onClick={() => onPick('number')}
        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
          sortBy === 'number' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
        }`}
      >
        Student Number
      </button>
      <button
        type="button"
        onClick={() => onPick('alphabetical')}
        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
          sortBy === 'alphabetical' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
        }`}
      >
        Alphabetical
      </button>
      <button
        type="button"
        onClick={() => onPick('points')}
        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
          sortBy === 'points' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
        }`}
      >
        Points
      </button>
    </div>
  );
}
