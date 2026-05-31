import type { NodeProps } from 'reactflow';
import type { PipelineNodeData } from '../../src/types/nodes';

export const makeNodeProps = (
  partial: Partial<NodeProps<PipelineNodeData>> = {}
): NodeProps<PipelineNodeData> =>
  ({
    id: 'node-1',
    type: 'test',
    data: { id: 'node-1', nodeType: 'test' },
    selected: false,
    zIndex: 0,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    ...partial,
  }) as NodeProps<PipelineNodeData>;

export const getHandleIds = (): string[] =>
  Array.from(document.querySelectorAll('.react-flow__handle'))
    .map((el) => el.getAttribute('data-handleid'))
    .filter((id): id is string => Boolean(id));
