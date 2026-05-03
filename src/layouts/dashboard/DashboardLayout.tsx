'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { StudentSortProvider, useStudentSort } from '@/context/StudentSortContext';
import { SeatingChartProvider } from '@/context/SeatingChartContext';
import { SeatingLayoutNavProvider, SeatingLayoutNavData } from '@/context/SeatingLayoutNavContext';
import LeftNav from '@/components/features/navbars/LeftNav';
import LeftNavSeatingChartEdit from '@/components/features/navbars/LeftNavSeatingChartEdit';
import DashboardStage, { type DashboardStageProps } from '@/components/features/dashboard/DashboardStage';
import EditClassModal from '@/components/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/features/dashboard/DashboardClassModalsHost';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { signOutCurrentUser } from '@/api/auth';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { ViewState } from '@/stores/useLayoutStore';

type DashboardStageSlotProps = Omit<
  DashboardStageProps,
  'studentSortBy' | 'onStudentSortChange' | 'onLogoutStudentsNav' | 'onToggleMultiSelect'
>;

function DashboardStageSlot(props: DashboardStageSlotProps) {
  const { sortBy, setSortBy } = useStudentSort();
  const router = useRouter();

  const onLogoutStudentsNav = useCallback(async () => {
    try {
      await signOutCurrentUser();
      router.push('/login');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  }, [router]);

  const onToggleMultiSelect = useCallback(() => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.TOGGLE_MULTI_SELECT));
  }, []);

  return (
    <DashboardStage
      {...props}
      studentSortBy={sortBy}
      onStudentSortChange={setSortBy}
      onLogoutStudentsNav={onLogoutStudentsNav}
      onToggleMultiSelect={onToggleMultiSelect}
    />
  );
}

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    classes,
    currentClass,
    isLoadingClasses,
    teacherProfile,
    isLoadingProfile,
    refreshClasses,
    viewMode,
    setViewMode,
    viewPreference,
  } = useDashboard();
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [seatingLayoutData, setSeatingLayoutData] = useState<SeatingLayoutNavData | null>(null);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewPreferenceRef = useRef<'seating' | 'students'>(viewPreference);
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const isSeatingChartView = useLayoutStore((s) => s.activeView === 'seating_chart');

  const currentClassId = pathname ? (pathname.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null) : null;
  const isEditMode = searchParams?.get('mode') === 'edit';

  const searchParamsKey = searchParams?.toString() ?? '';

  useLayoutEffect(() => {
    const onClassRoute = !!pathname?.includes('/dashboard/classes/');
    let next: ViewState = 'classes';
    if (onClassRoute) {
      const view = searchParams?.get('view') || 'grid';
      next = view === 'seating' ? 'seating_chart' : 'students';
    }
    useLayoutStore.getState().setActiveView(next);
  }, [pathname, searchParamsKey]);

  useEffect(() => {
    viewPreferenceRef.current = viewPreference;
  }, [viewPreference]);

  const currentClassName = currentClass?.name ?? null;
  const isClassRoute = !!currentClassId;
  const isClassesRootView = !isClassRoute;
  const topNavClassTitle = isClassRoute ? (currentClassName ?? 'Loading...') : currentClassName;

  // Listen for multi-select state changes
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      setTimeout(() => {
        setIsMultiSelectMode(event.detail.isMultiSelect);
      }, 0);
    };

    window.addEventListener(STUDENT_EVENTS.MULTI_SELECT_STATE_CHANGED, handleStateChange as EventListener);
    return () => {
      window.removeEventListener(STUDENT_EVENTS.MULTI_SELECT_STATE_CHANGED, handleStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleClassUpdate = () => {
      void refreshClasses();
    };
    window.addEventListener('classUpdated', handleClassUpdate);
    return () => window.removeEventListener('classUpdated', handleClassUpdate);
  }, [refreshClasses]);

  // Fallback only on mount/path change: if class route URL has no explicit view, seed it from persisted preference.
  useEffect(() => {
    const inClassRoute = !!pathname?.includes('/dashboard/classes/');
    const params = new URLSearchParams(window.location.search);
    const hasView = params.has('view');
    if (!inClassRoute) return;
    if (hasView) return;

    if (viewPreferenceRef.current === 'seating') {
      params.set('view', 'seating');
    } else {
      params.delete('view');
      params.delete('mode');
    }

    const base = pathname ?? '/';
    const currentSearch = window.location.search;
    const currentUrl = currentSearch ? `${base}${currentSearch}` : base;
    const newUrl = params.toString() ? `${base}?${params.toString()}` : base;
    if (newUrl === currentUrl) {
      return;
    }
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  return (
    <SeatingChartProvider>
      <StudentSortProvider>
        <SeatingLayoutNavProvider setSeatingLayoutData={setSeatingLayoutData}>
          <div className="h-screen w-screen overflow-hidden flex flex-row bg-brand-purple" >
            <div
              className={[
                'h-full flex-shrink-0 overflow-hidden transition-[width,padding] duration-200 ease-out',
                isSidebarOpen ? 'w-76 pl-2' : 'w-0 pl-0',
              ].join(' ')}
            >
              <div className="h-full overflow-hidden bg-white w-76 max-w-[19rem]">
                {isSeatingChartView && isEditMode ? (
                  <LeftNavSeatingChartEdit />
                ) : (
                  <LeftNav
                    classes={classes}
                    isLoadingClasses={isLoadingClasses}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    seatingLayoutData={isSeatingChartView && !isEditMode ? seatingLayoutData : null}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 h-full overflow-hidden pl-2 pr-2 pt-2">
              <DashboardStageSlot
                showCanvasToolbar={!isClassesRootView}
                isEditMode={isEditMode}
                isLoadingProfile={isLoadingProfile}
                currentClassName={topNavClassTitle}
                teacherProfile={teacherProfile}
                suppressTeacherFallback={isClassRoute}
                isTimerOpen={isTimerOpen}
                isRandomOpen={isRandomOpen}
                onCloseTimer={() => setIsTimerOpen(false)}
                onCloseRandom={() => setIsRandomOpen(false)}
                isMultiSelectMode={isMultiSelectMode}
                classId={currentClassId}
                onEditClass={() => setIsEditClassModalOpen(true)}
                onTimerClick={() => setIsTimerOpen(true)}
                onRandomClick={() => setIsRandomOpen(true)}
              >
                {children}
              </DashboardStageSlot>
            </div>
          </div>
        </SeatingLayoutNavProvider>
      </StudentSortProvider>
      {currentClassId && (
        <EditClassModal
          isOpen={isEditClassModalOpen}
          onClose={() => setIsEditClassModalOpen(false)}
          classId={currentClassId}
          onRefresh={refreshClasses}
        />
      )}
      <DashboardClassModalsHost />
    </SeatingChartProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardProvider>
        <DashboardLayoutShell>{children}</DashboardLayoutShell>
      </DashboardProvider>
    </Suspense>
  );
}

function DashboardLayoutFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-brand-purple">
      <div className="text-white">Loading...</div>
    </div>
  );
}
