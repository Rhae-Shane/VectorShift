import type { CSSProperties, ReactNode } from 'react';
import { Handle, NodeToolbar, Position } from 'reactflow';
import type { HandleConfig, NodeAccent } from '../types/nodes';
import '../styles/nodes.css';
import { NODE_DEFAULT_WIDTH } from '../constants/nodeLayout';
import { useNodeChrome } from '../hooks/useNodeChrome';
import { NodeHeader } from './NodeHeader';
import { NodeNamePill } from './NodeNamePill';
import { NodeSuggestion } from './NodeSuggestion';
import type { PipelineNodeData } from '../types/nodes';

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
  description?: string;
  suggestion?: string;
  nameField?: string;
  nodeData?: PipelineNodeData;
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
  accent = 'indigo',
  description,
  suggestion,
  nameField,
  nodeData,
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

  const shellClass = [
    'vs-node',
    `vs-node--${accent}`,
    chrome.collapsed ? 'vs-node--collapsed' : '',
    selected ? 'vs-node--selected' : '',
    error ? 'vs-node--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      onDoubleClick={chrome.handleDoubleClick}
      className={shellClass}
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
          className={`vs-handle vs-handle--${handle.color ?? 'indigo'}`}
        />
      ))}

      <div className="vs-node__shell">
        <div className="vs-node__header-band">
          <NodeHeader title={title} icon={icon} chrome={chrome} />
          {description ? (
            <p className="vs-node__description">{description}</p>
          ) : null}
        </div>

        {!chrome.collapsed && (
          <>
            <div className="vs-node__body">
              {nameField && nodeData ? (
                <NodeNamePill
                  nodeId={id}
                  data={nodeData}
                  fieldName={nameField}
                />
              ) : null}
              {suggestion ? <NodeSuggestion message={suggestion} /> : null}
              {children}
            </div>
            {error ? (
              <div className="vs-node__error-banner" role="alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
