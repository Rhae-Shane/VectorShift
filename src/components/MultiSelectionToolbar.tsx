import { Panel } from 'reactflow';
import { FiCopy, FiX } from 'react-icons/fi';
import { Icon } from './Icon';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import '../styles/selection-toolbar.css';

export const MultiSelectionToolbar = () => {
  const {
    selectedCount,
    duplicateSelectedNodes,
    removeSelectedNodes,
    clearNodeSelection,
  } = useStore(
    (state) => ({
      selectedCount: state.nodes.filter((node) => node.selected).length,
      duplicateSelectedNodes: state.duplicateSelectedNodes,
      removeSelectedNodes: state.removeSelectedNodes,
      clearNodeSelection: state.clearNodeSelection,
    }),
    shallow
  );

  if (selectedCount < 2) return null;

  return (
    <Panel position="bottom-center" className="vs-selection-toolbar">
      <span className="vs-selection-toolbar__count">
        {selectedCount} nodes selected
      </span>
      <button
        type="button"
        className="vs-selection-toolbar__btn"
        onClick={duplicateSelectedNodes}
        title="Duplicate selected nodes"
      >
        <Icon icon={FiCopy} aria-hidden />
        Duplicate
      </button>
      <button
        type="button"
        className="vs-selection-toolbar__btn vs-selection-toolbar__btn--danger"
        onClick={removeSelectedNodes}
        title="Delete selected nodes"
      >
        <Icon icon={FiX} aria-hidden />
        Delete
      </button>
      <button
        type="button"
        className="vs-selection-toolbar__btn vs-selection-toolbar__btn--ghost"
        onClick={clearNodeSelection}
        title="Clear selection"
      >
        Clear
      </button>
    </Panel>
  );
};
