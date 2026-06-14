import { type HTMLAttributes } from 'react';
import styles from './Badge.module.css';

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const Badge = ({ children, className = '', ...props }: BadgeProps) => {
    return (
        <span className={`${styles.badge} ${className}`} {...props}>
      {children}
    </span>
    );
};