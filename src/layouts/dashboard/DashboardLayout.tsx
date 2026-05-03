'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { DashboardStudentSync } from '@/hooks/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/useDashboardClassesFilterSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/useDashboardClassesSync';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import LeftNav from '@/components/features/navbars/LeftNav';
import LeftNavSeatingChartEdit from '@/components/features/navbars/LeftNavSeatingChartEdit';
import DashboardStage, { type DashboardStageProps } from '@/components/features/dashboard/DashboardStage';
import EditClassModal from '@/components/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/features/dashboard/DashboardClassModalsHost';
import { signOutCurrentUser } from '@/api/auth';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { ViewState } from '@/stores/useLayoutStore';

type DashboardStageSlotProps = Omit<
  DashboardStageProps,
  'studentSortBy' | 'onStudentSortChange' | 'onLogoutStudentsNav' | 'onToggleMultiSelect'
>;

function DashboardStageSlot(props: DashboardStageSlotProps) {
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const setSortBy = usePreferenceStore((s) => s.setSortBy);
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
  const viewPreference = usePreferenceStore((s) => s.viewPreference);
  const classes = useDashboardStore((s) => s.classes);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewPreferenceRef = useRef(viewPreference);
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const isSeatingChartView = useLayoutStore((s) => s.activeView === 'seating_chart');
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);

  const currentClassId = pathname ? (pathname.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null) : null;
  const isEditMode = searchParams?.get('mode') === 'edit';

  const currentClass = useMemo(
    () => (currentClassId ? classes.find((c) => c.id === currentClassId) ?? null : null),
    [classes, currentClassId]
  );

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

  useEffect(() => {
    const handleClassUpdate = () => {
      void refreshDashboardClassesForUserAction();
    };
    window.addEventListener('classUpdated', handleClassUpdate);
    return () => window.removeEventListener('classUpdated', handleClassUpdate);
  }, []);

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
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-row bg-brand-purple">
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
              <LeftNav />
            )}
          </div>
        </div>
        <div className="flex-1 h-full overflow-hidden pl-2 pr-2 pt-2">
          <DashboardStageSlot
            showCanvasToolbar={!isClassesRootView}
            isEditMode={isEditMode}
            currentClassName={topNavClassTitle}
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
      {currentClassId && (
        <EditClassModal
          isOpen={isEditClassModalOpen}
          onClose={() => setIsEditClassModalOpen(false)}
          classId={currentClassId}
          onRefresh={refreshDashboardClassesForUserAction}
        />
      )}
      <DashboardClassModalsHost />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardStudentSync />
      <SeatingChartDataSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
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
