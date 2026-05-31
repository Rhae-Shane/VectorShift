import { useStore } from '../src/store';
import { serializePipelineExport } from '../src/utils/pipelineImportExport';
import type { PersistedPipelineSlice } from '../src/utils/pipelinePersistence';

const samplePipeline: PersistedPipelineSlice = {
  nodes: [
    {
      id: 'customInput-1',
      type: 'customInput',
      position: { x: 0, y: 0 },
      data: {
        id: 'customInput-1',
        nodeType: 'customInput',
        inputName: 'input_1',
        inputType: 'Text',
      },
    },
  ],
  edges: [],
  nodeIDs: { customInput: 1 },
};

const makeNode = (id: string) => ({
  id,
  type: 'customInput',
  position: { x: 10, y: 20 },
  data: {
    id,
    nodeType: 'customInput',
    inputName: 'input_1',
    inputType: 'Text',
  },
});

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      nodes: [],
      edges: [],
      nodeIDs: {},
      pendingDeleteEdgeId: null,
      past: [],
      future: [],
    });
  });

  describe('undo / redo', () => {
    it('undo restores the previous pipeline after addNode', () => {
      const node = makeNode('customInput-1');
      useStore.getState().addNode(node);

      expect(useStore.getState().nodes).toHaveLength(1);
      expect(useStore.getState().past.length).toBeGreaterThan(0);

      useStore.getState().undo();

      expect(useStore.getState().nodes).toHaveLength(0);
      expect(useStore.getState().future).toHaveLength(1);
    });

    it('redo reapplies an undone change', () => {
      const node = makeNode('customInput-1');
      useStore.getState().addNode(node);
      useStore.getState().undo();

      useStore.getState().redo();

      expect(useStore.getState().nodes).toHaveLength(1);
      expect(useStore.getState().nodes[0].id).toBe('customInput-1');
    });

    it('undo is a no-op when history is empty', () => {
      useStore.getState().undo();
      expect(useStore.getState().nodes).toHaveLength(0);
      expect(useStore.getState().past).toHaveLength(0);
    });
  });

  describe('importPipeline', () => {
    it('replaces the canvas with imported nodes and edges', () => {
      const json = serializePipelineExport(samplePipeline);
      const error = useStore.getState().importPipeline(json);

      expect(error).toBeNull();
      expect(useStore.getState().nodes).toHaveLength(1);
      expect(useStore.getState().nodes[0].id).toBe('customInput-1');
      expect(useStore.getState().nodeIDs).toEqual({ customInput: 1 });
    });

    it('returns an error for invalid JSON without mutating state', () => {
      useStore.getState().addNode(makeNode('customInput-1'));

      const error = useStore.getState().importPipeline('{ broken');

      expect(error).toMatch(/Invalid JSON/i);
      expect(useStore.getState().nodes).toHaveLength(1);
      expect(useStore.getState().nodes[0].id).toBe('customInput-1');
    });

    it('clears redo stack after a successful import', () => {
      useStore.getState().addNode(makeNode('customInput-1'));
      useStore.getState().undo();
      expect(useStore.getState().future).toHaveLength(1);

      const json = serializePipelineExport(samplePipeline);
      useStore.getState().importPipeline(json);

      expect(useStore.getState().future).toHaveLength(0);
    });
  });
});
