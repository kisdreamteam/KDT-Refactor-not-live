'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getSessionUserId, updateTeacherPreferredView, type ViewPreference } from '@/lib/api/auth';
import { emitSeatingEditMode } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useUserStore } from '@/stores/useUserStore';
import { syncProfileCacheViewPreference } from '@/hooks/useDashboardProfileSync';

interface ViewModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewModeModal({ isOpen, onClose }: ViewModeModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = (searchParams?.get('view') || 'grid') as 'grid' | 'seating';

  const persistViewPreference = async (newView: ViewPreference) => {
    usePreferenceStore.getState().setViewPreference(newView);
    syncProfileCacheViewPreference(newView);
    try {
      const sessionUserId = await getSessionUserId();
      const userId = sessionUserId ?? useUserStore.getState().teacherProfile?.id;
      if (!userId) return;
      await updateTeacherPreferredView(userId, newView);
    } catch (err) {
      console.error('Unexpected error updating preferred view:', err);
    }
  };

  const handleViewChange = (view: 'grid' | 'seating') => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (view === 'grid') {
      params.set('view', 'grid');
      params.delete('mode');
      emitSeatingEditMode({ isEditMode: false });
    } else {
      params.set('view', view);
      params.delete('mode');
      emitSeatingEditMode({ isEditMode: false });
    }
    const base = pathname ?? '/';
    const newUrl = params.toString() ? `${base}?${params.toString()}` : base;
    if (`${window.location.pathname}${window.location.search}` === newUrl) {
      onClose();
      return;
    }
    useLayoutStore.getState().setActiveView(view === 'seating' ? 'seating_chart' : 'students');
    router.replace(newUrl, { scroll: false });
    void persistViewPreference(view === 'seating' ? 'seating' : 'students');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-blue-100 rounded-lg shadow-lg border-4 border-brand-purple py-2 z-[100] min-w-[200px]">
      <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">View mode:</div>
      <button
        onClick={() => handleViewChange('grid')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
          currentView === 'grid' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
        }`}
      >
        Student Grid
      </button>
      <button
        onClick={() => handleViewChange('seating')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
          currentView === 'seating' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
        }`}
      >
        Seating Chart
      </button>
    </div>
  );
}
