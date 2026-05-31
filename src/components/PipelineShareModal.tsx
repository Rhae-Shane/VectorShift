import { useCallback, useMemo, useState } from 'react';
import { AnimatedModal } from './AnimatedModal';
import { useStore } from '../store';
import { serializePipelineExport } from '../utils/pipelineImportExport';

export interface PipelineShareModalProps {
  open: boolean;
  onClose: () => void;
}

export const PipelineShareModal = ({ open, onClose }: PipelineShareModalProps) => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const nodeIDs = useStore((s) => s.nodeIDs);
  const [copied, setCopied] = useState(false);

  const exportJson = useMemo(
    () => serializePipelineExport({ nodes, edges, nodeIDs }),
    [nodes, edges, nodeIDs]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this workflow JSON:', exportJson);
    }
  }, [exportJson]);

  return (
    <AnimatedModal
      open={open}
      onClose={onClose}
      panelClassName="vs-modal vs-modal--import"
      labelledBy="share-modal-title"
    >
      <div className="vs-modal__header">
        <h2 id="share-modal-title" className="vs-modal__title">
          Share workflow
        </h2>
        <button
          type="button"
          className="vs-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="vs-modal__body">
        <div className="vs-share-modal__steps">
          <p className="vs-import-modal__hint">
            Share your workflow by copying the JSON below and sending it to
            someone else. They can paste it into <strong>Import</strong> to
            restore the full canvas.
          </p>
          <ol className="vs-share-modal__list">
            <li>
              Click <strong>Copy JSON</strong> below (or select the text
              manually).
            </li>
            <li>Send the JSON via chat, email, or any text channel.</li>
            <li>
              On another session, open <strong>Import</strong>, paste the JSON,
              and click <strong>Import</strong>.
            </li>
          </ol>
        </div>

        <p className="vs-share-modal__meta">
          {nodes.length} node{nodes.length === 1 ? '' : 's'}, {edges.length}{' '}
          edge{edges.length === 1 ? '' : 's'} — includes node positions, field
          values, and connections.
        </p>

        <textarea
          className="vs-import-modal__textarea vs-import-modal__textarea--readonly"
          value={exportJson}
          readOnly
          spellCheck={false}
          rows={10}
          aria-label="Workflow export JSON"
        />
      </div>

      <div className="vs-modal__footer">
        <button
          type="button"
          className="vs-btn vs-btn--secondary"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="vs-btn vs-btn--submit"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
    </AnimatedModal>
  );
};
