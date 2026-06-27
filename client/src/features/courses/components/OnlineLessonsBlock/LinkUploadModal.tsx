import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';

interface LinkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkInput: string;
  setLinkInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}

export const LinkUploadModal: React.FC<LinkUploadModalProps> = ({
  isOpen,
  onClose,
  linkInput,
  setLinkInput,
  onSubmit,
  isEdit = false,
}) => {
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setLinkInput('');
      }}
      title={isEdit ? 'Редагувати посилання' : 'Прикріпити посилання'}
      width="500px"
    >
      <form onSubmit={onSubmit}>
        <Input
          label="Посилання на онлайн-урок"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="Введіть посилання (наприклад, https://...)"
          autoFocus
        />

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton type="submit" disabled={!linkInput.trim()}>
            {isEdit ? 'Зберегти' : 'Додати'}
          </PrimaryButton>
        </div>
      </form>
    </ModalLayout>
  );
};
