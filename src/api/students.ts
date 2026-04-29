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

export async function fetchStudentsForRandomByClassId(classId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, points, class_id, student_number, gender, avatar, has_been_picked')
    .eq('class_id', classId)
    .order('last_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as Student[];
}

export async function markStudentAsPicked(studentId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ has_been_picked: true })
    .eq('id', studentId);

  if (error) {
    throw error;
  }
}

export async function resetPickedStudentsByClassId(classId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ has_been_picked: false })
    .eq('class_id', classId);

  if (error) {
    throw error;
  }
}

export async function countStudentsByClassId(classId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);
  if (error) throw error;
  return count || 0;
}

export async function insertStudent(studentData: {
  first_name: string;
  last_name: string;
  class_id: string;
  avatar: string;
  gender?: string | null;
  student_number: number;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('students').insert(studentData);
  if (error) throw error;
}

export async function insertStudentsBulk(studentsData: Array<{
  first_name: string;
  last_name: string;
  class_id: string;
  avatar: string;
  student_number: number;
}>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('students').insert(studentsData);
  if (error) throw error;
}

export async function updateStudentById(
  studentId: string,
  patch: {
    first_name: string;
    last_name: string | null;
    student_number: number | null;
    gender: string | null;
    avatar?: string;
  }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update(patch)
    .eq('id', studentId);
  if (error) throw error;
}

export async function bulkUpdateStudents(
  updates: Array<{
    id: string;
    first_name: string;
    last_name: string | null;
    student_number: number | null;
    gender: string | null;
  }>
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    updates.map(async (student) => {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: student.first_name,
          last_name: student.last_name,
          student_number: student.student_number,
          gender: student.gender,
        })
        .eq('id', student.id);
      if (error) throw error;
    })
  );
}

export async function fetchStudentIdsByClassIdForReset(classId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId);
  if (error) throw error;
  return (data || []).map((s: { id: string }) => s.id);
}

export async function deleteCustomPointEventsByStudentIds(studentIds: string[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('custom_point_events')
    .delete()
    .in('student_id', studentIds);
  if (error) throw error;
}

export async function resetPointsByStudentIds(studentIds: string[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ points: 0 })
    .in('id', studentIds);
  if (error) throw error;
}
