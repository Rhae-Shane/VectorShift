import { useEffect, type RefObject } from 'react';
import type { ReactFlowInstance } from 'reactflow';

/** Match React Flow's internal wheel delta for pinch gestures. */
function getPinchZoomDelta(event: WheelEvent): number {
  const boost = 10;
  const modeScale =
    event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002;
  return -event.deltaY * modeScale * boost;
}

function isPinchWheelEvent(event: WheelEvent): boolean {
  // Browsers emit trackpad pinch as wheel + ctrlKey (Windows, macOS, Linux Chromium).
  return event.ctrlKey;
}

/**
 * Pinch-to-zoom on trackpads for non-macOS / when React Flow's built-in path does not run.
 * Uses capture phase so ctrl+wheel pinch is not treated as pan-on-scroll.
 */
export function useTrackpadPinchZoom(
  wrapperRef: RefObject<HTMLDivElement | null>,
  instance: ReactFlowInstance | null,
  enabled: boolean,
  minZoom = 0,
  maxZoom = 3.5
): void {
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !instance || !enabled) return;

    const onWheel = (event: WheelEvent) => {
      if (!isPinchWheelEvent(event)) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('.nowheel')) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const rect = el.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      const zoom = instance.getZoom();
      const pinchDelta = getPinchZoomDelta(event);
      const nextZoom = Math.min(
        maxZoom,
        Math.max(minZoom, zoom * Math.pow(2, pinchDelta))
      );

      if (nextZoom === zoom) return;

      const flowPos = instance.project({ x: clientX, y: clientY });

      instance.setViewport(
        {
          x: clientX - flowPos.x * nextZoom,
          y: clientY - flowPos.y * nextZoom,
          zoom: nextZoom,
        },
        { duration: 0 }
      );
    };

    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, [wrapperRef, instance, enabled, minZoom, maxZoom]);
}
