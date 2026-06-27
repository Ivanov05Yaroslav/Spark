import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MoreIcon from '../../../assets/more.svg?react';
import EditIcon from '../../../assets/edit.svg?react';
import DeleteIcon from '../../../assets/delete.svg?react';
import ComplaintIcon from '../../../assets/complaint.svg?react';
import styles from './MoreButton.module.css';

interface MoreButtonProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onComplaint?: () => void;
}

export const MoreButton: React.FC<MoreButtonProps> = ({ onEdit, onDelete, onComplaint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete?.();
    setIsOpen(false);
  };

  const handleComplaint = () => {
    onComplaint?.();
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button type="button" className={styles.button} onClick={handleToggle}>
        <MoreIcon className={styles.icon} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles.dropdown}
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top + 8}px`,
              right: `${coords.right}px`,
            }}
          >
            {onEdit && (
              <button className={styles.menuItem} onClick={handleEdit}>
                <EditIcon className={styles.menuItemIcon} />
                Edit
              </button>
            )}
            {onDelete && (
              <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={handleDelete}>
                <DeleteIcon className={styles.menuItemIcon} />
                Delete
              </button>
            )}
            {onComplaint && (
              <button
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={handleComplaint}
              >
                <ComplaintIcon className={styles.menuItemIcon} />
                Complain
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};
