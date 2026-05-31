import type { CSSProperties, ComponentType, ReactNode } from 'react';
import type { NodeProps } from 'reactflow';

export type NodeAccent =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'indigo'
  | 'gray';

export type NodeCategory =
  | 'start'
  | 'ai'
  | 'logic'
  | 'integrations'
  | 'data';

export type HandlePosition = 'left' | 'right' | 'top' | 'bottom';

export interface HandleConfig {
  type: 'source' | 'target';
  position: HandlePosition;
  idSuffix: string;
  style?: CSSProperties;
  color?: 'sky' | 'amber' | 'rose' | 'teal' | 'gray' | 'indigo';
}

export interface BaseFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  badge?: string;
  showHelp?: boolean;
}

export interface NodeHeaderConfig {
  title: string;
  icon?: ReactNode;
  accent?: NodeAccent;
}

export interface TextFieldConfig extends BaseFieldConfig {
  kind: 'text';
  placeholder?: string;
  defaultValue?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  kind: 'select';
  options: string[];
  defaultValue?: string;
}

export interface TextAreaFieldConfig extends BaseFieldConfig {
  kind: 'textarea';
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  highlightInvalid?: boolean;
}

export interface ToggleFieldConfig extends BaseFieldConfig {
  kind: 'toggle';
  defaultValue?: boolean;
}

export interface GrowingTextAreaFieldConfig extends BaseFieldConfig {
  kind: 'growingTextarea';
  placeholder?: string;
  defaultValue?: string;
}

/** Example custom field — see docs/EXTENDING_NODES.md */
export interface NumberFieldConfig extends BaseFieldConfig {
  kind: 'number';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export type FieldConfig =
  | TextFieldConfig
  | SelectFieldConfig
  | TextAreaFieldConfig
  | ToggleFieldConfig
  | GrowingTextAreaFieldConfig
  | NumberFieldConfig;

export interface NodeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  header: NodeHeaderConfig;
  /** Shown under the header band (e.g. Input / Output subtitle). */
  description?: string;
  /** Tip banner above fields (e.g. naming suggestion on Input). */
  suggestion?: string;
  /** Field key rendered as the lavender name pill (e.g. inputName). */
  nameField?: string;
  fields?: FieldConfig[];
  handles?: HandleConfig[];
  staticContent?: string;
  minWidth?: number;
  className?: string;
  focusFallbackHeight?: number;
  defaultData?: Record<string, unknown>;
  getError?: (data: Record<string, unknown>) => string | null;
  getDynamicHandles?: (data: Record<string, unknown>) => HandleConfig[];
}

export type PipelineNodeData = Record<string, unknown> & {
  id: string;
  nodeType: string;
};

export type PipelineNodeComponent = ComponentType<NodeProps<PipelineNodeData>>;

export interface NodeRegistryEntry {
  type: string;
  label: string;
  category: NodeCategory;
  component: PipelineNodeComponent;
  icon?: ReactNode;
  defaultData?: Record<string, unknown>;
}
