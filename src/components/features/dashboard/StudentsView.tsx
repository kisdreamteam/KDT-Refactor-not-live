'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useStudentSort } from '@/context/StudentSortContext';
import { useDashboard } from '@/context/DashboardContext';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import StudentsMainContent from './maincontent/StudentsMainContent';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useDashboardToolbarInset } from '@/hooks/useDashboardToolbarInset';
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
    openDropdownId,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    openAddStudentsModal,
  } = useStudentsModalsState(students);
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
  } = useStudentsSelection({ students });
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
      onAddStudent={openAddStudentsModal}
    />
  );
}
