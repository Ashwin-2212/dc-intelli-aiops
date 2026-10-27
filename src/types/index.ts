export type ServerStatus = 'healthy' | 'warning' | 'degraded' | 'critical' | 'offline';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type IncidentStatus = 'open' | 'investigating' | 'assigned' | 'mitigated' | 'resolved' | 'closed';
export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'ENGINEER'
  | 'ANALYST'
  | 'super_admin'
  | 'dc_admin'
  | 'technician'
  | 'viewer';

export type SimulationScenario = 'normal' | 'high_load' | 'cooling_failure' | 'power_spike' | 'ups_degradation' | 'network_congestion' | 'server_failure';

export interface DeviceTelemetry {
  timestamp: number;
  cpuUsage: number; // 0-100%
  cpuTemp: number; // °C
  ramUsage: number; // 0-100%
  diskUsage: number; // 0-100%
  diskIOPS: number;
  networkInMbps: number;
  networkOutMbps: number;
  networkLatencyMs: number;
  powerDrawWatts: number;
  fanSpeedRpm: number;
  responseTimesMs: number;
  processCount: number;
  uptimeHours: number;
}

export interface ServerDevice {
  id: string;
  name: string;
  rackId: string;
  uPosition: number; // 1 to 42
  uHeight: number; // 1U, 2U, 4U
  model: string;
  manufacturer: string;
  serialNumber: string;
  ipAddress: string;
  macAddress: string;
  os: string;
  cpuCores: number;
  ramGb: number;
  storageTb: number;
  installDate: string;
  warrantyExpireDate: string;
  status: ServerStatus;
  healthScore: number; // 0-100
  telemetry: DeviceTelemetry;
  workloadType: 'Compute Node' | 'Database Cluster' | 'Storage Array' | 'AI Training Worker' | 'Edge Gateway' | 'Virtualization Host';
  anomalyScore?: number; // 0-1
  failureProbability?: number; // 0-100%
}

export interface RackUnit {
  id: string;
  name: string;
  datacenterId: string;
  zone: string;
  row: string;
  position: number;
  maxU: number; // 42U
  usedU: number;
  maxPowerKw: number; // e.g. 15 kW
  currentPowerKw: number;
  inletTempC: number;
  outletTempC: number;
  humidityPercent: number;
  status: ServerStatus;
  healthScore: number;
  airflowCfm: number;
  servers: ServerDevice[];
  pduStatus: 'normal' | 'warning' | 'overload';
  weightKg: number;
  maxWeightKg: number;
}

export interface CoolingUnit {
  id: string;
  name: string;
  datacenterId: string;
  zone: string;
  type: 'CRAC' | 'CRAH' | 'In-Row Chiller' | 'Liquid Immersion Loop';
  status: ServerStatus;
  supplyTempC: number;
  returnTempC: number;
  fanSpeedPercent: number;
  chilledWaterFlowLpm: number;
  powerDrawKw: number;
  copEfficiency: number; // Coefficient of Performance
  healthScore: number;
  failureProbability: number;
  maintenanceHoursUntilDue: number;
}

export interface UpsUnit {
  id: string;
  name: string;
  datacenterId: string;
  zone: string;
  capacityKva: number;
  currentLoadKw: number;
  loadPercent: number;
  batteryHealthPercent: number;
  batteryChargePercent: number;
  runtimeRemainingMinutes: number;
  inputVoltage: number;
  outputVoltage: number;
  temperatureC: number;
  batteryAgeYears: number;
  status: ServerStatus;
  healthScore: number;
  failureProbability: number;
}

export interface DataCenterFacility {
  id: string;
  name: string;
  location: string;
  tier: 'Tier III' | 'Tier IV';
  totalAreaSqFt: number;
  floorsCount: number;
  zonesCount: number;
  racksCount: number;
  serversCount: number;
  totalFacilityPowerKw: number;
  itEquipmentPowerKw: number;
  coolingPowerKw: number;
  pue: number;
  overallHealth: number;
  ambientTempC: number;
  ambientHumidityPercent: number;
  electricityRatePerKwh: number;
  carbonIntensityGramsPerKwh: number;
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'server' | 'rack' | 'cooling' | 'ups' | 'network' | 'pdu';
  metric: string;
  currentValue: number | string;
  expectedRange: string;
  anomalyScore: number; // 0 to 1
  severity: AlertSeverity;
  possibleCause: string;
  recommendedAction: string;
  status: 'active' | 'acknowledged' | 'resolved';
  tier?: 'deterministic_rule' | 'statistical_ml' | 'correlated_cluster';
  provenance?: string;
}

