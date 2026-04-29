import { createClient } from '@/lib/client';

export type ClassRecord = {
  id: string;
  name: string;
  grade: string;
  school_year: string;
  teacher_id: string;
  is_archived: boolean;
  created_at: string;
  icon?: string;
  is_owner?: boolean;
};

function isMissingListAccessibleClassesRpc(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    msg.includes('could not find the function') ||
    msg.includes('schema cache')
  );
}

export async function fetchAccessibleClassesForUser(userId: string): Promise<ClassRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('list_accessible_classes');
  let rows: ClassRecord[] = [];

  if (error) {
    if (!isMissingListAccessibleClassesRpc(error)) {
      console.warn('list_accessible_classes failed, falling back:', error.message);
    }
    const { data: ownerRows, error: ownerError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', userId)
      .order('is_archived', { ascending: true })
      .order('created_at', { ascending: false });

    if (ownerError) {
      throw ownerError;
    }

    rows = (ownerRows || []).map((r) => ({ ...r, is_owner: true }));
  } else {
    rows = (data || []) as ClassRecord[];
  }

  return [...rows].sort((a, b) => {
    if (a.is_archived !== b.is_archived) return a.is_archived ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function fetchStudentCountsByClassIds(
  classIds: string[]
): Promise<Record<string, number>> {
  if (classIds.length === 0) return {};

  const supabase = createClient();
  const { data: students, error } = await supabase
    .from('students')
    .select('class_id')
    .in('class_id', classIds);

  if (error) {
    throw error;
  }

  const countsMap: Record<string, number> = {};
  classIds.forEach((classId) => {
    countsMap[classId] = 0;
  });

  students?.forEach((student) => {
    if (student.class_id && countsMap[student.class_id] !== undefined) {
      countsMap[student.class_id]++;
    }
  });

  return countsMap;
}

export async function archiveClass(classId: string, archived: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('classes')
    .update({ is_archived: archived })
    .eq('id', classId);

  if (error) {
    throw error;
  }
}

export async function deleteClassPermanently(classId: string): Promise<void> {
  const supabase = createClient();

  const { error: studentsError } = await supabase
    .from('students')
    .delete()
    .eq('class_id', classId);

  if (studentsError) {
    throw studentsError;
  }

  const { error: classError } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId);

  if (classError) {
    throw classError;
  }
}
