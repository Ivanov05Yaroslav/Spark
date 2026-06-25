import React from 'react';
import SparkIcon from '../../../assets/logo.svg?react';
import styles from './Logo.module.css';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <SparkIcon className={styles.svgIcon} />
      <span className={styles.logoText}>SPARK</span>
    </div>
  );
};
