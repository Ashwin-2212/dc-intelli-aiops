import {
  NormalizedTelemetryMetric,
  NormalizedTelemetryPayload,
  ProtocolType,
  DeviceSourceMode,
  RawRedfishPayload,
  RawSNMPPayload,
  RawModbusPayload,
} from './types';

export class TelemetryNormalizer {
  public static createMetric(
    metricName: string,
    value: number,
    unit: string,
    protocol: ProtocolType,
    sourceMode: DeviceSourceMode,
    sampleTime: number = Date.now(),
    qualityOverride?: 'GOOD' | 'UNCERTAIN' | 'BAD' | 'SIMULATED'
  ): NormalizedTelemetryMetric {
    const quality = qualityOverride || (sourceMode === 'simulated' ? 'SIMULATED' : 'GOOD');
    return {
      metricName,
      value: +value.toFixed(2),
      unit,
      quality,
      rawSource: protocol,
      sampleTime,
    };
  }

  /**
   * Normalizes Redfish DMTF schema (Chassis, Thermal, Power, Systems)
   */
  public static normalizeRedfish(
    raw: RawRedfishPayload,
    metadata: {
      deviceId: string;
      deviceName: string;
      rackId: string;
      datacenterId: string;
      zone: string;
      sourceMode: DeviceSourceMode;
    }
  ): NormalizedTelemetryPayload {
    const now = Date.now();
    const sourceMode = metadata.sourceMode;

    // Extract temperatures (e.g. CPU die / inlet sensors)
    let maxCpuTemp = 42;
    if (raw.Temperatures && raw.Temperatures.length > 0) {
      const cpuSensor = raw.Temperatures.find(t => t.Name?.toLowerCase().includes('cpu') || t.Name?.toLowerCase().includes('die'));
      maxCpuTemp = cpuSensor ? cpuSensor.ReadingCelsius : Math.max(...raw.Temperatures.map(t => t.ReadingCelsius));
    }

    // Extract Fans
    let avgFanRpm = 6200;
    if (raw.Fans && raw.Fans.length > 0) {
      const validFans = raw.Fans.filter(f => f.Reading > 0);
      if (validFans.length > 0) {
        avgFanRpm = validFans.reduce((acc, f) => acc + (f.ReadingUnits === 'Percent' ? f.Reading * 120 : f.Reading), 0) / validFans.length;
      }
    }

    const powerWatts = raw.PowerConsumedWatts || (maxCpuTemp > 75 ? 460 : 340);

    const metrics: NormalizedTelemetryPayload['metrics'] = {
      cpuTempCelsius: this.createMetric('CPU Temperature', maxCpuTemp, '°C', 'redfish', sourceMode, now),
      powerDrawWatts: this.createMetric('Server Power Draw', powerWatts, 'W', 'redfish', sourceMode, now),
      fanSpeedRpm: this.createMetric('Blower Fan Speed', avgFanRpm, 'RPM', 'redfish', sourceMode, now),
    };

    let status: NormalizedTelemetryPayload['status'] = 'healthy';
    let healthScore = 95;

    if (raw.Status?.Health === 'Critical' || maxCpuTemp > 80) {
      status = 'critical';
      healthScore = Math.max(25, 100 - Math.round(maxCpuTemp * 0.8));
    } else if (raw.Status?.Health === 'Warning' || maxCpuTemp > 70) {
      status = 'warning';
      healthScore = Math.max(60, 100 - Math.round(maxCpuTemp * 0.4));
    }

    return {
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
      deviceType: 'server',
      rackId: metadata.rackId,
      datacenterId: metadata.datacenterId,
      zone: metadata.zone,
      protocol: 'redfish',
      sourceMode,
      timestamp: now,
      metrics,
      status,
      healthScore,
    };
  }

