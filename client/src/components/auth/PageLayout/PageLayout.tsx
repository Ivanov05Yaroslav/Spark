import React from 'react';
import { Logo } from '../../ui/Logo/Logo.tsx';
import styles from './PageLayout.module.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const PageLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.authCard}>
                <div className={styles.logoRow}>
                    <Logo />
                </div>
                {children}
            </div>
        </div>
    );
};