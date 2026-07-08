import { useStore } from '@/stores/useStore.ts';
import React from 'react';
import { TeacherTestDetailsPage, TestDetailsPage } from '@/pages/tests';

export const TestDetailsRouter = () => {
  const user = useStore((state) => state.user);

  const allowedRoles = ['TEACHER', 'MODERATOR', 'ADMIN'];

  const hasStaffAccess = user?.roles?.some((role) => allowedRoles.includes(role));

  return hasStaffAccess ? <TeacherTestDetailsPage /> : <TestDetailsPage />;
};
