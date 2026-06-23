import React from 'react';
import styles from './SimplePageHeader.module.css'

interface SimplePageHeaderProps {
    title: string;
    className?: string;
}

export const SimplePageHeader: React.FC<SimplePageHeaderProps> = ({ title, className = '' }) => {
    return (
        <div className={`${styles.headerContainer} ${className}`}>
            <div className={styles.leftSection} />

            <h1 className={styles.title}>{title}</h1>

            <div className={styles.rightSection} />
        </div>
    );
};