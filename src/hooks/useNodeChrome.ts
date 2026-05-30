import { useEffect, useState, useCallback, type MouseEvent } from 'react';
import { useReactFlow } from 'reactflow';
import { NODE_DEFAULT_WIDTH } from '../constants/nodeLayout';
import { useStore } from '../store';

export type NodeChromeHoverTip = 'collapse' | 'delete' | 'duplicate' | null;

export interface UseNodeChromeOptions {
  nodeId: string;
  focusFallbackHeight?: number;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface UseNodeChromeResult {
  collapsed: boolean;
  confirmDelete: boolean;
  hoverTooltipText: string | null;
  handleDoubleClick: () => void;
  onDuplicateClick: (event: MouseEvent) => void;
  onToggleCollapseClick: (event: MouseEvent) => void;
  onDeleteClick: (event: MouseEvent) => void;
  bindHoverTip: (tip: Exclude<NodeChromeHoverTip, null>) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export const useNodeChrome = ({
  nodeId,
  focusFallbackHeight,
  onCollapsedChange,
}: UseNodeChromeOptions): UseNodeChromeResult => {
  const removeNode = useStore((s) => s.removeNode);
  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);
  const { getNode, setCenter } = useReactFlow();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverTip, setHoverTip] = useState<NodeChromeHoverTip>(null);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = window.setTimeout(() => setConfirmDelete(false), 1800);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  useEffect(() => {
    const onToggleAll = (event: Event) => {
      const detail = (event as CustomEvent<{ collapsed?: boolean }>).detail;
      if (typeof detail?.collapsed === 'boolean') {
        setCollapsed(detail.collapsed);
      }
    };

    window.addEventListener('vs:toggleAllNodes', onToggleAll as EventListener);
    return () => {
      window.removeEventListener('vs:toggleAllNodes', onToggleAll as EventListener);
    };
  }, []);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  const bindHoverTip = useCallback(
    (tip: Exclude<NodeChromeHoverTip, null>) => ({
      onMouseEnter: () => setHoverTip(tip),
      onMouseLeave: () => setHoverTip(null),
      onFocus: () => setHoverTip(tip),
      onBlur: () => setHoverTip(null),
    }),
    []
  );

  const onDeleteClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      removeNode(nodeId);
    },
    [confirmDelete, nodeId, removeNode]
  );

  const onDuplicateClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      const node = getNode(nodeId);
      if (!node) return;

      const nodeType = node.type || 'customInput';
      const newId = getNodeID(nodeType);
      const newNode = {
        id: newId,
        type: nodeType,
        position: {
          x: node.position.x + 60,
          y: node.position.y + 60,
        },
        data: {
          ...node.data,
          id: newId,
        },
      };

      addNode(newNode);
    },
    [addNode, getNode, getNodeID, nodeId]
  );

  const onToggleCollapseClick = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setCollapsed((value) => !value);
  }, []);

  const handleDoubleClick = useCallback(() => {
    const node = getNode(nodeId);
    if (!node?.position) return;

    const width = node.width ?? NODE_DEFAULT_WIDTH;
    const height = node.height ?? focusFallbackHeight ?? 200;

    setCenter(node.position.x + width / 2, node.position.y + height / 2, {
      zoom: 0.95,
      duration: 500,
    });
  }, [focusFallbackHeight, getNode, nodeId, setCenter]);

  const hoverTooltipText = confirmDelete
    ? 'Confirm delete'
    : hoverTip === 'delete'
      ? 'Delete node'
      : hoverTip === 'collapse'
        ? collapsed
          ? 'Expand node'
          : 'Collapse node'
        : hoverTip === 'duplicate'
          ? 'Duplicate node'
          : null;

  return {
    collapsed,
    confirmDelete,
    hoverTooltipText,
    handleDoubleClick,
    onDuplicateClick,
    onToggleCollapseClick,
    onDeleteClick,
    bindHoverTip,
  };
};
