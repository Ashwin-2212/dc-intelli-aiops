import {
  TelemetryPlatformMetrics,
  TelemetrySourceRegistration,
} from '../../types/telemetryIntelligence';

export class TelemetryPlatformObservability {
  private static instance: TelemetryPlatformObservability;
  private totalIngested: number = 248900;
  private droppedCount: number = 42;
  private rejectedCount: number = 18;
  private sources: Map<string, TelemetrySourceRegistration> = new Map();
  private auditLogs: TelemetryPlatformMetrics['securityAuditLogs'] = [];

  private constructor() {
    this.seedSourcesAndAudit();
  }

  public static getInstance(): TelemetryPlatformObservability {
    if (!TelemetryPlatformObservability.instance) {
      TelemetryPlatformObservability.instance = new TelemetryPlatformObservability();
    }
    return TelemetryPlatformObservability.instance;
  }

  private seedSourcesAndAudit() {
    // Seed multi-source registrations
    const now = Date.now();

    this.sources.set('SRC-WIN-AGENT-01', {
      sourceId: 'SRC-WIN-AGENT-01',
      sourceName: 'Windows Performance Counter Agent (SRV-R-04-02)',
      sourceType: 'windows_agent',
      assetId: 'SRV-R-04-02',
      assetName: 'Server SRV-R-04-02 (AI Node)',
      assetType: 'server',
      endpointUrl: 'https://agent.alpha-dc.internal:8443/telemetry',
      protocol: 'HTTPS' as any,
      status: 'ONLINE',
      lastSeenEpochMs: now - 1200,
      lastSeenFormatted: '1.2s ago',
      samplingIntervalSec: 2,
      qualityScore: 98,
      sensorTrustScore: 96,
      totalPacketsReceived: 42800,
      totalPacketsDropped: 2,
      totalValidationErrors: 0,
      hardwareSpecs: {
        ipAddress: '10.240.4.12',
        firmwareVersion: 'WinAgent-v2.4.1',
        authMethod: 'API_KEY',
      },
    });

    this.sources.set('SRC-REDFISH-01', {
      sourceId: 'SRC-REDFISH-01',
      sourceName: 'Redfish DMTF BMC Telemetry Collector',
      sourceType: 'redfish_bmc',
      assetId: 'SRV-R-04-02',
      assetName: 'Dell iDRAC9 / HPE iLO5 Fleet',
      assetType: 'server',
      endpointUrl: 'https://bmc.alpha-dc.internal/redfish/v1',
      protocol: 'REST',
      status: 'ONLINE',
      lastSeenEpochMs: now - 2000,
      lastSeenFormatted: '2.0s ago',
      samplingIntervalSec: 2,
      qualityScore: 96,
      sensorTrustScore: 98,
      totalPacketsReceived: 56100,
      totalPacketsDropped: 0,
      totalValidationErrors: 0,
      hardwareSpecs: {
        ipAddress: '10.240.0.40',
        firmwareVersion: 'Redfish-Schema-2023.3',
        authMethod: 'OAUTH2',
      },
    });

    this.sources.set('SRC-ESP32-MQTT-01', {
      sourceId: 'SRC-ESP32-MQTT-01',
      sourceName: 'IoT Environmental Micro-Sensor Array (ESP32-S3)',
      sourceType: 'iot_esp32_mqtt',
      assetId: 'R-04',
      assetName: 'Rack R-04 Cold/Hot Aisle Probe Array',
      assetType: 'sensor',
      endpointUrl: 'mqtt://broker.alpha-dc.internal:1883/dc1/thermal',
      protocol: 'MQTT',
      status: 'ONLINE',
      lastSeenEpochMs: now - 3500,
      lastSeenFormatted: '3.5s ago',
      samplingIntervalSec: 5,
      qualityScore: 84,
      sensorTrustScore: 82,
      totalPacketsReceived: 18400,
      totalPacketsDropped: 8,
      totalValidationErrors: 1,
      hardwareSpecs: {
        ipAddress: '10.240.8.22',
        firmwareVersion: 'ESP32-SensMesh-v1.8',
        authMethod: 'MTLS',
      },
    });

    this.sources.set('SRC-MODBUS-HVAC-01', {
      sourceId: 'SRC-MODBUS-HVAC-01',
      sourceName: 'HVAC CRAC Unit Modbus/BACnet Gateway',
      sourceType: 'modbus_bacnet',
      assetId: 'CRAC-02',
      assetName: 'CRAC Unit 02 (In-Row Chiller)',
      assetType: 'cooling',
      endpointUrl: 'tcp://10.240.5.10:502',
      protocol: 'Modbus',
      status: 'ONLINE',
      lastSeenEpochMs: now - 1800,
      lastSeenFormatted: '1.8s ago',
      samplingIntervalSec: 2,
      qualityScore: 94,
      sensorTrustScore: 95,
      totalPacketsReceived: 62000,
      totalPacketsDropped: 1,
      totalValidationErrors: 0,
      hardwareSpecs: {
        ipAddress: '10.240.5.10',
        firmwareVersion: 'Schneider-Modbus-v4.1',
        authMethod: 'NONE',
      },
    });

    this.sources.set('SRC-CSV-HISTORICAL-01', {
      sourceId: 'SRC-CSV-HISTORICAL-01',
      sourceName: 'Quarterly Capacity & Thermal Baseline Dataset (CSV/JSON)',
      sourceType: 'csv_import',
      assetId: 'dc-va-01',
      assetName: 'Historical Benchmark Dataset 2026-Q3',
      assetType: 'facility',
      endpointUrl: '/api/telemetry/import-csv',
      protocol: 'CSV',
      status: 'ONLINE',
      lastSeenEpochMs: now - 360000,
      lastSeenFormatted: '6m ago',
      samplingIntervalSec: 60,
      qualityScore: 100,
      sensorTrustScore: 100,
      totalPacketsReceived: 120000,
      totalPacketsDropped: 0,
      totalValidationErrors: 0,
    });

    this.auditLogs = [
      {
        id: 'AUD-001',
        timestamp: new Date(now - 12000).toISOString(),
        sourceIp: '10.240.4.12',
        agentId: 'SRC-WIN-AGENT-01',
        action: 'INGEST_ACCEPTED',
        reason: 'Valid HMAC signature and Universal Telemetry Schema conformant.',
        payloadSnippet: '{"assetId": "SRV-R-04-02", "metrics": {"cpu": 94.2, "temp": 82.5}}',
      },
      {
        id: 'AUD-002',
        timestamp: new Date(now - 45000).toISOString(),
        sourceIp: '192.168.1.99',
        agentId: 'UNKNOWN_PROBE',
        action: 'AUTH_FAILED',
        reason: 'Missing Authorization Bearer token header on /api/telemetry.',
        payloadSnippet: '{"deviceId": "rogue-sensor-01"}',
      },
      {
        id: 'AUD-003',
        timestamp: new Date(now - 180000).toISOString(),
        sourceIp: '10.240.8.22',
        agentId: 'SRC-ESP32-MQTT-01',
        action: 'SANITY_BOUNDS_TRIP',
        reason: 'Temperature metric reported impossible reading (420°C). Sanitized to max physical ceiling.',
        payloadSnippet: '{"temperature": 420.0, "source": "esp32_pin_a0"}',
      },
    ];
  }

