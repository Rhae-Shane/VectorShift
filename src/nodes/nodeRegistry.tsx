import { createNodeComponent } from './createNode';
import { Icon } from '../components/Icon';
import {
  FiLogIn,
  FiLogOut,
  FiCpu,
  FiGitBranch,
  FiGlobe,
  FiPlusCircle,
  FiEdit3,
  FiCode,
  FiType,
} from 'react-icons/fi';
import type {
  NodeDefinition,
  NodeRegistryEntry,
  PipelineNodeData,
  PipelineNodeComponent,
} from '../types/nodes';
import { buildTextVariableHandles } from '../utils/textVariables';
import {
  NODE_INPUT_WIDTH,
  NODE_OUTPUT_WIDTH,
  TEXT_NODE_MIN_HEIGHT,
} from '../constants/nodeLayout';

const inputDef: NodeDefinition = {
  type: 'customInput',
  label: 'Input',
  category: 'start',
  minWidth: NODE_INPUT_WIDTH,
  description: 'Pass data of different types into your workflow',
  suggestion: 'Give the node a distinct name',
  nameField: 'inputName',
  header: {
    title: 'Input',
    icon: <Icon icon={FiLogIn} size={22} />,
    accent: 'indigo',
  },
  fields: [
    {
      kind: 'select',
      name: 'inputType',
      label: 'Type',
      options: ['Text', 'File'],
      defaultValue: 'Text',
      showHelp: true,
      badge: 'Dropdown',
    },
  ],
  handles: [{ type: 'source', position: 'right', idSuffix: 'value', color: 'indigo' }],
};

const outputDef: NodeDefinition = {
  type: 'customOutput',
  label: 'Output',
  category: 'start',
  minWidth: NODE_OUTPUT_WIDTH,
  description: 'Output data of different types from your workflow.',
  nameField: 'outputName',
  header: {
    title: 'Output',
    icon: <Icon icon={FiLogOut} size={22} />,
    accent: 'indigo',
  },
  fields: [
    {
      kind: 'select',
      name: 'outputType',
      label: 'Type',
      options: ['Text', 'Image'],
      defaultValue: 'Text',
      showHelp: true,
      badge: 'Dropdown',
    },
    {
      kind: 'textarea',
      name: 'outputValue',
      label: 'Output',
      placeholder: 'Type "{{" to utilize variables',
      defaultValue: '',
      rows: 3,
      required: true,
      highlightInvalid: true,
      badge: 'Text',
    },
    {
      kind: 'toggle',
      name: 'formatOutput',
      label: 'Format output',
      defaultValue: true,
    },
  ],
  handles: [{ type: 'target', position: 'left', idSuffix: 'value', color: 'indigo' }],
  getError: (data) => {
    const value = data?.outputValue;
    if (typeof value !== 'string' || !value.trim()) {
      return 'Output field is required';
    }
    return null;
  },
};

const llmDef: NodeDefinition = {
  type: 'llm',
  label: 'LLM',
  category: 'ai',
  header: { title: 'LLM', icon: <Icon icon={FiCpu} size={22} />, accent: 'purple' },
  description: 'Large language model node for prompt processing.',
  handles: [
    {
      type: 'target',
      position: 'left',
      idSuffix: 'system',
      style: { top: '33%' },
      color: 'amber',
    },
    {
      type: 'target',
      position: 'left',
      idSuffix: 'prompt',
      style: { top: '66%' },
      color: 'amber',
    },
    { type: 'source', position: 'right', idSuffix: 'response', color: 'amber' },
  ],
};

const conditionDef: NodeDefinition = {
  type: 'condition',
  label: 'Condition',
  category: 'logic',
  header: { title: 'Condition', icon: <Icon icon={FiGitBranch} size={22} />, accent: 'orange' },
  description: 'Branch your workflow based on a condition.',
  fields: [
    {
      kind: 'text',
      name: 'conditionInput',
      label: 'Input',
      placeholder: "Type '{{' to utilize variables",
      showHelp: true,
    },
    {
      kind: 'select',
      name: 'operator',
      label: 'Operator',
      options: ['equals', 'contains', 'greater than', 'less than'],
      defaultValue: 'equals',
      badge: 'Dropdown',
    },
    {
      kind: 'text',
      name: 'compareValue',
      label: 'Value',
      placeholder: 'Comparison value',
    },
  ],
  handles: [
    { type: 'target', position: 'left', idSuffix: 'input', color: 'rose' },
    { type: 'source', position: 'right', idSuffix: 'true', color: 'rose' },
    {
      type: 'source',
      position: 'right',
      idSuffix: 'false',
      style: { top: '70%' },
      color: 'rose',
    },
  ],
};

