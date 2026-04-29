import { useCallback, useMemo, useState } from 'react';
import type { PointCategory, Student } from '@/lib/types';
import {
  executeCategoryAward,
  executeCustomAward,
  getAwardMode,
  type AwardTargetContext,
  type AwardMode,
} from '@/features/points/services/awardPointsService';

interface UseAwardPointsServiceParams {
  context: AwardTargetContext;
  student: Student | null;
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
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void;
  onClose: () => void;
}

export function useAwardPointsService({
  context,
  student,
  className,
  classIcon,
  onRefresh,
  onPointsAwarded,
  onAwardComplete,
  onClose,
}: UseAwardPointsServiceParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = useMemo<AwardMode>(() => getAwardMode(context), [context]);

  const afterAwardSuccess = useCallback(
    (pointsValue: number, categoryName: string, categoryIcon?: string) => {
      if (mode === 'multiClass' && context.selectedClassIds && onAwardComplete) {
        onAwardComplete(context.selectedClassIds, 'classes');
      }
      if (mode === 'multiStudent' && context.selectedStudentIds && onAwardComplete) {
        onAwardComplete(context.selectedStudentIds, 'students');
      }

      if (onRefresh) {
        onRefresh();
      }

      if (onPointsAwarded) {
        if (mode === 'multiStudent' && context.selectedStudentIds) {
          onPointsAwarded({
            studentAvatar: classIcon || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: `${context.selectedStudentIds.length} ${
              context.selectedStudentIds.length === 1 ? 'Student' : 'Students'
            }`,
            points: pointsValue,
            categoryName,
            categoryIcon,
          });
        } else if (mode === 'wholeClass') {
          onPointsAwarded({
            studentAvatar: classIcon || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: className || 'Whole Class',
            points: pointsValue,
            categoryName,
            categoryIcon,
          });
        } else if (student) {
          onPointsAwarded({
            studentAvatar: student.avatar || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: student.first_name,
            points: pointsValue,
            categoryName,
            categoryIcon,
          });
        }
      }

      onClose();
    },
    [mode, context.selectedClassIds, context.selectedStudentIds, onAwardComplete, onRefresh, onPointsAwarded, classIcon, className, student, onClose]
  );

  const awardSkill = useCallback(
    async (category: PointCategory) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const points = category.points ?? category.default_points ?? 0;
        const studentIds = await executeCategoryAward({
          context,
          categoryId: category.id,
          points,
          memo: '',
        });

        if (studentIds.length === 0) {
          alert('No students found for the current selection.');
          return false;
        }

        afterAwardSuccess(points, category.name, category.icon);
        return true;
      } catch (err) {
        console.error('Unexpected error awarding points:', err);
        setError('Failed to award points. Please try again.');
        alert('Failed to award points. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [afterAwardSuccess, context]
  );

  const awardCustom = useCallback(
    async (customPoints: number, customMemo: string) => {
      if (customPoints === 0 || customPoints === null || customPoints === undefined || isNaN(customPoints)) {
        alert('Please enter a valid point value (positive or negative, but not zero).');
        return false;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const result = await executeCustomAward({
          context,
          points: customPoints,
          memo: customMemo,
        });

        if (!result.teacherId) {
          alert('You must be logged in to award custom points.');
          return false;
        }

        if (result.studentIds.length === 0) {
          alert('No students found for the current selection.');
          return false;
        }

        afterAwardSuccess(customPoints, customMemo || 'Custom Points');
        return true;
      } catch (err) {
        console.error('Unexpected error awarding custom points:', err);
        setError('Failed to award custom points. Please try again.');
        alert('Failed to award custom points. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [afterAwardSuccess, context]
  );

  return {
    isSubmitting,
    error,
    awardSkill,
    awardCustom,
  };
}
