'use client';

import { useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import {
  fetchSeatingGroupsWithAssignments,
  fetchSeatingLayoutsByClassId,
} from '@/api/seating';
import { STUDENT_EVENTS } from '@/lib/events/students';

export async function refreshSeatingLayoutsForClass(
  classId: string,
  activeSeatingLayoutId: string | null,
  setActiveSeatingLayoutId: (id: string | null) => void
): Promise<void> {
  const st = useSeatingStore.getState();
  st.setLayoutLoading(true);
  st.setLayoutsError(null);
  try {
    const data = await fetchSeatingLayoutsByClassId(classId);
    if (data) {
      st.setLayouts(data);
      if (data.length > 0) {
        const hasActive =
          activeSeatingLayoutId !== null && data.some((layout) => layout.id === activeSeatingLayoutId);
        if (!hasActive) {
          setActiveSeatingLayoutId(data[0].id);
        }
      } else if (activeSeatingLayoutId !== null) {
        setActiveSeatingLayoutId(null);
      }
    } else {
      st.setLayouts([]);
      if (activeSeatingLayoutId !== null) {
        setActiveSeatingLayoutId(null);
      }
    }
  } catch (err) {
    console.error('Unexpected error fetching seating charts:', err);
    st.setLayoutsError('An unexpected error occurred.');
  } finally {
    st.setLayoutLoading(false);
  }
}

export async function refreshSeatingGroupsForLayout(layoutId: string | null): Promise<void> {
  const st = useSeatingStore.getState();
  if (!layoutId) {
    st.setGroups([]);
    st.setGroupAssignmentsById({});
    st.setGroupPositionsById({});
    st.setGroupsLoading(false);
    return;
  }
  st.setGroupsLoading(true);
  try {
    const { groups: groupsData, groupAssignments: nextGroupAssignments } =
      await fetchSeatingGroupsWithAssignments(layoutId);
    st.applyGroupsFetch(groupsData, nextGroupAssignments);
  } catch (err) {
    console.error('Unexpected error fetching seating groups:', err);
    st.setGroupsLoading(false);
  }
}

/** Runs under `DashboardProvider`: keeps seating layout/group data in `useSeatingStore` aligned with class + layout selection. */
export function SeatingChartDataSync() {
  const activeClassId = useDashboardStore((s) => s.activeClassId);
  const rosterLen = useDashboardStore((s) => s.students.length);
  const { activeSeatingLayoutId, setActiveSeatingLayoutId } = useDashboard();
  const prevClassRef = useRef<string | null>(null);
  const layoutSelRef = useRef(activeSeatingLayoutId);
  const setLayoutSelRef = useRef(setActiveSeatingLayoutId);
  layoutSelRef.current = activeSeatingLayoutId;
  setLayoutSelRef.current = setActiveSeatingLayoutId;

  useEffect(() => {
    if (!activeClassId) {
      useSeatingStore.getState().resetForClassSwitch();
      useSeatingStore.getState().setLayouts([]);
      useSeatingStore.getState().setLayoutsError(null);
      useSeatingStore.getState().setLayoutLoading(false);
      prevClassRef.current = null;
      return;
    }
    if (prevClassRef.current !== activeClassId) {
      useSeatingStore.getState().resetForClassSwitch();
      prevClassRef.current = activeClassId;
    }
    void refreshSeatingLayoutsForClass(activeClassId, layoutSelRef.current, setLayoutSelRef.current);
  }, [activeClassId]);

  useEffect(() => {
    if (!activeSeatingLayoutId) {
      useSeatingStore.getState().setGroups([]);
      useSeatingStore.getState().setGroupAssignmentsById({});
      useSeatingStore.getState().setGroupPositionsById({});
      return;
    }
    if (rosterLen === 0) return;
    void refreshSeatingGroupsForLayout(activeSeatingLayoutId);
  }, [activeSeatingLayoutId, rosterLen]);

  useEffect(() => {
    const handleSeatingEditMode = (event: Event) => {
      const detail = (event as CustomEvent<{ isEditMode?: boolean }>).detail;
      if (detail?.isEditMode === false && activeSeatingLayoutId) {
        void refreshSeatingGroupsForLayout(activeSeatingLayoutId);
      }
    };
    window.addEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
    return () => window.removeEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
  }, [activeSeatingLayoutId]);

  return null;
}
