import type { FC, SVGProps } from 'react';
import { FiPlus } from 'react-icons/fi';
import '../styles/canvas-empty.css';

const PlusIcon = FiPlus as unknown as FC<SVGProps<SVGSVGElement>>;

export interface CanvasEmptyStateProps {
  onAddFirstNode: () => void;
}

export const CanvasEmptyState = ({ onAddFirstNode }: CanvasEmptyStateProps) => {
  return (
    <div className="vs-canvas-empty" role="region" aria-label="Empty canvas">
      <button
        type="button"
        className="vs-canvas-empty__btn"
        onClick={onAddFirstNode}
      >
        <PlusIcon className="vs-canvas-empty__icon" aria-hidden />
        Add Your First Node
      </button>
    </div>
  );
};
