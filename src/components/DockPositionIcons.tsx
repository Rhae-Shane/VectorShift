import type { FC, ReactNode, SVGProps } from 'react';
import type { ToolbarDockPosition } from '../types/toolbarDock';

/** VS Code–style panel layout icons (rounded frame + shaded dock region). */
const DockLayoutIcon: FC<{ panel: ReactNode } & SVGProps<SVGSVGElement>> = ({
  panel,
  ...props
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="2.25"
      y="2.25"
      width="11.5"
      height="11.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.15"
    />
    {panel}
  </svg>
);

export const DockTopIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <DockLayoutIcon
    {...props}
    panel={
      <rect
        x="3.5"
        y="3.75"
        width="9"
        height="3.25"
        rx="0.85"
        fill="currentColor"
      />
    }
  />
);

export const DockRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <DockLayoutIcon
    {...props}
    panel={
      <rect
        x="9"
        y="3.5"
        width="3.25"
        height="9"
        rx="0.85"
        fill="currentColor"
      />
    }
  />
);

export const DockBottomIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <DockLayoutIcon
    {...props}
    panel={
      <rect
        x="3.5"
        y="9"
        width="9"
        height="3.25"
        rx="0.85"
        fill="currentColor"
      />
    }
  />
);

export const DockLeftIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <DockLayoutIcon
    {...props}
    panel={
      <rect
        x="3.5"
        y="3.5"
        width="3.25"
        height="9"
        rx="0.85"
        fill="currentColor"
      />
    }
  />
);

export const DOCK_POSITION_ICONS: Record<
  ToolbarDockPosition,
  FC<SVGProps<SVGSVGElement>>
> = {
  top: DockTopIcon,
  right: DockRightIcon,
  bottom: DockBottomIcon,
  left: DockLeftIcon,
};
