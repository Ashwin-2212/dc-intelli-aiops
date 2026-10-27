import React from 'react';
import {
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Radio,
  Cpu,
  Zap,
  Lock,
  Sparkles,
} from 'lucide-react';
import { TelemetryPlatformObservability } from '../services/telemetry/TelemetryPlatformObservability';

interface TelemetryPlatformObservabilityProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryPlatformObservabilityView: React.FC<TelemetryPlatformObservabilityProps> = ({
  onOpenCopilot,
}) => {
  const obs = TelemetryPlatformObservability.getInstance();
  const metrics = obs.getPlatformMetrics();
  const intelScore = metrics.telemetryIntelligenceScore;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Telemetry Platform Self-Observability & Security
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                PIPELINE HEALTH: 99.98%
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live observability of the Telemetry Engine itself: Ingestion throughput, processing latency, queue depth, and security guardrails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-zinc-400">Total Ingested (24h)</div>
            <div className="text-sm font-bold text-white">{metrics.totalEventsProcessed24h.toLocaleString()} msgs</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Ingestion Rate</div>
          <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
            {metrics.ingestionRateEventsPerSec.toLocaleString()}
            <span className="text-[10px] text-zinc-400 font-normal">evt/s</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">Nominal</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Gateway Latency</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.gatewayLatencyMs} ms
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Target: &lt; 50ms</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">AI Inference Latency</div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {metrics.aiProcessingLatencyMs} ms
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Multi-Algorithm</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Drop Rate</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.dropRatePercent}%
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">{metrics.droppedEventsCount} dropped</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Queue Depth</div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.activeQueueSize}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Ring Buffer Active</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Connected Sources</div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.connectedAgentsCount}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">0 offline</div>
        </div>
      </div>

      {/* Telemetry Intelligence Score Card */}
      <div className="p-6 bg-gradient-to-br from-[#100e18] via-zinc-900 to-[#120d18] border border-purple-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Unified Telemetry Intelligence Score (AIOps Benchmark)
            </h2>
            <p className="text-xs text-zinc-400">
              Composite telemetry maturity metric based on Coverage, Freshness, Quality, Cross-Metric Correlation, and Explainability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black font-mono text-purple-300">
              {intelScore.totalScore}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Coverage</div>
            <div className="text-lg font-bold text-white">{intelScore.coverage}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.coverage}%` }}></div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Freshness</div>
            <div className="text-lg font-bold text-white">{intelScore.freshness}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.freshness}%` }}></div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Data Quality</div>
            <div className="text-lg font-bold text-white">{intelScore.quality}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.quality}%` }}></div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Correlation</div>
            <div className="text-lg font-bold text-white">{intelScore.correlation}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.correlation}%` }}></div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Prediction</div>
            <div className="text-lg font-bold text-white">{intelScore.prediction}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.prediction}%` }}></div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="text-zinc-400">Explainability</div>
            <div className="text-lg font-bold text-white">{intelScore.explainability}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${intelScore.explainability}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit & Ingest Authorization Log */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-400" />
              Telemetry Security & Ingest Guardrails Audit Log
            </h2>
            <p className="text-xs text-zinc-400">
              Tracks API authentication, rate limits, schema validation rejections, and physical bounds sanitization.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <th className="pb-2.5">Audit ID</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Agent / Source IP</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Reason & Payload Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {metrics.securityAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 text-zinc-400">{log.id}</td>
                  <td className="py-2.5 text-zinc-300">{log.timestamp.replace('T', ' ').slice(11, 19)}</td>
                  <td className="py-2.5 font-bold text-white">
                    {log.agentId} <span className="text-zinc-500 font-normal">({log.sourceIp})</span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      log.action === 'INGEST_ACCEPTED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-300">
                    <div>{log.reason}</div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-md">{log.payloadSnippet}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
