import { useEffect, useState, useRef, useCallback, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  ConnectionLineType,
  BackgroundVariant,
  PanOnScrollMode,
  SelectionMode,
  type ReactFlowInstance,
} from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, getDefaultNodeData } from './nodes/nodeRegistry';
import { edgeTypes } from './edges/edgeTypes';
import { ConnectionLine } from './edges/ConnectionLine';
import type { PipelineNode, StoreState } from './store';
import { CanvasControls } from './components/CanvasControls';
import { CanvasEmptyState } from './components/CanvasEmptyState';
import { MultiSelectionToolbar } from './components/MultiSelectionToolbar';
import { getViewportNodePosition } from './utils/canvasPlacement';
import {
  CANVAS_ADD_NODE_EVENT,
  type CanvasAddNodeDetail,
} from './utils/canvasEvents';
import { useTrackpadPinchZoom } from './hooks/useTrackpadPinchZoom';
import { useTheme } from './hooks/useTheme';
import { loadViewport, saveViewport, VIEWPORT_MIN_ZOOM, VIEWPORT_MAX_ZOOM, DEFAULT_VIEWPORT } from './utils/pipelinePersistence';
import { fitPipelineView, isValidViewport } from './utils/fitPipelineView';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const INITIAL_VIEWPORT = DEFAULT_VIEWPORT;

