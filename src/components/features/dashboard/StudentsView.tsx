'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useStudentSort } from '@/context/StudentSortContext';
import { useDashboard } from '@/context/DashboardContext';
import { normalizeClassIconPath } from '@/lib/iconUtils';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import StudentsMainContent from './maincontent/StudentsMainContent';
import StudentsModals from './maincontent/StudentsModals';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useDashboardToolbarInset } from '@/hooks/useDashboardToolbarInset';
import { useAwardPointsFlow } from '@/hooks/useAwardPointsFlow';
import { useSortedStudents } from './hooks/useSortedStudents';
import { useStudentsModalsState } from './hooks/useStudentsModalsState';
import { useStudentsSelection } from './hooks/useStudentsSelection';
import { useStudentsToolbarEvents } from './hooks/useStudentsToolbarEvents';
import { useStudentsUrlState } from './hooks/useStudentsUrlState';

export default function StudentsView() {
  const params = useParams();
  const classId = (params?.classId as string | undefined) ?? '';
  const { sortBy } = useStudentSort();
  const { classes, students, setStudents, isLoadingStudents, refreshStudents } = useDashboard();

  const { currentView, isEditModeFromURL, isSeatingEditMode } = useStudentsUrlState({
    classId,
    refreshStudents,
  });
  const error: string | null = null;
  const {
    isAddStudentModalOpen,
    setAddStudentModalOpen,
    openDropdownId,
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
    closeAddStudentsModal,
    closeWholeClassModal,
    closeMultiStudentAwardModal,
  } = useStudentsModalsState(students);
  const {
    awardInfo,
    isConfirmationModalOpen,
    openAwardConfirmation,
    closeAwardConfirmation,
  } = useAwardPointsFlow();
  const {
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
  } = useStudentsSelection({
    students,
    onOpenMultiStudentAwardModal: () => setIsMultiStudentAwardModalOpen(true),
  });
  const currentClass = useMemo(() => classes.find((c) => c.id === classId) ?? null, [classes, classId]);
  const classIcon = currentClass?.icon || null;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdownId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-dropdown-container]')) {
        return;
      }
      if (target.closest('[data-student-card]')) {
        setTimeout(() => closeDropdown(), 0);
        return;
      }
      closeDropdown();
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [openDropdownId, closeDropdown]);

  // Handle points awarded callback
  const handlePointsAwarded = (info: {
    studentAvatar: string;
    studentFirstName: string;
    points: number;
    categoryName: string;
    categoryIcon?: string;
  }) => {
    openAwardConfirmation(info);
  };

  const handleStudentAdded = async () => {
    await refreshStudents(true);
  };

  const { sortedStudents, totalClassPoints } = useSortedStudents(students, sortBy);

  const toolbarInset = useDashboardToolbarInset();
  const {
    isPointLogOpen,
    setIsPointLogOpen,
    isPointLogLoading,
    pointLogError,
    setLogPage,
    rowsPerPage,
    setRowsPerPage,
    logTotalCount,
    totalPages,
    safeLogPage,
    pagedPointLogRows,
  } = useClassPointLog(classId, students);

  useStudentsToolbarEvents({
    classId,
    currentView,
    onToggleMultiSelect: toggleMultiSelect,
    onSelectAll: selectAll,
    onSelectNone: selectNone,
    onRecentlySelect: recentlySelect,
    onAwardPoints: awardPoints,
    onInverseSelect: inverseSelect,
    setIsPointLogOpen,
  });

  if (isLoadingStudents) {
    return <LoadingState message="Loading students..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void refreshStudents()} />;
  }

  return (
    <>
      <StudentsMainContent
        classId={classId}
        currentView={currentView}
        isSeatingEditMode={isSeatingEditMode}
        isEditModeFromURL={isEditModeFromURL}
        students={students}
        setStudents={setStudents}
        sortedStudents={sortedStudents}
        isMultiSelectMode={isMultiSelectMode}
        selectedStudentIds={selectedStudentIds}
        classIcon={classIcon}
        totalClassPoints={totalClassPoints}
        openDropdownId={openDropdownId}
        isPointLogOpen={isPointLogOpen}
        isPointLogLoading={isPointLogLoading}
        pointLogError={pointLogError}
        logTotalCount={logTotalCount}
        pagedPointLogRows={pagedPointLogRows}
        safeLogPage={safeLogPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        toolbarTopPx={toolbarInset.top}
        toolbarBottomPx={toolbarInset.bottom}
        setLogPage={setLogPage}
        setRowsPerPage={setRowsPerPage}
        onSelectStudent={handleSelectStudent}
        onToggleDropdown={toggleDropdown}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
        onStudentClick={handleStudentClick}
        onWholeClassClick={handleWholeClassClick}
        onAddStudent={() => setAddStudentModalOpen(true)}
      />

      <StudentsModals
        classId={classId}
        className={currentClass?.name || ''}
        classIcon={classIcon ? normalizeClassIconPath(classIcon) : ''}
        students={students}
        selectedStudent={selectedStudent}
        editingStudent={editingStudent}
        selectedStudentIds={selectedStudentIds}
        awardInfo={awardInfo}
        isAddStudentModalOpen={isAddStudentModalOpen}
        isPointsModalOpen={isPointsModalOpen}
        isWholeClassModalOpen={isWholeClassModalOpen}
        isEditStudentModalOpen={isEditStudentModalOpen}
        isMultiStudentAwardModalOpen={isMultiStudentAwardModalOpen}
        isConfirmationModalOpen={isConfirmationModalOpen}
        onStudentAdded={() => void handleStudentAdded()}
        onCloseAddStudentsModal={closeAddStudentsModal}
        onClosePointsModal={closePointsModal}
        onCloseWholeClassModal={closeWholeClassModal}
        onCloseEditStudentModal={closeEditStudentModal}
        onCloseMultiStudentAwardModal={closeMultiStudentAwardModal}
        onCloseConfirmationModal={() => {
          closeAwardConfirmation();
        }}
        onAwardComplete={handleAwardComplete}
        onPointsAwarded={handlePointsAwarded}
      />
    </>
  );
}

