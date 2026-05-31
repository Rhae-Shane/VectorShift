import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { createNodeComponent } from '../src/nodes/createNode';
import { buildTextVariableHandles } from '../src/utils/textVariables';
import { useStore } from '../src/store';
import type { NodeDefinition } from '../src/types/nodes';
import { getHandleIds, makeNodeProps } from './utils/reactFlowNodeProps';

jest.mock('reactflow', () => {
  const actual = jest.requireActual('reactflow');
  return {
    ...actual,
    useUpdateNodeInternals: () => jest.fn(),
  };
});

const staticDef: NodeDefinition = {
  type: 'factory-static',
  label: 'Static',
  category: 'logic',
  header: { title: 'Factory Node', accent: 'indigo' },
  fields: [
    {
      kind: 'text',
      name: 'title',
      label: 'Title',
      placeholder: 'Enter title',
      defaultValue: 'Hello',
    },
  ],
  handles: [{ type: 'source', position: 'right', idSuffix: 'out', color: 'indigo' }],
};

const dynamicDef: NodeDefinition = {
  type: 'factory-dynamic',
  label: 'Dynamic',
  category: 'logic',
  header: { title: 'Dynamic Handles', accent: 'purple' },
  fields: [
    {
      kind: 'growingTextarea',
      name: 'text',
      label: 'Template',
      defaultValue: '',
    },
  ],
  handles: [{ type: 'source', position: 'right', idSuffix: 'output', color: 'amber' }],
  getDynamicHandles: (data) =>
    buildTextVariableHandles(typeof data.text === 'string' ? data.text : ''),
};

describe('createNodeComponent', () => {
  beforeEach(() => {
    useStore.setState({
      nodes: [
        {
          id: 'node-1',
          type: 'factory-static',
          position: { x: 0, y: 0 },
          data: { id: 'node-1', nodeType: 'factory-static', title: 'Hello' },
        },
      ],
      edges: [],
      nodeIDs: {},
      past: [],
      future: [],
    });
  });

  it('renders a node from declarative field config', () => {
    const Component = createNodeComponent(staticDef);

    render(
      <ReactFlowProvider>
        <Component
          {...makeNodeProps({
            type: 'factory-static',
            data: { id: 'node-1', nodeType: 'factory-static', title: 'Hello' },
          })}
        />
      </ReactFlowProvider>
    );

    expect(screen.getByText('Factory Node')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
    expect(getHandleIds()).toContain('node-1-out');
  });

  it('merges getDynamicHandles as the growing textarea changes', async () => {
    const Component = createNodeComponent(dynamicDef);

    render(
      <ReactFlowProvider>
        <Component
          {...makeNodeProps({
            type: 'factory-dynamic',
            data: { id: 'node-1', nodeType: 'factory-dynamic', text: '' },
          })}
        />
      </ReactFlowProvider>
    );

    expect(getHandleIds()).toEqual(['node-1-output']);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hi {{user}} from {{ctx}}' },
    });

    await waitFor(() => {
      const ids = getHandleIds();
      expect(ids).toContain('node-1-user');
      expect(ids).toContain('node-1-ctx');
      expect(ids).toContain('node-1-output');
    });
  });
});
