import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthUser, LoginCredentials, Permission, RoleType } from './types';
import { DEMO_ACCOUNTS } from './authConfig';
import { hasPermission as checkPermission, hasRole as checkRole, canRoleAccessView, getDefaultLandingRoute, getDefaultLandingView } from './permissions';

interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (requiredRoles: RoleType | RoleType[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccessView: (viewId: string) => boolean;
  switchRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'dc_intelli_auth_user';
const STORAGE_KEY_TOKEN = 'dc_intelli_auth_token';
const STORAGE_KEY_REMEMBER = 'dc_intelli_auth_remember';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and restore session from storage
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
      const storedUser = isRemembered
        ? localStorage.getItem(STORAGE_KEY_USER)
        : sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER);

      const storedToken = isRemembered
        ? localStorage.getItem(STORAGE_KEY_TOKEN)
        : sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setUser(parsedUser);
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login handler supporting both backend API and local demo simulation
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const { email, password, role, rememberMe } = credentials;

    // First validate credentials against demo store
    const demoAccount = DEMO_ACCOUNTS[role];

    // Try calling backend API endpoint
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        const authenticatedUser = data.user;
        const authToken = data.token || `jwt_${Date.now()}_${role}`;

        authenticatedUser.lastLogin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';

        setUser(authenticatedUser);
        setToken(authToken);

        // Store session based on Remember Me
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
          localStorage.setItem(STORAGE_KEY_TOKEN, authToken);
        } else {
          localStorage.removeItem(STORAGE_KEY_REMEMBER);
          sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
          sessionStorage.setItem(STORAGE_KEY_TOKEN, authToken);
        }

        return { success: true };
      } else if (res.status === 401 || res.status === 400) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Invalid credentials or role mismatch.' };
      }
    } catch {
      // Backend not running / offline -> Use verified demo authenticator
    }

    // Client-side demo fallback verification
    if (!demoAccount) {
      return { success: false, error: 'Please select a valid role.' };
    }

    const emailTrimmed = email.trim().toLowerCase();
    const isMatchingAccount = demoAccount.user.email.toLowerCase() === emailTrimmed;

    // Check if email belongs to another role
    const matchingOtherRole = (Object.keys(DEMO_ACCOUNTS) as RoleType[]).find(
      (r) => DEMO_ACCOUNTS[r].user.email.toLowerCase() === emailTrimmed
    );

    if (matchingOtherRole && matchingOtherRole !== role) {
      return {
        success: false,
        error: `Selected role does not match this account. (${emailTrimmed} is registered as ${DEMO_ACCOUNTS[matchingOtherRole].user.role})`,
      };
    }

    if (!isMatchingAccount || password !== demoAccount.password) {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials.',
      };
    }

    // Authentication Success
    const authenticatedUser: AuthUser = {
      ...demoAccount.user,
      lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
    };
    const generatedToken = `demo_token_${Date.now()}_${role}`;

    setUser(authenticatedUser);
    setToken(generatedToken);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, generatedToken);
    } else {
      localStorage.removeItem(STORAGE_KEY_REMEMBER);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      sessionStorage.setItem(STORAGE_KEY_TOKEN, generatedToken);
    }

    return { success: true };
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REMEMBER);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);

    // Optional fire-and-forget backend notification
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  // Switch role helper for demo testing
  const switchRole = useCallback((newRole: RoleType) => {
    const demo = DEMO_ACCOUNTS[newRole];
    if (demo) {
      const updatedUser: AuthUser = {
        ...demo.user,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
  }, []);

  const hasRoleCheck = useCallback(
    (requiredRoles: RoleType | RoleType[]) => {
      return checkRole(user?.role, requiredRoles);
    },
    [user]
  );

  const hasPermissionCheck = useCallback(
    (permission: Permission) => {
      return checkPermission(user?.role, permission);
    },
    [user]
  );

  const canAccessViewCheck = useCallback(
    (viewId: string) => {
      return canRoleAccessView(user?.role, viewId);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        hasRole: hasRoleCheck,
        hasPermission: hasPermissionCheck,
        canAccessView: canAccessViewCheck,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
