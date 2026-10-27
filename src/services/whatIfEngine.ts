export type WhatIfScenarioType =
  | 'add_servers'
  | 'remove_servers'
  | 'increase_workload'
  | 'increase_power'
  | 'cooling_failure'
  | 'ups_degradation'
  | 'server_shutdown'
  | 'rack_relocation';

export const whatIfScenariosList: WhatIfScenarioType[] = [
  'add_servers',
  'remove_servers',
  'increase_workload',
  'increase_power',
  'cooling_failure',
  'ups_degradation',
  'server_shutdown',
  'rack_relocation',
];

export interface WhatIfSimulationInput {
  scenarioType: WhatIfScenarioType;
  targetRack: string; // e.g. "RACK-05" / "R-05"
  serverCount: number; // e.g. 20 servers
  perServerPowerWatts: number; // e.g. 550W
  avgCpuLoadPercent: number; // e.g. 75%
  networkBandwidthGbps: number; // e.g. 10 Gbps
  workloadType: string;
  coolingEfficiencyCop: number; // e.g. 3.5
  sourceRackForRelocation?: string; // e.g. "RACK-02"
}

export interface WhatIfSimulationResult {
  // Key Exact Requested Output Metrics
  rackCapacityPercent: number; // e.g. 82%
  powerPercent: number; // e.g. 91%
  coolingPercent: number; // e.g. 87%
  cpuPercent: number; // e.g. 78%
  networkPercent: number; // e.g. 64%
  upsLoadPercent: number; // e.g. 88%
  pduLoadPercent: number; // e.g. 93%
  availableSpaceU: number; // e.g. 8U left
  totalFacilityPowerKw: number; // e.g. 965 kW
  addedPowerKw: number; // e.g. +14.2 kW
  projectedPue: number; // e.g. 1.48

  // Decision & Recommendations
  riskLevel: 'SAFE' | 'MODERATE' | 'HIGH RISK' | 'CRITICAL RISK';
  decisionBadge: string; // e.g. "⚠️ HIGH RISK"
  decisionSummary: string;
  recommendation: string; // e.g. "Use another rack or increase available power/cooling capacity."
  detailedRecommendations: string[];
  bottlenecks: string[];

  // Baseline Comparison
  baseline: {
    rackCapacityPercent: number;
    powerPercent: number;
    coolingPercent: number;
    cpuPercent: number;
    upsLoadPercent: number;
    pduLoadPercent: number;
    availableSpaceU: number;
  };

  isSandboxOnly: boolean; // Confirms real infrastructure is not modified
}

export class WhatIfSimulationEngine {
  private static instance: WhatIfSimulationEngine;

  public static getInstance(): WhatIfSimulationEngine {
    if (!WhatIfSimulationEngine.instance) {
      WhatIfSimulationEngine.instance = new WhatIfSimulationEngine();
    }
    return WhatIfSimulationEngine.instance;
  }

