import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Incident } from '../models/Incident';
import { authenticateToken, optionalAuth, requireRoles } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const incidentRouter = Router();

function buildIncidentFilter(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { incidentId: id }] };
  }
  return { incidentId: id };
}

/**
 * GET /api/incidents
 */
incidentRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { status, severity, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = String(status).toUpperCase();
    if (severity) filter.severity = severity;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [incidents, total] = await Promise.all([
      Incident.find(filter).sort({ openedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Incident.countDocuments(filter),
    ]);

    res.json({
      success: true,
      incidents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve incidents.' });
  }
});

/**
 * GET /api/incidents/:id
 */
incidentRouter.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne(buildIncidentFilter(id)).lean();

    if (!incident) {
      return res.status(404).json({ success: false, message: `Incident '${id}' not found.` });
    }

    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve incident details.' });
  }
});

/**
 * PATCH /api/incidents/:id/status
 */
incidentRouter.patch(
  '/:id/status',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER', 'OPERATOR'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'New status is required.' });
      }

      const upperStatus = String(status).toUpperCase();
      const validStatuses = ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

      if (!validStatuses.includes(upperStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const updates: Record<string, any> = { status: upperStatus };
      if (upperStatus === 'RESOLVED' || upperStatus === 'CLOSED') {
        updates.resolvedAt = new Date();
      }

      const incident = await Incident.findOneAndUpdate(buildIncidentFilter(id), { $set: updates }, { new: true });

      if (!incident) {
        return res.status(404).json({ success: false, message: `Incident '${id}' not found.` });
      }

      await recordAudit(req, 'UPDATE_INCIDENT_STATUS', 'INCIDENT', incident.incidentId, 'SUCCESS', { newStatus: upperStatus });

      res.json({ success: true, message: `Incident status updated to ${upperStatus}.`, incident });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update incident status.' });
    }
  }
);

/**
 * POST /api/incidents
 */
incidentRouter.post(
  '/',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.title) {
        return res.status(400).json({ success: false, message: 'Incident title is required.' });
      }

      const incidentId = payload.incidentId || `INC-${Date.now().toString().slice(-6)}`;
      const incident = new Incident({
        ...payload,
        incidentId,
        openedAt: payload.openedAt ? new Date(payload.openedAt) : new Date(),
      });
      await incident.save();

      await recordAudit(req, 'CREATE_INCIDENT', 'INCIDENT', incident.incidentId, 'SUCCESS', { title: incident.title });

      res.status(201).json({ success: true, incident });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create incident.' });
    }
  }
);
