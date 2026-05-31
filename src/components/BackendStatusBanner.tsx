import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiAlertTriangle, FiX, FiWifi, FiWifiOff } from 'react-icons/fi';
import { Icon } from './Icon';
import { PressableButton } from './PressableButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  BACKEND_STATUS_EVENT,
  clearBackendStatus,
  type BackendStatusPayload,
} from '../utils/backendStatusEvents';
import { fadeUpTransition, reducedMotionTransition, slideUpVariants } from '../utils/motion';
import '../styles/backend-status.css';

export const BackendStatusBanner = () => {
  const [status, setStatus] = useState<BackendStatusPayload | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isOnline = useOnlineStatus();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? reducedMotionTransition : fadeUpTransition;

  const dismiss = useCallback(() => {
    setDismissed(true);
    setStatus(null);
    clearBackendStatus();
  }, []);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<BackendStatusPayload | null>).detail;
      setStatus(detail ?? null);
      setDismissed(false);
    };

    window.addEventListener(BACKEND_STATUS_EVENT, onStatus as EventListener);
    return () =>
      window.removeEventListener(BACKEND_STATUS_EVENT, onStatus as EventListener);
  }, []);

  useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  const showOfflineHint = !isOnline;
  const visible = !dismissed && (status !== null || showOfflineHint);

  const title = showOfflineHint
    ? 'You appear to be offline'
    : status?.title ?? '';
  const message = showOfflineHint
    ? 'Pipeline analysis needs a network connection. Reconnect, then try Submit again.'
    : status?.message ?? '';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="backend-status-banner"
          className={`vs-backend-banner${
            showOfflineHint ? ' vs-backend-banner--offline' : ''
          }`}
          role="alert"
          aria-live="polite"
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        >
          <span className="vs-backend-banner__icon" aria-hidden="true">
            {showOfflineHint ? (
              <Icon icon={FiWifiOff} width={18} height={18} />
            ) : (
              <Icon icon={FiAlertTriangle} width={18} height={18} />
            )}
          </span>
          <div className="vs-backend-banner__body">
            <p className="vs-backend-banner__title">{title}</p>
            <p className="vs-backend-banner__message">{message}</p>
          </div>
          {showOfflineHint ? (
            <span className="vs-backend-banner__hint" aria-hidden="true">
              <Icon icon={FiWifi} width={16} height={16} />
            </span>
          ) : null}
          <PressableButton
            type="button"
            className="vs-backend-banner__close"
            onClick={dismiss}
            aria-label="Dismiss connection notice"
          >
            <Icon icon={FiX} width={16} height={16} />
          </PressableButton>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
