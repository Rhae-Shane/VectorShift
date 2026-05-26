import { useMemo, useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import type { FC, SVGProps } from 'react';
import { DraggableNode } from './draggableNode';
import { nodeRegistry } from './nodes/nodeRegistry';
import type { NodeRegistryEntry } from './types/nodes';
import { requestAddNodeAtViewport } from './utils/canvasEvents';
import './styles/toolbar.css';

const SearchIcon = FiSearch as unknown as FC<SVGProps<SVGSVGElement>>;

type TabId =
  | 'Start'
  | 'VectorShift'
  | 'Knowledge'
  | 'AI'
  | 'Integrations'
  | 'Logic'
  | 'Data'
  | 'Chat';

const TABS: { id: TabId; label: string }[] = [
  { id: 'Start', label: 'Start' },
  { id: 'VectorShift', label: 'VectorShift' },
  { id: 'Knowledge', label: 'Knowledge' },
  { id: 'AI', label: 'AI' },
  { id: 'Integrations', label: 'Integrations' },
  { id: 'Logic', label: 'Logic' },
  { id: 'Data', label: 'Data' },
  { id: 'Chat', label: 'Chat' },
];

const filterByTab = (tab: TabId, entry: NodeRegistryEntry): boolean => {
  switch (tab) {
    case 'Start':
      return entry.category === 'start';
    case 'VectorShift':
      return true;
    case 'Knowledge':
      return entry.category === 'data' || entry.type === 'jsonParse';
    case 'AI':
      return entry.category === 'ai';
    case 'Integrations':
      return entry.category === 'integrations';
    case 'Logic':
      return entry.category === 'logic';
    case 'Data':
      return entry.category === 'data';
    case 'Chat':
      return entry.type === 'note' || entry.type === 'text';
    default:
      return true;
  }
};

/** Display order for Start tab (separator before Output). */
const START_TAB_ORDER = [
  'customInput',
  'text',
  'note',
  'customOutput',
];

const sortForTab = (tab: TabId, entries: NodeRegistryEntry[]): NodeRegistryEntry[] => {
  if (tab === 'Start') {
    const orderMap = new Map(START_TAB_ORDER.map((t, i) => [t, i]));
    return [...entries].sort((a, b) => {
      const ai = orderMap.get(a.type) ?? 99;
      const bi = orderMap.get(b.type) ?? 99;
      return ai - bi;
    });
  }
  return entries;
};

const shouldShowSeparatorBefore = (
  entry: NodeRegistryEntry,
  index: number,
  list: NodeRegistryEntry[]
): boolean => {
  if (entry.type !== 'customOutput' || index === 0) return false;
  return list[index - 1] != null;
};

export const PipelineToolbar = () => {
  const [activeTab, setActiveTab] = useState<TabId>('Start');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleAddNode = useCallback((type: string) => {
    requestAddNodeAtViewport(type);
  }, []);

  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = nodeRegistry.filter((entry) => {
      if (!filterByTab(activeTab, entry)) return false;
      if (q && !entry.label.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortForTab(activeTab, filtered);
  }, [activeTab, search]);

  return (
    <div className="vs-palette">
      <div className="vs-palette__top">
        <fieldset className="vs-palette__search-fieldset">
          <div
            className={`vs-palette__search-field ${searchFocused ? 'vs-palette__search-field--focused' : ''}`}
          >
            <SearchIcon className="vs-palette__search-icon" aria-hidden />
            <input
              type="search"
              className="vs-palette__search nodrag"
              placeholder="Search Nodes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search nodes"
            />
          </div>
        </fieldset>

        <div className="vs-palette__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`vs-palette__tab ${activeTab === tab.id ? 'vs-palette__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vs-palette__nodes-scroll">
        <div className="vs-palette__nodes">
          {filteredNodes.map((entry, index) => (
            <div key={entry.type} className="vs-palette__node-slot">
              {shouldShowSeparatorBefore(entry, index, filteredNodes) && (
                <div className="vs-palette__divider" aria-hidden />
              )}
              <DraggableNode
                type={entry.type}
                label={entry.label}
                icon={entry.icon}
                onAdd={handleAddNode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
