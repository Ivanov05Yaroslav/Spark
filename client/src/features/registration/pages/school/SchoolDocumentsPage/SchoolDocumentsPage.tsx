import React from 'react';
import {
    SchoolDocumentsForm
} from "@/features/registration/components/forms/school/SchoolDocumentsForm/SchoolDocumentsForm";
import styles from "@/features/registration/pages/school/SchoolDocumentsPage/SchoolDocumentsPage.module.css";
import {Logo} from "@/components/ui/Logo/Logo.tsx";

export const SchoolDocumentsPage = () => {
    return (
        <div className={styles.pageWrapper}>
            <div className={`${styles.authCard} ${styles.authCardWide}`}>
                <div className={styles.logoRow}>
                    <Logo/>
                </div>
                <SchoolDocumentsForm/>
            </div>
        </div>
    );
};