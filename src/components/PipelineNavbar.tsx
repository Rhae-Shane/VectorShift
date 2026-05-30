import { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import type { FC, SVGProps } from 'react';
import {
  FiChevronDown,
  FiCode,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
  FiPlay,
  FiSidebar,
  FiHash,
} from 'react-icons/fi';
import { SubmitButton } from '../submit';
import {
  useStore,
  selectCanUndo,
  selectCanRedo,
} from '../store';
import '../styles/navbar.css';

const SidebarIcon = FiSidebar as unknown as FC<SVGProps<SVGSVGElement>>;
const DotsIcon = FiMoreHorizontal as unknown as FC<SVGProps<SVGSVGElement>>;
const UndoIcon = FiCornerUpLeft as unknown as FC<SVGProps<SVGSVGElement>>;
const RedoIcon = FiCornerUpRight as unknown as FC<SVGProps<SVGSVGElement>>;
const CodeIcon = FiCode as unknown as FC<SVGProps<SVGSVGElement>>;
const VariableIcon = FiHash as unknown as FC<SVGProps<SVGSVGElement>>;
const PlayIcon = FiPlay as unknown as FC<SVGProps<SVGSVGElement>>;

type ViewTabId = 'workflow' | 'interface' | 'analytics' | 'manager' | 'playground';

const VIEW_TABS: { id: ViewTabId; label: string }[] = [
  { id: 'workflow', label: 'Workflow' },
  { id: 'interface', label: 'Interface' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'manager', label: 'Manager' },
  { id: 'playground', label: 'Playground' },
];

const BREADCRUMB = [
  { label: 'Projects', isCurrent: false },
  { label: 'New Project', isCurrent: false },
  { label: 'New Workflow', isCurrent: true },
] as const;

export const PipelineNavbar = () => {
  const [activeView, setActiveView] = useState<ViewTabId>('workflow');
  const [indicator, setIndicator] = useState({ left: 4, width: 77 });
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<ViewTabId, HTMLButtonElement>>>({});
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

  useLayoutEffect(() => {
    const btn = tabRefs.current[activeView];
    const list = tabListRef.current;
    if (!btn || !list) return;

    const listRect = list.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - listRect.left,
      width: btnRect.width,
    });
  }, [activeView]);

  return (
    <header className="vs-navbar">
      <div className="vs-navbar__left">
        <button
          type="button"
          className="vs-navbar__sidebar-btn"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon width={16} height={16} />
        </button>

        <nav className="vs-navbar__breadcrumb" aria-label="Breadcrumb">
          <ol className="vs-navbar__breadcrumb-list">
            {BREADCRUMB.map((item, index) => (
              <li key={item.label} className="vs-navbar__breadcrumb-item">
                {index > 0 && (
                  <span className="vs-navbar__breadcrumb-sep" aria-hidden>
                    /
                  </span>
                )}
                {item.isCurrent ? (
                  <button type="button" className="vs-navbar__breadcrumb-current">
                    <span className="vs-navbar__breadcrumb-text">{item.label}</span>
                  </button>
                ) : (
                  <button type="button" className="vs-navbar__breadcrumb-link">
                    <span className="vs-navbar__breadcrumb-text">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <button
          type="button"
          className="vs-navbar__breadcrumb-menu vs-navbar__breadcrumb-menu--mobile"
          aria-label="More breadcrumb options"
        >
          <DotsIcon width={16} height={16} />
        </button>
      </div>

      <div className="vs-navbar__center">
        <div className="vs-navbar__view-tabs" role="tablist" aria-label="View">
          <div className="vs-navbar__view-tabs-inner" ref={tabListRef}>
            <div
              className="vs-navbar__view-indicator"
              style={{
                left: indicator.left,
                width: indicator.width,
              }}
              aria-hidden
            />
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeView === tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el ?? undefined;
                }}
                className={`vs-navbar__view-tab ${
                  activeView === tab.id ? 'vs-navbar__view-tab--active' : ''
                }`}
                onClick={() => setActiveView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="vs-navbar__view-dropdown vs-navbar__view-dropdown--mobile"
          aria-haspopup="listbox"
        >
          Workflow
          <ChevronDownIcon />
        </button>
      </div>

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

const ChevronDownIcon = FiChevronDown as unknown as FC<SVGProps<SVGSVGElement>>;
