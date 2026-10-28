import React, { useState } from 'react';
import {
  Boxes,
  Cpu,
  HardDrive,
  Network,
  Power,
  Server,
  Thermometer,
  Zap,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info,
  Shield,
  Activity,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { RackUnit, ServerDevice } from '../types';

interface RackManagementViewProps {
  selectedRackId?: string;
}

export const RackManagementView: React.FC<RackManagementViewProps> = ({
  selectedRackId = 'R-04',
}) => {
  const engine = TelemetryEngine.getInstance();
  const racks = engine.racks;
  const [currentRackId, setCurrentRackId] = useState(selectedRackId);
  const [inspectedServer, setInspectedServer] = useState<ServerDevice | null>(null);

  const currentRack = racks.find((r) => r.id === currentRackId) || racks[0];

  // Generate 42U rack slots
  const uSlots: { u: number; server?: ServerDevice; isOccupied: boolean; isTopSlotOfMultiU: boolean }[] = [];
  
  // Track mapped slots to prevent duplicate rendering of 2U/4U servers
  const occupiedSlotMap = new Map<number, ServerDevice>();
  currentRack.servers.forEach((s) => {
    for (let u = s.uPosition; u < s.uPosition + s.uHeight; u++) {
      occupiedSlotMap.set(u, s);
    }
  });

  for (let u = 42; u >= 1; u--) {
    const server = occupiedSlotMap.get(u);
    const isTopSlotOfMultiU = server ? server.uPosition + server.uHeight - 1 === u : false;
    uSlots.push({
      u,
      server,
      isOccupied: Boolean(server),
      isTopSlotOfMultiU,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Rack Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel border border-white/[0.08] p-6 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Boxes className="w-5 h-5 text-orange-400" />
              42U Enterprise Rack Elevation
            </h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                currentRack.status === 'critical'
                  ? 'bg-rose-500/20 text-rose-300'
                  : currentRack.status === 'warning'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {currentRack.status}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Physical chassis inspection, PDU loads, and per-unit thermal mapping.
          </p>
        </div>

        {/* Rack Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 font-mono font-semibold">SELECT RACK:</label>
          <select
            value={currentRack.id}
            onChange={(e) => {
              setCurrentRackId(e.target.value);
              setInspectedServer(null);
            }}
            className="bg-zinc-900 border border-zinc-700 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            {racks.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} ({r.zone}) - {r.inletTempC}°C | {r.currentPowerKw} kW
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: 42U Elevation + Rack Stats & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: 42U Chassis Elevation Frame */}
        <div className="lg:col-span-6 glass-panel border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono text-zinc-400">
            <span className="text-white font-bold">{currentRack.id} FRONT ELEVATION</span>
            <span>42U EIA-310 Standard</span>
          </div>

          {/* Top-of-Rack Switch Header U42-U41 */}
          <div className="mt-3 p-2 bg-zinc-900/90 border border-zinc-700 rounded-t-lg flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Arista 7050SX3 48x25GbE + 6x100GbE ToR Switch</span>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">● LINK OK</span>
          </div>

          {/* 42U Slots Scrollable View */}
          <div className="border-x border-b border-zinc-800 bg-[#0c0c0e] p-2 space-y-1 max-h-[640px] overflow-y-auto custom-scrollbar">
            {uSlots.map(({ u, server, isOccupied }) => {
              if (server) {
                // If it's a multi-U server, only render the block once at the top U slot
                if (server.uPosition + server.uHeight - 1 !== u) {
                  return null; // Skip lower slots of multi-U
                }

                const isSelected = inspectedServer?.id === server.id;
                const isCritical = server.status === 'critical';
                const isWarning = server.status === 'warning';

                return (
                  <div
                    key={server.id}
                    onClick={() => setInspectedServer(server)}
                    style={{ height: `${server.uHeight * 36}px` }}
                    className={`rounded-md border p-2 flex items-center justify-between transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                        : isCritical
                        ? 'bg-rose-950/40 border-rose-600/70 hover:bg-rose-900/40'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-600/60 hover:bg-amber-900/30'
                        : 'bg-zinc-900/90 border-zinc-700/80 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 w-6">
                        U{server.uPosition}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCritical
                                ? 'bg-rose-500 animate-ping'
                                : isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-400'
                            }`}
                          ></span>
                          {server.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {server.model} ({server.workloadType})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="hidden sm:flex flex-col text-right">
                        <span className="text-zinc-300">{server.telemetry.powerDrawWatts}W</span>
                        <span className="text-[10px] text-zinc-500">{server.telemetry.cpuTemp}°C</span>
                      </div>
                      <div
                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase font-mono ${
                          isCritical
                            ? 'bg-rose-500 text-white'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {server.telemetry.cpuUsage}% CPU
                      </div>
                    </div>
                  </div>
                );
              }

              // Empty slot
              return (
                <div
                  key={`empty-${u}`}
                  className="h-7 border border-dashed border-zinc-800/60 rounded flex items-center justify-between px-2 text-[10px] font-mono text-zinc-600 bg-zinc-950/40"
                >
                  <span>U{u}</span>
                  <span className="italic opacity-60">Empty Bay (Blanking Panel Installed)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Rack Telemetry Stats & Server Inspector */}
        <div className="lg:col-span-6 space-y-6">
          {/* Rack Telemetry Card */}
          <div className="glass-panel border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              {currentRack.name} Health & Power
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-zinc-500 text-[10px] uppercase">Inlet Cold Temp</span>
                <div className="text-base font-bold text-white mt-1">{currentRack.inletTempC}°C</div>
                <span className="text-[10px] text-emerald-400">Target &lt; 24°C</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-zinc-500 text-[10px] uppercase">Outlet Exhaust</span>
                <div className="text-base font-bold text-white mt-1">{currentRack.outletTempC}°C</div>
                <span className="text-[10px] text-zinc-400">Delta T: +{(currentRack.outletTempC - currentRack.inletTempC).toFixed(1)}°C</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-zinc-500 text-[10px] uppercase">Current Power</span>
                <div className="text-base font-bold text-orange-400 mt-1">{currentRack.currentPowerKw} kW</div>
                <span className="text-[10px] text-zinc-400">Cap: {currentRack.maxPowerKw} kW</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-zinc-500 text-[10px] uppercase">Total Weight</span>
                <div className="text-base font-bold text-white mt-1">{currentRack.weightKg} kg</div>
                <span className="text-[10px] text-zinc-400">Max 1000 kg</span>
              </div>
            </div>

            {/* Power Utilization Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                <span>Power Utilization ({((currentRack.currentPowerKw / currentRack.maxPowerKw) * 100).toFixed(0)}%)</span>
                <span>{currentRack.currentPowerKw} / {currentRack.maxPowerKw} kW</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    currentRack.currentPowerKw > 13 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : currentRack.currentPowerKw > 11 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  }`}
                  style={{ width: `${(currentRack.currentPowerKw / currentRack.maxPowerKw) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Inspected Server Detail Drawer */}
          {inspectedServer ? (
            <div className="glass-panel border border-orange-500/40 rounded-3xl p-6 space-y-4 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-orange-400" />
                    {inspectedServer.name}
                  </h4>
                  <span className="text-xs text-zinc-400 font-mono">
                    IP: {inspectedServer.ipAddress} | MAC: {inspectedServer.macAddress}
                  </span>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase font-bold ${
                    inspectedServer.status === 'critical'
                      ? 'bg-rose-500 text-white'
                      : inspectedServer.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {inspectedServer.status}
                </span>
              </div>

              {/* Hardware Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 text-[10px]">CPU Cores</span>
                  <div className="font-bold text-white">{inspectedServer.cpuCores} Cores</div>
                </div>
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 text-[10px]">Memory</span>
                  <div className="font-bold text-white">{inspectedServer.ramGb} GB ECC</div>
                </div>
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 text-[10px]">NVMe Storage</span>
                  <div className="font-bold text-white">{inspectedServer.storageTb} TB Array</div>
                </div>
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 text-[10px]">Fan Velocity</span>
                  <div className="font-bold text-cyan-400">{inspectedServer.telemetry.fanSpeedRpm} RPM</div>
                </div>
              </div>

              {/* Live Gauges */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">CPU Die Temperature ({inspectedServer.telemetry.cpuTemp}°C)</span>
                  <span className={inspectedServer.telemetry.cpuTemp > 75 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {inspectedServer.telemetry.cpuTemp > 75 ? 'Thermal Throttling' : 'Nominal'}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      inspectedServer.telemetry.cpuTemp > 75 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(inspectedServer.telemetry.cpuTemp / 100) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-zinc-400">RAM Utilization ({inspectedServer.telemetry.ramUsage}%)</span>
                  <span className="text-zinc-300">{Math.round((inspectedServer.ramGb * inspectedServer.telemetry.ramUsage) / 100)} GB / {inspectedServer.ramGb} GB</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${inspectedServer.telemetry.ramUsage}%` }}></div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setInspectedServer(null)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-lg font-mono hover:bg-zinc-700"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 font-mono text-xs space-y-2">
              <Server className="w-8 h-8 mx-auto text-zinc-600" />
              <div>Click any server chassis in the 42U rack to view granular hardware metrics, BIOS logs, and telemetry.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
