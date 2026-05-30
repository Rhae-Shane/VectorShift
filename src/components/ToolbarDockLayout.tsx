import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';
import { DOCK_POSITION_ICONS } from './DockPositionIcons';
import {
  TOOLBAR_DOCK_POSITIONS,
  TOOLBAR_DOCK_STORAGE_KEY,
  TOOLBAR_VISIBLE_STORAGE_KEY,
  type ToolbarDockPosition,
} from '../types/toolbarDock';
import '../styles/dockable-toolbar.css';

const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;
const PlusIcon = FiPlus as unknown as FC<SVGProps<SVGSVGElement>>;

const loadToolbarVisible = (): boolean => {
  try {
    const stored = localStorage.getItem(TOOLBAR_VISIBLE_STORAGE_KEY);
    if (stored === 'false') return false;
  } catch {
    /* ignore */
  }
  return true;
};

const persistToolbarVisible = (visible: boolean) => {
  try {
    localStorage.setItem(TOOLBAR_VISIBLE_STORAGE_KEY, String(visible));
  } catch {
    /* ignore */
  }
};

const loadDockPosition = (): ToolbarDockPosition => {
  try {
    const stored = localStorage.getItem(TOOLBAR_DOCK_STORAGE_KEY);
    if (stored && TOOLBAR_DOCK_POSITIONS.includes(stored as ToolbarDockPosition)) {
      return stored as ToolbarDockPosition;
    }
  } catch {
    /* ignore */
  }
  return 'top';
};

const persistDockPosition = (position: ToolbarDockPosition) => {
  try {
    localStorage.setItem(TOOLBAR_DOCK_STORAGE_KEY, position);
  } catch {
    /* ignore */
  }
};

interface ToolbarDockLayoutProps {
  renderToolbar: (position: ToolbarDockPosition) => ReactNode;
  canvas: ReactNode;
}

export const ToolbarDockLayout = ({ renderToolbar, canvas }: ToolbarDockLayoutProps) => {
  const mainRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<ToolbarDockPosition>(loadDockPosition);
  const [isToolbarVisible, setIsToolbarVisible] = useState(loadToolbarVisible);

  const hideToolbar = useCallback(() => {
    setIsToolbarVisible(false);
    persistToolbarVisible(false);
  }, []);

  const showToolbar = useCallback(() => {
    setIsToolbarVisible(true);
    persistToolbarVisible(true);
  }, []);

  const applyPosition = useCallback((next: ToolbarDockPosition) => {
    setPosition(next);
    persistDockPosition(next);
  }, []);

  const selectDockPosition = useCallback(
    (next: ToolbarDockPosition) => {
      applyPosition(next);
      if (!isToolbarVisible) {
        showToolbar();
      }
    },
    [applyPosition, isToolbarVisible, showToolbar]
  );

  const dockToolbar = (
    <aside
      className={`vs-dock-toolbar vs-dock-toolbar--${position}`}
      data-dock={position}
      aria-label="Node palette"
    >
      <div className="vs-dock-toolbar__content">{renderToolbar(position)}</div>
      <div className="vs-dock-toolbar__chrome" role="toolbar" aria-label="Toolbar controls">
        {TOOLBAR_DOCK_POSITIONS.map((zone) => {
          const ZoneIcon = DOCK_POSITION_ICONS[zone];
          return (
            <button
              key={zone}
              type="button"
              className={`vs-dock-toolbar__position vs-dock-toolbar__chrome-btn${
                position === zone ? ' vs-dock-toolbar__position--active' : ''
              }`}
              onClick={() => selectDockPosition(zone)}
              title={`Dock to ${zone}`}
              aria-label={`Dock to ${zone}`}
              aria-pressed={position === zone}
            >
              <ZoneIcon aria-hidden />
            </button>
          );
        })}
        <button
          type="button"
          className="vs-dock-toolbar__close vs-dock-toolbar__chrome-btn"
          onClick={hideToolbar}
          title="Hide node palette"
          aria-label="Hide node palette"
        >
          <CloseIcon aria-hidden />
        </button>
      </div>
    </aside>
  );

  const toolbarFirst =
    position === 'top' || position === 'left';

  return (
    <main
      ref={mainRef}
      className={`vs-main vs-main--dock-${position}${
        !isToolbarVisible ? ' vs-main--toolbar-hidden' : ''
      }`}
    >
      {isToolbarVisible && toolbarFirst && dockToolbar}
      <div className="vs-main__canvas-wrap">{canvas}</div>
      {isToolbarVisible && !toolbarFirst && dockToolbar}

      {!isToolbarVisible && (
        <button
          type="button"
          className={`vs-dock-toolbar__restore vs-dock-toolbar__chrome-btn vs-dock-toolbar__restore--${position}`}
          onClick={showToolbar}
          title="Show node palette"
          aria-label="Show node palette"
        >
          <PlusIcon aria-hidden />
        </button>
      )}
    </main>
  );
};
