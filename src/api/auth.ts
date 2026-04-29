import { createClient } from '@/lib/client';

export type ViewPreference = 'seating' | 'students';

export type TeacherProfile = {
  id: string;
  title: string;
  name: string;
  role: string;
  preferred_view?: ViewPreference | null;
};

export async function getSessionUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  return session.user.id;
}

export async function fetchTeacherProfileById(userId: string): Promise<TeacherProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, title, name, role, preferred_view')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    role: data.role || 'teacher',
  };
}

export async function fetchCurrentTeacherProfile(): Promise<TeacherProfile | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }
  return fetchTeacherProfileById(userId);
}

export async function updateTeacherPreferredView(
  userId: string,
  view: ViewPreference
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ preferred_view: view })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}
