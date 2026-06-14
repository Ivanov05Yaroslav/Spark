import React from 'react';
import { Badge } from '../../../../components/ui/Badge/Badge';
import { MoreButton } from '../../../../components/ui/MoreButton/MoreButton';
import styles from './CourseCard.module.css';

interface CourseCardProps {
    title: string;
    imageUrl: string;
    year: string;
    group: string;
    teacherName: string;
    teacherAvatar: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
                                                          title,
                                                          imageUrl,
                                                          year,
                                                          group,
                                                          teacherName,
                                                          teacherAvatar,
                                                          onEdit,
                                                          onDelete
                                                      }) => {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <img src={imageUrl} alt={title} className={styles.image} />
            </div>

            <div className={styles.content}>
                <div className={styles.badges}>
                    <Badge>{year}</Badge>
                    <Badge>{group}</Badge>
                </div>

                <h3 className={styles.title}>{title}</h3>

                <div className={styles.footer}>
                    <div className={styles.teacherInfo}>
                        <img src={teacherAvatar} alt={teacherName} className={styles.avatar} />
                        <span className={styles.teacherName}>{teacherName}</span>
                    </div>

                    <MoreButton onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
};