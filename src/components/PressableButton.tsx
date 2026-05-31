import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { pressTransition } from '../utils/motion';

/** Props shared by native buttons and motion.button with incompatible handlers. */
type MotionConflictKeys = keyof Pick<
  HTMLMotionProps<'button'>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export interface PressableButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictKeys> {
  children: ReactNode;
  /** Disable hover/tap scale (e.g. drag sources). */
  noScale?: boolean;
}

export const PressableButton = ({
  children,
  className,
  disabled,
  noScale = false,
  type = 'button',
  ...rest
}: PressableButtonProps) => {
  const reduceMotion = useReducedMotion();
  const interactive = !reduceMotion && !noScale && !disabled;

  return (
    <motion.button
      type={type}
      className={className}
      disabled={disabled}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      transition={pressTransition}
      {...rest}
    >
      {children}
    </motion.button>
  );
};
