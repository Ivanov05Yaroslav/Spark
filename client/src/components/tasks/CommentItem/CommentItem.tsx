import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton';
import styles from './CommentItem.module.css';

export interface CommentProps {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  content: string;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentProps> = ({
  id,
  author,
  timestamp,
  content,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <Avatar src={author.avatarUrl} />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{author.name}</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>
        </div>

        <div className={styles.text}>{content}</div>
      </div>

      <div className={styles.actions}>
        <MoreButton onEdit={() => onEdit?.(id)} onDelete={() => onDelete?.(id)} />
      </div>
    </div>
  );
};
