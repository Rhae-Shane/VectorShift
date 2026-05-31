import { useEffect, useCallback, useState } from 'react';
import {
  FiCornerUpLeft,
  FiCornerUpRight,
  FiPlay,
} from 'react-icons/fi';
import { Icon } from './Icon';
import { PressableButton } from './PressableButton';
import { DisabledHoverHint } from './DisabledHoverHint';
import { ThemeToggleButton } from './ThemeToggleButton';
import { SubmitButton } from '../submit';
import {
  useStore,
  selectCanUndo,
  selectCanRedo,
} from '../store';
import { openCanvasPreview } from '../utils/canvasEvents';
import { PipelineImportModal } from './PipelineImportModal';
import { PipelineShareModal } from './PipelineShareModal';
import { KeyboardShortcutsPopover } from './KeyboardShortcutsPopover';
import { NavbarOverflowMenu } from './NavbarOverflowMenu';
import { EMPTY_CANVAS_HINT } from '../constants/canvas';
import { useTheme } from '../hooks/useTheme';
import '../styles/navbar.css';

export const PipelineNavbar = () => {
  const { isDark } = useTheme();
  const canUndo = useStore(selectCanUndo);
  const canRedo = useStore(selectCanRedo);
  const hasNodes = useStore((s) => s.nodes.length > 0);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const importPipeline = useStore((s) => s.importPipeline);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const handleImport = useCallback(
    (raw: string) => importPipeline(raw),
    [importPipeline]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      if (event.key === 'z' || event.key === 'Z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (event.key === 'y' || event.key === 'Y') {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <>
      <header className="vs-navbar">
        <div className="vs-navbar__left">
          <a className="vs-navbar__brand" href="/" aria-label="VectorFlow home">
            <img
              src={`${process.env.PUBLIC_URL}/${isDark ? 'logo-dark.svg' : 'logo-light.svg'}`}
              alt=""
              className="vs-navbar__logo"
            />
          </a>
          <span className="vs-navbar__sep" aria-hidden="true">
            /
          </span>
          <span className="vs-navbar__brand-name">VectorFlow</span>
        </div>

        <h1 className="vs-navbar__center">Workflow</h1>

        <div className="vs-navbar__right">
          <div className="vs-navbar__right-group">
            <PressableButton
              className="vs-navbar__icon-btn"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={handleUndo}
            >
              <Icon icon={FiCornerUpLeft} width={16} height={16} />
            </PressableButton>
            <PressableButton
              className="vs-navbar__icon-btn"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={handleRedo}
            >
              <Icon icon={FiCornerUpRight} width={16} height={16} />
            </PressableButton>
            <ThemeToggleButton />
            <KeyboardShortcutsPopover />
          </div>

          <PressableButton
            className="vs-navbar__btn vs-navbar__btn--ghost vs-navbar__btn--desktop"
            onClick={() => setImportOpen(true)}
          >
            Import
          </PressableButton>

          <DisabledHoverHint showHint={!hasNodes} hint={EMPTY_CANVAS_HINT}>
            <PressableButton
              className="vs-navbar__btn vs-navbar__btn--ghost vs-navbar__btn--desktop"
              disabled={!hasNodes}
              onClick={() => setShareOpen(true)}
            >
              Share
            </PressableButton>
          </DisabledHoverHint>

          <DisabledHoverHint showHint={!hasNodes} hint={EMPTY_CANVAS_HINT}>
            <PressableButton
              className="vs-navbar__btn vs-navbar__btn--run vs-navbar__btn--desktop"
              disabled={!hasNodes}
              aria-label="Preview pipeline"
              onClick={openCanvasPreview}
            >
              <Icon icon={FiPlay} width={14} height={14} fill="currentColor" />
              Preview
            </PressableButton>
          </DisabledHoverHint>

          <SubmitButton
            className="vs-navbar__btn vs-navbar__btn--primary"
            label="Submit"
          />

          <NavbarOverflowMenu
            hasNodes={hasNodes}
            onImport={() => setImportOpen(true)}
            onShare={() => setShareOpen(true)}
            onPreview={openCanvasPreview}
          />
        </div>
      </header>

      <PipelineImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <PipelineShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
};
