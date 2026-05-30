import { useLayoutEffect, useState, type RefObject } from 'react';
import {
  TEXT_NODE_FIELD_HORIZONTAL_PAD,
  TEXT_NODE_MAX_HEIGHT,
  TEXT_NODE_MAX_TEXTAREA_HEIGHT,
  TEXT_NODE_MAX_WIDTH,
  TEXT_NODE_MIN_HEIGHT,
  TEXT_NODE_MIN_TEXTAREA_HEIGHT,
  TEXT_NODE_MIN_WIDTH,
  TEXT_NODE_VERTICAL_CHROME,
  NODE_DEFAULT_WIDTH,
} from '../constants/nodeLayout';

export interface GrowingTextNodeSize {
  width: number;
  height: number;
}

export const useGrowingTextNodeSize = (
  text: string,
  collapsed: boolean,
  textareaRef: RefObject<HTMLTextAreaElement>,
  measureRef: RefObject<HTMLSpanElement>
): GrowingTextNodeSize => {
  const [size, setSize] = useState<GrowingTextNodeSize>({
    width: NODE_DEFAULT_WIDTH,
    height: TEXT_NODE_MIN_HEIGHT,
  });

  useLayoutEffect(() => {
    const el = textareaRef.current;
    const measure = measureRef.current;
    if (!el || !measure || collapsed) return;

    const lines = text.split('\n');
    let maxLineWidth = 0;

    measure.style.whiteSpace = 'pre';
    measure.style.maxWidth = 'none';
    measure.style.width = 'auto';

    for (const line of lines) {
      measure.textContent = line || ' ';
      maxLineWidth = Math.max(maxLineWidth, measure.scrollWidth);
    }

    const nodeWidth = Math.min(
      Math.max(maxLineWidth + TEXT_NODE_FIELD_HORIZONTAL_PAD, TEXT_NODE_MIN_WIDTH),
      TEXT_NODE_MAX_WIDTH
    );

    const textareaContentWidth = nodeWidth - TEXT_NODE_FIELD_HORIZONTAL_PAD;
    measure.style.whiteSpace = 'pre-wrap';
    measure.style.width = `${textareaContentWidth}px`;
    measure.style.maxWidth = `${textareaContentWidth}px`;
    measure.textContent = text || ' ';

    el.style.width = '100%';
    el.style.height = 'auto';
    const naturalHeight = Math.max(el.scrollHeight, TEXT_NODE_MIN_TEXTAREA_HEIGHT);
    const textareaHeight = Math.min(naturalHeight, TEXT_NODE_MAX_TEXTAREA_HEIGHT);
    el.style.height = `${textareaHeight}px`;
    el.style.overflowY = naturalHeight > TEXT_NODE_MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';

    const nodeHeight = Math.max(
      Math.min(textareaHeight + TEXT_NODE_VERTICAL_CHROME, TEXT_NODE_MAX_HEIGHT),
      TEXT_NODE_MIN_HEIGHT
    );

    setSize({ width: nodeWidth, height: nodeHeight });
  }, [text, collapsed, textareaRef, measureRef]);

  return size;
};
