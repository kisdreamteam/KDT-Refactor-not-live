import DashboardLayout from '@/components/dashboard/shell/DashboardLayout';
import DashboardViewSwitch from '../../modules/dashboard/DashboardViewSwitch';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardViewSwitch />
    </DashboardLayout>
  );
}
