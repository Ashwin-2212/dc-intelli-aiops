import { Router, Request, Response } from 'express';
import { Prediction } from '../models/Prediction';
import { Recommendation } from '../models/Recommendation';
import { optionalAuth, authenticateToken } from '../middleware/auth';

export const predictionRouter = Router();

/**
 * GET /api/predictions
 */
predictionRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { deviceId, riskLevel, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (deviceId) filter.deviceId = deviceId;
    if (riskLevel) filter.riskLevel = String(riskLevel).toUpperCase();

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [predictions, total] = await Promise.all([
      Prediction.find(filter).sort({ generatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Prediction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      predictions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve predictions.' });
  }
});

/**
 * GET /api/recommendations
 */
predictionRouter.get('/recommendations', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { status, priority, limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = String(status).toUpperCase();
    if (priority) filter.priority = String(priority).toUpperCase();

    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));

    const recommendations = await Recommendation.find(filter)
      .sort({ generatedAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve recommendations.' });
  }
});

/**
 * POST /api/recommendations
 */
predictionRouter.post('/recommendations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const recommendationId = payload.recommendationId || `REC-${Date.now().toString().slice(-6)}`;
    const recommendation = new Recommendation({
      ...payload,
      recommendationId,
      generatedAt: new Date(),
    });
    await recommendation.save();
    res.status(201).json({ success: true, recommendation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create recommendation.' });
  }
});
