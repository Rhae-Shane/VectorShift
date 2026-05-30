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

/** Open fullscreen read-only canvas preview (Run). */
export const CANVAS_PREVIEW_OPEN_EVENT = 'vs:canvas-preview-open';
export const CANVAS_PREVIEW_CLOSE_EVENT = 'vs:canvas-preview-close';

export function openCanvasPreview(): void {
  window.dispatchEvent(new CustomEvent(CANVAS_PREVIEW_OPEN_EVENT));
}

export function closeCanvasPreview(): void {
  window.dispatchEvent(new CustomEvent(CANVAS_PREVIEW_CLOSE_EVENT));
}
