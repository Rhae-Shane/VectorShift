import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedModal } from './AnimatedModal';
import { PressableButton } from './PressableButton';
import type { PipelineParseResponse } from '../types/api';
import {
  fadeUpTransition,
  reducedMotionTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from '../utils/motion';

export interface ResultModalProps {
  result: PipelineParseResponse | null;
  error: string | null;
  onClose: () => void;
}

export const ResultModal = ({ result, error, onClose }: ResultModalProps) => {
  const open = Boolean(result || error);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  return (
    <AnimatedModal open={open} onClose={onClose} labelledBy="result-modal-title">
      <div className="vs-modal__header">
        <h2 id="result-modal-title" className="vs-modal__title">
          {error ? 'Pipeline Error' : 'Pipeline Analysis'}
        </h2>
        <PressableButton
          className="vs-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </PressableButton>
      </div>

      <div className="vs-modal__body">
        {error ? (
          <p className="vs-modal__error-text">{error}</p>
        ) : result ? (
          <motion.ul
            className="vs-modal__stats"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.li variants={staggerItemVariants} transition={transition}>
              <span className="vs-modal__stat-label">Nodes</span>
              <span className="vs-modal__stat-value">{result.num_nodes}</span>
            </motion.li>
            <motion.li variants={staggerItemVariants} transition={transition}>
              <span className="vs-modal__stat-label">Edges</span>
              <span className="vs-modal__stat-value">{result.num_edges}</span>
            </motion.li>
            <motion.li variants={staggerItemVariants} transition={transition}>
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
            </motion.li>
          </motion.ul>
        ) : null}
        {result && !result.is_dag ? (
          <p className="vs-modal__hint vs-modal__hint--warning">
            Remove a connection to break the cycle.
          </p>
        ) : null}
      </div>

      <div className="vs-modal__footer">
        <PressableButton
          className="vs-btn vs-btn--secondary"
          onClick={onClose}
        >
          Close
        </PressableButton>
      </div>
    </AnimatedModal>
  );
};
