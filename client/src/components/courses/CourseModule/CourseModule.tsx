import React from 'react';
import styles from './CourseModule.module.css';

interface CourseModuleProps {
    title: string;
    children: React.ReactNode;
}

export const CourseModule: React.FC<CourseModuleProps> = ({ title, children }) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.itemsList}>
                {children}
            </div>
        </div>
    );
};