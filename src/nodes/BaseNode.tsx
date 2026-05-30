import type { CSSProperties, ReactNode } from 'react';
import { Handle, NodeToolbar, Position } from 'reactflow';
import type { HandleConfig, NodeAccent } from '../types/nodes';
import '../styles/nodes.css';
import { NODE_DEFAULT_WIDTH } from '../constants/nodeLayout';
import { useNodeChrome } from '../hooks/useNodeChrome';
import { NodeHeader } from './NodeHeader';

const POSITION_MAP: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

export interface BaseNodeProps {
  id: string;
  title: string;
  icon?: ReactNode;
  accent?: NodeAccent;
  handles?: HandleConfig[];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  error?: string | null;
  minWidth?: number;
  selected?: boolean;
  focusFallbackHeight?: number;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const BaseNode = ({
  id,
  title,
  icon,
  accent = 'purple',
  handles = [],
  children,
  className = '',
  style = {},
  error,
  minWidth,
  selected = false,
  focusFallbackHeight,
  onCollapsedChange,
}: BaseNodeProps) => {
  const chrome = useNodeChrome({
    nodeId: id,
    focusFallbackHeight,
    onCollapsedChange,
  });

  return (
    <div
      onDoubleClick={chrome.handleDoubleClick}
      className={`vs-node vs-node--${accent} ${chrome.collapsed ? 'vs-node--collapsed' : ''} ${selected ? 'vs-node--selected' : ''} ${className}`}
      style={{ minWidth: minWidth ?? NODE_DEFAULT_WIDTH, ...style }}
    >
      <NodeToolbar
        isVisible={Boolean(chrome.hoverTooltipText)}
        position={Position.Top}
        align="end"
      >
        <div className="vs-node__toolbar-tooltip">{chrome.hoverTooltipText}</div>
      </NodeToolbar>

      {handles.map((handle) => (
        <Handle
          key={handle.idSuffix}
          type={handle.type}
          position={POSITION_MAP[handle.position] ?? Position.Right}
          id={`${id}-${handle.idSuffix}`}
          style={handle.style}
          className={`vs-handle vs-handle--${handle.color ?? 'gray'}`}
        />
      ))}

      <NodeHeader title={title} icon={icon} chrome={chrome} />

      {!chrome.collapsed && (
        <>
          <div className="vs-node__body">{children}</div>
          {error && <div className="vs-node__error">{error}</div>}
        </>
      )}
    </div>
  );
};