export interface CorrelatedAlertCluster {
  clusterId: string;
  title: string;
  primaryCategory: 'thermal' | 'power' | 'compute' | 'mechanical' | 'network';
  alertCount: number;
  alerts: AnomalyRecord[];
  correlatedEntities: string[];
  firstSeen: string;
  lastSeen: string;
  correlationConfidence: number; // 0-100%
  topologicalScope: string;
}

export interface RcaEvidenceMetric {
  signalName: string;
  category: 'compute' | 'thermal' | 'power' | 'mechanical' | 'storage' | 'network' | 'health';
  sourceDevice: string;
  beforeBaseline: string | number;
  duringIncident: string | number;
  unit: string;
  deltaPercent: number;
  isDeviant: boolean;
  statusText: 'Normal' | 'Elevated' | 'Critical Spike' | 'Degraded';
  sensorProvenance: string; // e.g. "Redfish /Chassis/Thermal", "Modbus Holding Reg 40012", "SNMP UPS-MIB"
}

export interface RootCauseIncident {
  id: string;
  incidentTitle: string;
  targetAsset: string;
  assetType: 'server' | 'cooling' | 'ups' | 'rack';
  zone: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  detectedAt: string;
  
  // Feature 1 Core Fields
  probableRootCause: string;
  confidenceScore: number; // e.g. 87%
  confidenceRationale: string;
  uncertaintyDisclaimer: string;
  
  evidenceMatrix: RcaEvidenceMetric[];
  
  causalPropagationChain: Array<{
    stepNumber: number;
    phase: 'Root Anomaly' | 'Physical Cascade' | 'Microclimate Impact' | 'Silicon Reaction' | 'Service Degradation';
    actor: string;
    description: string;
    evidenceSnippet: string;
  }>;
  
  affectedRacks: string[];
  affectedServersCount: number;
  totalPowerAtRiskKw: number;
  
  recommendedActions: Array<{
    priority: 'IMMEDIATE' | 'HIGH' | 'PLANNED';
    action: string;
    expectedImpact: string;
    estimatedTimeMinutes: number;
  }>;
}

export type PredictiveFailureCategory =
  | 'server_failure'
  | 'fan_failure'
  | 'psu_failure'
  | 'overheating'
  | 'abnormal_power'
  | 'storage_degradation'
  | 'hardware_health';

export interface PredictiveFailureRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'server' | 'cooling' | 'ups' | 'pdu' | 'rack';
  component: string;
  failureCategory?: PredictiveFailureCategory;
  failureProbability: number; // 0-100% (e.g. 78%)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical';
  predictionHorizon?: string; // e.g. "Next 7 days", "Next 14 days", "Next 30 days"
  expectedWindowDays?: string;
  evidence?: string[]; // e.g. ["Fan speed instability", "Temperature trend increasing", "Power fluctuation detected"]
  modelConfidence?: number; // e.g. 91%
  confidencePercent?: number;
  predictionLimitations?: string; // Explicit statement that exact failure dates are probabilistic estimations
  factors: { factor: string; contributionPercent: number }[];
  recommendation: string;
  mtbfHours: number;
  mttrHours: number;
  telemetrySignals?: Array<{
    signalName: string;
    reading: string;
    baseline: string;
    trend: 'increasing' | 'fluctuating' | 'degrading' | 'critical' | 'stable';
  }>;
}

export type CapacityMetricKey = 'cpu' | 'ram' | 'storage' | 'power' | 'rack_capacity' | 'cooling_capacity';

export interface CapacityMilestone {
  key: CapacityMetricKey;
  label: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  unit: string;
  safetyThreshold: number;
  exhaustionRunwayDays: number;
  exhaustionDate: string;
  status: 'nominal' | 'warning' | 'critical';
  trendDirection: 'upward' | 'steep' | 'moderate';
  growthRateMonthlyPercent: number;
}

export interface CapacityForecastPoint {
  date: string;
  dayOffset?: number;
  isHistorical?: boolean;
  
  // CPU
  cpuTrend?: number;
  cpuForecast?: number;
  cpuLower?: number;
  cpuUpper?: number;
  cpuThreshold?: number;
  cpuCapacityPercent?: number;

  // RAM
  ramTrend?: number;
  ramForecast?: number;
  ramLower?: number;
  ramUpper?: number;
  ramThreshold?: number;
  ramCapacityPercent?: number;

