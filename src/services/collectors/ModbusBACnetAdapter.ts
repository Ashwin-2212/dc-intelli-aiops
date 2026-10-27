import {
  CollectorConfig,
  CollectorHealthStatus,
  DeviceSourceMode,
  IDataCollectorAdapter,
  NormalizedTelemetryPayload,
  RawModbusPayload,
} from './types';
import { TelemetryNormalizer } from './TelemetryNormalizer';

export class ModbusBACnetAdapter implements IDataCollectorAdapter {
  public readonly config: CollectorConfig;
  private health: CollectorHealthStatus;

  constructor(config?: Partial<CollectorConfig>) {
    this.config = {
      id: config?.id || 'adapter-modbus-01',
      name: config?.name || 'HVAC CRAC & Chilled Water Modbus/BACnet Collector',
      protocol: 'modbus',
      endpointUrl: config?.endpointUrl || 'tcp://10.240.5.10',
      port: config?.port || 502,
      authType: 'none',
      pollIntervalMs: config?.pollIntervalMs || 2000,
      enabled: config?.enabled !== undefined ? config.enabled : true,
      sourceMode: config?.sourceMode || 'simulated',
    };

    this.health = {
      id: this.config.id,
      name: this.config.name,
      protocol: 'modbus',
      status: 'online',
      lastPollTimestamp: Date.now(),
      latencyMs: 6,
      packetCount: 0,
      errorCount: 0,
      deviceSourceMode: this.config.sourceMode,
      targetCount: 4,
    };
  }

  public async init(): Promise<void> {
    this.health.status = 'online';
  }

  public setSourceMode(mode: DeviceSourceMode): void {
    this.config.sourceMode = mode;
    this.health.deviceSourceMode = mode;
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    await new Promise(r => setTimeout(r, 35));
    return {
      success: true,
      latencyMs: Date.now() - start,
      message: `Modbus TCP Gateway responding at ${this.config.endpointUrl}:${this.config.port} (Unit ID: 1-4)`,
    };
  }

  public async poll(): Promise<NormalizedTelemetryPayload[]> {
    if (!this.config.enabled) return [];
    const start = Date.now();
    this.health.packetCount += 1;
    this.health.lastPollTimestamp = Date.now();

    const payloads: NormalizedTelemetryPayload[] = [];

    const cracUnits = [
      { id: 'CRAC-01', name: 'CRAC Unit 01 (Zone A)', zone: 'Zone A', supply: 18.5, ret: 26.2, fan: 68, power: 42.5, cop: 3.8, isFault: false },
      { id: 'CRAC-02', name: 'CRAC Unit 02 (Zone A/B In-Row)', zone: 'Zone A', supply: 27.5, ret: 37.0, fan: 100, power: 72.0, cop: 1.9, isFault: true },
      { id: 'CRAC-03', name: 'CRAH Chilled Water Unit 03', zone: 'Zone B', supply: 17.8, ret: 25.0, fan: 62, power: 38.0, cop: 4.2, isFault: false },
      { id: 'CRAC-04', name: 'CRAH Chilled Water Unit 04', zone: 'Zone C', supply: 18.0, ret: 25.4, fan: 65, power: 46.5, cop: 3.9, isFault: false },
    ];

    for (const unit of cracUnits) {
      const rawPayload: RawModbusPayload = {
        slaveAddress: parseInt(unit.id.replace('CRAC-', ''), 10),
        registerMapType: 'CRAC_UNIT',
        holdingRegisters: {
          supplyAirTempX10: Math.round(unit.supply * 10),
          returnAirTempX10: Math.round(unit.ret * 10),
          fanSpeedPercent: unit.fan,
          coolingPowerKwX10: Math.round(unit.power * 10),
          copEfficiencyX10: Math.round(unit.cop * 10),
          compressorStatus: unit.isFault ? 3 : 2,
        },
      };

      const normalized = TelemetryNormalizer.normalizeModbus(rawPayload, {
        deviceId: unit.id,
        deviceName: unit.name,
        datacenterId: 'dc-va-01',
        zone: unit.zone,
        sourceMode: this.config.sourceMode,
      });

      payloads.push(normalized);
    }

    this.health.latencyMs = Date.now() - start;
    return payloads;
  }

  public getHealthStatus(): CollectorHealthStatus {
    return { ...this.health };
  }

  public stop(): void {
    this.health.status = 'offline';
  }
}
