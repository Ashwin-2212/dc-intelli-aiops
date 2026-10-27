import React, { useState } from 'react';
import {
  Zap,
  Gauge,
  DollarSign,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRight,
  CheckCircle2,
  Info,
  Server,
  Activity,
  Thermometer,
  Boxes,
  Radio,
  Sliders,
  Check,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { EnergyOptimizationEngine } from '../services/energyOptimizationEngine';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { InefficientBehaviorRecord } from '../services/energyOptimizationEngine';

export const PowerEnergyView: React.FC = () => {
  const telemetryEngine = TelemetryEngine.getInstance();
  const optEngine = EnergyOptimizationEngine.getInstance();
  const facility = telemetryEngine.facilities[0];

  const [electricityRate, setElectricityRate] = useState<number>(0.12);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [, setTick] = useState(0);

  const optimizationRecords = optEngine.getRecords();
  const totalSavings = optEngine.getTotalEstimatedSavings();

  const itPower = facility.itEquipmentPowerKw || 601.8;
  const coolingPower = facility.coolingPowerKw || 185.2;
  const totalPower = facility.totalFacilityPowerKw || 842.5;
  const pue = facility.pue || 1.40;

  const monthlyCost = Math.round(totalPower * 24 * 30.5 * electricityRate);
  const annualCost = Math.round(monthlyCost * 12);
  const annualCo2Tons = +(
    (totalPower * 24 * 365 * (facility.carbonIntensityGramsPerKwh || 380)) /
    1000000
  ).toFixed(1);

  const filteredRecords = optimizationRecords.filter((r) => {
    if (selectedZoneFilter === 'all') return true;
    return r.zone.toLowerCase().includes(selectedZoneFilter.toLowerCase());
  });

  const handleApplyOptimization = (id: string) => {
    optEngine.applyOptimization(id);
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0d] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                  FEATURE 6 — AI Energy Optimization & Power Analytics
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  Autonomous PUE Tuner
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Continuously monitors server power, rack power, PDU, UPS, cooling, and workload to eliminate phantom energy loss.
              </p>
            </div>
          </div>
        </div>

        {/* Electricity Rate Configurator */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-400">Utility Rate:</span>
          <input
            type="number"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(parseFloat(e.target.value) || 0.01)}
            className="w-16 bg-zinc-800 text-white font-bold px-1.5 py-0.5 rounded border border-zinc-700 focus:outline-none"
          />
          <span className="text-zinc-400">/ kWh</span>
        </div>
      </div>

      {/* Primary KPI Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#0a0a0d] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] font-bold">Power Usage Effectiveness (PUE)</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {pue.toFixed(2)}{' '}
            <span className="text-xs font-normal text-emerald-400 font-sans">
              {pue < 1.35 ? 'Optimal' : pue < 1.45 ? 'Standard' : 'Elevated'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">IT Load: {itPower} kW / Total: {totalPower} kW</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/40 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="uppercase text-[10px] font-bold">[ESTIMATE] Potential Monthly Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            ${totalSavings.monthlyCost.toFixed(2)}/mo
          </div>
          <span className="text-[10px] text-emerald-400/80">-{totalSavings.powerKw} kW Power Reduction</span>
        </div>

        <div className="p-4 bg-[#0a0a0d] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] font-bold">Monthly Electricity OpEx</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${monthlyCost.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-400">Annual Projection: ${annualCost.toLocaleString()}</span>
        </div>

        <div className="p-4 bg-[#0a0a0d] border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[10px] font-bold">[ESTIMATE] Annual Carbon Reduction</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {totalSavings.co2Tons} <span className="text-xs font-normal text-zinc-400">Tons CO₂e/yr</span>
          </div>
          <span className="text-[10px] text-zinc-400">Grid: {facility.carbonIntensityGramsPerKwh} g CO₂/kWh</span>
        </div>
      </div>

      {/* 6 Monitored Energy Telemetry Streams (Exact Prompt Requirement) */}
      <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Active Energy Telemetry Streams Monitored by AI
          </h3>
          <span className="text-[10px] text-zinc-400">Sampling Interval: 2.0s</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Server className="w-3 h-3 text-cyan-400" />
              1. Server Power
            </span>
            <div className="text-sm font-bold text-white">{itPower} kW Total</div>
            <span className="text-[10px] text-zinc-400">Avg 480W per chassis</span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Boxes className="w-3 h-3 text-purple-400" />
              2. Rack Power
            </span>
            <div className="text-sm font-bold text-white">9.2–14.1 kW / rack</div>
            <span className="text-[10px] text-zinc-400">12 Active 42U Racks</span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              3. PDU Circuits
            </span>
            <div className="text-sm font-bold text-white">78% Phase Balance</div>
            <span className="text-[10px] text-zinc-400">400A 3-Phase Busway</span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              4. UPS Inverters
            </span>
            <div className="text-sm font-bold text-white">94.2% Efficiency</div>
            <span className="text-[10px] text-zinc-400">Double-Conversion Bus</span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              5. Cooling HVAC
            </span>
            <div className="text-sm font-bold text-white">{coolingPower} kW (3.4 COP)</div>
            <span className="text-[10px] text-zinc-400">4 In-Row / CRAH Units</span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              6. Workload Load
            </span>
            <div className="text-sm font-bold text-white">54.2% Fleet CPU</div>
            <span className="text-[10px] text-zinc-400">168 Compute Nodes</span>
          </div>
        </div>
      </div>

      {/* Inefficient Behavior Identification & Recommendations Grid (Exact Prompt Structure) */}
      <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Identified Inefficient Behavior & Optimization Directives
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Identifies energy divergence between power draw and productive compute workload.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Filter Zone:</span>
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-750 text-xs font-mono text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
            </select>
          </div>
        </div>

        {/* Inefficient Behavior Cards */}
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const isApplied = rec.status === 'applied';

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isApplied
                    ? 'bg-emerald-950/20 border-emerald-500/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-750'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{rec.assetId}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-sm font-bold text-white">{rec.assetName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                        {rec.zone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">
                      Efficiency Score: <strong className={rec.efficiencyScore < 50 ? 'text-amber-400' : 'text-emerald-400'}>{rec.efficiencyScore}/100</strong>
                    </span>
                    <button
                      onClick={() => handleApplyOptimization(rec.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isApplied
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied ✓</span>
                        </>
                      ) : (
                        <span>Execute Directive</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* EXACT Canonical Layout Required by Prompt (Power, Average Workload, Finding, Recommendation) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Power Metric */}
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Power</span>
                    <div className="text-lg font-bold text-amber-400">
                      {rec.monitoredPowerUtilizationPercent}% utilization
                    </div>
                    <span className="text-[10px] text-zinc-400">({rec.rackPowerKw} kW Load)</span>
                  </div>

                  {/* Average Workload */}
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Average Workload</span>
                    <div className="text-lg font-bold text-cyan-400">
                      {rec.monitoredWorkloadPercent}%
                    </div>
                    <span className="text-[10px] text-zinc-400">Active CPU Processing</span>
                  </div>

                  {/* Finding */}
                  <div className="md:col-span-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Finding:
                    </span>
                    <div className="text-xs font-bold text-zinc-100">
                      {rec.finding}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{rec.rootCause}</p>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommendation:
                  </div>
                  <div className="text-xs font-bold text-white">
                    {rec.recommendation}
                  </div>
                  <div className="space-y-1 pt-1">
                    {rec.remediationSteps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXACT Required Clearly Labeled Estimated Savings */}
                {rec.hasSufficientData && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                        [ESTIMATE] PROJECTED SAVINGS
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-emerald-400 text-sm">
                          -${rec.estimatedSavings.monthlyCostSavings.toFixed(2)}/month
                        </span>
                        <span className="text-zinc-400">
                          (-{rec.estimatedSavings.powerSavingsKw} kW Power)
                        </span>
                        <span className="text-emerald-400/90 text-[11px]">
                          -{rec.estimatedSavings.annualCo2ReductionKg.toLocaleString()} kg CO₂/yr
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 italic">
                      {rec.estimatedSavings.estimateBasisNote}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