  // Storage
  storageTrend?: number;
  storageForecast?: number;
  storageLower?: number;
  storageUpper?: number;
  storageThreshold?: number;
  storageCapacityPercent?: number;

  // Power (kW)
  powerTrend?: number;
  powerForecast?: number;
  powerLower?: number;
  powerUpper?: number;
  powerThreshold?: number;
  powerDemandKw?: number;
  powerCapacityLimitKw?: number;

  // Rack Capacity (%)
  rackTrend?: number;
  rackForecast?: number;
  rackLower?: number;
  rackUpper?: number;
  rackThreshold?: number;
  rackOccupancyPercent?: number;

  // Cooling Capacity (%)
  coolingTrend?: number;
  coolingForecast?: number;
  coolingLower?: number;
  coolingUpper?: number;
  coolingThreshold?: number;
  coolingCapacityPercent?: number;

  projectedCost: number;
}

export interface CapacityRecommendation {
  id: string;
  title: string;
  resourceCategory: 'Compute (CPU/RAM)' | 'Storage Array' | 'Power Substation' | 'Rack Space' | 'Cooling HVAC';
  priority: 'Immediate (0–30d)' | 'High (30–60d)' | 'Planned (60–90d)';
  action: string;
  impact: string;
  estimatedCost: string;
  runwayExtendedDays: number;
}


export interface WorkOrder {
  id: string;
  title: string;
  targetAsset: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo: string;
  createdAt: string;
  slaDueHours: number;
  description: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  affectedAsset: string;
  rootCause: string;
  assignedEngineer: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionTimeMinutes?: number;
  slaLimitMinutes: number;
  notes: string[];
}

export interface WorkOrderRecord {
  id: string;
  incidentId?: string;
  title: string;
  assignedTeam: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_approval' | 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: string;
  targetAsset: string;
  instructions: string;
  estimatedHours: number;
  costEstimate: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  ipAddress: string;
  details: string;
}

export interface EnergyOptimizationInsight {
  id: string;
  targetAsset: string;
  type: 'workload_consolidation' | 'thermal_setpoint' | 'underutilized_host' | 'airflow_blanking';
  description: string;
  potentialPowerSavingsKw: number;
  monthlyCostSavings: number;
  annualCo2ReductionKg: number;
  implementationEffort: 'Immediate' | 'Low' | 'Medium';
}

export interface WhatIfScenarioInput {
  additionalServers: number;
  avgCpuLoadPercent: number;
  perServerPowerWatts: number;
  electricityRate: number;
  coolingEfficiencyFactor: number;
  plannedWorkloadType: string;
}

export interface WhatIfScenarioResult {
  addedPowerKw: number;
  newTotalPowerKw: number;
  projectedPUE: number;
  pueDelta: number;
  addedCoolingKwRequired: number;
  requiredRacks: number;
  availableULeft: number;
  monthlyCostIncrease: number;
  capacityRiskLevel: 'Safe' | 'Moderate' | 'High' | 'Critical';
  bottlenecks: string[];
  recommendations: string[];
}

// FEATURE 2 — MULTI-METRIC ALERT CORRELATION TYPES
export type CorrelatedIncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export type CorrelationDimension = 'temporal' | 'device' | 'rack' | 'topology' | 'metric' | 'severity';

export interface RawAlert {
  id: string;
  timestamp: string; // ISO or relative human string
  timestampEpochMs: number;
  deviceId: string;
  deviceName: string;
  deviceType: 'server' | 'rack' | 'cooling' | 'ups' | 'pdu' | 'network';
  rackId: string;
  zone: string;
  topologyPath: string; // e.g. "Alpha Core DC-1 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02"
  metricName: string; // e.g. "CPU Utilization", "Die Temperature", "Power Draw", "Fan Speed", "Health Score"
  metricCategory: 'cpu' | 'temperature' | 'power' | 'fan' | 'health' | 'network' | 'voltage' | 'mechanical';
  currentValue: number | string;
  baselineValue: number | string;
  threshold: number | string;
  unit: string;
  severity: AlertSeverity;
  status: 'active' | 'correlated' | 'suppressed' | 'acknowledged' | 'resolved';
  provenanceProtocol: 'Redfish' | 'SNMP' | 'Modbus' | 'BMS' | 'eBPF';
  rawMessage: string;
}

