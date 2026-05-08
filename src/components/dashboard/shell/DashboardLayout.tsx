'use client';

import { Suspense } from 'react';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import LeftNav from '@/components/dashboard/shell/LeftNav';
import SeatingEditorLeftNav from '@/components/dashboard/shell/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/stage/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore } from '@/stores/useLayoutStore';

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentClassId } = useDashboardRouteStateSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const isSeatingChartView = useLayoutStore((s) => s.activeView === 'seating_chart');
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const isClassesRootView = !currentClassId;

  return (
    <>
      <div
        className={[
          'h-screen w-screen overflow-hidden bg-brand-purple grid transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'grid-cols-[19rem_1fr]' : 'grid-cols-[0px_1fr]',
        ].join(' ')}
      >
        <aside className="h-full overflow-hidden">
          <div className="h-full overflow-hidden bg-white max-w-[19rem]">
            {isSeatingChartView && isEditMode ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </aside>
        <main className="h-full overflow-hidden pl-2 pr-2 pt-2">
          <DashboardWorkspace showCanvasToolbar={!isClassesRootView}>
            {children}
          </DashboardWorkspace>
        </main>
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
