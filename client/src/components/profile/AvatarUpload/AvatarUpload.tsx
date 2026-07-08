import React, { useState, useRef } from 'react';
import UploadIcon from '@/assets/upload.svg?react';
import { toast } from '@/libs/configs/Toast.ts';
import { FileCard } from '@/components/ui/FileCard/FileCard';
import styles from './AvatarUpload.module.css';

export interface FileUploadProps {
  label?: string;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  values?: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  showList?: boolean;
  existingUrl?: string | null;
  onRemoveExisting?: () => void;
}

export const AvatarUpload = ({
  label,
  onFilesChange,
  className = '',
  values = [],
  maxFiles = 5,
  maxSizeMB = 10,
  showList = true,
  existingUrl,
  onRemoveExisting,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (newFiles: FileList | File[]) => {
    const validFiles: File[] = [];

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Файл ${file.name} занадто великий. Максимум ${maxSizeMB}МБ`);
        return;
      }
      validFiles.push(file);
    });

    const mergedFiles = [...values, ...validFiles];

    if (mergedFiles.length > maxFiles) {
      toast.error(`Можна завантажити максимум ${maxFiles} файлів`);
      const limitedFiles = mergedFiles.slice(0, maxFiles);
      onFilesChange?.(limitedFiles);
    } else {
      onFilesChange?.(mergedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (values.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = values.filter((_, index) => index !== indexToRemove);
    onFilesChange?.(updatedFiles);
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${values.length >= maxFiles ? styles.dropzoneDisabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />

        <UploadIcon className={styles.icon} />
        <span className={styles.text}>
          {values.length >= maxFiles ? (
            <span>Досягнуто ліміт({maxFiles})</span>
          ) : (
            <>
              Перетягніть або <span className={styles.selectText}>оберіть</span> файл
            </>
          )}
        </span>
      </div>

      {showList && (
        <div className={styles.fileList}>
          {values.length === 0 && existingUrl && (
            <FileCard
              fileName="Поточне фонове зображення"
              previewUrl={existingUrl}
              onRemove={onRemoveExisting}
            />
          )}

          {values.map((file, index) => (
            <FileCard
              key={`${file.name}-${index}`}
              fileName={file.name}
              file={file}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