export interface CorrelationDimensionEvidence {
  temporal: {
    timeWindowSeconds: number;
    burstSpanMs: number;
    isCoincident: boolean;
    details: string;
  };
  device: {
    sharedDeviceId: string;
    deviceName: string;
    entityType: string;
    details: string;
  };
  rack: {
    sharedRackId: string;
    zone: string;
    rackPosition: number;
    details: string;
  };
  topology: {
    rootNode: string;
    propagationPath: string[];
    treeDepth: number;
    blastRadiusScope: string;
    details: string;
  };
  metric: {
    matchedPatternName: string;
    matchedSignals: string[];
    requiredSignals: string[];
    patternConfidence: number;
    details: string;
  };
  severity: {
    rawMaxSeverity: AlertSeverity;
    aggregatedIncidentSeverity: AlertSeverity;
    compoundRiskMultiplier: number;
    escalationReason: string;
  };
}

export interface CorrelatedIncident {
  id: string;
  incidentCode: string; // e.g. "INC: SERVER THERMAL STRESS"
  title: string;
  summary: string;
  targetDevice: string;
  targetRack: string;
  targetZone: string;
  topologyBreadcrumb: string;
  severity: AlertSeverity;
  status: CorrelatedIncidentStatus;
  detectedAt: string;
  detectedEpochMs: number;
  updatedAt: string;
  assignedEngineer: string;
  noiseReductionRatio: number; // e.g. 80.0 (4 out of 5 alerts suppressed into 1 incident)
  contributingAlerts: RawAlert[];
  correlationEvidence: CorrelationDimensionEvidence;
  rootCauseHypothesis: string;
  recommendedRemediation: Array<{
    stepNumber: number;
    action: string;
    urgency: 'IMMEDIATE' | 'HIGH' | 'PLANNED';
    expectedImpact: string;
  }>;
  statusHistory: Array<{
    status: CorrelatedIncidentStatus;
    timestamp: string;
    actor: string;
    comment?: string;
  }>;
  assignedWorkOrderId?: string;
}

// FEATURE 8 — DIGITAL TWIN 7-LEVEL HIERARCHY TYPES
export type DigitalTwinNodeType =
  | 'data_center'
  | 'building'
  | 'room'
  | 'row'
  | 'rack'
  | 'device'
  | 'component';

export type DigitalTwinDeviceState = 'online' | 'standby' | 'warning' | 'critical' | 'maintenance' | 'offline';

export interface DigitalTwinNode {
  id: string;
  name: string;
  type: DigitalTwinNodeType;
  level: number; // 1 to 7
  parentId?: string;
  path: string; // e.g. "DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / Server-001 / CPU-Die-0"
  
  // Mandatory Digital Twin Properties
  deviceState: DigitalTwinDeviceState;
  health: number; // 0-100%
  location: {
    dataCenter: string;
    building: string;
    room: string;
    row: string;
    rack?: string;
    uPosition?: number;
    roomCoordinates?: { x: number; y: number };
  };
  capacity: {
    total: number;
    used: number;
    unit: string;
    utilizationPercent: number;
  };
  power: {
    currentKw: number;
    ratedKw: number;
    powerFactor?: number;
  };
  temperature: {
    currentC: number;
    baselineC: number;
    deltaC: number;
    sensorLocation: 'inlet' | 'outlet' | 'die' | 'exhaust' | 'ambient';
  };
  incidents: {
    activeCount: number;
    criticalCount: number;
    incidentIds: string[];
    summary?: string;
  };
  relationships: {
    upstreamPowerSource: string; // e.g. "UPS-01 / PDU-A"
    upstreamCoolingUnit: string; // e.g. "CRAC-02 (Zone A)"
    networkSwitchId?: string;
    connectedPeersCount: number;
    dependencyRole: string;
  };
  
  specs?: Record<string, string | number>;
  children?: DigitalTwinNode[];
}

// FEATURE 9 — AI SUB-THRESHOLD ANOMALY DETECTION TYPES
export type AnomalyDetectionMethod =
  | 'statistical_thresholds'
  | 'moving_averages'
  | 'z_score'
  | 'isolation_forest'
  | 'rolling_baseline'
  | 'time_series_forecasting';