const selector = (state: StoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  clearPendingEdgeDelete: state.clearPendingEdgeDelete,
  pushHistory: state.pushHistory,
  selectAllNodes: state.selectAllNodes,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    clearPendingEdgeDelete,
    pushHistory,
    selectAllNodes,
  } = useStore(selector, shallow);

  const { canvasDot, edgeStroke } = useTheme();

  const isCanvasEmpty = nodes.length === 0;
  const effectivePanMode = !isCanvasEmpty && (panMode || !isInteractive);
  const selectionEnabled = !isCanvasEmpty && isInteractive && !effectivePanMode;
  const zoomPercent = Math.max(1, Math.min(350, Math.round(zoom * 100)));
  const maxZoom = isCanvasEmpty ? 1 : VIEWPORT_MAX_ZOOM;
  const minZoom = isCanvasEmpty ? 1 : VIEWPORT_MIN_ZOOM;

  useTrackpadPinchZoom(
    reactFlowWrapper,
    reactFlowInstance,
    !isCanvasEmpty,
    minZoom,
    maxZoom
  );

  const setAllNodesCollapsed = useCallback((collapsed: boolean) => {
    window.dispatchEvent(
      new CustomEvent('vs:toggleAllNodes', { detail: { collapsed } })
    );
  }, []);

  const addNodeAtViewport = useCallback(
    (type: string) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const nodeID = getNodeID(type);
      const position = getViewportNodePosition(
        reactFlowInstance,
        reactFlowWrapper.current
      );

      const newNode: PipelineNode = {
        id: nodeID,
        type,
        position,
        data: getDefaultNodeData(nodeID, type),
      };

      addNode(newNode);
    },
    [addNode, getNodeID, reactFlowInstance]
  );

  const addFirstInputNode = useCallback(() => {
    addNodeAtViewport('customInput');
  }, [addNodeAtViewport]);

  useEffect(() => {
    const onAddNodeRequest = (event: Event) => {
      const { type } = (event as CustomEvent<CanvasAddNodeDetail>).detail;
      if (type) addNodeAtViewport(type);
    };

    window.addEventListener(CANVAS_ADD_NODE_EVENT, onAddNodeRequest);
    return () =>
      window.removeEventListener(CANVAS_ADD_NODE_EVENT, onAddNodeRequest);
  }, [addNodeAtViewport]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds =
        reactFlowWrapper.current.getBoundingClientRect();
      const transferData = event.dataTransfer?.getData('application/reactflow');
      if (!transferData) return;

      const appData = JSON.parse(transferData) as { nodeType?: string };
      const type = appData?.nodeType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(type);
      const newNode: PipelineNode = {
        id: nodeID,
        type,
        position,
        data: getDefaultNodeData(nodeID, type),
      };

      addNode(newNode);
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDragStart = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const fitView = useCallback(() => {
    if (!reactFlowInstance || isCanvasEmpty) return;
    void fitPipelineView(reactFlowInstance);
  }, [reactFlowInstance, isCanvasEmpty]);

  const zoomIn = useCallback(() => {
    if (!reactFlowInstance || isCanvasEmpty) return;
    reactFlowInstance.zoomIn({ duration: 180 });
  }, [reactFlowInstance, isCanvasEmpty]);

  const zoomOut = useCallback(() => {
    if (!reactFlowInstance || isCanvasEmpty) return;
    reactFlowInstance.zoomOut({ duration: 180 });
  }, [reactFlowInstance, isCanvasEmpty]);

  const onFlowInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);

    const current = instance.getViewport();
    if (!isValidViewport(current)) {
      instance.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
      setZoom(DEFAULT_VIEWPORT.zoom);
    }

    const saved = loadViewport();
    if (saved && useStore.getState().nodes.length > 0) {
      instance.setViewport(saved, { duration: 0 });
      setZoom(saved.zoom);
    }
  }, []);

  const onMove = useCallback(
    (_: unknown, viewport: { x: number; y: number; zoom: number }) => {
      if (!isValidViewport(viewport)) {
        reactFlowInstance?.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
        setZoom(DEFAULT_VIEWPORT.zoom);
        return;
      }

      const empty = useStore.getState().nodes.length === 0;
      if (
        empty &&
        (viewport.zoom !== DEFAULT_VIEWPORT.zoom ||
          viewport.x !== DEFAULT_VIEWPORT.x ||
          viewport.y !== DEFAULT_VIEWPORT.y)
      ) {
        reactFlowInstance?.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
        setZoom(DEFAULT_VIEWPORT.zoom);
        return;
      }

      if (!empty && viewport.zoom < VIEWPORT_MIN_ZOOM) {
        reactFlowInstance?.setViewport(
          { ...viewport, zoom: VIEWPORT_MIN_ZOOM },
          { duration: 0 }
        );
        setZoom(VIEWPORT_MIN_ZOOM);
        return;
      }

      setZoom(viewport.zoom);
    },
    [reactFlowInstance]
  );

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { x: number; y: number; zoom: number }) => {
      if (useStore.getState().nodes.length === 0) return;
      if (!isValidViewport(viewport)) return;
      saveViewport(viewport);
    },
    []
  );

  useEffect(() => {
    if (!isCanvasEmpty || !reactFlowInstance) return;
    reactFlowInstance.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
    setZoom(DEFAULT_VIEWPORT.zoom);
  }, [isCanvasEmpty, reactFlowInstance]);

  useEffect(() => {
    const pressed = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (useStore.getState().nodes.length === 0) return;
      pressed.add(e.code);
      if (e.ctrlKey && pressed.has('ArrowUp') && pressed.has('Space')) {
        e.preventDefault();
        fitView();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [fitView]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (useStore.getState().nodes.length === 0) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        selectAllNodes();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectAllNodes]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setAllNodesCollapsed(true);
      }
      if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setAllNodesCollapsed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setAllNodesCollapsed]);

  return (
    <div ref={reactFlowWrapper} className="vs-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={onNodeDragStart}
        onInit={onFlowInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={() => clearPendingEdgeDelete()}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        selectionOnDrag={selectionEnabled}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={['Backspace', 'Delete']}
        panOnDrag={effectivePanMode ? true : [1, 2]}
        selectionKeyCode={null}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineComponent={ConnectionLine}
        connectionLineStyle={{
          stroke: edgeStroke,
          strokeWidth: 2,
        }}
        defaultViewport={INITIAL_VIEWPORT}
        onlyRenderVisibleElements={false}
        minZoom={minZoom}
        maxZoom={maxZoom}
        nodesDraggable={!isCanvasEmpty && isInteractive && !effectivePanMode}
        nodesConnectable={!isCanvasEmpty && isInteractive}
        elementsSelectable={!isCanvasEmpty && isInteractive}
        panOnScroll={!isCanvasEmpty}
        panOnScrollMode={PanOnScrollMode.Free}
        panOnScrollSpeed={0.75}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={!isCanvasEmpty}
        /* Must stay true when wheel pan/zoom is enabled (React Flow skips wheel otherwise). */
        preventScrolling
        zoomActivationKeyCode={['Control', 'Meta']}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
      >
        <Background
          color={canvasDot}
          gap={gridSize}
          size={1}
          variant={BackgroundVariant.Dots}
        />

        <CanvasControls
          zoomPercent={zoomPercent}
          isInteractive={isInteractive}
          panMode={panMode}
          canvasLocked={isCanvasEmpty}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={fitView}
          onToggleInteractive={() => setIsInteractive((v) => !v)}
          onTogglePanMode={() => setPanMode((v) => !v)}
          onCollapseAll={() => setAllNodesCollapsed(true)}
          onExpandAll={() => setAllNodesCollapsed(false)}
        />

        <MultiSelectionToolbar />
      </ReactFlow>

      {isCanvasEmpty && (
        <CanvasEmptyState onAddFirstNode={addFirstInputNode} />
      )}
    </div>
  );
};
