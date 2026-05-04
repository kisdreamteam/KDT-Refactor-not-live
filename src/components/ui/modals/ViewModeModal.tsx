'use client';

type ViewMode = 'grid' | 'seating';

interface ViewModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewModeModal({ isOpen, onClose, currentView, onViewChange }: ViewModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-blue-100 rounded-lg shadow-lg border-4 border-brand-purple py-2 z-[100] min-w-[200px]">
      <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">View mode:</div>
      <button
        onClick={() => onViewChange('grid')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
          currentView === 'grid' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
        }`}
      >
        Student Grid
      </button>
      <button
        onClick={() => onViewChange('seating')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
          currentView === 'seating' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
        }`}
      >
        Seating Chart
      </button>
    </div>
  );
}
