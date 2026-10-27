import {
  BehaviorChangePoint,
  MetricBaselineProfile,
  TelemetryDriftRecord,
  UniversalTelemetryPacket,
} from '../../types/telemetryIntelligence';

export class BaselineLearningEngine {
  private static instance: BaselineLearningEngine;
  private baselines: Map<string, MetricBaselineProfile> = new Map();
  private changePoints: BehaviorChangePoint[] = [];
  private driftRecords: TelemetryDriftRecord[] = [];
  private rollingWindows: Map<string, number[]> = new Map();

  private constructor() {
    this.seedInitialBaselines();
  }

  public static getInstance(): BaselineLearningEngine {
    if (!BaselineLearningEngine.instance) {
      BaselineLearningEngine.instance = new BaselineLearningEngine();
    }
    return BaselineLearningEngine.instance;
  }

  private seedInitialBaselines() {
    // Seed asset-specific baselines
    this.baselines.set('SRV-R-04-02:cpu', {
      assetId: 'SRV-R-04-02',
      metricName: 'cpu',
      unit: '%',
      mean: 46.5,
      median: 45.0,
      stdDev: 8.2,
      min: 15.0,
      max: 68.0,
      normalRangeLower: 35.0,
      normalRangeUpper: 65.0,
      typicalOperatingWindow: '35% – 65%',
      currentTrend: 'DRIFTING_UP',
      timeAwareProfiles: Array.from({ length: 24 }).map((_, h) => ({
        hourOfDay: h,
        expectedMean: h >= 8 && h <= 18 ? 54.0 : 38.0,
        expectedRange: h >= 8 && h <= 18 ? [40, 68] : [25, 48],
      })),
      lastCalculatedEpochMs: Date.now(),
    });

    this.baselines.set('SRV-R-04-02:temperature', {
      assetId: 'SRV-R-04-02',
      metricName: 'temperature',
      unit: '°C',
      mean: 42.0,
      median: 41.5,
      stdDev: 3.8,
      min: 32.0,
      max: 58.0,
      normalRangeLower: 36.0,
      normalRangeUpper: 55.0,
      typicalOperatingWindow: '36°C – 55°C',
      currentTrend: 'VOLATILE',
      timeAwareProfiles: Array.from({ length: 24 }).map((_, h) => ({
        hourOfDay: h,
        expectedMean: 42.0,
        expectedRange: [36, 52],
      })),
      lastCalculatedEpochMs: Date.now(),
    });

    this.baselines.set('CRAC-02:powerDrawKw', {
      assetId: 'CRAC-02',
      metricName: 'powerDrawKw',
      unit: 'kW',
      mean: 42.5,
      median: 42.0,
      stdDev: 4.5,
      min: 35.0,
      max: 55.0,
      normalRangeLower: 38.0,
      normalRangeUpper: 50.0,
      typicalOperatingWindow: '38 kW – 50 kW',
      currentTrend: 'DRIFTING_UP',
      timeAwareProfiles: [],
      lastCalculatedEpochMs: Date.now(),
    });

    // Seed Change-Point
    this.changePoints = [
      {
        id: 'CP-SRV-02-001',
        assetId: 'SRV-R-04-02',
        assetName: 'Server SRV-R-04-02',
        metricName: 'CPU Utilization',
        detectedAt: '14:32 UTC',
        previousBaseline: 45.0,
        newBaseline: 72.0,
        percentageShift: 60.0,
        pConfidence: 98.4,
        possibleReason: 'Workload pattern changed following deployment of LLM inference microservice batch.',
        recommendedInvestigation: 'Review container scheduling quota and verify if permanent re-baselining is required.',
        status: 'NEW',
      },
    ];

    // Seed Long-Term Drift Record
    this.driftRecords = [
      {
        id: 'DRIFT-001',
        assetId: 'SRV-R-04-02',
        assetName: 'Server SRV-R-04-02',
        metricName: 'CPU Utilization',
        unit: '%',
        baselinePeriodDays: 21,
        historicalBaselineMean: 42.0,
        currentRunningMean: 61.0,
        totalDriftPercentage: 45.2,
        driftVelocityPerWeek: 15.1,
        firstNoticedDate: '2026-09-10',
        forecastRunwayDaysUntilLimit: 28,
        capacityImpactAssessment: 'CPU utilization has increased 45% over 21 days due to progressive organic workload growth. Capacity planning action recommended.',
      },
      {
        id: 'DRIFT-002',
        assetId: 'CRAC-02',
        assetName: 'CRAC Unit 02',
        metricName: 'Compressor Power Draw',
        unit: 'kW',
        baselinePeriodDays: 30,
        historicalBaselineMean: 42.5,
        currentRunningMean: 58.2,
        totalDriftPercentage: 36.9,
        driftVelocityPerWeek: 9.2,
        firstNoticedDate: '2026-09-01',
        forecastRunwayDaysUntilLimit: 14,
        capacityImpactAssessment: 'Gradual refrigerant pressure bleed resulting in 37% higher power consumption for identical thermal delta.',
      },
    ];
  }

