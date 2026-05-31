import { addEdge, MarkerType, type Edge, type Node } from 'reactflow';
import type { PipelineNodeData } from '../types/nodes';
import { parseTextVariables } from './textVariables';

type PipelineNode = Node<PipelineNodeData>;

const NAME_FIELDS = ['inputName', 'outputName'] as const;

export const getNodeVariableName = (node: PipelineNode): string | null => {
  for (const field of NAME_FIELDS) {
    const value = node.data[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

export const findNodeByVariableName = (
  nodes: PipelineNode[],
  varName: string,
  excludeNodeId?: string
): PipelineNode | undefined => {
  const normalized = varName.trim();
  if (!normalized) return undefined;

  return nodes.find((node) => {
    if (excludeNodeId && node.id === excludeNodeId) return false;
    const name = getNodeVariableName(node);
    return name !== null && name === normalized;
  });
};

/** Primary source handle suffix per node type (data flowing out to downstream nodes). */
export const getDefaultSourceHandleSuffix = (
  nodeType: string | undefined
): string | null => {
  switch (nodeType) {
    case 'customInput':
      return 'value';
    case 'llm':
      return 'response';
    case 'text':
      return 'output';
    case 'condition':
      return 'true';
    case 'httpRequest':
      return 'response';
    case 'merge':
      return 'merged';
    case 'jsonParse':
      return 'parsed';
    default:
      return null;
  }
};

const textVariableTargetSuffix = (
  textNodeId: string,
  targetHandle: string | null | undefined
): string | null => {
  if (!targetHandle?.startsWith(`${textNodeId}-`)) return null;
  const suffix = targetHandle.slice(textNodeId.length + 1);
  if (suffix === 'output') return null;
  return suffix;
};

export const syncTextVariableEdges = (
  nodes: PipelineNode[],
  edges: Edge[],
  textNodeId: string,
  text: string
): Edge[] => {
  const variables = parseTextVariables(text);
  const variableSet = new Set(variables);

  let nextEdges = edges.filter((edge) => {
    if (edge.target !== textNodeId) return true;
    const suffix = textVariableTargetSuffix(textNodeId, edge.targetHandle);
    if (suffix === null) return true;
    return variableSet.has(suffix);
  });

  for (const varName of variables) {
    const sourceNode = findNodeByVariableName(nodes, varName, textNodeId);
    if (!sourceNode) continue;

    const sourceSuffix = getDefaultSourceHandleSuffix(sourceNode.type);
    if (!sourceSuffix) continue;

    const sourceHandle = `${sourceNode.id}-${sourceSuffix}`;
    const targetHandle = `${textNodeId}-${varName}`;

    const exists = nextEdges.some(
      (edge) =>
        edge.source === sourceNode.id &&
        edge.sourceHandle === sourceHandle &&
        edge.target === textNodeId &&
        edge.targetHandle === targetHandle
    );

    if (exists) continue;

    nextEdges = addEdge(
      {
        source: sourceNode.id,
        sourceHandle,
        target: textNodeId,
        targetHandle,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.Arrow,
          height: 20,
          width: 20,
        },
      },
      nextEdges
    );
  }

  return nextEdges;
};

export const syncAllTextVariableEdges = (
  nodes: PipelineNode[],
  edges: Edge[]
): Edge[] => {
  let nextEdges = edges;
  for (const node of nodes) {
    if (node.type !== 'text') continue;
    const text = node.data.text;
    if (typeof text !== 'string') continue;
    nextEdges = syncTextVariableEdges(nodes, nextEdges, node.id, text);
  }
  return nextEdges;
};
