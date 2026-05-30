import type { PersistedPipelineSlice } from './pipelinePersistence';

export const MAX_PIPELINE_HISTORY = 50;
export const FIELD_EDIT_HISTORY_DEBOUNCE_MS = 800;

export const clonePipelineSlice = (
  slice: PersistedPipelineSlice
): PersistedPipelineSlice => ({
  nodes: JSON.parse(JSON.stringify(slice.nodes)),
  edges: JSON.parse(JSON.stringify(slice.edges)),
  nodeIDs: { ...slice.nodeIDs },
});

export const trimHistory = (
  past: PersistedPipelineSlice[]
): PersistedPipelineSlice[] => {
  if (past.length <= MAX_PIPELINE_HISTORY) return past;
  return past.slice(past.length - MAX_PIPELINE_HISTORY);
};
