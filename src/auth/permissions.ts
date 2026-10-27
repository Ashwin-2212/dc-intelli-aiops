import { Permission, RoleType } from './types';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  ADMIN: [
    'dashboard',
    'telemetry',
    'servers',
    'racks',
    'cooling',
    'power',
    'incidents',
    'ai',
    'predictions',
    'capacity',
    'reports',
    'users',
    'settings',
    'work-orders',
    'anomalies',
    'rca',
    'energy',
  ],
  MANAGER: [
    'dashboard',
    'telemetry',
    'servers',
    'racks',
    'cooling',
    'power',
    'incidents',
    'ai',
    'predictions',
    'capacity',
    'reports',
    'energy',
  ],
  ENGINEER: [
    'dashboard',
    'telemetry',
    'servers',
    'racks',
    'cooling',
    'power',
    'incidents',
    'work-orders',
  ],
  ANALYST: [
    'dashboard',
    'telemetry',
    'anomalies',
    'ai',
    'predictions',
    'rca',
    'capacity',
    'energy',
    'reports',
  ],
};

/**
 * Mapping of application view IDs to required permission key
 */
export const VIEW_PERMISSION_MAP: Record<string, Permission> = {
  // Command Centers
  'super-admin': 'users',
  'manager-cockpit': 'dashboard',
  'engineer-diag': 'servers',
  'operator-noc': 'telemetry',
  overview: 'dashboard',

  // Telemetry Intelligence Engine
  'telemetry-live': 'telemetry',
  'telemetry-sources': 'telemetry',
  'telemetry-quality': 'telemetry',
  'telemetry-explorer': 'telemetry',
  'telemetry-replay': 'telemetry',
  'telemetry-closed-loop': 'telemetry',
  'telemetry-platform': 'telemetry',

  // Observability & Twin
  collectors: 'telemetry',
  'digital-twin': 'racks',
  dependencies: 'ai',
  racks: 'racks',
  assets: 'racks',
  servers: 'servers',
  cooling: 'cooling',
  power: 'power',
  'energy-optimizer': 'energy',
  ups: 'power',

  // Intelligence & AIOps
  timeline: 'incidents',
  'health-sla': 'reports',
  'alert-correlation': 'ai',
  anomalies: 'anomalies',
  predictive: 'predictions',
  capacity: 'capacity',
  'what-if': 'capacity',
  'root-cause': 'rca',

  // Governance & Security
  'assets-drift': 'reports',
  incidents: 'incidents',
  reports: 'reports',
  security: 'users',
  settings: 'settings',
};

/**
 * Maps custom URL paths to view IDs
 */
export const ROUTE_VIEW_MAP: Record<string, string> = {
  '/': 'overview',
  '/admin': 'super-admin',
  '/manager': 'manager-cockpit',
  '/operations': 'engineer-diag',
  '/analytics': 'anomalies',
  '/login': 'login',
  '/access-denied': 'access-denied',
  '/overview': 'overview',
  '/telemetry': 'telemetry-live',
  '/racks': 'racks',
  '/servers': 'servers',
  '/cooling': 'cooling',
  '/power': 'power',
  '/incidents': 'incidents',
  '/capacity': 'capacity',
  '/predictions': 'predictive',
  '/reports': 'reports',
  '/settings': 'settings',
  '/security': 'security',
};

/**
 * Returns whether a role possesses a given permission
 */
export function hasPermission(role: RoleType | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Checks if user has a required specific role or higher authority
 */
export function hasRole(currentRole: RoleType | undefined | null, requiredRoles: RoleType | RoleType[]): boolean {
  if (!currentRole) return false;
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(currentRole);
  }
  return currentRole === requiredRoles;
}

/**
 * Checks whether a given role is allowed to view an application view
 */
export function canRoleAccessView(role: RoleType | undefined | null, viewId: string): boolean {
  if (!role) return false;
  if (role === 'ADMIN') return true;

  const requiredPermission = VIEW_PERMISSION_MAP[viewId];
  if (!requiredPermission) {
    // If no explicit permission restriction, default to dashboard permission
    return hasPermission(role, 'dashboard');
  }

  // Role specific overrides for specialized views
  if (viewId === 'super-admin' || viewId === 'settings' || viewId === 'security') {
    return false;
  }

  if (viewId === 'manager-cockpit') {
    return role === 'MANAGER';
  }

  if (viewId === 'engineer-diag' || viewId === 'operator-noc') {
    return role === 'ENGINEER';
  }

  if (viewId === 'root-cause') {
    return role === 'ANALYST';
  }

  return hasPermission(role, requiredPermission);
}

/**
 * Gets the default landing view for a role
 */
export function getDefaultLandingView(role: RoleType): string {
  switch (role) {
    case 'ADMIN':
      return 'super-admin';
    case 'MANAGER':
      return 'manager-cockpit';
    case 'ENGINEER':
      return 'engineer-diag';
    case 'ANALYST':
      return 'anomalies';
    default:
      return 'overview';
  }
}

/**
 * Gets the default landing route path for a role
 */
export function getDefaultLandingRoute(role: RoleType): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager';
    case 'ENGINEER':
      return '/operations';
    case 'ANALYST':
      return '/analytics';
    default:
      return '/';
  }
}
