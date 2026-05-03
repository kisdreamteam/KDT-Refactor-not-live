import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import DashboardMainStage from '@/components/features/dashboard/DashboardMainStage';

export default function DashboardModule() {
  return (
    <DashboardLayout>
      <DashboardMainStage />
    </DashboardLayout>
  );
}
