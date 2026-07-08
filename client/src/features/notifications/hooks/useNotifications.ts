import { useState, useCallback, useEffect } from 'react';
import { notificationsService } from '@/api/notifications.service';
import { ApiMeta, ApiNotification } from '@/types/notifications.types';
import { toast } from '@/libs/configs/Toast';

export const useNotifications = (isOpen: boolean) => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  const LIMIT = 10;

  const fetchNotifications = useCallback(async (pageToLoad: number, replace: boolean = false) => {
    try {
      setIsLoading(true);
      const res = await notificationsService.getNotifications(pageToLoad, LIMIT);

      let newData: ApiNotification[] = [];
      let metaData: ApiMeta | null = null;

      const rawRes = res as any;

      if (rawRes && Array.isArray(rawRes.data)) {
        newData = rawRes.data;
        metaData = rawRes.meta;
      } else if (rawRes && rawRes.data && Array.isArray(rawRes.data.data)) {
        newData = rawRes.data.data;
        metaData = rawRes.data.meta;
      } else if (Array.isArray(rawRes)) {
        newData = rawRes;
      }

      setNotifications((prev) => (replace ? newData : [...prev, ...newData]));

      if (metaData) {
        setHasMore(metaData.page < metaData.totalPages);
        setPage(metaData.page);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося завантажити сповіщення');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isInitialLoaded) {
      fetchNotifications(1, true);
      setIsInitialLoaded(true);
    }
  }, [isOpen, isInitialLoaded, fetchNotifications]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchNotifications(page + 1, false);
  }, [page, isLoading, hasMore, fetchNotifications]);

  const markSingleAsReadLocal = useCallback(async (id: string) => {
    setNotifications((prev) => (prev || []).map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await notificationsService.markAsRead(id);
    } catch (err) {
      setNotifications((prev) =>
        (prev || []).map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  }, []);

  const markAllAsReadLocal = useCallback(async () => {
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsService.markAllAsRead();
    } catch (err) {
      toast.error('Не вдалося відмітити всі сповіщення');
    }
  }, []);

  return {
    notifications: notifications || [],
    isLoading,
    hasMore,
    loadMore,
    markSingleAsReadLocal,
    markAllAsReadLocal,
  };
};
