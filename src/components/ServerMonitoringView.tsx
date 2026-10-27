import React, { useState } from 'react';
import {
  Server,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  Cpu,
  Thermometer,
  Zap,
  Activity,
  HardDrive,
  Network,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { ServerDevice, ServerStatus } from '../types';

export const ServerMonitoringView: React.FC = () => {
  const engine = TelemetryEngine.getInstance();
  const racks = engine.racks;
  const allServers = racks.flatMap((r) => r.servers);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedServer, setSelectedServer] = useState<ServerDevice | null>(null);

  const filteredServers = allServers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.rackId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ipAddress.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || server.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono">
              Server Fleet Telemetry & Hardware Matrix
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
              {allServers.length} Active Nodes
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time multi-variate telemetry stream across all compute, database, and virtualization hosts.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Hostname, IP, Rack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({allServers.length})</option>
            <option value="healthy">Healthy Only</option>
            <option value="warning">Warning Only</option>
            <option value="critical">Critical Only</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Server Node</th>
                <th className="p-4">Location</th>
                <th className="p-4">Health Score</th>
                <th className="p-4">CPU Usage</th>
                <th className="p-4">Die Temp</th>
                <th className="p-4">Memory</th>
                <th className="p-4">Power</th>
                <th className="p-4">Network I/O</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredServers.map((server) => {
                const isCritical = server.status === 'critical';
                const isWarning = server.status === 'warning';
                return (
                  <tr
                    key={server.id}
                    className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedServer(server)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                        {server.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">{server.id} ({server.model})</div>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300 font-semibold">{server.rackId}</span>
                      <span className="text-zinc-500 text-[10px]"> / U{server.uPosition}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            server.healthScore > 80
                              ? 'text-emerald-400'
                              : server.healthScore > 60
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {server.healthScore}/100
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={server.telemetry.cpuUsage > 85 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                          {server.telemetry.cpuUsage}%
                        </span>
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              server.telemetry.cpuUsage > 85 ? 'bg-rose-500' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${server.telemetry.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          server.telemetry.cpuTemp > 75
                            ? 'text-rose-400 font-bold'
                            : server.telemetry.cpuTemp > 65
                            ? 'text-amber-400 font-medium'
                            : 'text-zinc-300'
                        }
                      >
                        {server.telemetry.cpuTemp}°C
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300">{server.telemetry.ramUsage}%</span>
                      <span className="text-zinc-500 text-[10px]"> ({server.ramGb}GB)</span>
                    </td>
                    <td className="p-4">
                      <span className="text-orange-400 font-medium">{server.telemetry.powerDrawWatts} W</span>
                    </td>
                    <td className="p-4 text-zinc-400 text-[11px]">
                      ↓{server.telemetry.networkInMbps}M / ↑{server.telemetry.networkOutMbps}M
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {server.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServer(server);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for inspected server */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e11] border border-zinc-700 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold font-mono text-white">{selectedServer.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedServer.id} | IP: {selectedServer.ipAddress}
                </span>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-[10px]">CPU Cores</span>
                <div className="text-sm font-bold text-white mt-1">{selectedServer.cpuCores} vCPUs</div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-[10px]">Memory ECC</span>
                <div className="text-sm font-bold text-white mt-1">{selectedServer.ramGb} GB</div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-[10px]">Storage Array</span>
                <div className="text-sm font-bold text-white mt-1">{selectedServer.storageTb} TB NVMe</div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Operating System:</span>
                <span className="text-zinc-200">{selectedServer.os}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Hardware Serial:</span>
                <span className="text-zinc-200">{selectedServer.serialNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Warranty Expiration:</span>
                <span className="text-emerald-400">{selectedServer.warrantyExpireDate}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Uptime:</span>
                <span className="text-zinc-200">{selectedServer.telemetry.uptimeHours} Hours</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedServer(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
