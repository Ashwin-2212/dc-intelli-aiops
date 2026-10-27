import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Server,
  Zap,
  ShieldAlert,
  Flame,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { TelemetryQualityEngine } from '../services/telemetry/TelemetryQualityEngine';
import { DualHealthStatus } from '../types/telemetryIntelligence';

interface TelemetryQualityViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryQualityView: React.FC<TelemetryQualityViewProps> = ({ onOpenCopilot }) => {
  const qualityEngine = TelemetryQualityEngine.getInstance();
  const report = qualityEngine.getQualityReport();
  const dualHealthList = qualityEngine.getDualHealthMatrix();

  const [filterMode, setFilterMode] = useState<'ALL' | 'DISCREPANCY_ONLY' | 'DEGRADED_TELEMETRY'>('ALL');

  const filteredDualHealth = dualHealthList.filter((item) => {
    if (filterMode === 'DISCREPANCY_ONLY') {
      return Math.abs(item.assetHealth - item.telemetryHealth) > 20;
    }
    if (filterMode === 'DEGRADED_TELEMETRY') {
      return item.telemetryHealth < 75;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Telemetry Quality & Dual Health Matrix
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                QUALITY: {report.overallQualityScore}/100
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comprehensive telemetry verification distinguishing physical Asset Health from sensor Telemetry Health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              filterMode === 'ALL' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Assets
          </button>
          <button
            onClick={() => setFilterMode('DISCREPANCY_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              filterMode === 'DISCREPANCY_ONLY' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Discrepancies Only
          </button>
          <button
            onClick={() => setFilterMode('DEGRADED_TELEMETRY')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              filterMode === 'DEGRADED_TELEMETRY' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sensor Issues
          </button>
        </div>
      </div>

      {/* 5-Dimensional Quality Score Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Completeness</span>
            <span className="text-emerald-400 font-bold">{report.completenessScore}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${report.completenessScore}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Expected fields present</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Freshness</span>
            <span className="text-emerald-400 font-bold">{report.freshnessScore}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${report.freshnessScore}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Sampling age &lt; 2.0s</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Validity</span>
            <span className="text-emerald-400 font-bold">{report.validityScore}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${report.validityScore}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Physical range checks</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Continuity</span>
            <span className="text-amber-400 font-bold">{report.continuityScore}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${report.continuityScore}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">No unexpected gaps</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Source Trust</span>
            <span className="text-purple-400 font-bold">{report.sourceReliabilityScore}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${report.sourceReliabilityScore}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Historical reliability</div>
        </div>
      </div>

      {/* Critical Dual Health Matrix Table */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Asset Health vs Telemetry Health Discrepancy Matrix
            </h2>
            <p className="text-xs text-zinc-400">
              Crucial observability distinction: A healthy server may have a failing sensor, or a degraded server may have pristine telemetry.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Asset / Target</th>
                <th className="pb-3 font-semibold">Asset Health (Condition)</th>
                <th className="pb-3 font-semibold">Telemetry Health (Fidelity)</th>
                <th className="pb-3 font-semibold">Telemetry Status</th>
                <th className="pb-3 font-semibold">Diagnosis & Root Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredDualHealth.map((item) => {
                const hasDiscrepancy = Math.abs(item.assetHealth - item.telemetryHealth) > 20;
                return (
                  <tr key={item.assetId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-white">{item.assetName}</div>
                      <div className="text-[10px] text-zinc-400">{item.assetId} • {item.rackId} • {item.zone}</div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          item.assetHealth < 60 ? 'text-red-400' : item.assetHealth < 80 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.assetHealth}/100
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                          item.assetStatus === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {item.assetStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          item.telemetryHealth < 60 ? 'text-red-400' : item.telemetryHealth < 80 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.telemetryHealth}/100
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        item.telemetryStatus === 'nominal'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : item.telemetryStatus === 'sensor_failure'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.telemetryStatus}
                      </span>
                    </td>

                    <td className="py-3.5 text-zinc-300">
                      <div>{item.discrepancyNote}</div>
                      {item.primaryTelemetryIssue && (
                        <div className="text-red-400 text-[10px] font-bold mt-0.5">
                          ⚠️ {item.primaryTelemetryIssue}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensor Fusion Conflict Resolution Banner */}
      {report.sensorConflicts.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-orange-950/40 to-zinc-900 border border-orange-500/40 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Multi-Source Sensor Conflict Detected ({report.sensorConflicts[0].conflictId})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {report.sensorConflicts[0].sources.map((src) => (
              <div key={src.sourceId} className="p-3 bg-black/50 rounded-xl border border-zinc-800 space-y-1 text-xs font-mono">
                <div className="text-zinc-400 font-bold">{src.sourceType.toUpperCase()}</div>
                <div className="text-lg font-bold text-white">{src.reportedValue} {src.unit}</div>
                <div className="text-[10px] text-purple-300">Sensor Trust: {src.trustScore}%</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs font-mono text-orange-200">
            <span className="font-bold">AI Sensor Fusion Verdict:</span> {report.sensorConflicts[0].diagnosis} Recommended trusted consensus reading: <span className="text-emerald-400 font-bold">{report.sensorConflicts[0].recommendedTrustedValue}°C</span>.
          </div>
        </div>
      )}
    </div>
  );
};
