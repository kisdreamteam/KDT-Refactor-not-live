'use client';

import { Suspense } from 'react';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import LeftNav from '@/components/dashboard/navbars/LeftNav';
import SeatingEditorLeftNav from '@/components/dashboard/navbars/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/stage/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore, type ViewState } from '@/stores/useLayoutStore';

type ShellZoneInputs = {
  isSidebarOpen: boolean;
  activeView: ViewState;
  isEditMode: boolean;
};

function getShellZoneConfig({
  isSidebarOpen,
  activeView,
  isEditMode,
}: ShellZoneInputs) {
  const isSeatingChartView = activeView === 'seating_chart';
  return {
    shellGridColsClass: isSidebarOpen
      ? 'grid-cols-[0px_1fr] md:grid-cols-[19rem_1fr]'
      : 'grid-cols-[0px_1fr]',
    useSeatingEditorLeftNav: isSeatingChartView && isEditMode,
  };
}

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentClassId } = useDashboardRouteStateSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const isClassesRootView = !currentClassId;
  const shellZones = getShellZoneConfig({ isSidebarOpen, activeView, isEditMode });

  return (
    <>
      <div
        className={[
          'h-screen w-screen overflow-hidden bg-brand-purple grid transition-all duration-300 ease-in-out',
          shellZones.shellGridColsClass,
        ].join(' ')}
      >
        <aside className="h-full overflow-hidden pl-1">
          <div className="h-full overflow-hidden bg-white max-w-[19rem] ml-1">
            {shellZones.useSeatingEditorLeftNav ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </aside>
        <main className="h-full overflow-hidden pl-1 pr-1 pt-1">
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
      {/* DashboardLayoutShell is the main layout component that handles the sidebar and main content */}
      {/* It uses the getShellZoneConfig function to determine the layout based on the current state */}
      {/* It also uses the useSeatingEditorLeftNav function to determine if the seating editor left nav or normal left nav should be used */}
      <DashboardLayoutShell>
        {children}
      </DashboardLayoutShell>
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
