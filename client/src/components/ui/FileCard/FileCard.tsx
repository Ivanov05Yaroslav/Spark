import React from 'react';
import DeleteIcon from '@/assets/delete.svg?react';
import styles from './FileCard.module.css';

interface FileCardProps {
    fileName: string;
    previewUrl?: string;
    onRemove?: () => void;
    className?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
                                                      fileName,
                                                      previewUrl,
                                                      onRemove,
                                                      className = ''
                                                  }) => {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove?.();
    };

    const isLink = fileName.startsWith('http://') || fileName.startsWith('https://');

    return (
        <div className={`${styles.card} ${className}`}>

            <div className={styles.fileInfo}>
                {previewUrl && !isLink && (
                    <img src={previewUrl} alt="preview" className={styles.previewImage} />
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