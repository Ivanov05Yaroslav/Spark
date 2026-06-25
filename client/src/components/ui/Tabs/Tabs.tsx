import React from 'react';
import { Badge } from '../Badge/Badge';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onTabChange }) => {
  return (
    <div className={styles.tabsContainer}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className={styles.label}>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && <Badge>{item.badge}</Badge>}
          </button>
        );
      })}
    </div>
  );
};
