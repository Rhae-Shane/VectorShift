/** Toolbar / UI requests adding a node at the current viewport center. */
export const CANVAS_ADD_NODE_EVENT = 'vs:canvas-add-node';

export interface CanvasAddNodeDetail {
  type: string;
}

export function requestAddNodeAtViewport(type: string): void {
  window.dispatchEvent(
    new CustomEvent<CanvasAddNodeDetail>(CANVAS_ADD_NODE_EVENT, {
      detail: { type },
    })
  );
}