  /**
   * Normalizes SNMP OID values (Host Resources, UPS-MIB, PDU-MIB)
   */
  public static normalizeSNMP(
    raw: RawSNMPPayload,
    metadata: {
      deviceId: string;
      deviceName: string;
      deviceType: 'ups' | 'pdu' | 'server';
      rackId?: string;
      datacenterId: string;
      zone: string;
      sourceMode: DeviceSourceMode;
    }
  ): NormalizedTelemetryPayload {
    const now = Date.now();
    const sourceMode = metadata.sourceMode;
    const oids = raw.oids;
    const metrics: NormalizedTelemetryPayload['metrics'] = {};

    let status: NormalizedTelemetryPayload['status'] = 'healthy';
    let healthScore = 90;

    if (metadata.deviceType === 'ups') {
      const minutesRemaining = oids['1.3.6.1.2.1.33.1.2.3.0'] || 35;
      const chargePercent = oids['1.3.6.1.2.1.33.1.2.4.0'] || 98;
      const batteryTemp = oids['1.3.6.1.2.1.33.1.2.7.0'] || 25;
      const loadPercent = oids['1.3.6.1.2.1.33.1.4.4.1.5']?.[0] || 65;

      metrics.batteryRuntimeMinutes = this.createMetric('Battery Reserve Runtime', minutesRemaining, 'min', 'snmp', sourceMode, now);
      metrics.batteryHealthPercent = this.createMetric('Battery Charge Level', chargePercent, '%', 'snmp', sourceMode, now);
      metrics.ambientTempCelsius = this.createMetric('UPS Internal Temp', batteryTemp, '°C', 'snmp', sourceMode, now);
      metrics.powerDrawWatts = this.createMetric('UPS Output Load', loadPercent * 3000, 'W', 'snmp', sourceMode, now);

      if (minutesRemaining < 10 || batteryTemp > 34) {
        status = 'critical';
        healthScore = 45;
      } else if (minutesRemaining < 20 || batteryTemp > 28) {
        status = 'warning';
        healthScore = 70;
      }
    } else {
      // Host Resources server metrics
      const cpuLoads = oids['1.3.6.1.2.1.25.3.3.1.2'] || [45, 50];
      const avgCpu = cpuLoads.reduce((a, b) => a + b, 0) / cpuLoads.length;
      metrics.cpuUsagePercent = this.createMetric('CPU Utilization', avgCpu, '%', 'snmp', sourceMode, now);

      if (avgCpu > 90) {
        status = 'critical';
        healthScore = 55;
      } else if (avgCpu > 75) {
        status = 'warning';
        healthScore = 78;
      }
    }

    return {
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
      deviceType: metadata.deviceType,
      rackId: metadata.rackId,
      datacenterId: metadata.datacenterId,
      zone: metadata.zone,
      protocol: 'snmp',
      sourceMode,
      timestamp: now,
      metrics,
      status,
      healthScore,
    };
  }

  /**
   * Normalizes Modbus / BACnet holding registers for HVAC / CRAC units
   */
  public static normalizeModbus(
    raw: RawModbusPayload,
    metadata: {
      deviceId: string;
      deviceName: string;
      datacenterId: string;
      zone: string;
      sourceMode: DeviceSourceMode;
    }
  ): NormalizedTelemetryPayload {
    const now = Date.now();
    const sourceMode = metadata.sourceMode;
    const reg = raw.holdingRegisters;

    const supplyTemp = reg.supplyAirTempX10 ? reg.supplyAirTempX10 / 10 : 18.5;
    const returnTemp = reg.returnAirTempX10 ? reg.returnAirTempX10 / 10 : 26.2;
    const fanSpeed = reg.fanSpeedPercent || 65;
    const powerKw = reg.coolingPowerKwX10 ? reg.coolingPowerKwX10 / 10 : 42.0;

    const metrics: NormalizedTelemetryPayload['metrics'] = {
      supplyTempCelsius: this.createMetric('Supply Air Temp', supplyTemp, '°C', 'modbus', sourceMode, now),
      returnTempCelsius: this.createMetric('Return Air Temp', returnTemp, '°C', 'modbus', sourceMode, now),
      fanSpeedPercent: this.createMetric('CRAC Fan Speed', fanSpeed, '%', 'modbus', sourceMode, now),
      powerDrawWatts: this.createMetric('Cooling Compressor Power', powerKw * 1000, 'W', 'modbus', sourceMode, now),
    };

    let status: NormalizedTelemetryPayload['status'] = 'healthy';
    let healthScore = 92;

    if (returnTemp > 34 || supplyTemp > 25) {
      status = 'critical';
      healthScore = 38;
    } else if (returnTemp > 30 || supplyTemp > 21) {
      status = 'warning';
      healthScore = 68;
    }

    return {
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
      deviceType: 'cooling',
      datacenterId: metadata.datacenterId,
      zone: metadata.zone,
      protocol: 'modbus',
      sourceMode,
      timestamp: now,
      metrics,
      status,
      healthScore,
    };
  }
}
