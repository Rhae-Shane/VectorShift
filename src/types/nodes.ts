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
  color?: 'sky' | 'amber' | 'rose' | 'teal' | 'gray';
}

export interface NodeHeaderConfig {
  title: string;
  icon?: ReactNode;
  accent?: NodeAccent;
}

export interface BaseFieldConfig {
  name: string;
  label: string;
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
}

export interface ToggleFieldConfig extends BaseFieldConfig {
  kind: 'toggle';
  defaultValue?: boolean;
}

export type FieldConfig =
  | TextFieldConfig
  | SelectFieldConfig
  | TextAreaFieldConfig
  | ToggleFieldConfig;

export interface NodeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  header: NodeHeaderConfig;
  fields?: FieldConfig[];
  handles?: HandleConfig[];
  staticContent?: string;
  minWidth?: number;
  defaultData?: Record<string, unknown>;
  getError?: (data: Record<string, unknown>) => string | null;
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
