import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@/assets/close.svg?react';
import styles from './ModalLayout.module.css';

interface ModalLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
    height?: string;
    className?: string;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            title,
                                                            children,
                                                            width = '460px',
                                                            height = 'auto',
                                                            className = ''
                                                        }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                className={`${styles.modalContainer} ${className}`}
                style={{ width, height }}
            >
                <div className={`${styles.header} ${!title ? styles.headerWithoutTitle : ''}`}>
                    {title && <h2 className={styles.title}>{title}</h2>}

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрити модальне вікно"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};