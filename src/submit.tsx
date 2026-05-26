import { useState } from 'react';
import { useStore } from './store';
import { ResultModal } from './components/ResultModal';
import type { PipelineParseResponse, PipelineParseErrorBody } from './types/api';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8000';

export const SubmitButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const { nodes, edges } = useStore.getState();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        const detail = (await response
          .json()
          .catch(() => ({}))) as PipelineParseErrorBody;
        const message =
          typeof detail.detail === 'string'
            ? detail.detail
            : `Request failed (${response.status})`;
        throw new Error(message);
      }

      const data = (await response.json()) as PipelineParseResponse;
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not reach the backend. Make sure uvicorn is running on port 8000.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        className="vs-btn vs-btn--submit"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Analyzing…' : '▶ Submit'}
      </button>

      <ResultModal result={result} error={error} onClose={handleClose} />
    </>
  );
};
