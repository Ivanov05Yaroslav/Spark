import React, { useState } from 'react';
import { ModuleItem, AttachmentItem } from '@/components/courses/ModuleItem/ModuleItem';

import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import TaskIcon from '@/assets/task.svg?react';
import TestIcon from '@/assets/test.svg?react';
import LessonIcon from '@/assets/openBook.svg?react';

import styles from './ModuleList.module.css';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton.tsx';
import { EditModuleModal } from '@/features/courses/components/ModuleList/EditModuleModal.tsx';

export type MaterialType = 'LINK' | 'THEORY' | 'TASK' | 'TEST' | 'LESSON';

export interface ModuleItemData {
  id: string;
  type: MaterialType;
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  tasks?: AttachmentItem[];
  tests?: AttachmentItem[];
  fileUrl?: string | null;
  linkUrl?: string | null;
}

export interface ModuleData {
  id: string;
  title: string;
  items: ModuleItemData[];
}

interface ModuleListProps {
  modules: ModuleData[];
  onItemClick?: (item: ModuleItemData, moduleId: string) => void;
  showMoreMenu?: boolean;

  onEditItem?: (item: ModuleItemData, moduleId: string) => void;
  onDeleteItem?: (item: ModuleItemData, moduleId: string) => void;
  onEditModule?: (moduleId: string, newTitle: string) => void;
  onDeleteModule?: (moduleId: string) => void;

  onAddTask?: (item: ModuleItemData, moduleId: string) => void;
  onAddTest?: (item: ModuleItemData, moduleId: string) => void;
  onTaskClick?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onTestClick?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onEditTask?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onDeleteTask?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onEditTest?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onDeleteTest?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  onItemClick,
  showMoreMenu = false,
  onEditItem,
  onDeleteItem,
  onEditModule,
  onDeleteModule,
  onAddTask,
  onAddTest,
  onTaskClick,
  onTestClick,
  onEditTask,
  onDeleteTask,
  onEditTest,
  onDeleteTest,
}) => {
  const [activeModuleToEdit, setActiveModuleToEdit] = useState<ModuleData | null>(null);
  const [activeItemToDelete, setActiveItemToDelete] = useState<{
    item: ModuleItemData;
    moduleId: string;
  } | null>(null);
  const [activeModuleToDelete, setActiveModuleToDelete] = useState<ModuleData | null>(null);

  const getIconByType = (type: MaterialType) => {
    switch (type) {
      case 'LINK':
        return LinkIcon;
      case 'THEORY':
        return TheoryIcon;
      case 'TASK':
        return TaskIcon;
      case 'TEST':
        return TestIcon;
      case 'LESSON':
        return LessonIcon;
      default:
        return TheoryIcon;
    }
  };

  const handleConfirmItemDelete = () => {
    if (activeItemToDelete && onDeleteItem) {
      onDeleteItem(activeItemToDelete.item, activeItemToDelete.moduleId);
    }
    setActiveItemToDelete(null);
  };

  const handleConfirmModuleDelete = () => {
    if (activeModuleToDelete && onDeleteModule) {
      onDeleteModule(activeModuleToDelete.id);
    }
    setActiveModuleToDelete(null);
  };

  const handleConfirmModuleEdit = (newTitle: string) => {
    if (activeModuleToEdit && onEditModule) {
      onEditModule(activeModuleToEdit.id, newTitle);
    }
    setActiveModuleToEdit(null);
  };

  return (
    <div className={styles.container}>
      {modules.map((module) => (
        <ContentCard
          key={module.id}
          title={module.title}
          headerRightComponent={
            showMoreMenu ? (
              <MoreButton
                onEdit={() => setActiveModuleToEdit(module)}
                onDelete={() => setActiveModuleToDelete(module)}
              />
            ) : undefined
          }
        >
          {module.items.length > 0 ? (
            module.items.map((item) => (
              <ModuleItem
                key={item.id}
                icon={getIconByType(item.type)}
                title={item.title}
                subtitle={item.subtitle}
                description={item.description}
                date={item.date}
                tasks={item.tasks}
                tests={item.tests}
                isMaterial={item.type !== 'LESSON'}
                onClick={() => onItemClick?.(item, module.id)}
                showMoreMenu={showMoreMenu}
                onEdit={() => onEditItem?.(item, module.id)}
                onDelete={() => setActiveItemToDelete({ item, moduleId: module.id })}
                onAddTask={() => onAddTask?.(item, module.id)}
                onAddTest={() => onAddTest?.(item, module.id)}
                onTaskClick={(taskId) => onTaskClick?.(taskId, item, module.id)}
                onTestClick={(testId) => onTestClick?.(testId, item, module.id)}
                onEditTask={(taskId) => onEditTask?.(taskId, item, module.id)}
                onDeleteTask={(taskId) => onDeleteTask?.(taskId, item, module.id)}
                onEditTest={(testId) => onEditTest?.(testId, item, module.id)}
                onDeleteTest={(testId) => onDeleteTest?.(testId, item, module.id)}
              />
            ))
          ) : (
            <div className={styles.emptyState}>В цьому модулі немає матеріалів.</div>
          )}
        </ContentCard>
      ))}

      {activeModuleToEdit && (
        <EditModuleModal
          isOpen={!!activeModuleToEdit}
          onClose={() => setActiveModuleToEdit(null)}
          initialTitle={activeModuleToEdit.title}
          onSubmit={handleConfirmModuleEdit}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!activeItemToDelete}
        onClose={() => setActiveItemToDelete(null)}
        onConfirm={handleConfirmItemDelete}
        itemName={activeItemToDelete?.item.title || 'цей елемент'}
      />

      <ConfirmDeleteModal
        isOpen={!!activeModuleToDelete}
        onClose={() => setActiveModuleToDelete(null)}
        onConfirm={handleConfirmModuleDelete}
        itemName={activeModuleToDelete?.title || 'цей модуль'}
      />
    </div>
  );
};
