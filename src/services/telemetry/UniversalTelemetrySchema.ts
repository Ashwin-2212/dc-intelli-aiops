import { UniversalTelemetryPacket, UniversalMetricValue } from '../../types/telemetryIntelligence';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedPacket?: UniversalTelemetryPacket;
}

// Physical Bounds for Sanity & Validity Scoring
export const METRIC_PHYSICAL_BOUNDS: Record<
  string,
  { min: number; max: number; unit: string; category: UniversalMetricValue['category'] }
> = {
  cpu: { min: 0, max: 100, unit: '%', category: 'compute' },
  cpuUsage: { min: 0, max: 100, unit: '%', category: 'compute' },
  memory: { min: 0, max: 100, unit: '%', category: 'compute' },
  ramUsage: { min: 0, max: 100, unit: '%', category: 'compute' },
  disk: { min: 0, max: 100, unit: '%', category: 'storage' },
  diskUsage: { min: 0, max: 100, unit: '%', category: 'storage' },
  diskIOPS: { min: 0, max: 500000, unit: 'IOPS', category: 'storage' },
  temperature: { min: 0, max: 125, unit: '°C', category: 'thermal' },
  cpuTemp: { min: 10, max: 110, unit: '°C', category: 'thermal' },
  inletTempC: { min: 10, max: 55, unit: '°C', category: 'thermal' },
  outletTempC: { min: 15, max: 65, unit: '°C', category: 'thermal' },
  ambientTempC: { min: 10, max: 50, unit: '°C', category: 'thermal' },
  supplyTempC: { min: 10, max: 35, unit: '°C', category: 'cooling' },
  returnTempC: { min: 15, max: 45, unit: '°C', category: 'cooling' },
  humidity: { min: 5, max: 95, unit: '%', category: 'environmental' },
  ambientHumidityPercent: { min: 5, max: 95, unit: '%', category: 'environmental' },
  power: { min: 0, max: 50000, unit: 'W', category: 'power' },
  powerDrawWatts: { min: 0, max: 2000, unit: 'W', category: 'power' },
  totalFacilityPowerKw: { min: 0, max: 5000, unit: 'kW', category: 'power' },
  itEquipmentPowerKw: { min: 0, max: 4000, unit: 'kW', category: 'power' },
  currentPowerKw: { min: 0, max: 50, unit: 'kW', category: 'power' },
  voltage: { min: 0, max: 500, unit: 'V', category: 'power' },
  current: { min: 0, max: 200, unit: 'A', category: 'power' },
  pue: { min: 1.0, max: 3.5, unit: '', category: 'power' },
  fan: { min: 0, max: 30000, unit: 'RPM', category: 'mechanical' },
  fanSpeedRpm: { min: 0, max: 25000, unit: 'RPM', category: 'mechanical' },
  fanSpeedPercent: { min: 0, max: 100, unit: '%', category: 'mechanical' },
  upsBatteryPercent: { min: 0, max: 100, unit: '%', category: 'battery' },
  batteryHealthPercent: { min: 0, max: 100, unit: '%', category: 'battery' },
  batteryChargePercent: { min: 0, max: 100, unit: '%', category: 'battery' },
  runtimeRemainingMinutes: { min: 0, max: 600, unit: 'min', category: 'battery' },
  networkIn: { min: 0, max: 100000, unit: 'Mbps', category: 'network' },
  networkOut: { min: 0, max: 100000, unit: 'Mbps', category: 'network' },
  networkInMbps: { min: 0, max: 100000, unit: 'Mbps', category: 'network' },
  networkOutMbps: { min: 0, max: 100000, unit: 'Mbps', category: 'network' },
  latency: { min: 0, max: 5000, unit: 'ms', category: 'network' },
  networkLatencyMs: { min: 0, max: 5000, unit: 'ms', category: 'network' },
  responseTime: { min: 0, max: 10000, unit: 'ms', category: 'network' },
  responseTimesMs: { min: 0, max: 10000, unit: 'ms', category: 'network' },
  packetLoss: { min: 0, max: 100, unit: '%', category: 'network' },
  copEfficiency: { min: 0.5, max: 8.0, unit: 'COP', category: 'cooling' },
};

export class UniversalTelemetrySchema {
  /**
   * Validates raw incoming telemetry payload from any source
   */
  public static validateAndNormalize(rawPayload: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rawPayload || typeof rawPayload !== 'object') {
      return { isValid: false, errors: ['Malformed payload: Expected JSON object'] , warnings };
    }

    // Required Identity Fields
    const sourceId = rawPayload.sourceId || rawPayload.deviceId || rawPayload.id;
    if (!sourceId || typeof sourceId !== 'string') {
      errors.push('Missing required string field: sourceId');
    }

    const assetId = rawPayload.assetId || rawPayload.deviceId || sourceId || 'UNKNOWN_ASSET';
    const assetName = rawPayload.assetName || rawPayload.deviceName || assetId;
    const sourceType = rawPayload.sourceType || 'telemetry_simulator';
    const assetType = rawPayload.assetType || (sourceId?.toLowerCase().includes('crac') ? 'cooling' : sourceId?.toLowerCase().includes('ups') ? 'ups' : sourceId?.toLowerCase().includes('rack') ? 'rack' : 'server');

    // Timestamp validation & normalization
    let timestampEpochMs = Date.now();
    let timestamp = new Date(timestampEpochMs).toISOString();

