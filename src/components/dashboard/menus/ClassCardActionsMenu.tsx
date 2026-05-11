'use client';

interface ClassCardActionsMenuProps {
  isOpen: boolean;
  classId: string;
  className: string;
  isOwner: boolean;
  archiveButtonText: string;
  showDelete: boolean;
  onEdit: (classId: string) => void;
  onArchive: (classId: string, className: string) => void;
  onDelete?: (classId: string, className: string) => void;
}

export default function ClassCardActionsMenu({
  isOpen,
  classId,
  className,
  isOwner,
  archiveButtonText,
  showDelete,
  onEdit,
  onArchive,
  onDelete,
}: ClassCardActionsMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-12 z-50 w-56 transform rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 ease-out"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white" />
      <div className="py-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(classId);
          }}
          className="group flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
        >
          <svg
            className="mr-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span>Edit Class</span>
        </button>
        {isOwner && (
          <>
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive(classId, className);
              }}
              className="group flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-purple-50 hover:text-purple-700"
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {archiveButtonText === 'Unarchive Class' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8l6 6m0 0l6-6m-6 6V3"
                  />
                )}
              </svg>
              <span>{archiveButtonText}</span>
            </button>
          </>
        )}
        {isOwner && showDelete && onDelete && (
          <>
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(classId, className);
              }}
              className="group flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
            >
              <svg
                className="mr-3 h-5 w-5 text-red-400 transition-colors group-hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete Class</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
