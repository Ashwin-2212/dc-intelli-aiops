import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Zap,
  Thermometer,
  Cpu,
  Wifi,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  ArrowUpRight,
  Maximize2,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TelemetryStorageEngine } from '../services/telemetry/TelemetryStorageEngine';
import { TelemetryIntelligencePipeline } from '../services/telemetry/TelemetryIntelligencePipeline';
import { TelemetryPlatformObservability } from '../services/telemetry/TelemetryPlatformObservability';

interface TelemetryLiveViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryLiveView: React.FC<TelemetryLiveViewProps> = ({ onOpenCopilot }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('SRV-R-04-02');
  const [timeWindow, setTimeWindow] = useState<'1m' | '5m' | '15m' | '1h' | '24h' | '7d' | '30d'>('5m');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [activeMetricToggles, setActiveMetricToggles] = useState<Record<string, boolean>>({
    cpu: true,
    temperature: true,
    power: true,
    fan: false,
    network: false,
  });

  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const pipeline = TelemetryIntelligencePipeline.getInstance();
    const unsub = pipeline.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsub();
  }, []);

  const storage = TelemetryStorageEngine.getInstance();
  const timeSeries = storage.getTimeSeries(selectedAsset, timeWindow);
  const latestPackets = storage.queryTelemetry({ assetId: selectedAsset, limit: 1 });
  const latestPacket = latestPackets[0];

  const obs = TelemetryPlatformObservability.getInstance();
  const sources = obs.getSources();

  const toggleMetric = (key: string) => {
    setActiveMetricToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Live Universal Telemetry Stream
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  STREAMING (2000ms)
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Normalized, verified, high-frequency time-series telemetry across server fleets, CRAC chillers, and UPS power feeds.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Asset Selector */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="SRV-R-04-02" className="bg-zinc-900 text-white">SRV-R-04-02 (AI Training Node)</option>
              <option value="CRAC-02" className="bg-zinc-900 text-white">CRAC-02 (Zone A In-Row Chiller)</option>
              <option value="UPS-01" className="bg-zinc-900 text-white">UPS-01 (Primary Substation Feeder)</option>
              <option value="UPS-03" className="bg-zinc-900 text-white">UPS-03 (Zone C High-Density)</option>
              <option value="SRV-R-01-04" className="bg-zinc-900 text-white">SRV-R-01-04 (Storage Cluster)</option>
            </select>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 gap-1">
            {(['1m', '5m', '15m', '1h', '24h', '7d', '30d'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  timeWindow === w
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              showRawJson
                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Raw JSON
          </button>
        </div>
      </div>

      {/* Metric KPI Banner */}
      {latestPacket && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">CPU Utilization</span>
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {latestPacket.metrics.cpu || latestPacket.metrics.cpuUsage || 0}%
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Baseline: 46.5%</div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Temperature</span>
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className={`text-xl font-bold font-mono ${
              (latestPacket.metrics.temperature || latestPacket.metrics.cpuTemp || 0) > 75
                ? 'text-red-400 animate-pulse'
                : 'text-white'
            }`}>
              {latestPacket.metrics.temperature || latestPacket.metrics.cpuTemp || 0}°C
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Normal: 36°C – 55°C</div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Power Draw</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {latestPacket.metrics.power || latestPacket.metrics.powerDrawWatts || 0} W
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Zone Limit: 600W</div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Blower Fan RPM</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {latestPacket.metrics.fan || latestPacket.metrics.fanSpeedRpm || 6200}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">PWW PID Active</div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Telemetry Quality</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {latestPacket.quality.overallScore}%
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Freshness: 100%</div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Asset Health</span>
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className={`text-xl font-bold font-mono ${latestPacket.status === 'critical' ? 'text-red-400' : 'text-emerald-400'}`}>
              {latestPacket.status === 'critical' ? '45/100' : '94/100'}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono uppercase">{latestPacket.status}</div>
          </div>
        </div>
      )}

      {/* Raw JSON Inspector Modal View if toggled */}
      {showRawJson && latestPacket && (
        <div className="p-5 bg-zinc-950 border border-purple-500/40 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-purple-300 font-bold flex items-center gap-2">
              <Code className="w-4 h-4" />
              Universal Telemetry Schema Packet ({latestPacket.telemetryId})
            </span>
            <button
              onClick={() => setShowRawJson(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <pre className="p-4 bg-black/60 rounded-xl text-emerald-400 overflow-x-auto custom-scrollbar max-h-80">
            {JSON.stringify(latestPacket, null, 2)}
          </pre>
        </div>
      )}

      {/* Multi-Metric Live Chart */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{selectedAsset} Multi-Signal Live Telemetry</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live continuous telemetry stream window ({timeWindow}) with baseline corridors and correlation overlays.
            </p>
          </div>

          {/* Metric Toggle Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleMetric('cpu')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeMetricToggles.cpu
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              CPU (%)
            </button>

            <button
              onClick={() => toggleMetric('temperature')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeMetricToggles.temperature
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              Temp (°C)
            </button>

            <button
              onClick={() => toggleMetric('power')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeMetricToggles.power
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Power (W)
            </button>

            <button
              onClick={() => toggleMetric('fan')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeMetricToggles.fan
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Fan RPM
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="timestamp" stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {activeMetricToggles.cpu && (
                <Line
                  type="monotone"
                  dataKey="cpu"
                  name="CPU Load (%)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
              )}

              {activeMetricToggles.temperature && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#fb923c"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
              )}

              {activeMetricToggles.power && (
                <Line
                  type="monotone"
                  dataKey="power"
                  name="Power (W)"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {activeMetricToggles.fan && (
                <Line
                  type="monotone"
                  dataKey="fan"
                  name="Fan Speed"
                  stroke="#34d399"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingestion Pipeline & Source Provenance Footer Card */}
      <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Universal Ingestion Pipeline Protocol Status</div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Accepting: HTTP REST, Redfish BMC (DMTF), SNMP v2/v3, Modbus TCP, MQTT IoT, and CSV/JSON Imports
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenCopilot && onOpenCopilot(`Analyze real-time telemetry anomalies on ${selectedAsset}`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium text-xs hover:opacity-90 shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Ask Gemini Copilot About {selectedAsset}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
