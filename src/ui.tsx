import { useEffect, useState, useRef, useCallback, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  ConnectionLineType,
  BackgroundVariant,
  type ReactFlowInstance,
} from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, getDefaultNodeData } from './nodes/nodeRegistry';
import type { PipelineNode, StoreState } from './store';
import { CanvasControls } from './components/CanvasControls';
import { CanvasEmptyState } from './components/CanvasEmptyState';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const selector = (state: StoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
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
  } = useStore(selector, shallow);

  const effectivePanMode = panMode || !isInteractive;
  const zoomPercent = Math.max(0, Math.min(350, Math.round(zoom * 100)));

  const setAllNodesCollapsed = useCallback((collapsed: boolean) => {
    window.dispatchEvent(
      new CustomEvent('vs:toggleAllNodes', { detail: { collapsed } })
    );
  }, []);

  const addFirstInputNode = useCallback(() => {
    const type = 'customInput';
    const nodeID = getNodeID(type);

    let position = { x: 280, y: 220 };
    if (reactFlowInstance && reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const center = reactFlowInstance.project({
        x: bounds.width / 2,
        y: bounds.height / 2,
      });
      position = {
        x: center.x - 120,
        y: center.y - 60,
      };
    }

    const newNode: PipelineNode = {
      id: nodeID,
      type,
      position,
      data: getDefaultNodeData(nodeID, type),
    };

    addNode(newNode);
  }, [addNode, getNodeID, reactFlowInstance]);

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

  const fitView = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.fitView({
      padding: 0.2,
      duration: 350,
      includeHiddenNodes: true,
    });
  }, [reactFlowInstance]);

  const zoomIn = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomIn({ duration: 180 });
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomOut({ duration: 180 });
  }, [reactFlowInstance]);

  const onMove = useCallback((_: unknown, viewport: { zoom: number }) => {
    setZoom(viewport.zoom);
  }, []);

  useEffect(() => {
    const pressed = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
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
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        onlyRenderVisibleElements
        minZoom={0}
        maxZoom={3.5}
        nodesDraggable={isInteractive && !effectivePanMode}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        panOnDrag={effectivePanMode}
        panOnScroll
        zoomOnScroll
        onMove={onMove}
      >
        <Background
          color="#d1d5db"
          gap={gridSize}
          size={1}
          variant={BackgroundVariant.Dots}
        />

        <CanvasControls
          zoomPercent={zoomPercent}
          isInteractive={isInteractive}
          panMode={panMode}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={fitView}
          onToggleInteractive={() => setIsInteractive((v) => !v)}
          onTogglePanMode={() => setPanMode((v) => !v)}
          onCollapseAll={() => setAllNodesCollapsed(true)}
          onExpandAll={() => setAllNodesCollapsed(false)}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <CanvasEmptyState onAddFirstNode={addFirstInputNode} />
      )}
    </div>
  );
};
