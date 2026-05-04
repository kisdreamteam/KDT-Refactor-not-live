'use client';

import { useState, useEffect } from 'react';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconCheckCircle from '@/components/ui/icons/iconCheckCircle';
import IconCircleX from '@/components/ui/icons/iconCircleX';
import IconNoCircleX from '@/components/ui/icons/iconNoCircleX';
import IconStarTrophy from '@/components/ui/icons/iconStarTrophy';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';
import { STUDENT_EVENTS } from '@/lib/events/students';

export default function MultiSelectBottomNav() {
  const [selectedCount, setSelectedCount] = useState(0);
  const [hasRecentlySelected, setHasRecentlySelected] = useState(false);

  // Check for recently selected data in localStorage
  const checkRecentlySelected = () => {
    const lastSelectedClasses = localStorage.getItem('lastSelectedClasses');
    const lastSelectedStudents = localStorage.getItem('lastSelectedStudents');
    const hasData = !!(lastSelectedClasses || lastSelectedStudents);
    setHasRecentlySelected(hasData);
  };

  // Listen for selection count changes
  useEffect(() => {
    const handleSelectionCountChange = (event: CustomEvent) => {
      setTimeout(() => {
        setSelectedCount(event.detail.count || 0);
      }, 0);
    };

    const handleStorageChange = () => {
      checkRecentlySelected();
    };

    checkRecentlySelected();

    window.addEventListener(STUDENT_EVENTS.SELECTION_COUNT_CHANGED, handleSelectionCountChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED, handleStorageChange);
    window.addEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED, handleStorageChange);
    
    return () => {
      window.removeEventListener(STUDENT_EVENTS.SELECTION_COUNT_CHANGED, handleSelectionCountChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED, handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED, handleStorageChange);
    };
  }, []);

  const handleSelectAll = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_ALL));
  };

  const handleSelectNone = () => {
    if (selectedCount > 0) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_NONE));
    }
  };

  const handleCancel = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.TOGGLE_MULTI_SELECT));
  };

  const handleAwardPoints = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.AWARD_POINTS));
  };

  const handleRecentlySelect = () => {
    if (hasRecentlySelected) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.RECENTLY_SELECT));
    }
  };

  const handleInverseSelect = () => {
    if (selectedCount > 0) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.INVERSE_SELECT));
    }
  };

  return (
    <BaseBottomNav className="overflow-hidden">
      <div className="flex items-center justify-between w-full">
        {/* Left side buttons */}
        <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-8 lg:gap-15">
          {/* Select All Button */}
          <BotNavGrayButton
            icon={<IconCheckCircle />}
            label="Select All"
            onClick={handleSelectAll}
          />

          {/* Select None Button */}
          <BotNavGrayButton
            icon={<IconCircleX className={`w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 ${selectedCount > 0 ? 'text-gray-400' : 'text-gray-300'}`} />}
            label="Select None"
            onClick={handleSelectNone}
            enabled={selectedCount > 0}
          />

          {/* Recently Select Button */}
          <BotNavGrayButton
            icon={<IconTimerClock className={`w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 ${hasRecentlySelected ? 'text-gray-400' : 'text-gray-300'}`} />}
            label="Recently Selected"
            onClick={handleRecentlySelect}
            enabled={hasRecentlySelected}
          />

          {/* Inverse Select Button */}
          <BotNavGrayButton
            icon={<IconRandomArrows className={`w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 ${selectedCount > 0 ? 'text-gray-400' : 'text-gray-300'}`} />}
            label="Inverse Select"
            onClick={handleInverseSelect}
            enabled={selectedCount > 0}
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-15">
          {/* Cancel Button */}
          <div 
            onClick={handleCancel}
            className="w-16 sm:w-24 md:w-32 lg:w-[200px] bg-[#dd7f81] rounded-xl text-white p-1 sm:p-2 md:p-2.5 lg:p-3 hover:bg-pink-50 hover:shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0"
          >
            {/* X icon */}
            <IconNoCircleX />
            <h2 className="font-semibold text-white text-xs sm:text-sm md:text-base lg:text-base hidden sm:inline">Cancel</h2>
          </div>

          {/* Award Points Button */}
          <div 
            onClick={handleAwardPoints}
            className="w-16 sm:w-24 md:w-32 lg:w-[200px] bg-brand-purple rounded-xl text-white p-1 sm:p-2 md:p-2.5 lg:p-3 hover:bg-pink-50 hover:shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0"
          >
            {/* Star/Trophy icon */}
            <IconStarTrophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-white" />
            <h2 className="font-semibold text-white text-xs sm:text-sm md:text-base lg:text-base hidden sm:inline">Award Points</h2>
          </div>
        </div>
      </div>
    </BaseBottomNav>
  );
}

