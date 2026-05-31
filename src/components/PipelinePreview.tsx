import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  type ReactFlowInstance,
} from 'reactflow';
import { FiX } from 'react-icons/fi';
import { Icon } from './Icon';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import { nodeTypes } from '../nodes/nodeRegistry';
import {
  CANVAS_PREVIEW_OPEN_EVENT,
  closeCanvasPreview,
} from '../utils/canvasEvents';
import { useTrackpadPinchZoom } from '../hooks/useTrackpadPinchZoom';
import { useTheme } from '../hooks/useTheme';
import { fitPipelineView } from '../utils/fitPipelineView';
import { VIEWPORT_MAX_ZOOM, VIEWPORT_MIN_ZOOM } from '../utils/pipelinePersistence';
import 'reactflow/dist/style.css';
import '../styles/pipeline-preview.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

export const PipelinePreview = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges } = useStore(
    (state) => ({ nodes: state.nodes, edges: state.edges }),
    shallow
  );

  const previewEdges = useMemo(
    () =>
      edges.map(({ type: _type, ...edge }) => ({
        ...edge,
        animated: edge.animated,
      })),
    [edges]
  );

  const isEmpty = nodes.length === 0;
  const { canvasDot } = useTheme();

  useTrackpadPinchZoom(
    wrapperRef,
    instance,
    open && !isEmpty,
    VIEWPORT_MIN_ZOOM,
    VIEWPORT_MAX_ZOOM
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    closeCanvasPreview();
  }, []);

  const onInit = useCallback((flow: ReactFlowInstance) => {
    setInstance(flow);
    void fitPipelineView(flow);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      if (useStore.getState().nodes.length === 0) return;
      setOpen(true);
    };

    window.addEventListener(CANVAS_PREVIEW_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CANVAS_PREVIEW_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (open && instance && !isEmpty) {
      void fitPipelineView(instance);
    }
  }, [open, instance, isEmpty, nodes, edges]);

  if (!open) return null;

  return (
    <div className="vs-preview" role="dialog" aria-modal="true" aria-label="Preview">
      <div className="vs-app vs-preview__shell">
        <div className="vs-preview__header">
          <span className="vs-preview__title">Preview</span>
          <button
            type="button"
            className="vs-preview__close"
            onClick={handleClose}
            aria-label="Exit preview"
            title="Exit preview (Esc)"
          >
            <Icon icon={FiX} aria-hidden />
          </button>
        </div>

        <div ref={wrapperRef} className="vs-preview__canvas vs-canvas">
          <ReactFlow
          nodes={nodes}
          edges={previewEdges}
          nodeTypes={nodeTypes}
          onInit={onInit}
          proOptions={proOptions}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          edgesUpdatable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          panOnDrag
          panOnScroll={!isEmpty}
          panOnScrollMode={PanOnScrollMode.Free}
          panOnScrollSpeed={0.75}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling
          minZoom={VIEWPORT_MIN_ZOOM}
          maxZoom={VIEWPORT_MAX_ZOOM}
          zoomActivationKeyCode={['Control', 'Meta']}
        >
          <Background
            color={canvasDot}
            gap={gridSize}
            size={1}
            variant={BackgroundVariant.Dots}
          />
        </ReactFlow>
        </div>
      </div>
    </div>
  );
};
