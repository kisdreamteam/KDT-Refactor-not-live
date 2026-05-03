import { DashboardClassesSync } from '@/hooks/useDashboardClassesSync';

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
