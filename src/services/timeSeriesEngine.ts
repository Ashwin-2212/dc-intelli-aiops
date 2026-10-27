export interface TimeSeriesSample {
  timestamp: number;
  value: number;
}

export interface MetricRollingStats {
  metricName: string;
  count: number;
  current: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  zScore: number;
  rateOfChangePerMin: number;
  baselineMean: number;
  isAnomalyZScore: boolean;
}

export class TimeSeriesEngine {
  private static instance: TimeSeriesEngine;
  private buffers: Map<string, TimeSeriesSample[]> = new Map();
  private maxBufferSize: number = 60; // 60 samples (e.g. 2-5 minutes of high-resolution telemetry)

  private constructor() {}

  public static getInstance(): TimeSeriesEngine {
    if (!TimeSeriesEngine.instance) {
      TimeSeriesEngine.instance = new TimeSeriesEngine();
    }
    return TimeSeriesEngine.instance;
  }

  private getKey(deviceId: string, metricName: string): string {
    return `${deviceId}:${metricName}`;
  }

  public ingest(deviceId: string, metricName: string, value: number, timestamp: number = Date.now()): void {
    const key = this.getKey(deviceId, metricName);
    let buf = this.buffers.get(key);
    if (!buf) {
      buf = [];
      this.buffers.set(key, buf);
    }

    buf.push({ timestamp, value });
    if (buf.length > this.maxBufferSize) {
      buf.shift();
    }
  }

  public getSamples(deviceId: string, metricName: string): TimeSeriesSample[] {
    const key = this.getKey(deviceId, metricName);
    return this.buffers.get(key) || [];
  }

  public computeStats(deviceId: string, metricName: string, baselineMeanOverride?: number): MetricRollingStats | null {
    const samples = this.getSamples(deviceId, metricName);
    if (samples.length === 0) return null;

    const values = samples.map(s => s.value);
    const count = values.length;
    const current = values[values.length - 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = +(sum / count).toFixed(2);

    // Baseline calculation (first 30% of buffer or override)
    const baselineSlice = values.slice(0, Math.max(3, Math.floor(count * 0.3)));
    const baselineMean = baselineMeanOverride ?? +(baselineSlice.reduce((a, b) => a + b, 0) / baselineSlice.length).toFixed(2);

    // Standard deviation
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / Math.max(1, count - 1);
    const stdDev = +Math.sqrt(avgSquareDiff).toFixed(2);

    // Z-Score relative to baseline
    const effectiveStdDev = stdDev > 0.01 ? stdDev : 1.0;
    const zScore = +((current - baselineMean) / effectiveStdDev).toFixed(2);

    // Rate of change per minute
    let rateOfChangePerMin = 0;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const deltaMinutes = (last.timestamp - first.timestamp) / 60000;
      if (deltaMinutes > 0.05) {
        rateOfChangePerMin = +((last.value - first.value) / deltaMinutes).toFixed(2);
      }
    }

    return {
      metricName,
      count,
      current,
      mean,
      min,
      max,
      stdDev,
      zScore,
      rateOfChangePerMin,
      baselineMean,
      isAnomalyZScore: Math.abs(zScore) >= 2.5,
    };
  }
}
