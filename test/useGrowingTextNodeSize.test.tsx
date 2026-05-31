import { createRef } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useGrowingTextNodeSize } from '../src/hooks/useGrowingTextNodeSize';
import {
  NODE_DEFAULT_WIDTH,
  TEXT_NODE_MAX_WIDTH,
  TEXT_NODE_MIN_HEIGHT,
  TEXT_NODE_MIN_WIDTH,
  TEXT_NODE_FIELD_HORIZONTAL_PAD,
  TEXT_NODE_VERTICAL_CHROME,
} from '../src/constants/nodeLayout';

const setupRefs = (scrollWidth: number, scrollHeight: number) => {
  const textareaRef = createRef<HTMLTextAreaElement>();
  const measureRef = createRef<HTMLSpanElement>();

  const textarea = document.createElement('textarea');
  const measure = document.createElement('span');

  Object.defineProperty(measure, 'scrollWidth', {
    configurable: true,
    get: () => scrollWidth,
  });
  Object.defineProperty(textarea, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  });

  textareaRef.current = textarea;
  measureRef.current = measure;

  return { textareaRef, measureRef };
};

describe('useGrowingTextNodeSize', () => {
  it('starts with default dimensions before measurement refs attach', () => {
    const textareaRef = createRef<HTMLTextAreaElement>();
    const measureRef = createRef<HTMLSpanElement>();

    const { result } = renderHook(() =>
      useGrowingTextNodeSize('hello', false, textareaRef, measureRef)
    );

    expect(result.current.width).toBe(NODE_DEFAULT_WIDTH);
    expect(result.current.height).toBe(TEXT_NODE_MIN_HEIGHT);
  });

  it('expands width to at least the minimum when text is short', async () => {
    const { textareaRef, measureRef } = setupRefs(80, 40);

    const { result } = renderHook(() =>
      useGrowingTextNodeSize('hi', false, textareaRef, measureRef)
    );

    await waitFor(() => {
      expect(result.current.width).toBe(TEXT_NODE_MIN_WIDTH);
    });

    expect(result.current.height).toBeGreaterThanOrEqual(TEXT_NODE_MIN_HEIGHT);
  });

  it('caps width at the maximum for long lines', async () => {
    const longLineWidth = 400;
    const { textareaRef, measureRef } = setupRefs(longLineWidth, 40);

    const { result } = renderHook(() =>
      useGrowingTextNodeSize('a very long single line', false, textareaRef, measureRef)
    );

    await waitFor(() => {
      expect(result.current.width).toBe(TEXT_NODE_MAX_WIDTH);
    });
  });

  it('includes vertical chrome in computed height', async () => {
    const textareaHeight = 48;
    const { textareaRef, measureRef } = setupRefs(120, textareaHeight);

    const { result } = renderHook(() =>
      useGrowingTextNodeSize('line one\nline two', false, textareaRef, measureRef)
    );

    await waitFor(() => {
      expect(result.current.height).toBe(
        textareaHeight + TEXT_NODE_VERTICAL_CHROME
      );
    });

    expect(result.current.width).toBe(
      Math.min(
        Math.max(120 + TEXT_NODE_FIELD_HORIZONTAL_PAD, TEXT_NODE_MIN_WIDTH),
        TEXT_NODE_MAX_WIDTH
      )
    );
  });

  it('does not resize while collapsed', async () => {
    const { textareaRef, measureRef } = setupRefs(300, 80);

    const { result, rerender } = renderHook(
      ({ collapsed }) =>
        useGrowingTextNodeSize('long text', collapsed, textareaRef, measureRef),
      { initialProps: { collapsed: true } }
    );

    expect(result.current.width).toBe(NODE_DEFAULT_WIDTH);
    expect(result.current.height).toBe(TEXT_NODE_MIN_HEIGHT);

    rerender({ collapsed: true });

    await waitFor(() => {
      expect(result.current.width).toBe(NODE_DEFAULT_WIDTH);
    });
  });
});
