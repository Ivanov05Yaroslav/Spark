import { useStore } from '@/stores/useStore.ts';
import { GeneralTaskDetailsPage, TeacherTaskDetailsPage } from '@/pages/tasks';
import React from 'react';

export const TaskDetailsRouter = () => {
  const user = useStore((state) => state.user);

  const allowedRoles = ['TEACHER', 'MODERATOR', 'ADMIN'];

  const hasStaffAccess = user?.roles?.some((role) => allowedRoles.includes(role));

  return hasStaffAccess ? <TeacherTaskDetailsPage /> : <GeneralTaskDetailsPage />;
};
