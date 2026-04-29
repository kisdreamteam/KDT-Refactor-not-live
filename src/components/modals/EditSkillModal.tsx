'use client';

import Modal from '@/components/modals/Modal';
import EditSkillForm from '@/components/forms/EditSkillForm';
import { PointCategory } from '@/lib/types';

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: PointCategory | null;
  refreshCategories: () => void;
}

export default function EditSkillModal({ isOpen, onClose, skill, refreshCategories }: EditSkillModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <EditSkillForm
        isOpen={isOpen}
        onClose={onClose}
        skill={skill}
        refreshCategories={refreshCategories}
      />
    </Modal>
  );
}

