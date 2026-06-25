import React from 'react';
import styles from './Links.module.css';

interface LinksProps {
  leftText?: string;
  leftLinkText?: string;
  onLeftLinkClick?: () => void;
  rightLinkText?: string;
  onRightLinkClick?: () => void;
}

export const Links: React.FC<LinksProps> = ({
  leftText,
  leftLinkText,
  onLeftLinkClick,
  rightLinkText,
  onRightLinkClick,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        {leftText && <span className={styles.text}>{leftText}</span>}
        {leftLinkText && (
          <button type="button" className={styles.link} onClick={onLeftLinkClick}>
            {leftLinkText}
          </button>
        )}
      </div>
      {rightLinkText && (
        <button type="button" className={styles.link} onClick={onRightLinkClick}>
          {rightLinkText}
        </button>
      )}
    </div>
  );
};
