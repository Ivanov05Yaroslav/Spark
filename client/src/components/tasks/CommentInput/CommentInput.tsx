import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import SendIcon from '@/assets/send.svg?react';
import styles from './CommentInput.module.css';

interface CommentInputProps {
    currentUserAvatar?: string;
    onSubmit: (content: string) => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({ currentUserAvatar, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit(value);
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.avatar}>
                <Avatar src={currentUserAvatar || ''} />
            </div>

            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Add a class comment..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={styles.sendButton}
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                    aria-label="Send comment"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};