import { AlertSeverity, IncidentStatus, ServerStatus, UserRole } from './index';

// Universal Telemetry Source Types
export type TelemetrySourceType =
  | 'windows_agent'
  | 'linux_agent'
  | 'redfish_bmc'
  | 'snmp_agent'
  | 'iot_esp32_mqtt'
  | 'modbus_bacnet'
  | 'csv_import'
  | 'json_dataset'
  | 'telemetry_simulator';

export type AssetType =
  | 'server'
  | 'rack'
  | 'cooling'
  | 'ups'
  | 'pdu'
  | 'switch'
  | 'chiller'
  | 'facility'
  | 'sensor';

export type MetricQualityFlag = 'GOOD' | 'UNCERTAIN' | 'BAD' | 'STALE' | 'SIMULATED' | 'INTERPOLATED';

// Universal Metric Record
export interface UniversalMetricValue {
  name: string;
  category: 'compute' | 'thermal' | 'power' | 'cooling' | 'network' | 'storage' | 'mechanical' | 'environmental' | 'battery';
  value: number;
  unit: string;
  rawSource?: string;
  sampleTime: number;
  qualityFlag: MetricQualityFlag;
  rateOfChangePerSec?: number;
}

// Universal Telemetry Schema
export interface UniversalTelemetryPacket {
  telemetryId: string;
  sourceId: string;
  sourceType: TelemetrySourceType;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  timestamp: string; // ISO-8601
  timestampEpochMs: number;
  
  location: {
    dataCenter: string;
    floor?: string;
    room?: string;
    row?: string;
    rack?: string;
    uPosition?: number;
    zone?: string;
  };

  // Extensible metrics dictionary
  metrics: Record<string, number>;
  metricDetails?: Record<string, UniversalMetricValue>;

  status: ServerStatus;

  // Quality assessment for this packet
  quality: {
    overallScore: number; // 0 - 100
    completeness: number; // % of expected metrics received
    freshness: number;    // % score based on latency from collection
    validity: number;     // % within physical bounds
    continuity: number;   // % based on expected arrival schedule
    sourceReliability: number; // Historical source trust %
    warnings?: string[];
  };

  // Enriched topological context
  enrichment?: {
    upstreamPowerId?: string;
    upstreamCoolingId?: string;
    parentRackId?: string;
    workloadCategory?: string;
    criticalityTier?: 'Tier-1-Mission-Critical' | 'Tier-2-Production' | 'Tier-3-Dev-Test';
    tags?: string[];
  };
}

// Telemetry Source Registry & Metadata
export interface TelemetrySourceRegistration {
  sourceId: string;
  sourceName: string;
  sourceType: TelemetrySourceType;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  endpointUrl?: string;
  protocol: 'HTTP' | 'REST' | 'MQTT' | 'WebSocket' | 'SNMP' | 'Redfish' | 'Modbus' | 'CSV';
  status: 'ONLINE' | 'WARNING' | 'OFFLINE' | 'DEGRADED';
  lastSeenEpochMs: number;
  lastSeenFormatted: string;
  samplingIntervalSec: number;
  
  qualityScore: number; // 0-100
  sensorTrustScore: number; // 0-100
  totalPacketsReceived: number;
  totalPacketsDropped: number;
  totalValidationErrors: number;
  
  hardwareSpecs?: {
    ipAddress?: string;
    macAddress?: string;
    firmwareVersion?: string;
    authMethod?: 'API_KEY' | 'MTLS' | 'OAUTH2' | 'BASIC' | 'NONE';
  };
}

// Telemetry Quality Assessment Report
export interface TelemetryQualityReport {
  overallQualityScore: number; // 0-100
  completenessScore: number;
  freshnessScore: number;
  validityScore: number;
  continuityScore: number;
  sourceReliabilityScore: number;
  
  activeSourcesCount: number;
  degradedSourcesCount: number;
  offlineSourcesCount: number;
  
  detectedGaps: Array<{
    sourceId: string;
    assetName: string;
    metricName: string;
    gapDurationSeconds: number;
    lastReportedTime: string;
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
  }>;

  sensorConflicts: Array<{
    conflictId: string;
    assetId: string;
    metricCategory: string;
    detectedAt: string;
    sources: Array<{
      sourceId: string;
      sourceType: TelemetrySourceType;
      reportedValue: number;
      unit: string;
      trustScore: number;
    }>;
    variancePercent: number;
    recommendedTrustedValue: number;
    diagnosis: string;
  }>;

