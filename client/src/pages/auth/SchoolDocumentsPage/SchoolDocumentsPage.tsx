import React from 'react';
import { SchoolDocumentsForm } from '@/features/auth/components/SchoolDocumentsForm/SchoolDocumentsForm.tsx';
import styles from '@/pages/auth/SchoolDocumentsPage/SchoolDocumentsPage.module.css';
import { Logo } from '@/components/ui/Logo/Logo.tsx';

export const SchoolDocumentsPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.authCard} ${styles.authCardWide}`}>
        <div className={styles.logoRow}>
          <Logo />
        </div>
        <SchoolDocumentsForm />
      </div>
    </div>
  );
};
