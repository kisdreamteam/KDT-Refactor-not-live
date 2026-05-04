'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeClassIconPath } from '@/lib/iconUtils';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import IconEditPencil from '@/components/ui/icons/iconEditPencil';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

/** Set to `true` to show the Archived Classes row in the sidebar again. */
const SHOW_ARCHIVED_CLASSES_IN_NAV = false;

export default function LeftNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams?.get('view') || 'grid';
  const classLinkSuffix = currentView === 'seating' ? '?view=seating' : '?view=grid';
  const allAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const activeClassId = useDashboardStore((s) => s.activeClassId);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const setViewMode = usePreferenceStore((s) => s.setViewMode);
  const layouts = useSeatingStore((s) => s.layouts);
  const isLoadingLayouts = useSeatingStore((s) => s.isLoadingLayouts);
  const selectedLayoutId = useSeatingStore((s) => s.selectedLayoutId);
  const showClassesBootstrapSpinner = isLoadingClasses && allAccessibleClasses.length === 0;

  const handleAllClassesClick = () => {
    useLayoutStore.getState().setActiveView('classes');
    setViewMode('active');
    router.push('/dashboard');
  };

  const activeClasses = allAccessibleClasses.filter((cls) => !cls.is_archived);
  const hasArchivedClasses =
    SHOW_ARCHIVED_CLASSES_IN_NAV && allAccessibleClasses.some((cls) => cls.is_archived);

  const handleArchivedClassesClick = () => {
    useLayoutStore.getState().setActiveView('classes');
    setViewMode('archived');
    router.push('/dashboard');
  };

  const showSeatingLayouts = currentView === 'seating';

  return (
    <div className="p-4 flex flex-col h-full max-h-screen">
      <div className="flex-shrink-0 flex flex-col min-h-0 flex-1">
        <div className="bg-brand-cream rounded-4xl p-0 mb-4 flex-shrink-0">
          <div className="text-center">
            <Image
              src="/images/shared/default-image.png"
              alt="User Avatar"
              width={250}
              height={250}
              className="mx-auto mb-2"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </div>

        <button
          onClick={handleAllClassesClick}
          className={`w-full bg-brand-purple text-white p-3 rounded-lg mb-4 hover:bg-blue-800 transition-colors cursor-pointer flex-shrink-0 ${
            viewMode === 'active' ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-purple' : ''
          }`}
        >
          <h2 className="text-center font-semibold">All Classes</h2>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 bg-brand-cream rounded-xl mb-4">
          {isLoadingClasses ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading classes...</span>
            </div>
          ) : activeClasses.length === 0 && !hasArchivedClasses ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No classes yet</p>
            </div>
          ) : (
            <>
              {activeClasses.map((cls) => {
                const isActiveClass = activeClassId === cls.id;
                return (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classes/${cls.id}${classLinkSuffix}`}
                    className="block"
                    onClick={() => {
                      useDashboardStore.getState().setActiveClassId(cls.id);
                      useLayoutStore
                        .getState()
                        .setActiveView(currentView === 'seating' ? 'seating_chart' : 'students');
                    }}
                  >
                    <div
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        isActiveClass ? 'bg-purple-400 hover:bg-purple-500' : 'hover:bg-blue-200'
                      }`}
                    >
                      <div className="w-8 h-8 flex-shrink-0">
                        <Image
                          src={normalizeClassIconPath(cls.icon)}
                          alt={`${cls.name} icon`}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xl font-medium block truncate ${
                            isActiveClass ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          {cls.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {hasArchivedClasses && (
                <div
                  onClick={handleArchivedClassesClick}
                  className={`flex items-center space-x-3 p-2 hover:bg-blue-200 rounded cursor-pointer transition-colors ${
                    viewMode === 'archived' ? 'bg-blue-200' : ''
                  }`}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    <IconTimerClock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xl font-medium text-gray-800 block truncate">Archived Classes</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showSeatingLayouts && (
          <>
            <div className="w-full p-2 mb-2 flex-shrink-0">
              <h2 className="text-center font-semibold text-gray-800">Layouts</h2>
            </div>
            <div className="space-y-2 mb-4 max-h-90 bg-brand-cream rounded-xl overflow-y-auto flex-shrink-0">
              {isLoadingLayouts ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading layouts...</span>
                </div>
              ) : layouts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No layouts yet</p>
                </div>
              ) : (
                layouts.map((layout) => (
                  <div key={layout.id} className="relative">
                    <button
                      type="button"
                      onClick={() => useSeatingStore.getState().layoutNavHandlers?.onSelectLayout(layout.id)}
                      className={`w-full flex items-center justify-between space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedLayoutId === layout.id
                          ? 'bg-purple-400 text-white hover:bg-purple-500'
                          : 'hover:bg-blue-200'
                      }`}
                    >
                      <span
                        className={`text-xl font-medium block truncate flex-1 min-w-0 text-left ${
                          selectedLayoutId === layout.id ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        Layout: {layout.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) =>
                        useSeatingStore.getState().layoutNavHandlers?.onEditLayout(layout.id, layout.name, e)
                      }
                      className="absolute top-2.5 right-9 w-6 h-6 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors z-10"
                      title={`Edit name: ${layout.name}`}
                    >
                      <IconEditPencil className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) =>
                        useSeatingStore.getState().layoutNavHandlers?.onDeleteLayout(layout.id, layout.name, e)
                      }
                      className="absolute top-2.5 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                      title={`Delete ${layout.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0 mt-auto">
        <div className="bg-[#dd7f81] text-white p-3 rounded-lg mb-2">
          <div className="text-center font-semibold">KI-EUN</div>
        </div>
      </div>
    </div>
  );
}
