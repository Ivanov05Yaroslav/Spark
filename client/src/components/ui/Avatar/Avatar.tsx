import { type ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
    src: string;
    size?: number;
};

export const Avatar = ({
                           src,
                           size = 40,
                           className = '',
                           ...props
                       }: AvatarProps) => {
    return (
        <div
            className={styles.wrapper}
            style={{ '--avatar-size': `${size}px` } as Record<string, string> & React.CSSProperties}
        >
            <img
                src={src}
                alt="avatar"
                className={`${styles.avatar} ${className}`.trim()}
                loading="lazy"
                {...props}
            />
        </div>
    );
};

Avatar.displayName = 'Avatar';