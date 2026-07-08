import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  itemName?: string;
  description?: React.ReactNode;
  confirmText?: string;
  loadingText?: string;
  cancelText?: string;
  actionName?: string;
  variantColor?: 'green' | 'yellow' | 'red' | 'default' | 'gray';
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = 'Підтвердження видалення',
  itemName,
  description,
  confirmText = 'Видалити',
  loadingText = 'Видалення...',
  cancelText = 'Скасувати',
  variantColor,
  actionName,
}) => {
  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title={title} width="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p style={{ color: '#4A5568', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
          {description ? (
            description
          ) : (
            <>
              Ви впевнені, що хочете {actionName || 'видалити'}{' '}
              {itemName ? (
                <strong style={{ fontWeight: 500, color: '#111827' }}>{itemName}</strong>
              ) : (
                'цей елемент'
              )}
              ?
              {(!actionName || actionName === 'видалити') &&
                " Всі дані, пов'язані з ним, будуть втрачені. Цю дію неможливо скасувати."}
            </>
          )}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <SecondaryButton onClick={onClose} disabled={isDeleting} variantColor="gray">
            {cancelText}
          </SecondaryButton>

          <SecondaryButton
            variantColor={variantColor || 'red'}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? loadingText : confirmText}
          </SecondaryButton>
        </div>
      </div>
    </ModalLayout>
  );
};