export interface SubThresholdAnomalyRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'server' | 'rack' | 'cooling' | 'ups' | 'pdu' | 'network';
  rackId: string;
  
  // 7 Exact required fields from Feature 9 prompt
  metric: string; // e.g. "CPU Utilization (%)"
  expectedValue: string | number; // e.g. "51%" or "51.0"
  actualValue: string | number; // e.g. "94%" or "94.0"
  deviation: string; // e.g. "+43.0% (Surge Rate: +22.0%/step)"
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string; // ISO / display timestamp
  confidence: number; // e.g. 96.8%
  
  // Sub-threshold & algorithm context
  detectionMethod: AnomalyDetectionMethod;
  thresholdViolation: boolean; // false = caught before static threshold breach
  staticThresholdLimit: string | number; // e.g. "95.0%"
  timeSeriesHistory: Array<{
    step: number;
    label: string;
    actual: number;
    normalBaseline: number;
    isAnomaly: boolean;
  }>;
  canonicalSequenceNote?: string; // e.g. "Normal: 40 -> 45 -> 48 -> 51 vs Anomaly: 40 -> 45 -> 48 -> 72 -> 94"
  zScoreValue?: number; // e.g. 4.82
  isolationForestScore?: number; // e.g. -0.38
  rootCauseInsight: string;
  recommendedAction: string;
  status: 'DETECTED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
}

// FEATURE 10 & 17 — INFRASTRUCTURE DEPENDENCY GRAPH & FAILURE IMPACT ANALYSIS
export type DependencyNodeType =
  | 'server'
  | 'rack'
  | 'pdu'
  | 'ups'
  | 'power_system'
  | 'cooling_zone'
  | 'network_switch';

export interface DependencyGraphNode {
  id: string;
  name: string;
  type: DependencyNodeType;
  layer: number; // 1: Server, 2: Rack, 3: PDU / Cooling Zone, 4: UPS, 5: Power System
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  load: string;
  metrics: Record<string, string | number>;
  parentIds: string[]; // Upstream suppliers (e.g. Rack -> PDU)
  childIds: string[]; // Downstream dependents (e.g. PDU -> Rack)
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'power' | 'cooling' | 'network' | 'containment';
  label?: string;
  isImpacted?: boolean;
}

export interface FailureImpactResult {
  failedComponent: string;
  componentType: DependencyNodeType;
  directDependenciesCount: number;
  indirectDependenciesCount: number;
  affectedServersCount: number;
  affectedRacksCount: number;
  affectedCoolingZonesCount: number;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedServers: string[];
  affectedRacks: string[];
  affectedCoolingZones: string[];
  powerLoadLostKw: number;
  recommendation: string;
}

// FEATURE 11 — INCIDENT TIMELINE RECONSTRUCTION
export interface IncidentTimelineStep {
  stepNumber: number;
  time: string; // e.g. "14:01"
  timestampEpochMs: number;
  event: string; // e.g. "CPU increased"
  metric: string; // e.g. "CPU Utilization"
  value: string; // e.g. "55% → 72%"
  severity: 'info' | 'warning' | 'critical';
  affectedEntity: string; // e.g. "SERVER-001"
  statusDescription: string;
}

export interface ReconstructedIncidentTimeline {
  incidentId: string;
  incidentTitle: string;
  targetDevice: string;
  startedAt: string;
  resolvedAt?: string;
  durationMinutes: number;
  steps: IncidentTimelineStep[];
  rootCauseSummary: string;
  mitigationSummary: string;
}

// FEATURE 12 — AI DATA CENTER COPILOT TYPES
export interface CopilotToolCall {
  toolName: string;
  params: Record<string, any>;
  resultSummary: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: string;
  evidence?: {
    signals?: Array<{ metric: string; value: string; delta?: string }>;
    probableCause?: string;
    confidenceScore?: number;
    recommendedAction?: string;
    affectedEntities?: string[];
  };
  toolInvocations?: CopilotToolCall[];
}

// FEATURE 13 — AUTOMATED INCIDENT PRIORITIZATION
export interface PrioritizedIncidentRecord {
  id: string;
  title: string;
  priorityScore: number; // 0 to 100 (e.g. 92/100)
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedDevices: number; // e.g. 14
  affectedRack: string; // e.g. "R05"
  affectedServices: string[];
  businessImpact: 'Critical' | 'High' | 'Medium' | 'Low';
  dependencyImpact: 'High' | 'Medium' | 'Low';
  dependentSystemsCount: number;
  duration: string;
  recurrenceCount: number;
  confidence: number;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  assignedTeam: string;
}

