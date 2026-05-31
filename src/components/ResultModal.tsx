import { AnimatedModal } from './AnimatedModal';
import type { PipelineParseResponse } from '../types/api';

export interface ResultModalProps {
  result: PipelineParseResponse | null;
  error: string | null;
  onClose: () => void;
}

export const ResultModal = ({ result, error, onClose }: ResultModalProps) => {
  const open = Boolean(result || error);

  return (
    <AnimatedModal open={open} onClose={onClose} labelledBy="result-modal-title">
      <div className="vs-modal__header">
        <h2 id="result-modal-title" className="vs-modal__title">
          {error ? 'Pipeline Error' : 'Pipeline Analysis'}
        </h2>
        <button
          type="button"
          className="vs-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="vs-modal__body">
        {error ? (
          <p className="vs-modal__error-text">{error}</p>
        ) : result ? (
          <ul className="vs-modal__stats">
            <li>
              <span className="vs-modal__stat-label">Nodes</span>
              <span className="vs-modal__stat-value">{result.num_nodes}</span>
            </li>
            <li>
              <span className="vs-modal__stat-label">Edges</span>
              <span className="vs-modal__stat-value">{result.num_edges}</span>
            </li>
            <li>
              <span className="vs-modal__stat-label">DAG Status</span>
              <span
                className={`vs-modal__badge ${
                  result.is_dag
                    ? 'vs-modal__badge--success'
                    : 'vs-modal__badge--warning'
                }`}
              >
                {result.is_dag
                  ? 'Valid DAG — pipeline is acyclic'
                  : 'Contains a cycle — not a valid DAG'}
              </span>
            </li>
          </ul>
        ) : null}
      </div>

      <div className="vs-modal__footer">
        <button
          type="button"
          className="vs-btn vs-btn--secondary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </AnimatedModal>
  );
};
