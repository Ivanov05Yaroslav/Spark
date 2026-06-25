import { type HTMLAttributes } from 'react';
import styles from './Divider.module.css';

export type DividerProps = HTMLAttributes<HTMLHRElement>;

export const Divider = ({ className = '', ...props }: DividerProps) => {
  return <hr className={`${styles.divider} ${className}`.trim()} {...props} />;
};

Divider.displayName = 'Divider';
