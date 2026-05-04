'use client';

import { Student } from '@/lib/types';
import SeatingChartEditorWorkspace from '@/components/dashboard/SeatingChartEditorWorkspace';

interface SeatingChartEditorViewProps {
  classId: string;
  students: Student[];
}

export default function SeatingChartEditorView({ classId, students }: SeatingChartEditorViewProps) {
  return <SeatingChartEditorWorkspace classId={classId} students={students} />;
}
