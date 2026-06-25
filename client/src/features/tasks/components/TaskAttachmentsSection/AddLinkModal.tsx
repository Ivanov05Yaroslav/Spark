import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkInput: string;
  setLinkInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  linkInput,
  setLinkInput,
  onSubmit,
}) => {
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setLinkInput('');
      }}
      title="Прикріпити посилання"
      width="500px"
    >
      <form onSubmit={onSubmit}>
        <Input
          label="Посилання"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="Введіть посилання (наприклад, https://...)"
          autoFocus
        />

        <PrimaryButton type="submit" disabled={!linkInput.trim()}>
          Додати
        </PrimaryButton>
      </form>
    </ModalLayout>
  );
};
