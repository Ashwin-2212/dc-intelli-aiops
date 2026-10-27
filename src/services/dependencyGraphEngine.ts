import {
  DependencyGraphNode,
  DependencyGraphEdge,
  FailureImpactResult,
  DependencyNodeType,
} from '../types';

export class DependencyGraphEngine {
  private static instance: DependencyGraphEngine;

  public nodes: DependencyGraphNode[] = [];
  public edges: DependencyGraphEdge[] = [];

  private constructor() {
    this.buildGraph();
  }

  public static getInstance(): DependencyGraphEngine {
    if (!DependencyGraphEngine.instance) {
      DependencyGraphEngine.instance = new DependencyGraphEngine();
    }
    return DependencyGraphEngine.instance;
  }

  private buildGraph() {
    // Level 5: Grid Power Systems
    const powerSystem: DependencyGraphNode = {
      id: 'POWER-SYS-01',
      name: 'Utility Substation Grid Feed (115kV/480V Dual Bus)',
      type: 'power_system',
      layer: 5,
      status: 'healthy',
      load: '642 kW (64.2% Capacity)',
      metrics: { voltageV: 480, freqHz: 60.0, powerFactor: 0.98 },
      parentIds: [],
      childIds: ['UPS-01', 'UPS-02'],
    };

    // Level 4: Central UPS Trains
    const ups01: DependencyGraphNode = {
      id: 'UPS-01',
      name: 'UPS-01 (Liebert EXL 500kVA N+1)',
      type: 'ups',
      layer: 4,
      status: 'healthy',
      load: '312 kW (62.4% Load)',
      metrics: { batterySoh: '94%', reserveMinutes: 28, inputV: 480, outputV: 208 },
      parentIds: ['POWER-SYS-01'],
      childIds: ['PDU-05', 'PDU-01', 'PDU-02'],
    };

    const ups02: DependencyGraphNode = {
      id: 'UPS-02',
      name: 'UPS-02 (Liebert EXL 500kVA N+1)',
      type: 'ups',
      layer: 4,
      status: 'warning',
      load: '330 kW (66.0% Load)',
      metrics: { batterySoh: '86%', reserveMinutes: 22, inputV: 480, outputV: 208 },
      parentIds: ['POWER-SYS-01'],
      childIds: ['PDU-03', 'PDU-04'],
    };

    // Level 3: Floor PDUs & Cooling Zones
    const pdu05: DependencyGraphNode = {
      id: 'PDU-05',
      name: 'PDU-05 (Row-02 Zone B Primary Power Distribution)',
      type: 'pdu',
      layer: 3,
      status: 'healthy',
      load: '74.2 kW (74.2% Rated)',
      metrics: { breakerStatus: 'Closed', phaseCurrentA: 206, neutralCurrentA: 24 },
      parentIds: ['UPS-01'],
      childIds: ['RACK-05', 'RACK-06'],
    };

    const pdu01: DependencyGraphNode = {
      id: 'PDU-01',
      name: 'PDU-01 (Row-01 Zone A Power Distribution)',
      type: 'pdu',
      layer: 3,
      status: 'healthy',
      load: '68.0 kW (68.0% Rated)',
      metrics: { breakerStatus: 'Closed', phaseCurrentA: 188, neutralCurrentA: 18 },
      parentIds: ['UPS-01'],
      childIds: ['RACK-01', 'RACK-02'],
    };

    const coolingZoneB: DependencyGraphNode = {
      id: 'COOLING-ZONE-B',
      name: 'Cooling Zone B (CRAC-03 & CRAH-04 Containment Pod)',
      type: 'cooling_zone',
      layer: 3,
      status: 'warning',
      load: '84 kW Heat Dissipation',
      metrics: { supplyTempC: 19.2, returnTempC: 32.5, cfmAirflow: 18400, damperState: 'Throttled 65%' },
      parentIds: [],
      childIds: ['RACK-05', 'RACK-07'],
    };

    const coolingZoneA: DependencyGraphNode = {
      id: 'COOLING-ZONE-A',
      name: 'Cooling Zone A (CRAC-01 & CRAC-02 Cold Aisle)',
      type: 'cooling_zone',
      layer: 3,
      status: 'healthy',
      load: '92 kW Heat Dissipation',
      metrics: { supplyTempC: 18.5, returnTempC: 30.1, cfmAirflow: 22000, damperState: 'Optimal 100%' },
      parentIds: [],
      childIds: ['RACK-01', 'RACK-02', 'RACK-03', 'RACK-04'],
    };

    // Level 2: Racks
    const rack05: DependencyGraphNode = {
      id: 'RACK-05',
      name: 'Rack RACK-05 (Compute Tier Pod 2)',
      type: 'rack',
      layer: 2,
      status: 'healthy',
      load: '12.1 kW',
      metrics: { inletTempC: 27.2, outletTempC: 35.4, ruOccupied: '36/42U', serversInstalled: 12 },
      parentIds: ['PDU-05', 'COOLING-ZONE-B'],
      childIds: ['SERVER-001', 'SERVER-004', 'SERVER-005', 'SERVER-006'],
    };

    const rack01: DependencyGraphNode = {
      id: 'RACK-01',
      name: 'Rack RACK-01 (Row-01 Web Tier)',
      type: 'rack',
      layer: 2,
      status: 'healthy',
      load: '9.8 kW',
      metrics: { inletTempC: 22.4, outletTempC: 31.8, ruOccupied: '32/42U', serversInstalled: 10 },
      parentIds: ['PDU-01', 'COOLING-ZONE-A'],
      childIds: ['SERVER-002', 'SERVER-003'],
    };

    const rack07: DependencyGraphNode = {
      id: 'RACK-07',
      name: 'Rack RACK-07 (Row-02 Database Tier - Hotspot)',
      type: 'rack',
      layer: 2,
      status: 'critical',
      load: '13.8 kW',
      metrics: { inletTempC: 29.0, outletTempC: 37.2, ruOccupied: '38/42U', serversInstalled: 14 },
      parentIds: ['PDU-05', 'COOLING-ZONE-B'],
      childIds: ['SERVER-007', 'SERVER-008'],
    };

    // Level 1: Servers
    const server001: DependencyGraphNode = {
      id: 'SERVER-001',
      name: 'Server-001 (Core Application Compute Node)',
      type: 'server',
      layer: 1,
      status: 'healthy',
      load: '320W | 55% CPU',
      metrics: { cpuUsage: 55, cpuTempC: 58, powerWatts: 320, fanSpeedPercent: 40, status: 'OK' },
      parentIds: ['RACK-05'],
      childIds: [],
    };

    const server004: DependencyGraphNode = {
      id: 'SERVER-004',
      name: 'Server-004 (Analytics Worker - Fan Instability)',
      type: 'server',
      layer: 1,
      status: 'warning',
      load: '410W | 74% CPU',
      metrics: { cpuUsage: 74, cpuTempC: 72, powerWatts: 410, fanSpeedPercent: 88, status: 'Degraded' },
      parentIds: ['RACK-05'],
      childIds: [],
    };

    const server007: DependencyGraphNode = {
      id: 'SERVER-007',
      name: 'Server-007 (Oracle RAC Database Master)',
      type: 'server',
      layer: 1,
      status: 'critical',
      load: '1150W | 84% CPU',
      metrics: { cpuUsage: 84, cpuTempC: 76.4, powerWatts: 1150, fanSpeedPercent: 95, status: 'Thermal Stress' },
      parentIds: ['RACK-07'],
      childIds: [],
    };

    this.nodes = [
      powerSystem,
      ups01,
      ups02,
      pdu05,
      pdu01,
      coolingZoneB,
      coolingZoneA,
      rack05,
      rack01,
      rack07,
      server001,
      server004,
      server007,
    ];

    // Build Edges
    this.edges = [
      // Power Hierarchy: SERVER-001 -> RACK-05 -> PDU-05 -> UPS-01 -> POWER SYSTEM
      { id: 'E-S01-R05', source: 'SERVER-001', target: 'RACK-05', type: 'power', label: '120V Feed' },
      { id: 'E-S04-R05', source: 'SERVER-004', target: 'RACK-05', type: 'power', label: '120V Feed' },
      { id: 'E-R05-P05', source: 'RACK-05', target: 'PDU-05', type: 'power', label: '208V 3-Phase Whip' },
      { id: 'E-P05-U01', source: 'PDU-05', target: 'UPS-01', type: 'power', label: '480V Subfeed A' },
      { id: 'E-U01-PS', source: 'UPS-01', target: 'POWER-SYS-01', type: 'power', label: 'Utility Bus A' },

      // Cooling Hierarchy: SERVER -> RACK -> COOLING ZONE
      { id: 'E-R05-CZB', source: 'RACK-05', target: 'COOLING-ZONE-B', type: 'cooling', label: 'Airflow Containment' },
      { id: 'E-R07-CZB', source: 'RACK-07', target: 'COOLING-ZONE-B', type: 'cooling', label: 'Airflow Containment' },
      { id: 'E-S07-R07', source: 'SERVER-007', target: 'RACK-07', type: 'power', label: '208V Dual Whip' },
      { id: 'E-R07-P05', source: 'RACK-07', target: 'PDU-05', type: 'power', label: '208V 3-Phase Whip' },

      // Row-01 Power & Cooling
      { id: 'E-R01-P01', source: 'RACK-01', target: 'PDU-01', type: 'power', label: '208V Whip' },
      { id: 'E-P01-U01', source: 'PDU-01', target: 'UPS-01', type: 'power', label: '480V Subfeed B' },
      { id: 'E-R01-CZA', source: 'RACK-01', target: 'COOLING-ZONE-A', type: 'cooling', label: 'Airflow Containment' },
      { id: 'E-U02-PS', source: 'UPS-02', target: 'POWER-SYS-01', type: 'power', label: 'Utility Bus B' },
    ];
  }

