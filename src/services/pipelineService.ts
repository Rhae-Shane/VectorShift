import type { Edge, Node } from 'reactflow';
import type { PipelineNodeData } from '../types/nodes';
import type { PipelineParseErrorBody, PipelineParseResponse } from '../types/api';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8000';

export class PipelineServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'PipelineServiceError';
    this.status = status;
  }
}

export async function parsePipeline(params: {
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
}): Promise<PipelineParseResponse> {
  const response = await fetch(`${API_URL}/pipelines/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes: params.nodes, edges: params.edges }),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as PipelineParseErrorBody;
    const message =
      typeof detail.detail === 'string'
        ? detail.detail
        : `Request failed (${response.status})`;
    throw new PipelineServiceError(message, response.status);
  }

  return (await response.json()) as PipelineParseResponse;
}

