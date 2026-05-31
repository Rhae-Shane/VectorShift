import type { CSSProperties } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore, type StoreState } from '../store';
import { shallow } from 'zustand/shallow';

const selector = (state: StoreState) => state.edges;

export interface NodeHandleProps {
  nodeId: string;
  type: 'source' | 'target';
  position: Position;
  handleId: string;
  color: string;
  style?: CSSProperties;
}

const isHandleConnected = (
  nodeId: string,
  handleId: string,
  type: 'source' | 'target',
  edges: StoreState['edges']
): boolean =>
  edges.some((edge) => {
    if (type === 'source') {
      return edge.source === nodeId && edge.sourceHandle === handleId;
    }
    return edge.target === nodeId && edge.targetHandle === handleId;
  });

export const NodeHandle = ({
  nodeId,
  type,
  position,
  handleId,
  color,
  style,
}: NodeHandleProps) => {
  const edges = useStore(selector, shallow);
  const connected = isHandleConnected(nodeId, handleId, type, edges);

  const className = [
    'vs-handle',
    `vs-handle--${color}`,
    connected ? 'vs-handle--connected' : 'vs-handle--idle',
  ].join(' ');

  return (
    <Handle
      type={type}
      position={position}
      id={handleId}
      style={style}
      className={className}
    />
  );
};
