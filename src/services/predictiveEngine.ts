import { PredictiveFailureRecord, PredictiveFailureCategory } from '../types';

export const predictiveFailureSeedRecords: PredictiveFailureRecord[] = [
  {
    id: 'PRED-SRV-001',
    deviceId: 'SRV-R-04-02',
    deviceName: 'Compute Node #2 (Dell PowerEdge R760)',
    deviceType: 'server',
    component: 'Silicon Processor Socket 1 & Motherboard VRM',
    failureCategory: 'server_failure',
    failureProbability: 78,
    riskLevel: 'HIGH',
    predictionHorizon: 'Next 7 days',
    evidence: [
      'Fan speed instability (±1,850 RPM tachometer jitter)',
      'Temperature trend increasing (+0.8°C/day baseline drift under nominal load)',
      'Power fluctuation detected (PSU 12V rail ripple transient +140mV)',
      'Thermal throttle throttling events logged in IPMI SEL',
    ],
    modelConfidence: 91,
    predictionLimitations:
      'Probabilistic forecast synthesized from multivariate time-series anomaly density and Random Forest degradation curves. Non-linear workload surges or ambient HVAC cooling shifts may alter actual failure progression. Model does not assert a deterministic failure date.',
    factors: [
      { factor: 'Continuous Thermal Overdrive (>78°C for 140 hours)', contributionPercent: 46 },
      { factor: 'Fan Tachometer Velocity Variance (Jitter >15%)', contributionPercent: 32 },
      { factor: 'VRM Switching Transient Voltage Instability', contributionPercent: 22 },
    ],
    recommendation:
      'Throttle high-priority ML worker processes, inspect socket thermal paste distribution, and prepare hot-standby node SRV-R-08-01 for seamless live container migration.',
    mtbfHours: 28000,
    mttrHours: 1.5,
    telemetrySignals: [
      { signalName: 'Fan Speed Stability', reading: '14,800 RPM (±1,850 RPM Jitter)', baseline: '6,200 RPM (Stable)', trend: 'fluctuating' },
      { signalName: 'CPU Die Temperature', reading: '82.5°C (+0.8°C/day trend)', baseline: '42.0°C', trend: 'increasing' },
      { signalName: 'PSU Rail Voltage Ripple', reading: '12.28V (140mV Ripple)', baseline: '12.02V (<30mV Ripple)', trend: 'fluctuating' },
      { signalName: 'IPMI Thermal Throttles', reading: '18 Events / 24h', baseline: '0 Events', trend: 'critical' },
    ],
  },
  {
    id: 'PRED-FAN-002',
    deviceId: 'CRAC-02',
    deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
    deviceType: 'cooling',
    component: 'High-Velocity Blower Fan Motor Assembly #3',
    failureCategory: 'fan_failure',
    failureProbability: 84,
    riskLevel: 'HIGH',
    predictionHorizon: 'Next 7 days',
    evidence: [
      'Acoustic vibration harmonic spike (120 Hz bearing resonance >7.8 mm/s RMS)',
      'Fan speed duty cycle pegged at 100% continuous for 168 hours',
      'Motor stator casing temperature elevation (+9.4°C over baseline)',
      'Airflow static pressure output reduction (-18% CFM output)',
    ],
    modelConfidence: 94,
    predictionLimitations:
      'Degradation estimate based on ISO 10816 mechanical vibration thresholds and Weibull bearing lifetime statistics. Lubricant replenishment or belt realignment may extend operational window.',
    factors: [
      { factor: 'Vibration Harmonic Energy Spike (Bearing Race Pitting)', contributionPercent: 52 },
      { factor: 'Continuous 100% Duty Cycle Thermal Load', contributionPercent: 30 },
      { factor: 'Operating Hours Exceeding L10 Bearing Rating', contributionPercent: 18 },
    ],
    recommendation:
      'Dispatch mechanical facilities technician to grease bearing housing, inspect belt tension, and schedule motor swap during off-peak maintenance window before catastrophic rotor lock.',
    mtbfHours: 22000,
    mttrHours: 2.5,
    telemetrySignals: [
      { signalName: 'Vibration RMS Velocity', reading: '7.8 mm/s (ISO Warning Limit: 4.5)', baseline: '1.8 mm/s', trend: 'critical' },
      { signalName: 'Motor Winding Temp', reading: '68.4°C', baseline: '48.0°C', trend: 'increasing' },
      { signalName: 'Airflow Delivery', reading: '2,450 CFM (-18%)', baseline: '3,000 CFM', trend: 'degrading' },
    ],
  },
  {
    id: 'PRED-PSU-003',
    deviceId: 'SRV-R-06-01',
    deviceName: 'AI Inference Node #1 (HPE ProLiant Gen11)',
    deviceType: 'server',
    component: 'Dual 1600W Titanium Power Supply Unit (PSU-2)',
    failureCategory: 'psu_failure',
    failureProbability: 65,
    riskLevel: 'MEDIUM',
    predictionHorizon: 'Next 14 days',
    evidence: [
      '12V DC output rail ripple voltage elevation (+185 mV under dynamic load)',
      'Input AC current harmonic distortion (THD-i increased from 4% to 11.8%)',
      'Thermal scan reveals localized hotspot on secondary electrolytic filter capacitor bank',
      'Power conversion efficiency degraded from 96.2% to 91.8%',
    ],
    modelConfidence: 88,
    predictionLimitations:
      'Capacitor dielectric degradation modeling provides probabilistic remaining useful life (RUL). Abrupt input utility surge or load step-change may trigger immediate crowbar protection.',
    factors: [
      { factor: 'Electrolytic Capacitor ESR Elevation (Electrolyte Dryout)', contributionPercent: 48 },
      { factor: 'Continuous High Power Draw (>85% rated capacity)', contributionPercent: 34 },
      { factor: 'Thermal Hotspot on Output Rectifier Stage', contributionPercent: 18 },
    ],
    recommendation:
      'Verify PSU-1 redundancy takeover capacity; order replacement 1600W hot-plug module and swap PSU-2 without compute downtime.',
    mtbfHours: 45000,
    mttrHours: 0.5,
    telemetrySignals: [
      { signalName: 'Output Rail Ripple', reading: '185 mV (Spec: <50 mV)', baseline: '28 mV', trend: 'fluctuating' },
      { signalName: 'Current THD-i', reading: '11.8%', baseline: '4.2%', trend: 'increasing' },
      { signalName: 'Capacitor Bank Temp', reading: '74.2°C', baseline: '52.0°C', trend: 'increasing' },
    ],
  },
  {
    id: 'PRED-OVH-004',
    deviceId: 'R-04',
    deviceName: 'High-Density Compute Rack R-04 (Zone A)',
    deviceType: 'rack',
    component: 'Cold Aisle Containment & U36–U42 Thermal Plenums',
    failureCategory: 'overheating',
    failureProbability: 89,
    riskLevel: 'CRITICAL',
    predictionHorizon: 'Next 7 days',
    evidence: [
      'Rack top inlet temperature rising at +0.65°C per 24-hour cycle',
      'Static differential pressure across cold containment door dropped below 8 Pa',
      'Hot air recirculation detected through open 3U chassis gaps at U24–U26',
      'Multi-server fan aggregate power draw rose by 2.4 kW across rack',
    ],
    modelConfidence: 96,
    predictionLimitations:
      'Computational Fluid Dynamics (CFD) thermal plume extrapolation assumes current IT workload density. Workload rescheduling or containment door closure will alter microclimate dynamics.',
    factors: [
      { factor: 'Exhaust Heat Recirculation via Unblanked Chassis Slots', contributionPercent: 44 },
      { factor: 'Upstream CRAC-02 Airflow Throttling', contributionPercent: 38 },
      { factor: 'High Power Density (>14.2 kW Rack Load)', contributionPercent: 18 },
    ],
    recommendation:
      'Install modular blanking panels in empty U24–U26 bays immediately; increase Zone A floor tile damper aperture from 40% to 75%.',
    mtbfHours: 18000,
    mttrHours: 1.0,
    telemetrySignals: [
      { signalName: 'Rack Inlet Temp (U38)', reading: '28.8°C (ASHRAE Limit: 27.0°C)', baseline: '22.4°C', trend: 'increasing' },
      { signalName: 'Cold Aisle Delta-P', reading: '7.8 Pa (Target: >20 Pa)', baseline: '24.0 Pa', trend: 'critical' },
      { signalName: 'Hot Aisle Plume Temp', reading: '41.5°C', baseline: '32.0°C', trend: 'critical' },
    ],
  },
  {
    id: 'PRED-PWR-005',
    deviceId: 'UPS-03',
    deviceName: 'Secondary High-Density UPS (Zone C)',
    deviceType: 'ups',
    component: 'Modular VRLA Battery String 2B (Cells 12–24)',
    failureCategory: 'abnormal_power',
    failureProbability: 82,
    riskLevel: 'CRITICAL',
    predictionHorizon: 'Next 14 days',
    evidence: [
      'Internal cell resistance elevation (+91.2% above nominal baseline: 34.8 mΩ vs 18.2 mΩ)',
      'Float charging voltage splay between cell blocks exceeding ±0.45V',
      'Battery reserve runtime under 77% load collapsed from 38 minutes to 18 minutes',
      'Enclosure thermal probe averaging 31.8°C for 40+ consecutive days',
    ],
    modelConfidence: 93,
    predictionLimitations:
      'Electrochemical battery impedance models capture plate sulfation trajectory. Actual load-shedding response during a sudden mains power loss may degrade faster due to non-linear voltage collapse.',
    factors: [
      { factor: 'Internal Cell Plate Sulfation & Dryout', contributionPercent: 54 },
      { factor: 'Prolonged Ambient Enclosure Thermal Stress (>30°C)', contributionPercent: 28 },
      { factor: 'Uneven Float Current Distribution Across Strings', contributionPercent: 18 },
    ],
    recommendation:
      'Isolate Battery String 2B via DC disconnect breaker to prevent thermal runaway; dispatch electrical field engineer with replacement 12V 150Ah modular battery trays.',
    mtbfHours: 35000,
    mttrHours: 3.0,
    telemetrySignals: [
      { signalName: 'Cell Internal Resistance', reading: '34.8 mΩ (Nominal: 18.2 mΩ)', baseline: '18.2 mΩ', trend: 'critical' },
      { signalName: 'Reserve Runtime', reading: '18 min (SLA: >30 min)', baseline: '38 min', trend: 'critical' },
      { signalName: 'Cell Float Voltage Splay', reading: '±0.48V (Spec: <±0.15V)', baseline: '±0.08V', trend: 'fluctuating' },
    ],
  },
  {
    id: 'PRED-STG-006',
    deviceId: 'SRV-R-07-04',
    deviceName: 'Database Cluster Storage Host #4',
    deviceType: 'server',
    component: 'Tier 0 NVMe SSD Array (Samsung PM1733 15.36TB)',
    failureCategory: 'storage_degradation',
    failureProbability: 72,
    riskLevel: 'HIGH',
    predictionHorizon: 'Next 30 days',
    evidence: [
      'SMART Available Spare capacity degraded below 8% reserve threshold',
      'Media and data integrity error count rising (+42 reallocated blocks/week)',
      'Drive lifetime write endurance reached 93.4% of Total Bytes Written (TBW)',
      'P99 NVMe write latency elevated from 120µs to 4.2ms due to background NAND wear leveling',
    ],
    modelConfidence: 89,
    predictionLimitations:
      'SMART telemetry extrapolation utilizes Weibull flash endurance degradation curves. Write amplification factor (WAF) fluctuations under database compaction may accelerate NAND exhaustion.',
    factors: [
      { factor: 'Flash Block Wear-Out (93.4% TBW Consumed)', contributionPercent: 58 },
      { factor: 'Media Integrity ECC Error Rate Elevation', contributionPercent: 26 },
      { factor: 'Heavy Continuous 4K Random Write IOPS', contributionPercent: 16 },
    ],
    recommendation:
      'Trigger automated Ceph/ZFS storage pool data migration to replica node SRV-R-07-05; schedule hot-swap replacement of failed NVMe U.3 drive.',
    mtbfHours: 1200000,
    mttrHours: 0.5,
    telemetrySignals: [
      { signalName: 'SMART Available Spare', reading: '7.8% (Threshold: <10%)', baseline: '100%', trend: 'degrading' },
      { signalName: 'TBW Percentage Used', reading: '93.4%', baseline: '15.0%', trend: 'increasing' },
      { signalName: 'P99 Storage Latency', reading: '4.2 ms', baseline: '120 µs', trend: 'increasing' },
    ],
  },
  {
    id: 'PRED-HLT-007',
    deviceId: 'SRV-R-02-05',
    deviceName: 'Virtualization Host #5 (Dell PowerEdge R760)',
    deviceType: 'server',
    component: 'ECC Registered DDR5 Memory Subsystem & PCIe Bus',
    failureCategory: 'hardware_health',
    failureProbability: 58,
    riskLevel: 'MEDIUM',
    predictionHorizon: 'Next 30 days',
    evidence: [
      'Correctable single-bit ECC memory error rate increased to 480 errors/24h on Channel B DIMM 3',
      'DIMM temperature differential +6.8°C over adjacent memory banks',
      'PCIe Gen5 link training retries detected on NIC 1 controller',
      'Host overall hardware health composite score degraded from 98 to 62',
    ],
    modelConfidence: 85,
    predictionLimitations:
      'Hardware health score is a composite index of corrected errors and bus signal margins. Fault-tolerant ECC mechanisms prevent data corruption, but uncorrectable multi-bit failure probability escalates exponentially if unserviced.',
    factors: [
      { factor: 'Single-Bit Memory Cell Degradation on Channel B', contributionPercent: 50 },
      { factor: 'PCIe Signal Margin Degradation under Bus Load', contributionPercent: 30 },
      { factor: 'Memory Thermal Heat Dissipation Asymmetry', contributionPercent: 20 },
    ],
    recommendation:
      'Enable Post-Package Repair (PPR) via BIOS on next reboot; order 64GB DDR5-5600 ECC RDIMM for planned maintenance replacement.',
    mtbfHours: 85000,
    mttrHours: 1.0,
    telemetrySignals: [
      { signalName: 'Correctable ECC Rate', reading: '480 / 24h', baseline: '<5 / month', trend: 'increasing' },
      { signalName: 'DIMM 3 Temperature', reading: '58.4°C (+6.8°C Delta)', baseline: '51.6°C', trend: 'increasing' },
      { signalName: 'Chassis Health Score', reading: '62/100', baseline: '98/100', trend: 'degrading' },
    ],
  },
];

export class PredictiveFailureEngine {
  private static instance: PredictiveFailureEngine;
  public records: PredictiveFailureRecord[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.records = [...predictiveFailureSeedRecords];
  }

  public static getInstance(): PredictiveFailureEngine {
    if (!PredictiveFailureEngine.instance) {
      PredictiveFailureEngine.instance = new PredictiveFailureEngine();
    }
    return PredictiveFailureEngine.instance;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners = [...this.listeners, cb];
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getRecords(): PredictiveFailureRecord[] {
    return this.records;
  }

  public filterByCategory(category: PredictiveFailureCategory | 'all'): PredictiveFailureRecord[] {
    if (category === 'all') return this.records;
    return this.records.filter(r => r.failureCategory === category);
  }

  public filterByRisk(risk: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): PredictiveFailureRecord[] {
    if (risk === 'ALL') return this.records;
    return this.records.filter(r => r.riskLevel === risk);
  }
}
