import { useCallback, useEffect, useState } from 'react';
import type { Student } from '@/lib/types';
import {
  STUDENT_EVENTS,
  emitMultiSelectStateChanged,
  emitRecentlySelectedUpdated,
  emitSelectionCountChanged,
} from '@/lib/events/students';
import { useModalStore } from '@/stores/useModalStore';

interface UseStudentsSelectionParams {
  students: Student[];
}

export function useStudentsSelection({ students }: UseStudentsSelectionParams) {
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const toggleMultiSelect = useCallback(() => {
    setIsMultiSelectMode((prev) => {
      const newState = !prev;
      emitMultiSelectStateChanged({ isMultiSelect: newState });
      if (newState === false) {
        setSelectedStudentIds([]);
        emitSelectionCountChanged({ count: 0 });
      } else {
        emitSelectionCountChanged({ count: 0 });
      }
      return newState;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (isMultiSelectMode) {
      const allIds = students.map((s) => s.id);
      setSelectedStudentIds(allIds);
      emitSelectionCountChanged({ count: allIds.length });
    }
  }, [isMultiSelectMode, students]);

  const selectNone = useCallback(() => {
    if (isMultiSelectMode) {
      setSelectedStudentIds([]);
      emitSelectionCountChanged({ count: 0 });
    }
  }, [isMultiSelectMode]);

  const recentlySelect = useCallback(() => {
    if (isMultiSelectMode) {
      const lastSelected = localStorage.getItem('lastSelectedStudents');
      if (lastSelected) {
        try {
          const ids = JSON.parse(lastSelected) as string[];
          setSelectedStudentIds(ids);
          emitSelectionCountChanged({ count: ids.length });
        } catch (e) {
          console.error('Error parsing last selected students:', e);
        }
      }
    }
  }, [isMultiSelectMode]);

  const awardPoints = useCallback(() => {
    if (isMultiSelectMode && selectedStudentIds.length > 0) {
      useModalStore.getState().openModal('award_points_multi', {
        studentIds: [...selectedStudentIds],
      });
    } else {
      alert('Please select at least one student to award points.');
    }
  }, [isMultiSelectMode, selectedStudentIds]);

  const inverseSelect = useCallback(() => {
    if (isMultiSelectMode) {
      const allStudentIds = students.map((s) => s.id);
      const newSelectedIds = allStudentIds.filter((id) => !selectedStudentIds.includes(id));
      setSelectedStudentIds(newSelectedIds);
      emitSelectionCountChanged({ count: newSelectedIds.length });
    }
  }, [isMultiSelectMode, students, selectedStudentIds]);

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) => {
      const newSelection = prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId];
      emitSelectionCountChanged({ count: newSelection.length });
      return newSelection;
    });
  }, []);

  const handleAwardComplete = useCallback((selectedIds: string[], type: 'classes' | 'students') => {
    if (type === 'students') {
      localStorage.setItem('lastSelectedStudents', JSON.stringify(selectedIds));
      emitRecentlySelectedUpdated();
      setSelectedStudentIds([]);
      emitSelectionCountChanged({ count: 0 });
    }
  }, []);

  useEffect(() => {
    const onMultiComplete = (e: Event) => {
      const detail = (e as CustomEvent<{ studentIds: string[] }>).detail;
      if (detail?.studentIds) {
        handleAwardComplete(detail.studentIds, 'students');
      }
    };
    window.addEventListener(STUDENT_EVENTS.MULTI_STUDENT_AWARD_COMPLETE, onMultiComplete);
    return () =>
      window.removeEventListener(STUDENT_EVENTS.MULTI_STUDENT_AWARD_COMPLETE, onMultiComplete);
  }, [handleAwardComplete]);

  useEffect(() => {
    if (isMultiSelectMode) {
      emitSelectionCountChanged({ count: selectedStudentIds.length });
    }
  }, [selectedStudentIds, isMultiSelectMode]);

  return {
    isMultiSelectMode,
    selectedStudentIds,
    toggleMultiSelect,
    selectAll,
    selectNone,
    recentlySelect,
    awardPoints,
    inverseSelect,
    handleSelectStudent,
    handleAwardComplete,
  };
}
