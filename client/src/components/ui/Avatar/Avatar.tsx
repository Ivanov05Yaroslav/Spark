import React, { useState, type ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
  src: string | null | undefined;
  size?: number;
};

export const Avatar = ({ src, size = 40, className = '', ...props }: AvatarProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultAvatar =
    'https://spark-school-system-bucket.s3.eu-central-1.amazonaws.com/assets/default-avatar.svg';
  const finalSrc = src || defaultAvatar;

  return (
    <div
      className={styles.wrapper}
      style={{ '--avatar-size': `${size}px` } as Record<string, string> & React.CSSProperties}
    >
      {!isLoaded && <div className={styles.skeleton}></div>}

      <img
        src={finalSrc}
        alt="avatar"
        className={`${styles.avatar} ${className} ${isLoaded ? styles.loaded : ''}`.trim()}
        loading="lazy"
        width={size}
        height={size}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

Avatar.displayName = 'Avatar';
