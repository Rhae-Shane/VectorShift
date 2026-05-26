import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow';
import type { PipelineNodeData } from './types/nodes';

export type PipelineNode = Node<PipelineNodeData>;

export interface StoreState {
  nodes: PipelineNode[];
  edges: Edge[];
  nodeIDs: Record<string, number>;
  pendingDeleteEdgeId: string | null;
  getNodeID: (type: string) => string;
  addNode: (node: PipelineNode) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  handleEdgeClick: (edgeId: string) => void;
  clearPendingEdgeDelete: () => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeField: (
    nodeId: string,
    fieldName: string,
    fieldValue: unknown
  ) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  pendingDeleteEdgeId: null,

  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      pendingDeleteEdgeId: null,
    });
  },

  removeEdge: (edgeId) => {
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      pendingDeleteEdgeId: null,
    });
  },

  handleEdgeClick: (edgeId) => {
    const pending = get().pendingDeleteEdgeId;
    if (pending === edgeId) {
      get().removeEdge(edgeId);
      return;
    }
    set({ pendingDeleteEdgeId: edgeId });
  },

  clearPendingEdgeDelete: () => {
    if (get().pendingDeleteEdgeId !== null) {
      set({ pendingDeleteEdgeId: null });
    }
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.Arrow,
            height: 20,
            width: 20,
          },
        },
        get().edges
      ),
    });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== nodeId) return node;
        return {
          ...node,
          data: { ...node.data, [fieldName]: fieldValue },
        };
      }),
    });
  },
}));
