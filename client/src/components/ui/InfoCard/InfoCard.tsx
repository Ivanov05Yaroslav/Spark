import React from 'react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
