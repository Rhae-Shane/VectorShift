import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from '../src/submit';
import { useStore } from '../src/store';
import { parsePipeline } from '../src/services/pipelineService';
import { BACKEND_STATUS_EVENT } from '../src/utils/backendStatusEvents';
import { SUBMIT_SUCCESS_MS } from '../src/constants/canvas';

jest.mock('../src/services/pipelineService', () => ({
  parsePipeline: jest.fn(),
  PipelineServiceError: class PipelineServiceError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = 'PipelineServiceError';
      this.status = status;
    }
  },
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

  it('is disabled when the canvas has no nodes', () => {
    useStore.setState({ nodes: [], edges: [], nodeIDs: {} });

    render(<SubmitButton />);

    expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled();
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
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByText('Pipeline Analysis')).toBeInTheDocument();
      },
      { timeout: SUBMIT_SUCCESS_MS + 500 }
    );
  });

  it('shows a brief success check before opening the result modal', async () => {
    mockParsePipeline.mockResolvedValue({
      num_nodes: 1,
      num_edges: 0,
      is_dag: true,
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      },
      { timeout: SUBMIT_SUCCESS_MS + 500 }
    );
  });

  it('opens ResultModal with analysis on success', async () => {
    mockParsePipeline.mockResolvedValue({
      num_nodes: 2,
      num_edges: 1,
      is_dag: true,
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      },
      { timeout: SUBMIT_SUCCESS_MS + 1000 }
    );

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

  it('emits a backend status banner event on network failure', async () => {
    const handler = jest.fn();
    window.addEventListener(BACKEND_STATUS_EVENT, handler);

    mockParsePipeline.mockRejectedValue(new TypeError('Failed to fetch'));

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(handler).toHaveBeenCalled();
    });

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.title).toMatch(/Unable to connect/i);
    expect(event.detail.message).toMatch(/uvicorn/i);

    window.removeEventListener(BACKEND_STATUS_EVENT, handler);
  });
});
