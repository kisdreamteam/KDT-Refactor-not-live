'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Student } from '@/lib/types';
import {
  fetchTeacherProfileById,
  getSessionUserId,
  updateTeacherPreferredView,
  type TeacherProfile,
  type ViewPreference,
} from '@/api/auth';
import { fetchAccessibleClassesForUser, type ClassRecord } from '@/api/classes';
import { fetchStudentsByClassId } from '@/api/students';

// Define the shape of the data we're sharing
interface DashboardContextType {
  classes: ClassRecord[];
  currentClass: ClassRecord | null;
  isLoadingClasses: boolean;
  teacherProfile: TeacherProfile | null;
  isLoadingProfile: boolean;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  isLoadingStudents: boolean;
  isLoading: boolean;
  refreshClasses: () => Promise<void>;
  refreshStudents: (force?: boolean) => Promise<void>;
  viewMode: 'active' | 'archived';
  setViewMode: (mode: 'active' | 'archived') => void;
  viewPreference: ViewPreference;
  updateViewPreference: (newView: ViewPreference) => Promise<void>;
  activeSeatingLayoutId: string | null;
  setActiveSeatingLayoutId: (layoutId: string | null) => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Create a custom hook for easy access
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Dashboard-session cache: survives route remounts in the same client session.
let cachedTeacherProfile: TeacherProfile | null = null;
let cachedViewPreference: ViewPreference | null = null;
let teacherProfileFetchPromise: Promise<void> | null = null;
const studentsByClassCache = new Map<string, Student[]>();

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(() => cachedTeacherProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(() => !cachedTeacherProfile);
  const [allClasses, setAllClasses] = useState<ClassRecord[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [viewPreference, setViewPreference] = useState<ViewPreference>(() => cachedViewPreference ?? 'students');
  const [activeSeatingLayoutId, setActiveSeatingLayoutId] = useState<string | null>(null);

  const currentClassId = useMemo(
    () => pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null,
    [pathname]
  );

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
    try {
      setIsLoadingClasses(true);
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
      setIsLoadingClasses(false);
    }
  }, [router]);

  const fetchStudents = useCallback(async (force = false) => {
    if (!currentClassId) {
      setStudents([]);
      setIsLoadingStudents(false);
      return;
    }

    const cached = studentsByClassCache.get(currentClassId);
    if (!force && cached) {
      setStudents(cached);
      setIsLoadingStudents(false);
      return;
    }

    try {
      setIsLoadingStudents(true);
      const next = await fetchStudentsByClassId(currentClassId);
      studentsByClassCache.set(currentClassId, next);
      setStudents(next);
    } catch (err) {
      console.error('Unexpected error fetching students:', err);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [currentClassId]);

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
    void fetchStudents();
  }, [fetchStudents]);

  const classes = useMemo(
    () => allClasses.filter((cls) => (viewMode === 'archived' ? cls.is_archived : !cls.is_archived)),
    [allClasses, viewMode]
  );
  const currentClass = useMemo(
    () => allClasses.find((cls) => cls.id === currentClassId) ?? null,
    [allClasses, currentClassId]
  );

  const value: DashboardContextType = {
    classes,
    currentClass,
    isLoadingClasses,
    teacherProfile,
    isLoadingProfile,
    students,
    setStudents,
    isLoadingStudents,
    isLoading: isLoadingProfile || isLoadingClasses || isLoadingStudents,
    refreshClasses: fetchClasses,
    refreshStudents: fetchStudents,
    viewMode,
    setViewMode,
    viewPreference,
    updateViewPreference,
    activeSeatingLayoutId,
    setActiveSeatingLayoutId,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

