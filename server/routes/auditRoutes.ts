import { Router, Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, requireRoles } from '../middleware/auth';

export const auditRouter = Router();

/**
 * GET /api/audit-logs
 * Compliance and security audit trail query (Admin & Manager).
 */
auditRouter.get(
  '/',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { action, resourceType, outcome, page = '1', limit = '50' } = req.query;

      const filter: Record<string, any> = {};
      if (action) filter.action = action;
      if (resourceType) filter.resourceType = resourceType;
      if (outcome) filter.outcome = String(outcome).toUpperCase();

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
        AuditLog.countDocuments(filter),
      ]);

      res.json({
        success: true,
        auditLogs: logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }
);
