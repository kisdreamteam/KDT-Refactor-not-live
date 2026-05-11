'use client';

import type { DashboardToolbarDef } from '@/components/dashboard/shell/dashboardZoneConfig';
import { toCanvasAction } from '@/components/dashboard/stage/canvasToolbarPresets';

export function useCanvasToolbarActions(toolbarConfig: DashboardToolbarDef) {
  const topActions = toolbarConfig.topActions.map(toCanvasAction);
  const bottomActions = toolbarConfig.bottomActions.map(toCanvasAction);
  return { topActions, bottomActions };
}
