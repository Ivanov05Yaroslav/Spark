import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { SimplePageHeader } from '@/components/ui/SimplePageHeader/SimplePageHeader';
import styles from './TwoColumnContentLayout.module.css';

interface TwoColumnContentLayoutProps {
    title: string;
    onBack?: () => void;
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    sidebarWidth?: string;
    showHeaderButton?: boolean;
    headerButtonText?: string;
    onHeaderButtonClick?: () => void;
    isHeaderButtonDisabled?: boolean;
    headerRightComponent?: React.ReactNode;

    fullWidthContent?: React.ReactNode;
    useSimpleHeader?: boolean;
}

export const TwoColumnContentLayout: React.FC<TwoColumnContentLayoutProps> = ({
                                                                                  title,
                                                                                  onBack,
                                                                                  children,
                                                                                  sidebarContent,
                                                                                  sidebarWidth = '320px',
                                                                                  showHeaderButton = false,
                                                                                  headerButtonText,
                                                                                  onHeaderButtonClick,
                                                                                  isHeaderButtonDisabled,
                                                                                  headerRightComponent,
                                                                                  fullWidthContent,
                                                                                  useSimpleHeader = false,
                                                                              }) => {
    return (
        <div className={styles.pageContainer}>
            {useSimpleHeader ? (
                <SimplePageHeader
                    title={title}
                    rightComponent={headerRightComponent}
                />
            ) : (
                <PageHeader
                    title={title}
                    onBack={onBack}
                    showButton={showHeaderButton}
                    buttonText={headerButtonText}
                    onButtonClick={onHeaderButtonClick}
                    isButtonDisabled={isHeaderButtonDisabled}
                    rightComponent={headerRightComponent}
                />
            )}

            {fullWidthContent && (
                <div className={styles.fullWidthWrapper}>
                    {fullWidthContent}
                </div>
            )}

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