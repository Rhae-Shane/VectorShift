import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import { AppErrorFallback } from './AppErrorFallback';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onReset={() => window.location.reload()}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