const httpRequestDef: NodeDefinition = {
  type: 'httpRequest',
  label: 'HTTP Request',
  category: 'integrations',
  header: { title: 'HTTP Request', icon: <Icon icon={FiGlobe} size={22} />, accent: 'teal' },
  description: 'Send an HTTP request to an external API.',
  minWidth: 320,
  fields: [
    {
      kind: 'select',
      name: 'method',
      label: 'Method',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      defaultValue: 'GET',
    },
    {
      kind: 'text',
      name: 'url',
      label: 'URL',
      placeholder: 'https://api.example.com',
    },
    { kind: 'toggle', name: 'useAuth', label: 'Use Auth', defaultValue: false },
    {
      kind: 'number',
      name: 'timeoutMs',
      label: 'Timeout',
      defaultValue: 30000,
      min: 1000,
      max: 120000,
      step: 1000,
      unit: 'ms',
    },
  ],
  handles: [
    { type: 'target', position: 'left', idSuffix: 'body', color: 'teal' },
    { type: 'source', position: 'right', idSuffix: 'response', color: 'teal' },
  ],
};

const mergeDef: NodeDefinition = {
  type: 'merge',
  label: 'Merge',
  category: 'data',
  header: { title: 'Merge', icon: <Icon icon={FiPlusCircle} size={22} />, accent: 'indigo' },
  description: 'Combines multiple inputs into one output.',
  handles: [
    { type: 'target', position: 'left', idSuffix: 'a', style: { top: '25%' }, color: 'sky' },
    { type: 'target', position: 'left', idSuffix: 'b', style: { top: '50%' }, color: 'sky' },
    { type: 'target', position: 'left', idSuffix: 'c', style: { top: '75%' }, color: 'sky' },
    { type: 'source', position: 'right', idSuffix: 'merged', color: 'sky' },
  ],
};

const noteDef: NodeDefinition = {
  type: 'note',
  label: 'Note',
  category: 'start',
  header: { title: 'Note', icon: <Icon icon={FiEdit3} size={22} />, accent: 'gray' },
  description: 'Add comments or documentation to your workflow.',
  fields: [
    {
      kind: 'textarea',
      name: 'noteText',
      label: 'Note',
      placeholder: 'Add a comment or documentation...',
      rows: 4,
    },
  ],
  handles: [],
};

const jsonParseDef: NodeDefinition = {
  type: 'jsonParse',
  label: 'JSON Parse',
  category: 'data',
  header: { title: 'JSON Parse', icon: <Icon icon={FiCode} size={22} />, accent: 'teal' },
  description: 'Parse a JSON string into structured data.',
  fields: [
    {
      kind: 'textarea',
      name: 'jsonInput',
      label: 'JSON',
      placeholder: '{"key": "value"}',
      rows: 3,
    },
  ],
  handles: [
    { type: 'target', position: 'left', idSuffix: 'input', color: 'sky' },
    { type: 'source', position: 'right', idSuffix: 'parsed', color: 'sky' },
  ],
  getError: (data) => {
    const jsonInput = data?.jsonInput;
    if (typeof jsonInput !== 'string' || !jsonInput.trim()) return null;
    try {
      JSON.parse(jsonInput);
      return null;
    } catch {
      return 'Invalid JSON format';
    }
  },
};

const textDef: NodeDefinition = {
  type: 'text',
  label: 'Text',
  category: 'start',
  header: { title: 'Text', icon: <Icon icon={FiType} size={22} />, accent: 'purple' },
  description: 'Static or templated text with variable handles.',
  className: 'vs-node--text',
  focusFallbackHeight: TEXT_NODE_MIN_HEIGHT,
  fields: [
    {
      kind: 'growingTextarea',
      name: 'text',
      label: 'Text',
      placeholder: "Type '{{' to utilize variables",
      defaultValue: '{{input}}',
    },
  ],
  handles: [{ type: 'source', position: 'right', idSuffix: 'output', color: 'amber' }],
  getDynamicHandles: (data) => {
    const text = typeof data.text === 'string' ? data.text : '{{input}}';
    return buildTextVariableHandles(text);
  },
};

const definitions: NodeDefinition[] = [
  inputDef,
  outputDef,
  llmDef,
  conditionDef,
  httpRequestDef,
  mergeDef,
  noteDef,
  jsonParseDef,
  textDef,
];

const configNodes: NodeRegistryEntry[] = definitions.map((def) => ({
  type: def.type,
  label: def.label,
  category: def.category,
  component: createNodeComponent(def),
  icon: def.header.icon,
  defaultData: def.defaultData,
}));

export const nodeRegistry: NodeRegistryEntry[] = configNodes;

export const nodeTypes: Record<string, PipelineNodeComponent> = Object.fromEntries(
  nodeRegistry.map((entry) => [entry.type, entry.component])
);

export const getDefaultNodeData = (
  nodeId: string,
  type: string
): PipelineNodeData => {
  const entry = nodeRegistry.find((n) => n.type === type);
  const base: PipelineNodeData = { id: nodeId, nodeType: type };

  if (type === 'customInput') {
    return {
      ...base,
      inputName: nodeId.replace('customInput-', 'input_'),
      inputType: 'Text',
    };
  }
  if (type === 'customOutput') {
    return {
      ...base,
      outputName: nodeId.replace('customOutput-', 'output_'),
      outputType: 'Text',
      outputValue: '',
      formatOutput: true,
    };
  }
  if (type === 'text') {
    return { ...base, text: '{{input}}' };
  }

  return { ...base, ...(entry?.defaultData ?? {}) };
};

