import type { ReactNode } from 'react';
import { FiChevronDown, FiChevronUp, FiCopy, FiX } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';
import type { UseNodeChromeResult } from '../hooks/useNodeChrome';

const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;
const CopyIcon = FiCopy as unknown as FC<SVGProps<SVGSVGElement>>;
const ChevronDownIcon = FiChevronDown as unknown as FC<SVGProps<SVGSVGElement>>;
const ChevronUpIcon = FiChevronUp as unknown as FC<SVGProps<SVGSVGElement>>;

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
          <CopyIcon style={{ width: 14, height: 14 }} />
        </button>
        <button
          type="button"
          className="vs-node__icon-btn"
          onClick={onToggleCollapseClick}
          aria-label={collapsed ? 'Expand node' : 'Collapse node'}
          {...bindHoverTip('collapse')}
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
          {...bindHoverTip('delete')}
        >
          <CloseIcon style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
};
