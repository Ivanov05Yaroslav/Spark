import React from 'react';
import EditIcon from '@/assets/edit.svg?react';
import styles from './CourseBanner.module.css';

export interface CourseBannerProps {
    title: string;
    description?: string;
    themeColor?: string;
    backgroundImage?: string | null;
    teacherName: string;
    onEdit?: () => void;
}

export const CourseBanner: React.FC<CourseBannerProps> = ({
                                                              title,
                                                              description,
                                                              themeColor = '#702DFF',
                                                              backgroundImage,
                                                              teacherName,
                                                              onEdit
                                                          }) => {
    const backgroundStyle = backgroundImage
        ? { backgroundImage: `url(${backgroundImage})` }
        : { backgroundColor: themeColor };

    return (
        <div className={styles.bannerContainer} style={backgroundStyle}>
            {backgroundImage && <div className={styles.overlay} />}

            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <h1 className={styles.title}>{title}</h1>
                    {description && <p className={styles.description}>{description}</p>}
                </div>

                <div className={styles.teacherInfo}>
                    Викладач: <span className={styles.teacherName}>{teacherName}</span>
                </div>
            </div>

            {onEdit && (
                <button
                    className={styles.editButton}
                    onClick={onEdit}
                    aria-label="Редагувати курс"
                >
                    <EditIcon />
                </button>
            )}
        </div>
    );
};