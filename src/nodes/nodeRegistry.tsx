import { createNodeComponent } from './createNode';
import { TextNode } from './textNode';
import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiCpu,
  FiGitBranch,
  FiGlobe,
  FiPlusCircle,
  FiEdit3,
  FiCode,
  FiType,
} from 'react-icons/fi';
import type { FC, SVGProps } from 'react';
import type {
  NodeDefinition,
  NodeRegistryEntry,
  PipelineNodeData,
  PipelineNodeComponent,
} from '../types/nodes';

const ArrowDownIcon = FiArrowDownCircle as unknown as FC<SVGProps<SVGSVGElement>>;
const ArrowUpIcon = FiArrowUpCircle as unknown as FC<SVGProps<SVGSVGElement>>;
const CpuIcon = FiCpu as unknown as FC<SVGProps<SVGSVGElement>>;
const BranchIcon = FiGitBranch as unknown as FC<SVGProps<SVGSVGElement>>;
const GlobeIcon = FiGlobe as unknown as FC<SVGProps<SVGSVGElement>>;
const PlusIcon = FiPlusCircle as unknown as FC<SVGProps<SVGSVGElement>>;
const EditIcon = FiEdit3 as unknown as FC<SVGProps<SVGSVGElement>>;
const CodeIcon = FiCode as unknown as FC<SVGProps<SVGSVGElement>>;
const TypeIcon = FiType as unknown as FC<SVGProps<SVGSVGElement>>;

const inputDef: NodeDefinition = {
  type: 'customInput',
  label: 'Input',
  category: 'start',
  header: { title: 'Input', icon: <ArrowDownIcon />, accent: 'blue' },
  fields: [
    { kind: 'text', name: 'inputName', label: 'Name', defaultValue: '' },
    {
      kind: 'select',
      name: 'inputType',
      label: 'Type',
      options: ['Text', 'File'],
      defaultValue: 'Text',
    },
  ],
  handles: [{ type: 'source', position: 'right', idSuffix: 'value' }],
};

const outputDef: NodeDefinition = {
  type: 'customOutput',
  label: 'Output',
  category: 'start',
  header: { title: 'Output', icon: <ArrowUpIcon />, accent: 'green' },
  fields: [
    { kind: 'text', name: 'outputName', label: 'Name', defaultValue: '' },
    {
      kind: 'select',
      name: 'outputType',
      label: 'Type',
      options: ['Text', 'Image'],
      defaultValue: 'Text',
    },
  ],
  handles: [{ type: 'target', position: 'left', idSuffix: 'value' }],
};

const llmDef: NodeDefinition = {
  type: 'llm',
  label: 'LLM',
  category: 'ai',
  header: { title: 'LLM', icon: <CpuIcon />, accent: 'purple' },
  staticContent: 'Large language model node for prompt processing.',
  handles: [
    {
      type: 'target',
      position: 'left',
      idSuffix: 'system',
      style: { top: '33%' },
    },
    {
      type: 'target',
      position: 'left',
      idSuffix: 'prompt',
      style: { top: '66%' },
    },
    { type: 'source', position: 'right', idSuffix: 'response' },
  ],
};

const conditionDef: NodeDefinition = {
  type: 'condition',
  label: 'Condition',
  category: 'logic',
  header: { title: 'Condition', icon: <BranchIcon />, accent: 'orange' },
  fields: [
    {
      kind: 'text',
      name: 'conditionInput',
      label: 'Input',
      placeholder: "Type '{{' to utilize variables",
    },
    {
      kind: 'select',
      name: 'operator',
      label: 'Operator',
      options: ['equals', 'contains', 'greater than', 'less than'],
      defaultValue: 'equals',
    },
    {
      kind: 'text',
      name: 'compareValue',
      label: 'Value',
      placeholder: 'Comparison value',
    },
  ],
  handles: [
    { type: 'target', position: 'left', idSuffix: 'input' },
    { type: 'source', position: 'right', idSuffix: 'true' },
    {
      type: 'source',
      position: 'right',
      idSuffix: 'false',
      style: { top: '70%' },
    },
  ],
};

const httpRequestDef: NodeDefinition = {
  type: 'httpRequest',
  label: 'HTTP Request',
  category: 'integrations',
  header: { title: 'HTTP Request', icon: <GlobeIcon />, accent: 'teal' },
  minWidth: 260,
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
  ],
  handles: [
    { type: 'target', position: 'left', idSuffix: 'body' },
    { type: 'source', position: 'right', idSuffix: 'response' },
  ],
};

const mergeDef: NodeDefinition = {
  type: 'merge',
  label: 'Merge',
  category: 'data',
  header: { title: 'Merge', icon: <PlusIcon />, accent: 'indigo' },
  staticContent: 'Combines multiple inputs into one output.',
  handles: [
    { type: 'target', position: 'left', idSuffix: 'a', style: { top: '25%' } },
    { type: 'target', position: 'left', idSuffix: 'b', style: { top: '50%' } },
    { type: 'target', position: 'left', idSuffix: 'c', style: { top: '75%' } },
    { type: 'source', position: 'right', idSuffix: 'merged' },
  ],
};

const noteDef: NodeDefinition = {
  type: 'note',
  label: 'Note',
  category: 'start',
  header: { title: 'Note', icon: <EditIcon />, accent: 'gray' },
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
  header: { title: 'JSON Parse', icon: <CodeIcon />, accent: 'teal' },
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
    { type: 'target', position: 'left', idSuffix: 'input' },
    { type: 'source', position: 'right', idSuffix: 'parsed' },
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

const definitions: NodeDefinition[] = [
  inputDef,
  outputDef,
  llmDef,
  conditionDef,
  httpRequestDef,
  mergeDef,
  noteDef,
  jsonParseDef,
];

const configNodes: NodeRegistryEntry[] = definitions.map((def) => ({
  type: def.type,
  label: def.label,
  category: def.category,
  component: createNodeComponent(def),
  icon: def.header.icon,
  defaultData: def.defaultData,
}));

export const nodeRegistry: NodeRegistryEntry[] = [
  ...configNodes,
  {
    type: 'text',
    label: 'Text',
    category: 'start',
    component: TextNode as PipelineNodeComponent,
    icon: <TypeIcon />,
  },
];

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
    };
  }
  if (type === 'text') {
    return { ...base, text: '{{input}}' };
  }

  return { ...base, ...(entry?.defaultData ?? {}) };
};

