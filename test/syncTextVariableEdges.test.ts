import {
  findNodeByVariableName,
  getNodeVariableName,
  syncTextVariableEdges,
} from '../src/utils/syncTextVariableEdges';
import type { PipelineNode } from '../src/store';

const inputNode = (id: string, inputName: string): PipelineNode => ({
  id,
  type: 'customInput',
  position: { x: 0, y: 0 },
  data: {
    id,
    nodeType: 'customInput',
    inputName,
    inputType: 'Text',
  },
});

const textNode = (id: string, text: string): PipelineNode => ({
  id,
  type: 'text',
  position: { x: 200, y: 0 },
  data: { id, nodeType: 'text', text },
});

describe('getNodeVariableName', () => {
  it('reads inputName from input nodes', () => {
    expect(getNodeVariableName(inputNode('customInput-1', 'my_input'))).toBe(
      'my_input'
    );
  });
});

describe('findNodeByVariableName', () => {
  it('finds a node by its display name', () => {
    const nodes = [inputNode('customInput-1', 'node name')];
    expect(findNodeByVariableName(nodes, 'node name')?.id).toBe('customInput-1');
  });

  it('trims whitespace in the variable name', () => {
    const nodes = [inputNode('customInput-1', 'node name')];
    expect(findNodeByVariableName(nodes, '  node name  ')?.id).toBe(
      'customInput-1'
    );
  });
});

describe('syncTextVariableEdges', () => {
  it('creates an edge from a named node to the text variable handle', () => {
    const nodes = [
      inputNode('customInput-1', 'node name'),
      textNode('text-1', 'Hello {{node name}}'),
    ];

    const edges = syncTextVariableEdges(nodes, [], 'text-1', 'Hello {{node name}}');

    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: 'customInput-1',
      sourceHandle: 'customInput-1-value',
      target: 'text-1',
      targetHandle: 'text-1-node name',
      type: 'smoothstep',
    });
  });

  it('removes edges for variables no longer present in the text', () => {
    const nodes = [
      inputNode('customInput-1', 'old'),
      inputNode('customInput-2', 'keep'),
      textNode('text-1', '{{keep}}'),
    ];
    const existing = syncTextVariableEdges(
      [
        inputNode('customInput-1', 'old'),
        inputNode('customInput-2', 'keep'),
        textNode('text-1', '{{old}} {{keep}}'),
      ],
      [],
      'text-1',
      '{{old}} {{keep}}'
    );

    const edges = syncTextVariableEdges(nodes, existing, 'text-1', '{{keep}}');

    expect(edges).toHaveLength(1);
    expect(edges[0].targetHandle).toBe('text-1-keep');
  });

  it('does not duplicate an existing matching edge', () => {
    const nodes = [
      inputNode('customInput-1', 'input'),
      textNode('text-1', '{{input}}'),
    ];
    const first = syncTextVariableEdges(nodes, [], 'text-1', '{{input}}');
    const second = syncTextVariableEdges(nodes, first, 'text-1', '{{input}}');

    expect(second).toHaveLength(1);
    expect(second[0].id).toBe(first[0].id);
  });
});
