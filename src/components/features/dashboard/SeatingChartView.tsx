'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { Student } from '@/lib/types';
import { useDashboard } from '@/context/DashboardContext';
import { useSeatingLayoutNav } from '@/context/SeatingLayoutNavContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import CreateLayoutModal from '@/components/modals/CreateLayoutModal';
import EditLayoutModal from '@/components/modals/EditLayoutModal';
import ClassPointLogSlidePanel from '@/components/ui/ClassPointLogSlidePanel';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import {
  createSeatingLayout,
  deleteSeatingLayoutCascade,
  fetchLayoutViewSettings,
  subscribeToSeatingChartRowUpdates,
  updateSeatingLayoutName,
} from '@/api/seating';
import {
  refreshSeatingGroupsForLayout,
  refreshSeatingLayoutsForClass,
} from '@/hooks/useSeatingChartDataSync';
import SeatingCanvasDecor from './seating/SeatingCanvasDecor';
import SeatingGroupsCanvas from './seating/SeatingGroupsCanvas';
import { STUDENT_EVENTS, emitSeatingEditMode, emitSeatingLayoutSelected } from '@/lib/events/students';
import { useSeatingStore, subscribeSeatingPointsDeltaForClass } from '@/stores/useSeatingStore';

interface SeatingChartViewProps {
  classId: string;
  /** Shared class roster from parent — avoids duplicate Supabase fetch when toggling grid/seating. */
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  isMultiSelectMode?: boolean;
  selectedStudentIds?: string[];
  onSelectStudent?: (studentId: string) => void;
}

