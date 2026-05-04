'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PointCategory } from '@/lib/types';
import { useAvailablePositiveIcons, useAvailableNegativeIcons } from '@/hooks/useAvailableIcons';
import { useSkillManagement } from '@/hooks/useSkillManagement';

interface EditSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  skill: PointCategory | null;
  refreshCategories: () => void;
}

export default function EditSkillForm({ isOpen, onClose, skill, refreshCategories }: EditSkillFormProps) {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [skillName, setSkillName] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [selectedIcon, setSelectedIcon] = useState<string>('/images/dashboard/award-points-icons/icons-positive/icon-pos-1.png');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef<number>(1);

  const { availableIcons: positiveIcons, isDetecting: isDetectingPositive } = useAvailablePositiveIcons();
  const negativeIcons = useAvailableNegativeIcons();
  const availableIcons = activeTab === 'positive' ? positiveIcons : negativeIcons;

  useEffect(() => {
    if (isOpen && skill) {
      const pointsValue = skill.points ?? skill.default_points ?? 0;
      setSkillName(skill.name);
      setPoints(pointsValue);
      previousValueRef.current = pointsValue;
      setActiveTab(pointsValue > 0 ? 'positive' : 'negative');
      const defaultIcon = pointsValue > 0
        ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-1.png'
        : '/images/dashboard/award-points-icons/icons-negative/icon-neg-1.png';
      setSelectedIcon(skill.icon || defaultIcon);
    }
  }, [isOpen, skill]);

  const { updateSkill } = useSkillManagement();

  const handleUpdateSkill = async () => {
    if (!skill) return;
    if (!skillName.trim()) {
      alert('Please enter a skill name.');
      return;
    }

    const name = skillName.trim();
    const pointsValue = activeTab === 'positive' ? Math.abs(points) : -Math.abs(points);
    if (pointsValue === 0) {
      alert('Points cannot be zero. Please enter a valid point value.');
      return;
    }

    setIsLoading(true);
    try {
      await updateSkill({
        skillId: skill.id,
        name,
        points: pointsValue,
        icon: selectedIcon,
      });

      refreshCategories();
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Unexpected error in handleUpdateSkill:', error);
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        alert('You must be logged in to update skills.');
      } else {
        alert('Failed to update skill. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointsChange = (value: number) => {
    let newValue: number;
    if (activeTab === 'positive') {
      newValue = Math.abs(value) || 1;
      setPoints(newValue);
    } else {
      if (value >= 0) {
        const absValue = Math.abs(value) || 1;
        newValue = -Math.max(1, absValue);
      } else {
        newValue = value;
      }
      setPoints(newValue);
    }
    previousValueRef.current = newValue;
  };

  if (!skill) return null;

  return (
    <div className="relative">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Edit Skill</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Skill</h3>
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
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
                    {activeTab === 'positive' && isDetectingPositive ? (
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
            {activeTab === 'negative' ? (
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
                    setPoints(1);
                    previousValueRef.current = 1;
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
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSkill}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
