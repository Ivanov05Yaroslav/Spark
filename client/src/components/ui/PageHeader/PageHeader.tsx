import React from 'react';
import styles from './PageHeader.module.css';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import ArrowLeftIcon from '@/assets/arrowLeft.svg?react';

interface PageHeaderProps {
    title: string;
    onBack?: () => void;
    showButton?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    isButtonDisabled?: boolean;
}

export const PageHeader = ({
                               title,
                               onBack,
                               showButton = false,
                               buttonText = 'Create',
                               onButtonClick,
                               isButtonDisabled = false
                           }: PageHeaderProps) => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.leftSection}>
                <button type="button" onClick={onBack} className={styles.backBtn} aria-label="Go back">
                    <ArrowLeftIcon className={styles.icon} />
                </button>
            </div>

            <h1 className={styles.title}>{title}</h1>

            <div className={styles.rightSection}>
                {showButton && (
                    <SecondaryButton
                        onClick={onButtonClick}
                        disabled={isButtonDisabled}
                    >
                        {buttonText}
                    </SecondaryButton>
                )}
            </div>
        </div>
    );
};