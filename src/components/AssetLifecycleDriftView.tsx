import React, { useState } from 'react';
import {
  Boxes,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Sparkles,
  Activity,
  History,
  FileCheck,
} from 'lucide-react';
import {
  assetLifecycleSeedRecords,
  predictiveMaintenanceSeedTasks,
  configurationDriftSeedRecords,
} from '../services/assetDriftEngine';
import {
  AssetLifecycleRecord,
  PredictiveMaintenanceTask,
  ConfigurationDriftRecord,
} from '../types';

export const AssetLifecycleDriftView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drift' | 'maintenance' | 'lifecycle'>('drift');
  const [driftRecords, setDriftRecords] = useState<ConfigurationDriftRecord[]>(
    configurationDriftSeedRecords
  );
  const [maintenanceTasks, setMaintenanceTasks] = useState<PredictiveMaintenanceTask[]>(
    predictiveMaintenanceSeedTasks
  );
  const [assets, setAssets] = useState<AssetLifecycleRecord[]>(assetLifecycleSeedRecords);

  const [selectedDriftId, setSelectedDriftId] = useState<string>('DRIFT-001');
  const selectedDrift =
    driftRecords.find((d) => d.id === selectedDriftId) || driftRecords[0];

  const [selectedTaskId, setSelectedTaskId] = useState<string>('PM-TASK-SRV-004');
  const selectedTask =
    maintenanceTasks.find((t) => t.id === selectedTaskId) || maintenanceTasks[0];

  const getLifecycleBadge = (state: AssetLifecycleRecord['lifecycleState']) => {
    switch (state) {
      case 'Operational':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'Maintenance':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Installed':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'Purchased':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'End of Life':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'Retired':
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Boxes className="w-5 h-5 text-orange-400" />
              Asset Lifecycle, Maintenance & Configuration Drift
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Features 14, 15 & 16
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Expected vs actual configuration drift detection, 14-day predictive maintenance scheduling, and 6-stage lifecycle tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'drift'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Config Drift</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Predictive Maintenance</span>
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lifecycle'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Asset Lifecycle</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FEATURE 16 — CONFIGURATION DRIFT DETECTION */}
      {activeTab === 'drift' && (
        <div className="space-y-6">
          {/* Canonical Drift Hero Card (SERVER-004 Rack-03 -> Rack-05) */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950/20 border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                      ⚠️ CONFIGURATION DRIFT DETECTED
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold uppercase">
                      {selectedDrift.severity}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedDrift.deviceName} ({selectedDrift.deviceId})
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                {driftRecords.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriftId(d.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedDriftId === d.id
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {d.deviceId}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Prompt Required Expected vs Detected Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">
                  Expected Configuration (Baseline / Golden Image):
                </span>
                <div className="text-base font-bold text-emerald-400">
                  {selectedDrift.expected}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">
                  Verified in DCIM Central Database
                </div>
              </div>

              <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-rose-400 font-bold">
                  Detected Live State (Telemetry Discovery):
                </span>
                <div className="text-base font-bold text-rose-300">
                  {selectedDrift.detected}
                </div>
                <div className="text-[10px] text-rose-400 mt-1">
                  Discovered via LLDP & Redfish scan at {selectedDrift.detectedAt}
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-orange-400" />
                  Audit Trail & Drift Provenance ({selectedDrift.auditHistory.length} events)
                </span>
                <span className="text-[10px] text-zinc-500">Immutable Audit Log</span>
              </div>

              <div className="space-y-2">
                {selectedDrift.auditHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-bold">{item.timestamp}</span>
                        <span className="text-white font-medium">{item.changedBy}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{item.changeSummary}</p>
                    </div>
                    <div className="text-right text-[11px] text-zinc-400 shrink-0">
                      <span>{item.previousValue}</span>
                      <ArrowRight className="w-3 h-3 inline mx-1 text-zinc-600" />
                      <span className="text-rose-400 font-bold">{item.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE 14 — PREDICTIVE MAINTENANCE SCHEDULER */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Canonical Maintenance Task Hero Card (SERVER-004) */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Wrench className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                      Predictive Maintenance Schedule
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500 text-black font-mono font-extrabold uppercase">
                      {selectedTask.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedTask.targetDevice} ({selectedTask.component})
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                {maintenanceTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedTaskId === t.id
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t.targetDevice}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Required Prompt Format Display */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Target Device:</span>
                <div className="text-base font-bold text-white">{selectedTask.targetDevice}</div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-amber-400 font-bold">Maintenance Risk:</span>
                <div className="text-base font-extrabold text-amber-400 uppercase">
                  {selectedTask.maintenanceRisk}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Suggested Window:</span>
                <div className="text-xs font-bold text-cyan-400">{selectedTask.suggestedWindow}</div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Recommended Maintenance:</span>
                <div className="text-xs font-bold text-emerald-400">{selectedTask.recommendedMaintenance}</div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs">
              <span className="text-amber-400 font-bold uppercase text-[10px]">Reason:</span>
              <p className="text-zinc-200 leading-relaxed font-bold">{selectedTask.reason}</p>
              <div className="text-zinc-400 text-[11px] pt-1">
                <strong>Telemetry Evidence:</strong> {selectedTask.telemetryEvidence}
              </div>
            </div>

            {/* Historical Maintenance Logs that Feed the Prediction Model */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Maintenance History (Feeds Continuous Learning Model)
                </span>
                <span className="text-[10px] text-zinc-500">Historical MTBF/MTTR Data</span>
              </div>

              <div className="space-y-2">
                {selectedTask.maintenanceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{item.date}</span>
                        <span className="text-white">{item.action}</span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-0.5">Outcome: {item.outcome}</div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      Tech: {item.technician}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE 15 — ASSET LIFECYCLE INTELLIGENCE */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          {/* 6-Stage Lifecycle Flowchart Header */}
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  6-Stage Enterprise Asset Lifecycle Pipeline
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Continuous tracking from procurement through end-of-life decommission.
                </p>
              </div>
            </div>

            {/* Pipeline Step Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs text-center">
              {['Purchased', 'Installed', 'Operational', 'Maintenance', 'End of Life', 'Retired'].map(
                (stage, idx) => (
                  <div
                    key={stage}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1"
                  >
                    <span className="text-[10px] text-zinc-500">Stage 0{idx + 1}</span>
                    <div className="font-bold text-white text-xs">{stage}</div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Full Asset Inventory Table */}
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Data Center Hardware Inventory ({assets.length} Tracked Assets)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Asset / Name</th>
                    <th className="pb-3 font-semibold">Vendor & Model</th>
                    <th className="pb-3 font-semibold">Serial & Firmware</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Age / Warranty</th>
                    <th className="pb-3 font-semibold">Lifecycle State</th>
                    <th className="pb-3 font-semibold text-right">Health Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 font-bold text-white">
                        {asset.name}
                        <div className="text-[10px] text-zinc-500">{asset.id}</div>
                      </td>
                      <td className="py-3 text-zinc-300">
                        {asset.vendor}
                        <div className="text-[10px] text-zinc-500">{asset.model}</div>
                      </td>
                      <td className="py-3 text-zinc-400">
                        {asset.serialNumber}
                        <div className="text-[10px] text-orange-400">{asset.firmware}</div>
                      </td>
                      <td className="py-3 text-zinc-300 text-[11px] truncate max-w-xs" title={asset.location}>
                        {asset.location}
                      </td>
                      <td className="py-3">
                        <div className="text-zinc-300">{asset.ageMonths} mo</div>
                        <div
                          className={`text-[10px] ${
                            asset.isWarrantyActive ? 'text-emerald-400' : 'text-rose-400 font-bold'
                          }`}
                        >
                          {asset.isWarrantyActive ? 'Active' : 'Expired'} ({asset.warrantyExpiry})
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getLifecycleBadge(
                            asset.lifecycleState
                          )}`}
                        >
                          {asset.lifecycleState}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-400">
                        {asset.healthScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
