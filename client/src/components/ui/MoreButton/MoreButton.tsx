import React, { useState, useRef, useEffect } from 'react';
import MoreIcon from '../../../assets/more.svg?react';
import EditIcon from '../../../assets/edit.svg?react';
import DeleteIcon from '../../../assets/delete.svg?react';
import styles from './MoreButton.module.css';

interface MoreButtonProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MoreButton: React.FC<MoreButtonProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleEdit = () => {
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete?.();
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button type="button" className={styles.button} onClick={handleToggle}>
        <MoreIcon className={styles.icon} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.menuItem} onClick={handleEdit}>
            <EditIcon className={styles.menuItemIcon} />
            Edit
          </button>
          <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={handleDelete}>
            <DeleteIcon className={styles.menuItemIcon} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
