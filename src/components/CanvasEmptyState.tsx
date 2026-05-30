import { FiPlus } from 'react-icons/fi';
import { Icon } from './Icon';
import '../styles/canvas-empty.css';

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
        <Icon icon={FiPlus} className="vs-canvas-empty__icon" aria-hidden />
        Add Your First Node
      </button>
    </div>
  );
};
