import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMenu, FiPlay } from 'react-icons/fi';
import { Icon } from './Icon';
import { PressableButton } from './PressableButton';
import { DisabledHoverHint } from './DisabledHoverHint';
import { EMPTY_CANVAS_HINT } from '../constants/canvas';

export interface NavbarOverflowMenuProps {
  hasNodes: boolean;
  onImport: () => void;
  onShare: () => void;
  onPreview: () => void;
}

export const NavbarOverflowMenu = ({
  hasNodes,
  onImport,
  onShare,
  onPreview,
}: NavbarOverflowMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

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

  const runAction = (action: () => void, requiresNodes = false) => {
    if (requiresNodes && !hasNodes) return;
    action();
    close();
  };

  return (
    <div className="vs-navbar__menu" ref={rootRef}>
      <PressableButton
        type="button"
        className="vs-navbar__icon-btn vs-navbar__menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        title="More actions"
      >
        <Icon icon={FiMenu} width={16} height={16} />
      </PressableButton>

      {open ? (
        <div className="vs-navbar__menu-panel" role="menu" aria-label="Pipeline actions">
          <PressableButton
            type="button"
            className="vs-navbar__menu-item"
            role="menuitem"
            onClick={() => runAction(onImport)}
          >
            Import
          </PressableButton>

          <DisabledHoverHint showHint={!hasNodes} hint={EMPTY_CANVAS_HINT}>
            <PressableButton
              type="button"
              className="vs-navbar__menu-item"
              role="menuitem"
              disabled={!hasNodes}
              onClick={() => runAction(onShare, true)}
            >
              Share
            </PressableButton>
          </DisabledHoverHint>

          <DisabledHoverHint showHint={!hasNodes} hint={EMPTY_CANVAS_HINT}>
            <PressableButton
              type="button"
              className="vs-navbar__menu-item vs-navbar__menu-item--run"
              role="menuitem"
              disabled={!hasNodes}
              onClick={() => runAction(onPreview, true)}
            >
              <Icon icon={FiPlay} width={14} height={14} fill="currentColor" />
              Preview
            </PressableButton>
          </DisabledHoverHint>
        </div>
      ) : null}
    </div>
  );
};
