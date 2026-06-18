import React from 'react';
import styles from './ContentCard.module.css';

interface ContentCardProps {
    title?: string;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
                                                            title,
                                                            headerRight,
                                                            children,
                                                            className = '',
                                                            noPadding = false,
                                                        }) => {
    const hasHeader = Boolean(title || headerRight);

    return (
        <div className={`${styles.card} ${className}`}>
            {hasHeader && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {headerRight && <div className={styles.headerRight}>{headerRight}</div>}
                </div>
            )}

            <div className={`
                ${styles.body} 
                ${noPadding ? styles.noPadding : ''} 
                ${!hasHeader ? styles.bodyWithoutHeader : ''}
            `}>
                {children}
            </div>
        </div>
    );
};