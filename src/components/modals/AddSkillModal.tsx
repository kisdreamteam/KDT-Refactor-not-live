'use client';

import Modal from '@/components/modals/Modal';
import AddSkillForm from '@/components/forms/AddSkillForm';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  refreshCategories: () => void;
  skillType?: 'positive' | 'negative'; // Determines which type of skill can be added
}

export default function AddSkillModal({ isOpen, onClose, classId, refreshCategories, skillType = 'positive' }: AddSkillModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <AddSkillForm
        isOpen={isOpen}
        onClose={onClose}
        classId={classId}
        refreshCategories={refreshCategories}
        skillType={skillType}
      />
    </Modal>
  );
}

