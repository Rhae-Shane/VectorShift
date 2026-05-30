export const TEXT_VARIABLE_REGEX = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;

export const parseTextVariables = (text: string): string[] => {
  const seen = new Set<string>();
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(TEXT_VARIABLE_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }

  return variables;
};
