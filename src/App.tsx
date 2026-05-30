import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { PipelineNavbar } from './components/PipelineNavbar';
import { ToolbarDockLayout } from './components/ToolbarDockLayout';
import { PipelinePreview } from './components/PipelinePreview';
import './styles/theme.css';
import './styles/layout.css';

function App() {
  return (
    <div className="vs-app">
      <PipelineNavbar />

      <ToolbarDockLayout
        renderToolbar={(dockPosition) => (
          <PipelineToolbar dockPosition={dockPosition} />
        )}
        canvas={<PipelineUI />}
      />

      <footer className="vs-footer">
        Drag nodes onto the canvas · Connect handles · Click Submit to analyze
        the pipeline
      </footer>

      <PipelinePreview />
    </div>
  );
}

export default App;
