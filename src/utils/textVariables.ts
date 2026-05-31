import type { HandleConfig } from '../types/nodes';

/** Matches `{{variable}}` or `{{ node name }}` (trimmed inner content). */
export const TEXT_VARIABLE_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;

export const parseTextVariables = (text: string): string[] => {
  const seen = new Set<string>();
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(TEXT_VARIABLE_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    variables.push(name);
  }

  return variables;
};

export const buildTextVariableHandles = (text: string): HandleConfig[] => {
  const variables = parseTextVariables(text);

  return variables.map((varName, index) => ({
    type: 'target',
    position: 'left',
    idSuffix: varName,
    color: 'amber',
    style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
  }));
};
