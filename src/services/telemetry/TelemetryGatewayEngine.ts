import {
  UniversalTelemetryPacket,
} from '../../types/telemetryIntelligence';
import { UniversalTelemetrySchema, ValidationResult } from './UniversalTelemetrySchema';
import { TelemetryPlatformObservability } from './TelemetryPlatformObservability';

export class TelemetryGatewayEngine {
  private static instance: TelemetryGatewayEngine;
  private recentPayloadHashes: Set<string> = new Set();
  private rateLimitCounter: Map<string, { count: number; windowStart: number }> = new Map();

  public static getInstance(): TelemetryGatewayEngine {
    if (!TelemetryGatewayEngine.instance) {
      TelemetryGatewayEngine.instance = new TelemetryGatewayEngine();
    }
    return TelemetryGatewayEngine.instance;
  }

  /**
   * Primary ingestion entry point for all telemetry sources
   */
  public ingestRaw(
    rawPayload: any,
    clientContext?: { ip?: string; authHeader?: string }
  ): {
    success: boolean;
    packet?: UniversalTelemetryPacket;
    error?: string;
    validation: ValidationResult;
  } {
    const obs = TelemetryPlatformObservability.getInstance();
    const sourceIp = clientContext?.ip || '127.0.0.1';

    // 1. Rate Limiting Check (max 100 requests / sec per IP)
    const now = Date.now();
    const rate = this.rateLimitCounter.get(sourceIp) || { count: 0, windowStart: now };
    if (now - rate.windowStart > 1000) {
      rate.count = 1;
      rate.windowStart = now;
    } else {
      rate.count++;
      if (rate.count > 100) {
        obs.recordIngest(false, 2, {
          id: `AUD-RL-${now}`,
          timestamp: new Date().toISOString(),
          sourceIp,
          agentId: rawPayload?.sourceId || 'RATE_LIMITED_CLIENT',
          action: 'RATE_LIMIT_EXCEEDED',
          reason: `Rate limit threshold exceeded (${rate.count} req/sec). Ingestion throttled.`,
          payloadSnippet: JSON.stringify(rawPayload).slice(0, 80),
        });
        return {
          success: false,
          error: 'Rate limit exceeded. Max 100 telemetry packets / second.',
          validation: { isValid: false, errors: ['Rate limit exceeded'], warnings: [] },
        };
      }
    }
    this.rateLimitCounter.set(sourceIp, rate);

    // 2. Universal Schema Validation & Sanitization
    const validation = UniversalTelemetrySchema.validateAndNormalize(rawPayload);

    if (!validation.isValid || !validation.sanitizedPacket) {
      obs.recordIngest(false, 4, {
        id: `AUD-MALFORMED-${now}`,
        timestamp: new Date().toISOString(),
        sourceIp,
        agentId: rawPayload?.sourceId || 'UNKNOWN_SOURCE',
        action: 'INGEST_REJECTED_SCHEMA',
        reason: `Schema validation rejected payload: ${validation.errors.join('; ')}`,
        payloadSnippet: JSON.stringify(rawPayload).slice(0, 100),
      });

      return {
        success: false,
        error: `Payload validation failed: ${validation.errors.join(', ')}`,
        validation,
      };
    }

    const packet = validation.sanitizedPacket;

    // 3. Deduplication Check
    const dedupHash = `${packet.sourceId}:${packet.timestampEpochMs}:${Object.keys(packet.metrics).sort().join(',')}`;
    if (this.recentPayloadHashes.has(dedupHash)) {
      validation.warnings.push('Duplicate telemetry packet detected within current window. Deduplicated.');
      return {
        success: true,
        packet,
        validation,
      };
    }

    this.recentPayloadHashes.add(dedupHash);
    if (this.recentPayloadHashes.size > 2000) {
      this.recentPayloadHashes.clear();
    }

    // 4. Enrich Topological Dependencies
    if (!packet.enrichment?.upstreamCoolingId) {
      const rack = packet.location.rack || 'R-04';
      packet.enrichment = {
        upstreamPowerId: rack === 'R-04' ? 'UPS-01 / PDU-1A' : 'UPS-02 / PDU-2B',
        upstreamCoolingId: rack === 'R-04' || rack === 'R-05' ? 'CRAC-02 (Zone A In-Row)' : 'CRAC-01 (Direct Expansion)',
        parentRackId: rack,
        workloadCategory: 'Compute / Inference Node',
        criticalityTier: 'Tier-1-Mission-Critical',
      };
    }

    obs.recordIngest(true, 14);

    return {
      success: true,
      packet,
      validation,
    };
  }

  /**
   * Ingests a batch of telemetry packets
   */
  public ingestBatch(
    payloadList: any[],
    clientContext?: { ip?: string; authHeader?: string }
  ): {
    totalReceived: number;
    acceptedCount: number;
    rejectedCount: number;
    packets: UniversalTelemetryPacket[];
  } {
    const packets: UniversalTelemetryPacket[] = [];
    let accepted = 0;
    let rejected = 0;

    for (const item of payloadList) {
      const result = this.ingestRaw(item, clientContext);
      if (result.success && result.packet) {
        accepted++;
        packets.push(result.packet);
      } else {
        rejected++;
      }
    }

    return {
      totalReceived: payloadList.length,
      acceptedCount: accepted,
      rejectedCount: rejected,
      packets,
    };
  }
}
