import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { WorkOrder } from '../models/WorkOrder';
import { Device } from '../models/Device';
import { authenticateToken, optionalAuth, requireRoles } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const maintenanceRouter = Router();

function buildWorkOrderFilter(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { workOrderId: id }] };
  }
  return { workOrderId: id };
}

/**
 * GET /api/work-orders
 */
maintenanceRouter.get('/work-orders', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { status, severity, targetAsset, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (targetAsset) filter.targetAsset = targetAsset;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [workOrders, total] = await Promise.all([
      WorkOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      WorkOrder.countDocuments(filter),
    ]);

    res.json({
      success: true,
      workOrders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve work orders.' });
  }
});

/**
 * POST /api/work-orders
 */
maintenanceRouter.post(
  '/work-orders',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER', 'OPERATOR'),
  async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.title || !payload.targetAsset) {
        return res.status(400).json({ success: false, message: 'title and targetAsset are required.' });
      }

      const workOrderId = payload.id || payload.workOrderId || `WO-${Math.floor(1000 + Math.random() * 9000)}`;

      const workOrder = new WorkOrder({
        ...payload,
        workOrderId,
        status: payload.status || 'open',
        createdAt: new Date(),
      });
      await workOrder.save();

      await recordAudit(req, 'DISPATCH_WORK_ORDER', 'WORK_ORDER', workOrder.workOrderId, 'SUCCESS', {
        title: workOrder.title,
        targetAsset: workOrder.targetAsset,
      });

      res.status(201).json({ success: true, workOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to dispatch work order.' });
    }
  }
);

/**
 * PATCH /api/work-orders/:id
 */
maintenanceRouter.patch(
  '/work-orders/:id',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates._id;
      delete updates.workOrderId;

      const workOrder = await WorkOrder.findOneAndUpdate(buildWorkOrderFilter(id), { $set: updates }, { new: true });

      if (!workOrder) {
        return res.status(404).json({ success: false, message: `Work order '${id}' not found.` });
      }

      await recordAudit(req, 'UPDATE_WORK_ORDER', 'WORK_ORDER', workOrder.workOrderId, 'SUCCESS', {
        updatedFields: Object.keys(updates),
      });

      res.json({ success: true, workOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update work order.' });
    }
  }
);

/**
 * GET /api/assets
 * Returns asset lifecycle and drift status.
 */
maintenanceRouter.get('/assets', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const devices = await Device.find({}).sort({ deviceId: 1 }).lean();

    const assets = devices.map((d) => ({
      id: `ASSET-${d.deviceId}`,
      name: d.name,
      vendor: d.vendor,
      model: d.model,
      serialNumber: d.serialNumber,
      firmware: d.firmwareVersion,
      ipAddress: d.managementAddress,
      location: `DC-01 / ${d.roomId || 'Room-A'} / Rack ${d.rackId || 'General'} (U${d.uPosition || 1})`,
      lifecycleState: d.status === 'healthy' ? 'Operational' : d.status === 'critical' ? 'Maintenance' : 'Degraded',
      healthScore: d.health,
      status: d.status,
    }));

    res.json({ success: true, count: assets.length, assets });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assets.' });
  }
});
