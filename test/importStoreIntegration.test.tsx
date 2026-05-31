import { render, screen, fireEvent } from '@testing-library/react';
import { PipelineImportModal } from '../src/components/PipelineImportModal';
import { serializePipelineExport } from '../src/utils/pipelineImportExport';
import { useStore } from '../src/store';
import type { PersistedPipelineSlice } from '../src/utils/pipelinePersistence';

const pipelineWithTextNode: PersistedPipelineSlice = {
  nodes: [
    {
      id: 'text-1',
      type: 'text',
      position: { x: 120, y: 80 },
      data: {
        id: 'text-1',
        nodeType: 'text',
        text: 'Hello {{user}}',
      },
    },
    {
      id: 'customOutput-1',
      type: 'customOutput',
      position: { x: 400, y: 80 },
      data: {
        id: 'customOutput-1',
        nodeType: 'customOutput',
        outputName: 'output_1',
        outputType: 'Text',
        outputValue: '',
        formatOutput: true,
      },
    },
  ],
  edges: [
    {
      id: 'text-1-customOutput-1',
      source: 'text-1',
      target: 'customOutput-1',
      sourceHandle: 'text-1-output',
      targetHandle: 'customOutput-1-value',
    },
  ],
  nodeIDs: { text: 1, customOutput: 1 },
};

describe('Import modal → store integration', () => {
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

  it('loads exported pipeline JSON into the store through the modal', () => {
    const onClose = jest.fn();
    const json = serializePipelineExport(pipelineWithTextNode);

    render(
      <PipelineImportModal
        open
        onClose={onClose}
        onImport={(raw) => useStore.getState().importPipeline(raw)}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: json } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onClose).toHaveBeenCalledTimes(1);

    const { nodes, edges, nodeIDs } = useStore.getState();
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      id: 'text-1',
      type: 'text',
      data: { text: 'Hello {{user}}' },
    });
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceHandle).toBe('text-1-output');
    expect(nodeIDs).toEqual({ text: 1, customOutput: 1 });
  });

  it('leaves the store unchanged when import JSON is invalid', () => {
    useStore.getState().addNode({
      id: 'customInput-1',
      type: 'customInput',
      position: { x: 0, y: 0 },
      data: {
        id: 'customInput-1',
        nodeType: 'customInput',
        inputName: 'input_1',
        inputType: 'Text',
      },
    });

    render(
      <PipelineImportModal
        open
        onClose={jest.fn()}
        onImport={(raw) => useStore.getState().importPipeline(raw)}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '{ broken json' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(useStore.getState().nodes).toHaveLength(1);
    expect(useStore.getState().nodes[0].id).toBe('customInput-1');
    expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
  });
});
