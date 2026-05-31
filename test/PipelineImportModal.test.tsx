import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PipelineImportModal } from '../src/components/PipelineImportModal';
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

describe('PipelineImportModal', () => {
  it('disables Import when textarea is empty', () => {
    render(
      <PipelineImportModal open onClose={jest.fn()} onImport={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('shows validation error for invalid JSON', async () => {
    render(
      <PipelineImportModal open onClose={jest.fn()} onImport={jest.fn()} />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '{ not valid json' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
  });

  it('calls onImport and onClose for valid export JSON', () => {
    const onClose = jest.fn();
    const onImport = jest.fn().mockReturnValue(null);
    const json = serializePipelineExport(samplePipeline);

    render(
      <PipelineImportModal open onClose={onClose} onImport={onImport} />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: json } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onImport).toHaveBeenCalledWith(json);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows store-level import errors from onImport', async () => {
    const onImport = jest.fn().mockReturnValue('Import failed in store');

    render(
      <PipelineImportModal
        open
        onClose={jest.fn()}
        onImport={onImport}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: serializePipelineExport(samplePipeline) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(screen.getByText('Import failed in store')).toBeInTheDocument();
    });
  });

  it('clears validation error when user edits the textarea', async () => {
    render(
      <PipelineImportModal open onClose={jest.fn()} onImport={jest.fn()} />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{ bad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });

    fireEvent.change(textarea, { target: { value: '{ bad ' } });

    await waitFor(() => {
      expect(screen.queryByText(/Invalid JSON/i)).not.toBeInTheDocument();
    });
  });
});
