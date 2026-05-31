import {
  buildKeyboardShortcuts,
  getShortcutModLabel,
} from '../src/constants/keyboardShortcuts';

describe('keyboardShortcuts', () => {
  it('builds a shortcut list with the modifier label', () => {
    const mod = getShortcutModLabel();
    const shortcuts = buildKeyboardShortcuts(mod);

    expect(shortcuts.length).toBeGreaterThanOrEqual(8);
    expect(shortcuts[0].keys).toContain(mod);
    expect(shortcuts.some((s) => s.keys === 'Escape')).toBe(true);
  });
});
