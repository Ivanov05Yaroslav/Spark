import { Dot } from '../Dot/Dot';
import { Avatar } from '../../../../components/ui/Avatar/Avatar';
import styles from './NotificationItem.module.css';

type NotificationItemProps = {
    isUnread?: boolean;
    avatarSrc: string;
    userName: string;
    message: string;
    courseName: string;
    date?: string;
};

export const NotificationItem = ({
                                     isUnread = false,
                                     avatarSrc,
                                     userName,
                                     message,
                                     courseName,
                                     date
                                 }: NotificationItemProps) => {
    return (
        <div className={`${styles.itemContainer} ${!isUnread ? styles.read : ''}`}>
            {isUnread && <Dot className={styles.notificationDot} />}

            <div className={styles.content}>
                <div className={styles.messageRow}>
                    <p className={styles.messageText}>
                        <b>{userName}</b> {message}
                    </p>
                    <Avatar src={avatarSrc} size={32} />
                </div>

                <div className={styles.metaRow}>
                    <span className={styles.courseName}>{courseName}</span>
                    {date && <span className={styles.date}>{date}</span>}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;