    if (rawPayload.timestamp) {
      if (typeof rawPayload.timestamp === 'number') {
        timestampEpochMs = rawPayload.timestamp > 1e12 ? rawPayload.timestamp : rawPayload.timestamp * 1000;
        timestamp = new Date(timestampEpochMs).toISOString();
      } else if (typeof rawPayload.timestamp === 'string') {
        const parsed = Date.parse(rawPayload.timestamp);
        if (isNaN(parsed)) {
          warnings.push(`Unparseable timestamp string "${rawPayload.timestamp}", defaulted to server time`);
        } else {
          timestampEpochMs = parsed;
          timestamp = new Date(parsed).toISOString();
        }
      }
    }

    // Clock skew check (±24 hours max)
    const now = Date.now();
    if (Math.abs(now - timestampEpochMs) > 86400000 * 3) {
      warnings.push(`Timestamp clock skew detected: ${Math.round((now - timestampEpochMs) / 3600000)} hours from server time`);
    }

    // Extract metrics
    const rawMetrics = rawPayload.metrics || {};
    const normalizedMetrics: Record<string, number> = {};
    const metricDetails: Record<string, UniversalMetricValue> = {};

    // Copy top-level metrics if payload used flat structure
    const candidateKeys = Object.keys(rawPayload);
    for (const key of candidateKeys) {
      if (
        key !== 'sourceId' &&
        key !== 'assetId' &&
        key !== 'telemetryId' &&
        key !== 'location' &&
        key !== 'quality' &&
        key !== 'enrichment' &&
        typeof rawPayload[key] === 'number'
      ) {
        rawMetrics[key] = rawPayload[key];
      }
    }

    // Validate and score metric validity
    let validCount = 0;
    let checkedCount = 0;

    for (const [metricName, rawVal] of Object.entries(rawMetrics)) {
      if (typeof rawVal !== 'number' || isNaN(rawVal)) {
        warnings.push(`Non-numeric value for metric "${metricName}": ${rawVal}`);
        continue;
      }

      checkedCount++;
      const bounds = METRIC_PHYSICAL_BOUNDS[metricName] || {
        min: -10000,
        max: 1000000,
        unit: '',
        category: 'compute',
      };

      let val = rawVal;
      let qualityFlag: UniversalMetricValue['qualityFlag'] = 'GOOD';

      // Check physical bounds
      if (val < bounds.min || val > bounds.max) {
        qualityFlag = 'BAD';
        warnings.push(`Metric "${metricName}" value ${val} out of physical bounds [${bounds.min}, ${bounds.max}]`);
        // Clamp to prevent corruption of downstream AI engines
        val = Math.max(bounds.min, Math.min(bounds.max, val));
      } else {
        validCount++;
      }

      normalizedMetrics[metricName] = +val.toFixed(2);
      metricDetails[metricName] = {
        name: metricName,
        category: bounds.category,
        value: +val.toFixed(2),
        unit: bounds.unit,
        rawSource: sourceType,
        sampleTime: timestampEpochMs,
        qualityFlag,
      };
    }

    if (checkedCount === 0 && errors.length === 0) {
      warnings.push('Telemetry packet contains no numeric metrics');
    }

    const validityScore = checkedCount > 0 ? Math.round((validCount / checkedCount) * 100) : 80;
    const completenessScore = Math.min(100, Math.round((checkedCount / 5) * 100)); // Expected ~5 key metrics

    const telemetryId = rawPayload.telemetryId || `TEL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const location = {
      dataCenter: rawPayload.location?.dataCenter || 'dc-va-01',
      floor: rawPayload.location?.floor || 'Floor 1',
      room: rawPayload.location?.room || 'Data Hall A',
      row: rawPayload.location?.row || 'Row 1',
      rack: rawPayload.location?.rack || rawPayload.rackId || 'R-04',
      uPosition: rawPayload.location?.uPosition || rawPayload.uPosition || 12,
      zone: rawPayload.location?.zone || rawPayload.zone || 'Zone A',
    };

    const status = rawPayload.status || (
      (normalizedMetrics.cpu || normalizedMetrics.cpuUsage || 0) > 90 ||
      (normalizedMetrics.temperature || normalizedMetrics.cpuTemp || 0) > 80
        ? 'critical'
        : (normalizedMetrics.cpu || normalizedMetrics.cpuUsage || 0) > 75 ||
          (normalizedMetrics.temperature || normalizedMetrics.cpuTemp || 0) > 70
        ? 'warning'
        : 'healthy'
    );

    const sanitizedPacket: UniversalTelemetryPacket = {
      telemetryId,
      sourceId,
      sourceType,
      assetId,
      assetName,
      assetType,
      timestamp,
      timestampEpochMs,
      location,
      metrics: normalizedMetrics,
      metricDetails,
      status,
      quality: {
        overallScore: Math.round((validityScore * 0.5) + (completenessScore * 0.5)),
        completeness: completenessScore,
        freshness: Math.max(0, 100 - Math.min(100, Math.round((now - timestampEpochMs) / 1000))),
        validity: validityScore,
        continuity: 95,
        sourceReliability: 96,
        warnings,
      },
      enrichment: rawPayload.enrichment || {
        upstreamPowerId: 'UPS-01 / PDU-A',
        upstreamCoolingId: 'CRAC-02',
        parentRackId: location.rack,
        workloadCategory: 'Compute Node',
        criticalityTier: 'Tier-1-Mission-Critical',
      },
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedPacket,
    };
  }
}
