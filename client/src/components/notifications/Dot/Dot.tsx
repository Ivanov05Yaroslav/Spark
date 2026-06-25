import { type HTMLAttributes } from 'react';
import styles from './Dot.module.css';

export type DotProps = HTMLAttributes<HTMLSpanElement>;

export const Dot = ({ className = '', ...props }: DotProps) => {
  return <span className={`${styles.dot} ${className}`.trim()} {...props} />;
};

Dot.displayName = 'Dot';
