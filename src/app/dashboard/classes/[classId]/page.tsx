import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import DashboardViewSwitch from '@/components/dashboard/DashboardViewSwitch';

export default function ClassRosterPage() {
  return (
    <DashboardLayout>
      <DashboardViewSwitch />
    </DashboardLayout>
  );
}
