import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { refreshDashboardStudents } from '@/hooks/useDashboardStudentSync';

interface UseStudentsUrlStateParams {
  classId: string;
}

export function useStudentsUrlState({ classId }: UseStudentsUrlStateParams) {
  const searchParams = useSearchParams();
  const currentView = searchParams?.get('view') || 'grid';
  const currentMode = searchParams?.get('mode') || '';
  const isEditModeFromURL = currentMode === 'edit';
  const [isSeatingEditMode, setIsSeatingEditMode] = useState(false);
  const prevViewRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevViewRef.current === 'seating' && currentView === 'grid' && classId) {
      void refreshDashboardStudents();
    }
    prevViewRef.current = currentView;
  }, [currentView, classId]);

  useEffect(() => {
    setIsSeatingEditMode(isEditModeFromURL);
  }, [isEditModeFromURL]);

  useEffect(() => {
    const handleEditModeChange = (event: CustomEvent) => {
      setIsSeatingEditMode(event.detail.isEditMode || isEditModeFromURL);
    };

    window.addEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleEditModeChange as EventListener);
    return () => {
      window.removeEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleEditModeChange as EventListener);
    };
  }, [isEditModeFromURL]);

  return {
    currentView,
    isEditModeFromURL,
    isSeatingEditMode,
  };
}
