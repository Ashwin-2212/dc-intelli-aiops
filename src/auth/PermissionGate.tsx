import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Permission, RoleType } from './types';

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  permission?: Permission;
  role?: RoleType | RoleType[];
  view?: string;
}

/**
 * Granular Permission Gate component for conditional UI elements (buttons, panels, sections)
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  permission,
  role,
  view,
}) => {
  const { hasPermission, hasRole, canAccessView, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (view && !canAccessView(view)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
