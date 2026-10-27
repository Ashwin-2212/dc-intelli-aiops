export interface TopologyNode {
  id: string;
  label: string;
  type: 'facility' | 'zone' | 'row' | 'rack' | 'cooling' | 'ups' | 'pdu' | 'server' | 'chiller';
  status: 'healthy' | 'warning' | 'critical' | 'degraded';
  powerKw?: number;
  tempCelsius?: number;
  metadata?: Record<string, any>;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  relation: 'CONTAINS' | 'COOLS' | 'POWERS' | 'ROUTES_AIR_TO' | 'NETWORK_UPLINK';
  weight?: number;
}

export class TopologyGraphEngine {
  private static instance: TopologyGraphEngine;
  private nodes: Map<string, TopologyNode> = new Map();
  private edges: Map<string, TopologyEdge> = new Map();

  private constructor() {
    this.seedDefaultTopology();
  }

  public static getInstance(): TopologyGraphEngine {
    if (!TopologyGraphEngine.instance) {
      TopologyGraphEngine.instance = new TopologyGraphEngine();
    }
    return TopologyGraphEngine.instance;
  }

  private seedDefaultTopology(): void {
    // Facility
    this.addNode({ id: 'dc-va-01', label: 'Alpha Core DC-1 (Ashburn)', type: 'facility', status: 'healthy', powerKw: 842.5 });

    // Zones
    this.addNode({ id: 'zone-a', label: 'Zone A (High-Density Compute)', type: 'zone', status: 'critical' });
    this.addNode({ id: 'zone-b', label: 'Zone B (Database & Storage)', type: 'zone', status: 'healthy' });
    this.addNode({ id: 'zone-c', label: 'Zone C (AI Training)', type: 'zone', status: 'warning' });

    this.addEdge('dc-va-01', 'zone-a', 'CONTAINS');
    this.addEdge('dc-va-01', 'zone-b', 'CONTAINS');
    this.addEdge('dc-va-01', 'zone-c', 'CONTAINS');

    // Cooling Units
    this.addNode({ id: 'CRAC-01', label: 'CRAC-01 (Zone A DX)', type: 'cooling', status: 'healthy', powerKw: 42.5 });
    this.addNode({ id: 'CRAC-02', label: 'CRAC-02 (Zone A/B In-Row)', type: 'cooling', status: 'critical', powerKw: 72.0, tempCelsius: 37.0 });
    this.addNode({ id: 'CRAC-03', label: 'CRAC-03 (Zone B CRAH)', type: 'cooling', status: 'healthy', powerKw: 38.0 });
    this.addNode({ id: 'CRAC-04', label: 'CRAC-04 (Zone C CRAH)', type: 'cooling', status: 'healthy', powerKw: 46.5 });

    // UPS Systems
    this.addNode({ id: 'UPS-01', label: 'UPS-01 (Bus A)', type: 'ups', status: 'healthy', powerKw: 245.0 });
    this.addNode({ id: 'UPS-02', label: 'UPS-02 (Bus B)', type: 'ups', status: 'healthy', powerKw: 280.0 });
    this.addNode({ id: 'UPS-03', label: 'UPS-03 (Zone C High-Density)', type: 'ups', status: 'warning', powerKw: 232.0 });

    // Racks & Cooling Relationships
    for (let i = 1; i <= 12; i++) {
      const rackId = `R-${String(i).padStart(2, '0')}`;
      const isCritical = rackId === 'R-04' || rackId === 'R-05';
      const zoneId = i <= 4 ? 'zone-a' : i <= 8 ? 'zone-b' : 'zone-c';

      this.addNode({
        id: rackId,
        label: `Rack ${rackId}`,
        type: 'rack',
        status: isCritical ? 'critical' : 'healthy',
        powerKw: isCritical ? 13.8 : 9.5,
        tempCelsius: isCritical ? 33.8 : 22.4,
      });

      this.addEdge(zoneId, rackId, 'CONTAINS');

      // Cooling edges
      if (i <= 3) {
        this.addEdge('CRAC-01', rackId, 'COOLS');
      } else if (i <= 6) {
        this.addEdge('CRAC-02', rackId, 'COOLS');
      } else if (i <= 9) {
        this.addEdge('CRAC-03', rackId, 'COOLS');
      } else {
        this.addEdge('CRAC-04', rackId, 'COOLS');
      }

      // Power edges (A/B feeds)
      if (i % 2 === 1) {
        this.addEdge('UPS-01', rackId, 'POWERS');
      } else {
        this.addEdge('UPS-02', rackId, 'POWERS');
      }
      if (i >= 9) {
        this.addEdge('UPS-03', rackId, 'POWERS');
      }

      // Add servers inside critical racks
      if (isCritical) {
        for (let s = 1; s <= 4; s++) {
          const srvId = `SRV-${rackId}-${String(s).padStart(2, '0')}`;
          const isServerFault = rackId === 'R-04' && s === 2;
          this.addNode({
            id: srvId,
            label: `Compute Node #${s} (${rackId})`,
            type: 'server',
            status: isServerFault ? 'critical' : isCritical ? 'warning' : 'healthy',
            powerKw: isServerFault ? 0.745 : 0.42,
            tempCelsius: isServerFault ? 82.5 : 55.0,
          });
          this.addEdge(rackId, srvId, 'CONTAINS');
        }
      }
    }
  }

