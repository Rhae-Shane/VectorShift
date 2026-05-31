import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { useStore } from './store';
import { ResultModal } from './components/ResultModal';
import { PressableButton } from './components/PressableButton';
import { DisabledHoverHint } from './components/DisabledHoverHint';
import type { PipelineParseResponse } from './types/api';
import { parsePipeline } from './services/pipelineService';
import { fadeUpTransition, reducedMotionTransition } from './utils/motion';
import { Icon } from './components/Icon';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { classifySubmitError } from './utils/submitError';
import { showBackendStatus } from './utils/backendStatusEvents';
import { EMPTY_CANVAS_HINT } from './constants/canvas';

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
  const hasNodes = useStore((s) => s.nodes.length > 0);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;
  const isOnline = useOnlineStatus();
  const isDisabled = loading || !hasNodes;

  const handleSubmit = async () => {
    const { nodes, edges } = useStore.getState();
    if (nodes.length === 0) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await parsePipeline({ nodes, edges });
      setResult(data);
    } catch (err) {
      const info = classifySubmitError(err, isOnline);
      if (info.showBanner) {
        showBackendStatus({ title: info.title, message: info.message });
      }
      setError(info.message);
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
      <DisabledHoverHint showHint={!hasNodes} hint={EMPTY_CANVAS_HINT}>
        <PressableButton
          className={className}
          onClick={handleSubmit}
          disabled={isDisabled}
          aria-label={!hasNodes ? 'Submit (add nodes first)' : undefined}
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
      </DisabledHoverHint>

      <ResultModal result={result} error={error} onClose={handleClose} />
    </>
  );
};
