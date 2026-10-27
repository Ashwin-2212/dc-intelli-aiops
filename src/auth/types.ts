export type RoleType = 'ADMIN' | 'MANAGER' | 'ENGINEER' | 'ANALYST';

export type Permission =
  | 'dashboard'
  | 'telemetry'
  | 'servers'
  | 'racks'
  | 'cooling'
  | 'power'
  | 'incidents'
  | 'ai'
  | 'predictions'
  | 'capacity'
  | 'reports'
  | 'users'
  | 'settings'
  | 'work-orders'
  | 'anomalies'
  | 'rca'
  | 'energy';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  title: string;
  avatar?: string;
  lastLogin?: string;
  department?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: RoleType;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RoleCardConfig {
  id: RoleType;
  title: string;
  subtitle: string;
  description: string;
  responsibilities: string[];
  restrictedItems?: string[];
  defaultRoute: string;
  defaultView: string;
  color: {
    badge: string;
    border: string;
    accent: string;
    glow: string;
  };
}
