import { useEffect, useState, useRef, useCallback, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  ConnectionLineType,
  BackgroundVariant,
  Panel,
  type ReactFlowInstance,
} from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, getDefaultNodeData } from './nodes/nodeRegistry';
import type { PipelineNode, StoreState } from './store';
import { MiniMap } from 'reactflow';
import { FiChevronsDown, FiChevronsUp, FiLock, FiMaximize2, FiMinus, FiMove, FiPlus, FiUnlock } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';

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

  const LockIcon = FiLock as unknown as FC<SVGProps<SVGSVGElement>>;
  const MaximizeIcon = FiMaximize2 as unknown as FC<SVGProps<SVGSVGElement>>;
  const MinusIcon = FiMinus as unknown as FC<SVGProps<SVGSVGElement>>;
  const MoveIcon = FiMove as unknown as FC<SVGProps<SVGSVGElement>>;
  const PlusIcon = FiPlus as unknown as FC<SVGProps<SVGSVGElement>>;
  const UnlockIcon = FiUnlock as unknown as FC<SVGProps<SVGSVGElement>>;
  const CollapseAllIcon = FiChevronsDown as unknown as FC<SVGProps<SVGSVGElement>>;
  const ExpandAllIcon = FiChevronsUp as unknown as FC<SVGProps<SVGSVGElement>>;

  const effectivePanMode = panMode || !isInteractive;
  const zoomPercent = Math.max(0, Math.min(350, Math.round(zoom * 100)));
  const setAllNodesCollapsed = useCallback((collapsed: boolean) => {
    window.dispatchEvent(
      new CustomEvent('vs:toggleAllNodes', { detail: { collapsed } })
    );
  }, []);

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
    reactFlowInstance.fitView({ padding: 0.2, duration: 350, includeHiddenNodes: true });
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

  // Shortcut: Ctrl + ArrowUp + Space → Fit view
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

  // Shortcut: Ctrl + M → Minimize all, Ctrl + E → Expand all
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
        fitView
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
        <Panel position="bottom-right" className="vs-canvas-tools">
          <div className="vs-canvas-tools__grid">
            <div className="vs-canvas-tools__left">
              <div className="vs-canvas-tools__zoom-percent" title="Zoom (0% – 350%)">
                {zoomPercent}%
              </div>
              <div className="vs-canvas-tools__zoom-buttons" aria-label="Zoom controls">
                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={zoomIn}
                  title="Zoom in"
                >
                  <PlusIcon style={{ width: 16, height: 16 }} />
                </button>
                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={zoomOut}
                  title="Zoom out"
                >
                  <MinusIcon style={{ width: 16, height: 16 }} />
                </button>
                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={fitView}
                  title="Fit view (Ctrl + ↑ + Space)"
                >
                  <MaximizeIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            <div className="vs-canvas-tools__right">
              <div className="vs-canvas-tools__top">
                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={() => setAllNodesCollapsed(true)}
                  title="Minimize all nodes (Ctrl + M)"
                  aria-label="Minimize all nodes"
                >
                  <CollapseAllIcon style={{ width: 16, height: 16 }} />
                </button>

                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={() => setAllNodesCollapsed(false)}
                  title="Expand all nodes (Ctrl + E)"
                  aria-label="Expand all nodes"
                >
                  <ExpandAllIcon style={{ width: 16, height: 16 }} />
                </button>
                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={() => setIsInteractive((v) => !v)}
                  title={isInteractive ? 'Lock (view-only)' : 'Unlock (interactive)'}
                  aria-pressed={!isInteractive}
                >
                  {isInteractive ? (
                    <LockIcon style={{ width: 16, height: 16 }} />
                  ) : (
                    <UnlockIcon style={{ width: 16, height: 16 }} />
                  )}
                </button>

                <button
                  type="button"
                  className="vs-canvas-tools__btn"
                  onClick={() => setPanMode((v) => !v)}
                  title="Pan mode"
                  aria-pressed={panMode}
                  data-active={panMode ? 'true' : 'false'}
                >
                  <MoveIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <MiniMap
                className="vs-minimap"
                zoomable
                pannable
                maskColor="rgba(124, 58, 237, 0.08)"
                style={{ width: 240, height: 160 }}
              />
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