  public recordIngest(accepted: boolean, latencyMs: number = 18, securityAction?: any) {
    this.totalIngested++;
    if (!accepted) this.rejectedCount++;
    if (securityAction) {
      this.auditLogs = [securityAction, ...this.auditLogs.slice(0, 24)];
    }
  }

  public getPlatformMetrics(): TelemetryPlatformMetrics {
    const activeSources = Array.from(this.sources.values()).filter(s => s.status === 'ONLINE').length;
    const offlineSources = Array.from(this.sources.values()).filter(s => s.status === 'OFFLINE').length;

    return {
      ingestionRateEventsPerSec: 1842,
      totalEventsProcessed24h: this.totalIngested,
      droppedEventsCount: this.droppedCount,
      rejectedEventsCount: this.rejectedCount,
      dropRatePercent: 0.02,
      gatewayLatencyMs: 18,
      aiProcessingLatencyMs: 42,
      dbWriteLatencyMs: 6,
      activeQueueSize: 12,
      connectedAgentsCount: activeSources,
      offlineAgentsCount: offlineSources,
      telemetryIntelligenceScore: {
        totalScore: 91,
        coverage: 96,
        freshness: 98,
        quality: 92,
        correlation: 88,
        prediction: 85,
        explainability: 94,
      },
      securityAuditLogs: this.auditLogs,
    };
  }

  public getSources(): TelemetrySourceRegistration[] {
    return Array.from(this.sources.values());
  }

  public registerOrUpdateSource(source: TelemetrySourceRegistration) {
    this.sources.set(source.sourceId, source);
  }
}
