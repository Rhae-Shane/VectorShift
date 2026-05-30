import { useState, useEffect, type RefObject } from 'react';
import { useStore } from '../store';
import type { PipelineNodeData } from '../types/nodes';

const useSyncedField = <T,>(
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

interface FieldBaseProps {
  nodeId: string;
  data: PipelineNodeData;
  name: string;
  label: string;
}

export interface TextFieldProps extends FieldBaseProps {
  placeholder?: string;
  defaultValue?: string;
}

export const TextField = ({
  nodeId,
  data,
  name,
  label,
  placeholder,
  defaultValue = '',
}: TextFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue,
    data
  );

  return (
    <div className="vs-field">
      <label className="vs-field__label">{label}</label>
      <input
        className="vs-field__input"
        type="text"
        value={String(value)}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export interface SelectFieldProps extends FieldBaseProps {
  options: string[];
  defaultValue?: string;
}

export const SelectField = ({
  nodeId,
  data,
  name,
  label,
  options,
  defaultValue,
}: SelectFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue ?? options[0],
    data
  );

  return (
    <div className="vs-field">
      <label className="vs-field__label">{label}</label>
      <select
        className="vs-field__select"
        value={String(value)}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export interface TextAreaFieldProps extends FieldBaseProps {
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}

export const TextAreaField = ({
  nodeId,
  data,
  name,
  label,
  placeholder,
  defaultValue = '',
  rows = 3,
}: TextAreaFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue,
    data
  );

  return (
    <div className="vs-field">
      <label className="vs-field__label">{label}</label>
      <textarea
        className="vs-field__textarea"
        value={String(value)}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export interface ToggleFieldProps extends FieldBaseProps {
  defaultValue?: boolean;
}

export const ToggleField = ({
  nodeId,
  data,
  name,
  label,
  defaultValue = false,
}: ToggleFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue,
    data
  );

  return (
    <div className="vs-field vs-field--row">
      <label className="vs-field__label">{label}</label>
      <button
        type="button"
        className={`vs-toggle ${value ? 'vs-toggle--on' : ''}`}
        onClick={() => setValue(!value)}
        aria-pressed={Boolean(value)}
      >
        <span className="vs-toggle__thumb" />
      </button>
    </div>
  );
};

export const StaticContent = ({ content }: { content: string }) => (
  <p className="vs-node__static">{content}</p>
);

export interface GrowingTextAreaFieldProps extends FieldBaseProps {
  placeholder?: string;
  defaultValue?: string;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  measureRef?: RefObject<HTMLSpanElement>;
  onTextChange?: (text: string) => void;
}

export const GrowingTextAreaField = ({
  nodeId,
  data,
  name,
  label,
  placeholder,
  defaultValue = '',
  textareaRef,
  measureRef,
  onTextChange,
}: GrowingTextAreaFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue,
    data
  );

  const handleChange = (next: string) => {
    setValue(next);
    onTextChange?.(next);
  };

  return (
    <>
      <div className="vs-field">
        <label className="vs-field__label">{label}</label>
        <textarea
          ref={textareaRef}
          className="vs-field__textarea vs-field__textarea--grow"
          value={String(value)}
          placeholder={placeholder}
          rows={1}
          style={{ height: 'auto' }}
          onChange={(e) => handleChange(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        />
      </div>
      <span ref={measureRef} className="vs-text-measure" aria-hidden="true" />
    </>
  );
};
