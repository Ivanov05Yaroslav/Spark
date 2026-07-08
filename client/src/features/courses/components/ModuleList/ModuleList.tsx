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
import { EditModuleModal } from '@/features/courses/components/ModuleList/EditModuleModal.tsx';

export type MaterialType = 'LINK' | 'THEORY' | 'TASK' | 'TEST';

export interface ModuleItemData {
  id: string;
  type: MaterialType;
  title: string;
  subtitle?: string;
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
  const [activeItemToDelete, setActiveItemToDelete] = useState<{
    item: ModuleItemData;
    moduleId: string;
  } | null>(null);

  const [activeModuleToEdit, setActiveModuleToEdit] = useState<ModuleData | null>(null);

  const [activeModuleToDelete, setActiveModuleToDelete] = useState<ModuleData | null>(null);

  const handleConfirmItemDelete = () => {
    if (activeItemToDelete) {
      onDeleteItem?.(activeItemToDelete.item, activeItemToDelete.moduleId);
    }
    setActiveItemToDelete(null);
  };

  const handleConfirmModuleEdit = (e: React.FormEvent, newTitle: string) => {
    e.preventDefault();

    if (activeModuleToEdit && newTitle.trim()) {
      onEditModule?.(activeModuleToEdit.id, newTitle.trim());
    }
    setActiveModuleToEdit(null);
  };

  const handleConfirmModuleDelete = () => {
    if (activeModuleToDelete) {
      onDeleteModule?.(activeModuleToDelete.id);
      setActiveModuleToDelete(null);
    }
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
                onEdit={onEditModule ? () => setActiveModuleToEdit(module) : undefined}
                onDelete={onDeleteModule ? () => setActiveModuleToDelete(module) : undefined}
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
                onDelete={() => setActiveItemToDelete({ item, moduleId: module.id })}
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
