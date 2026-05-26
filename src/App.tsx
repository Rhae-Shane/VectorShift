import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { PipelineNavbar } from './components/PipelineNavbar';
import './styles/theme.css';
import './styles/layout.css';

function App() {
  return (
    <div className="vs-app">
      <PipelineNavbar />

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