// FEATURE 14 — PREDICTIVE MAINTENANCE SCHEDULER
export interface PredictiveMaintenanceTask {
  id: string;
  targetDevice: string; // e.g. "SERVER-004"
  component: string; // e.g. "Chassis Blower Fan Tray"
  maintenanceRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string; // e.g. "Fan instability detected over previous 14 days."
  recommendedMaintenance: string; // e.g. "Inspect cooling fan."
  suggestedWindow: string; // e.g. "Next maintenance cycle."
  telemetryEvidence: string;
  maintenanceHistory: Array<{
    date: string;
    action: string;
    technician: string;
    outcome: string;
  }>;
  status: 'SCHEDULED' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED';
}

// FEATURE 15 — ASSET LIFECYCLE INTELLIGENCE
export type AssetLifecycleState =
  | 'Purchased'
  | 'Installed'
  | 'Operational'
  | 'Maintenance'
  | 'End of Life'
  | 'Retired';

export interface AssetLifecycleRecord {
  id: string;
  name: string; // e.g. "SERVER-004"
  vendor: string; // e.g. "Dell EMC"
  model: string; // e.g. "PowerEdge R760"
  serialNumber: string;
  firmware: string;
  ipAddress: string;
  location: string; // e.g. "DC-01 / Room-A / Row-01 / Rack-03"
  purchaseDate: string;
  installationDate: string;
  warrantyExpiry: string;
  isWarrantyActive: boolean;
  ageMonths: number;
  lifecycleState: AssetLifecycleState;
  healthScore: number;
  maintenanceCount: number;
  replacementRecommendation: string;
}

// FEATURE 16 — CONFIGURATION DRIFT DETECTION
export type DriftType =
  | 'new_device'
  | 'removed_device'
  | 'changed_ip'
  | 'changed_firmware'
  | 'unexpected_config'
  | 'device_moved'
  | 'missing_asset';

export interface ConfigurationDriftRecord {
  id: string;
  deviceId: string; // e.g. "SERVER-004"
  deviceName: string;
  driftType: DriftType;
  expected: string; // e.g. "SERVER-004 → Rack-03"
  detected: string; // e.g. "SERVER-004 → Rack-05"
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  detectedAt: string;
  status: 'UNRESOLVED' | 'ACCEPTED_DRIFT' | 'REVERTED';
  auditHistory: Array<{
    timestamp: string;
    changedBy: string;
    changeSummary: string;
    previousValue: string;
    newValue: string;
  }>;
}

// FEATURE 18 — SLA/SLO RISK PREDICTION
export interface SlaSloRiskRecord {
  id: string;
  serviceName: string;
  sloRiskPercent: number; // e.g. 72%
  sloTargetPercent: number; // e.g. 99.95%
  currentUptimePercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  mainContributors: string[]; // e.g. ["Thermal instability", "Power utilization > 85%", "Server failure probability"]
  availabilityRisk: number;
  capacityRisk: number;
  thermalRisk: number;
  powerRisk: number;
  hardwareRisk: number;
  safeRunwayDays: number;
  mitigationAction: string;
}

// FEATURE 19 — AUTOMATED HEALTH SCORE
export interface ExplainableHealthScore {
  scope: 'entire_dc' | 'room' | 'cooling_zone' | 'rack' | 'server' | 'ups' | 'pdu';
  targetId: string;
  targetName: string;
  overallScore: number; // e.g. 87/100
  computeScore: number; // e.g. 92
  powerScore: number; // e.g. 81
  coolingScore: number; // e.g. 84
  environmentScore: number; // e.g. 90
  infrastructureScore: number; // e.g. 88
  factors: Array<{
    category: 'Compute' | 'Power' | 'Cooling' | 'Environment' | 'Infrastructure';
    score: number;
    impactPoints: number;
    reason: string;
    status: 'nominal' | 'degraded' | 'critical';
  }>;
}

// FEATURE 20 — AI RECOMMENDATION ENGINE
export interface ActionableRecommendationRecord {
  id: string;
  problem: string; // e.g. "Rack temperature increasing."
  evidence: Array<{
    metric: string;
    delta: string;
    detail: string;
  }>; // e.g. [ { metric: "Temperature", delta: "+6°C" }, { metric: "Fan speed", delta: "+42%" }, { metric: "Power", delta: "+18%" } ]
  recommendations: string[]; // e.g. ["1. Inspect cooling airflow.", "2. Check rack power density.", "3. Review server workload.", "4. Verify cooling zone operation."]
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidencePercent: number;
  safetyConstraints: string[];
  status: 'PENDING' | 'EXECUTED' | 'SCHEDULED' | 'DISMISSED';
}

// Re-export Universal Telemetry Intelligence Engine Types
export * from './telemetryIntelligence';
