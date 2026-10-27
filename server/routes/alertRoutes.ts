import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Alert } from '../models/Alert';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const alertRouter = Router();

function buildAlertFilter(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { alertId: id }] };
  }
  return { alertId: id };
}

/**
 * GET /api/alerts
 */
alertRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { status, severity, deviceId, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (deviceId) filter.deviceId = deviceId;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
      Alert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      alerts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve alerts.' });
  }
});

/**
 * PATCH /api/alerts/:id/acknowledge
 */
alertRouter.patch('/:id/acknowledge', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const alert = await Alert.findOneAndUpdate(
      buildAlertFilter(id),
      {
        $set: {
          status: 'acknowledged',
          acknowledgedBy: user?.name || user?.email || 'Operator',
          acknowledgedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: `Alert '${id}' not found.` });
    }

    await recordAudit(req, 'ACKNOWLEDGE_ALERT', 'ALERT', alert.alertId, 'SUCCESS');

    res.json({ success: true, message: 'Alert acknowledged.', alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert.' });
  }
});

/**
 * POST /api/alerts
 */
alertRouter.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.deviceId || !payload.metric) {
      return res.status(400).json({ success: false, message: 'deviceId and metric are required.' });
    }

    const alertId = payload.alertId || `ALT-${payload.deviceId}-${Date.now().toString().slice(-6)}`;
    const alert = new Alert({
      ...payload,
      alertId,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    });
    await alert.save();

    await recordAudit(req, 'CREATE_ALERT', 'ALERT', alert.alertId, 'SUCCESS');

    res.status(201).json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create alert.' });
  }
});
