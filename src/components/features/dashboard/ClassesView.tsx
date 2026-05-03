'use client';

import { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import CreateClassModal from '@/components/modals/CreateClassModal';
import EditClassModal from '@/components/modals/EditClassModal';
import { refreshDashboardClassesForUserAction } from '@/hooks/useDashboardClassesSync';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import ClassCardsGrid from './maincontent/viewClassesGrid/ClassCardsGrid';
import {
  archiveClass,
  deleteClassPermanently,
  fetchStudentCountsByClassIds,
} from '@/api/classes';

export default function ClassesView() {
  const classes = useDashboardStore((s) => s.classes);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const hasAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses.length > 0);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveClassId, setArchiveClassId] = useState<string | null>(null);
  const [archiveClassName, setArchiveClassName] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [deleteClassName, setDeleteClassName] = useState<string>('');

  const isArchivedView = viewMode === 'archived';
  const classOwnerMap = new Map(classes.map((cls) => [cls.id, cls.is_owner !== false]));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const fetchStudentCounts = useCallback(async () => {
    try {
      const classIds = classes.map(cls => cls.id);

      if (classIds.length === 0) {
        setStudentCounts({});
        return;
      }
      const countsMap = await fetchStudentCountsByClassIds(classIds);
      setStudentCounts(countsMap);
    } catch (err) {
      console.error('Error fetching student counts:', err);
    }
  }, [classes]);

  // Fetch student counts for all classes
  useEffect(() => {
    if (classes.length > 0) {
      fetchStudentCounts();
    } else {
      setStudentCounts({});
    }
  }, [classes, fetchStudentCounts]);

  // Handle modal close with refresh
  const handleModalClose = () => {
    console.log('Modal closing, refreshing classes...');
    setIsModalOpen(false);
    void refreshDashboardClassesForUserAction();
  };

  // Handle dropdown toggle
  const toggleDropdown = (classId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === classId ? null : classId);
  };

  // Handle archive/unarchive class - open confirmation modal
  const handleArchiveClass = (classId: string, className: string) => {
    if (!classOwnerMap.get(classId)) {
      alert('Only the primary class owner can archive or unarchive this class.');
      return;
    }
    setArchiveClassId(classId);
    setArchiveClassName(className);
    setIsArchiveModalOpen(true);
    setOpenDropdownId(null);
  };

  // Confirm archive/unarchive class
  const handleConfirmArchive = async () => {
    if (!archiveClassId) return;

    try {
      await archiveClass(archiveClassId, !isArchivedView);

      console.log(`Class ${isArchivedView ? 'unarchived' : 'archived'} successfully`);
      void refreshDashboardClassesForUserAction();
      // Dispatch event to refresh sidebar classes
      window.dispatchEvent(new CustomEvent('classUpdated'));
    } catch (err) {
      console.error(`Error ${isArchivedView ? 'unarchiving' : 'archiving'} class:`, err);
      alert(`Failed to ${isArchivedView ? 'unarchive' : 'archive'} class. Please try again.`);
      console.error('Unexpected error:', err);
    } finally {
      setIsArchiveModalOpen(false);
      setArchiveClassId(null);
      setArchiveClassName('');
    }
  };

  // Handle edit class
  const handleEditClass = (classId: string) => {
    setOpenDropdownId(null);
    setSelectedClassId(classId);
    setIsEditModalOpen(true);
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedClassId(null);
    void refreshDashboardClassesForUserAction();
  };

  // Handle delete class (archived only)
  const handleDeleteClass = (classId: string, className: string) => {
    if (!classOwnerMap.get(classId)) {
      alert('Only the primary class owner can delete this class.');
      return;
    }
    setDeleteClassId(classId);
    setDeleteClassName(className);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  // Confirm delete class
  const handleConfirmDelete = async () => {
    if (!deleteClassId) return;

    try {
      await deleteClassPermanently(deleteClassId);
      console.log('Class deleted successfully');
      void refreshDashboardClassesForUserAction();
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete class. Please try again.');
      console.error('Unexpected error deleting class:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteClassId(null);
      setDeleteClassName('');
    }
  };

  const showInitialClassesLoading = isLoadingClasses && !hasAccessibleClasses;

  if (showInitialClassesLoading) {
    return <LoadingState message={`Loading ${isArchivedView ? 'archived ' : ''}classes...`} />;
  }

  return (
    // Main Content Container for the class cards grid
    <div className="max-w-full">
      {/* Header for archived view */}
      {isArchivedView && (
        <div className="bg-blue-100 rounded-3xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Archived Classes</h1>
        </div>
      )}

      {!showInitialClassesLoading && classes.length === 0 ? (
        <EmptyState
          onAddClick={() => !isArchivedView && setIsModalOpen(true)}
          title={isArchivedView ? 'No Archived Classes' : undefined}
          message={isArchivedView ? 'Classes you archive will appear here' : undefined}
          buttonText={isArchivedView ? '' : undefined}
        />
      ) : (
        <ClassCardsGrid
          classes={classes}
          studentCounts={studentCounts}
          openDropdownId={openDropdownId}
          onToggleDropdown={toggleDropdown}
          onEdit={handleEditClass}
          onArchive={handleArchiveClass}
          onAddClass={() => !isArchivedView && setIsModalOpen(true)}
          archiveButtonText={isArchivedView ? 'Unarchive Class' : 'Archive Class'}
          showAddCard={!isArchivedView}
          onDelete={isArchivedView ? handleDeleteClass : undefined}
          showDelete={isArchivedView}
        />
      )}

      {/* Create Class Modal - only for active view */}
      {!isArchivedView && (
        <CreateClassModal isOpen={isModalOpen} onClose={handleModalClose} />
      )}

      {/* Edit Class Modal */}
      {selectedClassId && (
        <EditClassModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          classId={selectedClassId}
          onRefresh={refreshDashboardClassesForUserAction}
        />
      )}

      {/* Archive/Unarchive Confirmation Modal */}
      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setArchiveClassId(null);
          setArchiveClassName('');
        }}
        onConfirm={handleConfirmArchive}
        title={isArchivedView ? 'Unarchive Class' : 'Archive Class'}
        message={isArchivedView
          ? `Are you sure you want to unarchive "${archiveClassName}"? This class will be restored to your main dashboard.`
          : `Are you sure you want to archive "${archiveClassName}"? This class will be moved to your archived classes and removed from the main dashboard.`
        }
        confirmText={isArchivedView ? 'Unarchive' : 'Archive'}
        cancelText="Cancel"
        confirmButtonColor={isArchivedView ? 'green' : 'purple'}
        icon={
          <svg className={`w-6 h-6 ${isArchivedView ? 'text-green-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isArchivedView ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
            )}
          </svg>
        }
      />

      {/* Delete Confirmation Modal - only for archived view */}
      {isArchivedView && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteClassId(null);
            setDeleteClassName('');
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Class"
          message={`Are you sure you want to permanently delete "${deleteClassName}"? This action cannot be undone and will delete all students in this class.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonColor="red"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        />
      )}
    </div>
  );
}
