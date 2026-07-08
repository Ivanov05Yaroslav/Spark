import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MoreIcon from '../../../assets/more.svg?react';
import EditIcon from '../../../assets/edit.svg?react';
import ArchiveIcon from '../../../assets/archive.svg?react';
import DeleteIcon from '../../../assets/delete.svg?react';
import ComplaintIcon from '../../../assets/complaint.svg?react';
import HideIcon from '../../../assets/hidden.svg?react';
import ShowIcon from '../../../assets/unhidden.svg?react';
import styles from './MoreButton.module.css';

interface MoreButtonProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onComplaint?: () => void;
  onArchive?: () => void;
  onUnArchive?: () => void;
  onHide?: () => void;
  onShow?: () => void;
}

export const MoreButton: React.FC<MoreButtonProps> = ({
  onEdit,
  onDelete,
  onComplaint,
  onArchive,
  onUnArchive,
  onHide,
  onShow,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  const handleAction = (action?: () => void) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (action) action();
      setIsOpen(false);
    };
  };

  useEffect(() => {
    if (!isOpen) return;

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

    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, updateCoords]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button className={styles.button} onClick={handleToggle} type="button">
        <MoreIcon className={styles.icon} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles.dropdown}
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              right: `${coords.right}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button className={styles.menuItem} onClick={handleAction(onEdit)}>
                <EditIcon className={styles.menuItemIcon} />
                Редагувати
              </button>
            )}
            {onHide && (
              <button className={styles.menuItem} onClick={handleAction(onHide)}>
                <HideIcon className={styles.menuItemIcon} />
                Зробити запланованим
              </button>
            )}
            {onShow && (
              <button className={styles.menuItem} onClick={handleAction(onShow)}>
                <ShowIcon className={styles.menuItemIcon} />
                Зробити незапланованим
              </button>
            )}
            {onArchive && (
              <button className={styles.menuItem} onClick={handleAction(onArchive)}>
                <ArchiveIcon className={styles.menuItemIcon} />
                Архівувати
              </button>
            )}
            {onUnArchive && (
              <button className={styles.menuItem} onClick={handleAction(onUnArchive)}>
                <ArchiveIcon className={styles.menuItemIcon} />
                Розархівувати
              </button>
            )}
            {onDelete && (
              <button
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={handleAction(onDelete)}
              >
                <DeleteIcon className={styles.menuItemIcon} />
                Видалити
              </button>
            )}
            {onComplaint && (
              <button
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={handleAction(onComplaint)}
              >
                <ComplaintIcon className={styles.menuItemIcon} />
                Поскаржитися
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};
