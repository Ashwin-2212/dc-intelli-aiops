export type ProtocolType = 'redfish' | 'snmp' | 'modbus' | 'bacnet' | 'simulator';

export type DeviceSourceMode = 'real_hardware' | 'simulated';

export interface CollectorConfig {
  id: string;
  name: string;
  protocol: ProtocolType;
  endpointUrl: string;
  port?: number;
  authType: 'basic' | 'bearer' | 'snmp_v2c' | 'snmp_v3' | 'none';
  authCredentials?: {
    username?: string;
    password?: string;
    community?: string;
    securityLevel?: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv';
  };
  pollIntervalMs: number;
  enabled: boolean;
  sourceMode: DeviceSourceMode;
}

export interface CollectorHealthStatus {
  id: string;
  name: string;
  protocol: ProtocolType;
  status: 'online' | 'degraded' | 'offline' | 'error';
  lastPollTimestamp: number;
  latencyMs: number;
  packetCount: number;
  errorCount: number;
  lastErrorMessage?: string;
  deviceSourceMode: DeviceSourceMode;
  targetCount: number;
}

export interface RawRedfishPayload {
  '@odata.type': string;
  Id: string;
  Name: string;
  ChassisType?: string;
  PowerState?: 'On' | 'Off' | 'PoweringOn' | 'PoweringOff';
  Status: {
    State: 'Enabled' | 'Disabled' | 'StandbyOffline' | 'Quiesced';
    Health: 'OK' | 'Warning' | 'Critical';
    HealthRollup?: 'OK' | 'Warning' | 'Critical';
  };
  Temperatures?: Array<{
    MemberId: string;
    Name: string;
    SensorNumber: number;
    ReadingCelsius: number;
    UpperThresholdNonCritical?: number;
    UpperThresholdCritical?: number;
    UpperThresholdFatal?: number;
    Status: { Health: 'OK' | 'Warning' | 'Critical' };
  }>;
  Fans?: Array<{
    MemberId: string;
    Name: string;
    Reading: number;
    ReadingUnits: 'RPM' | 'Percent';
    UpperThresholdCritical?: number;
    Status: { Health: 'OK' | 'Warning' | 'Critical' };
  }>;
  PowerConsumedWatts?: number;
  PowerCapacityWatts?: number;
  ProcessorSummary?: {
    Count: number;
    Model: string;
    Status: { Health: 'OK' | 'Warning' | 'Critical' };
  };
  MemorySummary?: {
    TotalSystemMemoryGiB: number;
    Status: { Health: 'OK' | 'Warning' | 'Critical' };
  };
}

export interface RawSNMPPayload {
  agentIp: string;
  sysDescr: string;
  sysUpTime: number;
  oids: {
    // HOST-RESOURCES-MIB & UPS-MIB OIDs
    '1.3.6.1.2.1.25.3.3.1.2'?: number[]; // hrProcessorLoad (%)
    '1.3.6.1.2.1.25.2.3.1.6'?: number[]; // hrStorageUsed
    '1.3.6.1.2.1.25.2.3.1.5'?: number[]; // hrStorageSize
    '1.3.6.1.2.1.33.1.2.1.0'?: number;   // upsBatteryStatus (1=unknown, 2=normal, 3=low, 4=depleted)
    '1.3.6.1.2.1.33.1.2.3.0'?: number;   // upsEstimatedMinutesRemaining
    '1.3.6.1.2.1.33.1.2.4.0'?: number;   // upsEstimatedChargeRemaining (%)
    '1.3.6.1.2.1.33.1.2.7.0'?: number;   // upsBatteryTemperature (°C)
    '1.3.6.1.2.1.33.1.4.4.1.5'?: number[]; // upsOutputPercentLoad
    '1.3.6.1.4.1.318.1.1.12.2.3.1.1.2'?: number; // APC rPDUIdentModelNumber
    '1.3.6.1.4.1.318.1.1.12.2.3.1.1.4'?: number; // APC rPDUIdentSerialNumber
    '1.3.6.1.4.1.318.1.1.12.2.3.1.1.7'?: number; // APC rPDUAmperage (deci-amps)
  };
}

export interface RawModbusPayload {
  slaveAddress: number;
  registerMapType: 'CRAC_UNIT' | 'CHILLER_PLANT' | 'PDU_BREAKER';
  holdingRegisters: {
    supplyAirTempX10?: number;   // e.g. 185 = 18.5°C
    returnAirTempX10?: number;   // e.g. 262 = 26.2°C
    fanSpeedPercent?: number;    // 0-100%
    chilledWaterFlowLpm?: number;// liters/min
    compressorStatus?: number;   // 0=off, 1=stage1, 2=stage2, 3=alarm
    coolingPowerKwX10?: number;  // e.g. 425 = 42.5 kW
    copEfficiencyX10?: number;   // e.g. 38 = 3.8 COP
    dewPointTempX10?: number;
    filterDifferentialPressurePa?: number;
    alarmBits?: number;
  };
}

export interface NormalizedTelemetryMetric {
  metricName: string;
  value: number;
  unit: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD' | 'SIMULATED';
  rawSource: ProtocolType;
  sampleTime: number;
}

export interface NormalizedTelemetryPayload {
  deviceId: string;
  deviceName: string;
  deviceType: 'server' | 'rack' | 'cooling' | 'ups' | 'pdu' | 'sensor';
  rackId?: string;
  datacenterId: string;
  zone: string;
  protocol: ProtocolType;
  sourceMode: DeviceSourceMode;
  timestamp: number;
  metrics: {
    cpuUsagePercent?: NormalizedTelemetryMetric;
    cpuTempCelsius?: NormalizedTelemetryMetric;
    ramUsagePercent?: NormalizedTelemetryMetric;
    diskUsagePercent?: NormalizedTelemetryMetric;
    diskIops?: NormalizedTelemetryMetric;
    networkInMbps?: NormalizedTelemetryMetric;
    networkOutMbps?: NormalizedTelemetryMetric;
    networkLatencyMs?: NormalizedTelemetryMetric;
    powerDrawWatts?: NormalizedTelemetryMetric;
    fanSpeedRpm?: NormalizedTelemetryMetric;
    fanSpeedPercent?: NormalizedTelemetryMetric;
    supplyTempCelsius?: NormalizedTelemetryMetric;
    returnTempCelsius?: NormalizedTelemetryMetric;
    ambientTempCelsius?: NormalizedTelemetryMetric;
    humidityPercent?: NormalizedTelemetryMetric;
    batteryHealthPercent?: NormalizedTelemetryMetric;
    batteryRuntimeMinutes?: NormalizedTelemetryMetric;
    pue?: NormalizedTelemetryMetric;
    [key: string]: NormalizedTelemetryMetric | undefined;
  };
  status: 'healthy' | 'warning' | 'critical' | 'degraded' | 'offline';
  healthScore: number;
}

export interface IDataCollectorAdapter {
  readonly config: CollectorConfig;
  init(): Promise<void>;
  poll(): Promise<NormalizedTelemetryPayload[]>;
  testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
  setSourceMode(mode: DeviceSourceMode): void;
  getHealthStatus(): CollectorHealthStatus;
  stop(): void;
}
