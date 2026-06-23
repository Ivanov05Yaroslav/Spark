import React, { useEffect, useRef } from 'react';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { RoleManagementListItem } from '@/components/administration/RoleManagementListItem/RoleManagementListItem';
import { ROLE_LABELS } from '@/libs/constants/users.constants';
import { useRoleManagement } from '@/features/administration/hooks/useRoleManagement';
import styles from './RoleManagementTab.module.css';
import {ConfirmDeleteModal} from "@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx";

const roleOptions = Object.entries(ROLE_LABELS)
    .filter(([key]) => key !== 'SUPER_ADMIN')
    .map(([key, value]) => ({
        value: key,
        label: value,
    }));

export const RoleManagementTab = () => {
    const {
        users,
        searchQuery,
        setSearchQuery,
        isLoading,
        page,
        totalPages,
        loadMore,
        handleRoleChange,
        deleteModal,
    } = useRoleManagement();

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isLoading || page >= totalPages) return;

        const callback = (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        };

        observerRef.current = new IntersectionObserver(callback);
        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [isLoading, page, totalPages, loadMore]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук за ім'ям або email..."
                />
            </div>

            <div className={styles.list}>
                {users.length > 0 ? (
                    users.map((user) => (
                        <RoleManagementListItem
                            key={user.id}
                            id={user.id}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            middleName={user.middleName || ''}
                            email={user.email}
                            avatarUrl={user.avatarUrl || ''}
                            currentRoles={user.roles}
                            roleOptions={roleOptions}
                            onRoleChange={handleRoleChange}
                            onDelete={deleteModal.onOpen}
                        />
                    ))
                ) : (
                    !isLoading && (
                        <div className={styles.statusMessage}>
                            Користувачів не знайдено
                        </div>
                    )
                )}

                <div ref={sentinelRef} style={{ height: '10px' }} />

                {isLoading && (
                    <div className={styles.statusMessage}>
                        Завантаження нових користувачів...
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.onClose}
                onConfirm={deleteModal.onConfirm}
                isDeleting={deleteModal.isDeleting}
                title="Видалення користувача"
                itemName={deleteModal.userName ? `користувача ${deleteModal.userName}` : 'цього користувача'}
            />
        </div>
    );
};