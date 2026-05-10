'use client';

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
    <div
      data-settings-menu
      className="absolute bottom-full left-0 z-[100] mb-2 min-w-[220px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {classId && onEditClass && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditClass();
            onCloseMenu();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors first:rounded-t-lg hover:bg-gray-50"
        >
          Edit Class
        </button>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClearAllGroups();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors first:rounded-t-lg hover:bg-gray-50"
      >
        Clear All Groups
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteAllGroups();
        }}
        className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors last:rounded-b-lg hover:bg-red-50"
      >
        Delete All Groups
      </button>
    </div>
  );
}
