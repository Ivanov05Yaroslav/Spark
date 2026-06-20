import React, { ReactNode } from 'react';
import styles from './CenteredFormLayout.module.css';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

interface CenteredFormLayoutProps {
    title: string;
    onBack: () => void;
    showButton?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    isButtonDisabled?: boolean;
    children: ReactNode;
    maxWidth?: string;
}

export const CenteredFormLayout = ({
                                       title,
                                       onBack,
                                       showButton = false,
                                       buttonText,
                                       onButtonClick,
                                       isButtonDisabled = false,
                                       children,
                                       maxWidth = '680px'
                                   }: CenteredFormLayoutProps) => {
    return (
        <div className={styles.layoutContainer}>
            <PageHeader
                title={title}
                onBack={onBack}
                showButton={showButton}
                buttonText={buttonText}
                onButtonClick={onButtonClick}
                isButtonDisabled={isButtonDisabled}
            />

            <div className={styles.content}>
                <div className={styles.formContainer} style={{ maxWidth }}>
                    {children}
                </div>
            </div>
        </div>
    );
};