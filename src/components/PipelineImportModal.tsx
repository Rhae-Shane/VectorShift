import { useCallback, useState, type MouseEvent } from 'react';
import { parsePipelineImport } from '../utils/pipelineImportExport';

export interface PipelineImportModalProps {
  onClose: () => void;
  onImport: (raw: string) => string | null;
}

export const PipelineImportModal = ({
  onClose,
  onImport,
}: PipelineImportModalProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  const handleImport = useCallback(() => {
    const parsed = parsePipelineImport(value);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    const importError = onImport(value);
    if (importError) {
      setError(importError);
      return;
    }

    onClose();
  }, [onClose, onImport, value]);

  return (
    <div
      className="vs-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="vs-modal vs-modal--import"
        role="dialog"
        aria-labelledby="import-modal-title"
        aria-modal="true"
        onClick={stopPropagation}
      >
        <div className="vs-modal__header">
          <h2 id="import-modal-title" className="vs-modal__title">
            Import workflow
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
          <p className="vs-import-modal__hint">
            Paste the JSON copied from Share to restore the full workflow.
          </p>
          <textarea
            className="vs-import-modal__textarea"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder='{"version":1,"nodes":[...],"edges":[...]}'
            spellCheck={false}
            rows={12}
            autoFocus
          />
          {error ? <p className="vs-modal__error-text">{error}</p> : null}
        </div>

        <div className="vs-modal__footer">
          <button
            type="button"
            className="vs-btn vs-btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="vs-btn vs-btn--submit"
            onClick={handleImport}
            disabled={!value.trim()}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