  // Feature 17 — Failure Impact Analysis Engine
  public simulateFailureImpact(nodeId: string): FailureImpactResult {
    const target = this.nodes.find((n) => n.id === nodeId) || this.nodes[1]; // default UPS-01

    if (target.id === 'UPS-01') {
      // Canonical Example: UPS-01 Failure -> 12 servers, 2 racks, 1 cooling zone -> HIGH Impact
      return {
        failedComponent: 'UPS-01 (Liebert EXL 500kVA N+1)',
        componentType: 'ups',
        directDependenciesCount: 3, // PDU-05, PDU-01, PDU-02
        indirectDependenciesCount: 15,
        affectedServersCount: 12,
        affectedRacksCount: 2,
        affectedCoolingZonesCount: 1,
        impactLevel: 'HIGH',
        affectedServers: [
          'SERVER-001 (Core Compute)',
          'SERVER-002 (Web Front)',
          'SERVER-003 (Worker Array)',
          'SERVER-004 (Analytics)',
          'SERVER-005 (Storage API)',
          'SERVER-006 (Redis Cluster)',
          'SERVER-007 (Oracle RAC DB)',
          'SERVER-008 (DB Replica)',
          'SERVER-009 (Kafka Broker 1)',
          'SERVER-010 (Kafka Broker 2)',
          'SERVER-011 (Ingress GW)',
          'SERVER-012 (Monitoring Agent)',
        ],
        affectedRacks: ['RACK-05 (Zone B)', 'RACK-01 (Zone A)'],
        affectedCoolingZones: ['COOLING-ZONE-B (Chilled Water Loop B)'],
        powerLoadLostKw: 312.0,
        recommendation:
          'Automatic Static Transfer Switch (STS) should seamlessly transfer critical loads to UPS-02 Train B within 4ms. Dispatch field technician to inspect inverter SCR diode assembly.',
      };
    }

    if (target.id === 'COOLING-ZONE-B') {
      return {
        failedComponent: 'Cooling Zone B (CRAC-03 & CRAH-04)',
        componentType: 'cooling_zone',
        directDependenciesCount: 2,
        indirectDependenciesCount: 14,
        affectedServersCount: 14,
        affectedRacksCount: 2,
        affectedCoolingZonesCount: 1,
        impactLevel: 'HIGH',
        affectedServers: ['SERVER-001', 'SERVER-004', 'SERVER-007', 'SERVER-008'],
        affectedRacks: ['RACK-05', 'RACK-07'],
        affectedCoolingZones: ['COOLING-ZONE-B'],
        powerLoadLostKw: 84.0,
        recommendation:
          'Engage CRAC-01 backup booster plenum fan and throttle non-critical database batch jobs to avoid thermal trip.',
      };
    }

    if (target.id === 'RACK-05') {
      return {
        failedComponent: 'Rack RACK-05 (Compute Pod)',
        componentType: 'rack',
        directDependenciesCount: 4,
        indirectDependenciesCount: 8,
        affectedServersCount: 4,
        affectedRacksCount: 1,
        affectedCoolingZonesCount: 0,
        impactLevel: 'MEDIUM',
        affectedServers: ['SERVER-001', 'SERVER-004', 'SERVER-005', 'SERVER-006'],
        affectedRacks: ['RACK-05'],
        affectedCoolingZones: [],
        powerLoadLostKw: 12.1,
        recommendation:
          'Migrate active container workloads to Rack RACK-02 and verify branch breaker PDU-05 Breaker #8.',
      };
    }

    // Generic fallback impact calculation
    return {
      failedComponent: target.name,
      componentType: target.type,
      directDependenciesCount: target.childIds.length,
      indirectDependenciesCount: target.childIds.length * 2,
      affectedServersCount: target.type === 'server' ? 1 : 4,
      affectedRacksCount: target.type === 'rack' ? 1 : 0,
      affectedCoolingZonesCount: target.type === 'cooling_zone' ? 1 : 0,
      impactLevel: target.layer >= 4 ? 'HIGH' : target.layer >= 2 ? 'MEDIUM' : 'LOW',
      affectedServers: target.type === 'server' ? [target.name] : ['SERVER-001', 'SERVER-004'],
      affectedRacks: target.type === 'rack' ? [target.id] : ['RACK-05'],
      affectedCoolingZones: [],
      powerLoadLostKw: 4.5,
      recommendation: `Isolate ${target.name} and re-route upstream dependencies through redundant bypass path.`,
    };
  }
}
