'use client';

import Modal from '@/components/ui/modals/Modal';
import CreateClassForm from '@/components/ui/forms/CreateClassForm';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateClassModal({ isOpen, onClose }: CreateClassModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CreateClassForm onClose={onClose} />
    </Modal>
  );
}