  public addNode(node: TopologyNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(source: string, target: string, relation: TopologyEdge['relation'], weight: number = 1): void {
    const id = `${source}->${target}:${relation}`;
    this.edges.set(id, { id, source, target, relation, weight });
  }

  public getNode(id: string): TopologyNode | undefined {
    return this.nodes.get(id);
  }

  public getUpstreamCooling(rackId: string): TopologyNode[] {
    const coolingNodes: TopologyNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.target === rackId && edge.relation === 'COOLS') {
        const node = this.nodes.get(edge.source);
        if (node) coolingNodes.push(node);
      }
    }
    return coolingNodes;
  }

  public getUpstreamPower(rackId: string): TopologyNode[] {
    const powerNodes: TopologyNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.target === rackId && edge.relation === 'POWERS') {
        const node = this.nodes.get(edge.source);
        if (node) powerNodes.push(node);
      }
    }
    return powerNodes;
  }

  public getDownstreamServers(rackId: string): TopologyNode[] {
    const servers: TopologyNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.source === rackId && edge.relation === 'CONTAINS') {
        const node = this.nodes.get(edge.target);
        if (node && node.type === 'server') servers.push(node);
      }
    }
    return servers;
  }

  public calculateBlastRadius(deviceId: string): {
    sourceNode: TopologyNode | undefined;
    affectedRacks: string[];
    affectedServersCount: number;
    totalPowerAtRiskKw: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    cascadePath: string[];
  } {
    const sourceNode = this.nodes.get(deviceId);
    const affectedRacks: string[] = [];
    let affectedServersCount = 0;
    let totalPowerAtRiskKw = 0;
    const cascadePath: string[] = [sourceNode ? `${sourceNode.label} [${sourceNode.type.toUpperCase()}]` : deviceId];

    if (sourceNode?.type === 'cooling') {
      // Find all racks cooled by this unit
      for (const edge of this.edges.values()) {
        if (edge.source === deviceId && edge.relation === 'COOLS') {
          affectedRacks.push(edge.target);
          const rackNode = this.nodes.get(edge.target);
          if (rackNode) {
            totalPowerAtRiskKw += rackNode.powerKw || 10;
            // Each rack has ~14 servers
            const srvs = this.getDownstreamServers(edge.target);
            affectedServersCount += srvs.length > 0 ? srvs.length : 14;
          }
        }
      }
      cascadePath.push(`Cold Aisle airflow pressure loss across [${affectedRacks.join(', ')}]`);
      cascadePath.push(`Inlet temperature breach (>27°C ASHRAE TC 9.9 recommended ceiling)`);
      cascadePath.push(`Server processor thermal throttling & thread execution stall`);
    } else if (sourceNode?.type === 'ups') {
      // Find all racks powered by this UPS
      for (const edge of this.edges.values()) {
        if (edge.source === deviceId && edge.relation === 'POWERS') {
          affectedRacks.push(edge.target);
          const rackNode = this.nodes.get(edge.target);
          if (rackNode) {
            totalPowerAtRiskKw += rackNode.powerKw || 10;
            affectedServersCount += 14;
          }
        }
      }
      cascadePath.push(`Loss of Redundant Bus Feed on [${affectedRacks.join(', ')}]`);
      cascadePath.push(`Single Point of Failure (SPOF) risk if secondary bus trips`);
    } else if (sourceNode?.type === 'rack') {
      affectedRacks.push(deviceId);
      const srvs = this.getDownstreamServers(deviceId);
      affectedServersCount = srvs.length > 0 ? srvs.length : 14;
      totalPowerAtRiskKw = sourceNode.powerKw || 12;
      cascadePath.push(`Rack local PDU & thermal microclimate degradation`);
    }

    const riskLevel =
      affectedRacks.length >= 3 || totalPowerAtRiskKw > 30 ? 'CRITICAL' : affectedRacks.length >= 1 ? 'HIGH' : 'LOW';

    return {
      sourceNode,
      affectedRacks,
      affectedServersCount,
      totalPowerAtRiskKw: +totalPowerAtRiskKw.toFixed(1),
      riskLevel,
      cascadePath,
    };
  }

  public getGraphData(): { nodes: TopologyNode[]; edges: TopologyEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
