import {
  DualHealthStatus,
  TelemetryQualityReport,
  UniversalTelemetryPacket,
  TelemetrySourceRegistration,
} from '../../types/telemetryIntelligence';

export class TelemetryQualityEngine {
  private static instance: TelemetryQualityEngine;
  private sourceHistory: Map<string, { lastSeen: number; packetCount: number; errorCount: number; values: number[] }> = new Map();
  private dualHealthMatrix: Map<string, DualHealthStatus> = new Map();
  private qualityWarnings: TelemetryQualityReport['qualityWarnings'] = [];
  private detectedGaps: TelemetryQualityReport['detectedGaps'] = [];

  private constructor() {
    this.seedInitialQualityState();
  }

  public static getInstance(): TelemetryQualityEngine {
    if (!TelemetryQualityEngine.instance) {
      TelemetryQualityEngine.instance = new TelemetryQualityEngine();
    }
    return TelemetryQualityEngine.instance;
  }

  private seedInitialQualityState() {
    // Seed realistic Dual Health Matrix (demonstrating Asset Health vs Telemetry Health distinction)
    this.dualHealthMatrix.set('SRV-R-04-02', {
      assetId: 'SRV-R-04-02',
      assetName: 'Server SRV-R-04-02 (AI Training Node)',
      assetType: 'server',
      rackId: 'R-04',
      zone: 'Zone A',
      assetHealth: 45, // Thermal stress on silicon
      telemetryHealth: 98, // Telemetry stream is crisp & responsive
      assetStatus: 'critical',
      telemetryStatus: 'nominal',
      discrepancyNote: 'High fidelity telemetry confirming physical thermal throttle on CPU die.',
      lastTelemetryTimestamp: new Date().toISOString(),
    });

    this.dualHealthMatrix.set('SRV-R-02-04', {
      assetId: 'SRV-R-02-04',
      assetName: 'Server SRV-R-02-04 (Storage Node)',
      assetType: 'server',
      rackId: 'R-02',
      zone: 'Zone A',
      assetHealth: 92, // Asset runs normally
      telemetryHealth: 48, // Telemetry sensor degraded/intermittent
      assetStatus: 'healthy',
      telemetryStatus: 'sensor_failure',
      discrepancyNote: 'BMC Redfish temperature probe disconnected; OS agent operating normally.',
      primaryTelemetryIssue: 'Temperature sensor stopped reporting 7 intervals ago.',
      lastTelemetryTimestamp: new Date(Date.now() - 140000).toISOString(),
    });

    this.dualHealthMatrix.set('CRAC-02', {
      assetId: 'CRAC-02',
      assetName: 'CRAC Unit 02 (In-Row Chiller)',
      assetType: 'cooling',
      rackId: 'Zone A/B',
      zone: 'Zone A',
      assetHealth: 32, // Compressor valve degraded
      telemetryHealth: 94, // Modbus bus telemetry is active
      assetStatus: 'critical',
      telemetryStatus: 'nominal',
      discrepancyNote: 'High confidence telemetry confirms return water temperature elevated at 31.4°C.',
      lastTelemetryTimestamp: new Date().toISOString(),
    });

    this.dualHealthMatrix.set('UPS-03', {
      assetId: 'UPS-03',
      assetName: 'UPS Battery Bank 03 (Zone C High-Density)',
      assetType: 'ups',
      rackId: 'Zone C',
      zone: 'Zone C',
      assetHealth: 41, // Battery internal impedance high
      telemetryHealth: 96,
      assetStatus: 'critical',
      telemetryStatus: 'nominal',
      discrepancyNote: 'SNMP UPS-MIB reports cell resistance 34.8mΩ across string 2B.',
      lastTelemetryTimestamp: new Date().toISOString(),
    });

    this.detectedGaps = [
      {
        sourceId: 'TEMP-SENSOR-04',
        assetName: 'Server SRV-R-02-04 (Storage Node)',
        metricName: 'temperature',
        gapDurationSeconds: 420,
        lastReportedTime: '7 minutes ago',
        impactLevel: 'HIGH',
        reason: 'Thermistor intermittent packet loss over I2C bus.',
      },
    ];

    this.qualityWarnings = [
      {
        id: 'WARN-Q-01',
        timestamp: new Date().toISOString(),
        sourceId: 'TEMP-SENSOR-04',
        assetName: 'Server SRV-R-02-04',
        warningType: 'MISSING_READINGS',
        message: 'SERVER-02 has missing temperature readings for 7 consecutive intervals.',
        severity: 'warning',
      },
      {
        id: 'WARN-Q-02',
        timestamp: new Date().toISOString(),
        sourceId: 'adapter-modbus-01',
        assetName: 'CRAC-02',
        warningType: 'RATE_SPIKE',
        message: 'Fan speed telemetry rate of change reached +35% in 2.0s.',
        severity: 'info',
      },
    ];
  }

