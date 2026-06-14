import React from 'react';
import HashIcon from '../../../../assets/hash.svg?react';
import CopyIcon from '../../../../assets/copy.svg?react';
import { toast } from '../../../../components/utils/Toast.ts'; // Перевір правильність шляху
import styles from './ParentCodeCard.module.css';

interface ParentCodeCardProps {
    code: string;
}

export const ParentCodeCard: React.FC<ParentCodeCardProps> = ({ code }) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Код успішно скопійовано!');
        } catch (err) {
            toast.error('Не вдалося скопіювати код');
        }
    };

    return (
        <div className={styles.card}>
            <h4 className={styles.title}>Батьківський код</h4>
            <div className={styles.row}>
                <div className={styles.codeContainer}>
                    <div className={styles.iconWrapper}>
                        <HashIcon className={styles.icon} />
                    </div>
                    <span className={styles.code}>{code}</span>
                </div>
                <button type="button" className={styles.copyButton} onClick={handleCopy}>
                    <CopyIcon className={styles.copyIcon} />
                </button>
            </div>
        </div>
    );
};