  qualityWarnings: Array<{
    id: string;
    timestamp: string;
    sourceId: string;
    assetName: string;
    warningType: 'MISSING_READINGS' | 'OUT_OF_BOUNDS' | 'STALE_DATA' | 'CLOCK_SKEW' | 'FLATLINE_DETECTED' | 'RATE_SPIKE';
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }>;
}

// Asset Health vs Telemetry Health Matrix Item
export interface DualHealthStatus {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  rackId: string;
  zone: string;
  
  assetHealth: number; // 0-100 (Physical operational condition)
  telemetryHealth: number; // 0-100 (Observation fidelity & sensor reliability)
  
  assetStatus: ServerStatus;
  telemetryStatus: 'nominal' | 'stale' | 'intermittent' | 'sensor_failure' | 'untrusted';
  
  discrepancyNote?: string;
  primaryTelemetryIssue?: string;
  lastTelemetryTimestamp: string;
}

// Baseline & Operating Profile
export interface MetricBaselineProfile {
  assetId: string;
  metricName: string;
  unit: string;
  
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  
  normalRangeLower: number;
  normalRangeUpper: number;
  
  typicalOperatingWindow: string; // e.g. "35% - 65%"
  currentTrend: 'STABLE' | 'DRIFTING_UP' | 'DRIFTING_DOWN' | 'OSCILLATING' | 'VOLATILE';
  
  timeAwareProfiles: Array<{
    hourOfDay: number; // 0 - 23
    expectedMean: number;
    expectedRange: [number, number];
  }>;

  lastCalculatedEpochMs: number;
}

// Change-Point Detection Record
export interface BehaviorChangePoint {
  id: string;
  assetId: string;
  assetName: string;
  metricName: string;
  detectedAt: string;
  previousBaseline: number;
  newBaseline: number;
  percentageShift: number;
  pConfidence: number; // e.g. 98.4%
  possibleReason: string;
  recommendedInvestigation: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED_WORKLOAD_SHIFT';
}

// Long-Term Drift Record
export interface TelemetryDriftRecord {
  id: string;
  assetId: string;
  assetName: string;
  metricName: string;
  unit: string;
  baselinePeriodDays: number;
  historicalBaselineMean: number;
  currentRunningMean: number;
  totalDriftPercentage: number;
  driftVelocityPerWeek: number;
  firstNoticedDate: string;
  forecastRunwayDaysUntilLimit: number;
  capacityImpactAssessment: string;
}

// Multi-Algorithm Anomaly Output
export interface MultiAlgorithmAnomalyResult {
  anomalyId: string;
  telemetryId: string;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  rackId: string;
  zone: string;
  
  metricName: string;
  metricCategory: string;
  currentValue: number;
  unit: string;
  
  historicalBaseline: {
    mean: number;
    expectedRange: [number, number];
  };

  deviationValue: number;
  deviationPercent: number;

  anomalyScore: number; // 0 - 100
  severity: AlertSeverity;
  
  // Strategy chosen based on metric volume & asset
  selectedAlgorithm: 'Z_SCORE' | 'EWMA' | 'IQR' | 'ISOLATION_FOREST' | 'AUTOENCODER' | 'CHANGE_POINT' | 'MULTIVARIATE_CORRELATION';
  algorithmConfidence: number; // 0 - 100%

  temporalPattern: 'SUDDEN_SPIKE' | 'GRADUAL_DEGRADATION' | 'OSCILLATION' | 'SENSOR_FLATLINE' | 'TELEMETRY_GAP' | 'STEP_CHANGE';

  // Explainability - WHY did this trigger?
  explanation: {
    plainLanguageSummary: string;
    contributingSignals: Array<{
      metric: string;
      observed: string;
      baseline: string;
      contributionScore: number;
    }>;
    contextualEvidence: string[];
    isMultiMetricCorrelation: boolean;
  };

  timestamp: string;
  timestampEpochMs: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'SUPPRESSED' | 'RESOLVED';
}

// Cross-Asset Blast Radius Assessment
export interface BlastRadiusAssessment {
  rootAssetId: string;
  rootAssetName: string;
  rootAssetType: AssetType;
  incidentType: string;
  severity: AlertSeverity;
  
