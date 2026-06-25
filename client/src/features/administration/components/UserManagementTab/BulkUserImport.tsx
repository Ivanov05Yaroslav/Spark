import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { useBulkUserImport } from '@/features/administration/hooks/useBulkUserImport';

export const BulkUserImport: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { uploadFile, downloadTemplate, downloadInstructions, isUploading, isDownloading } =
    useBulkUserImport();

  const handleBulkProcess = async () => {
    if (files.length === 0) return;

    const success = await uploadFile(files[0]);
    if (success) {
      setFiles([]);
    }
  };

  const linkStyle: React.CSSProperties = {
    color: '#702DFF',
    fontWeight: '500',
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <FileUpload height="146px" maxFiles={1} values={files} onFilesChange={setFiles} label=" " />

      <div style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#7E7E7E' }}>
        Завантажити CSV шаблон{' '}
        <span style={linkStyle} onClick={downloadTemplate}>
          тут
        </span>
        <br />
        Завантажити інструкцію{' '}
        <span style={linkStyle} onClick={downloadInstructions}>
          тут
        </span>
      </div>

      <PrimaryButton
        onClick={handleBulkProcess}
        disabled={files.length === 0 || isUploading}
        style={{ marginTop: 'auto' }}
      >
        {isUploading ? 'Загрузка...' : 'Импортировать'}
      </PrimaryButton>
    </div>
  );
};
