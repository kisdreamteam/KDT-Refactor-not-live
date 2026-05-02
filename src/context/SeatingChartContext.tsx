'use client';

import { createContext, useCallback, useContext, useMemo, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { Student } from '@/lib/types';

interface SeatingChartContextType {
  unseatedStudents: Student[];
  setUnseatedStudents: Dispatch<SetStateAction<Student[]>>;
  selectedStudentForGroup: Student | null;
  setSelectedStudentForGroup: Dispatch<SetStateAction<Student | null>>;
  addStudentToGroup: (studentId: string, groupId: string) => void;
}

const SeatingChartContext = createContext<SeatingChartContextType | undefined>(undefined);

export function SeatingChartProvider({ children }: { children: ReactNode }) {
  const [unseatedStudents, setUnseatedStudents] = useState<Student[]>([]);
  const [selectedStudentForGroup, setSelectedStudentForGroup] = useState<Student | null>(null);

  const addStudentToGroup = useCallback((studentId: string, groupId: string) => {
    // Remove student from unseated list
    setUnseatedStudents(prev => prev.filter(s => s.id !== studentId));
    // Clear selection
    setSelectedStudentForGroup(null);
    // Dispatch event for the editor to handle
    window.dispatchEvent(new CustomEvent('addStudentToGroup', { 
      detail: { studentId, groupId } 
    }));
  }, []);

  const value = useMemo(
    () => ({
      unseatedStudents,
      setUnseatedStudents,
      selectedStudentForGroup,
      setSelectedStudentForGroup,
      addStudentToGroup,
    }),
    [unseatedStudents, selectedStudentForGroup, addStudentToGroup]
  );

  return (
    <SeatingChartContext.Provider value={value}>
      {children}
    </SeatingChartContext.Provider>
  );
}

export function useSeatingChart() {
  const context = useContext(SeatingChartContext);
  if (context === undefined) {
    throw new Error('useSeatingChart must be used within a SeatingChartProvider');
  }
  return context;
}

