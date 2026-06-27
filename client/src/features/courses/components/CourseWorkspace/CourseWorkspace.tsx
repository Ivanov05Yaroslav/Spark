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
  onEditModule?: (moduleId: string) => void;
  onDeleteModule?: (moduleId: string) => void;
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
            />
          </div>

          <div className={styles.mainColumn}>
            <ModuleList
              showMoreMenu={true}
              modules={modules}
              onItemClick={onModuleItemClick}
              onEditModule={onEditModule}
              onDeleteModule={onDeleteModule}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
