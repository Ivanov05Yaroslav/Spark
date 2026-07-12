import React, { useState, useEffect } from 'react';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton';
import { formatToDateTime } from '@/libs/utils/date';
import EditIcon from '@/assets/edit.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import styles from './ModuleItem.module.css';

export interface AttachmentItem {
  id: string;
  title: string;
}

interface ModuleItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  tasks?: AttachmentItem[];
  tests?: AttachmentItem[];
  isMaterial?: boolean;
  onClick?: () => void;
  showMoreMenu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTask?: () => void;
  onAddTest?: () => void;
  onTaskClick?: (taskId: string) => void;
  onTestClick?: (testId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTest?: (testId: string) => void;
  onDeleteTest?: (testId: string) => void;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  description,
  date,
  tasks = [],
  tests = [],
  isMaterial = false,
  onClick,
  showMoreMenu = false,
  onEdit,
  onDelete,
  onAddTask,
  onAddTest,
  onTaskClick,
  onTestClick,
  onEditTask,
  onDeleteTask,
  onEditTest,
  onDeleteTest,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    id: string;
    type: 'task' | 'test';
    x: number;
    y: number;
  } | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: 'task' | 'test';
    title: string;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fullDateTime = formatToDateTime(date);
  const formattedDate = fullDateTime ? fullDateTime.split(' о ')[0] : null;

  const handleItemClick = (e: React.MouseEvent) => {
    setIsExpanded((prev) => !prev);
    if (onClick) onClick();
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'task' | 'test') => {
    if (!showMoreMenu) return;

    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, type, x: e.clientX, y: e.clientY });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contextMenu) return;

    const itemTitle =
      contextMenu.type === 'task'
        ? tasks.find((t) => t.id === contextMenu.id)?.title || 'це завдання'
        : tests.find((t) => t.id === contextMenu.id)?.title || 'цей тест';

    setItemToDelete({
      id: contextMenu.id,
      type: contextMenu.type,
      title: itemTitle,
    });
    setContextMenu(null);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'task') {
        onDeleteTask?.(itemToDelete.id);
      } else {
        onDeleteTest?.(itemToDelete.id);
      }
    }
    setItemToDelete(null);
  };

  return (
    <>
      <div className={styles.container} onClick={handleItemClick}>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.titleWrapper}>
              <Icon className={styles.icon} />
              <span className={styles.title}>{title}</span>
            </div>

            <div className={styles.topRowRight}>
              {!isMaterial && formattedDate && <span className={styles.date}>{formattedDate}</span>}

              {showMoreMenu && (
                <div className={styles.moreMenuWrapper} onClick={(e) => e.stopPropagation()}>
                  <MoreButton onEdit={onEdit} onDelete={onDelete} />
                </div>
              )}
            </div>
          </div>

          {!isMaterial && subtitle && <span className={styles.subtitle}>{subtitle}</span>}

          {!isMaterial && description && isExpanded && (
            <div className={styles.descriptionSection}>
              <p className={styles.description}>{description}</p>
            </div>
          )}

          {!isMaterial && (
            <div className={styles.attachmentsSection} onClick={(e) => e.stopPropagation()}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.badge}
                  onContextMenu={(e) => handleContextMenu(e, task.id, 'task')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick?.(task.id);
                  }}
                >
                  Завдання: {task.title}
                </div>
              ))}

              {tests.map((test) => (
                <div
                  key={test.id}
                  className={styles.badge}
                  onContextMenu={(e) => handleContextMenu(e, test.id, 'test')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestClick?.(test.id);
                  }}
                >
                  Тест: {test.title}
                </div>
              ))}

              {showMoreMenu && (
                <>
                  {tasks.length === 0 && (
                    <button
                      className={styles.addBadgeBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddTask) onAddTask();
                      }}
                    >
                      + Додати завдання
                    </button>
                  )}
                  {tests.length === 0 && (
                    <button
                      className={styles.addBadgeBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddTest) onAddTest();
                      }}
                    >
                      + Додати тест
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {contextMenu && (
          <div
            className={styles.contextMenu}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.menuItem}
              onClick={() => {
                contextMenu.type === 'task'
                  ? onEditTask?.(contextMenu.id)
                  : onEditTest?.(contextMenu.id);
                setContextMenu(null);
              }}
            >
              <EditIcon className={styles.menuItemIcon} />
              Редагувати
            </button>

            <button
              className={`${styles.menuItem} ${styles.deleteItem}`}
              onClick={handleDeleteClick}
            >
              <DeleteIcon className={styles.menuItemIcon} />
              Видалити
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.title || 'цей елемент'}
      />
    </>
  );
};
