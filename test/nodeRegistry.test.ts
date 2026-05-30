import {
  getDefaultNodeData,
  nodeRegistry,
  nodeTypes,
} from '../src/nodes/nodeRegistry';

describe('nodeRegistry', () => {
  it('registers all expected node types including text', () => {
    const types = nodeRegistry.map((entry) => entry.type);

    expect(types).toEqual(
      expect.arrayContaining([
        'customInput',
        'customOutput',
        'llm',
        'text',
        'condition',
        'httpRequest',
        'merge',
        'note',
        'jsonParse',
      ])
    );
    expect(types).toHaveLength(9);
  });

  it('exposes React Flow components for every registry entry', () => {
    for (const entry of nodeRegistry) {
      expect(typeof nodeTypes[entry.type]).toBe('function');
    }
  });

  it('provides default text node data with a starter variable', () => {
    const data = getDefaultNodeData('text-1', 'text');

    expect(data).toMatchObject({
      id: 'text-1',
      nodeType: 'text',
      text: '{{input}}',
    });
  });

  it('provides sensible defaults for input and output nodes', () => {
    expect(getDefaultNodeData('customInput-3', 'customInput')).toMatchObject({
      inputName: 'input_3',
      inputType: 'Text',
    });

    expect(getDefaultNodeData('customOutput-2', 'customOutput')).toMatchObject({
      outputName: 'output_2',
      outputType: 'Text',
    });
  });
});
