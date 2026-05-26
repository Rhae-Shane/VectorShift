export type ToolbarDockPosition = 'top' | 'right' | 'bottom' | 'left';

export const TOOLBAR_DOCK_STORAGE_KEY = 'vs-toolbar-dock';

export const TOOLBAR_DOCK_POSITIONS: ToolbarDockPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
];

export const isVerticalToolbarDock = (
  position: ToolbarDockPosition
): boolean => position === 'left' || position === 'right';
