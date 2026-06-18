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
                                                                      onFilesSelect
                                                                  }) => {
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
                onFilesChange={onFilesSelect}
                showList={false}
                height="200px"
            />
        </ModalLayout>
    );
};