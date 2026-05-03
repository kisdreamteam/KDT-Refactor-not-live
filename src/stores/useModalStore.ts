import { create } from 'zustand';

export type ModalType =
  | null
  | 'award_points_single'
  | 'award_points_whole_class'
  | 'award_points_multi'
  | 'edit_student'
  | 'add_students';

export type OpenModalOptions = {
  studentId?: string | null;
  studentIds?: string[] | null;
};

interface ModalStore {
  isOpen: boolean;
  modalType: ModalType;
  selectedStudentId: string | null;
  awardTargetStudentIds: string[] | null;
  openModal: (type: Exclude<ModalType, null>, options?: OpenModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  modalType: null,
  selectedStudentId: null,
  awardTargetStudentIds: null,
  openModal: (type, options = {}) =>
    set({
      isOpen: true,
      modalType: type,
      selectedStudentId: options.studentId ?? null,
      awardTargetStudentIds: options.studentIds ?? null,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      modalType: null,
      selectedStudentId: null,
      awardTargetStudentIds: null,
    }),
}));
