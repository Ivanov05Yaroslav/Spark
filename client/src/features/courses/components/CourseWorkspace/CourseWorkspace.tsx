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
  onAddTask?: (item: ModuleItemData, moduleId: string) => void;
  onAddTest?: (item: ModuleItemData, moduleId: string) => void;
  onTaskClick?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onTestClick?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onEditTask?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onDeleteTask?: (taskId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onEditTest?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
  onDeleteTest?: (testId: string, parentItem: ModuleItemData, moduleId: string) => void;
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
  onAddTask,
  onAddTest,
  onTaskClick,
  onTestClick,
  onEditTask,
  onDeleteTask,
  onEditTest,
  onDeleteTest,
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
              onAddTask={onAddTask}
              onAddTest={onAddTest}
              onTaskClick={onTaskClick}
              onTestClick={onTestClick}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onEditTest={onEditTest}
              onDeleteTest={onDeleteTest}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
