export interface PipelineParseResponse {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
}

export interface PipelineParseErrorBody {
  detail?: string;
}
