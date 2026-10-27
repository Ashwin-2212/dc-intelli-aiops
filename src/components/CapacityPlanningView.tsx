import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Zap,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Activity,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Clock,
  Wrench,
  Info,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  capacityMilestonesSeed,
  capacityRecommendationsSeed,
  generateAdvancedCapacityCurves,
} from '../services/capacityEngine';
import { CapacityMetricKey, CapacityMilestone } from '../types';

export const CapacityPlanningView: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '60d' | '90d' | '180d' | '365d'>('90d');
  const [activeMetricTab, setActiveMetricTab] = useState<CapacityMetricKey | 'all'>('cpu');

  const milestones: CapacityMilestone[] = capacityMilestonesSeed;
  const recommendations = capacityRecommendationsSeed;
  const forecastCurveData = generateAdvancedCapacityCurves(selectedHorizon);

  const activeMilestone = milestones.find((m) => m.key === activeMetricTab) || milestones[0];

  const metricTabs: Array<{ key: CapacityMetricKey; label: string; icon: any; color: string }> = [
    { key: 'cpu', label: 'CPU Utilization', icon: Cpu, color: 'text-orange-400' },
    { key: 'ram', label: 'Memory (RAM)', icon: Activity, color: 'text-cyan-400' },
    { key: 'storage', label: 'Storage Array', icon: HardDrive, color: 'text-emerald-400' },
    { key: 'power', label: 'Facility Power (kW)', icon: Zap, color: 'text-purple-400' },
    { key: 'rack_capacity', label: 'Rack Space (42U)', icon: Boxes, color: 'text-amber-400' },
    { key: 'cooling_capacity', label: 'Cooling Capacity', icon: Thermometer, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Horizon Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0d] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                  FEATURE 4 — AI Multi-Resource Capacity Forecasting
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-bold">
                  95% Confidence Bounds & Runway Analyzer
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Proactive exhaustion forecasting for CPU, RAM, Storage, Substation Power, 42U Racks, and Cooling Headroom.
              </p>
            </div>
          </div>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl gap-1 font-mono text-xs">
          <span className="text-zinc-500 text-[10px] px-2 uppercase font-semibold">Forecast Horizon:</span>
          {(['30d', '60d', '90d', '180d', '365d'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedHorizon === h
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {h.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE 4 Milestone Projection Cards (Exact Prompt Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            Multi-Horizon Capacity Milestones (Current vs 30d, 60d, 90d Projections)
          </h2>
          <span className="text-[10px] font-mono text-zinc-400">
            Compound Monthly Growth Extrapolations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => {
            const isSelected = activeMetricTab === m.key;
            const isCritical = m.status === 'critical';
            const isWarning = m.status === 'warning';

            return (
              <div
                key={m.key}
                onClick={() => setActiveMetricTab(m.key)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-950/40 via-zinc-900 to-zinc-950 border-orange-500/60 shadow-xl shadow-orange-950/20 ring-1 ring-orange-500/30'
                    : 'bg-[#0a0a0d] hover:bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-bold font-mono text-white">{m.label}</span>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      Safety Threshold Limit: <strong className="text-amber-400">{m.safetyThreshold}{m.unit.includes('%') ? '%' : ' kW'}</strong>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {m.exhaustionRunwayDays}d Runway
                  </span>
                </div>

                {/* Exact Milestone Values Grid (Current, 30d, 60d, 90d) */}
                <div className="grid grid-cols-4 gap-2 my-3 text-center font-mono">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block">Current</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{m.current}{m.unit.includes('%') ? '%' : ''}</span>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <span className="text-[9px] text-cyan-400 uppercase block">30 Days</span>
                    <span className="text-sm font-bold text-cyan-300 mt-0.5 block">{m.days30}{m.unit.includes('%') ? '%' : ''}</span>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <span className="text-[9px] text-orange-400 uppercase block">60 Days</span>
                    <span className="text-sm font-bold text-orange-300 mt-0.5 block">{m.days60}{m.unit.includes('%') ? '%' : ''}</span>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <span className="text-[9px] text-rose-400 uppercase block">90 Days</span>
                    <span className="text-sm font-bold text-rose-300 mt-0.5 block">{m.days90}{m.unit.includes('%') ? '%' : ''}</span>
                  </div>
                </div>

                {/* Estimated Exhaustion Point */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">Exhaustion Point:</span>
                  <span className={`font-bold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {m.exhaustionDate} ({m.exhaustionRunwayDays} days left)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Forecast Chart with Trend, Forecast, 95% CI & Threshold */}
      <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                {activeMilestone.label} — Trajectory & Confidence Envelope
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 font-mono font-bold">
                Runway: {activeMilestone.exhaustionRunwayDays} Days
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Historical Trend (Past 30d) ➔ Predictive Forecast Mean ➔ 95% Confidence Interval Band ➔ Safety Threshold ({activeMilestone.safetyThreshold}{activeMilestone.unit.includes('%') ? '%' : ' kW'}).
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {metricTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveMetricTab(t.key)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeMetricTab === t.key
                    ? 'bg-zinc-800 text-white border border-orange-500/60 font-bold shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span>{t.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} fontStyle="mono" />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                fontStyle="mono"
                domain={
                  activeMetricTab === 'power'
                    ? [600, 1200]
                    : [40, 100]
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e0e12',
                  borderColor: '#3f3f46',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '10px' }}
              />

              {/* Safety Margin Threshold Reference Line */}
              <ReferenceLine
                y={activeMetricTab === 'power' ? 1012 : activeMilestone.safetyThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `CRITICAL THRESHOLD: ${activeMilestone.safetyThreshold}${activeMetricTab === 'power' ? ' kW' : '%'}`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'monospace',
                }}
              />

              {/* 95% Confidence Interval Upper / Lower Bands */}
              {activeMetricTab === 'cpu' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="cpuUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Upper Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="cpuTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                    name="Historical Actual Trend (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="cpuForecast"
                    stroke="#f97316"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name="Predictive Forecast Trajectory (%)"
                  />
                </>
              )}

              {activeMetricTab === 'ram' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="ramUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="ramTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    name="Historical Trend (RAM %)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ramForecast"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Projected Forecast (RAM %)"
                  />
                </>
              )}

              {activeMetricTab === 'storage' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="storageUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="storageTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    name="Historical Storage (TB %)"
                  />
                  <Line
                    type="monotone"
                    dataKey="storageForecast"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Storage Forecast Curve (%)"
                  />
                </>
              )}

              {activeMetricTab === 'power' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="powerUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="powerTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    name="Historical Power (kW)"
                  />
                  <Line
                    type="monotone"
                    dataKey="powerForecast"
                    stroke="#c084fc"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Power Demand Forecast (kW)"
                  />
                </>
              )}

              {activeMetricTab === 'rack_capacity' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="rackUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="rackTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    name="Historical 42U Occupancy (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rackForecast"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Rack Occupancy Forecast (%)"
                  />
                </>
              )}

              {activeMetricTab === 'cooling_capacity' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="coolingUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    name="95% Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="coolingTrend"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    name="Historical HVAC Load (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="coolingForecast"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Cooling Demand Forecast (%)"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Capacity Recommendations (Exact Prompt Requirement) */}
      <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-400" />
            AI Prescriptive Capacity Recommendations & Procurement Directives
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {recommendations.length} Active Directives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-bold uppercase shrink-0 border border-orange-500/30">
                    {rec.priority}
                  </span>
                </div>

                <p className="text-zinc-300 leading-relaxed">{rec.action}</p>

                <div className="p-2.5 bg-black/40 border border-zinc-850 rounded-lg space-y-1">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Impact: {rec.impact}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Cost: <strong className="text-white">{rec.estimatedCost}</strong> • Runway Extension: <strong className="text-amber-300">+{rec.runwayExtendedDays} Days</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
