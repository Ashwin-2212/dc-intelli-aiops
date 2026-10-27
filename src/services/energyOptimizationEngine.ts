export interface InefficientBehaviorRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetType: 'rack' | 'server' | 'pdu' | 'ups' | 'cooling' | 'facility';
  zone: string;
  
  // Monitoring Telemetry Dimensions
  monitoredPowerUtilizationPercent: number; // e.g. 82%
  monitoredWorkloadPercent: number; // e.g. 31%
  serverPowerWatts: number;
  rackPowerKw: number;
  pduPhaseBalancePercent: number;
  upsEfficiencyPercent: number;
  coolingCop: number;

  // Inefficiency Finding & Diagnosis
  finding: string; // e.g. "Low workload but high power consumption."
  rootCause: string;
  severity: 'high' | 'medium' | 'low';
  efficiencyScore: number; // 0-100 (e.g. 42/100)

  // Recommendation
  recommendation: string; // e.g. "Investigate server consolidation or power management."
  remediationSteps: string[];

  // Estimated Savings (Clearly labeled as ESTIMATE)
  hasSufficientData: boolean;
  estimatedSavings: {
    monthlyCostSavings: number; // e.g. $414.72 / mo
    powerSavingsKw: number; // e.g. 4.8 kW
    annualCo2ReductionKg: number; // e.g. 15,980 kg
    isEstimate: boolean; // true
    estimateBasisNote: string; // e.g. "[ESTIMATE] Based on $0.12/kWh electricity rate and ASHRAE TC 9.9 thermal model"
  };
  status: 'active' | 'applied' | 'dismissed';
}

