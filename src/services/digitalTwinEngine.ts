import { DigitalTwinNode } from '../types';

export class DigitalTwinEngine {
  private static instance: DigitalTwinEngine;
  public treeRoot: DigitalTwinNode;

  private constructor() {
    this.treeRoot = this.buildLogicalHierarchy();
  }

  public static getInstance(): DigitalTwinEngine {
    if (!DigitalTwinEngine.instance) {
      DigitalTwinEngine.instance = new DigitalTwinEngine();
    }
    return DigitalTwinEngine.instance;
  }

  private buildLogicalHierarchy(): DigitalTwinNode {
    // Level 7: Components
    const createCpuComponent = (serverName: string, id: string): DigitalTwinNode => ({
      id: `${id}-CPU-0`,
      name: `Intel Xeon Platinum 8480+ (Die 0)`,
      type: 'component',
      level: 7,
      path: `DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / ${serverName} / CPU-0`,
      deviceState: 'online',
      health: 98,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        uPosition: 12,
      },
      capacity: {
        total: 56,
        used: 41,
        unit: 'Cores',
        utilizationPercent: 73.2,
      },
      power: {
        currentKw: 0.35,
        ratedKw: 0.35,
        powerFactor: 0.98,
      },
      temperature: {
        currentC: 64.5,
        baselineC: 55.0,
        deltaC: 9.5,
        sensorLocation: 'die',
      },
      incidents: {
        activeCount: 0,
        criticalCount: 0,
        incidentIds: [],
        summary: 'Die operating within nominal TJunction limits',
      },
      relationships: {
        upstreamPowerSource: 'Server VRM Rail 12V',
        upstreamCoolingUnit: 'Chassis Dual Heatpipe Heatsink',
        connectedPeersCount: 2,
        dependencyRole: 'Primary Compute Silicon',
      },
      specs: {
        cores: 56,
        threads: 112,
        baseClockGhz: 2.0,
        boostClockGhz: 3.8,
        tdpWatts: 350,
      },
    });

