import React from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout.tsx';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload.tsx';

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedFiles: File[];
  onFilesSelect: (newFiles: File[]) => void;
}

export const UploadFilesModal: React.FC<UploadFilesModalProps> = ({
  isOpen,
  onClose,
  uploadedFiles,
  onFilesSelect,
}) => {
  const handleFilesChange = (newFiles: File[]) => {
    onFilesSelect(newFiles);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Завантажити файли"
      width="600px"
      height="300px"
    >
      <FileUpload
        values={uploadedFiles}
        onFilesChange={handleFilesChange}
        showList={false}
        height="200px"
      />
    </ModalLayout>
  );
};
