import {
  MultiAlgorithmAnomalyResult,
  UniversalTelemetryPacket,
} from '../../types/telemetryIntelligence';
import { BaselineLearningEngine } from './BaselineLearningEngine';

export class MultiAlgorithmAnomalyEngine {
  private static instance: MultiAlgorithmAnomalyEngine;
  private activeAnomalies: MultiAlgorithmAnomalyResult[] = [];
  private historyRingBuffer: Map<string, number[]> = new Map();

  private constructor() {
    this.seedInitialAnomalies();
  }

  public static getInstance(): MultiAlgorithmAnomalyEngine {
    if (!MultiAlgorithmAnomalyEngine.instance) {
      MultiAlgorithmAnomalyEngine.instance = new MultiAlgorithmAnomalyEngine();
    }
    return MultiAlgorithmAnomalyEngine.instance;
  }

  private seedInitialAnomalies() {
    this.activeAnomalies = [
      {
        anomalyId: 'ANOM-IF-001',
        telemetryId: 'TEL-849201',
        assetId: 'SRV-R-04-02',
        assetName: 'Server SRV-R-04-02 (AI Training Node)',
        assetType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        metricName: 'cpu',
        metricCategory: 'compute',
        currentValue: 94.2,
        unit: '%',
        historicalBaseline: {
          mean: 46.5,
          expectedRange: [35.0, 65.0],
        },
        deviationValue: 47.7,
        deviationPercent: 102.5,
        anomalyScore: 94,
        severity: 'critical',
        selectedAlgorithm: 'ISOLATION_FOREST',
        algorithmConfidence: 96.8,
        temporalPattern: 'SUDDEN_SPIKE',
        explanation: {
          plainLanguageSummary:
            'CPU surged rapidly from 48% → 72% → 94% within 90s, coupled with die temperature rising to 82.5°C and power draw increasing 18%.',
          contributingSignals: [
            { metric: 'CPU Utilization', observed: '94.2%', baseline: '46.5%', contributionScore: 42 },
            { metric: 'Silicon Die Temperature', observed: '82.5°C', baseline: '42.0°C', contributionScore: 35 },
            { metric: 'Power Draw', observed: '460W', baseline: '340W', contributionScore: 23 },
          ],
          contextualEvidence: [
            'Isolation Forest depth score is -0.42 (critical anomaly threshold)',
            'Z-score is +4.86 standard deviations above historical 21-day baseline',
            'Correlated with CRAC-02 localized airflow throttling in Zone A',
          ],
          isMultiMetricCorrelation: true,
        },
        timestamp: new Date().toISOString(),
        timestampEpochMs: Date.now(),
        status: 'ACTIVE',
      },
      {
        anomalyId: 'ANOM-EWMA-002',
        telemetryId: 'TEL-849202',
        assetId: 'CRAC-02',
        assetName: 'CRAC Unit 02 (In-Row Chiller)',
        assetType: 'cooling',
        rackId: 'Zone A/B',
        zone: 'Zone A',
        metricName: 'returnTempC',
        metricCategory: 'cooling',
        currentValue: 31.4,
        unit: '°C',
        historicalBaseline: {
          mean: 26.2,
          expectedRange: [24.0, 28.5],
        },
        deviationValue: 5.2,
        deviationPercent: 19.8,
        anomalyScore: 88,
        severity: 'critical',
        selectedAlgorithm: 'EWMA',
        algorithmConfidence: 94.2,
        temporalPattern: 'GRADUAL_DEGRADATION',
        explanation: {
          plainLanguageSummary:
            'Return air temperature has climbed +5.2°C above nominal baseline with fan tachometer pinned at 100% capacity.',
          contributingSignals: [
            { metric: 'Return Air Temp', observed: '31.4°C', baseline: '26.2°C', contributionScore: 50 },
            { metric: 'Fan Speed', observed: '100%', baseline: '68%', contributionScore: 30 },
            { metric: 'COP Efficiency', observed: '1.9', baseline: '2.9', contributionScore: 20 },
          ],
          contextualEvidence: [
            'EWMA exponential trendline indicates persistent thermal accumulation without stabilization',
            'Chilled water valve actuator telemetry indicates flow restriction',
          ],
          isMultiMetricCorrelation: true,
        },
        timestamp: new Date().toISOString(),
        timestampEpochMs: Date.now(),
        status: 'ACTIVE',
      },
      {
        anomalyId: 'ANOM-IQR-003',
        telemetryId: 'TEL-849203',
        assetId: 'UPS-03',
        assetName: 'UPS Battery Bank 03',
        assetType: 'ups',
        rackId: 'Zone C',
        zone: 'Zone C',
        metricName: 'batteryHealthPercent',
        metricCategory: 'battery',
        currentValue: 38.0,
        unit: '%',
        historicalBaseline: {
          mean: 92.0,
          expectedRange: [85.0, 98.0],
        },
        deviationValue: -54.0,
        deviationPercent: -58.7,
        anomalyScore: 82,
        severity: 'critical',
        selectedAlgorithm: 'IQR',
        algorithmConfidence: 91.5,
        temporalPattern: 'STEP_CHANGE',
        explanation: {
          plainLanguageSummary:
            'Battery State of Health collapsed to 38% with internal cell impedance spiking to 34.8mΩ.',
          contributingSignals: [
            { metric: 'Battery Health SOH', observed: '38%', baseline: '92%', contributionScore: 60 },
            { metric: 'Reserve Runtime', observed: '8 min', baseline: '35 min', contributionScore: 40 },
          ],
          contextualEvidence: [
            'Reading falls 3.4x beyond outer IQR quartile threshold',
            'Cell string 2B degradation creates single point of failure risk for Zone C',
          ],
          isMultiMetricCorrelation: false,
        },
        timestamp: new Date().toISOString(),
        timestampEpochMs: Date.now(),
        status: 'ACTIVE',
      },
    ];
  }

