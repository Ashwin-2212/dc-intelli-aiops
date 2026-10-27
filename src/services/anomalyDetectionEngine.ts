import { SubThresholdAnomalyRecord, AnomalyDetectionMethod } from '../types';

export const seedSubThresholdAnomalies: SubThresholdAnomalyRecord[] = [
  {
    id: 'ANOM-CPU-SURGE-001',
    deviceId: 'SRV-R-04-02',
    deviceName: 'Server SRV-R-04-02 (AI Training Node)',
    deviceType: 'server',
    rackId: 'RACK-04',
    
    // 7 Exact required fields from Feature 9 prompt
    metric: 'CPU Utilization (%)',
    expectedValue: '51.0%', // Expected value from normal sequence
    actualValue: '94.0%', // Actual anomalous value from sequence
    deviation: '+43.0% (+84.3% vs Rolling Baseline, Surge Rate +22%/step)',
    severity: 'CRITICAL',
    timestamp: '2026-09-14 22:18:40 UTC',
    confidence: 96.8, // %
    
    detectionMethod: 'isolation_forest',
    thresholdViolation: false, // Caught at 72% before the 95% static alarm
    staticThresholdLimit: '95.0%',
    canonicalSequenceNote: 'Normal: 40 → 45 → 48 → 51  |  Anomaly: 40 → 45 → 48 → 72 → 94',
    zScoreValue: 4.86,
    isolationForestScore: -0.42,
    rootCauseInsight:
      'Sub-threshold velocity anomaly: CPU surged from 48% to 72% to 94% within 90 seconds due to unconstrained thread pool deadlock in worker container.',
    recommendedAction:
      'Throttle worker pod cgroups quota and migrate replica shards to Rack R-10 before silicon reaches 95% static trip threshold.',
    status: 'DETECTED',
    timeSeriesHistory: [
      { step: 1, label: 'T-4m', actual: 40.0, normalBaseline: 40.0, isAnomaly: false },
      { step: 2, label: 'T-3m', actual: 45.0, normalBaseline: 43.0, isAnomaly: false },
      { step: 3, label: 'T-2m', actual: 48.0, normalBaseline: 46.0, isAnomaly: false },
      { step: 4, label: 'T-1m', actual: 72.0, normalBaseline: 49.0, isAnomaly: true },
      { step: 5, label: 'T-0 (Now)', actual: 94.0, normalBaseline: 51.0, isAnomaly: true },
    ],
  },
  {
    id: 'ANOM-THERM-DELTA-002',
    deviceId: 'RACK-07',
    deviceName: 'Rack R-07 (Database Cluster Row-2)',
    deviceType: 'rack',
    rackId: 'RACK-07',
    
    metric: 'Inlet Temperature (°C)',
    expectedValue: '21.5°C',
    actualValue: '29.0°C',
    deviation: '+7.5°C (+34.8% delta vs Aisle Baseline)',
    severity: 'HIGH',
    timestamp: '2026-09-14 22:15:10 UTC',
    confidence: 94.2,
    
    detectionMethod: 'rolling_baseline',
    thresholdViolation: false,
    staticThresholdLimit: '30.0°C',
    canonicalSequenceNote: 'Normal: 21.0 → 21.2 → 21.4 → 21.5  |  Anomaly: 21.0 → 22.8 → 25.4 → 29.0',
    zScoreValue: 3.92,
    rootCauseInsight:
      'Microclimate thermodynamic bleed: Cold aisle containment damper restricted, increasing inlet temp toward 34°C predicted horizon.',
    recommendedAction:
      'Increase CRAH-03 chilled water actuator valve +15% and verify blanking panels.',
    status: 'INVESTIGATING',
    timeSeriesHistory: [
      { step: 1, label: 'T-4m', actual: 21.0, normalBaseline: 21.0, isAnomaly: false },
      { step: 2, label: 'T-3m', actual: 22.8, normalBaseline: 21.2, isAnomaly: false },
      { step: 3, label: 'T-2m', actual: 25.4, normalBaseline: 21.3, isAnomaly: true },
      { step: 4, label: 'T-1m', actual: 27.2, normalBaseline: 21.4, isAnomaly: true },
      { step: 5, label: 'T-0 (Now)', actual: 29.0, normalBaseline: 21.5, isAnomaly: true },
    ],
  },
  {
    id: 'ANOM-PWR-FLUX-003',
    deviceId: 'PDU-1A-FEED',
    deviceName: 'Floor PDU-1A (Row-1 Infeed)',
    deviceType: 'pdu',
    rackId: 'RACK-04',
    
    metric: 'Phase-B Neutral Current (Amps)',
    expectedValue: '38.4 A',
    actualValue: '62.1 A',
    deviation: '+23.7 A (Harmonic Distortion Spike 3rd Order)',
    severity: 'HIGH',
    timestamp: '2026-09-14 22:12:00 UTC',
    confidence: 91.5,
    
    detectionMethod: 'z_score',
    thresholdViolation: false,
    staticThresholdLimit: '75.0 A',
    canonicalSequenceNote: 'Normal: 36 → 37 → 38 → 38.4  |  Anomaly: 36 → 38 → 49 → 62.1',
    zScoreValue: 4.15,
    rootCauseInsight:
      'Harmonic imbalance from simultaneous power-supply capacitor charge cycles across redundant servers.',
    recommendedAction:
      'Rebalance single-phase server power cords between Branch Circuit A and Branch Circuit B.',
    status: 'ACKNOWLEDGED',
    timeSeriesHistory: [
      { step: 1, label: 'T-4m', actual: 36.0, normalBaseline: 36.0, isAnomaly: false },
      { step: 2, label: 'T-3m', actual: 38.0, normalBaseline: 37.0, isAnomaly: false },
      { step: 3, label: 'T-2m', actual: 49.0, normalBaseline: 37.8, isAnomaly: true },
      { step: 4, label: 'T-1m', actual: 56.4, normalBaseline: 38.1, isAnomaly: true },
      { step: 5, label: 'T-0 (Now)', actual: 62.1, normalBaseline: 38.4, isAnomaly: true },
    ],
  },
  {
    id: 'ANOM-FAN-INSTAB-004',
    deviceId: 'SRV-R-01-04',
    deviceName: 'Server SRV-R-01-04 (Storage Node)',
    deviceType: 'server',
    rackId: 'RACK-01',
    
    metric: 'Blower Fan Tachometer (RPM)',
    expectedValue: '7,200 RPM',
    actualValue: '13,450 RPM',
    deviation: '+6,250 RPM (+86.8% vs Expected Thermal Demand)',
    severity: 'MEDIUM',
    timestamp: '2026-09-14 22:04:30 UTC',
    confidence: 89.2,
    
    detectionMethod: 'moving_averages',
    thresholdViolation: false,
    staticThresholdLimit: '15,000 RPM',
    canonicalSequenceNote: 'Normal: 7000 → 7100 → 7150 → 7200  |  Anomaly: 7000 → 7400 → 10200 → 13450',
    zScoreValue: 3.42,
    rootCauseInsight:
      'PWM control loop hunting: Fan controller oscillating rapidly due to noisy thermistor reading on PCIe riser.',
    recommendedAction:
      'Flash BMC firmware patch and recalibrate thermal PID curves.',
    status: 'RESOLVED',
    timeSeriesHistory: [
      { step: 1, label: 'T-4m', actual: 7000, normalBaseline: 7000, isAnomaly: false },
      { step: 2, label: 'T-3m', actual: 7400, normalBaseline: 7100, isAnomaly: false },
      { step: 3, label: 'T-2m', actual: 10200, normalBaseline: 7150, isAnomaly: true },
      { step: 4, label: 'T-1m', actual: 12100, normalBaseline: 7180, isAnomaly: true },
      { step: 5, label: 'T-0 (Now)', actual: 13450, normalBaseline: 7200, isAnomaly: true },
    ],
  },
];
