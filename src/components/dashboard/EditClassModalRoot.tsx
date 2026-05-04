'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modals/Modal';
import AddStudentsModal from '@/components/dashboard/modals/AddStudentsModal';
import { useClassManagement } from '@/hooks/useClassManagement';

export interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onRefresh: () => void;
}

export default function EditClassModalRoot({ isOpen, onClose, classId, onRefresh }: EditClassModalProps) {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const {
    className,
    setClassName,
    grade,
    setGrade,
    isLoading,
    handleSaveInfo,
    isAddingStudents,
    addStudentsError,
    nextStudentNumber,
    submitAddStudents,
  } = useClassManagement({ isOpen, classId, onRefresh, onClose });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-purple">Edit Class</h2>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
          />
          <label className="block text-sm font-medium text-gray-700">Grade</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3">
            <option value="">Select a grade</option>
            <option value="Grade1">Grade 1</option>
            <option value="Grade2">Grade 2</option>
            <option value="Grade3">Grade 3</option>
            <option value="Grade4">Grade 4</option>
            <option value="Grade5">Grade 5</option>
            <option value="Grade6">Grade 6</option>
            <option value="Grade7">Grade 7</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={() => setIsAddStudentModalOpen(true)} className="px-4 py-2 border border-gray-300 rounded-lg">
            Add Students
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="button" onClick={() => void handleSaveInfo()} disabled={isLoading} className="px-4 py-2 bg-brand-pink text-white rounded-lg">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      <AddStudentsModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={submitAddStudents}
        isLoading={isAddingStudents}
        error={addStudentsError}
        nextStudentNumber={nextStudentNumber}
        onStudentAdded={async () => setIsAddStudentModalOpen(false)}
      />
    </Modal>
  );
}
