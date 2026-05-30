export const FIT_VIEW_MIN_ZOOM = 0.35;
export const FIT_VIEW_PADDING = 0.15;

export async function fitPipelineView(
  instance: import('reactflow').ReactFlowInstance
): Promise<void> {
  const nodes = instance.getNodes();
  if (nodes.length === 0) return;

  await instance.fitView({
    padding: FIT_VIEW_PADDING,
    duration: 350,
    includeHiddenNodes: true,
    minZoom: FIT_VIEW_MIN_ZOOM,
    maxZoom: 3.5,
  });
}

export const isValidViewport = (viewport: {
  x: number;
  y: number;
  zoom: number;
}): boolean =>
  Number.isFinite(viewport.x) &&
  Number.isFinite(viewport.y) &&
  Number.isFinite(viewport.zoom) &&
  viewport.zoom > 0;
