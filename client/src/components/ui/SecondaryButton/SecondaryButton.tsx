import React from 'react';
import styles from './SecondaryButton.module.css';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  themeColor?: string;
  variantColor?: 'green' | 'yellow' | 'red' | 'default';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  icon,
  children,
  className = '',
  themeColor,
  variantColor,
  style,
  ...props
}) => {
  let dynamicStyles = {};

  if (variantColor) {
    const variantColors = {
      green: { text: '#059669', bg: '#D1FAE5' },
      yellow: { text: '#D97706', bg: '#FEF3C7' },
      red: { text: '#DC2626', bg: '#FEE2E2' },
      default: { text: '#702DFF', bg: '#F5F3FF' },
    };

    const { text, bg } = variantColors[variantColor];
    dynamicStyles = {
      '--btn-color': text,
      '--btn-color-hover': text,
      '--btn-bg': bg,
      '--btn-bg-hover': bg,
      '--btn-bg-active': bg,
    };
  } else if (themeColor) {
    const theme =
      DEFAULT_THEME_COLORS.find((c) => c.value === themeColor) || DEFAULT_THEME_COLORS[0];
    const baseColor = theme.base;

    dynamicStyles = {
      '--btn-color': baseColor,
      '--btn-color-hover': baseColor,
      '--btn-bg': `${baseColor}1A`,
      '--btn-bg-hover': `${baseColor}2E`,
      '--btn-bg-active': `${baseColor}40`,
    };
  }

  return (
    <button
      type="button"
      className={`${styles.secondaryButton} ${className}`.trim()}
      style={{ ...dynamicStyles, ...style } as React.CSSProperties}
      {...props}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};
