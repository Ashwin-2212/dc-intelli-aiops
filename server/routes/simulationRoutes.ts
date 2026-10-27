import { Router, Request, Response } from 'express';
import { Simulation } from '../models/Simulation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { recordAudit } from '../middleware/audit';

export const simulationRouter = Router();

/**
 * POST /api/simulations
 * Stores What-If simulation inputs and calculated outcomes into MongoDB.
 */
simulationRouter.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const scenarioId = payload.scenarioId || `SIM-${Date.now().toString().slice(-6)}`;

    const simulation = new Simulation({
      scenarioId,
      scenarioName: payload.scenarioName || payload.scenarioType || 'What-If Capacity Sandbox',
      scenarioType: payload.scenarioType || 'what_if_sandbox',
      inputConfiguration: payload.inputConfiguration || payload,
      affectedRackOrResources: payload.targetRack ? [payload.targetRack] : payload.affectedRackOrResources || [],
      calculatedPowerImpact: payload.calculatedPowerImpact || payload.addedPowerKw,
      coolingImpact: payload.coolingImpact || payload.coolingPercent,
      capacityImpact: payload.capacityImpact || payload.rackCapacityPercent,
      riskAssessment: payload.riskAssessment || (payload.riskLevel?.includes('HIGH') ? 'HIGH RISK' : 'SAFE'),
      decisionSummary: payload.decisionSummary || payload.recommendation,
      recommendations: payload.detailedRecommendations || [],
      result: payload.result || payload,
      createdBy: req.user?.email || 'operator',
      createdAt: new Date(),
    });

    await simulation.save();

    await recordAudit(req, 'TRIGGER_SIMULATION', 'SIMULATION', simulation.scenarioId, 'SUCCESS', {
      scenarioType: simulation.scenarioType,
      risk: simulation.riskAssessment,
    });

    res.status(201).json({ success: true, simulation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to persist simulation scenario.' });
  }
});

/**
 * GET /api/simulations
 */
simulationRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { scenarioType, limit = '20' } = req.query;
    const filter: Record<string, any> = {};
    if (scenarioType) filter.scenarioType = scenarioType;

    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));

    const simulations = await Simulation.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({ success: true, count: simulations.length, simulations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve simulation history.' });
  }
});

/**
 * Simulator Incident Trigger Endpoints
 */
simulationRouter.post('/incidents/cooling-failure', async (req: Request, res: Response) => {
  const result = {
    success: true,
    scenario: 'cooling_failure',
    target: 'CRAC-02',
    impact: 'Elevated inlet temperature across Zone A (R-04, R-05), fan speed 100%, return temp 37.0°C',
    timestamp: new Date().toISOString(),
  };

  await Simulation.create({
    scenarioId: `SIM-${Date.now().toString().slice(-6)}`,
    scenarioName: 'Forced Cooling Loop Failure (CRAC-02)',
    scenarioType: 'cooling_failure',
    inputConfiguration: { target: 'CRAC-02', ambientRiseC: 6.5 },
    affectedRackOrResources: ['CRAC-02', 'R-04', 'R-05'],
    riskAssessment: 'CRITICAL RISK',
    decisionSummary: result.impact,
    createdAt: new Date(),
  });

  res.json(result);
});

simulationRouter.post('/incidents/power-spike', async (req: Request, res: Response) => {
  const result = {
    success: true,
    scenario: 'power_spike',
    target: 'UPS-01 / Substation Feeder A',
    impact: 'Facility load surge to 990 kW, PUE elevated to 1.54, UPS-01 at 90% load capacity',
    timestamp: new Date().toISOString(),
  };

  await Simulation.create({
    scenarioId: `SIM-${Date.now().toString().slice(-6)}`,
    scenarioName: 'Grid Power Surge / Load Spike',
    scenarioType: 'power_spike',
    inputConfiguration: { target: 'UPS-01', surgeKw: 147.5 },
    affectedRackOrResources: ['UPS-01', 'Feeder-A'],
    riskAssessment: 'HIGH RISK',
    decisionSummary: result.impact,
    createdAt: new Date(),
  });

  res.json(result);
});

simulationRouter.post('/incidents/ups-degradation', async (req: Request, res: Response) => {
  const result = {
    success: true,
    scenario: 'ups_degradation',
    target: 'UPS-03 (Zone C High-Density)',
    impact: 'Battery State of Health degraded to 38%, runtime reduced to 8 minutes, cell resistance 34.8mΩ',
    timestamp: new Date().toISOString(),
  };

  await Simulation.create({
    scenarioId: `SIM-${Date.now().toString().slice(-6)}`,
    scenarioName: 'UPS Battery String Degradation',
    scenarioType: 'ups_degradation',
    inputConfiguration: { target: 'UPS-03', cellResistanceMOhm: 34.8 },
    affectedRackOrResources: ['UPS-03'],
    riskAssessment: 'HIGH RISK',
    decisionSummary: result.impact,
    createdAt: new Date(),
  });

  res.json(result);
});

simulationRouter.post('/incidents/server-failure', async (req: Request, res: Response) => {
  const result = {
    success: true,
    scenario: 'server_failure',
    target: 'SRV-R-04-02',
    impact: 'CPU thermal throttle at 82.5°C, response latency 18.5ms, thread lock cascade',
    timestamp: new Date().toISOString(),
  };

  await Simulation.create({
    scenarioId: `SIM-${Date.now().toString().slice(-6)}`,
    scenarioName: 'Compute Node Thermal Throttling',
    scenarioType: 'server_failure',
    inputConfiguration: { target: 'SRV-R-04-02', cpuTemp: 82.5 },
    affectedRackOrResources: ['SRV-R-04-02'],
    riskAssessment: 'HIGH RISK',
    decisionSummary: result.impact,
    createdAt: new Date(),
  });

  res.json(result);
});

simulationRouter.post('/incidents/reset', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    scenario: 'normal',
    impact: 'All physical cooling loops, UPS batteries, and server workloads restored to nominal baselines',
    timestamp: new Date().toISOString(),
  });
});
