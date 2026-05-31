import {
  parseTextVariables,
  buildTextVariableHandles,
} from '../src/utils/textVariables';

describe('parseTextVariables', () => {
  it('parses a single variable', () => {
    expect(parseTextVariables('Hello {{input}}')).toEqual(['input']);
  });

  it('parses multiple unique variables in order of first appearance', () => {
    expect(parseTextVariables('{{a}} and {{b}} plus {{a}} again')).toEqual([
      'a',
      'b',
    ]);
  });

  it('allows whitespace inside braces', () => {
    expect(parseTextVariables('{{ input }} {{  name  }}')).toEqual([
      'input',
      'name',
    ]);
  });

  it('supports names with spaces and special characters', () => {
    expect(parseTextVariables('{{node name}} {{input-name}}')).toEqual([
      'node name',
      'input-name',
    ]);
  });

  it('ignores empty variable placeholders', () => {
    expect(parseTextVariables('{{}} {{   }}')).toEqual([]);
  });

  it('returns an empty array when no variables are present', () => {
    expect(parseTextVariables('plain text')).toEqual([]);
  });
});

describe('buildTextVariableHandles', () => {
  it('creates a left target handle per variable', () => {
    const handles = buildTextVariableHandles('{{input}}');

    expect(handles).toHaveLength(1);
    expect(handles[0]).toMatchObject({
      type: 'target',
      position: 'left',
      idSuffix: 'input',
      color: 'amber',
    });
  });

  it('distributes handle positions evenly', () => {
    const handles = buildTextVariableHandles('{{a}} {{b}}');

    expect(parseFloat(String(handles[0].style?.top))).toBeCloseTo(33.333, 2);
    expect(parseFloat(String(handles[1].style?.top))).toBeCloseTo(66.667, 2);
  });

  it('deduplicates repeated variables', () => {
    const handles = buildTextVariableHandles('{{x}} {{x}} {{y}}');

    expect(handles.map((handle) => handle.idSuffix)).toEqual(['x', 'y']);
  });
});
