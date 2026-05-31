import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );

export interface UseFocusTrapOptions {
  containerRef: RefObject<HTMLElement | null>;
  active: boolean;
  onEscape?: () => void;
}

/** Trap Tab focus inside `containerRef` while active; optional Escape handler. */
export const useFocusTrap = ({
  containerRef,
  active,
  onEscape,
}: UseFocusTrapOptions): void => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const focusInitial = () => {
      const focusables = getFocusableElements(container);
      if (focusables.length > 0) {
        focusables[0].focus();
        return;
      }
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus();
    };

    requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        event.stopPropagation();
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const previous = previousFocusRef.current;
      if (previous?.isConnected) {
        previous.focus();
      }
    };
  }, [active, onEscape, containerRef]);
};
