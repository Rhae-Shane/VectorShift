import type { ReactNode } from 'react';
import {
  FiMinimize2,
  FiSettings,
  FiXCircle,
  FiCopy,
} from 'react-icons/fi';
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
        {icon ? <span className="vs-node__icon">{icon}</span> : null}
        <span className="vs-node__title">{title}</span>
      </div>
      <div className="vs-node__header-right">
        <button
          type="button"
          className="vs-node__icon-btn"
          onClick={onToggleCollapseClick}
          aria-label={collapsed ? 'Expand node' : 'Minimize node'}
          {...bindHoverTip('collapse')}
        >
          <Icon icon={FiMinimize2} size={18} />
        </button>
        <button
          type="button"
          className="vs-node__icon-btn"
          onClick={onDuplicateClick}
          aria-label="Duplicate node"
          title="Duplicate"
          {...bindHoverTip('duplicate')}
        >
          <Icon icon={FiCopy} size={16} />
        </button>
        <button
          type="button"
          className="vs-node__icon-btn"
          aria-label="Settings"
          title="Settings"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Icon icon={FiSettings} size={18} />
        </button>
        <button
          type="button"
          className={`vs-node__icon-btn ${confirmDelete ? 'vs-node__icon-btn--danger' : ''}`}
          onClick={onDeleteClick}
          aria-label={confirmDelete ? 'Confirm delete node' : 'Delete node'}
          {...bindHoverTip('delete')}
        >
          <Icon icon={FiXCircle} size={22} />
        </button>
      </div>
    </div>
  );
};
