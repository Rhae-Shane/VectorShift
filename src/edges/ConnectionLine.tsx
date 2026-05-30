import { memo } from 'react';
import { getBezierPath, type ConnectionLineComponentProps } from 'reactflow';
import {
  EDGE_CURVATURE,
  EDGE_STROKE,
  EDGE_STROKE_WIDTH,
} from './edgePathConfig';

export const ConnectionLine = memo(function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
    curvature: EDGE_CURVATURE,
  });

  return (
    <g className="vs-connection-line">
      <path
        fill="none"
        stroke={EDGE_STROKE}
        strokeWidth={EDGE_STROKE_WIDTH}
        d={path}
      />
    </g>
  );
});
