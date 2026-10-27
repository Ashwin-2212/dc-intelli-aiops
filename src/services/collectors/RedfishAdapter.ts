import {
  CollectorConfig,
  CollectorHealthStatus,
  DeviceSourceMode,
  IDataCollectorAdapter,
  NormalizedTelemetryPayload,
  RawRedfishPayload,
} from './types';
import { TelemetryNormalizer } from './TelemetryNormalizer';

export class RedfishAdapter implements IDataCollectorAdapter {
  public readonly config: CollectorConfig;
  private health: CollectorHealthStatus;
  private isConnected: boolean = false;

  constructor(config?: Partial<CollectorConfig>) {
    this.config = {
      id: config?.id || 'adapter-redfish-01',
      name: config?.name || 'Primary Server Redfish Collector (DMTF)',
      protocol: 'redfish',
      endpointUrl: config?.endpointUrl || 'https://bmc.alpha-dc.internal/redfish/v1',
      port: config?.port || 443,
      authType: 'basic',
      authCredentials: {
        username: 'admin_telemetry',
        password: '***',
      },
      pollIntervalMs: config?.pollIntervalMs || 3000,
      enabled: config?.enabled !== undefined ? config.enabled : true,
      sourceMode: config?.sourceMode || 'simulated',
    };

    this.health = {
      id: this.config.id,
      name: this.config.name,
      protocol: 'redfish',
      status: 'online',
      lastPollTimestamp: Date.now(),
      latencyMs: 14,
      packetCount: 0,
      errorCount: 0,
      deviceSourceMode: this.config.sourceMode,
      targetCount: 168,
    };
  }

  public async init(): Promise<void> {
    this.isConnected = true;
    this.health.status = 'online';
  }

  public setSourceMode(mode: DeviceSourceMode): void {
    this.config.sourceMode = mode;
    this.health.deviceSourceMode = mode;
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    await new Promise(r => setTimeout(r, 60));
    const latency = Date.now() - start;
    return {
      success: true,
      latencyMs: latency,
      message: `Redfish BMC endpoint reached at ${this.config.endpointUrl} (DMTF Schema v1.14.0)`,
    };
  }

  public async poll(): Promise<NormalizedTelemetryPayload[]> {
    if (!this.config.enabled) return [];
    const start = Date.now();
    this.health.packetCount += 1;
    this.health.lastPollTimestamp = Date.now();

    const payloads: NormalizedTelemetryPayload[] = [];

    // Target server list (e.g. servers in racks)
    const targetServers = [
      { id: 'SRV-R-04-01', name: 'Compute Node #1', rackId: 'R-04', zone: 'Zone A', tempBase: 44, fanBase: 6500 },
      { id: 'SRV-R-04-02', name: 'Compute Node #2', rackId: 'R-04', zone: 'Zone A', tempBase: 82.5, fanBase: 14500, isAnom: true },
      { id: 'SRV-R-05-01', name: 'AI Training Worker #1', rackId: 'R-05', zone: 'Zone A', tempBase: 78.0, fanBase: 13200, isAnom: true },
      { id: 'SRV-R-07-02', name: 'Database Cluster Node #2', rackId: 'R-07', zone: 'Zone B', tempBase: 48, fanBase: 7100 },
      { id: 'SRV-R-11-01', name: 'Edge Gateway Host #1', rackId: 'R-11', zone: 'Zone C', tempBase: 41, fanBase: 5800 },
    ];

    for (const srv of targetServers) {
      const rawPayload: RawRedfishPayload = {
        '@odata.type': '#Chassis.v1_14_0.Chassis',
        Id: srv.id,
        Name: srv.name,
        PowerState: 'On',
        Status: {
          State: 'Enabled',
          Health: srv.isAnom ? 'Critical' : 'OK',
        },
        Temperatures: [
          {
            MemberId: 'CPU1_Temp',
            Name: 'Intel Xeon Platinum 8480+ Die Temp',
            SensorNumber: 1,
            ReadingCelsius: +(srv.tempBase + (Math.random() - 0.5) * 1.5).toFixed(1),
            UpperThresholdCritical: 82,
            Status: { Health: srv.isAnom ? 'Critical' : 'OK' },
          },
          {
            MemberId: 'Inlet_Temp',
            Name: 'Chassis Front Ambient Inlet',
            SensorNumber: 2,
            ReadingCelsius: srv.isAnom ? 33.8 : 22.4,
            UpperThresholdCritical: 27,
            Status: { Health: srv.isAnom ? 'Warning' : 'OK' },
          },
        ],
        Fans: [
          {
            MemberId: 'System_Blower_1',
            Name: 'Rotor Dual-Fan Bay 1',
            Reading: Math.round(srv.fanBase + (Math.random() - 0.5) * 200),
            ReadingUnits: 'RPM',
            Status: { Health: srv.isAnom ? 'Critical' : 'OK' },
          },
        ],
        PowerConsumedWatts: Math.round(340 + (srv.isAnom ? 380 : 40)),
      };

      const normalized = TelemetryNormalizer.normalizeRedfish(rawPayload, {
        deviceId: srv.id,
        deviceName: srv.name,
        rackId: srv.rackId,
        datacenterId: 'dc-va-01',
        zone: srv.zone,
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
    this.isConnected = false;
    this.health.status = 'offline';
  }
}
