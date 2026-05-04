import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import DashboardViewSwitch from '@/components/dashboard/DashboardViewSwitch';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardViewSwitch />
    </DashboardLayout>
  );
}
