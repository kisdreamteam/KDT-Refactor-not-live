'use client';

interface StudentsSettingsMenuProps {
  isOpen: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  onCloseMenu: () => void;
  onLogout: () => void;
}

export default function StudentsSettingsMenu({ isOpen, classId, onEditClass, onCloseMenu, onLogout }: StudentsSettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full right-0 z-[100] mb-2 min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg">
      {classId && onEditClass && (
        <button
          type="button"
          onClick={() => {
            onEditClass();
            onCloseMenu();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
        >
          Edit Class
        </button>
      )}
      <button
        type="button"
        onClick={onLogout}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        Log out
      </button>
    </div>
  );
}
