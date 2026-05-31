import { memo, type ReactNode } from 'react';
import { MiniMap, Panel } from 'reactflow';
import { FiLock, FiMinus, FiPlus, FiUnlock } from 'react-icons/fi';
import { Icon } from './Icon';
import { PressableButton } from './PressableButton';
import { FitViewIcon } from './icons/FitViewIcon';
import { HandIcon } from './icons/HandIcon';
import { MinimizeNodesIcon } from './icons/MinimizeNodesIcon';
import { ExpandNodesIcon } from './icons/ExpandNodesIcon';
import '../styles/canvas-controls.css';

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
  <PressableButton
    className={`vs-rf-control-btn ${className}`.trim()}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    aria-pressed={active}
    data-active={active ? 'true' : 'false'}
  >
    {children}
  </PressableButton>
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
            title={`Zoom ${zoomPercent}% (1% – 350%)`}
          >
            {zoomPercent}%
          </div>
          <div className="vs-canvas-controls__zoom-pill">
            <ControlButton label="Zoom in" onClick={onZoomIn} disabled={canvasLocked}>
              <Icon icon={FiPlus} className="vs-rf-control-icon" aria-hidden />
            </ControlButton>
            <ControlButton label="Zoom out" onClick={onZoomOut} disabled={canvasLocked}>
              <Icon icon={FiMinus} className="vs-rf-control-icon" aria-hidden />
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
                <Icon icon={FiUnlock} className="vs-rf-control-icon" aria-hidden />
              ) : (
                <Icon icon={FiLock} className="vs-rf-control-icon" aria-hidden />
              )}
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
            ariaLabel="Pipeline minimap"
            nodeBorderRadius={4}
          />
        </div>
      </div>
    </Panel>
  );
});
