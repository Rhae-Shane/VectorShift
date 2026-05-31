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

  describe('updateNodeField text variable auto-connect', () => {
    it('connects a text node to an input node when {{name}} matches inputName', () => {
      useStore.setState({
        nodes: [
          makeNode('customInput-1'),
          {
            id: 'text-1',
            type: 'text',
            position: { x: 100, y: 0 },
            data: { id: 'text-1', nodeType: 'text', text: '' },
          },
        ],
        edges: [],
        nodeIDs: { customInput: 1, text: 1 },
        past: [],
        future: [],
      });

      useStore.getState().updateNodeField('customInput-1', 'inputName', 'my_data');
      useStore.getState().updateNodeField('text-1', 'text', 'Result: {{my_data}}');

      const edges = useStore.getState().edges;
      expect(edges).toHaveLength(1);
      expect(edges[0]).toMatchObject({
        source: 'customInput-1',
        sourceHandle: 'customInput-1-value',
        target: 'text-1',
        targetHandle: 'text-1-my_data',
      });
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

  describe('connection feedback', () => {
    it('registers a pulse on both handles when a connection is made', () => {
      useStore.setState({
        nodes: [
          {
            id: 'a',
            type: 'customInput',
            position: { x: 0, y: 0 },
            data: { id: 'a', nodeType: 'customInput' },
          },
          {
            id: 'b',
            type: 'customOutput',
            position: { x: 200, y: 0 },
            data: { id: 'b', nodeType: 'customOutput' },
          },
        ],
      });

      useStore.getState().onConnect({
        source: 'a',
        target: 'b',
        sourceHandle: 'a-value',
        targetHandle: 'b-value',
      });

      const { pulsingHandleKeys, pulsingEdgeId, edges } = useStore.getState();
      expect(edges).toHaveLength(1);
      expect(pulsingEdgeId).toBe(edges[0].id);
      expect(pulsingHandleKeys).toEqual(['a-value', 'b-value']);
      expect(edges[0].animated).toBe(false);
    });

    it('tracks connecting state while dragging', () => {
      useStore.getState().setConnecting(true);
      expect(useStore.getState().isConnecting).toBe(true);
      useStore.getState().setConnecting(false);
      expect(useStore.getState().isConnecting).toBe(false);
    });
  });
});
