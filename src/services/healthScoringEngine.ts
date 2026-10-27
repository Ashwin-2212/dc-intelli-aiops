import { ExplainableHealthScore, SlaSloRiskRecord } from '../types';

// Feature 19: Explainable Automated Health Scores
export const dataCenterHealthScore: ExplainableHealthScore = {
  scope: 'entire_dc',
  targetId: 'DC-01',
  targetName: 'Alpha Core Data Center (DC-01)',
  overallScore: 87, // Exact prompt specification: Overall: 87/100
  computeScore: 92, // Exact prompt: Compute: 92
  powerScore: 81, // Exact prompt: Power: 81
  coolingScore: 84, // Exact prompt: Cooling: 84
  environmentScore: 90, // Exact prompt: Environment: 90
  infrastructureScore: 88, // Exact prompt: Infrastructure: 88
  factors: [
    {
      category: 'Compute',
      score: 92,
      impactPoints: -8,
      reason: '2 out of 128 compute nodes (SRV-R-04-02 & SERVER-007) experiencing thermal throttling or fan jitter.',
      status: 'nominal',
    },
    {
      category: 'Power',
      score: 81,
      impactPoints: -19,
      reason: 'RACK-07 power load at 92.0% of PDU branch limit; UPS-02 inverter THD distortion elevated to 6.8%.',
      status: 'degraded',
    },
    {
      category: 'Cooling',
      score: 84,
      impactPoints: -16,
      reason: 'CRAC-02 blower mechanical bearing degradation; Zone B cold aisle containment damper restricted.',
      status: 'degraded',
    },
    {
      category: 'Environment',
      score: 90,
      impactPoints: -10,
      reason: 'Zone A hotspot temperature elevated (28.5°C), while facility ambient humidity remains optimal at 48%.',
      status: 'nominal',
    },
    {
      category: 'Infrastructure',
      score: 88,
      impactPoints: -12,
      reason: '1 configuration drift detected on SERVER-004; 3 preventive maintenance tasks scheduled.',
      status: 'nominal',
    },
  ],
};

// Feature 18: SLA/SLO Risk Prediction Profiles
export const slaSloRiskSeedProfiles: SlaSloRiskRecord[] = [
  {
    id: 'SLO-TIER1-PROD',
    serviceName: 'Production Core API & Payment Processing',
    sloRiskPercent: 72, // Exact prompt specification: SLO Risk: 72%
    sloTargetPercent: 99.99,
    currentUptimePercent: 99.982,
    riskLevel: 'HIGH',
    mainContributors: [
      'Thermal instability', // Exact prompt: Thermal instability
      'Power utilization > 85%', // Exact prompt: Power utilization > 85%
      'Server failure probability', // Exact prompt: Server failure probability
    ],
    availabilityRisk: 74,
    capacityRisk: 68,
    thermalRisk: 82,
    powerRisk: 78,
    hardwareRisk: 64,
    safeRunwayDays: 14,
    mitigationAction:
      'Rebalance non-critical compute away from Rack R-07 and engage secondary CRAC chilled water loop before thermal envelope breach occurs.',
  },
  {
    id: 'SLO-AI-INFERENCE',
    serviceName: 'Enterprise AI Inference & GPU Array',
    sloRiskPercent: 58,
    sloTargetPercent: 99.9,
    currentUptimePercent: 99.94,
    riskLevel: 'MODERATE',
    mainContributors: ['GPU Silicon thermal flux', 'Rack R-04 CFM restriction'],
    availabilityRisk: 52,
    capacityRisk: 71,
    thermalRisk: 66,
    powerRisk: 62,
    hardwareRisk: 50,
    safeRunwayDays: 28,
    mitigationAction: 'Activate dynamic setpoint reduction on Zone A CRAC-01.',
  },
  {
    id: 'SLO-STORAGE-FABRIC',
    serviceName: 'NVMe-oF Distributed Block Storage',
    sloRiskPercent: 24,
    sloTargetPercent: 99.999,
    currentUptimePercent: 99.999,
    riskLevel: 'LOW',
    mainContributors: ['Minor SSD wear leveling on Storage Node 4'],
    availabilityRisk: 18,
    capacityRisk: 22,
    thermalRisk: 20,
    powerRisk: 26,
    hardwareRisk: 28,
    safeRunwayDays: 180,
    mitigationAction: 'Routine quarterly drive health scan.',
  },
];
