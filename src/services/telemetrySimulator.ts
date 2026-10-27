import {
  DataCenterFacility,
  RackUnit,
  ServerDevice,
  CoolingUnit,
  UpsUnit,
  AnomalyRecord,
  PredictiveFailureRecord,
  SimulationScenario,
  WorkOrder,
} from '../types';
import { detectLiveAnomalies } from './aiEngine';
import { TelemetryIntelligencePipeline } from './telemetry/TelemetryIntelligencePipeline';

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'WO-1042',
    title: 'Replace High-Vibration Blower Fan on CRAC-02',
    targetAsset: 'CRAC-02',
    severity: 'critical',
    status: 'in_progress',
    assignedTo: 'Mechanical Tech Lead (Marcus Vance)',
    createdAt: '2026-08-30 08:15:00',
    slaDueHours: 2,
    description: 'Vibration harmonics exceeded ISO 10816 Class II thresholds. Lubricate and replace bearing set #3.',
  },
  {
    id: 'WO-1039',
    title: 'Inspect Battery String 2B Impedance on UPS-03',
    targetAsset: 'UPS-03',
    severity: 'high',
    status: 'open',
    assignedTo: 'Electrical Lead (Sarah Chen)',
    createdAt: '2026-08-30 06:40:00',
    slaDueHours: 6,
    description: 'Internal resistance rose to 14.8mΩ across 4 cells in string 2B. Conduct load-bank discharge test.',
  },
  {
    id: 'WO-1028',
    title: 'Install Blanking Panels on Rack R-08 U20-U24',
    targetAsset: 'Rack R-08',
    severity: 'low',
    status: 'resolved',
    assignedTo: 'DC Floor Tech (Alex Ray)',
    createdAt: '2026-08-29 14:00:00',
    slaDueHours: 24,
    description: 'Prevent hot aisle recirculation through empty chassis bays in Zone B.',
  },
];