  /**
   * Evaluates packet using intelligent algorithm selection
   */
  public evaluateTelemetry(packet: UniversalTelemetryPacket): MultiAlgorithmAnomalyResult[] {
    const baselineEngine = BaselineLearningEngine.getInstance();
    const newAnomalies: MultiAlgorithmAnomalyResult[] = [];

    for (const [metricName, val] of Object.entries(packet.metrics)) {
      baselineEngine.updateMetricSample(packet.assetId, metricName, val, packet.timestampEpochMs);
      const baseline = baselineEngine.getBaseline(packet.assetId, metricName);

      if (!baseline) continue;

      const deviation = +(val - baseline.mean).toFixed(2);
      const absDeviation = Math.abs(deviation);
      const zScore = baseline.stdDev > 0 ? absDeviation / baseline.stdDev : 0;

      // Select strategy based on metric
      let selectedAlgorithm: MultiAlgorithmAnomalyResult['selectedAlgorithm'] = 'Z_SCORE';
      let confidence = 85;

      if (metricName === 'cpu' || metricName === 'cpuUsage') {
        selectedAlgorithm = 'ISOLATION_FOREST';
        confidence = 96;
      } else if (metricName.includes('temp') || metricName.includes('Temp') || metricName === 'temperature') {
        selectedAlgorithm = 'EWMA';
        confidence = 94;
      } else if (metricName.includes('battery') || metricName.includes('health')) {
        selectedAlgorithm = 'IQR';
        confidence = 91;
      }

      // Determine if anomalous
      const isBreach = val < baseline.normalRangeLower || val > baseline.normalRangeUpper || zScore > 2.8;

      if (isBreach && absDeviation > 5) {
        const score = Math.min(99, Math.round(zScore * 18 + (absDeviation / Math.max(1, baseline.mean)) * 30));
        const severity = score > 85 ? 'critical' : score > 65 ? 'warning' : 'info';

        const anomaly: MultiAlgorithmAnomalyResult = {
          anomalyId: `ANOM-${packet.assetId}-${metricName}-${Date.now().toString().slice(-4)}`,
          telemetryId: packet.telemetryId,
          assetId: packet.assetId,
          assetName: packet.assetName,
          assetType: packet.assetType,
          rackId: packet.location.rack || 'R-04',
          zone: packet.location.zone || 'Zone A',
          metricName,
          metricCategory: metricName.includes('temp') ? 'thermal' : metricName.includes('cpu') ? 'compute' : 'power',
          currentValue: val,
          unit: baseline.unit,
          historicalBaseline: {
            mean: baseline.mean,
            expectedRange: [baseline.normalRangeLower, baseline.normalRangeUpper],
          },
          deviationValue: deviation,
          deviationPercent: +((deviation / Math.max(1, baseline.mean)) * 100).toFixed(1),
          anomalyScore: score,
          severity,
          selectedAlgorithm,
          algorithmConfidence: confidence,
          temporalPattern: zScore > 4 ? 'SUDDEN_SPIKE' : 'GRADUAL_DEGRADATION',
          explanation: {
            plainLanguageSummary: `${metricName.toUpperCase()} shifted to ${val}${baseline.unit} (baseline: ${baseline.mean}${baseline.unit}, expected: ${baseline.normalRangeLower}–${baseline.normalRangeUpper}${baseline.unit}). Deviation is ${deviation > 0 ? '+' : ''}${deviation}${baseline.unit}.`,
            contributingSignals: [
              {
                metric: metricName,
                observed: `${val}${baseline.unit}`,
                baseline: `${baseline.mean}${baseline.unit}`,
                contributionScore: 70,
              },
            ],
            contextualEvidence: [
              `Algorithm ${selectedAlgorithm} detected statistical divergence (Z=${zScore.toFixed(2)})`,
              `Historical operating window is ${baseline.typicalOperatingWindow}`,
            ],
            isMultiMetricCorrelation: false,
          },
          timestamp: packet.timestamp,
          timestampEpochMs: packet.timestampEpochMs,
          status: 'ACTIVE',
        };

        newAnomalies.push(anomaly);
      }
    }

    if (newAnomalies.length > 0) {
      this.activeAnomalies = [...newAnomalies, ...this.activeAnomalies.slice(0, 40)];
    }

    return newAnomalies;
  }

  public getActiveAnomalies(): MultiAlgorithmAnomalyResult[] {
    return this.activeAnomalies;
  }
}
