import React, { useState, useRef, useEffect } from 'react';

import PlusIcon from '@/assets/plus.svg?react';
import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import TaskIcon from '@/assets/task.svg?react';
import TestIcon from '@/assets/test.svg?react';

import styles from './CourseCreateButton.module.css';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';

interface CourseCreateButtonProps {
  onCreateModule: () => void;
  onCreateMaterial: () => void;
  onCreateTask: () => void;
  onCreateTest: () => void;
  onCreateAnnouncement: () => void;
  themeColor?: string;
}

export const CourseCreateButton: React.FC<CourseCreateButtonProps> = ({
  onCreateModule,
  onCreateMaterial,
  onCreateTask,
  onCreateTest,
  onCreateAnnouncement,
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
    <div className={styles.container} ref={containerRef}>
      <SecondaryButton
        onClick={handleToggle}
        icon={<PlusIcon style={{ width: '20px', height: '20px' }} />}
      >
        Створити
      </SecondaryButton>

      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.menuItem} onClick={() => handleAction(onCreateModule)}>
            <LinkIcon className={styles.menuIcon} />
            Посилання
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateMaterial)}>
            <TheoryIcon className={styles.menuIcon} />
            Теоретичний матеріал
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateTask)}>
            <TaskIcon className={styles.menuIcon} />
            Завдання
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateTest)}>
            <TestIcon className={styles.menuIcon} />
            Тест
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateAnnouncement)}>
            <TestIcon className={styles.menuIcon} />
            Оголошення
          </button>
        </div>
      )}
    </div>
  );
};
