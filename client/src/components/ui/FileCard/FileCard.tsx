import React from 'react';
import DeleteIcon from '@/assets/delete.svg?react';
import styles from './FileCard.module.css';

interface FileCardProps {
    fileName: string;
    onRemove?: () => void;
    className?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
                                                      fileName,
                                                      onRemove,
                                                      className = ''
                                                  }) => {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove?.();
    };

    return (
        <div className={`${styles.card} ${className}`}>
            <span className={styles.fileName} title={fileName}>
                {fileName}
            </span>
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