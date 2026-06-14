import { createPortal } from 'react-dom';
import sparkLogoImg from '../../../../assets/logo.svg';
import { NotificationsList } from '../NotificationsList/NotificationsList.tsx';
import styles from './NotificationsDrawer.module.css';

type NotificationsDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const NotificationsDrawer = ({ isOpen, onClose }: NotificationsDrawerProps) => {
    if (!isOpen) return null;

    return createPortal(
        <>
            <div className={styles.overlay} onClick={onClose}></div>

            <div className={styles.drawer}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoWrapper}>
                        <img src={sparkLogoImg} alt="Spark Logo"/>
                        <span className={styles.logoText}>SPARK</span>
                    </div>
                </div>

                <div className={styles.header}>
                    <h2 className={styles.title}>СПОВІЩЕННЯ</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    <NotificationsList />
                </div>
            </div>
        </>,
        document.body
    );
};

export default NotificationsDrawer;