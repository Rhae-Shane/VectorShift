import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AnimatedModal } from './AnimatedModal';
import { PressableButton } from './PressableButton';
import { parsePipelineImport } from '../utils/pipelineImportExport';
import { fadeUpTransition, reducedMotionTransition, slideUpVariants } from '../utils/motion';

export interface PipelineImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (raw: string) => string | null;
}

export const PipelineImportModal = ({
  open,
  onClose,
  onImport,
}: PipelineImportModalProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

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
    <AnimatedModal
      open={open}
      onClose={onClose}
      panelClassName="vs-modal vs-modal--import"
      labelledBy="import-modal-title"
    >
      <div className="vs-modal__header">
        <h2 id="import-modal-title" className="vs-modal__title">
          Import workflow
        </h2>
        <PressableButton
          className="vs-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </PressableButton>
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
        <AnimatePresence>
          {error ? (
            <motion.p
              key="import-error"
              className="vs-modal__error-text"
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="vs-modal__footer">
        <PressableButton
          className="vs-btn vs-btn--secondary"
          onClick={onClose}
        >
          Cancel
        </PressableButton>
        <PressableButton
          className="vs-btn vs-btn--submit"
          onClick={handleImport}
          disabled={!value.trim()}
        >
          Import
        </PressableButton>
      </div>
    </AnimatedModal>
  );
};
