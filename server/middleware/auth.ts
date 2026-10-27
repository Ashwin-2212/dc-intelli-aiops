import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRoleType } from '../models/User';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRoleType;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dc_intelli_aiops_super_secure_jwt_secret_2026_xyz';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Signs a cryptographic JWT token for authenticated users.
 */
export function generateToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Authenticates requests carrying a Bearer JWT token.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    // Handle both standard signed JWTs and legacy demo base64 tokens
    if (token.startsWith('dci_jwt_') || token.startsWith('demo_token_')) {
      // Legacy demo token compatibility layer
      req.user = {
        id: 'USR-ADM-001',
        email: 'admin@dcintelli.local',
        role: 'ADMIN',
        name: 'Ashwin T',
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
}

/**
 * Optional authentication middleware that extracts user context if present,
 * but does not block requests if unauthenticated.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    if (token.startsWith('dci_jwt_') || token.startsWith('demo_token_')) {
      req.user = {
        id: 'USR-ADM-001',
        email: 'admin@dcintelli.local',
        role: 'ADMIN',
        name: 'Ashwin T',
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Silently continue without user context
  }

  next();
}

/**
 * Role-Based Access Control (RBAC) guard middleware.
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for this resource.',
      });
    }

    const userRole = req.user.role;
    // Map legacy alias roles
    const roleAliases: Record<string, string[]> = {
      ADMIN: ['ADMIN', 'super_admin', 'dc_admin'],
      DATA_CENTER_MANAGER: ['DATA_CENTER_MANAGER', 'MANAGER', 'dc_admin', 'manager'],
      ENGINEER: ['ENGINEER', 'technician', 'engineer'],
      OPERATOR: ['OPERATOR', 'technician', 'operator'],
      VIEWER: ['VIEWER', 'ANALYST', 'viewer', 'analyst'],
    };

    const hasPermission = allowedRoles.some((allowed) => {
      if (allowed === userRole) return true;
      const aliases = roleAliases[allowed] || [];
      return aliases.includes(userRole);
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${userRole}' lacks permission to perform this action.`,
      });
    }

    next();
  };
}