  affectedRacks: string[];
  affectedServersCount: number;
  affectedApplicationsCount: number;
  affectedApplications: string[];
  
  potentialTemperatureIncreaseC: number;
  potentialPowerLostKw: number;
  potentialFinancialRiskPerHrUsd: number;
  
  slaRiskLevel: 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimatedTimeToCascadingFailureMinutes: number;
  
  containmentRecommendation: string;
  propagationPath: string[];
}

// Incident Replay Point
export interface IncidentReplayFrame {
  frameIndex: number;
  relativeTimeStr: string; // e.g. "T - 10 min", "T + 0 min (Trigger)", "T + 4 min"
  timestamp: string;
  
  assetMetrics: Record<string, {
    cpu: number;
    ram: number;
    temp: number;
    power: number;
    fanRpm: number;
  }>;

  activeIncidentPhase: 'NORMAL_OPERATION' | 'INITIAL_ANOMALY' | 'MULTI_METRIC_CASCADE' | 'INCIDENT_DECLARED' | 'RCA_COMPUTED' | 'MITIGATION_APPLIED' | 'RECOVERY';
  
  highlightMessage: string;
  systemHealthScore: number;
  facilityPUE: number;
  activeAlarmsCount: number;
}

// Counterfactual "What-If" Trajectory
export interface CounterfactualSimulation {
  incidentId: string;
  targetAsset: string;
  observedMetric: string;
  currentReading: number;
  unit: string;
  
  withoutIntervention: {
    trajectoryPoints: Array<{ minuteOffset: number; projectedValue: number; riskState: string }>;
    predictedOutcome: string;
    estimatedTimeToTripMinutes: number;
    predictedMaxDamage: string;
  };

  withRecommendedAction: {
    actionTaken: string;
    trajectoryPoints: Array<{ minuteOffset: number; projectedValue: number; riskState: string }>;
    expectedRecoveryTimeMinutes: number;
    projectedFinalValue: number;
    confidenceScore: number;
  };

  disclaimer: string;
}

// Decision Engine Action Option
export interface DecisionActionOption {
  actionId: string;
  title: string;
  description: string;
  category: 'COOLING_ADJUST' | 'WORKLOAD_MIGRATE' | 'POWER_REBALANCE' | 'THROTTLE_CPU' | 'DISPATCH_TECH';
  
  estimatedTemperatureImpactC: number;
  estimatedPowerImpactKw: number;
  estimatedCostUsd: number;
  estimatedRecoveryMinutes: number;
  operationalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  
  requiresHumanApproval: boolean;
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'AUTO_APPLIED';
}

// Closed-Loop Outcome Tracking
export interface ClosedLoopOutcomeRecord {
  outcomeId: string;
  incidentId: string;
  problemTitle: string;
  targetAsset: string;
  
  recommendedAction: string;
  selectedAction: string;
  executedBy: string;
  executedAt: string;
  
  preActionMetricValue: number;
  postActionMetricValue: number;
  metricUnit: string;
  metricName: string;
  
  targetMet: boolean;
  recoveryDurationMinutes: number;
  outcomeStatus: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'MONITORING';
  
  rcaAccuracyRating: number; // 0 - 100%
  recommendationRating: number; // 0 - 100%
  engineerFeedbackNotes?: string;
}

// Platform Observability Metrics
export interface TelemetryPlatformMetrics {
  ingestionRateEventsPerSec: number;
  totalEventsProcessed24h: number;
  droppedEventsCount: number;
  rejectedEventsCount: number;
  dropRatePercent: number;
  
  gatewayLatencyMs: number;
  aiProcessingLatencyMs: number;
  dbWriteLatencyMs: number;
  
  activeQueueSize: number;
  connectedAgentsCount: number;
  offlineAgentsCount: number;
  
  telemetryIntelligenceScore: {
    totalScore: number; // 0-100
    coverage: number;
    freshness: number;
    quality: number;
    correlation: number;
    prediction: number;
    explainability: number;
  };

  securityAuditLogs: Array<{
    id: string;
    timestamp: string;
    sourceIp: string;
    agentId: string;
    action: 'INGEST_ACCEPTED' | 'INGEST_REJECTED_SCHEMA' | 'RATE_LIMIT_EXCEEDED' | 'AUTH_FAILED' | 'SANITY_BOUNDS_TRIP';
    reason: string;
    payloadSnippet: string;
  }>;
}