  /**
   * Execute simulation without modifying real data center infrastructure
   */
  public simulate(input: WhatIfSimulationInput): WhatIfSimulationResult {
    const rackId = input.targetRack || 'RACK-05';
    
    // Baseline state for comparison
    const baseRackUUsed = 24; // 24U out of 42U used = 57%
    const baseRackPowerKw = 9.2; // 9.2 kW out of 15 kW max = 61%
    const baseFacilityPowerKw = 842.5; // 842.5 kW out of 1,100 kW ceiling = 76.5%
    const baseCoolingKw = 185.2; // of 300 kW capacity = 61.7%
    const baseCpuPercent = 54.0;
    const baseNetworkPercent = 42.0;
    const baseUpsLoadPercent = 68.0;
    const basePduPercent = 61.3;

    let deltaServers = 0;
    let deltaServerPowerKw = 0;
    let deltaCpu = 0;
    let deltaNetwork = 0;
    let deltaCoolingKw = 0;

    switch (input.scenarioType) {
      case 'add_servers': {
        // e.g. User adds 20 servers on RACK-05
        deltaServers = input.serverCount; // 20
        deltaServerPowerKw = (input.serverCount * input.perServerPowerWatts) / 1000; // e.g. 20 * 550W = 11 kW
        deltaCpu = (input.avgCpuLoadPercent - baseCpuPercent) * (input.serverCount / 40);
        deltaNetwork = input.networkBandwidthGbps * 2.2;
        deltaCoolingKw = deltaServerPowerKw / (input.coolingEfficiencyCop || 3.5);
        break;
      }

      case 'remove_servers': {
        deltaServers = -Math.min(baseRackUUsed / 2, input.serverCount);
        deltaServerPowerKw = -(Math.abs(deltaServers) * input.perServerPowerWatts) / 1000;
        deltaCpu = -12.0;
        deltaNetwork = -15.0;
        deltaCoolingKw = deltaServerPowerKw / 3.5;
        break;
      }

      case 'increase_workload': {
        deltaCpu = Math.min(45, input.avgCpuLoadPercent * 0.4);
        deltaServerPowerKw = (baseRackPowerKw * 0.35);
        deltaNetwork = 28.0;
        deltaCoolingKw = deltaServerPowerKw / 3.2;
        break;
      }

      case 'increase_power': {
        deltaServerPowerKw = (input.serverCount * input.perServerPowerWatts * 1.3) / 1000;
        deltaCoolingKw = deltaServerPowerKw / 3.0;
        break;
      }

      case 'cooling_failure': {
        deltaCoolingKw = 45.0; // loss of CRAC chiller unit
        deltaServerPowerKw = 4.5; // fan overdrive on all servers
        break;
      }

      case 'ups_degradation': {
        deltaServerPowerKw = 2.0;
        break;
      }

      case 'server_shutdown': {
        deltaServers = -input.serverCount;
        deltaServerPowerKw = -(input.serverCount * 450) / 1000;
        deltaCpu = -20.0;
        deltaNetwork = -25.0;
        break;
      }

      case 'rack_relocation': {
        deltaServers = input.serverCount;
        deltaServerPowerKw = (input.serverCount * input.perServerPowerWatts) / 1000;
        deltaCoolingKw = deltaServerPowerKw / 3.5;
        break;
      }
    }

    // Calculate simulated outcomes
    const newRackUUsed = Math.max(0, Math.min(42, baseRackUUsed + deltaServers * 2)); // 2U per server average
    const rackCapacityPercent = Math.min(100, Math.round((newRackUUsed / 42) * 100)); // e.g. 82%
    const availableSpaceU = Math.max(0, 42 - newRackUUsed);

    const newRackPowerKw = Math.max(1.0, baseRackPowerKw + deltaServerPowerKw);
    const pduLoadPercent = Math.min(100, Math.round((newRackPowerKw / 15.0) * 100)); // 15 kW PDU limit

    const newFacilityPowerKw = +(baseFacilityPowerKw + deltaServerPowerKw + deltaCoolingKw).toFixed(1);
    const powerPercent = Math.min(100, Math.round((newFacilityPowerKw / 1100.0) * 100)); // e.g. 91%

    const newCoolingKw = +(baseCoolingKw + deltaCoolingKw + (input.scenarioType === 'cooling_failure' ? 65 : 0)).toFixed(1);
    const coolingPercent = Math.min(100, Math.round((newCoolingKw / 280.0) * 100)); // e.g. 87%

    const cpuPercent = Math.min(100, Math.max(10, Math.round(baseCpuPercent + deltaCpu)));
    const networkPercent = Math.min(100, Math.max(5, Math.round(baseNetworkPercent + deltaNetwork)));
    
    let upsLoadPercent = Math.min(100, Math.round(baseUpsLoadPercent + (deltaServerPowerKw / 300) * 100));
    if (input.scenarioType === 'ups_degradation') upsLoadPercent = 94;

    const projectedPue = +(newFacilityPowerKw / Math.max(1, newFacilityPowerKw - newCoolingKw - 55)).toFixed(2);

    // Decision Logic
    const bottlenecks: string[] = [];
    const detailedRecommendations: string[] = [];
    let riskLevel: WhatIfSimulationResult['riskLevel'] = 'SAFE';
    let decisionBadge = '✅ SAFE TO DEPLOY';
    let decisionSummary = 'Capacity, power, and cooling headroom are all sufficient for deployment.';
    let recommendation = 'Proceed with planned rollout during standard change window.';

    if (powerPercent > 95 || rackCapacityPercent >= 98 || coolingPercent > 92 || pduLoadPercent >= 96) {
      riskLevel = 'CRITICAL RISK';
      decisionBadge = '🛑 CRITICAL RISK / BLOCKED';
      decisionSummary = 'Deployment exceeds infrastructure safety margins and risks PDU circuit breaker trip.';
      recommendation = 'Reject deployment. Split servers across Row 2 (Rack R-08 / R-09) and provision PDU expansion.';
    } else if (rackCapacityPercent > 80 || powerPercent > 88 || coolingPercent > 85 || pduLoadPercent > 88) {
      riskLevel = 'HIGH RISK';
      decisionBadge = '⚠️ HIGH RISK';
      decisionSummary = `Deployment pushes rack capacity to ${rackCapacityPercent}%, facility power to ${powerPercent}%, and cooling to ${coolingPercent}%.`;
      recommendation = 'Use another rack or increase available power/cooling capacity.';
    } else if (rackCapacityPercent <= 70 && powerPercent <= 80 && coolingPercent <= 75) {
      riskLevel = 'SAFE';
      decisionBadge = '✅ SAFE';
      decisionSummary = 'All infrastructure safety margins within standard ASHRAE and Tier III envelope.';
      recommendation = 'Proceed with hardware installation.';
    } else {
      riskLevel = 'MODERATE';
      decisionBadge = '⚡ MODERATE RISK';
      decisionSummary = 'Deployment is feasible but tightens thermal and power headroom.';
      recommendation = 'Verify cold aisle static pressure before powering on high-density chassis.';
    }

    if (rackCapacityPercent > 80) {
      bottlenecks.push(`Rack ${rackId} U-Space Occupancy (${rackCapacityPercent}% used, only ${availableSpaceU}U remaining)`);
      detailedRecommendations.push(`Distribute at least 8 servers to adjacent underutilized Rack R-08 (18U available).`);
    }

    if (pduLoadPercent > 85) {
      bottlenecks.push(`Rack PDU Circuit Capacity (${pduLoadPercent}% of 15 kW threshold)`);
      detailedRecommendations.push('Verify 3-phase load balance across Line 1, Line 2, and Line 3 whips.');
    }

    if (powerPercent > 88) {
      bottlenecks.push(`Substation Transformer 1 Headroom (${powerPercent}% of 1,100 kW limit)`);
      detailedRecommendations.push('Activate Substation Transformer 2 bus-tie breaker before load commissioning.');
    }

    if (coolingPercent > 85) {
      bottlenecks.push(`Zone A In-Row Cooling Reserve (${coolingPercent}% cooling load)`);
      detailedRecommendations.push('Increase CRAC-01 chilled water flow setpoint from 340 LPM to 420 LPM.');
    }

    return {
      rackCapacityPercent,
      powerPercent,
      coolingPercent,
      cpuPercent,
      networkPercent,
      upsLoadPercent,
      pduLoadPercent,
      availableSpaceU,
      totalFacilityPowerKw: newFacilityPowerKw,
      addedPowerKw: +deltaServerPowerKw.toFixed(1),
      projectedPue,
      riskLevel,
      decisionBadge,
      decisionSummary,
      recommendation,
      detailedRecommendations,
      bottlenecks,
      baseline: {
        rackCapacityPercent: Math.round((baseRackUUsed / 42) * 100),
        powerPercent: Math.round((baseFacilityPowerKw / 1100) * 100),
        coolingPercent: Math.round((baseCoolingKw / 280) * 100),
        cpuPercent: Math.round(baseCpuPercent),
        upsLoadPercent: Math.round(baseUpsLoadPercent),
        pduLoadPercent: Math.round(basePduPercent),
        availableSpaceU: 42 - baseRackUUsed,
      },
      isSandboxOnly: true,
    };
  }
}
