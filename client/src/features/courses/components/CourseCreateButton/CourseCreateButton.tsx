import React, { useState, useRef, useEffect } from 'react';

import PlusIcon from '@/assets/plus.svg?react';
import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import TaskIcon from '@/assets/task.svg?react';
import TestIcon from '@/assets/test.svg?react';

import styles from './CourseCreateButton.module.css';

interface CourseCreateButtonProps {
  onCreateModule: () => void;
  onCreateTheory: () => void;
  onCreateTask: () => void;
  onCreateTest: () => void;
  themeColor?: string;
}

export const CourseCreateButton: React.FC<CourseCreateButtonProps> = ({
  onCreateModule,
  onCreateTheory,
  onCreateTask,
  onCreateTest,
  themeColor = '#702DFF',
}) => {
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

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      <button type="button" className={styles.createButton} onClick={handleToggle}>
        <PlusIcon className={styles.plusIcon} />
        Створити
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.menuItem} onClick={() => handleAction(onCreateModule)}>
            <div className={styles.iconWrapper}>
              <LinkIcon className={styles.menuIcon} />
            </div>
            Посилання
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateTheory)}>
            <div className={styles.iconWrapper}>
              <TheoryIcon className={styles.menuIcon} />
            </div>
            Теоретичний матеріал
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateTask)}>
            <div className={styles.iconWrapper}>
              <TaskIcon className={styles.menuIcon} />
            </div>
            Завдання
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateTest)}>
            <div className={styles.iconWrapper}>
              <TestIcon className={styles.menuIcon} />
            </div>
            Тест
          </button>
        </div>
      )}
    </div>
  );
};
