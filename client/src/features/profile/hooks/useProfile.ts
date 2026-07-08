import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/api/profile.service.ts';
import { UserProfileResponseDTO } from '@/types/profile.types.ts';
import { TabItem } from '@/components/ui/Tabs/Tabs.tsx';
import { toast } from '@/libs/configs/Toast.ts';
import { ROLE_LABELS } from '@/libs/constants/users.constants.ts';
import { useStore } from '@/stores/useStore.ts';

export const useProfile = () => {
  const [activeTab, setActiveTab] = useState('my_info');
  const [profile, setProfile] = useState<UserProfileResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const updateUserInStore = useStore((state) => state.updateUser);

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getProfile();
      setProfile(data);

      updateUserInStore({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        avatarUrl: data.avatarUrl ?? undefined,
      });
    } catch (error) {
      toast.error('Не вдалося завантажити профіль');
    } finally {
      setIsLoading(false);
    }
  }, [updateUserInStore]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const tabItems: TabItem[] = [{ id: 'my_info', label: 'Особиста інформація' }];

  if (profile?.roles.includes('PARENT') && profile.children) {
    profile.children.forEach((child) => {
      tabItems.push({ id: child.id, label: `${child.firstName} ${child.lastName[0]}.` });
    });
  }

  const isStudent = profile?.roles.includes('STUDENT') ?? false;
  const isTeacher = profile?.roles.includes('TEACHER') ?? false;
  const isParent = profile?.roles.includes('PARENT') ?? false;

  const rolesDisplay = profile?.roles
    ? profile.roles.map((r) => ROLE_LABELS[r] || r).join(', ')
    : '';

  return {
    profile,
    isLoading,
    activeTab,
    setActiveTab,
    tabItems,
    isStudent,
    isTeacher,
    isParent,
    rolesDisplay,
    refetch: fetchProfileData,
  };
};
