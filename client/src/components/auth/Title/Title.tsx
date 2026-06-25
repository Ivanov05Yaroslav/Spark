import React from 'react';
import styles from './Title.module.css';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const Title: React.FC<TitleProps> = ({ children, className = '', align = 'center' }) => {
  return <h1 className={`${styles.title} ${styles[align]} ${className}`}>{children}</h1>;
};
