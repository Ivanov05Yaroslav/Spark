import React, { useState, useEffect } from 'react';
import DeleteIcon from '@/assets/delete.svg?react';
import styles from './FileCard.module.css';

interface FileCardProps {
  fileName: string;
  previewUrl?: string;
  file?: File;
  onRemove?: () => void;
  className?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
  fileName,
  previewUrl,
  file,
  onRemove,
  className = '',
}) => {
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  const displayPreviewUrl = localPreview || previewUrl;

  const isImage = () => {
    if (file) {
      return file.type.startsWith('image/');
    }

    const pathToCheck = previewUrl || fileName;
    if (!pathToCheck) return false;

    const cleanPath = pathToCheck.split('?')[0].split('#')[0].toLowerCase();

    return (
      cleanPath.endsWith('.png') ||
      cleanPath.endsWith('.jpg') ||
      cleanPath.endsWith('.jpeg') ||
      cleanPath.endsWith('.gif') ||
      cleanPath.endsWith('.webp') ||
      cleanPath.endsWith('.svg') ||
      cleanPath.endsWith('.bmp') ||
      cleanPath.endsWith('.heic')
    );
  };

  const getDisplayFileName = (name: string) => {
    const isLink = name.startsWith('http://') || name.startsWith('https://');
    if (isLink && name.length > 35) {
      return `${name.slice(0, 22)}...${name.slice(-12)}`;
    }
    return name;
  };

  const showPreview = displayPreviewUrl && isImage();

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.fileInfo}>
        {showPreview && (
          <img src={displayPreviewUrl} alt="preview" className={styles.previewImage} />
        )}
        <span className={styles.fileName} title={fileName}>
          {getDisplayFileName(fileName)}
        </span>
      </div>

      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          title="Видалити"
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  );
};
