import { memo, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import { FiX } from 'react-icons/fi';
import { Icon } from '../components/Icon';
import { useStore } from '../store';
import { useTheme } from '../hooks/useTheme';
import { shallow } from 'zustand/shallow';
import { pressTransition } from '../utils/motion';

import {
  EDGE_CURVATURE,
  EDGE_STROKE_WIDTH,
} from './edgePathConfig';

const selector = (state: {
  pendingDeleteEdgeId: string | null;
  handleEdgeClick: (edgeId: string) => void;
}) => ({
  pendingDeleteEdgeId: state.pendingDeleteEdgeId,
  handleEdgeClick: state.handleEdgeClick,
});

export const DeletableEdge = memo(function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const { pendingDeleteEdgeId, handleEdgeClick } = useStore(selector, shallow);
  const { edgeStroke } = useTheme();
  const isPendingDelete = pendingDeleteEdgeId === id;
  const reduceMotion = useReducedMotion();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: EDGE_CURVATURE,
  });

  const onDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    handleEdgeClick(id);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={24}
        style={{
          ...style,
          stroke: isPendingDelete ? 'var(--vs-error)' : style?.stroke ?? edgeStroke,
          strokeWidth: isPendingDelete ? 3 : EDGE_STROKE_WIDTH,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="vs-edge-delete-wrap"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <motion.button
            type="button"
            className={`vs-edge-delete${isPendingDelete ? ' vs-edge-delete--pending' : ''}`}
            onClick={onDeleteClick}
            title={isPendingDelete ? 'Confirm delete connection' : 'Delete connection'}
            aria-label={isPendingDelete ? 'Confirm delete connection' : 'Delete connection'}
            whileHover={reduceMotion ? undefined : { scale: 1.08 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            animate={
              reduceMotion || !isPendingDelete
                ? { scale: 1 }
                : { scale: [1, 1.12, 1] }
            }
            transition={
              isPendingDelete && !reduceMotion
                ? { duration: 0.35, ease: 'easeOut' }
                : pressTransition
            }
          >
            <Icon icon={FiX} width={12} height={12} aria-hidden />
          </motion.button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
