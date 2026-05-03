'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Student } from '@/lib/types';
import type { PointLogRow } from '@/hooks/useClassPointLog';
import EmptyState from '@/components/ui/EmptyState';
import ClassPointLogSlidePanel from '@/components/ui/ClassPointLogSlidePanel';
import SeatingChartView from '@/components/features/dashboard/SeatingChartView';
import SeatingChartEditorView from '@/components/features/dashboard/SeatingChartEditorView';
import StudentCardsGrid from '@/components/features/dashboard/maincontent/viewStudentsGrid/StudentCardsGrid';
import { useDashboardStore } from '@/stores/useDashboardStore';

interface StudentsMainContentProps {
  classId: string;
  currentView: string;
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
  setStudents: Dispatch<SetStateAction<Student[]>>;
  orderedStudentIds: string[];
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  classIcon: string | null;
  totalClassPoints: number;
  openDropdownId: string | null;
  isPointLogOpen: boolean;
  isPointLogLoading: boolean;
  pointLogError: string | null;
  logTotalCount: number;
  pagedPointLogRows: PointLogRow[];
  safeLogPage: number;
  totalPages: number;
  rowsPerPage: number;
  toolbarTopPx: number;
  toolbarBottomPx: number;
  setLogPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  onSelectStudent: (studentId: string) => void;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEditStudent: (studentId: string) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  onWholeClassClick: () => void;
  onAddStudent: () => void;
}

function SeatingStudentsBranch({
  classId,
  isSeatingEditMode,
  isEditModeFromURL,
  setStudents,
  isMultiSelectMode,
  selectedStudentIds,
  onSelectStudent,
}: {
  classId: string;
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
  setStudents: Dispatch<SetStateAction<Student[]>>;
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
}) {
  const students = useDashboardStore((s) => s.students);
  if (isSeatingEditMode || isEditModeFromURL) {
    return <SeatingChartEditorView classId={classId} students={students} />;
  }
  return (
    <SeatingChartView
      classId={classId}
      students={students}
      setStudents={setStudents}
      isMultiSelectMode={isMultiSelectMode}
      selectedStudentIds={selectedStudentIds}
      onSelectStudent={onSelectStudent}
    />
  );
}

export default function StudentsMainContent({
  classId,
  currentView,
  isSeatingEditMode,
  isEditModeFromURL,
  setStudents,
  orderedStudentIds,
  isMultiSelectMode,
  selectedStudentIds,
  classIcon,
  totalClassPoints,
  openDropdownId,
  isPointLogOpen,
  isPointLogLoading,
  pointLogError,
  logTotalCount,
  pagedPointLogRows,
  safeLogPage,
  totalPages,
  rowsPerPage,
  toolbarTopPx,
  toolbarBottomPx,
  setLogPage,
  setRowsPerPage,
  onSelectStudent,
  onToggleDropdown,
  onEditStudent,
  onDeleteStudent,
  onStudentClick,
  onWholeClassClick,
  onAddStudent,
}: StudentsMainContentProps) {
  return (
    <div className={currentView === 'seating' ? 'h-full min-h-0 w-full' : ''}>
      <div
        className={
          currentView === 'grid'
            ? 'max-w-10xl mx-auto text-white-500 pr-[5.75rem] sm:pr-24'
            : 'h-full min-h-0 w-full text-white-500'
        }
      >
        {currentView === 'seating' ? (
          <SeatingStudentsBranch
            classId={classId}
            isSeatingEditMode={isSeatingEditMode}
            isEditModeFromURL={isEditModeFromURL}
            setStudents={setStudents}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudentIds={selectedStudentIds}
            onSelectStudent={onSelectStudent}
          />
        ) : (
          <>
            <ClassPointLogSlidePanel
              isOpen={isPointLogOpen}
              position="fixed"
              rightPx={72}
              topPx={toolbarTopPx}
              bottomPx={toolbarBottomPx}
              zIndex={35}
              logTotalCount={logTotalCount}
              pointLogError={pointLogError}
              isPointLogLoading={isPointLogLoading}
              pagedRows={pagedPointLogRows}
              safeLogPage={safeLogPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              setLogPage={setLogPage}
              setRowsPerPage={setRowsPerPage}
            />

            {orderedStudentIds.length === 0 ? (
              <EmptyState
                title="No students yet"
                message="Students will appear here once they are added to this class."
                buttonText="Add Your First Student"
                onAddClick={onAddStudent}
              />
            ) : (
              <StudentCardsGrid
                orderedStudentIds={orderedStudentIds}
                isMultiSelectMode={isMultiSelectMode}
                selectedStudentIds={selectedStudentIds}
                classIcon={classIcon}
                totalClassPoints={totalClassPoints}
                openDropdownId={openDropdownId}
                onWholeClassClick={onWholeClassClick}
                onSelectStudent={onSelectStudent}
                onToggleDropdown={onToggleDropdown}
                onEditStudent={onEditStudent}
                onDeleteStudent={onDeleteStudent}
                onStudentClick={onStudentClick}
                onAddStudent={onAddStudent}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
