export interface KeyboardShortcut {
  keys: string;
  description: string;
}

/** Modifier label for shortcut UI (Mac vs Windows/Linux). */
export const getShortcutModLabel = (): string => {
  if (typeof navigator === 'undefined') return 'Ctrl';
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? '⌘' : 'Ctrl';
};

export const buildKeyboardShortcuts = (mod: string): KeyboardShortcut[] => [
  { keys: `${mod} + Z`, description: 'Undo' },
  { keys: `${mod} + Shift + Z`, description: 'Redo' },
  { keys: `${mod} + Y`, description: 'Redo (alternate)' },
  { keys: `${mod} + A`, description: 'Select all nodes on canvas' },
  { keys: `${mod} + M`, description: 'Minimize all nodes' },
  { keys: `${mod} + E`, description: 'Expand all nodes' },
  { keys: `${mod} + ↑ + Space`, description: 'Fit pipeline to view' },
  { keys: 'Escape', description: 'Close modal or preview' },
];
