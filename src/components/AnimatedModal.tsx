import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  fadeUpTransition,
  modalOverlayVariants,
  modalPanelVariants,
  reducedMotionTransition,
} from '../utils/motion';

export interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  labelledBy?: string;
}

export const AnimatedModal = ({
  open,
  onClose,
  children,
  panelClassName = 'vs-modal',
  labelledBy,
}: AnimatedModalProps) => {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    containerRef: panelRef,
    active: open,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-overlay"
          className="vs-modal-overlay"
          onClick={onClose}
          role="presentation"
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        >
          <motion.div
            ref={panelRef}
            className={panelClassName}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onClick={stopPropagation}
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
