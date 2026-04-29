'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Modal from '@/components/modals/Modal';
import { useAvailablePositiveIcons, useAvailableNegativeIcons } from '@/lib/hooks/useAvailableIcons';
import { createSkill } from '@/api/skills';

interface AddSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  refreshCategories: () => void;
  skillType?: 'positive' | 'negative';
}

export default function AddSkillForm({
  isOpen,
  onClose,
  classId,
  refreshCategories,
  skillType = 'positive',
}: AddSkillFormProps) {
  const [skillName, setSkillName] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef<number>(1);
  const [selectedIcon, setSelectedIcon] = useState<string>('/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { availableIcons: positiveIcons, isDetecting: isDetectingPositive } = useAvailablePositiveIcons();
  const negativeIcons = useAvailableNegativeIcons();
  const availableIcons = skillType === 'positive' ? positiveIcons : negativeIcons;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
    };

    if (isIconDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isIconDropdownOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSkillName('');
      const newValue = skillType === 'positive' ? 1 : -1;
      setPoints(newValue);
      previousValueRef.current = newValue;
      const iconPath = skillType === 'positive'
        ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png'
        : '/images/dashboard/award-points-icons/icons-negative/icon-neg-6.png';
      setSelectedIcon(iconPath);
    } else {
      const newValue = skillType === 'positive' ? 1 : -1;
      setPoints(newValue);
      previousValueRef.current = newValue;
      const iconPath = skillType === 'positive'
        ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png'
        : '/images/dashboard/award-points-icons/icons-negative/icon-neg-6.png';
      setSelectedIcon(iconPath);
    }
  }, [isOpen, skillType]);

  useEffect(() => {
    const newValue = skillType === 'positive' ? 1 : -1;
    setPoints(newValue);
    previousValueRef.current = newValue;
    const iconPath = skillType === 'positive'
      ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png'
      : '/images/dashboard/award-points-icons/icons-negative/icon-neg-6.png';
    setSelectedIcon(iconPath);
  }, [skillType]);

  const handleAddSkill = async () => {
    if (!skillName.trim()) {
      alert('Please enter a skill name.');
      return;
    }

    const name = skillName.trim();
    const pointsValue = skillType === 'positive' ? Math.abs(points) : -Math.abs(points);
    const type = skillType;

    if (pointsValue === 0) {
      alert('Points cannot be zero. Please enter a valid point value.');
      return;
    }

    setIsLoading(true);

    try {
      const newSkill = {
        name,
        points: pointsValue,
        type,
        class_id: classId,
        icon: selectedIcon,
      };

      await createSkill({
        classId: newSkill.class_id,
        name: newSkill.name,
        points: newSkill.points,
        type: newSkill.type,
        icon: newSkill.icon,
      });

      refreshCategories();
      setIsLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Unexpected error in handleAddSkill:', error);
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        alert('You must be logged in to add skills.');
      } else {
        alert('Failed to add skill. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSkillName('');
    const newValue = skillType === 'positive' ? 1 : -1;
    setPoints(newValue);
    previousValueRef.current = newValue;
    onClose();
  };

  const handlePointsChange = (value: number) => {
    let newValue: number;
    if (skillType === 'positive') {
      newValue = Math.abs(value) || 1;
      setPoints(newValue);
    } else {
      if (value >= 0) {
        newValue = -1;
      } else {
        newValue = Math.max(-1, value);
      }
      setPoints(newValue);
    }
    previousValueRef.current = newValue;
  };

  const handleAddAnotherSkill = () => {
    setSkillName('');
    const newValue = skillType === 'positive' ? 1 : -1;
    setPoints(newValue);
    previousValueRef.current = newValue;
    const iconPath = skillType === 'positive'
      ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png'
      : '/images/dashboard/award-points-icons/icons-negative/icon-neg-6.png';
    setSelectedIcon(iconPath);
    setShowSuccessModal(false);
  };

  const handleReturn = () => {
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      <div className="relative">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Skill</h2>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Skill</h3>

          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-300 hover:border-purple-500 relative shadow-sm"
                >
                  <Image src={selectedIcon} alt="Skill icon" width={60} height={60} className="w-14 h-14 object-contain" />
                </button>
                {isIconDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsIconDropdownOpen(false)} />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-96 max-h-[500px] overflow-y-auto">
                      {skillType === 'positive' && isDetectingPositive ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-6 gap-2">
                          {availableIcons.map((icon, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setSelectedIcon(icon);
                                setIsIconDropdownOpen(false);
                              }}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 ${selectedIcon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <Image src={icon} alt={`Icon ${index + 1}`} width={40} height={40} className="w-10 h-10 object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Helping others"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
              {skillType === 'negative' ? (
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={points}
                    ref={inputRef}
                    onChange={(e) => {
                      const numValue = Number(e.target.value);
                      if (isNaN(numValue) || numValue >= 0 || numValue > -1) {
                        setPoints(-1);
                        previousValueRef.current = -1;
                      } else {
                        handlePointsChange(numValue);
                        previousValueRef.current = numValue;
                      }
                    }}
                    className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., -2"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={points}
                  ref={inputRef}
                  onChange={(e) => {
                    const numValue = Number(e.target.value);
                    if (isNaN(numValue)) {
                      const defaultValue = 1;
                      setPoints(defaultValue);
                      previousValueRef.current = defaultValue;
                    } else {
                      handlePointsChange(numValue);
                      previousValueRef.current = numValue;
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 5"
                  disabled={isLoading}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleReturn} className="max-w-md">
        <div className="text-center py-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">New skill added successfully!</h3>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAddAnotherSkill}
              className="px-6 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              Add Another Skill
            </button>
            <button
              onClick={handleReturn}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Return
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
