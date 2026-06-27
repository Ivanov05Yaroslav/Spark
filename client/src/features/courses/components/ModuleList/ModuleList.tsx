import React, { useState } from 'react';
import { ModuleItem } from '@/components/courses/ModuleItem/ModuleItem';

import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import TaskIcon from '@/assets/task.svg?react';
import TestIcon from '@/assets/test.svg?react';

import styles from './ModuleList.module.css';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton.tsx';

export type MaterialType = 'LINK' | 'THEORY' | 'TASK' | 'TEST';

export interface ModuleItemData {
  id: string;
  type: MaterialType;
  title: string;
  subtitle?: string;
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
  onEditModule?: (moduleId: string) => void;
  onDeleteModule?: (moduleId: string) => void;
}

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
    default:
      return TheoryIcon;
  }
};

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  onItemClick,
  showMoreMenu,
  onEditItem,
  onDeleteItem,
  onEditModule,
  onDeleteModule,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeItemToDelete, setActiveItemToDelete] = useState<{
    item: ModuleItemData;
    moduleId: string;
  } | null>(null);

  const handleDeleteClick = (item: ModuleItemData, moduleId: string) => {
    setActiveItemToDelete({ item, moduleId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeItemToDelete) {
      onDeleteItem?.(activeItemToDelete.item, activeItemToDelete.moduleId);
    }
    setIsDeleteModalOpen(false);
    setActiveItemToDelete(null);
  };

  return (
    <div className={styles.container}>
      {modules.map((module) => (
        <ContentCard
          key={module.id}
          title={module.title}
          headerRightComponent={
            showMoreMenu && (onEditModule || onDeleteModule) ? (
              <MoreButton
                onEdit={onEditModule ? () => onEditModule(module.id) : undefined}
                onDelete={onDeleteModule ? () => onDeleteModule(module.id) : undefined}
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
                onClick={() => onItemClick?.(item, module.id)}
                showMoreMenu={showMoreMenu}
                onEdit={() => onEditItem?.(item, module.id)}
                onDelete={() => handleDeleteClick(item, module.id)}
              />
            ))
          ) : (
            <div className={styles.emptyState}>В цьому модулі немає матеріалів.</div>
          )}
        </ContentCard>
      ))}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={activeItemToDelete?.item.title || 'цей елемент'}
      />
    </div>
  );
};
