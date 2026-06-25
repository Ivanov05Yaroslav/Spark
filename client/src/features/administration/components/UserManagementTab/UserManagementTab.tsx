import React from 'react';
import { ManualUserCreation } from '@/features/administration/components/UserManagementTab/ManualUserCreation.tsx';
import { BulkUserImport } from '@/features/administration/components/UserManagementTab/BulkUserImport.tsx';
import styles from './UserManagementTab.module.css';

export const UserManagementTab = () => {
  return (
    <div className={styles.contentGrid}>
      <div className={styles.formColumn}>
        <ManualUserCreation />
      </div>

      <div className={styles.divider}>АБО</div>

      <div className={styles.formColumn}>
        <BulkUserImport />
      </div>
    </div>
  );
};
