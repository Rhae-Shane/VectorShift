import type { FC } from 'react';
import type { IconBaseProps, IconType } from 'react-icons/lib';

export type { IconType } from 'react-icons/lib';

export interface IconProps extends IconBaseProps {
  icon: IconType;
}

/**
 * react-icons declares IconType as returning ReactNode, which is incompatible
 * with JSX under strict React 18 types. Cast once here instead of per call site.
 */
const asSvgIcon = (icon: IconType): FC<IconBaseProps> => icon as FC<IconBaseProps>;

/** Typed wrapper for react-icons. */
export const Icon = ({ icon, ...props }: IconProps) => {
  const IconComponent = asSvgIcon(icon);
  return <IconComponent {...props} />;
};
