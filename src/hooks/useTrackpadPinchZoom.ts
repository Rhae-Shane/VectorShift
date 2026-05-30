import { useEffect, type RefObject } from 'react';
import type { ReactFlowInstance } from 'reactflow';

/** Ctrl/Meta + wheel (mouse wheel or trackpad pinch). */
function isZoomWheelEvent(event: WheelEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

/**
 * Smooth exponential zoom multiplier tuned per delta mode.
 * Avoids the large jumps from React Flow's default wheel steps.
 */
function getSmoothZoomMultiplier(event: WheelEvent): number {
  const direction = event.deltaY < 0 ? 1 : -1;
  const magnitude = Math.abs(event.deltaY);

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    const lines = Math.min(magnitude / 3, 4);
    return Math.pow(1.055, direction * lines);
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return Math.pow(1.08, direction);
  }

  const normalized = Math.min(magnitude / 100, 2);
  return Math.pow(1.035, direction * normalized * 2);
}

/**
 * Smooth Ctrl/Meta + wheel zoom (mouse wheel and trackpad pinch).
 * Replaces React Flow's built-in wheel zoom for finer, steadier steps.
 */
export function useTrackpadPinchZoom(
  wrapperRef: RefObject<HTMLDivElement | null>,
  instance: ReactFlowInstance | null,
  enabled: boolean,
  minZoom = 0.01,
  maxZoom = 3.5
): void {
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !instance || !enabled) return;

    const onWheel = (event: WheelEvent) => {
      if (!isZoomWheelEvent(event)) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('.nowheel')) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const rect = el.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      const zoom = instance.getZoom();
      const multiplier = getSmoothZoomMultiplier(event);
      const nextZoom = Math.min(
        maxZoom,
        Math.max(minZoom, zoom * multiplier)
      );

      if (Math.abs(nextZoom - zoom) < 0.0001) return;

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
