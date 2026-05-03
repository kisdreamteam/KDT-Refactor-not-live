'use client';

import { useState, useEffect, useRef } from 'react';
import type { SortOption } from '@/stores/usePreferenceStore';
import ViewModeModal from '@/components/modals/ViewModeModal';
import IconViewDots from '@/components/iconsCustom/iconViewDots';
import IconRandomArrows from '@/components/iconsCustom/iconRandomArrows';
import IconTimerClock from '@/components/iconsCustom/iconTimerClock';
import IconSortingArrows from '@/components/iconsCustom/iconSortingArrows';
import IconCheckBox from '@/components/iconsCustom/iconCheckBox';
import IconSettingsWheel from '@/components/iconsCustom/iconSettingsWheel';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';

interface BottomNavStudentsProps {
  currentClassName: string | null;
  onTimerClick: () => void;
  onRandomClick: () => void;
  sortingDisabled?: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  sortBy: SortOption;
  onSortChange: (next: SortOption) => void;
  onLogout: () => void;
  onToggleMultiSelect: () => void;
}

export default function BottomNavStudents({
  currentClassName,
  onTimerClick,
  onRandomClick,
  sortingDisabled = false,
  classId = null,
  onEditClass,
  sortBy,
  onSortChange,
  onLogout,
  onToggleMultiSelect,
}: BottomNavStudentsProps) {
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const sortButtonRef = useRef<HTMLDivElement>(null);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const viewButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSortPopupOpen && !isSettingsPopupOpen && !isViewPopupOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (isSortPopupOpen && sortButtonRef.current && !sortButtonRef.current.contains(target)) {
        setIsSortPopupOpen(false);
      }
      if (isSettingsPopupOpen && settingsButtonRef.current && !settingsButtonRef.current.contains(target)) {
        setIsSettingsPopupOpen(false);
      }
      if (isViewPopupOpen && viewButtonRef.current && !viewButtonRef.current.contains(target)) {
        setIsViewPopupOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isSortPopupOpen, isSettingsPopupOpen, isViewPopupOpen]);

  return (
    <BaseBottomNav className="overflow-visible">
      {currentClassName && (
        <div className="relative flex-shrink-0" ref={viewButtonRef}>
          <BotNavGrayButton
            icon={<IconViewDots />}
            label="View"
            onClick={(e) => {
              e.stopPropagation();
              setIsViewPopupOpen(!isViewPopupOpen);
            }}
            stopPropagation={true}
          />
          <ViewModeModal isOpen={isViewPopupOpen} onClose={() => setIsViewPopupOpen(false)} />
        </div>
      )}

      <BotNavGrayButton icon={<IconRandomArrows />} label="Random" onClick={onRandomClick} />

      <BotNavGrayButton icon={<IconTimerClock />} label="Timer" onClick={onTimerClick} />

      {currentClassName && (
        <div className="relative flex-shrink-0" ref={sortButtonRef}>
          <BotNavGrayButton
            icon={<IconSortingArrows />}
            label="Sorting"
            onClick={(e) => {
              e.stopPropagation();
              if (!sortingDisabled) setIsSortPopupOpen(!isSortPopupOpen);
            }}
            stopPropagation={true}
            enabled={!sortingDisabled}
          />
          {isSortPopupOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-blue-100 rounded-lg shadow-lg border-4 border-brand-purple py-2 z-[100] min-w-[200px]">
              <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Sort by:
              </div>
              <button
                type="button"
                onClick={() => {
                  onSortChange('number');
                  setIsSortPopupOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  sortBy === 'number' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                }`}
              >
                Student Number
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange('alphabetical');
                  setIsSortPopupOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  sortBy === 'alphabetical' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                }`}
              >
                Alphabetical
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange('points');
                  setIsSortPopupOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  sortBy === 'points' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                }`}
              >
                Points
              </button>
            </div>
          )}
        </div>
      )}

      <BotNavGrayButton
        icon={<IconCheckBox />}
        label="Multiple Select"
        onClick={onToggleMultiSelect}
      />

      <div className="relative flex-shrink-0" ref={settingsButtonRef}>
        <BotNavGrayButton
          icon={<IconSettingsWheel />}
          label="Settings"
          onClick={(e) => {
            e.stopPropagation();
            setIsSettingsPopupOpen(!isSettingsPopupOpen);
          }}
          stopPropagation={true}
        />

        {isSettingsPopupOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-blue-100 rounded-lg shadow-lg border-4 border-brand-purple py-2 z-[100] min-w-[200px]">
            {classId && onEditClass && (
              <button
                type="button"
                onClick={() => {
                  onEditClass();
                  setIsSettingsPopupOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Edit Class
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </BaseBottomNav>
  );
}
