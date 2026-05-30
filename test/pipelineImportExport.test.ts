import {
  buildPipelineExport,
  parsePipelineImport,
  serializePipelineExport,
} from '../src/utils/pipelineImportExport';
import type { PersistedPipelineSlice } from '../src/utils/pipelinePersistence';

const sampleSlice: PersistedPipelineSlice = {
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
    {
      id: 'text-1',
      type: 'text',
      position: { x: 200, y: 0 },
      data: {
        id: 'text-1',
        nodeType: 'text',
        text: '{{input}}',
      },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'customInput-1',
      target: 'text-1',
    },
  ],
  nodeIDs: { customInput: 1, text: 1 },
};

describe('pipelineImportExport', () => {
  it('serializes and parses a valid export round-trip', () => {
    const json = serializePipelineExport(sampleSlice);
    const result = parsePipelineImport(json);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.pipeline.nodes).toHaveLength(2);
    expect(result.pipeline.edges).toHaveLength(1);
    expect(result.pipeline.nodes[1].data.text).toBe('{{input}}');
  });

  it('buildPipelineExport includes version metadata', () => {
    const payload = buildPipelineExport(sampleSlice);
    expect(payload.version).toBe(1);
    expect(payload.nodes.every((node) => node.selected === false)).toBe(true);
  });

  it('rejects empty input', () => {
    const result = parsePipelineImport('   ');
    expect(result).toEqual({
      ok: false,
      error: 'Paste a workflow JSON export to import.',
    });
  });

  it('rejects invalid JSON', () => {
    const result = parsePipelineImport('{not json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Invalid JSON/i);
  });

  it('rejects edges that reference missing nodes', () => {
    const broken = JSON.stringify({
      version: 1,
      nodes: sampleSlice.nodes,
      edges: [{ id: 'bad', source: 'missing', target: 'text-1' }],
      nodeIDs: sampleSlice.nodeIDs,
    });

    const result = parsePipelineImport(broken);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/references nodes/i);
  });
});
