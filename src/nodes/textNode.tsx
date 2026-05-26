import {
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
  type ChangeEvent,
  type FC,
  type SVGProps,
} from 'react';
import { Handle, NodeToolbar, Position, type NodeProps } from 'reactflow';
import { useStore } from '../store';
import type { PipelineNodeData } from '../types/nodes';
import '../styles/nodes.css';
import { FiType } from 'react-icons/fi';
import { FiX } from 'react-icons/fi';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const TypeIcon = FiType as unknown as FC<SVGProps<SVGSVGElement>>;
const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;
const ChevronDownIcon = FiChevronDown as unknown as FC<SVGProps<SVGSVGElement>>;
const ChevronUpIcon = FiChevronUp as unknown as FC<SVGProps<SVGSVGElement>>;

const VARIABLE_REGEX = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;

const parseVariables = (text: string): string[] => {
  const seen = new Set<string>();
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }
  return variables;
};

const MIN_WIDTH = 200;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 400;

export const TextNode = ({ id, data }: NodeProps<PipelineNodeData>) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const removeNode = useStore((s) => s.removeNode);
  const [text, setText] = useState<string>(
    (data?.text as string | undefined) ?? '{{input}}'
  );
  const [size, setSize] = useState({ width: MIN_WIDTH, height: MIN_HEIGHT });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverTip, setHoverTip] = useState<'collapse' | 'delete' | null>(null);

  const variables = useMemo(() => parseVariables(text), [text]);

  useLayoutEffect(() => {
    const next = (data?.text as string | undefined) ?? '{{input}}';
    setText(next);
  }, [id, data?.text]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateNodeField(id, 'text', newText);
  };

  useLayoutEffect(() => {
    if (!confirmDelete) return;
    const t = window.setTimeout(() => setConfirmDelete(false), 1800);
    return () => window.clearTimeout(t);
  }, [confirmDelete]);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    const el = textareaRef.current;
    const measure = measureRef.current;
    if (!el || !measure) return;

    if (collapsed) return;

    measure.textContent = text || ' ';
    const contentWidth = Math.min(
      Math.max(measure.scrollWidth + 32, MIN_WIDTH),
      MAX_WIDTH
    );
    el.style.height = 'auto';
    const contentHeight = Math.max(el.scrollHeight + 72, MIN_HEIGHT);
    setSize({ width: contentWidth, height: contentHeight });
  }, [text, collapsed]);

  const hoverTooltipText = confirmDelete
    ? 'Confirm delete'
    : hoverTip === 'delete'
      ? 'Delete node'
      : hoverTip === 'collapse'
        ? collapsed
          ? 'Expand node'
          : 'Collapse node'
        : null;

  return (
    <div
      className={`vs-node vs-node--purple vs-node--text ${collapsed ? 'vs-node--collapsed' : ''}`}
      style={{ width: size.width, minHeight: collapsed ? undefined : size.height }}
    >
      <NodeToolbar isVisible={Boolean(hoverTooltipText)} position={Position.Top} align="end">
        <div className="vs-node__toolbar-tooltip">{hoverTooltipText}</div>
      </NodeToolbar>

      {variables.map((varName, index) => (
        <Handle
          key={varName}
          type="target"
          position={Position.Left}
          id={`${id}-${varName}`}
          className="vs-handle"
          style={{
            top: `${((index + 1) / (variables.length + 1)) * 100}%`,
          }}
        />
      ))}

      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        className="vs-handle"
      />

      <div className="vs-node__header">
        <div className="vs-node__header-left">
          <span className="vs-node__icon">
            <TypeIcon />
          </span>
          <span className="vs-node__title">Text</span>
        </div>
        <div className="vs-node__header-right">
          <button
            type="button"
            className="vs-node__icon-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand node' : 'Collapse node'}
            onMouseEnter={() => setHoverTip('collapse')}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={() => setHoverTip('collapse')}
            onBlur={() => setHoverTip(null)}
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
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true);
              removeNode(id);
            }}
            aria-label={confirmDelete ? 'Confirm delete node' : 'Delete node'}
            onMouseEnter={() => setHoverTip('delete')}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={() => setHoverTip('delete')}
            onBlur={() => setHoverTip(null)}
          >
            <CloseIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="vs-node__id-badge">{id}</div>

          <div className="vs-node__body">
            <div className="vs-field">
              <label className="vs-field__label">Text</label>
              <textarea
                ref={textareaRef}
                className="vs-field__textarea vs-field__textarea--grow"
                value={text}
                onChange={handleTextChange}
                placeholder="Type '{{' to utilize variables"
                rows={1}
              />
            </div>
          </div>

          <span ref={measureRef} className="vs-text-measure" aria-hidden="true" />
        </>
      )}
    </div>
  );
};
