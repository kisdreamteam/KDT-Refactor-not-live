import { useCallback, useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { useDashboardStore } from '@/stores/useDashboardStore';

export function useStudentsModalsState() {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = useCallback((studentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId((prev) => (prev === studentId ? null : studentId));
  }, []);

  const closeDropdown = useCallback(() => setOpenDropdownId(null), []);

  const handleEditStudent = useCallback((studentId: string) => {
    const studentToEdit = useDashboardStore.getState().students.find((s) => s.id === studentId);
    if (studentToEdit) {
      useModalStore.getState().openModal('edit_student', { studentId });
    }
    setOpenDropdownId(null);
  }, []);

  const handleDeleteStudent = useCallback(async (_studentId: string, _studentName: string) => {
    setOpenDropdownId(null);
  }, []);

  const handleStudentClick = useCallback((studentId: string) => {
    useModalStore.getState().openModal('award_points_single', { studentId });
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
