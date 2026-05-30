import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Handle, NodeToolbar, Position, useReactFlow } from 'reactflow';
import type { HandleConfig, NodeAccent } from '../types/nodes';
import '../styles/nodes.css';
import { useStore } from '../store';
import { FiX, FiCopy } from 'react-icons/fi';
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
  selected?: boolean;
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
}: BaseNodeProps) => {
  const removeNode = useStore((s) => s.removeNode);
  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);
  const { getNode, setCenter } = useReactFlow();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverTip, setHoverTip] = useState<'collapse' | 'delete' | 'duplicate' | null>(null);
  const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;
  const CopyIcon = FiCopy as unknown as FC<SVGProps<SVGSVGElement>>;
  const ChevronDownIcon = FiChevronDown as unknown as FC<SVGProps<SVGSVGElement>>;
  const ChevronUpIcon = FiChevronUp as unknown as FC<SVGProps<SVGSVGElement>>;

  useEffect(() => {
    if (!confirmDelete) return;
    const t = window.setTimeout(() => setConfirmDelete(false), 1800);
    return () => window.clearTimeout(t);
  }, [confirmDelete]);

  useEffect(() => {
    const onToggleAll = (e: Event) => {
      const detail = (e as CustomEvent<{ collapsed?: boolean }>).detail;
      if (typeof detail?.collapsed === 'boolean') {
        setCollapsed(detail.collapsed);
      }
    };
    window.addEventListener('vs:toggleAllNodes', onToggleAll as EventListener);
    return () => {
      window.removeEventListener('vs:toggleAllNodes', onToggleAll as EventListener);
    };
  }, []);

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeNode(id);
  };

  const onCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const node = getNode(id);
    if (!node) return;

    const nodeType = node.type || 'customInput';
    const newId = getNodeID(nodeType);
    const newPosition = {
      x: node.position.x + 60,
      y: node.position.y + 60,
    };

    // Deep copy data and assign the new ID
    const newData = {
      ...node.data,
      id: newId,
    };

    const newNode = {
      id: newId,
      type: nodeType,
      position: newPosition,
      data: newData,
    };

    addNode(newNode);
  };

  const handleDoubleClick = () => {
    const node = getNode(id);
    if (!node) return;
    
    const { position, width, height } = node;
    if (!position) return;

    // Use measured width/height or fallback to standard node dimensions
    const w = width ?? 380;
    const h = height ?? 200;

    const x = position.x + w / 2;
    const y = position.y + h / 2;
    
    setCenter(x, y, {
      zoom: 0.95,
      duration: 500,
    });
  };

  const hoverTooltipText = confirmDelete
    ? 'Confirm delete'
    : hoverTip === 'delete'
      ? 'Delete node'
      : hoverTip === 'collapse'
        ? collapsed
          ? 'Expand node'
          : 'Collapse node'
        : hoverTip === 'duplicate'
          ? 'Duplicate node'
          : null;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`vs-node vs-node--${accent} ${collapsed ? 'vs-node--collapsed' : ''} ${selected ? 'vs-node--selected' : ''} ${className}`}
      style={{ minWidth: minWidth ?? 380, ...style }}
    >
      <NodeToolbar isVisible={Boolean(hoverTooltipText)} position={Position.Top} align="end">
        <div className="vs-node__toolbar-tooltip">{hoverTooltipText}</div>
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

      <div className="vs-node__header">
        <div className="vs-node__header-left">
          {icon && <span className="vs-node__icon">{icon}</span>}
          <span className="vs-node__title">{title}</span>
        </div>
        <div className="vs-node__header-right">
          <button
            type="button"
            className="vs-node__icon-btn"
            onClick={onCopyClick}
            aria-label="Duplicate node"
            onMouseEnter={() => setHoverTip('duplicate')}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={() => setHoverTip('duplicate')}
            onBlur={() => setHoverTip(null)}
          >
            <CopyIcon style={{ width: 14, height: 14 }} />
          </button>
          <button
            type="button"
            className="vs-node__icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((v) => !v);
            }}
            aria-label={collapsed ? 'Expand node' : 'Collapse node'}
            onMouseEnter={() => setHoverTip('collapse')}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={() => setHoverTip('collapse')}
            onBlur={() => setHoverTip(null)}
          >
            {collapsed ? (
              <ChevronDownIcon style={{ width: 14, height: 14 }} />
            ) : (
              <ChevronUpIcon style={{ width: 14, height: 14 }} />
            )}
          </button>
          <button
            type="button"
            className={`vs-node__icon-btn ${confirmDelete ? 'vs-node__icon-btn--danger' : ''}`}
            onClick={onDeleteClick}
            aria-label={confirmDelete ? 'Confirm delete node' : 'Delete node'}
            onMouseEnter={() => setHoverTip('delete')}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={() => setHoverTip('delete')}
            onBlur={() => setHoverTip(null)}
          >
            <CloseIcon style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="vs-node__body">{children}</div>
          {error && <div className="vs-node__error">{error}</div>}
        </>
      )}
    </div>
  );
};


