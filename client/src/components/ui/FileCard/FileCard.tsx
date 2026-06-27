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
    e.stopPropagation();
    onRemove?.();
  };

  const displayPreviewUrl = localPreview || previewUrl;

  const isImageUrl = (url: string) => {
    if (url.startsWith('blob:')) return true;

    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.gif') ||
      cleanUrl.endsWith('.webp') ||
      cleanUrl.endsWith('.svg')
    );
  };

  const getDisplayFileName = (name: string) => {
    const isLink = name.startsWith('http://') || name.startsWith('https://');
    if (isLink && name.length > 35) {
      return `${name.slice(0, 22)}...${name.slice(-12)}`;
    }
    return name;
  };

  const showPreview = displayPreviewUrl && isImageUrl(displayPreviewUrl);

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
