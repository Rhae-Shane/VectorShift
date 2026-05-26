import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { FiMove } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';
import {
  TOOLBAR_DOCK_POSITIONS,
  TOOLBAR_DOCK_STORAGE_KEY,
  type ToolbarDockPosition,
} from '../types/toolbarDock';
import '../styles/dockable-toolbar.css';

const GripIcon = FiMove as unknown as FC<SVGProps<SVGSVGElement>>;

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
  const [isDragging, setIsDragging] = useState(false);
  const [hoverZone, setHoverZone] = useState<ToolbarDockPosition | null>(null);

  const applyPosition = useCallback((next: ToolbarDockPosition) => {
    setPosition(next);
    persistDockPosition(next);
  }, []);

  const detectZone = useCallback(
    (clientX: number, clientY: number): ToolbarDockPosition | null => {
      const el = mainRef.current;
      if (!el) return null;

      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      const edge = Math.min(w, h) * 0.22;

      const distTop = y;
      const distBottom = h - y;
      const distLeft = x;
      const distRight = w - x;

      const min = Math.min(distTop, distBottom, distLeft, distRight);

      if (min > edge) return null;

      if (min === distTop) return 'top';
      if (min === distBottom) return 'bottom';
      if (min === distLeft) return 'left';
      return 'right';
    },
    []
  );

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      const zone = detectZone(clientX, clientY);
      if (zone) {
        applyPosition(zone);
      }
      setIsDragging(false);
      setHoverZone(null);
    },
    [applyPosition, detectZone]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      setHoverZone(detectZone(e.clientX, e.clientY));
    };

    const onUp = (e: PointerEvent) => {
      endDrag(e.clientX, e.clientY);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDragging(false);
        setHoverZone(null);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [isDragging, detectZone, endDrag]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setHoverZone(position);
  };

  const dockToolbar = (
    <aside
      className={`vs-dock-toolbar vs-dock-toolbar--${position}`}
      data-dock={position}
      aria-label="Node palette"
    >
      <button
        type="button"
        className="vs-dock-toolbar__handle"
        onPointerDown={onHandlePointerDown}
        title="Drag to dock palette (top, right, bottom, left)"
        aria-label="Drag to reposition node palette"
      >
        <GripIcon aria-hidden />
      </button>
      <div className="vs-dock-toolbar__content">{renderToolbar(position)}</div>
    </aside>
  );

  const toolbarFirst =
    position === 'top' || position === 'left';

  return (
    <main
      ref={mainRef}
      className={`vs-main vs-main--dock-${position}${isDragging ? ' vs-main--dock-dragging' : ''}`}
    >
      {toolbarFirst && dockToolbar}
      <div className="vs-main__canvas-wrap">{canvas}</div>
      {!toolbarFirst && dockToolbar}

      {isDragging && (
        <div className="vs-dock-overlay" aria-hidden>
          {TOOLBAR_DOCK_POSITIONS.map((zone) => (
            <div
              key={zone}
              className={`vs-dock-zone vs-dock-zone--${zone}${
                hoverZone === zone ? ' vs-dock-zone--active' : ''
              }${position === zone && hoverZone !== zone ? ' vs-dock-zone--current' : ''}`}
            >
              <span className="vs-dock-zone__label">
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
