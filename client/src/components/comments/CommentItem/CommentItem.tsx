import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar.tsx';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import styles from './CommentItem.module.css';
import CheckIcon from '@/assets/tick.svg?react';

export interface CommentProps {
  id: string;
  isOwner?: boolean;
  isEditable?: boolean;
  author: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  content: string;
  onEdit?: (commentId: string) => void;
  onSaveEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onComplaint?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentProps> = ({
  id,
  isOwner,
  isEditable,
  author,
  timestamp,
  content,
  onEdit,
  onSaveEdit,
  onDelete,
  onComplaint,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasActions = Boolean(onSaveEdit || onDelete || onComplaint);

  useEffect(() => {
    setEditedContent(content);
    if (isEditing) {
      setIsEditing(false);
    }
  }, [content]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    if (onEdit) onEdit(id);
  };

  const handleSave = () => {
    if (editedContent.trim() !== content && onSaveEdit) {
      onSaveEdit(id, editedContent);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`${styles.container} ${isEditing ? styles.isEditing : ''}`}>
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

        {isEditing ? (
          <div className={styles.editContainer}>
            <Input
              ref={inputRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={styles.editInput}
              placeholder="Редагувати коментар"
              onKeyDown={handleInputKeyDown}
            />
            <button className={styles.saveButton} onClick={handleSave} title="Зберегти">
              <CheckIcon className={styles.saveIcon} />
            </button>
          </div>
        ) : (
          <div className={styles.text}>{content}</div>
        )}
      </div>

      <div className={styles.actions}>
        {!isEditing && hasActions && (
          <MoreButton
            onEdit={onSaveEdit ? handleEditClick : undefined}
            onDelete={onDelete ? () => onDelete(id) : undefined}
            onComplaint={onComplaint ? () => onComplaint(id) : undefined}
          />
        )}
      </div>
    </div>
  );
};