// Initial Mock Seed Data Generator with realistic enterprise specs
export function createInitialDataCenter(): {
  facilities: DataCenterFacility[];
  racks: RackUnit[];
  coolingUnits: CoolingUnit[];
  upsUnits: UpsUnit[];
} {
  const facilities: DataCenterFacility[] = [
    {
      id: 'dc-va-01',
      name: 'Alpha Core DC-1 (Virginia)',
      location: 'Ashburn, VA - USA',
      tier: 'Tier IV',
      totalAreaSqFt: 45000,
      floorsCount: 2,
      zonesCount: 4,
      racksCount: 24,
      serversCount: 168,
      totalFacilityPowerKw: 842.5,
      itEquipmentPowerKw: 601.8,
      coolingPowerKw: 185.2,
      pue: 1.40,
      overallHealth: 88,
      ambientTempC: 22.4,
      ambientHumidityPercent: 46.5,
      electricityRatePerKwh: 0.12, // $0.12 / kWh
      carbonIntensityGramsPerKwh: 380,
    },
    {
      id: 'dc-fra-02',
      name: 'Echo Cloud DC-2 (Frankfurt)',
      location: 'Frankfurt, Germany',
      tier: 'Tier III',
      totalAreaSqFt: 32000,
      floorsCount: 1,
      zonesCount: 3,
      racksCount: 18,
      serversCount: 124,
      totalFacilityPowerKw: 560.0,
      itEquipmentPowerKw: 410.0,
      coolingPowerKw: 118.0,
      pue: 1.36,
      overallHealth: 94,
      ambientTempC: 20.8,
      ambientHumidityPercent: 44.0,
      electricityRatePerKwh: 0.24, // €0.24 / kWh
      carbonIntensityGramsPerKwh: 290,
    },
  ];

  const coolingUnits: CoolingUnit[] = [
    {
      id: 'CRAC-01',
      name: 'CRAC Unit 01 (Zone A Direct Expansion)',
      datacenterId: 'dc-va-01',
      zone: 'Zone A',
      type: 'CRAC',
      status: 'healthy',
      supplyTempC: 18.5,
      returnTempC: 26.2,
      fanSpeedPercent: 68,
      chilledWaterFlowLpm: 340,
      powerDrawKw: 42.5,
      copEfficiency: 3.8,
      healthScore: 92,
      failureProbability: 8,
      maintenanceHoursUntilDue: 450,
    },
    {
      id: 'CRAC-02',
      name: 'CRAC Unit 02 (Zone A/B In-Row)',
      datacenterId: 'dc-va-01',
      zone: 'Zone A',
      type: 'In-Row Chiller',
      status: 'warning',
      supplyTempC: 21.8,
      returnTempC: 31.4,
      fanSpeedPercent: 94,
      chilledWaterFlowLpm: 280,
      powerDrawKw: 58.2,
      copEfficiency: 2.9,
      healthScore: 68,
      failureProbability: 42,
      maintenanceHoursUntilDue: 28,
    },
    {
      id: 'CRAC-03',
      name: 'CRAH Chilled Water Unit 03',
      datacenterId: 'dc-va-01',
      zone: 'Zone B',
      type: 'CRAH',
      status: 'healthy',
      supplyTempC: 17.8,
      returnTempC: 25.0,
      fanSpeedPercent: 62,
      chilledWaterFlowLpm: 420,
      powerDrawKw: 38.0,
      copEfficiency: 4.2,
      healthScore: 96,
      failureProbability: 4,
      maintenanceHoursUntilDue: 720,
    },
    {
      id: 'CRAC-04',
      name: 'CRAH Chilled Water Unit 04',
      datacenterId: 'dc-va-01',
      zone: 'Zone C',
      type: 'CRAH',
      status: 'healthy',
      supplyTempC: 18.0,
      returnTempC: 25.4,
      fanSpeedPercent: 65,
      chilledWaterFlowLpm: 390,
      powerDrawKw: 46.5,
      copEfficiency: 3.9,
      healthScore: 90,
      failureProbability: 11,
      maintenanceHoursUntilDue: 510,
    },
  ];

  const upsUnits: UpsUnit[] = [
    {
      id: 'UPS-01',
      name: 'Primary Inverter Bus A (Zone A)',
      datacenterId: 'dc-va-01',
      zone: 'Zone A',
      capacityKva: 400,
      currentLoadKw: 245.0,
      loadPercent: 61,
      batteryHealthPercent: 94,
      batteryChargePercent: 100,
      runtimeRemainingMinutes: 42,
      inputVoltage: 480,
      outputVoltage: 480,
      temperatureC: 24.2,
      batteryAgeYears: 1.8,
      status: 'healthy',
      healthScore: 95,
      failureProbability: 5,
    },
    {
      id: 'UPS-02',
      name: 'Primary Inverter Bus B (Zone B)',
      datacenterId: 'dc-va-01',
      zone: 'Zone B',
      capacityKva: 400,
      currentLoadKw: 280.0,
      loadPercent: 70,
      batteryHealthPercent: 88,
      batteryChargePercent: 99,
      runtimeRemainingMinutes: 34,
      inputVoltage: 479,
      outputVoltage: 480,
      temperatureC: 26.5,
      batteryAgeYears: 2.6,
      status: 'healthy',
      healthScore: 89,
      failureProbability: 12,
    },
    {
      id: 'UPS-03',
      name: 'Secondary High-Density UPS (Zone C)',
      datacenterId: 'dc-va-01',
      zone: 'Zone C',
      capacityKva: 300,
      currentLoadKw: 232.0,
      loadPercent: 77,
      batteryHealthPercent: 64,
      batteryChargePercent: 96,
      runtimeRemainingMinutes: 18,
      inputVoltage: 476,
      outputVoltage: 480,
      temperatureC: 31.8,
      batteryAgeYears: 4.4,
      status: 'warning',
      healthScore: 67,
      failureProbability: 54,
    },
  ];

  // Generate realistic Racks and Servers
  const racks: RackUnit[] = [];
  const zones = ['Zone A', 'Zone A', 'Zone A', 'Zone B', 'Zone B', 'Zone C', 'Zone C', 'Zone D'];
  
  for (let i = 1; i <= 12; i++) {
    const rackId = `R-${String(i).padStart(2, '0')}`;
    const zone = zones[(i - 1) % zones.length];
    const isOverheatingCandidate = rackId === 'R-04' || rackId === 'R-05';
    const isInletHigh = isOverheatingCandidate;

    const serverCount = 6 + Math.floor(Math.random() * 4);
    const servers: ServerDevice[] = [];
    let currentOccupiedU = 0;

    const workloadTypes: ServerDevice['workloadType'][] = [
      'Compute Node',
      'Database Cluster',
      'Storage Array',
      'AI Training Worker',
      'Virtualization Host',
      'Edge Gateway',
    ];

    for (let s = 1; s <= serverCount; s++) {
      const uHeight = s % 3 === 0 ? 2 : 1;
      const uPos = currentOccupiedU + 1;
      currentOccupiedU += uHeight + (s % 4 === 0 ? 1 : 0); // leave occasional 1U gap
      if (currentOccupiedU > 40) break;

      const serverId = `SRV-${rackId}-${String(s).padStart(2, '0')}`;
      const workload = workloadTypes[(i + s) % workloadTypes.length];
      const isAnomalyTarget = rackId === 'R-04' && s === 2;

      const cpu = isAnomalyTarget ? 96 : Math.floor(35 + Math.random() * 40);
      const temp = isAnomalyTarget ? 78.5 : Math.floor(38 + Math.random() * 24);
      const ram = Math.floor(45 + Math.random() * 40);

      servers.push({
        id: serverId,
        name: `${workload} #${s}`,
        rackId,
        uPosition: uPos,
        uHeight,
        model: s % 2 === 0 ? 'Dell PowerEdge R760' : 'HPE ProLiant DL380 Gen11',
        manufacturer: s % 2 === 0 ? 'Dell EMC' : 'HPE',
        serialNumber: `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        ipAddress: `10.240.${i}.${10 + s}`,
        macAddress: `00:1A:2B:3C:${String(i).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        os: 'Ubuntu 24.04 LTS / Linux 6.8',
        cpuCores: s % 2 === 0 ? 64 : 128,
        ramGb: s % 2 === 0 ? 256 : 512,
        storageTb: s % 3 === 0 ? 32 : 16,
        installDate: '2023-04-15',
        warrantyExpireDate: '2027-04-15',
        status: isAnomalyTarget ? 'critical' : cpu > 85 ? 'warning' : 'healthy',
        healthScore: isAnomalyTarget ? 48 : Math.floor(84 + Math.random() * 14),
        workloadType: workload,
        anomalyScore: isAnomalyTarget ? 0.94 : 0.05,
        failureProbability: isAnomalyTarget ? 62 : Math.floor(2 + Math.random() * 12),
        telemetry: {
          timestamp: Date.now(),
          cpuUsage: cpu,
          cpuTemp: temp,
          ramUsage: ram,
          diskUsage: Math.floor(40 + Math.random() * 45),
          diskIOPS: Math.floor(4500 + Math.random() * 6000),
          networkInMbps: Math.floor(320 + Math.random() * 800),
          networkOutMbps: Math.floor(410 + Math.random() * 750),
          networkLatencyMs: +(1.2 + Math.random() * 1.5).toFixed(2),
          powerDrawWatts: Math.floor(380 + cpu * 3.8),
          fanSpeedRpm: Math.floor(6500 + temp * 80),
          responseTimesMs: +(4.2 + (cpu > 80 ? 18.5 : 0)).toFixed(1),
          processCount: 380 + Math.floor(Math.random() * 90),
          uptimeHours: 3420 + i * 120,
        },
      });
    }

    const rackPowerKw = +(servers.reduce((sum, s) => sum + s.telemetry.powerDrawWatts, 0) / 1000 + 0.8).toFixed(2);
    const rackInlet = isInletHigh ? 28.5 : +(21.5 + (Math.random() * 2.5)).toFixed(1);
    const rackOutlet = isInletHigh ? 36.2 : +(30.0 + (Math.random() * 3.0)).toFixed(1);

    racks.push({
      id: rackId,
      name: `Rack ${rackId} (${zone})`,
      datacenterId: 'dc-va-01',
      zone,
      row: `Row-${Math.ceil(i / 4)}`,
      position: ((i - 1) % 4) + 1,
      maxU: 42,
      usedU: currentOccupiedU,
      maxPowerKw: 15.0,
      currentPowerKw: rackPowerKw,
      inletTempC: rackInlet,
      outletTempC: rackOutlet,
      humidityPercent: Math.floor(42 + Math.random() * 10),
      status: isOverheatingCandidate ? 'critical' : rackPowerKw > 12 ? 'warning' : 'healthy',
      healthScore: isOverheatingCandidate ? 58 : Math.floor(82 + Math.random() * 16),
      airflowCfm: Math.floor(1800 + Math.random() * 400),
      servers,
      pduStatus: rackPowerKw > 13.5 ? 'warning' : 'normal',
      weightKg: 420 + currentOccupiedU * 8,
      maxWeightKg: 1000,
    });
  }

  return { facilities, racks, coolingUnits, upsUnits };
}

// Initial Anomaly Seed Data
export const initialAnomalies: AnomalyRecord[] = [
  {
    id: 'ANOM-2026-081',
    timestamp: 'Just now',
    deviceId: 'SRV-R-04-02',
    deviceName: 'Compute Node #2 (Rack R-04)',
    deviceType: 'server',
    metric: 'CPU Temperature & Power Spike',
    currentValue: '78.5°C / 745W',
    expectedRange: '35°C–62°C / 350W–480W',
    anomalyScore: 0.94,
    severity: 'critical',
    possibleCause: 'Thermal throttling due to upstream CRAC-02 localized fan velocity loss',
    recommendedAction: 'Inspect CRAC-02 airflow louvers; redistribute high priority virtual workloads to R-08',
    status: 'active',
  },
  {
    id: 'ANOM-2026-079',
    timestamp: '14 min ago',
    deviceId: 'CRAC-02',
    deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
    deviceType: 'cooling',
    metric: 'Chilled Water Delta T Anomaly',
    currentValue: '9.6°C delta (High return temp)',
    expectedRange: '5.5°C–7.0°C delta',
    anomalyScore: 0.86,
    severity: 'warning',
    possibleCause: 'Actuator valve calibration drift reducing chilled water velocity',
    recommendedAction: 'Execute motorized valve recalibration script or manual bypass cycle',
    status: 'active',
  },
  {
    id: 'ANOM-2026-075',
    timestamp: '42 min ago',
    deviceId: 'UPS-03',
    deviceName: 'Secondary High-Density UPS (Zone C)',
    deviceType: 'ups',
    metric: 'Internal Battery Cell Resistance',
    currentValue: '34.8 mΩ (Nominal: 18 mΩ)',
    expectedRange: '16.0–22.0 mΩ',
    anomalyScore: 0.81,
    severity: 'warning',
    possibleCause: 'String 2 cell dryout resulting in premature internal impedance rise',
    recommendedAction: 'Schedule string impedance test and dispatch battery module replacement',
    status: 'acknowledged',
  },
];

// Predictive Failure Seed Records
export const initialPredictiveFailures: PredictiveFailureRecord[] = [
  {
    id: 'PRED-001',
    deviceId: 'CRAC-02',
    deviceName: 'CRAC Unit 02 (In-Row)',
    deviceType: 'cooling',
    component: 'Blower Fan Bearing #3',
    failureProbability: 48,
    expectedWindowDays: '8–14 days',
    riskLevel: 'high',
    confidencePercent: 91,
    factors: [
      { factor: 'Vibration Harmonic Spike (120Hz peak)', contributionPercent: 44 },
      { factor: 'Continuous High RPM (94% load for 120h)', contributionPercent: 32 },
      { factor: 'Operating Hours Beyond L10 Lifespan', contributionPercent: 24 },
    ],
    recommendation: 'Replace fan motor assembly during upcoming maintenance window before catastrophic rotor lock',
    mtbfHours: 24000,
    mttrHours: 2.5,
  },
  {
    id: 'PRED-002',
    deviceId: 'UPS-03',
    deviceName: 'Secondary UPS (Zone C)',
    deviceType: 'ups',
    component: 'VRLA Battery String 2B',
    failureProbability: 64,
    expectedWindowDays: '15–22 days',
    riskLevel: 'critical',
    confidencePercent: 88,
    factors: [
      { factor: 'Internal Cell Resistance (+93% over baseline)', contributionPercent: 52 },
      { factor: 'Thermal Stress Exposure (>30°C for 45 days)', contributionPercent: 28 },
      { factor: 'Float Current Elevation', contributionPercent: 20 },
    ],
    recommendation: 'Isolate battery string 2B to prevent thermal runaway; swap with reserve modular tray',
    mtbfHours: 35000,
    mttrHours: 3.0,
  },
  {
    id: 'PRED-003',
    deviceId: 'SRV-R-07-04',
    deviceName: 'Database Cluster Node #4',
    deviceType: 'server',
    component: 'NVMe SSD Array Tier 0 (Samsung PM1733)',
    failureProbability: 38,
    expectedWindowDays: '25–35 days',
    riskLevel: 'medium',
    confidencePercent: 84,
    factors: [
      { factor: 'SMART Available Spare Below 10%', contributionPercent: 60 },
      { factor: 'Media & Data Integrity Errors Count', contributionPercent: 25 },
      { factor: 'Drive Lifetime Write Endurance (>92% TBW)', contributionPercent: 15 },
    ],
    recommendation: 'Trigger automated data migration to replica node; hot-swap failed NVMe drive',
    mtbfHours: 1200000,
    mttrHours: 0.5,
  },
];


// Telemetry State Manager singleton
export class TelemetryEngine {
  private static instance: TelemetryEngine;
  public facilities: DataCenterFacility[];
  public racks: RackUnit[];
  public coolingUnits: CoolingUnit[];
  public upsUnits: UpsUnit[];
  public anomalies: AnomalyRecord[];
  public predictions: PredictiveFailureRecord[];
  public workOrders: WorkOrder[];
  public currentScenario: SimulationScenario = 'normal';
  public isRunning: boolean = true;
  private listeners: (() => void)[] = [];
  private historyPoints: {
    timestamp: string;
    powerKw: number;
    pue: number;
    avgTempC: number;
    avgCpuUsage: number;
    networkGbps: number;
  }[] = [];

  private timer: any = null;

  private constructor() {
    const data = createInitialDataCenter();
    this.facilities = data.facilities;
    this.racks = data.racks;
    this.coolingUnits = data.coolingUnits;
    this.upsUnits = data.upsUnits;
    this.anomalies = [...initialAnomalies];
    this.predictions = [...initialPredictiveFailures];
    this.workOrders = [...initialWorkOrders];

    // Seed initial 15 history points
    const now = Date.now();
    const seededPoints = [];
    for (let i = 14; i >= 0; i--) {
      const t = new Date(now - i * 30000);
      seededPoints.push({
        timestamp: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`,
        powerKw: +(830 + Math.random() * 25).toFixed(1),
        pue: +(1.38 + Math.random() * 0.04).toFixed(3),
        avgTempC: +(22.0 + Math.random() * 1.5).toFixed(1),
        avgCpuUsage: +(52 + Math.random() * 15).toFixed(1),
        networkGbps: +(4.2 + Math.random() * 1.8).toFixed(2),
      });
    }
    this.historyPoints = seededPoints;

    this.startSimulation();
  }

  public static getInstance(): TelemetryEngine {
    if (!TelemetryEngine.instance) {
      TelemetryEngine.instance = new TelemetryEngine();
    }
    return TelemetryEngine.instance;
  }

  public subscribe(cb: () => void) {
    this.listeners = [...this.listeners, cb];
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public setScenario(scenario: SimulationScenario) {
    this.currentScenario = scenario;
    this.applyScenarioImmediateEffects();
    this.notify();
  }

  public triggerFailureScenario(scenario: 'crac_failure' | 'power_spike' | 'ups_failure' | 'nominal') {
    if (scenario === 'crac_failure') this.setScenario('cooling_failure');
    else if (scenario === 'power_spike') this.setScenario('power_spike');
    else if (scenario === 'ups_failure') this.setScenario('ups_degradation');
    else this.setScenario('normal');
  }

  public toggleRunning() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.startSimulation();
    } else {
      clearInterval(this.timer);
    }
    this.notify();
  }

  public getHistory() {
    return this.historyPoints.map(p => ({ ...p }));
  }

  private applyScenarioImmediateEffects() {
    if (this.currentScenario === 'cooling_failure') {
      const crac2 = this.coolingUnits.find(c => c.id === 'CRAC-02');
      if (crac2) {
        crac2.status = 'critical';
        crac2.supplyTempC = 27.5;
        crac2.returnTempC = 37.0;
        crac2.fanSpeedPercent = 100;
        crac2.powerDrawKw = 72.0;
        crac2.copEfficiency = 1.9;
        crac2.healthScore = 32;
        crac2.failureProbability = 89;
      }
      this.racks.forEach(r => {
        if (r.id === 'R-04' || r.id === 'R-05') {
          r.inletTempC = 33.8;
          r.outletTempC = 41.5;
          r.status = 'critical';
          r.healthScore = 44;
          r.servers.forEach(s => {
            s.telemetry.cpuTemp = 82.5;
            s.telemetry.fanSpeedRpm = 14500;
            s.status = 'critical';
            s.healthScore = 45;
          });
        }
      });
    } else if (this.currentScenario === 'power_spike') {
      const ups1 = this.upsUnits.find(u => u.id === 'UPS-01');
      if (ups1) {
        ups1.currentLoadKw = 360;
        ups1.loadPercent = 90;
        ups1.status = 'warning';
        ups1.temperatureC = 34.0;
      }
      this.facilities[0].totalFacilityPowerKw = 990;
      this.facilities[0].pue = 1.54;
    } else if (this.currentScenario === 'ups_degradation') {
      const ups3 = this.upsUnits.find(u => u.id === 'UPS-03');
      if (ups3) {
        ups3.batteryHealthPercent = 38;
        ups3.status = 'critical';
        ups3.healthScore = 41;
        ups3.failureProbability = 82;
        ups3.runtimeRemainingMinutes = 8;
      }
    } else if (this.currentScenario === 'high_load') {
      this.racks.forEach(r => {
        r.servers.forEach(s => {
          s.telemetry.cpuUsage = Math.min(99, s.telemetry.cpuUsage + 35);
          s.telemetry.ramUsage = Math.min(96, s.telemetry.ramUsage + 25);
          s.telemetry.powerDrawWatts = Math.floor(s.telemetry.powerDrawWatts * 1.35);
        });
        r.currentPowerKw = +(r.currentPowerKw * 1.3).toFixed(2);
      });
      this.facilities[0].itEquipmentPowerKw = 750;
      this.facilities[0].totalFacilityPowerKw = 1040;
    } else if (this.currentScenario === 'normal') {
      const crac2 = this.coolingUnits.find(c => c.id === 'CRAC-02');
      if (crac2) {
        crac2.status = 'warning';
        crac2.supplyTempC = 21.0;
        crac2.returnTempC = 30.0;
        crac2.healthScore = 72;
      }
      const ups3 = this.upsUnits.find(u => u.id === 'UPS-03');
      if (ups3) {
        ups3.batteryHealthPercent = 68;
        ups3.status = 'warning';
      }
      this.facilities[0].totalFacilityPowerKw = 840;
      this.facilities[0].pue = 1.40;
    }
  }

  private startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.isRunning) return;
      this.tick();
    }, 2000);
  }

  private tick() {
    const isCoolingFailure = this.currentScenario === 'cooling_failure';
    const isHighLoad = this.currentScenario === 'high_load';
    const isPowerSpike = this.currentScenario === 'power_spike';

    let totalServerWatts = 0;
    let totalCpuSum = 0;
    let serverCount = 0;

    // Mutate servers with physics noise
    this.racks.forEach(rack => {
      const isOverheated = (rack.id === 'R-04' || rack.id === 'R-05') && isCoolingFailure;
      
      let rackWatts = 0;
      rack.servers.forEach(server => {
        serverCount++;
        const deltaCpu = (Math.random() - 0.48) * 4;
        let cpu = Math.max(10, Math.min(99, server.telemetry.cpuUsage + deltaCpu));
        if (isHighLoad) cpu = Math.max(80, cpu);

        const deltaTemp = (Math.random() - 0.48) * 0.8;
        let temp = Math.max(30, Math.min(95, server.telemetry.cpuTemp + deltaTemp));
        if (isOverheated) temp = Math.max(76, temp + 0.4);

        const power = Math.floor(320 + cpu * 3.6 + (isOverheated ? 60 : 0));
        rackWatts += power;
        totalServerWatts += power;
        totalCpuSum += cpu;

        server.telemetry = {
          ...server.telemetry,
          timestamp: Date.now(),
          cpuUsage: Math.round(cpu),
          cpuTemp: +temp.toFixed(1),
          networkInMbps: Math.max(50, Math.min(1200, Math.round(server.telemetry.networkInMbps + (Math.random() - 0.5) * 60))),
          networkOutMbps: Math.max(50, Math.min(1200, Math.round(server.telemetry.networkOutMbps + (Math.random() - 0.5) * 60))),
          powerDrawWatts: power,
          fanSpeedRpm: Math.round(6000 + temp * 85),
          responseTimesMs: +(3.5 + (cpu > 85 ? 14 : 0) + Math.random()).toFixed(1),
        };

        if (temp > 80 || cpu > 95) {
          server.status = 'critical';
          server.healthScore = Math.max(35, 100 - Math.round(cpu * 0.4 + temp * 0.5));
        } else if (temp > 70 || cpu > 80) {
          server.status = 'warning';
          server.healthScore = Math.max(65, 100 - Math.round(cpu * 0.2 + temp * 0.3));
        } else {
          server.status = 'healthy';
          server.healthScore = Math.min(99, Math.max(82, 100 - Math.round(cpu * 0.1 + temp * 0.1)));
        }
      });

      rack.currentPowerKw = +(rackWatts / 1000 + 0.8).toFixed(2);
      if (isOverheated) {
        rack.inletTempC = +(rack.inletTempC + (Math.random() * 0.2)).toFixed(1);
        rack.outletTempC = +(rack.inletTempC + 7.5).toFixed(1);
        rack.status = 'critical';
      } else {
        rack.inletTempC = +(21.0 + (Math.random() * 2.2)).toFixed(1);
        rack.outletTempC = +(rack.inletTempC + 8.2).toFixed(1);
        rack.status = rack.currentPowerKw > 13.5 ? 'warning' : 'healthy';
      }
    });

    const itPowerKw = +(totalServerWatts / 1000).toFixed(1);
    let coolingKw = this.coolingUnits.reduce((acc, c) => acc + c.powerDrawKw, 0);
    if (isCoolingFailure) coolingKw += 30;

    const totalFacilityKw = +(itPowerKw + coolingKw + 55).toFixed(1);
    const pue = +(totalFacilityKw / Math.max(1, itPowerKw)).toFixed(3);
    const avgCpu = +(totalCpuSum / Math.max(1, serverCount)).toFixed(1);

    this.facilities[0].itEquipmentPowerKw = itPowerKw;
    this.facilities[0].totalFacilityPowerKw = totalFacilityKw;
    this.facilities[0].pue = isPowerSpike ? 1.55 : pue;
    this.facilities[0].overallHealth = isCoolingFailure ? 68 : isHighLoad ? 76 : isPowerSpike ? 72 : 89;

    // Dynamically detect multi-tier anomalies
    const allServers = this.racks.flatMap(r => r.servers);
    this.anomalies = detectLiveAnomalies(allServers, this.racks, this.coolingUnits, this.upsUnits);

    // Push to history ring buffer
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newPoint = {
      timestamp: timeStr,
      powerKw: totalFacilityKw,
      pue: this.facilities[0].pue,
      avgTempC: +(22.0 + (isCoolingFailure ? 6.5 : 0) + Math.random()).toFixed(1),
      avgCpuUsage: avgCpu,
      networkGbps: +(4.5 + Math.random() * 2.0).toFixed(2),
    };

    this.historyPoints = [...this.historyPoints.slice(-24), newPoint];

    // Pass simulated telemetry through the exact same TelemetryIntelligencePipeline as real agents
    const pipeline = TelemetryIntelligencePipeline.getInstance();
    const srv02 = this.racks.find(r => r.id === 'R-04')?.servers.find(s => s.id === 'SRV-R-04-02');
    if (srv02) {
      pipeline.processTelemetry({
        sourceId: 'SRC-SIM-SRV-04-02',
        sourceType: 'telemetry_simulator',
        assetId: srv02.id,
        assetName: srv02.name,
        assetType: 'server',
        location: { dataCenter: 'dc-va-01', rack: srv02.rackId, zone: 'Zone A', uPosition: srv02.uPosition },
        metrics: {
          cpu: srv02.telemetry.cpuUsage,
          temperature: srv02.telemetry.cpuTemp,
          power: srv02.telemetry.powerDrawWatts,
          network: +(srv02.telemetry.networkInMbps / 10).toFixed(1),
          fan: srv02.telemetry.fanSpeedRpm,
        },
        status: srv02.status,
      });
    }

    const crac02 = this.coolingUnits.find(c => c.id === 'CRAC-02');
    if (crac02) {
      pipeline.processTelemetry({
        sourceId: 'SRC-SIM-CRAC-02',
        sourceType: 'telemetry_simulator',
        assetId: crac02.id,
        assetName: crac02.name,
        assetType: 'cooling',
        location: { dataCenter: 'dc-va-01', rack: 'Zone A/B', zone: crac02.zone },
        metrics: {
          temperature: crac02.returnTempC,
          supplyTempC: crac02.supplyTempC,
          returnTempC: crac02.returnTempC,
          power: crac02.powerDrawKw * 1000,
          fan: crac02.fanSpeedPercent,
          cop: crac02.copEfficiency,
        },
        status: crac02.status,
      });
    }

    this.notify();
  }
}
