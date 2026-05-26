import type { ReactFlowInstance } from 'reactflow';

const DEFAULT_NODE_OFFSET = { x: 110, y: 50 };

/** Flow position for placing a node in the center of the visible canvas. */
export function getViewportNodePosition(
  instance: ReactFlowInstance,
  wrapper: HTMLElement,
  offset = DEFAULT_NODE_OFFSET
): { x: number; y: number } {
  const rect = wrapper.getBoundingClientRect();
  const centerFlow = instance.project({
    x: rect.width / 2,
    y: rect.height / 2,
  });

  return {
    x: centerFlow.x - offset.x,
    y: centerFlow.y - offset.y,
  };
}
