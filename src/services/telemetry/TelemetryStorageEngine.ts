import { UniversalTelemetryPacket } from '../../types/telemetryIntelligence';

export interface TimeSeriesPoint {
  timestamp: string;
  timestampEpochMs: number;
  cpu: number;
  memory: number;
  temperature: number;
  power: number;
  fan: number;
  network: number;
  pue?: number;
}

export interface AggregatedRollup {
  periodStart: string;
  count: number;
  metrics: Record<
    string,
    {
      avg: number;
      min: number;
      max: number;
      p95: number;
    }
  >;
}

export class TelemetryStorageEngine {
  private static instance: TelemetryStorageEngine;
  
  // Tier 1: Raw High-Frequency Ring Buffer (e.g. last 120 points per asset)
  private rawBuffers: Map<string, UniversalTelemetryPacket[]> = new Map();

  // Tier 2: 5-Minute Aggregated Rollups
  private rollups5m: Map<string, AggregatedRollup[]> = new Map();

  // Tier 3: 1-Hour Aggregated Rollups
  private rollups1h: Map<string, AggregatedRollup[]> = new Map();

  // Tier 4: Daily Aggregations (30-day history)
  private rollupsDaily: Map<string, AggregatedRollup[]> = new Map();

  private constructor() {
    this.seedHistoricalStorage();
  }

  public static getInstance(): TelemetryStorageEngine {
    if (!TelemetryStorageEngine.instance) {
      TelemetryStorageEngine.instance = new TelemetryStorageEngine();
    }
    return TelemetryStorageEngine.instance;
  }

  private seedHistoricalStorage() {
    const assets = ['SRV-R-04-02', 'CRAC-02', 'UPS-01', 'UPS-03', 'SRV-R-01-04'];
    const now = Date.now();

    for (const assetId of assets) {
      const isServer = assetId.startsWith('SRV');
      const isCrac = assetId.startsWith('CRAC');
      const isUps = assetId.startsWith('UPS');

      const rawList: UniversalTelemetryPacket[] = [];

      // Generate last 60 raw samples
      for (let i = 59; i >= 0; i--) {
        const t = now - i * 2000;
        const baseCpu = isServer ? (assetId === 'SRV-R-04-02' ? 82 + Math.random() * 12 : 45 + Math.random() * 8) : 0;
        const baseTemp = isServer ? (assetId === 'SRV-R-04-02' ? 76 + Math.random() * 6 : 42 + Math.random() * 3) : isCrac ? 28 + Math.random() * 4 : 25;
        const basePower = isServer ? 350 + baseCpu * 1.5 : isCrac ? 45000 + Math.random() * 5000 : 320000;

        rawList.push({
          telemetryId: `TEL-SEED-${t}`,
          sourceId: assetId,
          sourceType: 'telemetry_simulator',
          assetId,
          assetName: assetId,
          assetType: isServer ? 'server' : isCrac ? 'cooling' : 'ups',
          timestamp: new Date(t).toISOString(),
          timestampEpochMs: t,
          location: { dataCenter: 'dc-va-01', rack: 'R-04', zone: 'Zone A' },
          metrics: {
            cpu: +baseCpu.toFixed(1),
            temperature: +baseTemp.toFixed(1),
            power: +basePower.toFixed(1),
            network: +(4.5 + Math.random() * 2).toFixed(1),
            fan: Math.round(6000 + baseTemp * 80),
          },
          status: baseTemp > 75 || baseCpu > 90 ? 'critical' : 'healthy',
          quality: {
            overallScore: 96,
            completeness: 100,
            freshness: 100,
            validity: 100,
            continuity: 98,
            sourceReliability: 96,
          },
        });
      }

      this.rawBuffers.set(assetId, rawList);
    }
  }

  /**
   * Ingests packet into tiered storage hierarchy
   */
  public storePacket(packet: UniversalTelemetryPacket) {
    const list = this.rawBuffers.get(packet.assetId) || [];
    list.push(packet);
    if (list.length > 120) list.shift(); // Keep latest 120 raw points in memory
    this.rawBuffers.set(packet.assetId, list);
  }

  /**
   * Retrieves live time-series points formatted for charts
   */
  public getTimeSeries(
    assetId: string,
    timeWindow: '1m' | '5m' | '15m' | '1h' | '24h' | '7d' | '30d' = '5m'
  ): TimeSeriesPoint[] {
    const raw = this.rawBuffers.get(assetId) || [];

    let count = 30;
    if (timeWindow === '1m') count = 15;
    else if (timeWindow === '5m') count = 30;
    else if (timeWindow === '15m') count = 45;
    else if (timeWindow === '1h') count = 60;
    else count = 60;

    const slice = raw.slice(-count);

    return slice.map((p) => {
      const d = new Date(p.timestampEpochMs);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      return {
        timestamp: timeStr,
        timestampEpochMs: p.timestampEpochMs,
        cpu: p.metrics.cpu || p.metrics.cpuUsage || 0,
        memory: p.metrics.memory || p.metrics.ramUsage || 50,
        temperature: p.metrics.temperature || p.metrics.cpuTemp || p.metrics.supplyTempC || 24,
        power: p.metrics.power || p.metrics.powerDrawWatts || p.metrics.currentPowerKw || 350,
        fan: p.metrics.fan || p.metrics.fanSpeedRpm || p.metrics.fanSpeedPercent || 6200,
        network: p.metrics.network || p.metrics.networkInMbps || 150,
      };
    });
  }

  /**
   * Safe Explorer query filter method
   */
  public queryTelemetry(filters: {
    assetId?: string;
    assetType?: string;
    metricThreshold?: { metric: string; operator: '>' | '<' | '='; value: number };
    status?: string;
    limit?: number;
  }): UniversalTelemetryPacket[] {
    let results: UniversalTelemetryPacket[] = [];

    for (const packets of this.rawBuffers.values()) {
      results.push(...packets);
    }

    if (filters.assetId) {
      results = results.filter((p) => p.assetId.toLowerCase().includes(filters.assetId!.toLowerCase()));
    }

    if (filters.assetType) {
      results = results.filter((p) => p.assetType === filters.assetType);
    }

    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }

    if (filters.metricThreshold) {
      const { metric, operator, value } = filters.metricThreshold;
      results = results.filter((p) => {
        const val = p.metrics[metric];
        if (val === undefined) return false;
        if (operator === '>') return val > value;
        if (operator === '<') return val < value;
        return val === value;
      });
    }

    results.sort((a, b) => b.timestampEpochMs - a.timestampEpochMs);
    return results.slice(0, filters.limit || 50);
  }
}
