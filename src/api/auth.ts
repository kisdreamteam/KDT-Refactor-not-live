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

export async function getSessionUser(): Promise<{ id: string; email?: string } | null> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.user) return null;
  return { id: session.user.id, email: session.user.email };
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

export async function signOutCurrentUser(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function signInWithEmailPassword(email: string, password: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
}

export async function signUpWithEmailPassword(params: {
  email: string;
  password: string;
  redirectTo?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createClient();
  const { email, password, redirectTo, data } = params;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options:
      redirectTo || data
        ? {
            ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
            ...(data ? { data } : {}),
          }
        : undefined,
  });
  if (error) {
    throw error;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
}

export async function verifyRecoveryOtp(email: string, token: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  });
  if (error) {
    throw error;
  }
}

export async function updateCurrentUserPassword(password: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw error;
  }
}
