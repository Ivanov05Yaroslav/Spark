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
  const [localPreview, setLocalPreview] = useState<string | undefined>(previewUrl);

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

  const isLink = fileName.startsWith('http://') || fileName.startsWith('https://');
  const displayPreviewUrl = localPreview || previewUrl;

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.fileInfo}>
        {displayPreviewUrl && !isLink && (
          <img src={displayPreviewUrl} alt="preview" className={styles.previewImage} />
        )}
        <span className={styles.fileName} title={fileName}>
          {fileName}
        </span>
      </div>

      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Видалити файл"
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  );
};
