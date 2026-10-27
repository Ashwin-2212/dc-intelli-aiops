import {
  UniversalTelemetryPacket,
  MultiAlgorithmAnomalyResult,
  BlastRadiusAssessment,
  DualHealthStatus,
  TelemetryQualityReport,
} from '../../types/telemetryIntelligence';
import { TelemetryGatewayEngine } from './TelemetryGatewayEngine';
import { TelemetryQualityEngine } from './TelemetryQualityEngine';
import { BaselineLearningEngine } from './BaselineLearningEngine';
import { MultiAlgorithmAnomalyEngine } from './MultiAlgorithmAnomalyEngine';
import { CrossAssetCorrelationEngine } from './CrossAssetCorrelationEngine';
import { TelemetryStorageEngine } from './TelemetryStorageEngine';
import { ClosedLoopLearningEngine } from './ClosedLoopLearningEngine';

export type PipelineListener = (data: {
  packet: UniversalTelemetryPacket;
  anomalies: MultiAlgorithmAnomalyResult[];
  blastRadius?: BlastRadiusAssessment;
}) => void;

export class TelemetryIntelligencePipeline {
  private static instance: TelemetryIntelligencePipeline;
  private listeners: Set<PipelineListener> = new Set();
  private isPipelineActive: boolean = true;

  public static getInstance(): TelemetryIntelligencePipeline {
    if (!TelemetryIntelligencePipeline.instance) {
      TelemetryIntelligencePipeline.instance = new TelemetryIntelligencePipeline();
    }
    return TelemetryIntelligencePipeline.instance;
  }

  public subscribe(fn: PipelineListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(data: {
    packet: UniversalTelemetryPacket;
    anomalies: MultiAlgorithmAnomalyResult[];
    blastRadius?: BlastRadiusAssessment;
  }) {
    this.listeners.forEach(fn => fn(data));
  }

  /**
   * Main Pipeline Execution Method
   * Executes the full 16-stage intelligence pipeline on ANY incoming telemetry
   */
  public processTelemetry(
    rawPayload: any,
    clientContext?: { ip?: string; authHeader?: string }
  ): {
    success: boolean;
    packet?: UniversalTelemetryPacket;
    anomalies: MultiAlgorithmAnomalyResult[];
    blastRadius?: BlastRadiusAssessment;
    error?: string;
  } {
    // 1. Telemetry Gateway: Validation, Normalization, Deduplication, & Topological Enrichment
    const gateway = TelemetryGatewayEngine.getInstance();
    const gatewayResult = gateway.ingestRaw(rawPayload, clientContext);

    if (!gatewayResult.success || !gatewayResult.packet) {
      return {
        success: false,
        anomalies: [],
        error: gatewayResult.error,
      };
    }

    const packet = gatewayResult.packet;

    // 2. Storage Engine: Store in Tiered Historical Buffers
    const storageEngine = TelemetryStorageEngine.getInstance();
    storageEngine.storePacket(packet);

    // 3. Quality Engine: Calculate Quality Score & Dual Health Matrix (Asset Health vs Telemetry Health)
    const qualityEngine = TelemetryQualityEngine.getInstance();
    qualityEngine.evaluatePacketQuality(packet);

    // 4. Baseline Learning Engine: Update dynamic time-aware baseline profile & detect drift/change-points
    const baselineEngine = BaselineLearningEngine.getInstance();
    for (const [metric, val] of Object.entries(packet.metrics)) {
      baselineEngine.updateMetricSample(packet.assetId, metric, val, packet.timestampEpochMs);
    }

    // 5. Multi-Algorithm Anomaly Engine: Z-Score, EWMA, IQR, Isolation Forest, Autoencoder
    const anomalyEngine = MultiAlgorithmAnomalyEngine.getInstance();
    const anomalies = anomalyEngine.evaluateTelemetry(packet);

    // 6. Cross-Asset Correlation & Blast Radius Calculator
    let blastRadius: BlastRadiusAssessment | undefined;
    if (anomalies.length > 0) {
      const correlationEngine = CrossAssetCorrelationEngine.getInstance();
      blastRadius = correlationEngine.computeBlastRadius(packet.assetId, packet.assetType);
    }

    // 7. Persist to MongoDB through centralized backend ingestion pipeline
    if (typeof fetch !== 'undefined') {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
      }).catch(() => {
        // Graceful non-blocking degradation if offline
      });
    }

    // Notify all real-time listeners across React UI
    this.notify({ packet, anomalies, blastRadius });

    return {
      success: true,
      packet,
      anomalies,
      blastRadius,
    };
  }
}
