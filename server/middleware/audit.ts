import { Request } from 'express';
import { AuditLog, AuditOutcomeType } from '../models/AuditLog';

export async function recordAudit(
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string,
  outcome: AuditOutcomeType = 'SUCCESS',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const user = req.user;
    // Sanitize metadata to avoid storing secrets or sensitive credentials
    const sanitizedMeta = { ...metadata };
    delete sanitizedMeta.password;
    delete sanitizedMeta.passwordHash;
    delete sanitizedMeta.token;
    delete sanitizedMeta.jwt;

    await AuditLog.create({
      userId: user?.id || 'anonymous_user',
      userEmail: user?.email || 'unauthenticated@dcintelli.local',
      userRole: user?.role || 'VIEWER',
      action,
      resourceType,
      resourceId,
      timestamp: new Date(),
      outcome,
      relevantMetadata: sanitizedMeta,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('[Audit Log Error] Failed to write audit record:', err);
  }
}
