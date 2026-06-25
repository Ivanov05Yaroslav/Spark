import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@/stores/useStore.ts';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = user?.roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
};
