import { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { PipelineNodeData } from '../types/nodes';

export const useSyncedField = <T,>(
  nodeId: string,
  fieldName: string,
  defaultValue: T,
  data: PipelineNodeData
): [T, (value: T) => void] => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const dataValue = data[fieldName] as T | undefined;
  const [value, setValue] = useState<T>(dataValue ?? defaultValue);

  useEffect(() => {
    if (dataValue !== undefined && dataValue !== value) {
      setValue(dataValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataValue]);

  const onChange = (newValue: T) => {
    setValue(newValue);
    updateNodeField(nodeId, fieldName, newValue);
  };

  return [value, onChange];
};
