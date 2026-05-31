import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';
import { Icon } from './Icon';
import { PressableButton } from './PressableButton';
import { fadeUpTransition, reducedMotionTransition } from '../utils/motion';

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  return (
    <PressableButton
      className="vs-navbar__icon-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          className="vs-theme-toggle__icon"
          initial={reduceMotion ? false : { rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { rotate: 90, opacity: 0, scale: 0.8 }}
          transition={transition}
          style={{ display: 'flex' }}
        >
          <Icon icon={isDark ? FiSun : FiMoon} width={16} height={16} />
        </motion.span>
      </AnimatePresence>
    </PressableButton>
  );
};
