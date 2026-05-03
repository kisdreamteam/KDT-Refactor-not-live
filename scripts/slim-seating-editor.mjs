import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'src/components/features/dashboard/SeatingChartEditorView.tsx');
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
// JSX + effects tail: lines 1833-2499 (1-based) = indices 1832-2498
const tail = lines.slice(1832, 2499).join('\n');

const header = `'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { Student } from '@/lib/types';
import CreateLayoutModal from '@/components/modals/CreateLayoutModal';
import EditGroupModal from '@/components/modals/EditGroupModal';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import SuccessNotificationModal from '@/components/modals/SuccessNotificationModal';
import IconSettingsWheel from '@/components/iconsCustom/iconSettingsWheel';
import IconEditPencil from '@/components/iconsCustom/iconEditPencil';
import SeatingCanvasDecor from './seating/SeatingCanvasDecor';
import { useSeatingChartEditor } from '@/features/seating/hooks/useSeatingChart';

interface SeatingChartEditorViewProps {
  classId: string;
  students: Student[];
}

export default function SeatingChartEditorView({ classId, students }: SeatingChartEditorViewProps) {
  const { selectedStudentForGroup, setSelectedStudentForGroup, setUnseatedStudents, unseatedStudents } =
    useSeatingStore(
      useShallow((s) => ({
        unseatedStudents: s.unseatedStudents,
        setUnseatedStudents: s.setUnseatedStudents,
        selectedStudentForGroup: s.selectedStudentForGroup,
        setSelectedStudentForGroup: s.setSelectedStudentForGroup,
      }))
    );
  const selectedLayoutId = useSeatingStore((s) => s.selectedLayoutId);
  const setSelectedLayoutId = useSeatingStore((s) => s.setSelectedLayoutId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const seating = useSeatingChartEditor({
    classId,
    students,
    selectedLayoutId,
    setSelectedLayoutId,
    selectedStudentForGroup,
    setSelectedStudentForGroup,
    setUnseatedStudents,
    unseatedStudents,
    searchParams,
    router,
    pathname,
  });

  const {
    isLoading,
    error,
    fetchLayouts,
    layouts,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateLayout,
    showGrid,
    showObjects,
    layoutOrientation,
    isLoadingGroups,
    groups,
    canvasContainerRef,
    handleDragOver,
    handleDrop,
    getAssignmentsInGroup,
    targetGroupId,
    getGroupRenderLayout,
    groupPositions,
    getDefaultStaggerPosition,
    selectedStudentForSwap,
    studentsAboutToMove,
    studentsBeingPlaced,
    colorCodeBy,
    isRandomizing,
    handleStudentClick,
    removeStudentFromGroup,
    editingGroupNameId,
    draggedGroupId,
    handleDragStart,
    handleDragEnd,
    handleGroupClick,
    GROUP_EXPAND_ROW_HEIGHT,
    getSlotIndex,
    studentAtSlot,
    handleSlotClick,
    handleExpandInColumn,
    openSettingsMenuId,
    setOpenSettingsMenuId,
    settingsMenuPosition,
    setSettingsMenuPosition,
    handleDoubleClickGroupName,
    setEditingGroupNameValue,
    handleSaveGroupName,
    handleCancelEditGroupName,
    handleUpdateGroupColumns,
    handleEditTeam,
    handleClearTeam,
    handleDeleteTeam,
    isEditGroupModalOpen,
    editingGroup,
    setIsEditGroupModalOpen,
    setEditingGroup,
    handleUpdateGroup,
    isClearAllModalOpen,
    setIsClearAllModalOpen,
    handleClearAllConfirmed,
    isDeleteAllModalOpen,
    setIsDeleteAllModalOpen,
    handleDeleteAllConfirmed,
    isClearTeamModalOpen,
    teamToClear,
    setIsClearTeamModalOpen,
    setTeamToClear,
    handleClearTeamConfirmed,
    isDeleteTeamModalOpen,
    teamToDelete,
    setIsDeleteTeamModalOpen,
    setTeamToDelete,
    handleDeleteTeamConfirmed,
    successNotification,
    setSuccessNotification,
  } = seating;

`;

const out = header + '\n' + tail + '\n';
fs.writeFileSync(srcPath, out);
console.log('Slim editor written, lines', out.split(/\r?\n/).length);
