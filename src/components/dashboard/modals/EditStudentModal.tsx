'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/modals/Modal';
import { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';

export type EditStudentModalSubmitValues = {
  studentId: string;
  first_name: string;
  last_name: string | null;
  student_number: number | null;
  gender: string | null;
  avatar: string;
};

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (values: EditStudentModalSubmitValues) => Promise<void>;
}

export default function EditStudentModal({ isOpen, onClose, student, onSubmit }: EditStudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [gender, setGender] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/images/dashboard/student-avatars/avatar-01.png');
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const availableAvatars = Array.from({ length: 40 }, (_, i) => {
    const number = String(i + 1).padStart(2, '0');
    return `/images/dashboard/student-avatars/avatar-${number}.png`;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    };
    if (isAvatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAvatarDropdownOpen]);

  useEffect(() => {
    if (isOpen && student) {
      setFirstName(student.first_name || '');
      setLastName(student.last_name || '');
      setStudentNumber(student.student_number?.toString() || '');
      setSelectedAvatar(normalizeAvatarPath(student.avatar));
      setGender(student.gender || '');
      setIsLoadingData(false);
    } else if (!isOpen) {
      setFirstName('');
      setLastName('');
      setStudentNumber('');
      setGender('');
      setSelectedAvatar('/images/dashboard/student-avatars/avatar-01.png');
      setIsLoadingData(true);
    }
  }, [isOpen, student]);

  const handleSave = async () => {
    if (!student) return;
    if (!firstName.trim()) {
      alert('Please enter a first name.');
      return;
    }
    const studentNumberValue = studentNumber.trim() ? parseInt(studentNumber.trim(), 10) : null;
    if (studentNumber.trim() && studentNumberValue !== null && isNaN(studentNumberValue)) {
      alert('Please enter a valid student number.');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        studentId: student.id,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        student_number: studentNumberValue,
        gender: gender.trim() || null,
        avatar: selectedAvatar,
      });
    } catch (err) {
      console.error('Unexpected error updating student:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-[#F5F5F5] rounded-[28px] p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-brand-purple mb-2">Edit Student</h2>
        </div>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative" ref={dropdownRef}>
                <button type="button" onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-300 hover:border-brand-purple relative shadow-sm">
                  <img src={selectedAvatar} alt="Student avatar" width={60} height={60} className="w-full h-full object-cover rounded-full" decoding="async" />
                </button>
                {isAvatarDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsAvatarDropdownOpen(false)} />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-80 max-h-96 overflow-y-auto">
                      <div className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Student Avatar</div>
                      <div className="grid grid-cols-5 gap-3">
                        {availableAvatars.map((avatar, index) => (
                          <button key={index} type="button" onClick={() => { setSelectedAvatar(avatar); setIsAvatarDropdownOpen(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 overflow-hidden ${selectedAvatar === avatar ? 'border-brand-purple bg-brand-purple/10' : 'border-gray-200 hover:border-gray-300'}`}>
                            <img src={avatar} alt={`Avatar ${index + 1}`} width={48} height={48} className="w-full h-full object-cover rounded-full" decoding="async" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input type="text" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30" placeholder="Enter student number" />
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30" placeholder="Enter first name" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30" placeholder="Enter last name (optional)" />
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30">
              <option value="">Select gender</option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
            </select>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void handleSave()} disabled={isLoading} className="px-6 py-2 bg-brand-pink text-white rounded-lg font-bold hover:brightness-95 transition disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
