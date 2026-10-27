import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Cpu,
  Wind,
  Layers,
  Thermometer,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import { dataCenterHealthScore, slaSloRiskSeedProfiles } from '../services/healthScoringEngine';
import { ExplainableHealthScore, SlaSloRiskRecord } from '../types';

export const HealthSlaView: React.FC = () => {
  const [healthData] = useState<ExplainableHealthScore>(dataCenterHealthScore);
  const [sloProfiles] = useState<SlaSloRiskRecord[]>(slaSloRiskSeedProfiles);
  const [selectedSloId, setSelectedSloId] = useState<string>('SLO-TIER1-PROD');

  const selectedSlo =
    sloProfiles.find((s) => s.id === selectedSloId) || sloProfiles[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Automated Health Scoring & SLA/SLO Risk Radar
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
              Features 18 & 19
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Multi-tier explainable telemetry scoring across compute, power, cooling, and predictive SLO reliability horizons.
          </p>
        </div>

        {/* Global Facility Score Pill */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase">Data Center Health</span>
            <div className="text-base font-bold text-emerald-400">
              {healthData.overallScore}/100
            </div>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase">SLO Reliability</span>
            <div className="text-base font-bold text-amber-400">72% Risk</div>
          </div>
        </div>
      </div>

      {/* FEATURE 19 — EXPLAINABLE AUTOMATED HEALTH SCORE HERO */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Feature 19 Automated Health Scoring Matrix
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Explainable Breakdown
              </span>
            </div>
            <h2 className="text-lg font-bold font-mono text-white mt-0.5">
              {healthData.targetName} — Overall: {healthData.overallScore}/100
            </h2>
          </div>
        </div>

        {/* 5 Core Category Breakdown Cards (Compute: 92, Power: 81, Cooling: 84, Environment: 90, Infrastructure: 88) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
          {/* 1. Compute */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Compute
            </span>
            <div className="text-xl font-bold text-emerald-400">
              {healthData.computeScore}
            </div>
            <div className="text-[10px] text-zinc-400">92/100 (CPU/RAM/IOPS)</div>
          </div>

          {/* 2. Power */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Power
            </span>
            <div className="text-xl font-bold text-amber-400">
              {healthData.powerScore}
            </div>
            <div className="text-[10px] text-zinc-400">81/100 (UPS/PDU/Bus)</div>
          </div>

          {/* 3. Cooling */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> Cooling
            </span>
            <div className="text-xl font-bold text-amber-400">
              {healthData.coolingScore}
            </div>
            <div className="text-[10px] text-zinc-400">84/100 (CRAC/CFM/Loop)</div>
          </div>

          {/* 4. Environment */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Environment
            </span>
            <div className="text-xl font-bold text-emerald-400">
              {healthData.environmentScore}
            </div>
            <div className="text-[10px] text-zinc-400">90/100 (Humidity/Leak)</div>
          </div>

          {/* 5. Infrastructure */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Infrastructure
            </span>
            <div className="text-xl font-bold text-emerald-400">
              {healthData.infrastructureScore}
            </div>
            <div className="text-[10px] text-zinc-400">88/100 (Drift/Warranty)</div>
          </div>
        </div>

        {/* Explainable Factor Contribution List */}
        <div className="space-y-2 font-mono text-xs">
          <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
            Explainable Health Scoring Factor Breakdown
          </span>

          <div className="space-y-2">
            {healthData.factors.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      f.status === 'degraded'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{f.category} Subsystem</span>
                      <span className="text-[10px] text-zinc-400">Score: {f.score}/100</span>
                      <span className="text-[10px] text-rose-400 font-bold">{f.impactPoints} pts</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] mt-0.5 leading-relaxed">{f.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURE 18 — SLA/SLO RISK PREDICTION CARD */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Feature 18 SLA/SLO Risk Prediction
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500 text-black font-mono font-extrabold uppercase">
                  SLO Risk: {selectedSlo.sloRiskPercent}%
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-white mt-0.5">
                {selectedSlo.serviceName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {sloProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedSloId(p.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedSloId === p.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.serviceName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Exact Prompt Required Triad (SLO Risk 72% + Main Contributors) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-amber-400 font-bold">SLO Risk:</span>
            <div className="text-2xl font-extrabold text-amber-400">
              {selectedSlo.sloRiskPercent}%
            </div>
            <div className="text-[10px] text-zinc-400">Target: {selectedSlo.sloTargetPercent}% Uptime</div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl md:col-span-2 space-y-2">
            <span className="text-[10px] uppercase text-zinc-400 font-bold">Main Contributors:</span>
            <div className="space-y-1">
              {selectedSlo.mainContributors.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="font-bold">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Risk Sub-Dimensions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase">Availability Risk</span>
            <div className="text-sm font-bold text-amber-400 mt-1">{selectedSlo.availabilityRisk}%</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase">Capacity Risk</span>
            <div className="text-sm font-bold text-cyan-400 mt-1">{selectedSlo.capacityRisk}%</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase">Thermal Risk</span>
            <div className="text-sm font-bold text-rose-400 mt-1">{selectedSlo.thermalRisk}%</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase">Power Risk</span>
            <div className="text-sm font-bold text-yellow-400 mt-1">{selectedSlo.powerRisk}%</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase">Hardware Risk</span>
            <div className="text-sm font-bold text-purple-400 mt-1">{selectedSlo.hardwareRisk}%</div>
          </div>
        </div>

        {/* Disclaimer & Action */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-zinc-400">
            <strong>SLA Integrity Rule:</strong> No actual SLA breach has occurred; risk indicates statistical likelihood over next {selectedSlo.safeRunwayDays} days.
          </div>
          <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-lg shrink-0">
            Execute Mitigation Rebalance
          </button>
        </div>
      </div>
    </div>
  );
};
