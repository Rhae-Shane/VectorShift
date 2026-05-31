import { motion, useReducedMotion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { Icon } from './Icon';
import {
  fadeInVariants,
  fadeUpTransition,
  reducedMotionTransition,
} from '../utils/motion';
import '../styles/canvas-empty.css';

export interface CanvasEmptyStateProps {
  onAddFirstNode: () => void;
}

export const CanvasEmptyState = ({ onAddFirstNode }: CanvasEmptyStateProps) => {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  return (
    <div className="vs-canvas-empty" role="region" aria-label="Empty canvas">
      <motion.button
        type="button"
        className="vs-canvas-empty__btn"
        onClick={onAddFirstNode}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ ...transition, delay: reduceMotion ? 0 : 0.08 }}
        whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      >
        <Icon icon={FiPlus} className="vs-canvas-empty__icon" aria-hidden />
        Add Your First Node
      </motion.button>
    </div>
  );
};
