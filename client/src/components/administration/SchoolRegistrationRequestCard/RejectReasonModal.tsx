import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  setReason: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  reason,
  setReason,
  onSubmit,
  isLoading = false,
}) => {
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setReason('');
      }}
      title="Відхилення заявки"
      width="500px"
    >
      <form onSubmit={onSubmit}>
        <TextAreaField
          label="Причина відхилення"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Опишіть, чому заявку на реєстрацію школи відхилено..."
          autoFocus
          style={{ height: '100px' }}
        />

        <PrimaryButton type="submit" disabled={!reason.trim() || isLoading}>
          {isLoading ? 'Відхилення...' : 'Відхилити заявку'}
        </PrimaryButton>
      </form>
    </ModalLayout>
  );
};
