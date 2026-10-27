import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Permission, RoleType } from './types';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: RoleType | RoleType[];
  requiredPermission?: Permission;
  requiredView?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null,
  requiredRole,
  requiredPermission,
  requiredView,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission, canAccessView } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>Verifying security context...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  if (requiredView && !canAccessView(requiredView)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
