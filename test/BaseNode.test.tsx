import type { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { BaseNode } from '../src/nodes/BaseNode';
import { useStore } from '../src/store';

const renderBaseNode = (props: Partial<ComponentProps<typeof BaseNode>> = {}) =>
  render(
    <ReactFlowProvider>
      <BaseNode
        id="test-node-1"
        title="Test Node"
        nodeData={{ id: 'test-node-1', nodeType: 'llm' }}
        {...props}
      >
        <p>Node body content</p>
      </BaseNode>
    </ReactFlowProvider>
  );

describe('BaseNode', () => {
  beforeEach(() => {
    useStore.setState({
      nodes: [
        {
          id: 'test-node-1',
          type: 'llm',
          position: { x: 0, y: 0 },
          data: { id: 'test-node-1', nodeType: 'llm' },
        },
      ],
      edges: [],
      nodeIDs: { llm: 1 },
      past: [],
      future: [],
    });
  });

  it('renders title and body content when expanded', () => {
    renderBaseNode();

    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.getByText('Node body content')).toBeInTheDocument();
  });

  it('hides body content when collapsed via header control', async () => {
    renderBaseNode();

    fireEvent.click(screen.getByRole('button', { name: 'Minimize node' }));

    await waitFor(() => {
      expect(screen.queryByText('Node body content')).not.toBeInTheDocument();
    });

    expect(document.querySelector('.vs-node--collapsed')).toBeInTheDocument();
  });

  it('shows an error banner when error prop is set', () => {
    renderBaseNode({ error: 'Invalid configuration' });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Invalid configuration');
    expect(document.querySelector('.vs-node--error')).toBeInTheDocument();
  });

  it('hides error banner when collapsed', async () => {
    renderBaseNode({ error: 'Invalid configuration' });

    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Minimize node' }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