export default function SeatingChartView({
  classId,
  students: _students,
  setStudents: _setStudents,
  isMultiSelectMode = false,
  selectedStudentIds = [],
  onSelectStudent,
}: SeatingChartViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.toString() ?? '';
  const currentView = searchParams?.get('view') || 'grid';
  const { activeSeatingLayoutId, setActiveSeatingLayoutId } = useDashboard();
  const { layouts, isLoadingLayouts, layoutsError } = useSeatingStore(
    useShallow((s) => ({
      layouts: s.layouts,
      isLoadingLayouts: s.isLoadingLayouts,
      layoutsError: s.layoutsError,
    }))
  );
  const { showGrid, showObjects, layoutOrientation } = useSeatingStore(
    useShallow((s) => ({
      showGrid: s.showGrid,
      showObjects: s.showObjects,
      layoutOrientation: s.layoutOrientation,
    }))
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const setSeatingLayoutData = useSeatingLayoutNav();
  const [layoutToDelete, setLayoutToDelete] = useState<{ id: string; name: string } | null>(null);
  const [layoutToEdit, setLayoutToEdit] = useState<{ id: string; name: string } | null>(null);
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeacherView, setIsTeacherView] = useState(false);

  const {
    isPointLogOpen,
    setIsPointLogOpen,
    isPointLogLoading,
    pointLogError,
    logPage,
    setLogPage,
    rowsPerPage,
    setRowsPerPage,
    logTotalCount,
    totalPages,
    safeLogPage,
    pagedPointLogRows,
  } = useClassPointLog(classId);

  const handleDeleteLayout = useCallback((layoutId: string, layoutName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayoutToDelete({ id: layoutId, name: layoutName });
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditLayout = useCallback((layoutId: string, layoutName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayoutToEdit({ id: layoutId, name: layoutName });
    setIsEditLayoutModalOpen(true);
  }, []);

  useEffect(() => {
    if (!classId) return;
    const storageKey = `seatingChart_teacherView_${classId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setIsTeacherView(stored === 'true');
    }
  }, [classId]);

  useEffect(() => {
    if (activeSeatingLayoutId && classId) {
      const storageKey = `seatingChart_selectedLayout_${classId}`;
      localStorage.setItem(storageKey, activeSeatingLayoutId);
      emitSeatingLayoutSelected({ layoutId: activeSeatingLayoutId, classId });
    }
  }, [activeSeatingLayoutId, classId]);

  useEffect(() => {
    setSeatingLayoutData({
      layouts,
      selectedLayoutId: activeSeatingLayoutId,
      onSelectLayout: setActiveSeatingLayoutId,
      onAddLayout: () => setIsCreateModalOpen(true),
      onEditLayout: handleEditLayout,
      onDeleteLayout: handleDeleteLayout,
      isLoadingLayouts,
    });
    return () => setSeatingLayoutData(null);
  }, [
    activeSeatingLayoutId,
    handleDeleteLayout,
    handleEditLayout,
    isLoadingLayouts,
    layouts,
    setActiveSeatingLayoutId,
    setSeatingLayoutData,
  ]);

  useEffect(() => {
    return subscribeSeatingPointsDeltaForClass(classId);
  }, [classId]);

  useEffect(() => {
    if (!activeSeatingLayoutId) return;
    const currentLayout = layouts.find((l) => l.id === activeSeatingLayoutId);
    if (currentLayout) {
      useSeatingStore.getState().applyLayoutViewSettings(currentLayout);
    }
  }, [activeSeatingLayoutId, layouts]);

  useEffect(() => {
    if (!activeSeatingLayoutId) return;

    const handleViewSettingsUpdate = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const data = await fetchLayoutViewSettings(activeSeatingLayoutId);
        if (!data) return;
        useSeatingStore.getState().applyLayoutViewSettings(data);
      } catch {
        // Silently fail
      }
    };

    const handleLocalSettingsEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        layoutId?: string;
        show_grid?: boolean | null;
        show_objects?: boolean | null;
        layout_orientation?: string | null;
      }>;
      const detail = customEvent.detail;
      if (!detail || detail.layoutId !== activeSeatingLayoutId) return;
      useSeatingStore.getState().applyLayoutViewSettings(detail);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void handleViewSettingsUpdate();
      }
    };

    window.addEventListener(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, handleLocalSettingsEvent as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { unsubscribe } = subscribeToSeatingChartRowUpdates(
      activeSeatingLayoutId,
      (nextRow) => {
        useSeatingStore.getState().applyLayoutViewSettings(nextRow);
      },
      {
        onRefresh: (payload) => {
          if (payload.layoutId !== activeSeatingLayoutId) return;
          void refreshSeatingGroupsForLayout(activeSeatingLayoutId);
        },
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED,
        handleLocalSettingsEvent as EventListener
      );
      unsubscribe();
    };
  }, [activeSeatingLayoutId]);

  const handleEditLayoutSave = async (newName: string) => {
    if (!layoutToEdit) return;
    try {
      await updateSeatingLayoutName(layoutToEdit.id, newName);
    } catch (error) {
      console.error('Error updating layout name:', error);
      throw new Error('Failed to update layout name.');
    }
    await refreshSeatingLayoutsForClass(classId, activeSeatingLayoutId, setActiveSeatingLayoutId);
    setLayoutToEdit(null);
    setIsEditLayoutModalOpen(false);
  };

  const handleOpenSeatingEditor = useCallback(() => {
    const base = pathname ?? '/';
    emitSeatingEditMode({ isEditMode: true });
    const params = new URLSearchParams(searchQuery);
    params.set('mode', 'edit');
    if (activeSeatingLayoutId) params.set('layout', activeSeatingLayoutId);
    router.push(params.toString() ? `${base}?${params.toString()}` : `${base}?mode=edit`);
  }, [activeSeatingLayoutId, pathname, router, searchQuery]);

  useEffect(() => {
    const handleCreateLayout = () => {
      if (currentView !== 'seating') return;
      setIsCreateModalOpen(true);
    };
    const handleOpenEditor = () => {
      if (currentView !== 'seating') return;
      if (layouts.length > 0) handleOpenSeatingEditor();
    };
    const handleToggleTeacherView = () => {
      if (currentView !== 'seating') return;
      setIsTeacherView((v) => {
        const next = !v;
        if (classId) localStorage.setItem(`seatingChart_teacherView_${classId}`, String(next));
        return next;
      });
    };
    const handleTogglePointLog = () => {
      if (currentView !== 'seating') return;
      setIsPointLogOpen((v) => !v);
    };

    window.addEventListener(STUDENT_EVENTS.STAGE_CREATE_LAYOUT, handleCreateLayout);
    window.addEventListener(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR, handleOpenEditor);
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW, handleToggleTeacherView);
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, handleTogglePointLog);
    return () => {
      window.removeEventListener(STUDENT_EVENTS.STAGE_CREATE_LAYOUT, handleCreateLayout);
      window.removeEventListener(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR, handleOpenEditor);
      window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW, handleToggleTeacherView);
      window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, handleTogglePointLog);
    };
  }, [classId, currentView, handleOpenSeatingEditor, layouts.length, setIsPointLogOpen]);

  const handleDeleteConfirmed = async () => {
    if (!layoutToDelete) return;

    try {
      await deleteSeatingLayoutCascade(layoutToDelete.id);

      if (activeSeatingLayoutId === layoutToDelete.id) {
        setActiveSeatingLayoutId(null);
        const storageKey = `seatingChart_selectedLayout_${classId}`;
        localStorage.removeItem(storageKey);
      }

      await refreshSeatingLayoutsForClass(classId, activeSeatingLayoutId, setActiveSeatingLayoutId);

      setIsDeleteModalOpen(false);
      setLayoutToDelete(null);
    } catch (err) {
      console.error('Unexpected error deleting layout:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsDeleteModalOpen(false);
      setLayoutToDelete(null);
    }
  };

  const handleCreateLayout = async (layoutName: string) => {
    try {
      const data = await createSeatingLayout({ classId, name: layoutName });

      if (data) {
        const storageKey = `seatingChart_selectedLayout_${classId}`;
        localStorage.setItem(storageKey, data.id);

        await refreshSeatingLayoutsForClass(classId, activeSeatingLayoutId, setActiveSeatingLayoutId);
        setActiveSeatingLayoutId(data.id);
        setIsCreateModalOpen(false);

        emitSeatingEditMode({ isEditMode: true });
        const params = new URLSearchParams();
        params.set('view', 'seating');
        params.set('mode', 'edit');
        params.set('layout', data.id);
        const base = pathname ?? '/';
        const newUrl = `${base}?${params.toString()}`;
        router.push(newUrl);
      }
    } catch (err) {
      console.error('Unexpected error creating seating chart:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const retryLayouts = () => {
    void refreshSeatingLayoutsForClass(classId, activeSeatingLayoutId, setActiveSeatingLayoutId);
  };

  const hasLayouts = layouts.length > 0;
  const showGroupsLayer = hasLayouts && !isLoadingLayouts && !layoutsError;

  return (
    <div className="font-spartan w-full h-full min-h-0 bg-brand-purple relative">
      <ClassPointLogSlidePanel
        isOpen={isPointLogOpen}
        position="absolute"
        rightPx={72}
        topPx={8}
        bottomPx={8}
        zIndex={40}
        logTotalCount={logTotalCount}
        pointLogError={pointLogError}
        isPointLogLoading={isPointLogLoading}
        pagedRows={pagedPointLogRows}
        safeLogPage={safeLogPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setLogPage={setLogPage}
        setRowsPerPage={setRowsPerPage}
      />

      <div
        className="bg-brand-cream border-2 border-black rounded-lg pt-2 overflow-hidden min-h-0 h-full w-full relative"
        style={{ zIndex: 1 }}
      >
        {isLoadingLayouts && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand-cream/80">
            <p className="text-brand-purple text-xl font-medium">Loading seating charts...</p>
          </div>
        )}

        {layoutsError && !isLoadingLayouts && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-brand-cream/90 p-4">
            <p className="text-brand-purple text-xl text-center">{layoutsError}</p>
            <button
              type="button"
              onClick={retryLayouts}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoadingLayouts && !layoutsError && !hasLayouts && (
          <div className="p-6 sm:p-8 md:p-10 h-full flex flex-col items-center justify-center min-h-[40vh] gap-6">
            <div className="text-center">
              <h2 className="text-brand-purple text-2xl font-semibold mb-2">No seating charts yet</h2>
              <p className="text-brand-purple/80 text-lg">
                Click the + button (top right) to create a new layout, or the pencil to open the Seating Editor after you
                have one.
              </p>
            </div>
          </div>
        )}

        {showGroupsLayer && (
          <div
            className="absolute inset-0"
            style={{
              transform: isTeacherView ? 'rotate(180deg)' : undefined,
              transformOrigin: 'center center',
            }}
          >
            <SeatingCanvasDecor
              showGrid={showGrid}
              showObjects={showObjects}
              layoutOrientation={layoutOrientation}
              isTeacherView={isTeacherView}
              borderClassName="border-gray-800"
            />
            <SeatingGroupsCanvas
              isTeacherView={isTeacherView}
              isMultiSelectMode={isMultiSelectMode}
              selectedStudentIds={selectedStudentIds}
              onSelectStudent={onSelectStudent}
            />
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLayoutToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
        title="Delete Layout"
        message={`Are you sure you want to delete "${layoutToDelete?.name}"? This action cannot be undone and will permanently delete the layout, all groups, and student seat assignments.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        }
      />

      <CreateLayoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateLayout={handleCreateLayout}
      />

      <EditLayoutModal
        isOpen={isEditLayoutModalOpen && layoutToEdit !== null}
        onClose={() => {
          setIsEditLayoutModalOpen(false);
          setLayoutToEdit(null);
        }}
        currentName={layoutToEdit?.name ?? ''}
        onSave={handleEditLayoutSave}
      />
    </div>
  );
}
