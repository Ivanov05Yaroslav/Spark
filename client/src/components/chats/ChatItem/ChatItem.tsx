import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './ChatItem.module.css';

export interface ChatItemProps {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick?: (id: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  id,
  name,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
      onClick={() => onClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(id);
        }
      }}
    >
      <Avatar src={avatarUrl} size={48} />

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{name}</span>
          <span className={styles.timestamp}>{timestamp}</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.lastMessage}>{lastMessage}</span>

          {unreadCount > 0 && (
            <Badge themeColor="purple" className={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
