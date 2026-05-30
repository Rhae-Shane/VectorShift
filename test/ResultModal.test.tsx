import { render, screen, fireEvent } from '@testing-library/react';
import { ResultModal } from '../src/components/ResultModal';

describe('ResultModal', () => {
  it('renders nothing when there is no result or error', () => {
    const { container } = render(
      <ResultModal result={null} error={null} onClose={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('displays pipeline analysis stats', () => {
    render(
      <ResultModal
        result={{ num_nodes: 3, num_edges: 2, is_dag: true }}
        error={null}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Analysis')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      screen.getByText('Valid DAG — pipeline is acyclic')
    ).toBeInTheDocument();
  });

  it('displays an error message when submission fails', () => {
    render(
      <ResultModal
        result={null}
        error="Backend unavailable"
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Pipeline Error')).toBeInTheDocument();
    expect(screen.getByText('Backend unavailable')).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', () => {
    const onClose = jest.fn();

    render(
      <ResultModal
        result={{ num_nodes: 1, num_edges: 0, is_dag: true }}
        error={null}
        onClose={onClose}
      />
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
