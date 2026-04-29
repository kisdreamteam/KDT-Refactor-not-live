import { useCallback, useState } from 'react';
import type { Student } from '@/lib/types';

export function useStudentsModalsState(students: Student[]) {
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isPointsModalOpen, setPointsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isWholeClassModalOpen, setIsWholeClassModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isMultiStudentAwardModalOpen, setIsMultiStudentAwardModalOpen] = useState(false);

  const toggleDropdown = useCallback((studentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === studentId ? null : studentId);
  }, [openDropdownId]);

  const closeDropdown = useCallback(() => setOpenDropdownId(null), []);

  const handleEditStudent = useCallback((studentId: string) => {
    const studentToEdit = students.find((s) => s.id === studentId);
    if (studentToEdit) {
      setEditingStudent(studentToEdit);
      setIsEditStudentModalOpen(true);
    }
    setOpenDropdownId(null);
  }, [students]);

  const handleDeleteStudent = useCallback(async (studentId: string, studentName: string) => {
    void studentId;
    void studentName;
    setOpenDropdownId(null);
  }, []);

  const handleStudentClick = useCallback((student: Student) => {
    setSelectedStudent(student);
    setPointsModalOpen(true);
  }, []);

  const handleWholeClassClick = useCallback(() => {
    setIsWholeClassModalOpen(true);
  }, []);

  const closePointsModal = useCallback(() => {
    setPointsModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const closeEditStudentModal = useCallback(() => {
    setIsEditStudentModalOpen(false);
    setEditingStudent(null);
  }, []);

  return {
    isAddStudentModalOpen,
    setAddStudentModalOpen,
    openDropdownId,
    setOpenDropdownId,
    isPointsModalOpen,
    selectedStudent,
    isWholeClassModalOpen,
    isEditStudentModalOpen,
    editingStudent,
    isMultiStudentAwardModalOpen,
    setIsMultiStudentAwardModalOpen,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    closePointsModal,
    closeEditStudentModal,
    closeAddStudentsModal: () => setAddStudentModalOpen(false),
    closeWholeClassModal: () => setIsWholeClassModalOpen(false),
    closeMultiStudentAwardModal: () => setIsMultiStudentAwardModalOpen(false),
  };
}
