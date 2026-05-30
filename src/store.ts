import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
import {
  clonePipelineSlice,
  FIELD_EDIT_HISTORY_DEBOUNCE_MS,
  trimHistory,
} from './utils/pipelineHistory';
import {
  mergePersistedPipeline,
  PIPELINE_STORAGE_KEY,
  type PersistedPipelineSlice,
} from './utils/pipelinePersistence';
import { parsePipelineImport } from './utils/pipelineImportExport';

export type PipelineNode = Node<PipelineNodeData>;

export interface StoreState {
  nodes: PipelineNode[];
  edges: Edge[];
  nodeIDs: Record<string, number>;
  pendingDeleteEdgeId: string | null;
  past: PersistedPipelineSlice[];
  future: PersistedPipelineSlice[];
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
  clearPipeline: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  duplicateSelectedNodes: () => void;
  removeSelectedNodes: () => void;
  selectAllNodes: () => void;
  clearNodeSelection: () => void;
  importPipeline: (raw: string) => string | null;
}

const emptyPipeline: PersistedPipelineSlice = {
  nodes: [],
  edges: [],
  nodeIDs: {},
};

let isApplyingHistory = false;
let fieldEditSessionKey: string | null = null;
let fieldEditSessionTimer: ReturnType<typeof setTimeout> | null = null;

const snapshotFromState = (state: StoreState): PersistedPipelineSlice =>
  clonePipelineSlice({
    nodes: state.nodes,
    edges: state.edges,
    nodeIDs: state.nodeIDs,
  });

const resetFieldEditSession = () => {
  fieldEditSessionKey = null;
  if (fieldEditSessionTimer) {
    clearTimeout(fieldEditSessionTimer);
    fieldEditSessionTimer = null;
  }
};

const beginFieldEditSession = (get: () => StoreState, sessionKey: string) => {
  if (fieldEditSessionKey === sessionKey) return;

  resetFieldEditSession();
  fieldEditSessionKey = sessionKey;
  get().pushHistory();
  fieldEditSessionTimer = setTimeout(() => {
    fieldEditSessionKey = null;
    fieldEditSessionTimer = null;
  }, FIELD_EDIT_HISTORY_DEBOUNCE_MS);
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},
      pendingDeleteEdgeId: null,
      past: [],
      future: [],

      pushHistory: () => {
        if (isApplyingHistory) return;

        const snapshot = snapshotFromState(get());
        set({
          past: trimHistory([...get().past, snapshot]),
          future: [],
        });
      },

      undo: () => {
        const { past } = get();
        if (past.length === 0) return;

        isApplyingHistory = true;
        resetFieldEditSession();

        try {
          const previous = past[past.length - 1];
          const current = snapshotFromState(get());

          set({
            ...clonePipelineSlice(previous),
            past: past.slice(0, -1),
            future: [current, ...get().future],
            pendingDeleteEdgeId: null,
          });
        } finally {
          isApplyingHistory = false;
        }
      },

      redo: () => {
        const { future } = get();
        if (future.length === 0) return;

        isApplyingHistory = true;
        resetFieldEditSession();

        try {
          const next = future[0];
          const current = snapshotFromState(get());

          set({
            ...clonePipelineSlice(next),
            past: trimHistory([...get().past, current]),
            future: future.slice(1),
            pendingDeleteEdgeId: null,
          });
        } finally {
          isApplyingHistory = false;
        }
      },

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
        get().pushHistory();
        set({
          nodes: [...get().nodes, node],
        });
      },

      removeNode: (nodeId) => {
        get().pushHistory();
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
          pendingDeleteEdgeId: null,
        });
      },

      removeEdge: (edgeId) => {
        get().pushHistory();
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
        const removedIds = changes
          .filter((change): change is NodeChange & { type: 'remove'; id: string } =>
            change.type === 'remove'
          )
          .map((change) => change.id);

        if (removedIds.length > 0) {
          get().pushHistory();
        }

        const removedSet = new Set(removedIds);
        const nextNodes = applyNodeChanges(changes, get().nodes);

        if (removedSet.size > 0) {
          set({
            nodes: nextNodes,
            edges: get().edges.filter(
              (edge) =>
                !removedSet.has(edge.source) && !removedSet.has(edge.target)
            ),
            pendingDeleteEdgeId: null,
          });
          return;
        }

        set({ nodes: nextNodes });
      },

      onEdgesChange: (changes) => {
        if (changes.some((change) => change.type === 'remove')) {
          get().pushHistory();
        }

        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        get().pushHistory();
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
        beginFieldEditSession(get, `${nodeId}:${fieldName}`);
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

      clearPipeline: () => {
        get().pushHistory();
        set({ ...emptyPipeline, pendingDeleteEdgeId: null });
      },

      duplicateSelectedNodes: () => {
        const selected = get().nodes.filter((node) => node.selected);
        if (selected.length === 0) return;

        get().pushHistory();

        const newNodes = selected.map((node) => {
          const type = node.type || 'customInput';
          const newId = get().getNodeID(type);
          return {
            ...node,
            id: newId,
            position: {
              x: node.position.x + 48,
              y: node.position.y + 48,
            },
            data: {
              ...node.data,
              id: newId,
            },
            selected: true,
          } satisfies PipelineNode;
        });

        set({
          nodes: [
            ...get().nodes.map((node) => ({ ...node, selected: false })),
            ...newNodes,
          ],
        });
      },

      removeSelectedNodes: () => {
        const selectedIds = new Set(
          get()
            .nodes.filter((node) => node.selected)
            .map((node) => node.id)
        );
        if (selectedIds.size === 0) return;

        get().pushHistory();
        set({
          nodes: get().nodes.filter((node) => !selectedIds.has(node.id)),
          edges: get().edges.filter(
            (edge) =>
              !selectedIds.has(edge.source) && !selectedIds.has(edge.target)
          ),
          pendingDeleteEdgeId: null,
        });
      },

      selectAllNodes: () => {
        if (get().nodes.length === 0) return;
        set({
          nodes: get().nodes.map((node) => ({ ...node, selected: true })),
        });
      },

      clearNodeSelection: () => {
        if (!get().nodes.some((node) => node.selected)) return;
        set({
          nodes: get().nodes.map((node) => ({ ...node, selected: false })),
        });
      },

      importPipeline: (raw) => {
        const parsed = parsePipelineImport(raw);
        if (!parsed.ok) return parsed.error;

        get().pushHistory();
        set({
          ...clonePipelineSlice(parsed.pipeline),
          pendingDeleteEdgeId: null,
          future: [],
        });
        return null;
      },
    }),
    {
      name: PIPELINE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedPipelineSlice>;
        const merged = mergePersistedPipeline(persisted, {
          nodes: currentState.nodes,
          edges: currentState.edges,
          nodeIDs: currentState.nodeIDs,
        });

        return {
          ...currentState,
          ...merged,
          past: [],
          future: [],
        };
      },
    }
  )
);

export const selectCanUndo = (state: StoreState) => state.past.length > 0;
export const selectCanRedo = (state: StoreState) => state.future.length > 0;
