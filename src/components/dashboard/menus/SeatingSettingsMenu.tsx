'use client';

import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';

interface SeatingSettingsMenuProps {
  isOpen: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  onCloseMenu: () => void;
  onClearAllGroups: () => void;
  onDeleteAllGroups: () => void;
}

export default function SeatingSettingsMenu({
  isOpen,
  classId,
  onEditClass,
  onCloseMenu,
  onClearAllGroups,
  onDeleteAllGroups,
}: SeatingSettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface
      data-settings-menu
      className="absolute bottom-full left-0 z-[100] mb-2 min-w-[220px]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {classId && onEditClass && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEditClass();
            onCloseMenu();
          }}
        >
          Edit Class
        </MenuItem>
      )}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          onClearAllGroups();
        }}
      >
        Clear All Groups
      </MenuItem>

      <MenuItem
        intent="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteAllGroups();
        }}
      >
        Delete All Groups
      </MenuItem>
    </MenuSurface>
  );
}
