import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';

export async function fetchStudentsByClassId(classId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select(
      `
        id,
        first_name,
        last_name,
        points,
        avatar,
        student_number,
        gender,
        class_id
      `
    )
    .eq('class_id', classId)
    .eq('is_archived', false)
    .order('last_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as Student[];
}
