import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { useStore } from './store';
import { ResultModal } from './components/ResultModal';
import { PressableButton } from './components/PressableButton';
import type { PipelineParseResponse } from './types/api';
import { parsePipeline } from './services/pipelineService';
import { fadeUpTransition, reducedMotionTransition } from './utils/motion';
import { Icon } from './components/Icon';

export interface SubmitButtonProps {
  className?: string;
  label?: string;
}

export const SubmitButton = ({
  className = 'vs-btn vs-btn--submit',
  label = 'Submit',
}: SubmitButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

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
      <PressableButton
        className={className}
        onClick={handleSubmit}
        disabled={loading}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              className="vs-submit-btn__content"
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={transition}
            >
              <motion.span
                className="vs-submit-btn__spinner"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={
                  reduceMotion
                    ? undefined
                    : { repeat: Infinity, duration: 0.75, ease: 'linear' }
                }
              >
                <Icon icon={FiLoader} width={14} height={14} aria-hidden />
              </motion.span>
              Analyzing…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={transition}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </PressableButton>

      <ResultModal result={result} error={error} onClose={handleClose} />
    </>
  );
};
