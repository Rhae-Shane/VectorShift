import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import './styles/theme.css';
import './styles/layout.css';
import type { FC, SVGProps } from 'react';
import { FiLayers, FiLayout, FiTrendingUp } from 'react-icons/fi';

const LayersIcon = FiLayers as unknown as FC<SVGProps<SVGSVGElement>>;
const LayoutIcon = FiLayout as unknown as FC<SVGProps<SVGSVGElement>>;
const TrendingIcon = FiTrendingUp as unknown as FC<SVGProps<SVGSVGElement>>;

function App() {
  return (
    <div className="vs-app">
      <header className="vs-header">
        <div className="vs-header__left">
          <nav className="vs-breadcrumb" aria-label="Breadcrumb">
            Projects / <strong>New Project</strong> /{' '}
            <strong>New Workflow</strong>
          </nav>
        </div>

        <nav className="vs-header__tabs" aria-label="Main navigation">
          <button type="button" className="vs-header__tab vs-header__tab--active">
            <LayersIcon style={{ marginRight: 6 }} />
            Workflow
          </button>
          <button type="button" className="vs-header__tab">
            <LayoutIcon style={{ marginRight: 6 }} />
            Interface
          </button>
          <button type="button" className="vs-header__tab">
            <TrendingIcon style={{ marginRight: 6 }} />
            Analytics
          </button>
        </nav>

        <div className="vs-header__actions">
          <SubmitButton />
        </div>
      </header>

      <main className="vs-main">
        <PipelineToolbar />
        <PipelineUI />
      </main>

      <footer className="vs-footer">
        Drag nodes onto the canvas · Connect handles · Click Submit to analyze
        the pipeline
      </footer>
    </div>
  );
}

export default App;
