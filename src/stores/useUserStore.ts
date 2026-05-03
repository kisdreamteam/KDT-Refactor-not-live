import { create } from 'zustand';
import type { TeacherProfile } from '@/api/auth';

interface UserStore {
  teacherProfile: TeacherProfile | null;
  isLoadingProfile: boolean;
  setTeacherProfile: (profile: TeacherProfile | null) => void;
  setLoadingProfile: (v: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  teacherProfile: null,
  isLoadingProfile: true,
  setTeacherProfile: (teacherProfile) => set({ teacherProfile }),
  setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
}));
