import React from 'react';
import styles from './IconActionButton.module.css';

interface IconActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
}

export const IconActionButton: React.FC<IconActionButtonProps> = ({
                                                                      icon,
                                                                      label,
                                                                      onClick,
                                                                      className = ''
                                                                  }) => {
    return (
        <button type="button" className={`${styles.container} ${className}`} onClick={onClick}>
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <span className={styles.label}>{label}</span>
        </button>
    );
};