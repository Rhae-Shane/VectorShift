import { useEffect, useCallback } from 'react';
import type { FC, SVGProps } from 'react';
import {
  FiCode,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
  FiPlay,
  FiHash,
} from 'react-icons/fi';
import { SubmitButton } from '../submit';
import {
  useStore,
  selectCanUndo,
  selectCanRedo,
} from '../store';
import '../styles/navbar.css';

const DotsIcon = FiMoreHorizontal as unknown as FC<SVGProps<SVGSVGElement>>;
const UndoIcon = FiCornerUpLeft as unknown as FC<SVGProps<SVGSVGElement>>;
const RedoIcon = FiCornerUpRight as unknown as FC<SVGProps<SVGSVGElement>>;
const CodeIcon = FiCode as unknown as FC<SVGProps<SVGSVGElement>>;
const VariableIcon = FiHash as unknown as FC<SVGProps<SVGSVGElement>>;
const PlayIcon = FiPlay as unknown as FC<SVGProps<SVGSVGElement>>;

export const PipelineNavbar = () => {
  const canUndo = useStore(selectCanUndo);
  const canRedo = useStore(selectCanRedo);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

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
    <header className="vs-navbar">
      <div className="vs-navbar__left">
        <a className="vs-navbar__brand" href="/" aria-label="VectorFlow home">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
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
          <button
            type="button"
            className="vs-navbar__icon-btn"
            aria-label="Undo"
            disabled={!canUndo}
            onClick={handleUndo}
          >
            <UndoIcon width={16} height={16} />
          </button>
          <button
            type="button"
            className="vs-navbar__icon-btn"
            aria-label="Redo"
            disabled={!canRedo}
            onClick={handleRedo}
          >
            <RedoIcon width={16} height={16} />
          </button>
        </div>

        <button type="button" className="vs-navbar__btn vs-navbar__btn--ghost" disabled>
          Versions
        </button>

        <button
          type="button"
          className="vs-navbar__icon-btn vs-navbar__icon-btn--desktop"
          aria-label="View code"
          disabled
        >
          <CodeIcon width={16} height={16} />
        </button>

        <button
          type="button"
          className="vs-navbar__icon-btn vs-navbar__icon-btn--desktop"
          aria-label="Variables"
          disabled
        >
          <VariableIcon width={16} height={16} />
        </button>

        <button type="button" className="vs-navbar__btn vs-navbar__btn--ghost vs-navbar__btn--desktop" disabled>
          Share
        </button>

        <button
          type="button"
          className="vs-navbar__btn vs-navbar__btn--run vs-navbar__btn--desktop"
          disabled
          aria-label="Run pipeline"
        >
          <PlayIcon width={14} height={14} fill="currentColor" />
          Run
        </button>

        <SubmitButton
          className="vs-navbar__btn vs-navbar__btn--primary"
          label="Submit"
        />

        <button
          type="button"
          className="vs-navbar__icon-btn vs-navbar__menu-btn"
          aria-label="More actions"
        >
          <DotsIcon width={16} height={16} />
        </button>
      </div>
    </header>
  );
};
