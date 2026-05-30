import type { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import {
  TextField,
  SelectField,
  TextAreaField,
  ToggleField,
  StaticContent,
} from './fields';
import type {
  FieldConfig,
  NodeDefinition,
  PipelineNodeData,
  PipelineNodeComponent,
} from '../types/nodes';

const renderField = (
  field: FieldConfig,
  nodeId: string,
  data: PipelineNodeData
) => {
  const base = { nodeId, data, name: field.name, label: field.label };

  switch (field.kind) {
    case 'text':
      return (
        <TextField
          key={field.name}
          {...base}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
        />
      );
    case 'select':
      return (
        <SelectField
          key={field.name}
          {...base}
          options={field.options}
          defaultValue={field.defaultValue}
        />
      );
    case 'textarea':
      return (
        <TextAreaField
          key={field.name}
          {...base}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          rows={field.rows}
        />
      );
    case 'toggle':
      return (
        <ToggleField
          key={field.name}
          {...base}
          defaultValue={field.defaultValue}
        />
      );
    default:
      return null;
  }
};

export const createNodeComponent = (
  definition: NodeDefinition
): PipelineNodeComponent => {
  const NodeComponent = ({ id, data, selected }: NodeProps<PipelineNodeData>) => {
    const {
      header,
      fields = [],
      handles = [],
      staticContent,
      minWidth,
      getError,
    } = definition;

    const error = getError?.(data as Record<string, unknown>) ?? null;

    return (
      <BaseNode
        id={id}
        title={header.title}
        icon={header.icon}
        accent={header.accent ?? 'purple'}
        handles={handles}
        minWidth={minWidth}
        error={error}
        selected={selected}
      >
        {staticContent && <StaticContent content={staticContent} />}
        {fields.map((field) => renderField(field, id, data))}
      </BaseNode>
    );
  };

  NodeComponent.displayName = definition.header?.title || definition.type;
  return NodeComponent;
};

export const buildNodeTypes = (
  registry: { type: string; component: PipelineNodeComponent }[]
): Record<string, PipelineNodeComponent> =>
  Object.fromEntries(
    registry.map((entry) => [entry.type, entry.component])
  );
