import React, { useState } from 'react';
import {
  Flame,
  Clock,
  ShieldAlert,
  Sparkles,
  Wrench,
  Activity,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Server,
  Wind,
  Zap,
  HardDrive,
  Cpu,
  Search,
  Filter,
  Info,
  Layers,
  ChevronRight,
  Gauge,
  Sliders,
} from 'lucide-react';
import { PredictiveFailureEngine, predictiveFailureSeedRecords } from '../services/predictiveEngine';
import { PredictiveFailureRecord, PredictiveFailureCategory } from '../types';

interface PredictiveMaintenanceViewProps {
  onGenerateWorkOrder: (item: any) => void;
  onOpenCopilot?: (prompt?: string) => void;
}

export const PredictiveMaintenanceView: React.FC<PredictiveMaintenanceViewProps> = ({
  onGenerateWorkOrder,
  onOpenCopilot,
}) => {
  const engine = PredictiveFailureEngine.getInstance();
  const [records] = useState<PredictiveFailureRecord[]>(engine.getRecords());
  const [selectedCategory, setSelectedCategory] = useState<PredictiveFailureCategory | 'all'>('all');
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories: Array<{ id: PredictiveFailureCategory | 'all'; label: string; icon: any }> = [
    { id: 'all', label: 'All Predictions', icon: Layers },
    { id: 'server_failure', label: 'Server Failure', icon: Server },
    { id: 'fan_failure', label: 'Fan Failure', icon: Wind },
    { id: 'psu_failure', label: 'PSU Failure', icon: Zap },
    { id: 'overheating', label: 'Overheating', icon: Flame },
    { id: 'abnormal_power', label: 'Abnormal Power', icon: Activity },
    { id: 'storage_degradation', label: 'Storage Degradation', icon: HardDrive },
    { id: 'hardware_health', label: 'Hardware Health', icon: Cpu },
  ];

  const filteredRecords = records.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.failureCategory === selectedCategory;
    const matchesRisk = selectedRisk === 'ALL' || r.riskLevel === selectedRisk;
    const matchesSearch =
      r.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.evidence.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const criticalCount = records.filter((r) => r.riskLevel === 'CRITICAL').length;
  const highCount = records.filter((r) => r.riskLevel === 'HIGH').length;
  const mediumCount = records.filter((r) => r.riskLevel === 'MEDIUM').length;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-xs';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const getCategoryIcon = (cat: PredictiveFailureCategory) => {
    switch (cat) {
      case 'server_failure':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'fan_failure':
        return <Wind className="w-4 h-4 text-blue-400" />;
      case 'psu_failure':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'overheating':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'abnormal_power':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'storage_degradation':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'hardware_health':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0d] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                  FEATURE 3 — Predictive Failure Detection Engine
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  Weibull Degradation ML
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Proactively forecasts hardware degradation horizons (7–30 days) across compute, thermal, power, and storage without false deterministic claims.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onOpenCopilot?.(
                'Provide a summary of all high and critical predictive hardware risks across compute nodes, CRAC chillers, and UPS battery banks. Outline recommended preventive maintenance priorities.'
              )
            }
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono rounded-xl transition-all flex items-center gap-2 shadow"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Predictive Triage</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Predictive Monitors</span>
          <div className="text-xl font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-orange-400" />
            <span>{records.length} Monitored Assets</span>
          </div>
          <span className="text-[10px] text-zinc-400">Continuous telemetry tracking</span>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-rose-950/30 to-zinc-900 border border-rose-500/30 rounded-xl space-y-1">
          <span className="text-[10px] text-rose-400 uppercase font-semibold">Critical Horizon (Next 7d)</span>
          <div className="text-xl font-bold text-rose-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{criticalCount} Critical Risks</span>
          </div>
          <span className="text-[10px] text-rose-400/80">Immediate action advised</span>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-orange-950/30 to-zinc-900 border border-orange-500/30 rounded-xl space-y-1">
          <span className="text-[10px] text-orange-400 uppercase font-semibold">High Horizon (7–14d)</span>
          <div className="text-xl font-bold text-orange-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>{highCount} High Risks</span>
          </div>
          <span className="text-[10px] text-orange-400/80">Schedule preventive WO</span>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Average Model Confidence</span>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>90.9% Confidence</span>
          </div>
          <span className="text-[10px] text-zinc-400">Degradation ML validation</span>
        </div>
      </div>

      {/* Category Filter Pills & Search Bar */}
      <div className="bg-[#0a0a0d] border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Failure Category Tabs */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Risk Level Filter & Search */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search asset, component..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-white pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 w-52"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Cards Grid */}
      <div className="space-y-4">
        {filteredRecords.map((pred) => {
          const isCritical = pred.riskLevel === 'CRITICAL';
          const isHigh = pred.riskLevel === 'HIGH';

          return (
            <div
              key={pred.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-gradient-to-b from-rose-950/20 via-zinc-900/90 to-zinc-950 border-rose-500/40 shadow-xl'
                  : isHigh
                  ? 'bg-gradient-to-b from-orange-950/20 via-zinc-900/90 to-zinc-950 border-orange-500/40 shadow-lg'
                  : 'bg-[#0a0a0d] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Main Card Header with Required EXACT Prompt Fields */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                      {getCategoryIcon(pred.failureCategory)}
                    </span>
                    <span className="text-base font-bold font-mono text-white tracking-tight">
                      {pred.deviceName}
                    </span>
                    <span className="text-zinc-500 font-mono">•</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">{pred.id}</span>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono">
                    Target Sub-Component: <strong className="text-zinc-200">{pred.component}</strong> ({pred.deviceId})
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() =>
                      onOpenCopilot?.(
                        `Inspect predictive failure record ${pred.id} for ${pred.deviceName} (${pred.component}). Failure Risk is ${pred.failureProbability}% (${pred.riskLevel}). Horizon: ${pred.predictionHorizon}. Recommend preventive steps.`
                      )
                    }
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Explain XAI</span>
                  </button>

                  <button
                    onClick={() =>
                      onGenerateWorkOrder({
                        deviceId: pred.deviceId,
                        deviceName: `${pred.deviceName} - ${pred.component}`,
                        metric: `Predictive Failure (${pred.failureCategory.replace('_', ' ')})`,
                        severity: pred.riskLevel.toLowerCase(),
                      })
                    }
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Schedule Preventive WO</span>
                  </button>
                </div>
              </div>

              {/* Exact Prompt Required Metrics Display Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 font-mono text-xs">
                {/* 1. Failure Risk */}
                <div className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Failure Risk</span>
                  <div className="text-xl font-black text-rose-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Failure Risk: {pred.failureProbability}%</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Degradation Probability Index</span>
                </div>

                {/* 2. Risk Level */}
                <div className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Risk Level</span>
                  <div className="text-xl font-black flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black uppercase border ${getRiskBadge(pred.riskLevel)}`}>
                      Risk Level: {pred.riskLevel}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Priority Triage Threshold</span>
                </div>

                {/* 3. Prediction Horizon (Explicitly avoiding false deterministic dates) */}
                <div className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Prediction Horizon</span>
                  <div className="text-xl font-black text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Horizon: {pred.predictionHorizon}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80">Probabilistic window estimation</span>
                </div>
              </div>

              {/* Empirical Evidence Signals Section (Exact Prompt Requirement) */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    Evidence Supporting Failure Prediction:
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {pred.evidence.length} Observable Telemetry Deviations
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pred.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-black/40 border border-zinc-800 rounded-lg flex items-start gap-2.5 text-[11px] text-zinc-300"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>

                {/* Telemetry Sensor Readings Breakdown */}
                {pred.telemetrySignals && (
                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {pred.telemetrySignals.map((sig, sIdx) => (
                      <div key={sIdx} className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-850 text-[10px]">
                        <div className="text-zinc-500">{sig.signalName}</div>
                        <div className="font-bold text-white mt-0.5">{sig.reading}</div>
                        <div className="text-zinc-400 text-[9px]">Baseline: {sig.baseline}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Confidence & Prediction Limitations Notice (Exact Prompt Requirement) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-3 font-mono text-xs">
                <div className="md:col-span-4 p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm shrink-0">
                    {pred.modelConfidence}%
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Model Confidence</span>
                    <div className="text-xs font-bold text-emerald-300">Statistical Convergence</div>
                    <span className="text-[10px] text-zinc-400">MTBF: {pred.mtbfHours.toLocaleString()}h / MTTR: {pred.mttrHours}h</span>
                  </div>
                </div>

                <div className="md:col-span-8 p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Prediction Limitations & Probabilistic Disclaimer</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                    {pred.predictionLimitations}
                  </p>
                </div>
              </div>

              {/* Explainable AI Contributing Factors Bar Graph */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <div className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  XAI Feature Contribution Weights
                </div>

                <div className="space-y-2 pt-1">
                  {pred.factors.map((f, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>{f.factor}</span>
                        <span className="font-bold text-orange-400">+{f.contributionPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
                          style={{ width: `${f.contributionPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Remediation Action */}
              <div className="mt-3 p-3.5 bg-gradient-to-r from-orange-950/20 via-zinc-900 to-zinc-900 border border-orange-500/30 rounded-xl text-xs text-zinc-200 flex items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>
                    <strong className="text-orange-300">AIOps Preventive Action:</strong> {pred.recommendation}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
