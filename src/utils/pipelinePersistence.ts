import type { Edge } from 'reactflow';
import type { PipelineNode } from '../store';

export const PIPELINE_STORAGE_KEY = 'vs-pipeline-state';
export const PIPELINE_VIEWPORT_KEY = 'vs-pipeline-viewport';

export interface PersistedViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface PersistedPipelineSlice {
  nodes: PipelineNode[];
  edges: Edge[];
  nodeIDs: Record<string, number>;
}

/** Rebuild ID counters from existing node ids (e.g. customInput-3 → 3). */
export const deriveNodeIDs = (nodes: PipelineNode[]): Record<string, number> => {
  const ids: Record<string, number> = {};

  for (const node of nodes) {
    const match = /^(.+)-(\d+)$/.exec(node.id);
    if (!match) continue;

    const type = match[1];
    const n = parseInt(match[2], 10);
    if (!Number.isNaN(n)) {
      ids[type] = Math.max(ids[type] ?? 0, n);
    }
  }

  return ids;
};

export const mergePersistedPipeline = (
  persisted: Partial<PersistedPipelineSlice> | undefined,
  current: PersistedPipelineSlice
): PersistedPipelineSlice => {
  if (!persisted?.nodes?.length && !persisted?.edges?.length) {
    return {
      nodes: persisted?.nodes ?? current.nodes,
      edges: persisted?.edges ?? current.edges,
      nodeIDs: persisted?.nodeIDs ?? current.nodeIDs,
    };
  }

  const nodes = persisted.nodes ?? [];
  const edges = persisted.edges ?? [];
  const derived = deriveNodeIDs(nodes);
  const nodeIDs = { ...derived };

  for (const [type, n] of Object.entries(persisted.nodeIDs ?? {})) {
    nodeIDs[type] = Math.max(nodeIDs[type] ?? 0, n);
  }

  return { nodes, edges, nodeIDs };
};

export const loadViewport = (): PersistedViewport | null => {
  try {
    const raw = localStorage.getItem(PIPELINE_VIEWPORT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedViewport;
    if (
      typeof parsed.x === 'number' &&
      typeof parsed.y === 'number' &&
      typeof parsed.zoom === 'number'
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export const saveViewport = (viewport: PersistedViewport) => {
  try {
    localStorage.setItem(PIPELINE_VIEWPORT_KEY, JSON.stringify(viewport));
  } catch {
    /* ignore */
  }
};
