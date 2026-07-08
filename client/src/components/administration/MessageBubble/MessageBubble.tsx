import React from 'react';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  text: string;
  time?: string;
  position?: 'left' | 'right';
  bgColor?: string;
  textColor?: string;
  timeColor?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  time,
  position = 'left',
  bgColor,
  textColor,
  timeColor,
}) => {
  const defaultBg = position === 'left' ? '#962DFF4D' : '#702DFF80';
  const defaultTimeColor = position === 'left' ? '#962DFFCC' : '#702DFFCC';

  const defaultTextColor = textColor || (position === 'right' ? '#FFFFFF' : '#111827');

  const bubbleClassName = `${styles.bubbleContainer} ${
    position === 'right' ? styles.right : styles.left
  }`;

  return (
    <div className={bubbleClassName} style={{ backgroundColor: bgColor || defaultBg }}>
      <span className={styles.text} style={{ color: defaultTextColor }}>
        {text}
      </span>

      {time && (
        <span className={styles.time} style={{ color: timeColor || defaultTimeColor }}>
          {time}
        </span>
      )}
    </div>
  );
};
