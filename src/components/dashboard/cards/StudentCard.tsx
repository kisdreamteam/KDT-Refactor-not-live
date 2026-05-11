'use client';

import { useShallow } from 'zustand/react/shallow';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import BaseCard from '@/components/ui/BaseCard';
import StudentCardActionsMenu from '@/components/dashboard/menus/StudentCardActionsMenu';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useLayoutStore } from '@/stores/useLayoutStore';

interface StudentCardProps {
  studentId: string;
  openDropdownId: string | null;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  isSelected?: boolean;
  onSelectStudent?: (studentId: string) => void;
}

export default function StudentCard({
  studentId,
  openDropdownId,
  onToggleDropdown,
  onEdit,
  onDelete,
  onStudentClick,
  isSelected = false,
  onSelectStudent,
}: StudentCardProps) {
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const student = useDashboardStore(
    useShallow((s) => s.students.find((x) => x.id === studentId) ?? null)
  );

  if (!student) {
    return null;
  }

  const handleCardClick = () => {
    if (isMultiSelectMode && onSelectStudent) {
      onSelectStudent(student.id);
      return;
    }
    onStudentClick(student.id);
  };

  const cardClassName =
    isMultiSelectMode && isSelected
      ? 'z-[1] overflow-hidden hover:shadow-md'
      : 'z-[1] overflow-hidden hover:shadow-md hover:!bg-blue-100';

  return (
    <BaseCard
      data-student-card={student.id}
      className={cardClassName}
      variant="default"
      contentLayout="space-between"
      isSelected={isMultiSelectMode ? isSelected : false}
      aria-pressed={isMultiSelectMode ? isSelected : undefined}
      title={student.first_name}
      titleClassName="pointer-events-none text-gray-900"
      iconWrapperClassName="pointer-events-none"
      onClick={handleCardClick}
      topRightSlot={
        <div
          className="relative flex items-center gap-0.5"
          data-dropdown-container
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {isMultiSelectMode && !isSelected ? (
            <div
              className="pointer-events-none flex h-8 w-8 flex-shrink-0 items-center justify-center"
              title="Select"
              aria-hidden
            >
              <span className="inline-block h-5 w-5 rounded-full border-[3px] border-gray-400 bg-white shadow-sm ring-1 ring-gray-200/80" />
            </div>
          ) : null}
          <button
            type="button"
            onClick={(e) => onToggleDropdown(student.id, e)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            data-dropdown-button
          >
            <IconSettingsWheel className="h-10 w-10" />
          </button>

          <StudentCardActionsMenu
            isOpen={openDropdownId === student.id}
            studentId={student.id}
            studentName={`${student.first_name} ${student.last_name}`}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      }
      icon={
        <img
          src={normalizeAvatarPath(student.avatar)}
          alt={`${student.first_name} ${student.last_name} avatar`}
          width={100}
          height={100}
          className="rounded-xl bg-[#FDF2F0]"
          decoding="async"
        />
      }
    >
      <div className="pointer-events-none w-full text-center">
        <div className="inline-flex items-center rounded-full bg-[#FDF2F0] px-3 py-1 text-xl font-bold text-red-400">
          {student.points || 0}
        </div>
      </div>
    </BaseCard>
  );
}
