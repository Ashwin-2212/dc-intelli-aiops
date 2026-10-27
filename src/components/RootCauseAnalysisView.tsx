import React, { useState } from 'react';
import {
  GitBranch,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles,
  Wrench,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Wind,
  Activity,
  Zap,
  Gauge,
  Info,
  ExternalLink,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  FileText,
} from 'lucide-react';
import { buildDetailedRcaIncidents } from '../services/aiEngine';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { RootCauseIncident, RcaEvidenceMetric } from '../types';

interface RootCauseAnalysisViewProps {
  onGenerateWorkOrder: (item: any) => void;
  onOpenCopilot?: (prompt?: string) => void;
}

export const RootCauseAnalysisView: React.FC<RootCauseAnalysisViewProps> = ({
  onGenerateWorkOrder,
  onOpenCopilot,
}) => {
  const engine = TelemetryEngine.getInstance();
  const incidents = buildDetailedRcaIncidents(engine.coolingUnits, engine.racks, engine.upsUnits);
  
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'INC-2026-THM-884');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const currentIncident: RootCauseIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const categories = [
    { id: 'all', label: 'All Evidence Signals' },
    { id: 'compute', label: 'Compute & CPU' },
    { id: 'thermal', label: 'Thermal & Cooling' },
    { id: 'power', label: 'Power & UPS' },
    { id: 'mechanical', label: 'Fans & Bearings' },
    { id: 'network', label: 'Network & Latency' },
    { id: 'health', label: 'Health & Score' },
  ];

  const filteredEvidence = currentIncident.evidenceMatrix.filter(e => {
    if (activeCategoryFilter === 'all') return true;
    return e.category === activeCategoryFilter;
  });

  const deviantCount = currentIncident.evidenceMatrix.filter(e => e.isDeviant).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Incident Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0c] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-400" />
              AI Root Cause Analysis (RCA) Deep-Dive Studio
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Multi-Variate Signal Grounding
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Correlates heterogeneous telemetry from Redfish, SNMP, and Modbus into a probabilistic causal propagation chain. Every conclusion is backed by empirical before-vs-after evidence.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onOpenCopilot?.(
                `Explain the root cause for incident "${currentIncident.incidentTitle}" and verify if CRAC-02 airflow degradation is directly causing the CPU thermal throttling on SRV-R-04-02.`
              )
            }
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-600 text-xs font-mono rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ask Copilot RCA</span>
          </button>

          <button
            onClick={() =>
              onGenerateWorkOrder({
                deviceId: currentIncident.targetAsset,
                deviceName: currentIncident.incidentTitle,
                metric: currentIncident.probableRootCause,
                severity: currentIncident.severity,
              })
            }
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-mono font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>Dispatch Remediation WO</span>
          </button>
        </div>
      </div>

      {/* Incident Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {incidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => setSelectedIncidentId(inc.id)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs transition-all flex items-center gap-2.5 ${
              selectedIncidentId === inc.id
                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-orange-200 shadow-md'
                : 'bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                inc.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold">{inc.id}</span>
            <span className="text-zinc-400">|</span>
            <span className="truncate max-w-xs">{inc.incidentTitle}</span>
          </button>
        ))}
      </div>

      {/* Primary Probable Root Cause Diagnostic Card */}
      <div className="p-6 bg-gradient-to-b from-rose-950/25 via-zinc-900/90 to-zinc-950 border border-rose-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-500" />
              Probable Root Cause Detected
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-normal">{currentIncident.detectedAt}</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-white tracking-tight">
              {currentIncident.probableRootCause}
            </h2>
            <div className="text-xs text-zinc-400 font-mono mt-1">
              Target Infrastructure Asset:{' '}
              <span className="text-amber-400 font-bold">{currentIncident.targetAsset}</span> ({currentIncident.zone})
            </div>
          </div>

          {/* Confidence Badge & Rationale */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">AI Confidence:</span>
              <div className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-mono font-bold text-sm rounded-xl shadow-md flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>{currentIncident.confidenceScore}%</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 text-right max-w-xs">
              Correlated across {currentIncident.evidenceMatrix.length} telemetry streams
            </span>
          </div>
        </div>

        {/* Confidence Rationale & Disclaimer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-orange-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5" />
              Telemetry Grounding Rationale
            </span>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {currentIncident.confidenceRationale}
            </p>
          </div>

          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              Probabilistic Assessment Notice
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed italic">
              {currentIncident.uncertaintyDisclaimer}
            </p>
          </div>
        </div>

        {/* Quick Blast Radius Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
            <span className="text-zinc-500 text-[10px] uppercase">Affected Racks</span>
            <div className="text-sm font-bold text-white mt-1">
              {currentIncident.affectedRacks.join(', ')}
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
            <span className="text-zinc-500 text-[10px] uppercase">Impacted Compute Nodes</span>
            <div className="text-sm font-bold text-rose-400 mt-1">
              {currentIncident.affectedServersCount} Physical Servers
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
            <span className="text-zinc-500 text-[10px] uppercase">Power Load at Risk</span>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {currentIncident.totalPowerAtRiskKw} kW
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
            <span className="text-zinc-500 text-[10px] uppercase">Deviant Signals</span>
            <div className="text-sm font-bold text-orange-400 mt-1">
              {deviantCount} of {currentIncident.evidenceMatrix.length} Spiking
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 1 — Multi-Metric Supporting Evidence Matrix */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Multi-Metric Supporting Evidence Matrix (Before vs Incident Baseline)
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Empirical multi-variate telemetry signals from Redfish, SNMP, and Modbus hardware collectors.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider bg-zinc-900/40">
                <th className="p-3">Telemetry Signal</th>
                <th className="p-3">Source Device</th>
                <th className="p-3">Pre-Incident Baseline</th>
                <th className="p-3">Incident Reading</th>
                <th className="p-3">Delta (Δ)</th>
                <th className="p-3">Signal State</th>
                <th className="p-3">Hardware Sensor Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {filteredEvidence.map((item, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-zinc-900/50 transition-colors ${
                    item.isDeviant ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-zinc-200 flex items-center gap-2">
                    {item.category === 'compute' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                    {item.category === 'thermal' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                    {item.category === 'power' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {item.category === 'mechanical' && <Wind className="w-3.5 h-3.5 text-blue-400" />}
                    {item.category === 'storage' && <Database className="w-3.5 h-3.5 text-purple-400" />}
                    {item.category === 'network' && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.category === 'health' && <Activity className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{item.signalName}</span>
                  </td>
                  <td className="p-3 text-zinc-400">{item.sourceDevice}</td>
                  <td className="p-3 text-zinc-400">{item.beforeBaseline}</td>
                  <td className="p-3 font-bold text-white">
                    <span className={item.isDeviant ? 'text-rose-400' : 'text-zinc-200'}>
                      {item.duringIncident}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        item.deltaPercent > 20
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.deltaPercent < -20
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.deltaPercent > 0 ? `+${item.deltaPercent}%` : `${item.deltaPercent}%`}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.statusText === 'Critical Spike'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.statusText === 'Elevated'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.statusText === 'Degraded'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-zinc-400 font-mono">
                    <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800/80">
                      {item.sensorProvenance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Causal Event Cascade Sequence (Physical to Logical Chain) */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-orange-400" />
              Causal Propagation Sequence (Physical to Logical Cascade)
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Chronological fault progression from physical mechanical failure to silicon PROCHOT throttling and application latency.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {currentIncident.causalPropagationChain.length} Sequential Steps
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-amber-500 before:to-emerald-500">
          {currentIncident.causalPropagationChain.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4 group">
              {/* Step Node */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-mono font-bold shadow ${
                  idx === 0
                    ? 'bg-rose-500 text-white'
                    : idx === currentIncident.causalPropagationChain.length - 1
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {step.stepNumber}
              </div>

              <div className="flex-1 p-4 bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-xs text-zinc-200 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                      {step.phase}
                    </span>
                    <span className="text-white font-bold">{step.actor}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">Step {step.stepNumber}</span>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed">{step.description}</p>

                <div className="p-2.5 bg-black/40 border border-zinc-800/80 rounded-lg text-[11px] text-amber-300/90 font-mono">
                  <span className="text-zinc-400 font-semibold mr-1.5">Supporting Evidence:</span>
                  {step.evidenceSnippet}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Multi-Step Remediation Playbook */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Prescriptive Remediation Playbook
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Prioritized mitigation procedures calculated to restore nominal thermal/power baselines.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {currentIncident.recommendedActions.length} Actions Available
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {currentIncident.recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 text-xs ${
                    action.priority === 'IMMEDIATE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : action.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        action.priority === 'IMMEDIATE'
                          ? 'bg-rose-500 text-white'
                          : action.priority === 'HIGH'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-zinc-200 font-semibold">{action.action}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    <span className="text-zinc-500">Expected Impact:</span> {action.expectedImpact}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <span className="text-[11px] text-zinc-400 font-mono">
                  ~{action.estimatedTimeMinutes} min
                </span>
                <button
                  onClick={() =>
                    onGenerateWorkOrder({
                      deviceId: currentIncident.targetAsset,
                      deviceName: `Step ${idx + 1}: ${action.action}`,
                      metric: 'Remediation Step',
                      severity: action.priority === 'IMMEDIATE' ? 'critical' : 'high',
                    })
                  }
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span>Execute Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
