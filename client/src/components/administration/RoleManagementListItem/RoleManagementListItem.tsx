import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { MultiSelectField } from '@/components/ui/MultiSelectField/MultiSelectField';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import DeleteIcon from '@/assets/delete.svg?react';
import styles from './RoleManagementListItem.module.css';

interface RoleOption {
    value: string;
    label: string;
}

export interface RoleManagementListItemProps {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    avatarUrl?: string;
    currentRoles: string[];
    roleOptions: RoleOption[];
    onRoleChange: (id: string, newRoles: string[]) => void;
    onDelete: (id: string) => void;
}

export const RoleManagementListItem: React.FC<RoleManagementListItemProps> = ({
                                                                                  id,
                                                                                  firstName,
                                                                                  lastName,
                                                                                  middleName,
                                                                                  email,
                                                                                  avatarUrl,
                                                                                  currentRoles,
                                                                                  roleOptions,
                                                                                  onRoleChange,
                                                                                  onDelete,
                                                                              }) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=E1D4FE&color=702DFF`;

    return (
        <div className={styles.itemContainer}>
            <div className={styles.avatarWrapper}>
                <Avatar src={avatarUrl || defaultAvatar} size={40} />
            </div>

            <span className={styles.name}>{lastName} {firstName} {middleName}</span>

            <span className={styles.email}>{email}</span>

            <div className={styles.selectWrapper}>
                <MultiSelectField
                    value={currentRoles}
                    onChange={(newRoles) => onRoleChange(id, newRoles)}
                    options={roleOptions}
                    placeholder="Оберіть ролі"
                    label=""
                />
            </div>

            <SecondaryButton
                variantColor="red"
                onClick={() => onDelete(id)}
                aria-label="Видалити користувача"
                className={styles.deleteButton}
            >
                <DeleteIcon /> <span>Видалити користувача</span>
            </SecondaryButton>
        </div>
    );
};