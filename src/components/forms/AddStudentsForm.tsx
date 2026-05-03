'use client';

import { useState, useEffect } from 'react';
import {
  getNextStartingStudentNumber,
  insertStudent,
  insertStudentsBulk,
} from '@/api/students';

interface AddStudentsFormProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onStudentAdded: () => void;
}

export default function AddStudentsForm({ isOpen, onClose, classId, onStudentAdded }: AddStudentsFormProps) {
  const [view, setView] = useState<'single' | 'bulk'>('single');
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [studentList, setStudentList] = useState('');
  const [importType, setImportType] = useState<'word' | 'excel'>('word');
  const [nextStudentNumber, setNextStudentNumber] = useState<number | null>(null);

  const handleClose = () => {
    setView('single');
    setStudentName('');
    setGender('');
    setStudentList('');
    setImportType('word');
    setNextStudentNumber(null);
    onClose();
  };

  // Fetch next student number when modal opens or classId changes
  useEffect(() => {
    if (isOpen && classId) {
      const fetchNumber = async () => {
        try {
          const number = await getNextStartingStudentNumber(classId);
          setNextStudentNumber(number);
        } catch (err) {
          console.error('Unexpected error getting next student number:', err);
          setNextStudentNumber(1);
        }
      };
      fetchNumber();
    } else {
      setNextStudentNumber(null);
    }
  }, [isOpen, classId]);

  const getRandomAvatar = () => {
    const avatarNumber = Math.floor(Math.random() * 40) + 1;
    const avatarName = `avatar-${String(avatarNumber).padStart(2, '0')}.png`;
    return `/images/dashboard/student-avatars/${avatarName}`;
  };

  const handleSaveStudent = async () => {
    const name = studentName.trim();
    if (!name) return;

    try {
      const parts = name.split(' ');
      const first_name = parts[0];
      const last_name = parts.slice(1).join(' ');

      const studentData = {
        first_name,
        last_name,
        class_id: classId,
        avatar: getRandomAvatar(),
        gender: gender.trim() || null,
      };

      await insertStudent(studentData);

      // Success: refresh the student list and close modal
      onStudentAdded();
      handleClose();
    } catch (err) {
      console.error('Unexpected error saving student:', err);
    }
  };

  const handleImportList = async () => {
    const text = studentList.trim();
    if (!text) return;

    try {
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      const newStudents = lines.map((line) => {
        let first_name: string;
        let last_name: string;

        if (line.includes(',')) {
          const parts = line.split(',');
          last_name = parts[0].trim();
          first_name = parts[1].trim();
        } else {
          const parts = line.split(' ');
          first_name = parts[0].trim();
          last_name = parts.slice(1).join(' ').trim();
        }

        return {
          first_name,
          last_name,
          class_id: classId,
          avatar: getRandomAvatar(),
        };
      });

      await insertStudentsBulk(newStudents);

      // Success: refresh the student list and close modal
      onStudentAdded();
      handleClose();
    } catch (err) {
      console.error('Unexpected error importing students:', err);
    }
  };

  return (
    <div className="relative">
      {/* Single Student View */}
      {view === 'single' && (
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">Add students</h2>

          {/* Input Section */}
          <div className="space-y-4">
            {/* Student Number Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Student Number
              </label>
              <input
                type="text"
                value={nextStudentNumber !== null ? nextStudentNumber : 'Calculating...'}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-gray-500">
                This number will be automatically assigned to the student
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                add students by full name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="First and last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Gender Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">Select gender</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setView('bulk')}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              Or, copy and paste your student list
            </button>
            <button
              onClick={handleSaveStudent}
              disabled={!studentName.trim()}
              className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Bulk Add View */}
      {view === 'bulk' && (
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">Copy/Paste Student List</h2>

          {/* Import Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setImportType('word')}
              className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${
                importType === 'word'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 border-2 border-purple-300'
              }`}
            >
              Import from Word
            </button>
            <button
              onClick={() => setImportType('excel')}
              className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${
                importType === 'excel'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 border-2 border-purple-300'
              }`}
            >
              Import from Excel
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Paste your student list</h3>
            <p className="text-sm text-gray-600">
              We&apos;ll automatically import your list and clean duplicates.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <textarea
              value={studentList}
              onChange={(e) => setStudentList(e.target.value)}
              placeholder={`Copy/Paste your students names here. Put each name on a new line.\n\nExamples:\nFirst name Last Name\nFirst name Last Name\nFirst name Last Name\n\n— or —\n\nLast name, First name\nLast name, First name\nLast name, First name`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[200px] text-sm text-gray-500 placeholder-gray-400"
              rows={12}
            />
          </div>

          {/* Import Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleImportList}
              disabled={!studentList.trim()}
              className="px-6 py-2 bg-purple-400 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
