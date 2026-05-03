'use client';

import BottomNavSeatingEdit from '@/components/features/navbars/BottomNavSeatingEdit';
import { useSeatingEditBottomNav } from '@/features/seating/hooks/useSeatingEditBottomNav';

type Props = {
  currentClassName: string | null;
  classId: string | null;
  onEditClass: () => void;
};

/** Mount only when seating edit mode is active so `useSeatingEditBottomNav` satisfies Rules of Hooks. */
export default function SeatingEditBottomNavBridge({ currentClassName, classId, onEditClass }: Props) {
  const seatingNav = useSeatingEditBottomNav();
  return (
    <BottomNavSeatingEdit
      currentClassName={currentClassName}
      classId={classId}
      onEditClass={onEditClass}
      {...seatingNav}
    />
  );
}
