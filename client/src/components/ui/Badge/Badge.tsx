import { type HTMLAttributes } from 'react';
import styles from './Badge.module.css';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  themeColor?: string;
}

export const Badge = ({
  children,
  className = '',
  themeColor = 'purple',
  ...props
}: BadgeProps) => {
  const theme = DEFAULT_THEME_COLORS.find((c) => c.value === themeColor) || DEFAULT_THEME_COLORS[0];
  const baseColor = theme.base;

  return (
    <span
      className={`${styles.badge} ${className}`}
      style={{
        color: baseColor,
        backgroundColor: `color-mix(in srgb, ${baseColor} 15%, transparent)`,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
