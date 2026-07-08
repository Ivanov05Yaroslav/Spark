import React, { useState, useEffect } from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';

interface EditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  onSubmit: (e: React.FormEvent, newTitle: string) => void;
}

export const EditModuleModal: React.FC<EditModuleModalProps> = ({
  isOpen,
  onClose,
  initialTitle,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
    }
  }, [isOpen, initialTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, title);
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setTitle(initialTitle);
      }}
      title="Редагувати назву теми"
      width="500px"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Тема"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введіть нову назву теми"
          autoFocus
        />

        <PrimaryButton type="submit" disabled={!title.trim()}>
          Зберегти
        </PrimaryButton>
      </form>
    </ModalLayout>
  );
};
