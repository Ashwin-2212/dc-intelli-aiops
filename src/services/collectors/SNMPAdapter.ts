import {
  CollectorConfig,
  CollectorHealthStatus,
  DeviceSourceMode,
  IDataCollectorAdapter,
  NormalizedTelemetryPayload,
  RawSNMPPayload,
} from './types';
import { TelemetryNormalizer } from './TelemetryNormalizer';

export class SNMPAdapter implements IDataCollectorAdapter {
  public readonly config: CollectorConfig;
  private health: CollectorHealthStatus;

  constructor(config?: Partial<CollectorConfig>) {
    this.config = {
      id: config?.id || 'adapter-snmp-01',
      name: config?.name || 'Critical Power UPS & PDU SNMP Collector',
      protocol: 'snmp',
      endpointUrl: config?.endpointUrl || 'udp://10.240.0.50',
      port: config?.port || 161,
      authType: 'snmp_v3',
      authCredentials: {
        username: 'snmp_telemetry_usr',
        securityLevel: 'authPriv',
      },
      pollIntervalMs: config?.pollIntervalMs || 2500,
      enabled: config?.enabled !== undefined ? config.enabled : true,
      sourceMode: config?.sourceMode || 'simulated',
    };

    this.health = {
      id: this.config.id,
      name: this.config.name,
      protocol: 'snmp',
      status: 'online',
      lastPollTimestamp: Date.now(),
      latencyMs: 8,
      packetCount: 0,
      errorCount: 0,
      deviceSourceMode: this.config.sourceMode,
      targetCount: 12,
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
    await new Promise(r => setTimeout(r, 45));
    return {
      success: true,
      latencyMs: Date.now() - start,
      message: `SNMP v3 Engine ID responded at ${this.config.endpointUrl}:${this.config.port} (RFC 1628 UPS-MIB)`,
    };
  }

  public async poll(): Promise<NormalizedTelemetryPayload[]> {
    if (!this.config.enabled) return [];
    const start = Date.now();
    this.health.packetCount += 1;
    this.health.lastPollTimestamp = Date.now();

    const payloads: NormalizedTelemetryPayload[] = [];

    const upsTargets = [
      { id: 'UPS-01', name: 'Primary Inverter Bus A', zone: 'Zone A', runtime: 42, charge: 100, temp: 24.2, load: 61 },
      { id: 'UPS-02', name: 'Primary Inverter Bus B', zone: 'Zone B', runtime: 34, charge: 99, temp: 26.5, load: 70 },
      { id: 'UPS-03', name: 'Secondary High-Density UPS', zone: 'Zone C', runtime: 18, charge: 96, temp: 31.8, load: 77, isDegraded: true },
    ];

    for (const ups of upsTargets) {
      const rawPayload: RawSNMPPayload = {
        agentIp: `10.240.0.${ups.id.replace('UPS-', '')}`,
        sysDescr: `Eaton 93PM 400kVA High Efficiency UPS Firmware v3.18`,
        sysUpTime: 18923000,
        oids: {
          '1.3.6.1.2.1.33.1.2.1.0': ups.isDegraded ? 3 : 2, // warning vs normal
          '1.3.6.1.2.1.33.1.2.3.0': ups.runtime,
          '1.3.6.1.2.1.33.1.2.4.0': ups.charge,
          '1.3.6.1.2.1.33.1.2.7.0': ups.temp,
          '1.3.6.1.2.1.33.1.4.4.1.5': [ups.load],
        },
      };

      const normalized = TelemetryNormalizer.normalizeSNMP(rawPayload, {
        deviceId: ups.id,
        deviceName: ups.name,
        deviceType: 'ups',
        datacenterId: 'dc-va-01',
        zone: ups.zone,
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
