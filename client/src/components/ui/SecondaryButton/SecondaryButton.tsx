import React from 'react';
import styles from './SecondaryButton.module.css';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
                                                                    icon,
                                                                    children,
                                                                    className,
                                                                    ...props
                                                                }) => {
    return (
        <button
            type="button"
            className={`${styles.secondaryButton} ${className || ''}`}
            {...props}
        >
            {icon && <span className={styles.iconWrapper}>{icon}</span>}
            <span>{children}</span>
        </button>
    );
};