import { memo, type FC, type ReactNode, type SVGProps } from 'react';
import { MiniMap, Panel } from 'reactflow';
import { FiLock, FiMinus, FiPlus, FiUnlock } from 'react-icons/fi';
import { FitViewIcon } from './icons/FitViewIcon';
import { HandIcon } from './icons/HandIcon';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';
import { MinimizeNodesIcon } from './icons/MinimizeNodesIcon';
import { ExpandNodesIcon } from './icons/ExpandNodesIcon';
import '../styles/canvas-controls.css';

const PlusIcon = FiPlus as unknown as FC<SVGProps<SVGSVGElement>>;
const MinusIcon = FiMinus as unknown as FC<SVGProps<SVGSVGElement>>;
const LockIcon = FiLock as unknown as FC<SVGProps<SVGSVGElement>>;
const UnlockIcon = FiUnlock as unknown as FC<SVGProps<SVGSVGElement>>;

export interface CanvasControlsProps {
  zoomPercent: number;
  isInteractive: boolean;
  panMode: boolean;
  /** True when canvas has no nodes — disables pan/zoom controls. */
  canvasLocked?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleInteractive: () => void;
  onTogglePanMode: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const ControlButton = ({
  label,
  onClick,
  active = false,
  disabled = false,
  className = '',
  children,
}: ControlButtonProps) => (
  <button
    type="button"
    className={`vs-rf-control-btn ${className}`.trim()}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    aria-pressed={active}
    data-active={active ? 'true' : 'false'}
  >
    {children}
  </button>
);

export const CanvasControls = memo(function CanvasControls({
  zoomPercent,
  isInteractive,
  panMode,
  canvasLocked = false,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleInteractive,
  onTogglePanMode,
  onCollapseAll,
  onExpandAll,
}: CanvasControlsProps) {
  const locked = !isInteractive;

  return (
    <Panel position="bottom-right" className="vs-canvas-controls">
      <div className="vs-canvas-controls__layout">
        <div className="vs-canvas-controls__zoom-col" aria-label="Zoom controls">
          <div
            className="vs-canvas-controls__zoom-label"
            title={`Zoom ${zoomPercent}% (0% – 350%)`}
          >
            {zoomPercent}%
          </div>
          <div className="vs-canvas-controls__zoom-pill">
            <ControlButton label="Zoom in" onClick={onZoomIn} disabled={canvasLocked}>
              <PlusIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>
            <ControlButton label="Zoom out" onClick={onZoomOut} disabled={canvasLocked}>
              <MinusIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>
            <ControlButton
              label="Fit view (Ctrl + ↑ + Space)"
              onClick={onFitView}
              disabled={canvasLocked}
            >
              <FitViewIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>
          </div>
        </div>

        <div className="vs-canvas-controls__stack">
          <div className="vs-canvas-controls__toolbar" aria-label="Canvas tools">
            <ControlButton
              label={locked ? 'Unlock canvas' : 'Lock canvas (view only)'}
              onClick={onToggleInteractive}
              active={locked}
              disabled={canvasLocked}
            >
              {locked ? (
                <UnlockIcon className="vs-rf-control-icon" aria-hidden />
              ) : (
                <LockIcon className="vs-rf-control-icon" aria-hidden />
              )}
            </ControlButton>

            <ControlButton
              label="Fit view"
              onClick={onFitView}
              className="vs-rf-control-btn--secondary-fit"
              disabled={canvasLocked}
            >
              <LayoutDashboardIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>

            <ControlButton
              label="Minimize all nodes (Ctrl + M)"
              onClick={onCollapseAll}
              disabled={canvasLocked}
            >
              <MinimizeNodesIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>

            <ControlButton
              label="Expand all nodes (Ctrl + E)"
              onClick={onExpandAll}
              disabled={canvasLocked}
            >
              <ExpandNodesIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>

            <ControlButton
              label="Pan mode"
              onClick={onTogglePanMode}
              active={panMode}
              disabled={canvasLocked}
            >
              <HandIcon className="vs-rf-control-icon" aria-hidden />
            </ControlButton>
          </div>

          <MiniMap
            className="vs-minimap"
            zoomable={!canvasLocked}
            pannable={!canvasLocked}
            nodeColor="#6366f1"
            nodeStrokeColor="#3730a3"
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor="rgba(15, 23, 42, 0.2)"
            maskStrokeColor="#6366f1"
            maskStrokeWidth={2}
          />
        </div>
      </div>
    </Panel>
  );
});