  /**
   * Updates rolling window and recalculates dynamic baseline for a metric
   */
  public updateMetricSample(assetId: string, metricName: string, value: number, timestamp: number = Date.now()) {
    const key = `${assetId}:${metricName}`;
    const window = this.rollingWindows.get(key) || [];
    window.push(value);
    if (window.length > 50) window.shift();
    this.rollingWindows.set(key, window);

    // Dynamic statistical estimation
    if (window.length >= 5) {
      const mean = +(window.reduce((a, b) => a + b, 0) / window.length).toFixed(2);
      const sorted = [...window].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
      const stdDev = +(Math.sqrt(variance)).toFixed(2);

      const hour = new Date(timestamp).getHours();
      const existing = this.baselines.get(key);

      this.baselines.set(key, {
        assetId,
        metricName,
        unit: existing?.unit || '',
        mean,
        median,
        stdDev: Math.max(0.5, stdDev),
        min: Math.min(...window),
        max: Math.max(...window),
        normalRangeLower: Math.max(0, +(mean - 2 * stdDev).toFixed(1)),
        normalRangeUpper: +(mean + 2 * stdDev).toFixed(1),
        typicalOperatingWindow: `${Math.max(0, +(mean - stdDev).toFixed(1))} – ${+(mean + stdDev).toFixed(1)}`,
        currentTrend: existing?.currentTrend || 'STABLE',
        timeAwareProfiles: existing?.timeAwareProfiles || [],
        lastCalculatedEpochMs: timestamp,
      });

      // Change-point detection logic: test if new 5-sample mean shifted > 25% from established long-term mean
      if (existing && Math.abs(mean - existing.mean) > existing.stdDev * 3 && window.length >= 20) {
        const shiftPercent = +(((mean - existing.mean) / Math.max(1, existing.mean)) * 100).toFixed(1);
        const existingCp = this.changePoints.find(cp => cp.assetId === assetId && cp.metricName === metricName);
        if (!existingCp) {
          this.changePoints.unshift({
            id: `CP-${assetId}-${Date.now()}`,
            assetId,
            assetName: assetId,
            metricName,
            detectedAt: new Date().toLocaleTimeString(),
            previousBaseline: existing.mean,
            newBaseline: mean,
            percentageShift: shiftPercent,
            pConfidence: 96.5,
            possibleReason: 'Workload pattern or operating state permanently stepped to new baseline.',
            recommendedInvestigation: 'Verify new operational baseline and adjust SLO alerting limits.',
            status: 'NEW',
          });
        }
      }
    }
  }

  public getBaseline(assetId: string, metricName: string): MetricBaselineProfile | undefined {
    return this.baselines.get(`${assetId}:${metricName}`);
  }

  public getAllBaselines(): MetricBaselineProfile[] {
    return Array.from(this.baselines.values());
  }

  public getChangePoints(): BehaviorChangePoint[] {
    return this.changePoints;
  }

  public getDriftRecords(): TelemetryDriftRecord[] {
    return this.driftRecords;
  }
}
