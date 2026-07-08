import React, { useEffect, useRef } from 'react';
import { NotificationItem } from '@/features/notifications/components/NotificationItem/NotificationItem';
import { Divider } from '@/components/ui/Divider/Divider';
import { ApiNotification } from '@/types/notifications.types';
import styles from './NotificationsList.module.css';

type NotificationsListProps = {
  notifications: ApiNotification[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick: (id: string) => void;
  onCloseDrawer: () => void;
};

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications = [],
  isLoading,
  hasMore,
  onLoadMore,
  onItemClick,
  onCloseDrawer,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLoading, hasMore, onLoadMore]);

  if (notifications.length === 0 && !isLoading) {
    return <div className={styles.emptyState}>Немає нових сповіщень</div>;
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.linksList}>
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <NotificationItem
              notification={notification}
              onItemClick={onItemClick}
              onCloseDrawer={onCloseDrawer}
            />
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>

      <div ref={sentinelRef} style={{ height: '10px', width: '100%', flexShrink: 0 }} />

      {isLoading && <div className={styles.loadingState}>Завантаження нових сповіщень...</div>}
    </div>
  );
};
