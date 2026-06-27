import React, { useState } from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { REPORT_REASONS } from '@/libs/constants/reports.constants.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason) {
      onSubmit(reason);
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title="Поскаржитись на коментар"
      width="500px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <SelectField
          label="Причина"
          placeholder="Оберіть причину"
          options={REPORT_REASONS}
          value={reason}
          onChange={setReason}
        />

        <PrimaryButton type="submit" disabled={!reason}>
          Відправити скаргу
        </PrimaryButton>
      </form>
    </ModalLayout>
  );
};
