import {
  parsePipeline,
  PipelineServiceError,
} from '../src/services/pipelineService';

describe('parsePipeline', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('posts nodes and edges to the parse endpoint', async () => {
    const mockResponse = {
      num_nodes: 2,
      num_edges: 1,
      is_dag: true,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }) as jest.Mock;

    const nodes = [
      {
        id: 'a',
        type: 'customInput',
        position: { x: 0, y: 0 },
        data: { id: 'a', nodeType: 'customInput' },
      },
    ];
    const edges = [{ id: 'e1', source: 'a', target: 'b' }];

    const result = await parsePipeline({ nodes, edges });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/pipelines\/parse$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
    );
  });

  it('throws PipelineServiceError when the backend responds with an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'Invalid pipeline' }),
    }) as jest.Mock;

    await expect(parsePipeline({ nodes: [], edges: [] })).rejects.toThrow(
      PipelineServiceError
    );
    await expect(parsePipeline({ nodes: [], edges: [] })).rejects.toThrow(
      'Invalid pipeline'
    );
  });
});
