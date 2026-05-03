import { useCallback, useState } from 'react';
import type { Student } from '@/lib/types';
import { useModalStore } from '@/stores/useModalStore';

export function useStudentsModalsState(students: Student[]) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = useCallback((studentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId((prev) => (prev === studentId ? null : studentId));
  }, []);

  const closeDropdown = useCallback(() => setOpenDropdownId(null), []);

  const handleEditStudent = useCallback(
    (studentId: string) => {
      const studentToEdit = students.find((s) => s.id === studentId);
      if (studentToEdit) {
        useModalStore.getState().openModal('edit_student', { studentId });
      }
      setOpenDropdownId(null);
    },
    [students]
  );

  const handleDeleteStudent = useCallback(async (_studentId: string, _studentName: string) => {
    setOpenDropdownId(null);
  }, []);

  const handleStudentClick = useCallback((student: Student) => {
    useModalStore.getState().openModal('award_points_single', { studentId: student.id });
  }, []);

  const handleWholeClassClick = useCallback(() => {
    useModalStore.getState().openModal('award_points_whole_class', {});
  }, []);

  const openAddStudentsModal = useCallback(() => {
    useModalStore.getState().openModal('add_students', {});
  }, []);

  return {
    openDropdownId,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    openAddStudentsModal,
  };
}
