import type { Edge } from 'reactflow';
import type { PipelineNode } from '../store';
import {
  deriveNodeIDs,
  mergePersistedPipeline,
  type PersistedPipelineSlice,
} from './pipelinePersistence';

export const PIPELINE_EXPORT_VERSION = 1;

export interface PipelineExportPayload extends PersistedPipelineSlice {
  version: typeof PIPELINE_EXPORT_VERSION;
}

export type PipelineImportResult =
  | { ok: true; pipeline: PersistedPipelineSlice }
  | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeNode = (node: PipelineNode): PipelineNode => ({
  ...node,
  selected: false,
  dragging: false,
  data: {
    ...node.data,
    id: node.data?.id ?? node.id,
  },
});

const sanitizeEdge = (edge: Edge): Edge => ({
  ...edge,
  selected: false,
});

export const buildPipelineExport = (
  slice: PersistedPipelineSlice
): PipelineExportPayload => ({
  version: PIPELINE_EXPORT_VERSION,
  nodes: slice.nodes.map(sanitizeNode),
  edges: slice.edges.map(sanitizeEdge),
  nodeIDs: { ...slice.nodeIDs },
});

export const serializePipelineExport = (
  slice: PersistedPipelineSlice
): string => JSON.stringify(buildPipelineExport(slice), null, 2);

export const parsePipelineImport = (raw: string): PipelineImportResult => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Paste a workflow JSON export to import.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: 'Invalid JSON. Copy the full export from Share.' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: 'Export must be a JSON object.' };
  }

  if (!Array.isArray(parsed.nodes)) {
    return { ok: false, error: 'Export is missing a nodes array.' };
  }

  if (!Array.isArray(parsed.edges)) {
    return { ok: false, error: 'Export is missing an edges array.' };
  }

  const nodes: PipelineNode[] = [];
  for (let i = 0; i < parsed.nodes.length; i += 1) {
    const item = parsed.nodes[i];
    if (!isRecord(item)) {
      return { ok: false, error: `Node at index ${i} is invalid.` };
    }

    const id = item.id;
    const position = item.position;
    if (typeof id !== 'string' || !id) {
      return { ok: false, error: `Node at index ${i} is missing an id.` };
    }
    if (
      !isRecord(position) ||
      typeof position.x !== 'number' ||
      typeof position.y !== 'number'
    ) {
      return { ok: false, error: `Node "${id}" is missing a valid position.` };
    }
    if (!isRecord(item.data)) {
      return { ok: false, error: `Node "${id}" is missing data.` };
    }

    const type = typeof item.type === 'string' ? item.type : 'customInput';

    nodes.push(
      sanitizeNode({
        ...(item as PipelineNode),
        id,
        type,
        position: { x: position.x, y: position.y },
        data: {
          ...item.data,
          id: (item.data.id as string) ?? id,
          nodeType: (item.data.nodeType as string) ?? type,
        },
      })
    );
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: Edge[] = [];

  for (let i = 0; i < parsed.edges.length; i += 1) {
    const item = parsed.edges[i];
    if (!isRecord(item)) {
      return { ok: false, error: `Edge at index ${i} is invalid.` };
    }

    const id = item.id;
    const source = item.source;
    const target = item.target;
    if (typeof id !== 'string' || !id) {
      return { ok: false, error: `Edge at index ${i} is missing an id.` };
    }
    if (typeof source !== 'string' || typeof target !== 'string') {
      return { ok: false, error: `Edge "${id}" is missing source or target.` };
    }
    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      return {
        ok: false,
        error: `Edge "${id}" references nodes that are not in the export.`,
      };
    }

    edges.push(
      sanitizeEdge({
        ...(item as Edge),
        id,
        source,
        target,
      })
    );
  }

  const nodeIDs: Record<string, number> = isRecord(parsed.nodeIDs)
    ? Object.fromEntries(
        Object.entries(parsed.nodeIDs).flatMap(([key, value]) =>
          typeof value === 'number' && Number.isFinite(value)
            ? [[key, value]]
            : []
        )
      )
    : deriveNodeIDs(nodes);

  const pipeline = mergePersistedPipeline(
    { nodes, edges, nodeIDs },
    { nodes: [], edges: [], nodeIDs: {} }
  );

  if (pipeline.nodes.length === 0) {
    return { ok: false, error: 'Export contains no nodes.' };
  }

  return { ok: true, pipeline };
};
