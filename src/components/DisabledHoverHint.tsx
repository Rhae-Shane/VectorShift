import type { ReactNode } from 'react';

export interface DisabledHoverHintProps {
  showHint: boolean;
  hint: string;
  children: ReactNode;
  className?: string;
}

/** Wraps disabled controls so hover hints still receive pointer events. */
export function DisabledHoverHint({
  showHint,
  hint,
  children,
  className,
}: DisabledHoverHintProps) {
  if (!showHint) return <>{children}</>;

  return (
    <span
      className={['vs-hover-hint', className].filter(Boolean).join(' ')}
      data-hint={hint}
    >
      {children}
    </span>
  );
}
