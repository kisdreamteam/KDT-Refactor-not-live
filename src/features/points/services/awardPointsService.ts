import {
  awardCustomPointsToStudents,
  awardPointsToStudents,
  fetchStudentIdsByClassId,
  fetchStudentIdsByClassIds,
  getAuthenticatedUserId,
} from '@/api/points';

export type AwardMode = 'singleStudent' | 'wholeClass' | 'multiStudent' | 'multiClass';

export interface AwardTargetContext {
  studentId: string | null;
  classId: string;
  selectedClassIds?: string[];
  selectedStudentIds?: string[];
}

export function getAwardMode(context: AwardTargetContext): AwardMode {
  if (context.selectedClassIds && context.selectedClassIds.length > 0) {
    return 'multiClass';
  }
  if (context.selectedStudentIds && context.selectedStudentIds.length > 0) {
    return 'multiStudent';
  }
  if (context.studentId) {
    return 'singleStudent';
  }
  return 'wholeClass';
}

export async function resolveAwardTargetStudentIds(context: AwardTargetContext): Promise<string[]> {
  const mode = getAwardMode(context);
  if (mode === 'multiClass') {
    return fetchStudentIdsByClassIds(context.selectedClassIds ?? []);
  }
  if (mode === 'multiStudent') {
    return context.selectedStudentIds ?? [];
  }
  if (mode === 'wholeClass') {
    return fetchStudentIdsByClassId(context.classId);
  }
  return context.studentId ? [context.studentId] : [];
}

export async function executeCategoryAward(params: {
  context: AwardTargetContext;
  categoryId: string;
  points: number;
  memo?: string;
}): Promise<string[]> {
  const studentIds = await resolveAwardTargetStudentIds(params.context);
  if (studentIds.length === 0) {
    return [];
  }
  await awardPointsToStudents({
    studentIds,
    categoryId: params.categoryId,
    points: params.points,
    memo: params.memo ?? '',
  });
  return studentIds;
}

export async function executeCustomAward(params: {
  context: AwardTargetContext;
  points: number;
  memo?: string;
}): Promise<{ teacherId: string | null; studentIds: string[] }> {
  const teacherId = await getAuthenticatedUserId();
  if (!teacherId) {
    return { teacherId: null, studentIds: [] };
  }

  const studentIds = await resolveAwardTargetStudentIds(params.context);
  if (studentIds.length === 0) {
    return { teacherId, studentIds: [] };
  }

  await awardCustomPointsToStudents({
    studentIds,
    teacherId,
    points: params.points,
    memo: params.memo,
  });

  return { teacherId, studentIds };
}
