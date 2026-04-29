'use client';

import Modal from '@/components/modals/Modal';
import AddStudentsForm from '@/components/forms/AddStudentsForm';

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onStudentAdded: () => void;
}

export default function AddStudentsModal({ isOpen, onClose, classId, onStudentAdded }: AddStudentsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AddStudentsForm
        isOpen={isOpen}
        onClose={onClose}
        classId={classId}
        onStudentAdded={onStudentAdded}
      />
    </Modal>
  );
}

