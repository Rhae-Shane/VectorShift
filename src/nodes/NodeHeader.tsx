import type { ReactNode } from 'react';
import { FiChevronDown, FiChevronUp, FiCopy, FiX } from 'react-icons/fi';
import { Icon } from '../components/Icon';
import type { UseNodeChromeResult } from '../hooks/useNodeChrome';

export interface NodeHeaderProps {
  title: string;
  icon?: ReactNode;
  chrome: Pick<
    UseNodeChromeResult,
    | 'collapsed'
    | 'confirmDelete'
    | 'onDuplicateClick'
    | 'onToggleCollapseClick'
    | 'onDeleteClick'
    | 'bindHoverTip'
  >;
}

export const NodeHeader = ({ title, icon, chrome }: NodeHeaderProps) => {
  const {
    collapsed,
    confirmDelete,
    onDuplicateClick,
    onToggleCollapseClick,
    onDeleteClick,
    bindHoverTip,
  } = chrome;

  return (
    <div className="vs-node__header">
      <div className="vs-node__header-left">
        {icon && <span className="vs-node__icon">{icon}</span>}
        <span className="vs-node__title">{title}</span>
      </div>
      <div className="vs-node__header-right">
        <button
          type="button"
          className="vs-node__icon-btn"
          onClick={onDuplicateClick}
          aria-label="Duplicate node"
          {...bindHoverTip('duplicate')}
        >
          <Icon icon={FiCopy} size={14} />
        </button>
        <button
          type="button"
          className="vs-node__icon-btn"
          onClick={onToggleCollapseClick}
          aria-label={collapsed ? 'Expand node' : 'Collapse node'}
          {...bindHoverTip('collapse')}
        >
          <Icon icon={collapsed ? FiChevronDown : FiChevronUp} size={14} />
        </button>
        <button
          type="button"
          className={`vs-node__icon-btn ${confirmDelete ? 'vs-node__icon-btn--danger' : ''}`}
          onClick={onDeleteClick}
          aria-label={confirmDelete ? 'Confirm delete node' : 'Delete node'}
          {...bindHoverTip('delete')}
        >
          <Icon icon={FiX} size={14} />
        </button>
      </div>
    </div>
  );
};
