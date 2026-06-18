import React from 'react';
import styles from './InfoItem.module.css';

interface InfoItemProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
    variant?: 'info' | 'task';
    className?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({
                                                      icon: Icon,
                                                      title,
                                                      subtitle,
                                                      variant = 'info',
                                                      className = ''
                                                  }) => {
    return (
        <div className={`${styles.container} ${className}`.trim()}>
            <div className={styles.iconWrapper}>
                <Icon className={styles.icon} />
            </div>

            <div className={`${styles.textContainer} ${styles[variant]}`}>
                <span className={styles.topText}>{title}</span>
                {subtitle && <span className={styles.bottomText}>{subtitle}</span>}
            </div>
        </div>
    );
};