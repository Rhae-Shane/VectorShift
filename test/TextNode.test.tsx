import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { getDefaultNodeData, nodeTypes } from '../src/nodes/nodeRegistry';
import { parseTextVariables } from '../src/utils/textVariables';
import { useStore } from '../src/store';
import { getHandleIds, makeNodeProps } from './utils/reactFlowNodeProps';

jest.mock('reactflow', () => {
  const actual = jest.requireActual('reactflow');
  return {
    ...actual,
    useUpdateNodeInternals: () => jest.fn(),
  };
});

const TextNode = nodeTypes.text;

describe('Text node dynamic handles', () => {
  beforeEach(() => {
    useStore.setState({
      nodes: [
        {
          id: 'text-1',
          type: 'text',
          position: { x: 0, y: 0 },
          data: getDefaultNodeData('text-1', 'text'),
        },
      ],
      edges: [],
      nodeIDs: { text: 1 },
      past: [],
      future: [],
    });
  });

  it('renders a target handle for each parsed variable in default text', () => {
    const defaultText = '{{input}}';
    expect(parseTextVariables(defaultText)).toEqual(['input']);

    render(
      <ReactFlowProvider>
        <TextNode
          {...makeNodeProps({
            id: 'text-1',
            type: 'text',
            data: getDefaultNodeData('text-1', 'text'),
          })}
        />
      </ReactFlowProvider>
    );

    const handleIds = getHandleIds();
    expect(handleIds).toContain('text-1-input');
    expect(handleIds).toContain('text-1-output');
  });

  it('adds new target handles when the user types additional variables', async () => {
    render(
      <ReactFlowProvider>
        <TextNode
          {...makeNodeProps({
            id: 'text-1',
            type: 'text',
            data: getDefaultNodeData('text-1', 'text'),
          })}
        />
      </ReactFlowProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Hello {{name}}, use {{context}} here' },
    });

    await waitFor(() => {
      const variables = parseTextVariables('Hello {{name}}, use {{context}} here');
      expect(variables).toEqual(['name', 'context']);

      const handleIds = getHandleIds();
      expect(handleIds).toContain('text-1-name');
      expect(handleIds).toContain('text-1-context');
      expect(handleIds).toContain('text-1-output');
      expect(handleIds.filter((id) => id.startsWith('text-1-') && id !== 'text-1-output')).toHaveLength(2);
    });
  });

  it('deduplicates handles when the same variable appears multiple times', async () => {
    render(
      <ReactFlowProvider>
        <TextNode
          {...makeNodeProps({
            id: 'text-1',
            type: 'text',
            data: { id: 'text-1', nodeType: 'text', text: '' },
          })}
        />
      </ReactFlowProvider>
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '{{x}} and {{x}} again with {{y}}' },
    });

    await waitFor(() => {
      expect(parseTextVariables('{{x}} and {{x}} again with {{y}}')).toEqual(['x', 'y']);
      const targetHandles = getHandleIds().filter((id) => id !== 'text-1-output');
      expect(targetHandles).toEqual(['text-1-x', 'text-1-y']);
    });
  });
});
