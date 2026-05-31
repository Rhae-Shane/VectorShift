import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { MouseEvent, ReactNode } from 'react';
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
