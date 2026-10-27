export interface ThermalPredictionRecord {
  id: string;
  rackId: string;
  rackName: string;
  zone: string;
  row: string;
  currentTempC: number; // e.g. 29°C for RACK-07
  predictedTempC: number; // e.g. 34°C
  predictionHorizonMinutes: number; // e.g. 25 minutes
  thermalRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  
  // 8 Monitored Variables
  inletTempC: number;
  outletTempC: number;
  serverTempC: number;
  fanSpeedRpm: number;
  rackTempC: number;
  coolingState: string;
  workloadCpuPercent: number;
  powerKw: number;

  predictionReason: string;
  mitigationRecommendation: string;
  temperatureTrajectory: Array<{ minute: number; tempC: number; isThresholdBreached: boolean }>;
}

export const thermalPredictionSeedRecords: ThermalPredictionRecord[] = [
  {
    id: 'THM-PRED-RACK-07',
    rackId: 'RACK-07',
    rackName: 'Rack R-07 (Database Cluster Row-2)',
    zone: 'Zone B',
    row: 'Row-2',
    currentTempC: 29.0, // Exact prompt specification
    predictedTempC: 34.0, // Exact prompt specification: 34°C in 25 minutes
    predictionHorizonMinutes: 25,
    thermalRisk: 'HIGH', // Exact prompt specification: HIGH
    inletTempC: 28.5,
    outletTempC: 37.2,
    serverTempC: 76.4,
    fanSpeedRpm: 12400,
    rackTempC: 29.0,
    coolingState: 'CRAC-03 at 65% Capacity (Inlet Airflow Throttled)',
    workloadCpuPercent: 84.0,
    powerKw: 13.8,
    predictionReason:
      'Thermal inertia model detects rising inlet delta-T (+0.2°C/min) coupled with high database batch compute load (84% CPU) and upstream CRAH-03 damper restriction.',
    mitigationRecommendation:
      'Increase CRAH-03 chilled water flow by 15% and rebalance non-critical virtualization tasks to Rack R-10 within 15 minutes to prevent thermal throttle.',
    temperatureTrajectory: [
      { minute: 0, tempC: 29.0, isThresholdBreached: false },
      { minute: 5, tempC: 29.8, isThresholdBreached: false },
      { minute: 10, tempC: 30.9, isThresholdBreached: true },
      { minute: 15, tempC: 31.8, isThresholdBreached: true },
      { minute: 20, tempC: 32.9, isThresholdBreached: true },
      { minute: 25, tempC: 34.0, isThresholdBreached: true },
    ],
  },
  {
    id: 'THM-PRED-RACK-04',
    rackId: 'RACK-04',
    rackName: 'Rack R-04 (Compute Tier 1)',
    zone: 'Zone A',
    row: 'Row-1',
    currentTempC: 31.5,
    predictedTempC: 36.8,
    predictionHorizonMinutes: 20,
    thermalRisk: 'CRITICAL',
    inletTempC: 31.5,
    outletTempC: 41.2,
    serverTempC: 82.5,
    fanSpeedRpm: 14800,
    rackTempC: 31.5,
    coolingState: 'CRAC-02 Blower Bearing Degraded (100% Fan Duty)',
    workloadCpuPercent: 92.0,
    powerKw: 14.4,
    predictionReason:
      'Microclimate collapse in Zone A cold aisle allows hot air recirculation; server internal cooling reaching thermal equilibrium limit.',
    mitigationRecommendation:
      'Emergency load migration to Zone B and dispatch mechanical override to CRAC-01 booster plenum.',
    temperatureTrajectory: [
      { minute: 0, tempC: 31.5, isThresholdBreached: true },
      { minute: 5, tempC: 32.8, isThresholdBreached: true },
      { minute: 10, tempC: 34.2, isThresholdBreached: true },
      { minute: 15, tempC: 35.6, isThresholdBreached: true },
      { minute: 20, tempC: 36.8, isThresholdBreached: true },
    ],
  },
  {
    id: 'THM-PRED-RACK-05',
    rackId: 'RACK-05',
    rackName: 'Rack R-05 (AI Inference Worker Array)',
    zone: 'Zone A',
    row: 'Row-1',
    currentTempC: 27.2,
    predictedTempC: 31.5,
    predictionHorizonMinutes: 30,
    thermalRisk: 'HIGH',
    inletTempC: 26.8,
    outletTempC: 35.4,
    serverTempC: 71.0,
    fanSpeedRpm: 10800,
    rackTempC: 27.2,
    coolingState: 'Zone A Chilled Water Delta-T Elevated (8.4°C)',
    workloadCpuPercent: 78.0,
    powerKw: 12.1,
    predictionReason:
      'Adjacent Rack R-04 thermal bleed-over heating Row-1 cold aisle ceiling boundary.',
    mitigationRecommendation:
      'Inspect magnetic containment strips between R-04 and R-05; verify blanking panels.',
    temperatureTrajectory: [
      { minute: 0, tempC: 27.2, isThresholdBreached: false },
      { minute: 10, tempC: 28.6, isThresholdBreached: false },
      { minute: 20, tempC: 30.1, isThresholdBreached: true },
      { minute: 30, tempC: 31.5, isThresholdBreached: true },
    ],
  },
  {
    id: 'THM-PRED-RACK-10',
    rackId: 'RACK-10',
    rackName: 'Rack R-10 (Edge Gateway Cluster)',
    zone: 'Zone C',
    row: 'Row-3',
    currentTempC: 22.4,
    predictedTempC: 23.8,
    predictionHorizonMinutes: 45,
    thermalRisk: 'LOW',
    inletTempC: 21.8,
    outletTempC: 29.5,
    serverTempC: 48.0,
    fanSpeedRpm: 6400,
    rackTempC: 22.4,
    coolingState: 'CRAH-04 Operating Nominally (COP 4.2)',
    workloadCpuPercent: 42.0,
    powerKw: 7.2,
    predictionReason:
      'Optimal cold aisle containment airflow and stable baseline power draw maintain safe thermal headroom.',
    mitigationRecommendation:
      'No immediate action required. Safe target for workload rebalancing.',
    temperatureTrajectory: [
      { minute: 0, tempC: 22.4, isThresholdBreached: false },
      { minute: 15, tempC: 22.8, isThresholdBreached: false },
      { minute: 30, tempC: 23.3, isThresholdBreached: false },
      { minute: 45, tempC: 23.8, isThresholdBreached: false },
    ],
  },
];