    const createMemoryComponent = (serverName: string, id: string): DigitalTwinNode => ({
      id: `${id}-MEM-BANK-A`,
      name: `DDR5 ECC Reg Bank A (512 GB)`,
      type: 'component',
      level: 7,
      path: `DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / ${serverName} / MEM-A`,
      deviceState: 'online',
      health: 100,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        uPosition: 12,
      },
      capacity: {
        total: 512,
        used: 348,
        unit: 'GB',
        utilizationPercent: 67.9,
      },
      power: {
        currentKw: 0.08,
        ratedKw: 0.12,
      },
      temperature: {
        currentC: 46.2,
        baselineC: 42.0,
        deltaC: 4.2,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 0,
        criticalCount: 0,
        incidentIds: [],
      },
      relationships: {
        upstreamPowerSource: 'Mainboard 1.1V VDD Rail',
        upstreamCoolingUnit: 'Chassis Blower CFM Duct',
        connectedPeersCount: 16,
        dependencyRole: 'System Memory Pool',
      },
    });

    const createFanComponent = (serverName: string, id: string, degraded = false): DigitalTwinNode => ({
      id: `${id}-FAN-TRAY-1`,
      name: `Delta High-Static Pressure Fan Tray (Zone 1)`,
      type: 'component',
      level: 7,
      path: `DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / ${serverName} / FAN-1`,
      deviceState: degraded ? 'warning' : 'online',
      health: degraded ? 62 : 95,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        uPosition: 12,
      },
      capacity: {
        total: 16000,
        used: degraded ? 14800 : 10200,
        unit: 'RPM',
        utilizationPercent: degraded ? 92.5 : 63.7,
      },
      power: {
        currentKw: 0.04,
        ratedKw: 0.05,
      },
      temperature: {
        currentC: 38.0,
        baselineC: 35.0,
        deltaC: 3.0,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: degraded ? 1 : 0,
        criticalCount: 0,
        incidentIds: degraded ? ['INC-FAN-TACH-FLUX'] : [],
        summary: degraded ? 'Tachometer pulse jitter detected (+-350 RPM)' : 'Operating within vibration tolerance',
      },
      relationships: {
        upstreamPowerSource: 'Chassis Backplane 12V',
        upstreamCoolingUnit: 'Direct Airflow Induction',
        connectedPeersCount: 4,
        dependencyRole: 'Chassis Thermal Evacuation',
      },
    });

    // Level 6: Devices (e.g. Server-001, Server-002)
    const server001: DigitalTwinNode = {
      id: 'SRV-001',
      name: 'Server-001 (Dell PowerEdge R760)',
      type: 'device',
      level: 6,
      path: 'DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / Server-001',
      deviceState: 'warning',
      health: 78,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        uPosition: 12,
      },
      capacity: {
        total: 100,
        used: 82,
        unit: '% Workload',
        utilizationPercent: 82,
      },
      power: {
        currentKw: 0.78,
        ratedKw: 1.1,
        powerFactor: 0.97,
      },
      temperature: {
        currentC: 78.4,
        baselineC: 62.0,
        deltaC: 16.4,
        sensorLocation: 'die',
      },
      incidents: {
        activeCount: 1,
        criticalCount: 0,
        incidentIds: ['INC-THM-882'],
        summary: 'Compound Thermal Stress: CPU Die elevated under batch job load',
      },
      relationships: {
        upstreamPowerSource: 'Rack-01 PDU-A Feed (Outlet #12)',
        upstreamCoolingUnit: 'CRAC-01 (Zone A Cold Aisle)',
        networkSwitchId: 'TOR-SW-01',
        connectedPeersCount: 24,
        dependencyRole: 'Core In-Memory Cache Node',
      },
      specs: {
        formFactor: '2U Rackmount',
        sockets: 2,
        ramInstalledGb: 512,
        powerSupplies: 'Dual 1400W Platinum Redundant',
        ipAddress: '10.240.12.101',
      },
      children: [
        createCpuComponent('Server-001', 'SRV-001'),
        createMemoryComponent('Server-001', 'SRV-001'),
        createFanComponent('Server-001', 'SRV-001', true),
      ],
    };

    const server002: DigitalTwinNode = {
      id: 'SRV-002',
      name: 'Server-002 (Dell PowerEdge R760)',
      type: 'device',
      level: 6,
      path: 'DC-01 / Building-01 / Room-A / Row-01 / Rack-01 / Server-002',
      deviceState: 'online',
      health: 96,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        uPosition: 14,
      },
      capacity: {
        total: 100,
        used: 48,
        unit: '% Workload',
        utilizationPercent: 48,
      },
      power: {
        currentKw: 0.52,
        ratedKw: 1.1,
        powerFactor: 0.99,
      },
      temperature: {
        currentC: 56.1,
        baselineC: 55.0,
        deltaC: 1.1,
        sensorLocation: 'die',
      },
      incidents: {
        activeCount: 0,
        criticalCount: 0,
        incidentIds: [],
        summary: 'Operating with optimal thermal headroom',
      },
      relationships: {
        upstreamPowerSource: 'Rack-01 PDU-A Feed (Outlet #14)',
        upstreamCoolingUnit: 'CRAC-01 (Zone A Cold Aisle)',
        networkSwitchId: 'TOR-SW-01',
        connectedPeersCount: 24,
        dependencyRole: 'Secondary Standby Cache Node',
      },
      specs: {
        formFactor: '2U Rackmount',
        sockets: 2,
        ramInstalledGb: 512,
        ipAddress: '10.240.12.102',
      },
      children: [
        createCpuComponent('Server-002', 'SRV-002'),
        createMemoryComponent('Server-002', 'SRV-002'),
        createFanComponent('Server-002', 'SRV-002', false),
      ],
    };

    const server003: DigitalTwinNode = {
      id: 'SRV-003',
      name: 'Server-003 (HPE ProLiant DL380 Gen11)',
      type: 'device',
      level: 6,
      path: 'DC-01 / Building-01 / Room-A / Row-01 / Rack-02 / Server-003',
      deviceState: 'online',
      health: 94,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-02',
        uPosition: 8,
      },
      capacity: {
        total: 100,
        used: 61,
        unit: '% Workload',
        utilizationPercent: 61,
      },
      power: {
        currentKw: 0.64,
        ratedKw: 1.2,
      },
      temperature: {
        currentC: 59.8,
        baselineC: 58.0,
        deltaC: 1.8,
        sensorLocation: 'die',
      },
      incidents: {
        activeCount: 0,
        criticalCount: 0,
        incidentIds: [],
      },
      relationships: {
        upstreamPowerSource: 'Rack-02 PDU-B Feed',
        upstreamCoolingUnit: 'CRAC-01 (Zone A)',
        networkSwitchId: 'TOR-SW-02',
        connectedPeersCount: 18,
        dependencyRole: 'Compute Worker Pool',
      },
      children: [
        createCpuComponent('Server-003', 'SRV-003'),
        createMemoryComponent('Server-003', 'SRV-003'),
        createFanComponent('Server-003', 'SRV-003', false),
      ],
    };

    // Level 5: Racks (Rack-01, Rack-02, Rack-07)
    const rack01: DigitalTwinNode = {
      id: 'RACK-01',
      name: 'Rack-01 (Row-01 Position 1)',
      type: 'rack',
      level: 5,
      path: 'DC-01 / Building-01 / Room-A / Row-01 / Rack-01',
      deviceState: 'warning',
      health: 84,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-01',
        roomCoordinates: { x: 12, y: 34 },
      },
      capacity: {
        total: 42,
        used: 32,
        unit: 'U Space',
        utilizationPercent: 76.2,
      },
      power: {
        currentKw: 9.8,
        ratedKw: 15.0,
        powerFactor: 0.98,
      },
      temperature: {
        currentC: 25.2,
        baselineC: 21.0,
        deltaC: 4.2,
        sensorLocation: 'inlet',
      },
      incidents: {
        activeCount: 1,
        criticalCount: 0,
        incidentIds: ['INC-THM-882'],
        summary: 'Elevated outlet temperature on upper RU 30-42',
      },
      relationships: {
        upstreamPowerSource: 'UPS-01 Train A / Floor PDU-1A',
        upstreamCoolingUnit: 'CRAC-01 (Cold Aisle Containment Pod 1)',
        networkSwitchId: 'TOR-SW-01 (Dual 100GbE Uplink)',
        connectedPeersCount: 16,
        dependencyRole: 'Core High-Density Compute Rack',
      },
      children: [server001, server002],
    };

    const rack02: DigitalTwinNode = {
      id: 'RACK-02',
      name: 'Rack-02 (Row-01 Position 2)',
      type: 'rack',
      level: 5,
      path: 'DC-01 / Building-01 / Room-A / Row-01 / Rack-02',
      deviceState: 'online',
      health: 95,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
        rack: 'Rack-02',
        roomCoordinates: { x: 16, y: 34 },
      },
      capacity: {
        total: 42,
        used: 28,
        unit: 'U Space',
        utilizationPercent: 66.7,
      },
      power: {
        currentKw: 8.4,
        ratedKw: 15.0,
        powerFactor: 0.99,
      },
      temperature: {
        currentC: 22.8,
        baselineC: 21.0,
        deltaC: 1.8,
        sensorLocation: 'inlet',
      },
      incidents: {
        activeCount: 0,
        criticalCount: 0,
        incidentIds: [],
        summary: 'Nominal airflow CFM balance',
      },
      relationships: {
        upstreamPowerSource: 'UPS-01 Train A / Floor PDU-1A',
        upstreamCoolingUnit: 'CRAC-01',
        networkSwitchId: 'TOR-SW-02',
        connectedPeersCount: 14,
        dependencyRole: 'Virtualization & Storage Rack',
      },
      children: [server003],
    };

    const rack07: DigitalTwinNode = {
      id: 'RACK-07',
      name: 'Rack-07 (Row-02 Database Tier)',
      type: 'rack',
      level: 5,
      path: 'DC-01 / Building-01 / Room-A / Row-02 / Rack-07',
      deviceState: 'critical',
      health: 68,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-02',
        rack: 'RACK-07',
        roomCoordinates: { x: 12, y: 68 },
      },
      capacity: {
        total: 42,
        used: 38,
        unit: 'U Space',
        utilizationPercent: 90.5,
      },
      power: {
        currentKw: 13.8,
        ratedKw: 15.0,
        powerFactor: 0.96,
      },
      temperature: {
        currentC: 29.0, // Exact prompt specification
        baselineC: 22.0,
        deltaC: 7.0,
        sensorLocation: 'inlet',
      },
      incidents: {
        activeCount: 2,
        criticalCount: 1,
        incidentIds: ['INC-THM-RACK-07-PRED', 'INC-PWR-NEAR-LIMIT'],
        summary: 'High Thermal Risk: Current 29°C -> Predicted 34°C in 25 min',
      },
      relationships: {
        upstreamPowerSource: 'UPS-02 Train B / Floor PDU-2B',
        upstreamCoolingUnit: 'CRAC-03 (Chilled Water Damper Throttled)',
        networkSwitchId: 'TOR-SW-07 (200GbE InfiniBand Fabric)',
        connectedPeersCount: 28,
        dependencyRole: 'Tier-1 Mission Critical Database Shard',
      },
      children: [
        {
          id: 'SRV-007-DB1',
          name: 'Server-007 (Oracle RAC Exadata Node 1)',
          type: 'device',
          level: 6,
          path: 'DC-01 / Building-01 / Room-A / Row-02 / Rack-07 / Server-007',
          deviceState: 'critical',
          health: 65,
          location: {
            dataCenter: 'DC-01',
            building: 'Building-01',
            room: 'Room-A',
            row: 'Row-02',
            rack: 'RACK-07',
            uPosition: 18,
          },
          capacity: {
            total: 100,
            used: 88,
            unit: '% IOPS Load',
            utilizationPercent: 88,
          },
          power: {
            currentKw: 1.15,
            ratedKw: 1.4,
          },
          temperature: {
            currentC: 76.4,
            baselineC: 58.0,
            deltaC: 18.4,
            sensorLocation: 'die',
          },
          incidents: {
            activeCount: 1,
            criticalCount: 1,
            incidentIds: ['INC-THM-RACK-07-PRED'],
            summary: 'High thermal throttling risk',
          },
          relationships: {
            upstreamPowerSource: 'Rack-07 Dual PDU-A/B',
            upstreamCoolingUnit: 'CRAC-03 (Zone B)',
            connectedPeersCount: 8,
            dependencyRole: 'Primary Database Master',
          },
          children: [
            createCpuComponent('Server-007', 'SRV-007'),
            createMemoryComponent('Server-007', 'SRV-007'),
            createFanComponent('Server-007', 'SRV-007', true),
          ],
        },
      ],
    };

    // Level 4: Rows (Row-01, Row-02)
    const row01: DigitalTwinNode = {
      id: 'ROW-01',
      name: 'Row-01 (Zone A Cold Aisle Containment)',
      type: 'row',
      level: 4,
      path: 'DC-01 / Building-01 / Room-A / Row-01',
      deviceState: 'online',
      health: 91,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-01',
      },
      capacity: {
        total: 12,
        used: 10,
        unit: 'Racks',
        utilizationPercent: 83.3,
      },
      power: {
        currentKw: 92.4,
        ratedKw: 150.0,
        powerFactor: 0.98,
      },
      temperature: {
        currentC: 23.4,
        baselineC: 21.0,
        deltaC: 2.4,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 1,
        criticalCount: 0,
        incidentIds: ['INC-THM-882'],
      },
      relationships: {
        upstreamPowerSource: 'Substation Busbar A / UPS-01',
        upstreamCoolingUnit: 'CRAC-01 & CRAC-02 Lead-Lag Pair',
        connectedPeersCount: 12,
        dependencyRole: 'General Purpose Compute Row',
      },
      children: [rack01, rack02],
    };

    const row02: DigitalTwinNode = {
      id: 'ROW-02',
      name: 'Row-02 (Zone B High-Density Database Row)',
      type: 'row',
      level: 4,
      path: 'DC-01 / Building-01 / Room-A / Row-02',
      deviceState: 'warning',
      health: 76,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'Row-02',
      },
      capacity: {
        total: 12,
        used: 11,
        unit: 'Racks',
        utilizationPercent: 91.6,
      },
      power: {
        currentKw: 124.6,
        ratedKw: 160.0,
        powerFactor: 0.96,
      },
      temperature: {
        currentC: 28.2,
        baselineC: 21.5,
        deltaC: 6.7,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 2,
        criticalCount: 1,
        incidentIds: ['INC-THM-RACK-07-PRED'],
        summary: 'Hotspot emergence in mid-row aisle corridor',
      },
      relationships: {
        upstreamPowerSource: 'Substation Busbar B / UPS-02',
        upstreamCoolingUnit: 'CRAC-03 & In-Row Chiller IR-01',
        connectedPeersCount: 12,
        dependencyRole: 'Mission Critical Storage & DB Row',
      },
      children: [rack07],
    };

    // Level 3: Room (Room-A)
    const roomA: DigitalTwinNode = {
      id: 'ROOM-A',
      name: 'Room-A (Primary Data Hall 1)',
      type: 'room',
      level: 3,
      path: 'DC-01 / Building-01 / Room-A',
      deviceState: 'online',
      health: 88,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Room-A',
        row: 'All Rows',
      },
      capacity: {
        total: 24,
        used: 21,
        unit: 'Rack Footprints',
        utilizationPercent: 87.5,
      },
      power: {
        currentKw: 217.0,
        ratedKw: 310.0,
        powerFactor: 0.97,
      },
      temperature: {
        currentC: 24.8,
        baselineC: 21.0,
        deltaC: 3.8,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 3,
        criticalCount: 1,
        incidentIds: ['INC-THM-882', 'INC-THM-RACK-07-PRED'],
      },
      relationships: {
        upstreamPowerSource: 'Main Switchgear MSB-01 (2N Redundant)',
        upstreamCoolingUnit: 'Central Chilled Water Loop (Chiller 1 & 2)',
        connectedPeersCount: 2,
        dependencyRole: 'Enterprise Production Data Hall',
      },
      children: [row01, row02],
    };

    // Level 2: Building (Building-01)
    const building01: DigitalTwinNode = {
      id: 'BLD-01',
      name: 'Building-01 (Alpha Core Complex)',
      type: 'building',
      level: 2,
      path: 'DC-01 / Building-01',
      deviceState: 'online',
      health: 92,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'All Halls',
        row: 'All Rows',
      },
      capacity: {
        total: 15000,
        used: 12200,
        unit: 'Sq Ft Floor Area',
        utilizationPercent: 81.3,
      },
      power: {
        currentKw: 480.0,
        ratedKw: 750.0,
        powerFactor: 0.98,
      },
      temperature: {
        currentC: 23.6,
        baselineC: 21.0,
        deltaC: 2.6,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 3,
        criticalCount: 1,
        incidentIds: ['INC-THM-882', 'INC-THM-RACK-07-PRED'],
      },
      relationships: {
        upstreamPowerSource: 'Utility High-Voltage Substation 33kV Feed',
        upstreamCoolingUnit: 'Rooftop Cooling Tower Plant (4x 250TR)',
        connectedPeersCount: 1,
        dependencyRole: 'Primary Tier III Facility Facility',
      },
      children: [roomA],
    };

    // Level 1: Data Center (DC-01)
    const dataCenter01: DigitalTwinNode = {
      id: 'DC-01',
      name: 'DC-01 (Ashburn Core Metro Campus)',
      type: 'data_center',
      level: 1,
      path: 'DC-01',
      deviceState: 'online',
      health: 93,
      location: {
        dataCenter: 'DC-01',
        building: 'Building-01',
        room: 'Metro Campus',
        row: 'Global',
      },
      capacity: {
        total: 1200,
        used: 890,
        unit: 'kW IT Capacity',
        utilizationPercent: 74.2,
      },
      power: {
        currentKw: 642.0,
        ratedKw: 1000.0,
        powerFactor: 0.98,
      },
      temperature: {
        currentC: 22.9,
        baselineC: 21.0,
        deltaC: 1.9,
        sensorLocation: 'ambient',
      },
      incidents: {
        activeCount: 3,
        criticalCount: 1,
        incidentIds: ['INC-THM-882', 'INC-THM-RACK-07-PRED'],
        summary: 'Operational with localized thermal attention on Zone B / Rack-07',
      },
      relationships: {
        upstreamPowerSource: 'Dominion Energy Dual 115kV Grid Interconnect',
        upstreamCoolingUnit: 'Closed-Loop Glycol Chiller Plant with Waterside Economizer',
        connectedPeersCount: 4,
        dependencyRole: 'Global Cloud Region Hub',
      },
      children: [building01],
    };

    return dataCenter01;
  }

  public findNodeById(id: string, current = this.treeRoot): DigitalTwinNode | null {
    if (current.id === id) return current;
    if (current.children) {
      for (const child of current.children) {
        const found = this.findNodeById(id, child);
        if (found) return found;
      }
    }
    return null;
  }

  public searchNodes(query: string, current = this.treeRoot): DigitalTwinNode[] {
    const results: DigitalTwinNode[] = [];
    const q = query.toLowerCase();
    const searchRecursive = (node: DigitalTwinNode) => {
      if (
        node.id.toLowerCase().includes(q) ||
        node.name.toLowerCase().includes(q) ||
        node.type.toLowerCase().includes(q) ||
        node.path.toLowerCase().includes(q)
      ) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(searchRecursive);
      }
    };
    searchRecursive(current);
    return results;
  }
}