  /**
   * Evaluates packet quality and updates health matrix
   */
  public evaluatePacketQuality(packet: UniversalTelemetryPacket): {
    qualityScore: number;
    warnings: string[];
  } {
    const now = Date.now();
    const history = this.sourceHistory.get(packet.sourceId) || {
      lastSeen: now,
      packetCount: 0,
      errorCount: 0,
      values: [],
    };

    history.packetCount++;
    const gapSeconds = (now - history.lastSeen) / 1000;
    history.lastSeen = now;

    // Detect Telemetry Gaps
    if (gapSeconds > 15 && history.packetCount > 1) {
      this.detectedGaps = [
        {
          sourceId: packet.sourceId,
          assetName: packet.assetName,
          metricName: 'telemetry_stream',
          gapDurationSeconds: Math.round(gapSeconds),
          lastReportedTime: new Date(now - gapSeconds * 1000).toISOString(),
          impactLevel: gapSeconds > 60 ? 'HIGH' : 'MEDIUM',
          reason: `Telemetry gap of ${Math.round(gapSeconds)}s detected on ${packet.sourceId}`,
        },
        ...this.detectedGaps.slice(0, 9),
      ];
    }

    // Flatline Detection (sensor stuck repeating exact same value 10+ times)
    const primaryMetric = packet.metrics.cpu || packet.metrics.temperature || packet.metrics.power || 0;
    history.values.push(primaryMetric);
    if (history.values.length > 10) history.values.shift();

    if (history.values.length >= 8 && history.values.every(v => Math.abs(v - history.values[0]) < 0.001 && v > 0)) {
      this.qualityWarnings = [
        {
          id: `FLATLINE-${packet.sourceId}-${now}`,
          timestamp: new Date().toISOString(),
          sourceId: packet.sourceId,
          assetName: packet.assetName,
          warningType: 'FLATLINE_DETECTED',
          message: `Sensor Flatline: ${packet.assetName} metric repeated exact reading (${primaryMetric}) 8+ intervals consecutively. Possible sensor freeze.`,
          severity: 'warning',
        },
        ...this.qualityWarnings.slice(0, 19),
      ];
    }

    this.sourceHistory.set(packet.sourceId, history);

    // Compute Telemetry Health vs Asset Health
    const currentAssetHealth = packet.status === 'critical' ? 42 : packet.status === 'warning' ? 72 : 94;
    const completeness = packet.quality.completeness || 90;
    const validity = packet.quality.validity || 95;
    const freshness = packet.quality.freshness || 98;
    const continuity = gapSeconds > 30 ? 60 : 96;
    const sourceReliability = Math.max(20, 100 - (history.errorCount / Math.max(1, history.packetCount)) * 100);

    const telemetryHealthScore = Math.round(
      completeness * 0.25 + validity * 0.25 + freshness * 0.2 + continuity * 0.15 + sourceReliability * 0.15
    );

    this.dualHealthMatrix.set(packet.assetId, {
      assetId: packet.assetId,
      assetName: packet.assetName,
      assetType: packet.assetType,
      rackId: packet.location.rack || 'R-04',
      zone: packet.location.zone || 'Zone A',
      assetHealth: currentAssetHealth,
      telemetryHealth: telemetryHealthScore,
      assetStatus: packet.status,
      telemetryStatus: telemetryHealthScore < 60 ? 'sensor_failure' : telemetryHealthScore < 80 ? 'stale' : 'nominal',
      discrepancyNote:
        currentAssetHealth > 85 && telemetryHealthScore < 65
          ? 'Asset operates normally but telemetry probe is unstable/intermittent.'
          : currentAssetHealth < 60 && telemetryHealthScore > 90
          ? 'High-confidence telemetry stream confirms physical asset degradation.'
          : 'Telemetry fidelity matches operational asset status.',
      lastTelemetryTimestamp: packet.timestamp,
    });

    return {
      qualityScore: telemetryHealthScore,
      warnings: packet.quality.warnings || [],
    };
  }

  public getDualHealthMatrix(): DualHealthStatus[] {
    return Array.from(this.dualHealthMatrix.values());
  }

  public getQualityReport(): TelemetryQualityReport {
    const allDual = Array.from(this.dualHealthMatrix.values());
    const avgTelemetryHealth = allDual.length > 0
      ? Math.round(allDual.reduce((acc, d) => acc + d.telemetryHealth, 0) / allDual.length)
      : 92;

    return {
      overallQualityScore: avgTelemetryHealth,
      completenessScore: 94,
      freshnessScore: 97,
      validityScore: 98,
      continuityScore: 88,
      sourceReliabilityScore: 93,
      activeSourcesCount: allDual.filter(d => d.telemetryHealth >= 70).length,
      degradedSourcesCount: allDual.filter(d => d.telemetryHealth >= 40 && d.telemetryHealth < 70).length,
      offlineSourcesCount: allDual.filter(d => d.telemetryHealth < 40).length,
      detectedGaps: this.detectedGaps,
      sensorConflicts: [
        {
          conflictId: 'CONF-001',
          assetId: 'SRV-R-04-02',
          metricCategory: 'temperature',
          detectedAt: '3m ago',
          sources: [
            { sourceId: 'redfish_bmc', sourceType: 'redfish_bmc', reportedValue: 69.0, unit: '°C', trustScore: 96 },
            { sourceId: 'os_agent', sourceType: 'windows_agent', reportedValue: 68.5, unit: '°C', trustScore: 94 },
            { sourceId: 'rack_external_sensor', sourceType: 'iot_esp32_mqtt', reportedValue: 81.2, unit: '°C', trustScore: 58 },
          ],
          variancePercent: 18.2,
          recommendedTrustedValue: 68.8,
          diagnosis: 'Rack ambient thermistor affected by localized hot exhaust plume. Internal BMC die sensors agree within 0.5°C.',
        },
      ],
      qualityWarnings: this.qualityWarnings,
    };
  }
}
