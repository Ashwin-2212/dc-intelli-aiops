import { Router, Request, Response } from 'express';
import { Site } from '../models/Site';
import { Dependency } from '../models/Dependency';
import { Rack } from '../models/Rack';
import { Device } from '../models/Device';
import { optionalAuth } from '../middleware/auth';

export const topologyRouter = Router();

/**
 * GET /api/sites
 */
topologyRouter.get('/sites', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const sites = await Site.find({}).sort({ siteId: 1 }).lean();
    if (sites.length > 0) {
      return res.json(sites);
    }

    // Default response if not populated yet
    res.json([
      {
        siteId: 'dc-va-01',
        name: 'Alpha Core DC-1 (Ashburn, VA)',
        tier: 'Tier IV',
        status: 'operational',
        powerCapacityKw: 1100,
        currentPowerKw: 842.5,
        pue: 1.40,
        racksCount: 24,
        serversCount: 168,
        overallHealth: 88,
      },
      {
        siteId: 'dc-fra-02',
        name: 'Echo Cloud DC-2 (Frankfurt)',
        tier: 'Tier III',
        status: 'operational',
        powerCapacityKw: 800,
        currentPowerKw: 560.0,
        pue: 1.36,
        racksCount: 18,
        serversCount: 124,
        overallHealth: 94,
      },
    ]);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve site facilities.' });
  }
});

/**
 * GET /api/topology/graph
 */
topologyRouter.get('/topology/graph', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const [zones, racksCount, coolingCount, upsCount] = await Promise.all([
      Rack.distinct('zone'),
      Rack.countDocuments(),
      Device.countDocuments({ deviceType: 'cooling' }),
      Device.countDocuments({ deviceType: 'ups' }),
    ]);

    res.json({
      datacenterId: 'dc-va-01',
      hierarchy: 'Facility -> Zone -> Containment Aisle -> Row -> Rack -> PDU/CRAC -> Server Chassis -> Components',
      zonesCount: zones.length || 3,
      racksCount: racksCount || 12,
      coolingUnitsCount: coolingCount || 4,
      upsUnitsCount: upsCount || 3,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve topology summary.' });
  }
});

/**
 * GET /api/dependencies
 */
topologyRouter.get('/dependencies', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const nodes = await Dependency.find({}).sort({ layer: -1 }).lean();

    // Construct graph edges from parent-child relationships
    const edges: Array<{ id: string; source: string; target: string; relationship: string }> = [];
    nodes.forEach((node) => {
      node.childIds.forEach((childId) => {
        edges.push({
          id: `edge-${node.nodeId}-${childId}`,
          source: node.nodeId,
          target: childId,
          relationship: node.type.includes('power') ? 'powers' : 'cools',
        });
      });
    });

    res.json({ success: true, count: nodes.length, nodes, edges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve dependency graph.' });
  }
});
