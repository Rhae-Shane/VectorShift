import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import type { HandleConfig, NodeAccent } from '../types/nodes';
import '../styles/nodes.css';
import { useStore } from '../store';
import { FiX } from 'react-icons/fi';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';

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
  const removeNode = useStore((s) => s.removeNode);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;
  const ChevronDownIcon = FiChevronDown as unknown as FC<SVGProps<SVGSVGElement>>;
  const ChevronUpIcon = FiChevronUp as unknown as FC<SVGProps<SVGSVGElement>>;

  useEffect(() => {
    if (!confirmDelete) return;
    const t = window.setTimeout(() => setConfirmDelete(false), 1800);
    return () => window.clearTimeout(t);
  }, [confirmDelete]);

  const onDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeNode(id);
  };

  return (
    <div
      className={`vs-node vs-node--${accent} ${collapsed ? 'vs-node--collapsed' : ''} ${className}`}
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
        <div className="vs-node__header-left">
          {icon && <span className="vs-node__icon">{icon}</span>}
          <span className="vs-node__title">{title}</span>
        </div>
        <div className="vs-node__header-right">
          <button
            type="button"
            className="vs-node__icon-btn"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand node' : 'Collapse node'}
            aria-label={collapsed ? 'Expand node' : 'Collapse node'}
          >
            {collapsed ? (
              <ChevronDownIcon style={{ width: 16, height: 16 }} />
            ) : (
              <ChevronUpIcon style={{ width: 16, height: 16 }} />
            )}
          </button>
          <button
            type="button"
            className={`vs-node__icon-btn ${confirmDelete ? 'vs-node__icon-btn--danger' : ''}`}
            onClick={onDeleteClick}
            title={confirmDelete ? 'Confirm delete' : 'Delete node'}
            aria-label={confirmDelete ? 'Confirm delete node' : 'Delete node'}
          >
            <CloseIcon style={{ width: 16, height: 16 }} />
          </button>
          {confirmDelete && <div className="vs-node__tooltip">Confirm delete</div>}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="vs-node__id-badge">{id}</div>
          <div className="vs-node__body">{children}</div>
          {error && <div className="vs-node__error">{error}</div>}
        </>
      )}
    </div>
  );
};
