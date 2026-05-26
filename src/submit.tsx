import { useState } from 'react';
import { useStore } from './store';
import { ResultModal } from './components/ResultModal';
import type { PipelineParseResponse } from './types/api';
import { parsePipeline } from './services/pipelineService';

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
      const data = await parsePipeline({ nodes, edges });
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
