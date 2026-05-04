'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { refreshDashboardStudents } from '@/hooks/useDashboardStudentSync';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useAwardPointsFlow, type AwardPointsInfo } from '@/hooks/useAwardPointsFlow';
import { useModalStore } from '@/stores/useModalStore';
import {
  emitMultiStudentAwardComplete,
  emitSeatingStudentPointsDelta,
} from '@/lib/events/students';
import { normalizeClassIconPath } from '@/lib/iconUtils';
import AddStudentsModal from '@/components/dashboard/modals/AddStudentsModal';
import AwardPointsModal from '@/components/dashboard/modals/AwardPointsModal';
import EditStudentModal from '@/components/dashboard/modals/EditStudentModal';
import type { EditStudentModalSubmitValues } from '@/components/dashboard/modals/EditStudentModal';
import PointsAwardedConfirmationModal from '@/components/dashboard/modals/PointsAwardedConfirmationModal';
import {
  getNextStartingStudentNumber,
  insertStudent,
  insertStudentsBulk,
  updateStudentById,
} from '@/lib/api/students';
import type { AddStudentsFormSubmitValues } from '@/components/dashboard/forms/AddStudentsForm';

export default function DashboardClassModalsHost() {
  const pathname = usePathname();
  const currentClassId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const students = useDashboardStore((s) => s.students);
  const classes = useDashboardStore((s) => s.classes);

  const modalType = useModalStore((s) => s.modalType);
  const isModalOpen = useModalStore((s) => s.isOpen);
  const selectedStudentId = useModalStore((s) => s.selectedStudentId);
  const awardTargetStudentIds = useModalStore((s) => s.awardTargetStudentIds);
  const closeModal = useModalStore((s) => s.closeModal);

  const {
    awardInfo,
    isConfirmationModalOpen,
    openAwardConfirmation,
    closeAwardConfirmation,
  } = useAwardPointsFlow();
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [addStudentsError, setAddStudentsError] = useState<string | null>(null);
  const [nextStudentNumber, setNextStudentNumber] = useState<number | null>(null);

  const currentClass = useMemo(
    () => (currentClassId ? classes.find((c) => c.id === currentClassId) ?? null : null),
    [classes, currentClassId]
  );
  const className = currentClass?.name ?? '';
  const classIconRaw = currentClass?.icon ?? null;
  const classIcon = classIconRaw ? normalizeClassIconPath(classIconRaw) : '';

  const editingStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) ?? null;
  }, [students, selectedStudentId]);

  const isAwardModal =
    isModalOpen &&
    (modalType === 'award_points_single' ||
      modalType === 'award_points_whole_class' ||
      modalType === 'award_points_multi');

  const handleStudentAdded = useCallback(async () => {
    await refreshDashboardStudents(true);
  }, []);

  useEffect(() => {
    if (!(isModalOpen && modalType === 'add_students' && currentClassId)) return;
    void (async () => {
      try {
        const number = await getNextStartingStudentNumber(currentClassId);
        setNextStudentNumber(number);
      } catch {
        setNextStudentNumber(1);
      }
    })();
  }, [isModalOpen, modalType, currentClassId]);

  const handleAddStudentsSubmit = useCallback(
    async (values: AddStudentsFormSubmitValues) => {
      if (!currentClassId) return;
      setIsAddingStudents(true);
      setAddStudentsError(null);
      try {
        const getRandomAvatar = () => {
          const avatarNumber = Math.floor(Math.random() * 40) + 1;
          const avatarName = `avatar-${String(avatarNumber).padStart(2, '0')}.png`;
          return `/images/dashboard/student-avatars/${avatarName}`;
        };

        if (values.mode === 'single') {
          const parts = values.studentName.split(' ');
          await insertStudent({
            first_name: parts[0],
            last_name: parts.slice(1).join(' '),
            class_id: currentClassId,
            avatar: getRandomAvatar(),
            gender: values.gender,
          });
        } else {
          const lines = values.studentList.split('\n').filter((line) => line.trim() !== '');
          const newStudents = lines.map((line) => {
            let first_name: string;
            let last_name: string;
            if (line.includes(',')) {
              const parts = line.split(',');
              last_name = parts[0].trim();
              first_name = parts[1].trim();
            } else {
              const parts = line.split(' ');
              first_name = parts[0].trim();
              last_name = parts.slice(1).join(' ').trim();
            }
            return { first_name, last_name, class_id: currentClassId, avatar: getRandomAvatar() };
          });
          await insertStudentsBulk(newStudents);
        }
      } catch (err) {
        setAddStudentsError(err instanceof Error ? err.message : 'Failed to add students.');
      } finally {
        setIsAddingStudents(false);
      }
    },
    [currentClassId]
  );

  const handlePointsAwarded = useCallback(
    (info: AwardPointsInfo) => {
      const { modalType: mt, selectedStudentId: sid, awardTargetStudentIds: targetIds } =
        useModalStore.getState();
      const delta = info.points;
      let ids: string[] = [];
      if (mt === 'award_points_single' && sid) {
        ids = [sid];
      } else if (mt === 'award_points_multi' && targetIds?.length) {
        ids = targetIds;
      } else if (mt === 'award_points_whole_class') {
        ids = useDashboardStore.getState().students.map((s) => s.id);
      }
      if (currentClassId && ids.length > 0 && Number.isFinite(delta)) {
        emitSeatingStudentPointsDelta({ classId: currentClassId, studentIds: ids, delta });
      }
      openAwardConfirmation(info);
    },
    [currentClassId, openAwardConfirmation]
  );

  const onAwardComplete = useCallback((selectedIds: string[], type: 'classes' | 'students') => {
    if (type === 'students') {
      emitMultiStudentAwardComplete({ studentIds: selectedIds });
    }
  }, []);

  const handleSubmitEditStudent = useCallback(
    async ({ studentId, ...patch }: EditStudentModalSubmitValues) => {
      await updateStudentById(studentId, patch);
      await refreshDashboardStudents(true);
      closeModal();
    },
    [closeModal]
  );

  if (!currentClassId) {
    return null;
  }

  return (
    <>
      {isModalOpen && modalType === 'add_students' && (
        <AddStudentsModal
          isOpen
          onClose={closeModal}
          onSubmit={handleAddStudentsSubmit}
          isLoading={isAddingStudents}
          error={addStudentsError}
          nextStudentNumber={nextStudentNumber}
          onStudentAdded={() => void handleStudentAdded()}
        />
      )}

      {isAwardModal && (
        <AwardPointsModal
          isOpen
          onClose={closeModal}
          student={
            modalType === 'award_points_single' && selectedStudentId
              ? students.find((s) => s.id === selectedStudentId) ?? null
              : null
          }
          classId={currentClassId}
          className={modalType === 'award_points_whole_class' ? className : undefined}
          classIcon={modalType === 'award_points_whole_class' ? classIcon : undefined}
          skipRefreshAfterAward
          onPointsAwarded={handlePointsAwarded}
          selectedStudentIds={
            modalType === 'award_points_multi' && awardTargetStudentIds?.length
              ? awardTargetStudentIds
              : undefined
          }
          onAwardComplete={onAwardComplete}
        />
      )}

      {isModalOpen && modalType === 'edit_student' && (
        <EditStudentModal
          isOpen
          onClose={closeModal}
          student={editingStudent}
          onSubmit={handleSubmitEditStudent}
        />
      )}

      {awardInfo && (
        <PointsAwardedConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeAwardConfirmation}
          studentAvatar={awardInfo.studentAvatar}
          studentFirstName={awardInfo.studentFirstName}
          points={awardInfo.points}
          categoryName={awardInfo.categoryName}
          categoryIcon={awardInfo.categoryIcon}
        />
      )}
    </>
  );
}
