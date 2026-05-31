import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PressableButton } from './PressableButton';
import {
  buildKeyboardShortcuts,
  getShortcutModLabel,
} from '../constants/keyboardShortcuts';
import {
  fadeUpTransition,
  reducedMotionTransition,
  slideUpVariants,
} from '../utils/motion';
import '../styles/keyboard-shortcuts.css';

export const KeyboardShortcutsPopover = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  const modLabel = useMemo(() => getShortcutModLabel(), []);
  const shortcuts = useMemo(
    () => buildKeyboardShortcuts(modLabel),
    [modLabel]
  );

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    focusables[0]?.focus();
  }, [open]);

  return (
    <div className="vs-keyboard-help" ref={rootRef}>
      <PressableButton
        type="button"
        className="vs-navbar__icon-btn vs-keyboard-help__trigger"
        onClick={toggle}
        aria-label="Keyboard shortcuts"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Keyboard shortcuts"
      >
        ?
      </PressableButton>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            key="keyboard-help-panel"
            className="vs-keyboard-help__panel"
            role="dialog"
            aria-label="Keyboard shortcuts"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <p className="vs-keyboard-help__title">Shortcuts</p>
            <ul className="vs-keyboard-help__list">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.keys} className="vs-keyboard-help__item">
                  <span className="vs-keyboard-help__keys">{shortcut.keys}</span>
                  <span className="vs-keyboard-help__desc">
                    {shortcut.description}
                  </span>
                </li>
              ))}
            </ul>
            <p className="vs-keyboard-help__hint">
              Canvas shortcuts are ignored while typing in a field.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