export const energyOptimizationSeedRecords: InefficientBehaviorRecord[] = [
  {
    id: 'OPT-RACK-04',
    assetId: 'RACK-04',
    assetName: 'Rack R-04 (Compute Tier 1)',
    assetType: 'rack',
    zone: 'Zone A',
    monitoredPowerUtilizationPercent: 82.0,
    monitoredWorkloadPercent: 31.0,
    serverPowerWatts: 480,
    rackPowerKw: 12.3,
    pduPhaseBalancePercent: 78.0,
    upsEfficiencyPercent: 94.2,
    coolingCop: 2.9,
    finding: 'Low workload but high power consumption.',
    rootCause:
      '8 physical dual-socket compute blades operating at idle/low C-states with dynamic power capping disabled, while drawing high baseline PSU power and spinning chassis fans at 85%.',
    severity: 'high',
    efficiencyScore: 38,
    recommendation: 'Investigate server consolidation or power management.',
    remediationSteps: [
      'Enable dynamic CPU power governor (Intel P-State / AMD Core Performance Boost balanced mode) via Redfish.',
      'Live-migrate 18 low-utilization container pods to Rack R-08.',
      'Suspend 4 idle blade servers during off-peak windows.',
    ],
    hasSufficientData: true,
    estimatedSavings: {
      monthlyCostSavings: 518.40,
      powerSavingsKw: 6.0,
      annualCo2ReductionKg: 19970,
      isEstimate: true,
      estimateBasisNote:
        '[ESTIMATE] Calculated from 6.0 kW idle power shedding across 8 compute nodes at $0.12/kWh (24h/30.5d continuous operation).',
    },
    status: 'active',
  },
  {
    id: 'OPT-HVAC-01',
    assetId: 'CRAC-01',
    assetName: 'CRAC Unit 01 (Zone A Direct Expansion)',
    assetType: 'cooling',
    zone: 'Zone A',
    monitoredPowerUtilizationPercent: 74.0,
    monitoredWorkloadPercent: 48.0,
    serverPowerWatts: 420,
    rackPowerKw: 8.5,
    pduPhaseBalancePercent: 92.0,
    upsEfficiencyPercent: 95.0,
    coolingCop: 3.4,
    finding: 'Suboptimal thermal setpoint overcooling cold aisle containment.',
    rootCause:
      'Chilled water supply temperature is set to 18.5°C, below the ASHRAE TC 9.9 recommended envelope (21.0°C–24.0°C), forcing chiller compressor overdrive.',
    severity: 'medium',
    efficiencyScore: 54,
    recommendation:
      'Raise cold aisle supply setpoint from 18.5°C to 21.0°C compliant with ASHRAE TC 9.9 standards.',
    remediationSteps: [
      'Increment BMS supply temperature target by 0.5°C every 48 hours to 21.0°C.',
      'Monitor top-of-rack server inlet temperatures for thermal compliance.',
      'Reduce chilled water pump variable frequency drive (VFD) from 90% to 75%.',
    ],
    hasSufficientData: true,
    estimatedSavings: {
      monthlyCostSavings: 2116.80,
      powerSavingsKw: 24.5,
      annualCo2ReductionKg: 81500,
      isEstimate: true,
      estimateBasisNote:
        '[ESTIMATE] Thermodynamic model projection: +2.5°C setpoint elevation yields ~9.8% chiller plant energy savings ($0.12/kWh).',
    },
    status: 'active',
  },
  {
    id: 'OPT-RACK-08',
    assetId: 'RACK-08',
    assetName: 'Rack R-08 (Edge Virtualization)',
    assetType: 'rack',
    zone: 'Zone B',
    monitoredPowerUtilizationPercent: 68.0,
    monitoredWorkloadPercent: 22.0,
    serverPowerWatts: 340,
    rackPowerKw: 6.8,
    pduPhaseBalancePercent: 88.0,
    upsEfficiencyPercent: 94.8,
    coolingCop: 4.1,
    finding: 'Hot aisle air recirculation caused by 18U unblanked chassis openings.',
    rootCause:
      'Missing blanking panels allow hot exhaust air to loop over rack crown into cold intake plenum, triggering server fan acceleration.',
    severity: 'medium',
    efficiencyScore: 48,
    recommendation: 'Install 18U modular blanking panels and seal side brush grommets.',
    remediationSteps: [
      'Install 9x 2U toolless blanking panels in empty bays U18–U36.',
      'Inspect cold aisle perimeter containment strip seals.',
      'Verify server intake fan speeds decrease by ~2,400 RPM.',
    ],
    hasSufficientData: true,
    estimatedSavings: {
      monthlyCostSavings: 708.48,
      powerSavingsKw: 8.2,
      annualCo2ReductionKg: 27280,
      isEstimate: true,
      estimateBasisNote:
        '[ESTIMATE] Based on server internal fan power reduction (85W per chassis) and chiller Delta-T restoration.',
    },
    status: 'active',
  },
  {
    id: 'OPT-PDU-03',
    assetId: 'PDU-ZONE-C',
    assetName: 'Floor PDU 03 (Zone C High-Density)',
    assetType: 'pdu',
    zone: 'Zone C',
    monitoredPowerUtilizationPercent: 77.0,
    monitoredWorkloadPercent: 65.0,
    serverPowerWatts: 580,
    rackPowerKw: 14.1,
    pduPhaseBalancePercent: 64.0,
    upsEfficiencyPercent: 92.5,
    coolingCop: 3.6,
    finding: '3-Phase electrical load imbalance across Phase A, B, and C busbars.',
    rootCause:
      'Phase A is carrying 142A while Phase C carries only 68A (38% imbalance), causing resistive I²R heat losses and neutral conductor harmonic heating.',
    severity: 'high',
    efficiencyScore: 45,
    recommendation: 'Re-whip single-phase branch circuits across Line 1, 2, and 3 to balance feeder load.',
    remediationSteps: [
      'Schedule electrician to reterminate 6x C19 server power cords onto Phase C breaker poles.',
      'Reduce neutral wire current from 54A to <12A.',
      'Lower transformer harmonic dissipation.',
    ],
    hasSufficientData: true,
    estimatedSavings: {
      monthlyCostSavings: 328.32,
      powerSavingsKw: 3.8,
      annualCo2ReductionKg: 12640,
      isEstimate: true,
      estimateBasisNote:
        '[ESTIMATE] Resistive conductor loss reduction model based on 38% phase rebalancing across 400A busway.',
    },
    status: 'active',
  },
];

export class EnergyOptimizationEngine {
  private static instance: EnergyOptimizationEngine;
  public records: InefficientBehaviorRecord[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.records = [...energyOptimizationSeedRecords];
  }

  public static getInstance(): EnergyOptimizationEngine {
    if (!EnergyOptimizationEngine.instance) {
      EnergyOptimizationEngine.instance = new EnergyOptimizationEngine();
    }
    return EnergyOptimizationEngine.instance;
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

  public getRecords(): InefficientBehaviorRecord[] {
    return this.records;
  }

  public applyOptimization(id: string) {
    const rec = this.records.find(r => r.id === id);
    if (rec) {
      rec.status = rec.status === 'applied' ? 'active' : 'applied';
      this.notify();
    }
  }

  public getTotalEstimatedSavings() {
    const active = this.records.filter(r => r.hasSufficientData);
    const monthlyCost = active.reduce((sum, r) => sum + r.estimatedSavings.monthlyCostSavings, 0);
    const powerKw = active.reduce((sum, r) => sum + r.estimatedSavings.powerSavingsKw, 0);
    const co2Kg = active.reduce((sum, r) => sum + r.estimatedSavings.annualCo2ReductionKg, 0);

    return {
      monthlyCost,
      annualCost: monthlyCost * 12,
      powerKw: +powerKw.toFixed(1),
      co2Tons: +(co2Kg / 1000).toFixed(1),
    };
  }
}
