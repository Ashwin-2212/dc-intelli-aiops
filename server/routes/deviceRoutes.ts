import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Device } from '../models/Device';
import { Rack } from '../models/Rack';
import { authenticateToken, optionalAuth, requireRoles } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const deviceRouter = Router();

/**
 * Helper to query device by either custom deviceId (e.g. SRV-R-04-02) or Mongo _id
 */
function buildDeviceFilter(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { deviceId: id }] };
  }
  return { deviceId: id };
}

/**
 * GET /api/devices
 * Paginated device query with filtering by deviceType, status, rackId, and siteId.
 */
deviceRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      deviceType,
      status,
      rackId,
      siteId,
      search,
      page = '1',
      limit = '50',
      sortBy = 'deviceId',
      sortDir = 'asc',
    } = req.query;

    const filter: Record<string, any> = {};

    if (deviceType) filter.deviceType = deviceType;
    if (status) filter.status = status;
    if (rackId) filter.rackId = rackId;
    if (siteId) filter.siteId = siteId;

    if (search) {
      filter.$or = [
        { deviceId: { $regex: String(search), $options: 'i' } },
        { name: { $regex: String(search), $options: 'i' } },
        { vendor: { $regex: String(search), $options: 'i' } },
        { model: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = sortDir === 'desc' ? -1 : 1;
    const sortOptions: Record<string, any> = { [String(sortBy)]: sortOrder };

    const [devices, total] = await Promise.all([
      Device.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Device.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: devices,
      devices, // Compatibility with components expecting array or wrapped response
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error('[Device Route Error]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve devices.' });
  }
});

/**
 * GET /api/devices/:id
 */
deviceRouter.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await Device.findOne(buildDeviceFilter(id));

    if (!device) {
      return res.status(404).json({ success: false, message: `Device '${id}' not found.` });
    }

    res.json({ success: true, device });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve device details.' });
  }
});

/**
 * POST /api/devices (Engineer / Admin / Manager)
 */
deviceRouter.post(
  '/',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.deviceId || !payload.name) {
        return res.status(400).json({
          success: false,
          message: 'deviceId and name are required fields.',
        });
      }

      const existing = await Device.findOne({ deviceId: payload.deviceId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Device with ID '${payload.deviceId}' already exists.`,
        });
      }

      const device = new Device(payload);
      await device.save();

      await recordAudit(req, 'CREATE_DEVICE', 'DEVICE', device.deviceId, 'SUCCESS', { name: device.name });

      res.status(201).json({ success: true, device });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create device.' });
    }
  }
);

/**
 * PATCH /api/devices/:id (Engineer / Admin / Manager)
 */
deviceRouter.patch(
  '/:id',
  authenticateToken,
  requireRoles('ADMIN', 'DATA_CENTER_MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates._id;
      delete updates.deviceId; // Keep deviceId immutable

      const device = await Device.findOneAndUpdate(buildDeviceFilter(id), { $set: updates }, { new: true });

      if (!device) {
        return res.status(404).json({ success: false, message: `Device '${id}' not found.` });
      }

      await recordAudit(req, 'UPDATE_DEVICE', 'DEVICE', device.deviceId, 'SUCCESS', { updatedFields: Object.keys(updates) });

      res.json({ success: true, device });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update device.' });
    }
  }
);

/**
 * DELETE /api/devices/:id (Admin only)
 */
deviceRouter.delete(
  '/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const device = await Device.findOneAndDelete(buildDeviceFilter(id));

      if (!device) {
        return res.status(404).json({ success: false, message: `Device '${id}' not found.` });
      }

      await recordAudit(req, 'DELETE_DEVICE', 'DEVICE', device.deviceId, 'SUCCESS');

      res.json({ success: true, message: `Device '${id}' has been removed.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete device.' });
    }
  }
);

/**
 * GET /api/racks
 * Returns data center racks with server count and physical utilization.
 */
deviceRouter.get('/racks/all', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { siteId = 'dc-va-01', zone } = req.query;
    const filter: Record<string, any> = { siteId };
    if (zone) filter.zone = zone;

    const racks = await Rack.find(filter).sort({ rackId: 1 }).lean();
    res.json({ success: true, count: racks.length, racks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve racks.' });
  }
});
