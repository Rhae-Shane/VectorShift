import { memo, type FC, type MouseEvent, type SVGProps } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import { FiX } from 'react-icons/fi';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';

import {
  EDGE_CURVATURE,
  EDGE_STROKE,
  EDGE_STROKE_WIDTH,
} from './edgePathConfig';

const CloseIcon = FiX as unknown as FC<SVGProps<SVGSVGElement>>;

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
  const isPendingDelete = pendingDeleteEdgeId === id;

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
          stroke: isPendingDelete ? '#ef4444' : style?.stroke ?? EDGE_STROKE,
          strokeWidth: isPendingDelete ? 3 : EDGE_STROKE_WIDTH,
        }}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          className={`vs-edge-delete${isPendingDelete ? ' vs-edge-delete--pending' : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onClick={onDeleteClick}
          title={isPendingDelete ? 'Confirm delete connection' : 'Delete connection'}
          aria-label={isPendingDelete ? 'Confirm delete connection' : 'Delete connection'}
        >
          <CloseIcon width={12} height={12} aria-hidden />
        </button>
      </EdgeLabelRenderer>
    </>
  );
});
