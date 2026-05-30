import type { ReactFlowInstance } from 'reactflow';
import { DEFAULT_VIEWPORT } from './pipelinePersistence';
import { isValidViewport } from './fitPipelineView';

const DEFAULT_NODE_OFFSET = { x: 110, y: 50 };

/** Flow position for placing a node in the center of the visible canvas. */
export function getViewportNodePosition(
  instance: ReactFlowInstance,
  wrapper: HTMLElement,
  offset = DEFAULT_NODE_OFFSET
): { x: number; y: number } {
  const viewport = instance.getViewport();
  if (!isValidViewport(viewport)) {
    instance.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
  }

  const rect = wrapper.getBoundingClientRect();
  const centerFlow = instance.project({
    x: rect.width / 2,
    y: rect.height / 2,
  });

  const x = centerFlow.x - offset.x;
  const y = centerFlow.y - offset.y;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { x: 0, y: 0 };
  }

  return { x, y };
}
