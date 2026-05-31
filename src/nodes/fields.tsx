import type { RefObject } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Icon } from '../components/Icon';
import { FieldLabelRow } from './FieldLabelRow';
import { useSyncedField } from './useSyncedField';
import type { PipelineNodeData } from '../types/nodes';

interface FieldBaseProps {
  nodeId: string;
  data: PipelineNodeData;
  name: string;
  label: string;
  required?: boolean;
  badge?: string;
  showHelp?: boolean;
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
  required,
  badge,
  showHelp,
}: TextFieldProps) => {
  const [value, setValue] = useSyncedField(nodeId, name, defaultValue, data);

  return (
    <div className="vs-field">
      <FieldLabelRow
        label={label}
        required={required}
        badge={badge}
        showHelp={showHelp}
      />
      <input
        className="vs-field__input nodrag"
        type="text"
        value={String(value)}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
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
  required,
  badge = 'Dropdown',
  showHelp,
}: SelectFieldProps) => {
  const [value, setValue] = useSyncedField(
    nodeId,
    name,
    defaultValue ?? options[0],
    data
  );

  return (
    <div className="vs-field">
      <FieldLabelRow
        label={label}
        required={required}
        badge={badge}
        showHelp={showHelp}
      />
      <div className="vs-field__select-wrap">
        <select
          className="vs-field__select nodrag"
          value={String(value)}
          onChange={(e) => setValue(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Icon
          icon={FiChevronDown}
          size={18}
          className="vs-field__select-chevron"
          aria-hidden
        />
      </div>
    </div>
  );
};

export interface TextAreaFieldProps extends FieldBaseProps {
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  highlightInvalid?: boolean;
  invalid?: boolean;
}

export const TextAreaField = ({
  nodeId,
  data,
  name,
  label,
  placeholder,
  defaultValue = '',
  rows = 3,
  required,
  badge,
  showHelp,
  highlightInvalid,
  invalid,
}: TextAreaFieldProps) => {
  const [value, setValue] = useSyncedField(nodeId, name, defaultValue, data);
  const showInvalid = Boolean(invalid || (highlightInvalid && required && !String(value).trim()));

  return (
    <div className="vs-field">
      <FieldLabelRow
        label={label}
        required={required}
        badge={badge}
        showHelp={showHelp}
      />
      <textarea
        className={`vs-field__textarea nodrag ${showInvalid ? 'vs-field__textarea--invalid' : ''}`}
        value={String(value)}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export interface ToggleFieldProps extends FieldBaseProps {
  defaultValue?: boolean;
  onLabel?: string;
  offLabel?: string;
}

export const ToggleField = ({
  nodeId,
  data,
  name,
  label,
  defaultValue = false,
  onLabel = 'Yes',
  offLabel = 'No',
}: ToggleFieldProps) => {
  const [value, setValue] = useSyncedField(nodeId, name, defaultValue, data);

  return (
    <div className="vs-field vs-field--row">
      <span className="vs-field__label">{label}</span>
      <div className="vs-field__toggle-group">
        <span className="vs-field__toggle-label">
          {value ? onLabel : offLabel}
        </span>
        <button
          type="button"
          className={`vs-toggle ${value ? 'vs-toggle--on' : ''}`}
          onClick={() => setValue(!value)}
          aria-pressed={Boolean(value)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="vs-toggle__thumb" />
        </button>
      </div>
    </div>
  );
};

export const StaticContent = ({ content }: { content: string }) => (
  <p className="vs-node__static">{content}</p>
);

export interface NumberFieldProps extends FieldBaseProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const NumberField = ({
  nodeId,
  data,
  name,
  label,
  defaultValue = 0,
  min,
  max,
  step = 1,
  unit,
  required,
  badge,
  showHelp,
}: NumberFieldProps) => {
  const [value, setValue] = useSyncedField(nodeId, name, defaultValue, data);

  return (
    <div className="vs-field">
      <FieldLabelRow
        label={label}
        required={required}
        badge={badge}
        showHelp={showHelp}
      />
      <input
        className="vs-field__input nodrag"
        type="number"
        value={Number(value)}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {unit ? (
        <span className="vs-field__unit" aria-hidden="true">
          {unit}
        </span>
      ) : null}
    </div>
  );
};

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
  required,
  badge,
  showHelp,
}: GrowingTextAreaFieldProps) => {
  const [value, setValue] = useSyncedField(nodeId, name, defaultValue, data);

  const handleChange = (next: string) => {
    setValue(next);
    onTextChange?.(next);
  };

  return (
    <>
      <div className="vs-field">
        <FieldLabelRow
          label={label}
          required={required}
          badge={badge}
          showHelp={showHelp}
        />
        <textarea
          ref={textareaRef}
          className="vs-field__textarea vs-field__textarea--grow nodrag"
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
