import React from 'react';
import styles from './PrimaryButton.module.css';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, ...props }) => {
    return (
        <button className={styles.button} {...props}>
            {children}
        </button>
    );
};