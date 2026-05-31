import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from '../src/submit';
import { useStore } from '../src/store';
import { parsePipeline } from '../src/services/pipelineService';

jest.mock('../src/services/pipelineService', () => ({
  parsePipeline: jest.fn(),
}));

const mockParsePipeline = parsePipeline as jest.MockedFunction<typeof parsePipeline>;

describe('SubmitButton', () => {
  beforeEach(() => {
    mockParsePipeline.mockReset();
    useStore.setState({
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
      past: [],
      future: [],
    });
  });

  it('shows loading state while submitting', async () => {
    let resolveParse: (value: {
      num_nodes: number;
      num_edges: number;
      is_dag: boolean;
    }) => void;
    mockParsePipeline.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveParse = resolve;
        })
    );

    render(<SubmitButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Analyzing…' })).toBeDisabled();
    });

    resolveParse!({ num_nodes: 1, num_edges: 0, is_dag: true });

    await waitFor(() => {
      expect(screen.getByText('Pipeline Analysis')).toBeInTheDocument();
    });
  });

  it('opens ResultModal with analysis on success', async () => {
    mockParsePipeline.mockResolvedValue({
      num_nodes: 2,
      num_edges: 1,
      is_dag: true,
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(mockParsePipeline).toHaveBeenCalledWith({
      nodes: useStore.getState().nodes,
      edges: useStore.getState().edges,
    });
  });

  it('opens ResultModal with error when submission fails', async () => {
    mockParsePipeline.mockRejectedValue(new Error('Backend unavailable'));

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Pipeline Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Backend unavailable')).toBeInTheDocument();
  });
});
