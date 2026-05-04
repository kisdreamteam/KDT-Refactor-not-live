'use client';

import { useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { DashboardStudentSync } from '@/hooks/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/useDashboardClassesFilterSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/useDashboardClassesSync';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import LeftNav from '@/components/layout/LeftNav';
import SeatingEditorLeftNav from '@/components/layout/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { ViewState } from '@/stores/useLayoutStore';

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewPreference = usePreferenceStore((s) => s.viewPreference);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewPreferenceRef = useRef(viewPreference);
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const isSeatingChartView = useLayoutStore((s) => s.activeView === 'seating_chart');
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditMode = useLayoutStore((s) => s.setEditMode);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const currentClassId = pathname ? (pathname.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null) : null;
  const searchParamsKey = searchParams?.toString() ?? '';

  useLayoutEffect(() => {
    const onClassRoute = !!pathname?.includes('/dashboard/classes/');
    let next: ViewState = 'classes';
    if (onClassRoute) {
      const view = searchParams?.get('view') || 'grid';
      next = view === 'seating' ? 'seating_chart' : 'students';
    }
    useLayoutStore.getState().setActiveView(next);
    setEditMode(searchParams?.get('mode') === 'edit');
  }, [pathname, searchParamsKey, searchParams, setEditMode]);

  useEffect(() => {
    viewPreferenceRef.current = viewPreference;
  }, [viewPreference]);

  const isClassesRootView = !currentClassId;

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
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </div>
        <div className="flex-1 h-full overflow-hidden pl-2 pr-2 pt-2">
          <DashboardWorkspace showCanvasToolbar={!isClassesRootView}>
            {children}
          </DashboardWorkspace>
        </div>
      </div>
      {currentClassId && (
        <EditClassModal
          isOpen={isEditClassModalOpen}
          onClose={() => setEditClassModalOpen(false)}
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
