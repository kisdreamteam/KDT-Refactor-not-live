'use client';

import { useCallback } from 'react';
import Modal from '@/components/ui/modals/Modal';
import AddSkillModal from '@/components/dashboard/modals/AddSkillModal';
import EditSkillsModal from '@/components/dashboard/modals/EditSkillsModal';
import SkillCard from '@/components/dashboard/cards/SkillCard';
import SkillActionCard from '@/components/dashboard/cards/SkillActionCard';
import { PointCategory, Student } from '@/lib/types';
import type { AddSkillFormSubmitValues } from '@/components/dashboard/AddSkillForm';
import { usePointAwarding } from '@/hooks/usePointAwarding';
import { useSkillManagement } from '@/hooks/useSkillManagement';

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classId: string;
  className?: string;
  classIcon?: string;
  onRefresh?: () => void;
  onPointsAwarded?: (awardInfo: {
    studentAvatar: string;
    studentFirstName: string;
    points: number;
    categoryName: string;
    categoryIcon?: string;
  }) => void;
  selectedClassIds?: string[];
  selectedStudentIds?: string[];
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void;
  skipRefreshAfterAward?: boolean;
}

export default function AwardPointsModal({
  isOpen,
  onClose,
  student,
  classId,
  className,
  classIcon,
  onRefresh,
  onPointsAwarded,
  selectedClassIds,
  selectedStudentIds,
  onAwardComplete,
  skipRefreshAfterAward = false,
}: AwardPointsModalProps) {
  const isMultiClassMode = selectedClassIds && selectedClassIds.length > 0;
  const isMultiStudentMode = selectedStudentIds && selectedStudentIds.length > 0;
  const isWholeClassMode = student === null && !isMultiClassMode && !isMultiStudentMode;

  const {
    categories,
    isLoading,
    activeTab,
    setActiveTab,
    customPoints,
    setCustomPoints,
    customMemo,
    setCustomMemo,
    isManageSkillsModalOpen,
    setManageSkillsModalOpen,
    isEditModalOpen,
    setEditModalOpen,
    imageCacheKey,
    activeCategories,
    positiveSkills,
    negativeSkills,
    refreshCategories,
    awardSkill,
    handleCustomAward,
    addCacheBuster,
  } = usePointAwarding({
    isOpen,
    onClose,
    student,
    classId,
    className,
    classIcon,
    onRefresh,
    onPointsAwarded,
    selectedClassIds,
    selectedStudentIds,
    onAwardComplete,
    skipRefreshAfterAward,
  });
  const { addSkill } = useSkillManagement();
  const handleSubmitAddSkill = useCallback(async (values: AddSkillFormSubmitValues) => {
    await addSkill(values);
    refreshCategories();
  }, [addSkill, refreshCategories]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl" fixedTop={true}>
        <div className={`relative p-6 rounded-lg transition-colors ${
          activeTab === 'positive'
            ? 'bg-blue-100'
            : activeTab === 'negative'
            ? 'bg-pink-100'
            : activeTab === 'custom'
            ? 'bg-orange-100'
            : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={isMultiClassMode || isWholeClassMode
                    ? (classIcon || "/images/dashboard/class-icons/icon-1.png")
                    : (student?.avatar || "/images/dashboard/student-avatars/avatar-01.png")
                  }
                  alt={student
                    ? `${student.first_name} ${student.last_name}`
                    : isMultiClassMode && selectedClassIds
                    ? `${selectedClassIds.length} Selected Classes`
                    : isMultiStudentMode && selectedStudentIds
                    ? `${selectedStudentIds.length} Selected Students`
                    : isWholeClassMode
                    ? (className || "Whole Class")
                    : ''
                  }
                  width={48}
                  height={48}
                  className="rounded-full"
                  decoding="async"
                />
              </div>
              <span className="text-5xl font-bold text-gray-900">
                {student
                  ? `${student.first_name} ${student.last_name}`
                  : isMultiClassMode && selectedClassIds
                  ? `${selectedClassIds.length} Selected ${selectedClassIds.length === 1 ? 'Class' : 'Classes'}`
                  : isMultiStudentMode && selectedStudentIds
                  ? `${selectedStudentIds.length} Selected ${selectedStudentIds.length === 1 ? 'Student' : 'Students'}`
                  : isWholeClassMode
                  ? (className || 'Whole Class')
                  : ''
                }
              </span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 md:gap-6 mb-6">
            <button onClick={() => setActiveTab('positive')} className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base bg-white">Positive</button>
            <button onClick={() => setActiveTab('negative')} className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base bg-white">Needs work</button>
            <button onClick={() => setActiveTab('custom')} className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base bg-white">Custom Points</button>
          </div>
          <div className="min-h-[300px]">
            {(activeTab === 'positive' || activeTab === 'negative') && (
              isLoading ? (
                <div className="flex items-center justify-center py-16"><p className="text-gray-600">Loading categories...</p></div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {(activeTab === 'positive' ? positiveSkills : negativeSkills).map((skill) => {
                    const category = activeCategories.find((cat: PointCategory) => cat.id === skill.id);
                    if (!category) return null;
                    return (
                      <SkillCard
                        key={skill.id}
                        id={skill.id}
                        name={skill.name}
                        points={skill.points}
                        icon={skill.icon}
                        imageCacheKey={imageCacheKey}
                        onClick={() => void awardSkill(category)}
                        addCacheBuster={addCacheBuster}
                      />
                    );
                  })}
                  <SkillActionCard
                    title="Add skills"
                    onClick={() => setManageSkillsModalOpen(true)}
                    borderClassName="border-purple-500"
                    titleClassName="text-purple-600"
                    iconClassName="text-purple-500"
                    icon={(
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  />
                  <SkillActionCard
                    title="Edit Skills"
                    onClick={() => setEditModalOpen(true)}
                    borderClassName="border-gray-300"
                    titleClassName="text-gray-600"
                    iconClassName="text-gray-600"
                    icon={(
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4z" />
                      </svg>
                    )}
                  />
                </div>
              )
            )}
            {activeTab === 'custom' && (
              <div className="space-y-6">
                <input type="number" value={customPoints === 0 ? '' : customPoints} onChange={(e) => setCustomPoints(Number(e.target.value) || 0)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg" />
                <textarea value={customMemo} onChange={(e) => setCustomMemo(e.target.value)} rows={4} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg" />
                <div className="flex justify-end">
                  <button onClick={handleCustomAward} className="px-6 py-2 bg-purple-500 text-white rounded-lg">Submit Points</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <AddSkillModal
        isOpen={isManageSkillsModalOpen}
        onClose={() => setManageSkillsModalOpen(false)}
        classId={classId}
        onSubmit={handleSubmitAddSkill}
        skillType={activeTab === 'positive' ? 'positive' : activeTab === 'negative' ? 'negative' : 'positive'}
      />
      <EditSkillsModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        classId={classId}
        categories={categories}
        isLoading={isLoading}
        refreshCategories={refreshCategories}
        skillType={activeTab === 'positive' ? 'positive' : activeTab === 'negative' ? 'negative' : undefined}
      />
    </>
  );
}
