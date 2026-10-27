import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Server,
  Layers,
  Zap,
  Thermometer,
  Cpu,
  Clock,
  ArrowDownToLine,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TelemetryStorageEngine } from '../services/telemetry/TelemetryStorageEngine';
import { UniversalTelemetryPacket } from '../types/telemetryIntelligence';

interface TelemetryDataExplorerViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryDataExplorerView: React.FC<TelemetryDataExplorerViewProps> = ({ onOpenCopilot }) => {
  const [naturalQuery, setNaturalQuery] = useState<string>('');
  const [assetFilter, setAssetFilter] = useState<string>('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('');
  const [metricKey, setMetricKey] = useState<string>('temperature');
  const [operator, setOperator] = useState<'>' | '<' | '='>('>');
  const [thresholdValue, setThresholdValue] = useState<number>(70);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const storage = TelemetryStorageEngine.getInstance();

  const handleQuickPrompt = (prompt: string) => {
    setNaturalQuery(prompt);
    if (prompt.includes('temperature > 75') || prompt.includes('temp > 70')) {
      setMetricKey('temperature');
      setOperator('>');
      setThresholdValue(70);
    } else if (prompt.includes('CPU > 80')) {
      setMetricKey('cpu');
      setOperator('>');
      setThresholdValue(80);
    } else if (prompt.includes('CRAC') || prompt.includes('cooling')) {
      setAssetTypeFilter('cooling');
    } else if (prompt.includes('UPS')) {
      setAssetTypeFilter('ups');
    }
  };

  const results = storage.queryTelemetry({
    assetId: assetFilter || undefined,
    assetType: assetTypeFilter || undefined,
    status: statusFilter || undefined,
    metricThreshold: thresholdValue ? { metric: metricKey, operator, value: thresholdValue } : undefined,
    limit: 60,
  });

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const headers = ['TelemetryId', 'Timestamp', 'AssetId', 'AssetType', 'CPU', 'Temperature', 'Power', 'Status'];
    const rows = results.map((p) => [
      p.telemetryId,
      p.timestamp,
      p.assetId,
      p.assetType,
      p.metrics.cpu || 0,
      p.metrics.temperature || 0,
      p.metrics.power || 0,
      p.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Telemetry Data Explorer & Safe Query Engine
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Query, filter, slice and audit multi-million telemetry records across high-frequency time corridors.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Results (CSV)
          </button>
        </div>

        {/* Natural Language Query Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Ask or query: e.g. 'Show all servers where temperature > 75°C' or 'Show CRAC cooling units with high power'..."
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            className="w-full bg-black/70 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Query Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="text-zinc-400">Quick Filters:</span>
          <button
            onClick={() => handleQuickPrompt('Show all servers where temperature > 75°C')}
            className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            🔥 Temp &gt; 70°C
          </button>
          <button
            onClick={() => handleQuickPrompt('Show compute nodes with CPU > 80%')}
            className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            ⚡ CPU &gt; 80%
          </button>
          <button
            onClick={() => {
              setAssetTypeFilter('cooling');
              setThresholdValue(0);
            }}
            className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            ❄️ CRAC Units
          </button>
          <button
            onClick={() => {
              setAssetTypeFilter('ups');
              setThresholdValue(0);
            }}
            className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            🔋 UPS Power Banks
          </button>
        </div>
      </div>

      {/* Structured Filter Bar */}
      <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
        <div className="space-y-1">
          <label className="text-zinc-400">Search Asset ID</label>
          <input
            type="text"
            placeholder="e.g. SRV-R-04"
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-zinc-400">Asset Type</label>
          <select
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="server">Server</option>
            <option value="cooling">Cooling (CRAC/CRAH)</option>
            <option value="ups">UPS Battery</option>
            <option value="rack">Rack</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-zinc-400">Metric Condition</label>
          <div className="flex gap-1">
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white focus:outline-none"
            >
              <option value="temperature">Temp</option>
              <option value="cpu">CPU</option>
              <option value="power">Power</option>
              <option value="fan">Fan</option>
            </select>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as any)}
              className="w-1/4 bg-zinc-950 border border-zinc-800 rounded-lg px-1 py-1.5 text-white focus:outline-none"
            >
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value="=">=</option>
            </select>
            <input
              type="number"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(Number(e.target.value))}
              className="w-1/4 bg-zinc-950 border border-zinc-800 rounded-lg px-1 py-1.5 text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-zinc-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setAssetFilter('');
              setAssetTypeFilter('');
              setStatusFilter('');
              setThresholdValue(0);
              setNaturalQuery('');
            }}
            className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Found {results.length} telemetry matches</span>
          <span>Max safe output: 60 records</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] sticky top-0 bg-zinc-900">
                <th className="pb-2.5">Telemetry ID</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Asset</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">CPU</th>
                <th className="pb-2.5">Temp</th>
                <th className="pb-2.5">Power</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {results.map((r) => (
                <tr key={r.telemetryId} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 text-zinc-400">{r.telemetryId}</td>
                  <td className="py-2.5 text-zinc-300">{r.timestamp.replace('T', ' ').slice(11, 19)}</td>
                  <td className="py-2.5 font-bold text-white">{r.assetName}</td>
                  <td className="py-2.5 uppercase text-[10px] text-zinc-400">{r.assetType}</td>
                  <td className="py-2.5 text-blue-400">{r.metrics.cpu || 0}%</td>
                  <td className={`py-2.5 font-bold ${
                    (r.metrics.temperature || 0) > 75 ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {r.metrics.temperature || 0}°C
                  </td>
                  <td className="py-2.5 text-amber-400">{r.metrics.power || 0} W</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      r.status === 'critical'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : r.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-emerald-400 font-bold">{r.quality.overallScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
