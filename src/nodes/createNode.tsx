import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useUpdateNodeInternals, type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import {
  TextField,
  SelectField,
  TextAreaField,
  ToggleField,
  StaticContent,
  GrowingTextAreaField,
  NumberField,
} from './fields';
import { useGrowingTextNodeSize } from '../hooks/useGrowingTextNodeSize';
import {
  TEXT_NODE_MAX_HEIGHT,
  TEXT_NODE_MAX_WIDTH,
  TEXT_NODE_MIN_WIDTH,
} from '../constants/nodeLayout';
import type {
  FieldConfig,
  NodeDefinition,
  PipelineNodeData,
  PipelineNodeComponent,
} from '../types/nodes';

const renderField = (
  field: FieldConfig,
  nodeId: string,
  data: PipelineNodeData,
  nodeError: string | null,
  growingTextRefs?: {
    textareaRef: RefObject<HTMLTextAreaElement>;
    measureRef: RefObject<HTMLSpanElement>;
    onTextChange?: (text: string) => void;
  }
) => {
  const base = {
    nodeId,
    data,
    name: field.name,
    label: field.label,
    required: field.required,
    badge: field.badge,
    showHelp: field.showHelp,
  };

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
          highlightInvalid={field.highlightInvalid}
          invalid={Boolean(nodeError && field.highlightInvalid)}
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
    case 'growingTextarea':
      return (
        <GrowingTextAreaField
          key={field.name}
          {...base}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          textareaRef={growingTextRefs?.textareaRef}
          measureRef={growingTextRefs?.measureRef}
          onTextChange={growingTextRefs?.onTextChange}
        />
      );
    case 'number':
      return (
        <NumberField
          key={field.name}
          {...base}
          defaultValue={field.defaultValue}
          min={field.min}
          max={field.max}
          step={field.step}
          unit={field.unit}
        />
      );
    default:
      return null;
  }
};

export const createNodeComponent = (
  definition: NodeDefinition
): PipelineNodeComponent => {
  const growingTextField = definition.fields?.find(
    (field) => field.kind === 'growingTextarea'
  );

  const NodeComponent = ({ id, data, selected }: NodeProps<PipelineNodeData>) => {
    const {
      header,
      description,
      suggestion,
      nameField,
      fields = [],
      handles = [],
      staticContent,
      minWidth,
      className,
      focusFallbackHeight,
      getError,
      getDynamicHandles,
    } = definition;

    const [collapsed, setCollapsed] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const updateNodeInternals = useUpdateNodeInternals();

    const syncedTextValue = growingTextField
      ? String(data[growingTextField.name] ?? growingTextField.defaultValue ?? '')
      : '';

    const [liveText, setLiveText] = useState(syncedTextValue);

    useLayoutEffect(() => {
      setLiveText(syncedTextValue);
    }, [id, syncedTextValue]);

    const size = useGrowingTextNodeSize(
      liveText,
      collapsed,
      textareaRef,
      measureRef
    );

    const handleData = useMemo(() => {
      if (!growingTextField) return data as Record<string, unknown>;
      return { ...data, [growingTextField.name]: liveText };
    }, [data, liveText]);

    const dynamicHandles = useMemo(
      () => getDynamicHandles?.(handleData) ?? [],
      [handleData, getDynamicHandles]
    );
    const mergedHandles = useMemo(
      () => [...dynamicHandles, ...handles],
      [dynamicHandles, handles]
    );

    const error = getError?.(data as Record<string, unknown>) ?? null;

    const growingTextStyle = growingTextField
      ? {
          width: size.width,
          minWidth: TEXT_NODE_MIN_WIDTH,
          maxWidth: TEXT_NODE_MAX_WIDTH,
          minHeight: collapsed ? undefined : size.height,
          maxHeight: collapsed ? undefined : TEXT_NODE_MAX_HEIGHT,
        }
      : undefined;

    const handleKey = mergedHandles.map((handle) => handle.idSuffix).join('|');

    useLayoutEffect(() => {
      if (!growingTextField) return;
      updateNodeInternals(id);
    }, [id, size.width, size.height, collapsed, handleKey, updateNodeInternals]);

    return (
      <BaseNode
        id={id}
        title={header.title}
        icon={header.icon}
        accent={header.accent ?? 'indigo'}
        description={description}
        suggestion={suggestion}
        nameField={nameField}
        nodeData={data}
        handles={mergedHandles}
        minWidth={minWidth}
        className={className}
        style={growingTextStyle}
        focusFallbackHeight={focusFallbackHeight}
        error={error}
        selected={selected}
        onCollapsedChange={setCollapsed}
      >
        {staticContent && <StaticContent content={staticContent} />}
        {fields.map((field) =>
          renderField(
            field,
            id,
            data,
            error,
            growingTextField
              ? {
                  textareaRef,
                  measureRef,
                  onTextChange: setLiveText,
                }
              : undefined
          )
        )}
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
