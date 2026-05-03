import { create } from 'zustand';
import type { ClassRecord } from '@/api/classes';
import type { Student } from '@/lib/types';

export type DashboardSetStudents = Student[] | ((prev: Student[]) => Student[]);

interface DashboardStore {
  activeClassId: string | null;
  classes: ClassRecord[];
  students: Student[];
  isLoadingStudents: boolean;
  isLoadingClasses: boolean;
  setActiveClassId: (id: string | null) => void;
  setClasses: (classes: ClassRecord[]) => void;
  setStudents: (next: DashboardSetStudents) => void;
  setLoadingStudents: (v: boolean) => void;
  setLoadingClasses: (v: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeClassId: null,
  classes: [],
  students: [],
  isLoadingStudents: false,
  isLoadingClasses: true,
  setActiveClassId: (id) => set({ activeClassId: id }),
  setClasses: (data) => set({ classes: data }),
  setStudents: (next) =>
    set((state) => ({
      students: typeof next === 'function' ? (next as (prev: Student[]) => Student[])(state.students) : next,
    })),
  setLoadingStudents: (v) => set({ isLoadingStudents: v }),
  setLoadingClasses: (v) => set({ isLoadingClasses: v }),
}));
