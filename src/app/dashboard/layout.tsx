import { DashboardClassesSync } from '@/hooks/sync/useDashboardClassesSync';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardClassesSync />
      {children}
    </>
  );
}
