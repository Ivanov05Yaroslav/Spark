import { useState } from 'react';
import { userService, ChangePasswordPayload } from '@/api/profile.service';
import { toast } from '@/libs/configs/Toast.ts';
import { useStore } from '@/stores/useStore.ts';

interface UpdateProfileArgs {
  firstName: string;
  lastName: string;
  middleName: string;
  avatarFile?: File | null;
  currentAvatarUrl?: string | null;
}

export const useEditProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const updateUserInStore = useStore((state) => state.updateUser);

  const updateProfile = async (args: UpdateProfileArgs): Promise<boolean> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', args.firstName);
      formData.append('lastName', args.lastName);
      formData.append('middleName', args.middleName);

      if (args.avatarFile) {
        formData.append('file', args.avatarFile);
      } else if (args.currentAvatarUrl) {
        try {
          const response = await fetch(args.currentAvatarUrl);
          const blob = await response.blob();
          formData.append('file', blob, 'current-avatar.jpg');
        } catch (error) {
          console.error('Не вдалося завантажити поточний аватар для відправки:', error);
        }
      }

      const updatedProfileData = await userService.updateProfile(formData);

      updateUserInStore({
        firstName: updatedProfileData.firstName,
        lastName: updatedProfileData.lastName,
        middleName: updatedProfileData.middleName,
        avatarUrl: updatedProfileData.avatarUrl,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Профіль успішно оновлено!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося оновити профіль';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      await userService.changePassword(payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Пароль успішно змінено!');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося змінити пароль';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    changePassword,
    isLoading,
  };
};
