import { type ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
  src: string | null | undefined;
  size?: number;
};

export const Avatar = ({ src, size = 40, className = '', ...props }: AvatarProps) => {
  const defaultAvatar =
    'https://spark-school-system-bucket.s3.eu-central-1.amazonaws.com/assets/default-avatar.svg';
  const finalSrc = src || defaultAvatar;

  return (
    <div
      className={styles.wrapper}
      style={{ '--avatar-size': `${size}px` } as Record<string, string> & React.CSSProperties}
    >
      <img
        src={finalSrc}
        alt="avatar"
        className={`${styles.avatar} ${className}`.trim()}
        loading="lazy"
        width={size}
        height={size}
        {...props}
      />
    </div>
  );
};

Avatar.displayName = 'Avatar';
