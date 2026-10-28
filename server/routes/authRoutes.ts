import { Router, Request, Response } from 'express';
import { User, UserRoleType } from '../models/User';
import { authenticateToken, generateToken, requireRoles } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const authRouter = Router();

// Fallback demo accounts map to ensure seamless zero-downtime development
const DEMO_FALLBACK_PASSWORDS: Record<string, string> = {
  'admin@dcintelli.local': 'Admin@123',
  'manager@dcintelli.local': 'Manager@123',
  'engineer@dcintelli.local': 'Engineer@123',
  'analyst@dcintelli.local': 'Analyst@123',
  'operator@dcintelli.local': 'Operator@123',
};

/**
 * POST /api/auth/login
 * Authenticates against MongoDB with bcrypt password verification.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and role are required for authentication.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    let user = await User.findOne({ email: normalizedEmail });

    // If user not in MongoDB yet, check if it's a known demo account and auto-provision it
    if (!user && DEMO_FALLBACK_PASSWORDS[normalizedEmail]) {
      const demoPass = DEMO_FALLBACK_PASSWORDS[normalizedEmail];
      if (password === demoPass) {
        user = new User({
          name: normalizedEmail.split('@')[0].toUpperCase(),
          email: normalizedEmail,
          passwordHash: password, // Pre-save hook will hash this with bcrypt
          role: role as any,
          isActive: true,
        });
        await user.save();
      }
    }

    if (!user) {
      await recordAudit(req, 'LOGIN_ATTEMPT', 'USER', normalizedEmail, 'DENIED', { reason: 'Account not found' });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account does not exist.',
      });
    }

    if (!user.isActive) {
      await recordAudit(req, 'LOGIN_ATTEMPT', 'USER', user.id, 'DENIED', { reason: 'Account deactivated' });
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an infrastructure administrator.',
      });
    }

    // Role check (support aliases: e.g. MANAGER and DATA_CENTER_MANAGER, ANALYST and VIEWER)
    const normalizedRole = String(role).toUpperCase();
    const isRoleMatch =
      user.role === normalizedRole ||
      (normalizedRole === 'MANAGER' && user.role === 'DATA_CENTER_MANAGER') ||
      (normalizedRole === 'DATA_CENTER_MANAGER' && user.role === 'MANAGER') ||
      (normalizedRole === 'ANALYST' && user.role === 'VIEWER') ||
      (normalizedRole === 'VIEWER' && user.role === 'ANALYST');

    if (!isRoleMatch) {
      return res.status(401).json({
        success: false,
        message: `Selected role does not match this account. (${normalizedEmail} is registered as ${user.role})`,
      });
    }

    // Verify bcrypt password hash
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch {
      // If legacy plain-text password was stored
      if (user.passwordHash === password) {
        isPasswordValid = true;
        // Upgrade to bcrypt hash
        user.passwordHash = password;
        await user.save();
      }
    }

    if (!isPasswordValid) {
      await recordAudit(req, 'LOGIN_ATTEMPT', 'USER', user.id, 'FAILURE', { reason: 'Incorrect password' });
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
      });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Normalize role for client navigation (DATA_CENTER_MANAGER -> MANAGER)
    let clientRole: UserRoleType = user.role;
    if (user.role === 'DATA_CENTER_MANAGER') clientRole = 'MANAGER';
    else if (user.role === 'OPERATOR') clientRole = 'ENGINEER';
    else if (user.role === 'VIEWER') clientRole = 'ANALYST';

    // Generate signed JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: clientRole,
      name: user.name,
    });

    await recordAudit(req, 'LOGIN_SUCCESS', 'USER', user.id, 'SUCCESS');

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: clientRole,
        originalRole: user.role,
        title: user.title,
        department: user.department,
        avatar: user.avatar,
        lastLogin: user.lastLogin.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Auth Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication service encountered an internal error.',
    });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  recordAudit(req, 'LOGOUT', 'USER', req.user?.id || 'session');
  res.json({ success: true, message: 'Session invalidated.' });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ authenticated: false, message: 'User record not found.' });
    }
    let clientRole: UserRoleType = user.role;
    if (user.role === 'DATA_CENTER_MANAGER') clientRole = 'MANAGER';
    else if (user.role === 'OPERATOR') clientRole = 'ENGINEER';
    else if (user.role === 'VIEWER') clientRole = 'ANALYST';

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: clientRole,
        originalRole: user.role,
        title: user.title,
        department: user.department,
        avatar: user.avatar,
        lastLogin: user.lastLogin?.toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

/**
 * GET /api/auth/users (Admin / Manager only)
 */
authRouter.get('/users', authenticateToken, requireRoles('ADMIN', 'DATA_CENTER_MANAGER'), async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
});
