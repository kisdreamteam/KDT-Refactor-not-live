import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';

export type SeatingChartRecord = {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  show_grid?: boolean;
  show_objects?: boolean;
  layout_orientation?: string;
};

export type SeatingGroupRecord = {
  id: string;
  name: string;
  seating_chart_id: string;
  sort_order: number;
  group_columns: number;
  group_rows?: number;
  position_x?: number;
  position_y?: number;
  created_at: string;
};

export type GroupAssignment = { student: Student; seat_index: number };
export type LayoutViewSettings = {
  show_grid?: boolean | null;
  show_objects?: boolean | null;
  layout_orientation?: string | null;
};

type StudentSeatAssignment = {
  seating_group_id: string;
  seat_index: number | null;
  students: Student | null;
};

export async function fetchSeatingLayoutsByClassId(
  classId: string
): Promise<SeatingChartRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_charts')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as SeatingChartRecord[];
}

export async function updateSeatingLayoutName(layoutId: string, newName: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('seating_charts')
    .update({ name: newName })
    .eq('id', layoutId);

  if (error) {
    throw error;
  }
}

export async function createSeatingLayout(params: {
  classId: string;
  name: string;
}): Promise<SeatingChartRecord> {
  const supabase = createClient();
  const { classId, name } = params;

  const { data, error } = await supabase
    .from('seating_charts')
    .insert({
      name,
      class_id: classId,
      show_grid: true,
      show_objects: true,
      layout_orientation: 'Left',
    })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create layout.');
  }

  return data as SeatingChartRecord;
}

export async function deleteSeatingLayoutCascade(layoutId: string): Promise<void> {
  const supabase = createClient();

  const { data: groupsData, error: groupsError } = await supabase
    .from('seating_groups')
    .select('id')
    .eq('seating_chart_id', layoutId);

  if (groupsError) {
    throw groupsError;
  }

  if (groupsData && groupsData.length > 0) {
    const groupIds = groupsData.map((g) => g.id);

    for (const groupId of groupIds) {
      const { error: assignmentDeleteError } = await supabase
        .from('student_seat_assignments')
        .delete()
        .eq('seating_group_id', groupId);
      if (assignmentDeleteError) {
        throw assignmentDeleteError;
      }
    }

    for (const groupId of groupIds) {
      const { error: groupDeleteError } = await supabase
        .from('seating_groups')
        .delete()
        .eq('id', groupId);
      if (groupDeleteError) {
        throw groupDeleteError;
      }
    }
  }

  const { error: layoutDeleteError } = await supabase
    .from('seating_charts')
    .delete()
    .eq('id', layoutId);

  if (layoutDeleteError) {
    throw layoutDeleteError;
  }
}

export async function fetchSeatingGroupsWithAssignments(
  layoutId: string
): Promise<{
  groups: SeatingGroupRecord[];
  groupAssignments: Map<string, GroupAssignment[]>;
}> {
  const supabase = createClient();
  const { data: groupsData, error: groupsError } = await supabase
    .from('seating_groups')
    .select('*')
    .eq('seating_chart_id', layoutId)
    .order('sort_order', { ascending: true });

  if (groupsError) {
    throw groupsError;
  }

  const groups = (groupsData || []) as SeatingGroupRecord[];
  const groupAssignments = new Map<string, GroupAssignment[]>();
  groups.forEach((group) => {
    groupAssignments.set(group.id, []);
  });

  const groupIds = groups.map((g) => g.id);
  if (groupIds.length === 0) {
    return { groups, groupAssignments };
  }

  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('student_seat_assignments')
    .select('*, students(*)')
    .in('seating_group_id', groupIds)
    .order('seating_group_id', { ascending: true })
    .order('seat_index', { ascending: true });

  if (assignmentsError) {
    throw assignmentsError;
  }

  const byGroup = new Map<string, StudentSeatAssignment[]>();
  for (const assignment of (assignmentsData || []) as StudentSeatAssignment[]) {
    const groupId = assignment.seating_group_id;
    if (!byGroup.has(groupId)) byGroup.set(groupId, []);
    byGroup.get(groupId)!.push(assignment);
  }

  byGroup.forEach((assignments, groupId) => {
    const withStudent = assignments.filter(
      (a): a is StudentSeatAssignment & { students: Student } => a.students != null
    );
    const hasNull = withStudent.some((a) => a.seat_index == null);
    const sorted = [...withStudent].sort((a, b) => {
      if (hasNull) {
        const cmp = (a.students.first_name ?? '').localeCompare(b.students.first_name ?? '');
        return cmp !== 0 ? cmp : (a.students.last_name ?? '').localeCompare(b.students.last_name ?? '');
      }
      const sa = a.seat_index ?? Infinity;
      const sb = b.seat_index ?? Infinity;
      if (sa !== sb) return sa - sb;
      return (a.students.first_name ?? '').localeCompare(b.students.first_name ?? '');
    });
    groupAssignments.set(
      groupId,
      sorted.map((a, i) => ({ student: a.students, seat_index: a.seat_index ?? i + 1 }))
    );
  });

  return { groups, groupAssignments };
}

export async function fetchLayoutViewSettings(
  layoutId: string
): Promise<LayoutViewSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_charts')
    .select('show_grid, show_objects, layout_orientation')
    .eq('id', layoutId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as LayoutViewSettings;
}
