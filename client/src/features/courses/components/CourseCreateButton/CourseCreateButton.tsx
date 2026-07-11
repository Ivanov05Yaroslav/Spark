import React, { useState, useRef, useEffect } from 'react';

import PlusIcon from '@/assets/plus.svg?react';
import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import AnnouncementIcon from '@/assets/announcement.svg?react';

import styles from './CourseCreateButton.module.css';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';

interface CourseCreateButtonProps {
  onCreateLink: () => void;
  onCreateMaterial: () => void;
  onCreateTask: () => void;
  onCreateTest: () => void;
  onCreateAnnouncement: () => void;
  themeColor?: string;
}

export const CourseCreateButton: React.FC<CourseCreateButtonProps> = ({
  onCreateLink,
  onCreateMaterial,
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
          <button className={styles.menuItem} onClick={() => handleAction(onCreateLink)}>
            <LinkIcon className={styles.menuIcon} />
            Посилання
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateMaterial)}>
            <TheoryIcon className={styles.menuIcon} />
            Теоретичний матеріал
          </button>

          <button className={styles.menuItem} onClick={() => handleAction(onCreateAnnouncement)}>
            <AnnouncementIcon className={styles.menuIcon} />
            Оголошення
          </button>
        </div>
      )}
    </div>
  );
};
