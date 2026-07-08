import React from 'react';
import { createPortal } from 'react-dom';
import sparkLogoImg from '../../../../assets/logo.svg';
import DoubleCheckIcon from '@/assets/doubleTick.svg?react';
import CloseIcon from '@/assets/close.svg?react';
import { NotificationsList } from '../NotificationsList/NotificationsList.tsx';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import styles from './NotificationsDrawer.module.css';
import { Badge } from '@/components/ui/Badge/Badge.tsx';

type NotificationsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NotificationsDrawer = ({ isOpen, onClose }: NotificationsDrawerProps) => {
  const { notifications, isLoading, hasMore, loadMore, markSingleAsReadLocal, markAllAsReadLocal } =
    useNotifications(isOpen);

  if (!isOpen) return null;

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose}></div>

      <div className={styles.drawer}>
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <img src={sparkLogoImg} alt="Spark Logo" />
            <span className={styles.logoText}>SPARK</span>
          </div>
        </div>

        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>СПОВІЩЕННЯ</h2>
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </div>

          <div className={styles.actionsBlock}>
            <button
              className={styles.readAllBtn}
              onClick={markAllAsReadLocal}
              title="Прочитати все"
              style={{ display: 'flex', width: '24px', height: '24px' }}
            >
              <DoubleCheckIcon className={styles.readAllIcon} />
            </button>

            <CloseIcon onClick={onClose} className={styles.closeBtn} />
          </div>
        </div>

        <div className={styles.content}>
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onItemClick={markSingleAsReadLocal}
            onCloseDrawer={onClose}
          />
        </div>
      </div>
    </>,
    document.body,
  );
};

export default NotificationsDrawer;
