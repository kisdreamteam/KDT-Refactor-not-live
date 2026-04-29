import { useCallback, useEffect, useState } from 'react';
import type { Student } from '@/lib/types';
import {
  emitMultiSelectStateChanged,
  emitRecentlySelectedUpdated,
  emitSelectionCountChanged,
} from '@/lib/events/students';

interface UseStudentsSelectionParams {
  students: Student[];
  onOpenMultiStudentAwardModal: () => void;
}

export function useStudentsSelection({
  students,
  onOpenMultiStudentAwardModal,
}: UseStudentsSelectionParams) {
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
      onOpenMultiStudentAwardModal();
    } else {
      alert('Please select at least one student to award points.');
    }
  }, [isMultiSelectMode, selectedStudentIds, onOpenMultiStudentAwardModal]);

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
