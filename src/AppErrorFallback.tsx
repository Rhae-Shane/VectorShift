import type { FallbackProps } from 'react-error-boundary';

export const AppErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
      <p style={{ color: '#6b7280' }}>
        The UI crashed unexpectedly. You can try reloading the pipeline editor.
      </p>
      <pre
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          overflow: 'auto',
          maxWidth: 900,
        }}
      >
        {message}
      </pre>
      <button
        type="button"
        onClick={resetErrorBoundary}
        style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        Reload editor
      </button>
    </div>
  );
};

