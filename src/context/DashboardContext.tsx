'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchTeacherProfileById,
  getSessionUserId,
  updateTeacherPreferredView,
  type TeacherProfile,
  type ViewPreference,
} from '@/api/auth';
import { fetchAccessibleClassesForUser, type ClassRecord } from '@/api/classes';
import { useDashboardStore } from '@/stores/useDashboardStore';

interface DashboardContextType {
  isLoadingClasses: boolean;
  teacherProfile: TeacherProfile | null;
  isLoadingProfile: boolean;
  isLoading: boolean;
  refreshClasses: () => Promise<void>;
  viewMode: 'active' | 'archived';
  setViewMode: (mode: 'active' | 'archived') => void;
  viewPreference: ViewPreference;
  updateViewPreference: (newView: ViewPreference) => Promise<void>;
  activeSeatingLayoutId: string | null;
  setActiveSeatingLayoutId: (layoutId: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

let cachedTeacherProfile: TeacherProfile | null = null;
let cachedViewPreference: ViewPreference | null = null;
let teacherProfileFetchPromise: Promise<void> | null = null;

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(() => cachedTeacherProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(() => !cachedTeacherProfile);
  const [allClasses, setAllClasses] = useState<ClassRecord[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [viewPreference, setViewPreference] = useState<ViewPreference>(() => cachedViewPreference ?? 'students');
  const [activeSeatingLayoutId, setActiveSeatingLayoutId] = useState<string | null>(null);

  const isLoadingStudents = useDashboardStore((s) => s.isLoadingStudents);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);

  const fetchTeacherProfile = useCallback(async () => {
    if (cachedTeacherProfile) {
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
      setIsLoadingProfile(false);
      return;
    }

    if (teacherProfileFetchPromise) {
      setIsLoadingProfile(true);
      await teacherProfileFetchPromise;
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    teacherProfileFetchPromise = (async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        router.replace('/login');
        return;
      }

      const profile = await fetchTeacherProfileById(userId);
      if (!profile) {
        console.error('Error fetching teacher profile');
        return;
      }

      const preferredView: ViewPreference =
        profile.preferred_view === 'seating' || profile.preferred_view === 'students'
          ? profile.preferred_view
          : 'students';
      cachedViewPreference = preferredView;
      cachedTeacherProfile = profile;
    })();

    try {
      await teacherProfileFetchPromise;
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
    } finally {
      teacherProfileFetchPromise = null;
      setIsLoadingProfile(false);
    }
  }, [router]);

  const fetchClasses = useCallback(async () => {
    const { setLoadingClasses } = useDashboardStore.getState();
    try {
      setLoadingClasses(true);
      const userId = await getSessionUserId();
      if (!userId) {
        router.replace('/login');
        return;
      }
      const rows = await fetchAccessibleClassesForUser(userId);
      setAllClasses(rows);
    } catch (err) {
      console.error('Unexpected error fetching classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  }, [router]);

  const updateViewPreference = useCallback(async (newView: ViewPreference) => {
    setViewPreference(newView);
    cachedViewPreference = newView;
    try {
      const sessionUserId = await getSessionUserId();
      const userId = sessionUserId ?? teacherProfile?.id;
      if (!userId) {
        return;
      }
      await updateTeacherPreferredView(userId, newView);
    } catch (err) {
      console.error('Unexpected error updating preferred view:', err);
    }
  }, [teacherProfile?.id]);

  useEffect(() => {
    void fetchTeacherProfile();
    void fetchClasses();
  }, [fetchTeacherProfile, fetchClasses]);

  useEffect(() => {
    const filtered = allClasses.filter((cls) =>
      viewMode === 'archived' ? cls.is_archived : !cls.is_archived
    );
    useDashboardStore.getState().setClasses(filtered);
  }, [allClasses, viewMode]);

  const value = useMemo<DashboardContextType>(
    () => ({
      isLoadingClasses,
      teacherProfile,
      isLoadingProfile,
      isLoading: isLoadingProfile || isLoadingClasses || isLoadingStudents,
      refreshClasses: fetchClasses,
      viewMode,
      setViewMode,
      viewPreference,
      updateViewPreference,
      activeSeatingLayoutId,
      setActiveSeatingLayoutId,
    }),
    [
      isLoadingClasses,
      teacherProfile,
      isLoadingProfile,
      isLoadingStudents,
      fetchClasses,
      viewMode,
      viewPreference,
      updateViewPreference,
      activeSeatingLayoutId,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
