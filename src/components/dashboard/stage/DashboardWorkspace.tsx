'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import TopNav from '@/components/dashboard/navbars/TopNav';
import StudentsBottomNav from '@/components/dashboard/navbars/StudentsBottomNav';
import MultiSelectBottomNav from '@/components/dashboard/navbars/MultiSelectBottomNav';
import SeatingEditorBottomNavBridge from '@/components/dashboard/navbars/SeatingEditorBottomNavBridge';
import Timer from '@/components/dashboard/tools/Timer';
import Random from '@/components/dashboard/tools/Random';
import DashboardCanvasToolbar from '@/components/dashboard/stage/DashboardCanvasToolbar';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { useDashboardSessionActions } from '@/hooks/useDashboardSessionActions';
import { useViewPreferenceSync } from '@/hooks/sync/useViewPreferenceSync';
import {
  getWorkspaceZoneConfig,
  type DashboardToolbarDef,
} from '@/components/dashboard/shell/dashboardZoneConfig';

interface DashboardWorkspaceProps {
  children: React.ReactNode;
  showCanvasToolbar?: boolean;
}

export default function DashboardWorkspace({
  children,
  showCanvasToolbar = true,
}: DashboardWorkspaceProps) {
  const pathname = usePathname();
  const classes = useDashboardStore((s) => s.classes);
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const setSortBy = usePreferenceStore((s) => s.setSortBy);
  const { onLogoutStudentsNav } = useDashboardSessionActions();
  const { handleViewChange } = useViewPreferenceSync();
  const activeView = useLayoutStore((s) => s.activeView);
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const isRandomOpen = useLayoutStore((s) => s.isRandomOpen);
  const seatingLayoutsCount = useSeatingStore((s) => s.layouts.length);
  const setTimerOpen = useLayoutStore((s) => s.setTimerOpen);
  const setRandomOpen = useLayoutStore((s) => s.setRandomOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const currentClass = useMemo(
    () => (classId ? classes.find((c) => c.id === classId) ?? null : null),
    [classes, classId]
  );
  const currentClassName = classId ? (currentClass?.name ?? 'Loading...') : null;
  const suppressTeacherFallback = !!classId;
  const zoneConfig = getWorkspaceZoneConfig({
    activeView,
    isEditMode,
    isTimerOpen,
    isRandomOpen,
    currentClassName,
    seatingLayoutsCount,
  });

  const onToggleMultiSelect = useCallback(() => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.TOGGLE_MULTI_SELECT));
  }, []);

  const onEditClass = useCallback(() => {
    setEditClassModalOpen(true);
  }, [setEditClassModalOpen]);

  const onTimerClick = useCallback(() => {
    setTimerOpen(true);
  }, [setTimerOpen]);

  const onRandomClick = useCallback(() => {
    setRandomOpen(true);
  }, [setRandomOpen]);

  const toolbarConfig: DashboardToolbarDef = {
    className: zoneConfig.toolbarConfig.className,
    topActions: zoneConfig.toolbarConfig.topActions,
    bottomActions: zoneConfig.toolbarConfig.bottomActions,
  };

  return (
    <div
      className={[
        'grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2',
        currentClassName ? 'bg-brand-purple' : 'bg-brand-cream',
      ].join(' ')}
    >
      {zoneConfig.showTopNav && (
        <header className="row-start-1 row-end-2 h-auto overflow-hidden">
          <TopNav currentClassName={currentClassName} suppressTeacherFallback={suppressTeacherFallback} />
        </header>
      )}

      <section
        className={['row-start-2 row-end-3 relative w-full h-full min-h-0 overflow-hidden', zoneConfig.stageContentPadding].join(' ')}
      >
        <div className="grid h-full min-h-0 grid-cols-[1fr_auto]">
          <div className="relative w-full h-full min-h-0 overflow-hidden">
            {isTimerOpen ? (
              <Timer onClose={() => setTimerOpen(false)} />
            ) : isRandomOpen ? (
              <Random onClose={() => setRandomOpen(false)} />
            ) : (
              <div className="relative w-full h-full min-h-0 overflow-hidden">
                {children}
              </div>
            )}
          </div>

          {showCanvasToolbar && <DashboardCanvasToolbar toolbarConfig={toolbarConfig} />}
        </div>
      </section>

      {zoneConfig.showBottomNav && (
        <footer className="row-start-3 row-end-4 flex min-h-16 h-auto w-full flex-col overflow-visible relative z-20">
          {zoneConfig.isSeatingView && isEditMode ? (
            <SeatingEditorBottomNavBridge
              currentClassName={currentClassName}
              classId={classId}
              onEditClass={onEditClass}
            />
          ) : isMultiSelectMode ? (
            <MultiSelectBottomNav />
          ) : (
            <StudentsBottomNav
              currentClassName={currentClassName}
              currentView={zoneConfig.isSeatingView ? 'seating' : 'grid'}
              onViewChange={(view) => void handleViewChange(view)}
              onTimerClick={onTimerClick}
              onRandomClick={onRandomClick}
              sortingDisabled={zoneConfig.isSeatingView}
              classId={classId}
              onEditClass={onEditClass}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onLogout={onLogoutStudentsNav}
              onToggleMultiSelect={onToggleMultiSelect}
            />
          )}
        </footer>
      )}
    </div>
  );
}
