import { useState, useMemo, useCallback } from 'react';
import { DraggableNode } from './draggableNode';
import { nodeRegistry, getDefaultNodeData } from './nodes/nodeRegistry';
import { useStore } from './store';
import type { NodeCategory } from './types/nodes';
import type { PipelineNode } from './store';
import './styles/toolbar.css';

const CATEGORIES: { id: NodeCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'start', label: 'Start' },
  { id: 'ai', label: 'AI' },
  { id: 'logic', label: 'Logic' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'data', label: 'Data' },
];

export const PipelineToolbar = () => {
  const [activeCategory, setActiveCategory] = useState<NodeCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);

  const handleAddNode = useCallback(
    (type: string) => {
      const nodeID = getNodeID(type);
      // place at a slightly random offset around the canvas center so stacked nodes are visible
      const x = 200 + Math.random() * 100;
      const y = 150 + Math.random() * 100;
      const newNode: PipelineNode = {
        id: nodeID,
        type,
        position: { x, y },
        data: getDefaultNodeData(nodeID, type),
      };
      addNode(newNode);
    },
    [getNodeID, addNode]
  );

  const filteredNodes = useMemo(() => {
    return nodeRegistry.filter((entry) => {
      const matchesCategory =
        activeCategory === 'all' || entry.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        entry.label.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="vs-palette">
      <div className="vs-palette__search-row">
        <input
          type="search"
          className="vs-palette__search"
          placeholder="Search Nodes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search nodes"
        />
      </div>

      <div className="vs-palette__categories" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`vs-palette__tab ${
              activeCategory === cat.id ? 'vs-palette__tab--active' : ''
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="vs-palette__nodes">
        {filteredNodes.map((entry) => (
          <DraggableNode
            key={entry.type}
            type={entry.type}
            label={entry.label}
            icon={entry.icon}
            onAdd={handleAddNode}
          />
        ))}
      </div>
    </div>
  );
};
