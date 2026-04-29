'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import AddSkillModal from '@/components/modals/AddSkillModal';
import EditSkillsModal from '@/components/modals/EditSkillsModal';
import SkillCard from '@/components/features/dashboard/cards/SkillCard';
import SkillActionCard from '@/components/features/dashboard/cards/SkillActionCard';
import { PointCategory, Student } from '@/lib/types';
import { fetchPointCategoriesByClassIds } from '@/api/points';
import { useAwardPointsService } from '@/features/points/hooks/useAwardPointsService';

// Helper function to add cache-busting parameter to icon URLs
// Uses modal open state to generate a fresh cache-busting parameter
const addCacheBuster = (iconPath: string, cacheKey?: string | number): string => {
  if (!iconPath) return iconPath;
  // Add cache-busting parameter to force fresh image fetch
  // Use provided cacheKey or generate one based on current time
  const separator = iconPath.includes('?') ? '&' : '?';
  const version = cacheKey || Date.now();
  return `${iconPath}${separator}v=${version}`;
};

const skillsByScopeCache = new Map<string, PointCategory[]>();

function toSkillScopeKey(classIds: string[]): string {
  return [...classIds].sort().join(',');
}

function normalizeCategoryIcons(data: PointCategory[]): PointCategory[] {
  return data.map((category) => ({
    ...category,
    icon: category.icon?.includes('/images/classes/icons/icon-pos-')
      ? category.icon.replace('/images/classes/icons/icon-pos-', '/images/dashboard/award-points-icons/icons-positive/icon-pos-')
      : category.icon?.includes('/images/classes/icons/icon-neg-')
      ? category.icon.replace('/images/classes/icons/icon-neg-', '/images/dashboard/award-points-icons/icons-negative/icon-neg-')
      : category.icon,
  }));
}

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null; // null for whole class mode or multi-select mode
  classId: string; // Single classId for backward compatibility
  className?: string; // For whole class mode
  classIcon?: string; // For whole class mode
  onRefresh?: () => void;
  onPointsAwarded?: (awardInfo: {
    studentAvatar: string;
    studentFirstName: string;
    points: number;
    categoryName: string;
    categoryIcon?: string;
  }) => void;
  // Multi-select support
  selectedClassIds?: string[]; // For multi-class selection
  selectedStudentIds?: string[]; // For multi-student selection
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void; // Callback to store selected IDs
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
}: AwardPointsModalProps) {
  const isMultiClassMode = selectedClassIds && selectedClassIds.length > 0;
  const isMultiStudentMode = selectedStudentIds && selectedStudentIds.length > 0;
  const isWholeClassMode = student === null && !isMultiClassMode && !isMultiStudentMode;
  
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positive' | 'negative' | 'custom'>('positive');
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [customMemo, setCustomMemo] = useState<string>('');
  const [isManageSkillsModalOpen, setManageSkillsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [imageCacheKey, setImageCacheKey] = useState<number>(Date.now());
  const { awardSkill, awardCustom } = useAwardPointsService({
    context: {
      studentId: student?.id ?? null,
      classId,
      selectedClassIds,
      selectedStudentIds,
    },
    student,
    className,
    classIcon,
    onRefresh,
    onPointsAwarded,
    onAwardComplete,
    onClose,
  });

  // Fetch categories function
  const fetchCategories = useCallback(async (force = false) => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // For multi-class mode, fetch categories from all selected classes
      // For other modes, use the single classId
      const classIdsToFetch = (selectedClassIds && selectedClassIds.length > 0)
        ? selectedClassIds 
        : [classId];
      const cacheKey = toSkillScopeKey(classIdsToFetch);
      const cached = skillsByScopeCache.get(cacheKey);
      if (!force && cached) {
        setCategories(cached);
        return;
      }

      const data = await fetchPointCategoriesByClassIds(classIdsToFetch);
      const normalizedData = normalizeCategoryIcons(data || []);

      // For multi-class mode, we might have duplicate categories, so we'll use unique ones
      // For now, we'll just use all categories (they should be class-specific anyway)
      skillsByScopeCache.set(cacheKey, normalizedData);
      setCategories(normalizedData);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, classId, selectedClassIds]);

  const refreshCategories = useCallback(() => {
    void fetchCategories(true);
  }, [fetchCategories]);

  // Fetch categories when modal opens or classId/selectedClassIds changes
  useEffect(() => {
    if (isOpen) {
      // Update cache key when modal opens to force fresh image loads
      setImageCacheKey(Date.now());
      fetchCategories();
    }
  }, [isOpen, classId, selectedClassIds, fetchCategories]);

  // Filter categories into positive and negative skills
  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_archived !== true),
    [categories]
  );

  const positiveSkills = useMemo(() => {
    const filtered = activeCategories.filter((category) => {
      const points = category.points ?? category.default_points ?? 0;
      return points > 0;
    }).map((category) => {
      const points = category.points ?? category.default_points ?? 0;
      return {
        id: category.id,
        name: category.name,
        points: points,
        icon: category.icon, // Use icon from database
      };
    });
    return filtered;
  }, [activeCategories]);

  const negativeSkills = useMemo(() => {
    const filtered = activeCategories.filter((category) => {
      const points = category.points ?? category.default_points ?? 0;
      return points < 0;
    }).map((category) => {
      const points = category.points ?? category.default_points ?? 0;
      return {
        id: category.id,
        name: category.name,
        points: points,
        icon: category.icon, // Use icon from database
      };
    });
    return filtered;
  }, [activeCategories]);

  // Handle custom points submission
  const handleCustomAward = async () => {
    const didSucceed = await awardCustom(customPoints, customMemo);
    if (didSucceed) {
      setCustomPoints(0);
      setCustomMemo('');
    }
  };

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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          {/* Student/Class Info */}
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
              {/* Crown icon overlay - only for single student (including single student from seating chart) */}
              {(student || (!isWholeClassMode && !isMultiClassMode && !isMultiStudentMode)) && (
                <div className="absolute -top-1 -right-1">
                  <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L8.5 8.5 2 9.5l5 5-1 7 6-3.5 6 3.5-1-7 5-5-6.5-1L12 2z"/>
                  </svg>
                </div>
              )}
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
            
            {/* Point Totals */}
            <div className="flex items-left gap-2 ml-4">
              <span className="px-0 py-1 rounded-full text-3xl font-bold text-red-600 translate-y-2/12">
                {student
                  ? `${student.points || 0} Points`
                  : isMultiClassMode || isMultiStudentMode
                  ? 'Multiple'
                  : isWholeClassMode 
                  ? 'Class Points'
                  : '0 Points'
              }
              </span>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 sm:gap-4 md:gap-6 mb-6">
          <button
            onClick={() => setActiveTab('positive')}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base transition-colors flex items-center justify-center ${
              activeTab === 'positive'
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                : 'bg-white text-gray-400 hover:bg-pink-50 hover:shadow-sm'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setActiveTab('negative')}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base transition-colors flex items-center justify-center ${
              activeTab === 'negative'
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                : 'bg-white text-gray-400 hover:bg-pink-50 hover:shadow-sm'
            }`}
          >
            Needs work
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm md:text-base transition-colors flex items-center justify-center ${
              activeTab === 'custom'
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                : 'bg-white text-gray-400 hover:bg-pink-50 hover:shadow-sm'
            }`}
          >
            Custom Points
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Positive Tab */}
          {activeTab === 'positive' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading categories...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {positiveSkills.map((skill) => {
                    // Find the full category object
                    const category = activeCategories.find(cat => cat.id === skill.id);
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
                  {/* Add Skills Card */}
                  <SkillActionCard
                    title="Add skills"
                    onClick={() => setManageSkillsModalOpen(true)}
                    borderClassName="border-purple-500 hover:border-purple-600"
                    titleClassName="text-purple-600"
                    iconClassName="text-purple-500"
                    icon={(
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  />
                  {/* Edit Skills Card */}
                  <SkillActionCard
                    title="Edit Skills"
                    onClick={() => setEditModalOpen(true)}
                    borderClassName="border-gray-300 hover:border-gray-400"
                    titleClassName="text-gray-600"
                    iconClassName="text-gray-600"
                    icon={(
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  />
                </div>
              )}
            </>
          )}

          {/* Negative Tab (Needs work) */}
          {activeTab === 'negative' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading categories...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {negativeSkills.map((skill) => {
                    // Find the full category object
                    const category = activeCategories.find(cat => cat.id === skill.id);
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
                  {/* Add Skills Card */}
                  <SkillActionCard
                    title="Add skills"
                    onClick={() => setManageSkillsModalOpen(true)}
                    borderClassName="border-purple-500 hover:border-purple-600"
                    titleClassName="text-purple-600"
                    iconClassName="text-purple-500"
                    icon={(
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  />
                  {/* Edit Skills Card */}
                  <SkillActionCard
                    title="Edit Skills"
                    onClick={() => setEditModalOpen(true)}
                    borderClassName="border-gray-300 hover:border-gray-400"
                    titleClassName="text-gray-600"
                    iconClassName="text-gray-600"
                    icon={(
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  />
                </div>
              )}
            </>
          )}

          {/* Custom Points Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Point Value
                </label>
                <input
                  type="number"
                  value={customPoints === 0 ? '' : customPoints}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for clearing the input
                    if (value === '' || value === '-') {
                      setCustomPoints(0);
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setCustomPoints(numValue);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter point value (positive or negative)"
                />
                <p className="text-xs text-gray-500">
                  Enter a positive or negative point value. Zero is not allowed.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Memo (optional)
                </label>
                <textarea
                  value={customMemo}
                  onChange={(e) => setCustomMemo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  placeholder="Add a note about these points..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCustomAward}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Submit Points
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </Modal>
      
      {/* Add Skills Modal */}
      <AddSkillModal 
        isOpen={isManageSkillsModalOpen} 
        onClose={() => setManageSkillsModalOpen(false)} 
        classId={classId}
        refreshCategories={refreshCategories}
        skillType={activeTab === 'positive' ? 'positive' : activeTab === 'negative' ? 'negative' : 'positive'}
      />

      {/* Edit Skills Modal */}
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

// Helper function to generate an icon based on skill name
function getSkillIcon(): React.ReactNode {
  // Default icon for all skills (can be customized based on name if needed)
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

// Helper function to get skill icon colors
function getSkillColor(skillName: string): string {
  // Default colors - can be customized based on skill name
  const colors = ['#EF4444', '#10B981', '#FBBF24', '#F97316', '#3B82F6', '#F59E0B', '#8B5CF6'];
  // Simple hash function to assign consistent colors
  let hash = 0;
  for (let i = 0; i < skillName.length; i++) {
    hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
