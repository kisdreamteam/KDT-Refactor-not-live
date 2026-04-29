import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import ClassesView from '@/components/features/dashboard/ClassesView';
import StudentsView from '@/components/features/dashboard/StudentsView';

interface DashboardModuleProps {
  view: 'classes' | 'students';
}

export default function DashboardModule({ view }: DashboardModuleProps) {
  return (
    <DashboardLayout>
      {view === 'classes' ? <ClassesView /> : <StudentsView />}
    </DashboardLayout>
  );
}
