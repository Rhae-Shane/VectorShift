import type { CSSProperties, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import type { HandleConfig, NodeAccent } from '../types/nodes';
import '../styles/nodes.css';

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
}: BaseNodeProps) => {
  return (
    <div
      className={`vs-node vs-node--${accent} ${className}`}
      style={{ minWidth, ...style }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.idSuffix}
          type={handle.type}
          position={POSITION_MAP[handle.position] ?? Position.Right}
          id={`${id}-${handle.idSuffix}`}
          style={handle.style}
          className="vs-handle"
        />
      ))}

      <div className="vs-node__header">
        {icon && <span className="vs-node__icon">{icon}</span>}
        <span className="vs-node__title">{title}</span>
      </div>

      <div className="vs-node__id-badge">{id}</div>

      <div className="vs-node__body">{children}</div>

      {error && <div className="vs-node__error">{error}</div>}
    </div>
  );
};
