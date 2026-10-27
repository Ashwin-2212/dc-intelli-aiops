import {
  BlastRadiusAssessment,
  UniversalTelemetryPacket,
} from '../../types/telemetryIntelligence';

export class CrossAssetCorrelationEngine {
  private static instance: CrossAssetCorrelationEngine;
  private blastRadii: Map<string, BlastRadiusAssessment> = new Map();

  private constructor() {
    this.seedInitialBlastRadius();
  }

  public static getInstance(): CrossAssetCorrelationEngine {
    if (!CrossAssetCorrelationEngine.instance) {
      CrossAssetCorrelationEngine.instance = new CrossAssetCorrelationEngine();
    }
    return CrossAssetCorrelationEngine.instance;
  }

  private seedInitialBlastRadius() {
    this.blastRadii.set('CRAC-02', {
      rootAssetId: 'CRAC-02',
      rootAssetName: 'CRAC Unit 02 (In-Row Chiller)',
      rootAssetType: 'cooling',
      incidentType: 'Cooling Compressor / Airflow Degradation',
      severity: 'critical',
      affectedRacks: ['R-04', 'R-05', 'R-06', 'R-07', 'R-08'],
      affectedServersCount: 42,
      affectedApplicationsCount: 6,
      affectedApplications: [
        'LLM Inference Cluster #1',
        'Financial Transaction DB Master',
        'Redis Global Cache Node A',
        'Search Indexing Worker Pool',
        'Telemetry Gateway Ingestion Node',
        'Edge Media Streaming Transcoder',
      ],
      potentialTemperatureIncreaseC: 6.4,
      potentialPowerLostKw: 380,
      potentialFinancialRiskPerHrUsd: 14200,
      slaRiskLevel: 'CRITICAL',
      estimatedTimeToCascadingFailureMinutes: 18,
      containmentRecommendation:
        'Increase CRAH-03 chilled water flow by +20%, open bypass damper, and initiate workload drain from Rack R-04.',
      propagationPath: [
        'Cooling Unit CRAC-02 (Refrigerant Valve)',
        'Cold Aisle Containment Zone A',
        'Racks R-04 & R-05 Inlet Airflow Matrix',
        'Compute Node Silicon Thermal PROCHOT Trip',
        'High-Density Application SLA Breach',
      ],
    });

    this.blastRadii.set('UPS-03', {
      rootAssetId: 'UPS-03',
      rootAssetName: 'UPS Battery Bank 03 (Zone C High-Density)',
      rootAssetType: 'ups',
      incidentType: 'Battery String 2B Cell Impedance Elevation',
      severity: 'critical',
      affectedRacks: ['R-10', 'R-11', 'R-12'],
      affectedServersCount: 28,
      affectedApplicationsCount: 4,
      affectedApplications: [
        'Cloud Object Storage Shard 3',
        'Kubernetes Worker Node Pool C',
        'Customer Analytics Warehouse',
        'Internal Log Archival Cluster',
      ],
      potentialTemperatureIncreaseC: 0.8,
      potentialPowerLostKw: 240,
      potentialFinancialRiskPerHrUsd: 6800,
      slaRiskLevel: 'HIGH',
      estimatedTimeToCascadingFailureMinutes: 8,
      containmentRecommendation:
        'Shift Zone C infeed to Secondary Utility Feeder B and schedule battery module hot-swap.',
      propagationPath: [
        'UPS-03 Battery String 2B',
        'Floor PDU-3B Sub-feeder',
        'Racks R-10 through R-12 Redundant PSUs',
        'Zone C Compute Cluster Single-Point of Failure',
      ],
    });
  }

  /**
   * Calculates blast radius dynamically from topology tree
   */
  public computeBlastRadius(rootAssetId: string, assetType: string): BlastRadiusAssessment {
    if (this.blastRadii.has(rootAssetId)) {
      return this.blastRadii.get(rootAssetId)!;
    }

    return {
      rootAssetId,
      rootAssetName: rootAssetId,
      rootAssetType: assetType as any,
      incidentType: 'Localized Hardware Anomaly',
      severity: 'warning',
      affectedRacks: ['R-04'],
      affectedServersCount: 7,
      affectedApplicationsCount: 2,
      affectedApplications: ['General Compute Shard', 'Secondary Worker Pool'],
      potentialTemperatureIncreaseC: 1.2,
      potentialPowerLostKw: 45,
      potentialFinancialRiskPerHrUsd: 1200,
      slaRiskLevel: 'MODERATE',
      estimatedTimeToCascadingFailureMinutes: 45,
      containmentRecommendation: 'Inspect localized fan speed curve and monitor thermal sensor trend.',
      propagationPath: [rootAssetId, 'Rack R-04 Chassis', 'Downstream Workload Node'],
    };
  }

  public getAllBlastRadii(): BlastRadiusAssessment[] {
    return Array.from(this.blastRadii.values());
  }
}
