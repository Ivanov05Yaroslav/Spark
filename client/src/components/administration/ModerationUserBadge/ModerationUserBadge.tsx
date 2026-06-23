import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './ModerationUserBadge.module.css';

interface ModerationUserBadgeProps {
    label: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    role: string;
    roleLabel: string;
    avatarUrl?: string;
}

export const ModerationUserBadge: React.FC<ModerationUserBadgeProps> = ({
                                                                            label,
                                                                            firstName,
                                                                            lastName,
                                                                            middleName = '',
                                                                            role,
                                                                            roleLabel,
                                                                            avatarUrl,
                                                                        }) => {
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();
    const defaultAvatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=E1D4FE&color=702DFF`;

    const getRoleThemeColor = (userRole: string) => {
        switch (userRole) {
            case 'ADMIN': return 'red';
            case 'TEACHER': return 'orange';
            default: return 'purple';
        }
    };

    return (
        <div className={styles.container}>
            <span className={styles.label}>{label}</span>

            <div className={styles.userInfo}>
                <Avatar src={avatarUrl || defaultAvatar} size={40} />

                <div className={styles.textMeta}>
                    <span className={styles.name}>{fullName}</span>
                    <Badge themeColor={getRoleThemeColor(role)} className={styles.roleBadge}>
                        {roleLabel}
                    </Badge>
                </div>
            </div>
        </div>
    );
};