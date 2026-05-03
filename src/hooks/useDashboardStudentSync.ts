'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Student } from '@/lib/types';
import { fetchStudentsByClassId } from '@/api/students';
import { useDashboardStore } from '@/stores/useDashboardStore';

const studentsByClassCache = new Map<string, Student[]>();

export async function refreshDashboardStudents(force = false): Promise<void> {
  const { activeClassId, setStudents, setLoadingStudents } = useDashboardStore.getState();
  if (!activeClassId) {
    setStudents([]);
    setLoadingStudents(false);
    return;
  }

  const cached = studentsByClassCache.get(activeClassId);
  if (!force && cached) {
    setStudents(cached);
    setLoadingStudents(false);
    return;
  }

  try {
    setLoadingStudents(true);
    const next = await fetchStudentsByClassId(activeClassId);
    studentsByClassCache.set(activeClassId, next);
    setStudents(next);
  } catch (err) {
    console.error('Unexpected error fetching students:', err);
    setStudents([]);
  } finally {
    setLoadingStudents(false);
  }
}

/** Mount once under `DashboardProvider` to sync URL → `activeClassId` and load roster into the store. */
export function DashboardStudentSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const id = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
    useDashboardStore.getState().setActiveClassId(id);
  }, [pathname]);

  const activeClassId = useDashboardStore((s) => s.activeClassId);

  useEffect(() => {
    void refreshDashboardStudents(false);
  }, [activeClassId]);

  return null;
}
