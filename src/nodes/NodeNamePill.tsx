import { useSyncedField } from './useSyncedField';
import type { PipelineNodeData } from '../types/nodes';

export interface NodeNamePillProps {
  nodeId: string;
  data: PipelineNodeData;
  fieldName: string;
  placeholder?: string;
}

export const NodeNamePill = ({
  nodeId,
  data,
  fieldName,
  placeholder = 'node_name',
}: NodeNamePillProps) => {
  const [value, setValue] = useSyncedField(nodeId, fieldName, '', data);

  return (
    <div className="vs-node__name-pill">
      <input
        className="vs-node__name-pill-input nodrag"
        type="text"
        value={String(value)}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Node name"
      />
    </div>
  );
};
