import { useState, useEffect, useCallback, useRef } from 'react';
import { administrationService } from '@/api/administration.service';
import { ManagedUser } from '@/types/administration.types';
import { toast } from '@/libs/configs/Toast';

export const useRoleManagement = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const roleUpdateTimeouts = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

  const loadUsers = useCallback(async (search: string, targetPage: number) => {
    setIsLoading(true);
    try {
      const response = await administrationService.getUsers({
        search: search.trim() || undefined,
        page: targetPage,
        limit: 10,
      });

      if (targetPage === 1) {
        setUsers(response.data);
      } else {
        setUsers((prev) => [...prev, ...response.data]);
      }
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      console.error('Помилка при завантаженні користувачів:', error);
      const serverErrorMessage =
        error?.response?.data?.message || 'Не вдалося завантажити список користувачів';
      toast.error(serverErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(searchQuery, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, loadUsers]);

  const loadMore = useCallback(() => {
    if (isLoading || page >= totalPages) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(searchQuery, nextPage);
  }, [page, totalPages, isLoading, searchQuery, loadUsers]);

  const handleRoleChange = useCallback(
    (id: string, newRoles: string[]) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roles: newRoles } : u)));

      if (roleUpdateTimeouts.current[id]) {
        clearTimeout(roleUpdateTimeouts.current[id]);
      }

      roleUpdateTimeouts.current[id] = setTimeout(async () => {
        try {
          const data = await administrationService.updateUserRoles(id, newRoles);
          toast.success(data?.message || 'Ролі успішно оновлено!');
        } catch (error: any) {
          console.error('Не вдалося оновити ролі:', error);
          const serverErrorMessage = error?.response?.data?.message || 'Не вдалося оновити ролі';
          toast.error(serverErrorMessage);
          loadUsers(searchQuery, 1);
        } finally {
          delete roleUpdateTimeouts.current[id];
        }
      }, 800);
    },
    [searchQuery, loadUsers],
  );

  const openDeleteModal = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        setSelectedUser({ id: user.id, name: `${user.firstName} ${user.lastName}` });
        setDeleteModalOpen(true);
      }
    },
    [users],
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      const data = await administrationService.deleteUser(selectedUser.id);

      toast.success(data?.message || 'Користувача успішно видалено!');
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Не вдалося видалити користувача:', error);
      const serverErrorMessage =
        error?.response?.data?.message || 'Не вдалося видалити користувача';
      toast.error(serverErrorMessage);
      loadUsers(searchQuery, 1);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedUser, searchQuery, loadUsers]);

  return {
    users,
    searchQuery,
    setSearchQuery,
    isLoading,
    page,
    totalPages,
    loadMore,
    handleRoleChange,

    deleteModal: {
      isOpen: deleteModalOpen,
      userName: selectedUser?.name,
      isDeleting,
      onClose: closeDeleteModal,
      onConfirm: handleConfirmDelete,
      onOpen: openDeleteModal,
    },
  };
};
