import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Zap,
  DollarSign,
  Gauge,
  Boxes,
  Thermometer,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Server,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
} from 'lucide-react';
import {
  WhatIfSimulationEngine,
  WhatIfSimulationInput,
  WhatIfScenarioType,
} from '../services/whatIfEngine';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { simulationService } from '../services/api';

export const WhatIfSandbox: React.FC = () => {
  const engine = WhatIfSimulationEngine.getInstance();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [input, setInput] = useState<WhatIfSimulationInput>({
    scenarioType: 'add_servers',
    targetRack: 'RACK-05',
    serverCount: 20, // Canonical example
    perServerPowerWatts: 550,
    avgCpuLoadPercent: 75,
    networkBandwidthGbps: 10,
    workloadType: 'AI Model Inference & Vector Database',
    coolingEfficiencyCop: 3.5,
    sourceRackForRelocation: 'RACK-02',
  });

  const result = engine.simulate(input);

  const handleSaveToDatabase = async () => {
    try {
      setSaveStatus('Saving scenario to MongoDB...');
      await simulationService.saveRun({
        scenarioName: `${scenarioPresets.find((p) => p.type === input.scenarioType)?.label || 'What-If'} (${input.targetRack})`,
        scenarioType: input.scenarioType,
        inputConfiguration: input,
        affectedRackOrResources: [input.targetRack],
        calculatedPowerImpact: result.addedPowerKw,
        coolingImpact: result.coolingPercent,
        capacityImpact: result.rackCapacityPercent,
        riskAssessment: result.riskLevel,
        decisionSummary: result.decisionSummary,
        recommendations: result.detailedRecommendations,
        result,
      });
      setSaveStatus('✅ Scenario persisted to MongoDB!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setSaveStatus(`❌ Failed to save: ${err.message}`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const scenarioPresets: Array<{ type: WhatIfScenarioType; label: string; desc: string }> = [
    { type: 'add_servers', label: 'Add Servers', desc: 'Deploy high-density compute nodes onto target rack' },
    { type: 'remove_servers', label: 'Remove Servers', desc: 'Decommission legacy chassis to free U-space and power' },
    { type: 'increase_workload', label: 'Increase Workload', desc: 'Simulate high CPU tensor batch processing surge' },
    { type: 'increase_power', label: 'Increase Power Demand', desc: 'Test GPU TDP power capping threshold excursions' },
    { type: 'cooling_failure', label: 'Cooling Failure', desc: 'Simulate in-row CRAC chiller trip and thermal plume' },
    { type: 'ups_degradation', label: 'UPS Degradation', desc: 'Simulate battery bank impedance rise and runtime loss' },
    { type: 'server_shutdown', label: 'Server Shutdown', desc: 'Simulate emergency load-shedding and node shutdown' },
    { type: 'rack_relocation', label: 'Rack Relocation', desc: 'Relocate blade chassis from one rack to another' },
  ];

  const availableRacks = ['RACK-01', 'RACK-02', 'RACK-03', 'RACK-04', 'RACK-05', 'RACK-06', 'RACK-07', 'RACK-08', 'RACK-09', 'RACK-10', 'RACK-11', 'RACK-12'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Sandbox Isolation Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0d] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                  FEATURE 5 — What-If Infrastructure Planning Simulator
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  Zero Production Impact
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Simulate deployment, power surges, cooling loss, and rack relocation in an isolated mathematical digital twin.
              </p>
            </div>
          </div>
        </div>

        {/* Sandbox Guarantee Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sandbox Mode (Physical Infrastructure Unmodified)</span>
        </div>
      </div>

      {/* Scenario Type Selection Tabs */}
      <div className="bg-[#0a0a0d] border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
        <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider">
          Select Simulation Scenario:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
          {scenarioPresets.map((s) => (
            <button
              key={s.type}
              onClick={() => setInput({ ...input, scenarioType: s.type })}
              className={`p-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 ${
                input.scenarioType === s.type
                  ? 'bg-gradient-to-b from-cyan-600 to-blue-700 text-white font-bold shadow-md shadow-cyan-950/40 border border-cyan-400/50'
                  : 'bg-zinc-900/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span className="text-[11px] leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Input Parameters (Left) vs Real-Time Simulated Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simulation Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              Scenario Configuration
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
              {input.scenarioType.replace('_', ' ')}
            </span>
          </div>

          {/* Target Rack Selector */}
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-zinc-400 text-[11px] flex items-center justify-between">
              <span>Target Rack:</span>
              <span className="text-cyan-400 font-bold">{input.targetRack}</span>
            </label>
            <select
              value={input.targetRack}
              onChange={(e) => setInput({ ...input, targetRack: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-750 text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {availableRacks.map((r) => (
                <option key={r} value={r}>
                  {r} (42U Chassis Bay)
                </option>
              ))}
            </select>
          </div>

          {/* Server Count Slider / Input */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Server Count to Modify:</span>
              <strong className="text-cyan-300 text-sm">{input.serverCount} Servers</strong>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={input.serverCount}
              onChange={(e) => setInput({ ...input, serverCount: parseInt(e.target.value) || 1 })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>1 Server</span>
              <span>20 Servers (Canonical)</span>
              <span>40 Servers (Full Rack)</span>
            </div>
          </div>

          {/* Per-Server Power Draw (Watts) */}
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-zinc-400 text-[11px] flex items-center justify-between">
              <span>Power Rating per Server:</span>
              <span className="text-amber-400 font-bold">{input.perServerPowerWatts} W / node</span>
            </label>
            <select
              value={input.perServerPowerWatts}
              onChange={(e) => setInput({ ...input, perServerPowerWatts: parseInt(e.target.value) || 550 })}
              className="w-full bg-zinc-900 border border-zinc-750 text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="350">350W — Storage Node (NVMe-oF / Ceph)</option>
              <option value="550">550W — Enterprise Compute (Dual Xeon / EPYC)</option>
              <option value="850">850W — GPU High-Density Acceleration (4x L40S)</option>
              <option value="1200">1200W — AI Deep Learning Node (8x H100 SXM5)</option>
            </select>
          </div>

          {/* Expected CPU Load */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Projected Average CPU Load:</span>
              <strong className="text-orange-400">{input.avgCpuLoadPercent}%</strong>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={input.avgCpuLoadPercent}
              onChange={(e) => setInput({ ...input, avgCpuLoadPercent: parseInt(e.target.value) || 20 })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Workload Profile Name */}
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-zinc-400 text-[11px]">Workload Profile Specification:</label>
            <input
              type="text"
              value={input.workloadType}
              onChange={(e) => setInput({ ...input, workloadType: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-750 text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Right Column: Exact Requested Simulated Impact Output (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Decision & Output Hero Card (Exact Prompt Structure) */}
          <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Simulation Target Result</span>
                <h3 className="text-base font-bold text-white">
                  {input.scenarioType === 'add_servers' ? `Add ${input.serverCount} Servers on ${input.targetRack}` : `${input.scenarioType.replace('_', ' ').toUpperCase()} on ${input.targetRack}`}
                </h3>
              </div>

              {/* Save to Database & Decision Output Badge */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Save to MongoDB
                </button>

                <div className="px-4 py-2 bg-zinc-950 border border-zinc-750 rounded-xl shadow-md flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Decision:</span>
                  <span className={`text-sm font-black uppercase ${
                    result.riskLevel === 'HIGH RISK' ? 'text-amber-400 animate-pulse' : result.riskLevel === 'CRITICAL RISK' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {result.decisionBadge}
                  </span>
                </div>
              </div>
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300 font-mono flex items-center justify-between">
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Exact Required Primary Output Metrics (Rack Capacity, Power, Cooling) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Rack Capacity */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Rack Capacity</span>
                <div className="text-2xl font-black text-cyan-400">
                  Rack Capacity: {result.rackCapacityPercent}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  Baseline: {result.baseline.rackCapacityPercent}% ({result.availableSpaceU}U available)
                </div>
              </div>

              {/* Power */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Power Utilization</span>
                <div className="text-2xl font-black text-amber-400">
                  Power: {result.powerPercent}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  Total: {result.totalFacilityPowerKw} kW (+{result.addedPowerKw} kW)
                </div>
              </div>

              {/* Cooling */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Cooling Load</span>
                <div className="text-2xl font-black text-rose-400">
                  Cooling: {result.coolingPercent}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  COP: {input.coolingEfficiencyCop} (PUE: {result.projectedPue})
                </div>
              </div>
            </div>

            {/* Exact Required Recommendation Box */}
            <div className="p-4 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-xl space-y-1.5">
              <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommendation:
              </span>
              <p className="text-sm font-bold text-zinc-100">
                {result.recommendation}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {result.decisionSummary}
              </p>
            </div>

            {/* All 9 Impact Variables Detailed Breakdown Matrix */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                Full 9-Dimension Telemetry Impact Matrix:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">1. Rack Capacity</span>
                  <div className="font-bold text-white mt-0.5">{result.rackCapacityPercent}% Occupied</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">2. Facility Power</span>
                  <div className="font-bold text-amber-400 mt-0.5">{result.powerPercent}% ({result.totalFacilityPowerKw} kW)</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">3. Cooling Heat</span>
                  <div className="font-bold text-rose-400 mt-0.5">{result.coolingPercent}% Load</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">4. CPU Load</span>
                  <div className="font-bold text-cyan-400 mt-0.5">{result.cpuPercent}% Utilization</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">5. Network Fabric</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{result.networkPercent}% Throughput</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">6. UPS Reserve</span>
                  <div className="font-bold text-purple-400 mt-0.5">{result.upsLoadPercent}% Inverter Load</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">7. Rack PDU Feed</span>
                  <div className="font-bold text-orange-400 mt-0.5">{result.pduLoadPercent}% Phase Circuit</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">8. Available Space</span>
                  <div className="font-bold text-white mt-0.5">{result.availableSpaceU}U Contiguous Bays</div>
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 text-[10px] uppercase">9. Composite Risk</span>
                  <div className={`font-bold mt-0.5 ${result.riskLevel === 'HIGH RISK' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottlenecks and Pre-Deployment Directives */}
            {result.bottlenecks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  Specific Engineering Directives:
                </span>
                <div className="space-y-1.5 text-xs">
                  {result.detailedRecommendations.map((dir, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 text-zinc-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
