'use client';

import { useState, useEffect, useRef } from 'react';
import type { SeatingEditBottomNavViewProps } from '@/hooks/useSeatingEditBottomNav';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import IconAutoAssign from '@/components/ui/icons/iconAutoAssign';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';

interface SeatingEditorBottomNavProps extends SeatingEditBottomNavViewProps {
  currentClassName: string | null;
  classId?: string | null;
  onEditClass?: () => void;
}

export default function SeatingEditorBottomNav({
  currentClassName,
  classId = null,
  onEditClass,
  showGrid,
  showFurniture,
  teachersDeskLeft,
  colorByGender,
  onToggleShowGrid,
  onToggleShowFurniture,
  onToggleTeachersDeskLeft,
  onToggleColorByGender,
  onRandomize,
  onClearAllGroups,
  onDeleteAllGroups,
  onAddGroups,
  onAutoAssignSeats,
}: SeatingEditorBottomNavProps) {
  const [isViewSettingsMenuOpen, setIsViewSettingsMenuOpen] = useState(false);
  const viewSettingsButtonRef = useRef<HTMLDivElement>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [isAddGroupsMenuOpen, setIsAddGroupsMenuOpen] = useState(false);
  const addGroupsButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isViewSettingsMenuOpen && !isSettingsMenuOpen && !isAddGroupsMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        isViewSettingsMenuOpen &&
        viewSettingsButtonRef.current &&
        !viewSettingsButtonRef.current.contains(target)
      ) {
        setIsViewSettingsMenuOpen(false);
      }

      if (
        isSettingsMenuOpen &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(target)
      ) {
        setIsSettingsMenuOpen(false);
      }

      if (
        isAddGroupsMenuOpen &&
        addGroupsButtonRef.current &&
        !addGroupsButtonRef.current.contains(target)
      ) {
        setIsAddGroupsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isViewSettingsMenuOpen, isSettingsMenuOpen, isAddGroupsMenuOpen]);

  const handleClearAllGroups = () => {
    onClearAllGroups();
    setIsSettingsMenuOpen(false);
  };

  const handleDeleteAllGroups = () => {
    onDeleteAllGroups();
    setIsSettingsMenuOpen(false);
  };

  const handleAddGroups = (numGroups: number) => {
    onAddGroups(numGroups);
    setIsAddGroupsMenuOpen(false);
  };

  return (
    <BaseBottomNav className="overflow-visible">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-8 lg:gap-15">
          {currentClassName && (
            <div className="relative flex-shrink-0" ref={viewSettingsButtonRef}>
              <BotNavGrayButton
                icon={<IconSettingsWheel />}
                label="View Settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewSettingsMenuOpen(!isViewSettingsMenuOpen);
                }}
                stopPropagation={true}
              />

              {isViewSettingsMenuOpen && (
                <div
                  data-view-settings-menu
                  className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[220px] py-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm text-gray-700 font-medium">Show Grid</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onToggleShowGrid(!showGrid);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showGrid ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showGrid ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm text-gray-700 font-medium">Show Furniture</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onToggleShowFurniture(!showFurniture);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showFurniture ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showFurniture ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm text-gray-700 font-medium">Teacher's Desk Left</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onToggleTeachersDeskLeft(!teachersDeskLeft);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        teachersDeskLeft ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          teachersDeskLeft ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm text-gray-700 font-medium">Color by Gender</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleColorByGender();
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        colorByGender ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          colorByGender ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 opacity-50">
                    <span className="text-sm text-gray-700 font-medium">Color by Level</span>
                    <button
                      type="button"
                      disabled
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 cursor-not-allowed"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentClassName && (
            <div className="relative flex-shrink-0" ref={addGroupsButtonRef}>
              <BotNavGrayButton
                icon={<IconAddPlus />}
                label="Add Groups"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddGroupsMenuOpen(!isAddGroupsMenuOpen);
                }}
                stopPropagation={true}
              />

              {isAddGroupsMenuOpen && (
                <div
                  data-add-groups-menu
                  className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[160px] py-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddGroups(num);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {num} Groups
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentClassName && (
            <BotNavGrayButton
              icon={<IconAutoAssign />}
              label="Auto Assign Seats"
              onClick={onAutoAssignSeats}
            />
          )}

          <BotNavGrayButton
            icon={<IconRandomArrows />}
            label="Randomize Seats"
            onClick={onRandomize}
          />

          {currentClassName && (
            <div className="relative flex-shrink-0" ref={settingsButtonRef}>
              <BotNavGrayButton
                icon={<IconSettingsWheel />}
                label="Settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsMenuOpen(!isSettingsMenuOpen);
                }}
                stopPropagation={true}
              />

              {isSettingsMenuOpen && (
                <div
                  data-settings-menu
                  className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[220px] py-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {classId && onEditClass && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClass();
                        setIsSettingsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors"
                    >
                      Edit Class
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAllGroups();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors"
                  >
                    Clear All Groups
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAllGroups();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg transition-colors"
                  >
                    Delete All Groups
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <div
            onClick={() => handleAddGroups(1)}
            className="w-16 sm:w-24 md:w-32 lg:w-[200px] rounded-xl bg-red-400 text-white p-1 sm:p-2 md:p-2.5 lg:p-3 hover:bg-pink-50 hover:shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0"
          >
            <IconAddPlus className="w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-white" />
            <h2 className="font-semibold text-white text-xs sm:text-sm md:text-base lg:text-base hidden sm:inline">
              Add group
            </h2>
          </div>
        </div>
      </div>
    </BaseBottomNav>
  );
}
