import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName?: string;
    isDeleting: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onConfirm,
                                                                    userName,
                                                                    isDeleting
                                                                }) => {
    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Видалення користувача"
            width="460px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ color: '#4A5568', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
                    Ви впевнені, що хочете видалити користувача{' '}
                    <strong style={{ fontWeight: 500, color: '#111827' }}>
                        {userName ? `«${userName}»` : ''}
                    </strong>?
                    Всі дані, пов'язані з цим профілем, будуть втрачені. Цю дію неможливо скасувати.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <SecondaryButton onClick={onClose} disabled={isDeleting}>
                        Скасувати
                    </SecondaryButton>

                    <SecondaryButton
                        variantColor="red"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Видалення...' : 'Видалити'}
                    </SecondaryButton>
                </div>
            </div>
        </ModalLayout>
    );
};