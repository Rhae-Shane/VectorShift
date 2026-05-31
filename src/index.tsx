import React from 'react';
import ReactDOM from 'react-dom/client';
import { initTheme } from './utils/theme';
import { ThemeProvider } from './hooks/useTheme';
import './index.css';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import { AppErrorFallback } from './AppErrorFallback';

initTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary
        FallbackComponent={AppErrorFallback}
        onReset={() => window.location.reload()}
      >
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
