'use client';

import Modal from '@/components/ui/modals/Modal';
import AddSkillForm, { type AddSkillFormSubmitValues } from '@/components/dashboard/AddSkillForm';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSubmit: (values: AddSkillFormSubmitValues) => Promise<void>;
  skillType?: 'positive' | 'negative';
}

export default function AddSkillModal({ isOpen, onClose, classId, onSubmit, skillType = 'positive' }: AddSkillModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <AddSkillForm isOpen={isOpen} onClose={onClose} classId={classId} onSubmit={onSubmit} skillType={skillType} />
    </Modal>
  );
}
