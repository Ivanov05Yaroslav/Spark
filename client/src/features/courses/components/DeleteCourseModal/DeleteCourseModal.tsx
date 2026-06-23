import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';

interface DeleteCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    courseTitle?: string;
    isDeleting: boolean;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onConfirm,
                                                                        courseTitle,
                                                                        isDeleting
                                                                    }) => {
    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Видалення курсу"
            width="460px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ color: '#4A5568', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
                    Ви впевнені, що хочете видалити курс{' '}
                    <strong style={{ fontWeight: 500, color: '#111827' }}>
                        {courseTitle ? `«${courseTitle}»` : ''}
                    </strong>?
                    Всі дані, пов'язані з ним, будуть втрачені. Цю дію неможливо скасувати.
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