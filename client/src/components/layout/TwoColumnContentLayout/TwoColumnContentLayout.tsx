import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from './TwoColumnContentLayout.module.css';

interface TwoColumnContentLayoutProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    sidebarWidth?: string;
}

export const TwoColumnContentLayout: React.FC<TwoColumnContentLayoutProps> = ({
                                                                                  title,
                                                                                  onBack,
                                                                                  children,
                                                                                  sidebarContent,
                                                                                  sidebarWidth = '320px',
                                                                              }) => {
    return (
        <div className={styles.pageContainer}>
            <PageHeader title={title} onBack={onBack} />

            <div className={styles.layoutWrapper}>
                <div
                    className={styles.layoutGrid}
                    style={{ gridTemplateColumns: `1fr ${sidebarWidth}` }}
                >
                    <main className={styles.mainColumn}>
                        {children}
                    </main>

                    <aside className={styles.sidebarColumn}>
                        {sidebarContent}
                    </aside>
                </div>
            </div>
        </div>
    );
};