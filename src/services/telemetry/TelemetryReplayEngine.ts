import { IncidentReplayFrame } from '../../types/telemetryIntelligence';

export class TelemetryReplayEngine {
  private static instance: TelemetryReplayEngine;
  private replaySessions: Map<string, IncidentReplayFrame[]> = new Map();

  private constructor() {
    this.seedInitialReplayFrames();
  }

  public static getInstance(): TelemetryReplayEngine {
    if (!TelemetryReplayEngine.instance) {
      TelemetryReplayEngine.instance = new TelemetryReplayEngine();
    }
    return TelemetryReplayEngine.instance;
  }

  private seedInitialReplayFrames() {
    const canonicalFrames: IncidentReplayFrame[] = [
      {
        frameIndex: 0,
        relativeTimeStr: '14:00 (T - 12 min)',
        timestamp: '2026-09-30T14:00:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 45, ram: 52, temp: 42.0, power: 340, fanRpm: 6200 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 26.2, power: 42500, fanRpm: 68 },
          'UPS-01': { cpu: 0, ram: 0, temp: 24.5, power: 310000, fanRpm: 0 },
        },
        activeIncidentPhase: 'NORMAL_OPERATION',
        highlightMessage: 'All telemetry metrics within standard historical baselines. PUE steady at 1.40.',
        systemHealthScore: 94,
        facilityPUE: 1.40,
        activeAlarmsCount: 0,
      },
      {
        frameIndex: 1,
        relativeTimeStr: '14:04 (T - 8 min)',
        timestamp: '2026-09-30T14:04:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 62, ram: 68, temp: 48.5, power: 380, fanRpm: 7800 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 28.4, power: 46000, fanRpm: 78 },
          'UPS-01': { cpu: 0, ram: 0, temp: 25.1, power: 325000, fanRpm: 0 },
        },
        activeIncidentPhase: 'INITIAL_ANOMALY',
        highlightMessage: 'Initial Workload Surge detected. CRAC-02 return air temp began climbing (+2.2°C).',
        systemHealthScore: 88,
        facilityPUE: 1.42,
        activeAlarmsCount: 1,
      },
      {
        frameIndex: 2,
        relativeTimeStr: '14:08 (T - 4 min)',
        timestamp: '2026-09-30T14:08:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 82, ram: 84, temp: 68.0, power: 430, fanRpm: 11200 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 31.0, power: 54000, fanRpm: 94 },
          'UPS-01': { cpu: 0, ram: 0, temp: 26.0, power: 345000, fanRpm: 0 },
        },
        activeIncidentPhase: 'MULTI_METRIC_CASCADE',
        highlightMessage: 'Thermal Coupling: CRAC-02 fan speed maxed out at 94%. Silicon die temperature reached 68.0°C.',
        systemHealthScore: 74,
        facilityPUE: 1.46,
        activeAlarmsCount: 3,
      },
      {
        frameIndex: 3,
        relativeTimeStr: '14:12 (T + 0 min)',
        timestamp: '2026-09-30T14:12:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 96, ram: 92, temp: 82.5, power: 460, fanRpm: 14500 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 37.0, power: 72000, fanRpm: 100 },
          'UPS-01': { cpu: 0, ram: 0, temp: 28.5, power: 360000, fanRpm: 0 },
        },
        activeIncidentPhase: 'INCIDENT_DECLARED',
        highlightMessage: 'CRITICAL INCIDENT: Multi-metric correlation engine detected combined thermal/compute cascade. PROCHOT trip.',
        systemHealthScore: 48,
        facilityPUE: 1.54,
        activeAlarmsCount: 7,
      },
      {
        frameIndex: 4,
        relativeTimeStr: '14:14 (T + 2 min)',
        timestamp: '2026-09-30T14:14:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 94, ram: 90, temp: 81.0, power: 455, fanRpm: 14500 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 36.2, power: 71000, fanRpm: 100 },
          'UPS-01': { cpu: 0, ram: 0, temp: 28.2, power: 358000, fanRpm: 0 },
        },
        activeIncidentPhase: 'RCA_COMPUTED',
        highlightMessage: 'Automated RCA: Probable cause CRAC-02 refrigerant restriction (94% confidence). AI Work Order WO-1042 generated.',
        systemHealthScore: 52,
        facilityPUE: 1.52,
        activeAlarmsCount: 5,
      },
      {
        frameIndex: 5,
        relativeTimeStr: '14:18 (T + 6 min)',
        timestamp: '2026-09-30T14:18:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 65, ram: 60, temp: 64.0, power: 390, fanRpm: 9200 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 29.5, power: 58000, fanRpm: 85 },
          'UPS-01': { cpu: 0, ram: 0, temp: 26.5, power: 330000, fanRpm: 0 },
        },
        activeIncidentPhase: 'MITIGATION_APPLIED',
        highlightMessage: 'Remediation Active: CRAH-03 chilled water bypass opened +25%, replica workloads migrated to Rack R-10.',
        systemHealthScore: 78,
        facilityPUE: 1.44,
        activeAlarmsCount: 2,
      },
      {
        frameIndex: 6,
        relativeTimeStr: '14:24 (T + 12 min)',
        timestamp: '2026-09-30T14:24:00Z',
        assetMetrics: {
          'SRV-R-04-02': { cpu: 48, ram: 54, temp: 44.0, power: 345, fanRpm: 6400 },
          'CRAC-02': { cpu: 0, ram: 0, temp: 26.5, power: 43000, fanRpm: 68 },
          'UPS-01': { cpu: 0, ram: 0, temp: 24.8, power: 312000, fanRpm: 0 },
        },
        activeIncidentPhase: 'RECOVERY',
        highlightMessage: 'Incident Resolved: All physical thermal microclimates normalized. Incident timeline archived with closed-loop outcome.',
        systemHealthScore: 92,
        facilityPUE: 1.40,
        activeAlarmsCount: 0,
      },
    ];

    this.replaySessions.set('INC-THERMAL-CASCADE-01', canonicalFrames);
  }

  public getIncidentReplay(incidentId: string = 'INC-THERMAL-CASCADE-01'): IncidentReplayFrame[] {
    return this.replaySessions.get(incidentId) || this.replaySessions.get('INC-THERMAL-CASCADE-01') || [];
  }
}
