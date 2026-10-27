import React, { useState } from 'react';
import {
  GitBranch,
  Zap,
  Wind,
  Server,
  AlertTriangle,
  Layers,
  ShieldAlert,
  ArrowDown,
  ArrowRight,
  Activity,
  CheckCircle2,
  Sliders,
  Cpu,
  RefreshCw,
  Search,
  Eye,
  Boxes,
} from 'lucide-react';
import { DependencyGraphEngine } from '../services/dependencyGraphEngine';
import { DependencyGraphNode, FailureImpactResult } from '../types';

export const DependencyGraphView: React.FC = () => {
  const engine = DependencyGraphEngine.getInstance();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('SERVER-001');
  const [impactResult, setImpactResult] = useState<FailureImpactResult | null>(
    engine.simulateFailureImpact('UPS-01')
  );
  const [activeChain, setActiveChain] = useState<'all' | 'power' | 'cooling'>('all');

  const selectedNode = engine.nodes.find((n) => n.id === selectedNodeId) || engine.nodes[0];

  const handleSimulateImpact = (nodeId: string) => {
    const res = engine.simulateFailureImpact(nodeId);
    setImpactResult(res);
  };

  const getNodeColor = (type: DependencyGraphNode['type'], status: DependencyGraphNode['status']) => {
    if (status === 'critical') return 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
    if (status === 'warning') return 'bg-amber-950/80 border-amber-500 text-amber-200';
    switch (type) {
      case 'power_system':
        return 'bg-purple-950/60 border-purple-500 text-purple-200';
      case 'ups':
        return 'bg-amber-950/60 border-amber-500 text-amber-200';
      case 'pdu':
        return 'bg-yellow-950/60 border-yellow-500 text-yellow-200';
      case 'cooling_zone':
        return 'bg-cyan-950/60 border-cyan-500 text-cyan-200';
      case 'rack':
        return 'bg-blue-950/60 border-blue-500 text-blue-200';
      case 'server':
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-400" />
              Infrastructure Dependency Graph & Topology
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Feature 10 & 17
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            End-to-end topological lineage for RCA, failure impact simulation, and cross-domain incident correlation.
          </p>
        </div>

        {/* Chain Selector Filter */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveChain('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeChain === 'all'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Topologies
          </button>
          <button
            onClick={() => setActiveChain('power')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeChain === 'power'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power Chain</span>
          </button>
          <button
            onClick={() => setActiveChain('cooling')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeChain === 'cooling'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Cooling Chain</span>
          </button>
        </div>
      </div>

      {/* FEATURE 10 CANONICAL POWER & COOLING DEPENDENCY FLOWCHART HERO */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/20 border-2 border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Hierarchical Multi-Domain Lineage Chains
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strict upstream-downstream power distribution and thermal airflow containment mappings.
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
            Click any node to inspect & simulate failure
          </span>
        </div>

        {/* Dual Chain Flowchart Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* 1. POWER CHAIN (SERVER-001 -> RACK-05 -> PDU-05 -> UPS-01 -> POWER SYSTEM) */}
          <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Power Distribution Hierarchy
              </span>
              <span className="text-[10px] text-zinc-500">5 Tier Lineage</span>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-1">
              {/* Node 1: SERVER-001 */}
              <div
                onClick={() => {
                  setSelectedNodeId('SERVER-001');
                  handleSimulateImpact('SERVER-001');
                }}
                className={`w-full p-2.5 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'server',
                  'healthy'
                )} ${selectedNodeId === 'SERVER-001' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">SERVER-001</div>
                <div className="text-[10px] opacity-80">320W | Compute Node (U12)</div>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-500" />

              {/* Node 2: RACK-05 */}
              <div
                onClick={() => {
                  setSelectedNodeId('RACK-05');
                  handleSimulateImpact('RACK-05');
                }}
                className={`w-full p-2.5 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'rack',
                  'healthy'
                )} ${selectedNodeId === 'RACK-05' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">RACK-05</div>
                <div className="text-[10px] opacity-80">12.1 kW | Zone B Compute Pod</div>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-500" />

              {/* Node 3: PDU-05 */}
              <div
                onClick={() => {
                  setSelectedNodeId('PDU-05');
                  handleSimulateImpact('PDU-05');
                }}
                className={`w-full p-2.5 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'pdu',
                  'healthy'
                )} ${selectedNodeId === 'PDU-05' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">PDU-05</div>
                <div className="text-[10px] opacity-80">74.2 kW | Row-02 Floor Infeed</div>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-500" />

              {/* Node 4: UPS-01 */}
              <div
                onClick={() => {
                  setSelectedNodeId('UPS-01');
                  handleSimulateImpact('UPS-01');
                }}
                className={`w-full p-2.5 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'ups',
                  'healthy'
                )} ${selectedNodeId === 'UPS-01' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span>UPS-01</span>
                  <span className="text-[9px] bg-amber-500/20 px-1.5 rounded text-amber-300">Target Demo</span>
                </div>
                <div className="text-[10px] opacity-80">Liebert EXL 500kVA Train A (312 kW)</div>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-500" />

              {/* Node 5: POWER SYSTEM */}
              <div
                onClick={() => {
                  setSelectedNodeId('POWER-SYS-01');
                  handleSimulateImpact('POWER-SYS-01');
                }}
                className={`w-full p-2.5 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'power_system',
                  'healthy'
                )} ${selectedNodeId === 'POWER-SYS-01' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">POWER SYSTEM</div>
                <div className="text-[10px] opacity-80">115kV/480V Utility Substation Bus</div>
              </div>
            </div>
          </div>

          {/* 2. COOLING CHAIN (SERVER -> RACK -> COOLING ZONE) */}
          <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Wind className="w-4 h-4" /> Thermal Airflow Hierarchy
              </span>
              <span className="text-[10px] text-zinc-500">3 Tier Containment</span>
            </div>

            <div className="flex flex-col items-center space-y-3 pt-4">
              {/* Node 1: SERVER */}
              <div
                onClick={() => {
                  setSelectedNodeId('SERVER-007');
                  handleSimulateImpact('SERVER-007');
                }}
                className={`w-full p-3 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'server',
                  'critical'
                )} ${selectedNodeId === 'SERVER-007' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">SERVER (SERVER-007)</div>
                <div className="text-[10px] opacity-80">76.4°C Die | Oracle Database Master</div>
              </div>

              <ArrowDown className="w-5 h-5 text-zinc-500" />

              {/* Node 2: RACK */}
              <div
                onClick={() => {
                  setSelectedNodeId('RACK-07');
                  handleSimulateImpact('RACK-07');
                }}
                className={`w-full p-3 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'rack',
                  'critical'
                )} ${selectedNodeId === 'RACK-07' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">RACK (RACK-07)</div>
                <div className="text-[10px] opacity-80">29.0°C Inlet (Predicted 34°C in 25m)</div>
              </div>

              <ArrowDown className="w-5 h-5 text-zinc-500" />

              {/* Node 3: COOLING ZONE */}
              <div
                onClick={() => {
                  setSelectedNodeId('COOLING-ZONE-B');
                  handleSimulateImpact('COOLING-ZONE-B');
                }}
                className={`w-full p-3 rounded-xl border text-center cursor-pointer transition-all ${getNodeColor(
                  'cooling_zone',
                  'warning'
                )} ${selectedNodeId === 'COOLING-ZONE-B' ? 'ring-2 ring-orange-400' : ''}`}
              >
                <div className="font-bold">COOLING ZONE (COOLING-ZONE-B)</div>
                <div className="text-[10px] opacity-80">CRAC-03 & CRAH-04 Pod | Damper Restricted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 17 — FAILURE IMPACT ANALYSIS SIMULATOR CARD */}
      {impactResult && (
        <div className="bg-[#0a0a0a] border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                    Feature 17 Failure Blast Radius Analysis
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold uppercase">
                    Impact: {impactResult.impactLevel}
                  </span>
                </div>
                <h3 className="text-base font-bold font-mono text-white mt-0.5">
                  Simulated Outage: {impactResult.failedComponent}
                </h3>
              </div>
            </div>

            <button
              onClick={() => handleSimulateImpact('UPS-01')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold rounded-lg transition-all shadow shrink-0"
            >
              Reset to UPS-01 Failure Demo
            </button>
          </div>

          {/* Canonical Required 3-Point Impact Triad */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">Potentially Affected Servers</span>
              <div className="text-base font-bold text-white">
                {impactResult.affectedServersCount} servers
              </div>
              <div className="text-[10px] text-rose-400">Directly dependent nodes</div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">Potentially Affected Racks</span>
              <div className="text-base font-bold text-white">
                {impactResult.affectedRacksCount} racks
              </div>
              <div className="text-[10px] text-amber-400">RACK-05 & RACK-01</div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">Affected Cooling Zones</span>
              <div className="text-base font-bold text-white">
                {impactResult.affectedCoolingZonesCount} cooling zone
              </div>
              <div className="text-[10px] text-cyan-400">COOLING-ZONE-B</div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">Total Power at Risk</span>
              <div className="text-base font-bold text-yellow-400">
                {impactResult.powerLoadLostKw} kW
              </div>
              <div className="text-[10px] text-zinc-500">62.4% UPS-01 Load</div>
            </div>
          </div>

          {/* Blast Radius Entity List */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              Downstream Dependent Compute Asset Inventory ({impactResult.affectedServers.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {impactResult.affectedServers.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-300 text-[11px] truncate"
                  title={srv}
                >
                  {srv}
                </div>
              ))}
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-orange-400 font-bold uppercase text-[10px] block">
                Automated Failover Mitigation Strategy:
              </span>
              <span className="text-zinc-200">{impactResult.recommendation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
