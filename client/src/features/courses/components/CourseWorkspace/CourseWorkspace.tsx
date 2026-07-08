import React from 'react';
import {
  OnlineLessonsBlock,
  OnlineLessonLink,
} from '@/features/courses/components/OnlineLessonsBlock/OnlineLessonsBlock';
import {
  ModuleList,
  ModuleData,
  ModuleItemData,
} from '@/features/courses/components/ModuleList/ModuleList';
import styles from './CourseWorkspace.module.css';

interface CourseWorkspaceProps {
  lessons: OnlineLessonLink[];
  modules: ModuleData[];

  onAddLesson?: (url: string) => void;
  onEditLesson?: (id: string, url: string) => void;
  onDeleteLesson?: (id: string) => void;

  onModuleItemClick?: (item: ModuleItemData, moduleId: string) => void;
  onEditModule?: (moduleId: string, newTitle: string) => void;
  onDeleteModule?: (moduleId: string) => void;

  onEditItem?: (item: ModuleItemData, moduleId: string) => void;
  onDeleteItem?: (item: ModuleItemData, moduleId: string) => void;

  showMoreMenu: boolean;
}

export const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({
  lessons,
  modules,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onModuleItemClick,
  onEditModule,
  onDeleteModule,
  onEditItem,
  onDeleteItem,
  showMoreMenu,
}) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutWrapper}>
        <div className={styles.layoutGrid}>
          <div className={styles.sidebarColumn}>
            <OnlineLessonsBlock
              links={lessons}
              onAdd={onAddLesson}
              onEditLink={onEditLesson}
              onDeleteLink={onDeleteLesson}
              showMoreMenu={showMoreMenu}
            />
          </div>

          <div className={styles.mainColumn}>
            <ModuleList
              showMoreMenu={showMoreMenu}
              modules={modules}
              onItemClick={onModuleItemClick}
              onEditModule={onEditModule}
              onDeleteModule={onDeleteModule}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
