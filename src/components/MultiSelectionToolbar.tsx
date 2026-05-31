import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Panel } from 'reactflow';
import { FiCopy, FiX } from 'react-icons/fi';
import { Icon } from './Icon';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import {
  fadeUpTransition,
  reducedMotionTransition,
  slideUpVariants,
} from '../utils/motion';
import '../styles/selection-toolbar.css';

export const MultiSelectionToolbar = () => {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  const {
    selectedCount,
    duplicateSelectedNodes,
    removeSelectedNodes,
    clearNodeSelection,
  } = useStore(
    (state) => ({
      selectedCount: state.nodes.filter((node) => node.selected).length,
      duplicateSelectedNodes: state.duplicateSelectedNodes,
      removeSelectedNodes: state.removeSelectedNodes,
      clearNodeSelection: state.clearNodeSelection,
    }),
    shallow
  );

  return (
    <Panel position="bottom-center">
      <AnimatePresence>
        {selectedCount >= 2 ? (
          <motion.div
            key="selection-toolbar"
            className="vs-selection-toolbar"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <span className="vs-selection-toolbar__count">
              {selectedCount} nodes selected
            </span>
            <button
              type="button"
              className="vs-selection-toolbar__btn"
              onClick={duplicateSelectedNodes}
              title="Duplicate selected nodes"
            >
              <Icon icon={FiCopy} aria-hidden />
              Duplicate
            </button>
            <button
              type="button"
              className="vs-selection-toolbar__btn vs-selection-toolbar__btn--danger"
              onClick={removeSelectedNodes}
              title="Delete selected nodes"
            >
              <Icon icon={FiX} aria-hidden />
              Delete
            </button>
            <button
              type="button"
              className="vs-selection-toolbar__btn vs-selection-toolbar__btn--ghost"
              onClick={clearNodeSelection}
              title="Clear selection"
            >
              Clear
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Panel>
  );
};
