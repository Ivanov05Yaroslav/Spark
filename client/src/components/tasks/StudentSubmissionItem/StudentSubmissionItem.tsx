import React from 'react';
import styles from './StudentSubmissionItem.module.css';

export type SubmissionStatus = 'Graded' | 'Turned in' | 'Assigned' | 'Missing';

interface StudentSubmissionItemProps {
    studentName: string;
    avatarUrl?: string;
    status: SubmissionStatus;
    grade?: string | number | null;
    isActive?: boolean;
    onClick?: () => void;
}

export const StudentSubmissionItem: React.FC<StudentSubmissionItemProps> = ({
                                                                                studentName,
                                                                                avatarUrl,
                                                                                status,
                                                                                grade,
                                                                                isActive = false,
                                                                                onClick
                                                                            }) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const statusConfig: Partial<Record<SubmissionStatus, { label: string; className: string; dotClassName: string }>> = {
        'Turned in': { label: 'Здано', className: styles.statusTurnedIn, dotClassName: styles.dotTurnedIn },
        'Assigned': { label: 'Призначено', className: styles.statusAssigned, dotClassName: styles.dotAssigned },
        'Missing': { label: 'Протерміновано', className: styles.statusMissing, dotClassName: styles.dotMissing },
    };

    const currentStatus = status !== 'Graded' ? statusConfig[status] : null;

    return (
        <div className={`${styles.container} ${isActive ? styles.active : ''}`} onClick={onClick}>
            <div className={styles.leftSection}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt={studentName} className={styles.avatar} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        {getInitials(studentName)}
                    </div>
                )}
                <span className={styles.studentName}>{studentName}</span>
            </div>

            <div className={styles.rightSection}>
                {status === 'Graded' ? (
                    <p className={styles.gradeText}>
                        {grade !== undefined && grade !== null ? grade : '—'}
                    </p>
                ) : currentStatus && (
                    <div className={`${styles.statusBadge} ${currentStatus.className}`}>
                        <span className={`${styles.statusDot} ${currentStatus.dotClassName}`}></span>
                        {currentStatus.label}
                    </div>
                )}

                <svg
                    className={styles.chevron}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};