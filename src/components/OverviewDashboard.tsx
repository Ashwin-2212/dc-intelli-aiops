import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BatteryCharging,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Server,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryEngine } from '../services/telemetrySimulator';

interface OverviewDashboardProps {
  setActiveView: (view: string) => void;
  onOpenCopilot: (prompt?: string) => void;
  onSelectRack?: (rackId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  setActiveView,
  onOpenCopilot,
  onSelectRack,
}) => {
  const engine = TelemetryEngine.getInstance();
  const facility = engine.facilities[0];
  const racks = engine.racks;
  const history = engine.getHistory();
  const activeAnomalies = engine.anomalies.filter((a) => a.status === 'active');
  const predictions = engine.predictions;

  const totalServers = racks.reduce((acc, r) => acc + r.servers.length, 0);
  const criticalRacks = racks.filter((r) => r.status === 'critical');
  const warningRacks = racks.filter((r) => r.status === 'warning');

  // Compute live averages
  const allServers = racks.flatMap((r) => r.servers);
  const avgCpu = Math.round(allServers.reduce((sum, s) => sum + s.telemetry.cpuUsage, 0) / Math.max(1, allServers.length));
  const avgTemp = +(allServers.reduce((sum, s) => sum + s.telemetry.cpuTemp, 0) / Math.max(1, allServers.length)).toFixed(1);
  const avgRam = Math.round(allServers.reduce((sum, s) => sum + s.telemetry.ramUsage, 0) / Math.max(1, allServers.length));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Health Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Alpha Core DC-1 (Virginia)</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
              Tier IV Certified
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry stream synchronized across 24 Racks, 4 CRAC Units, 3 UPS Inverter Trains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('what-if')}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-all flex items-center gap-1.5"
          >
            <span>What-If Sandbox</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AIOps Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Facility Power */}
        <div className="p-4 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Total Facility Power</span>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {facility.totalFacilityPowerKw?.toFixed(1) || '842.5'} <span className="text-xs font-normal text-zinc-400">kW</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>IT Load: {facility.itEquipmentPowerKw?.toFixed(1)} kW</span>
            <span className="text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -2.4%
            </span>
          </div>
          <div className="mt-2 h-1 bg-zinc-800 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              style={{ width: `${Math.min(100, (facility.totalFacilityPowerKw / 1100) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: PUE Metric */}
        <div className="p-4 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Power Usage Eff. (PUE)</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {facility.pue?.toFixed(2) || '1.40'}{' '}
            <span className="text-xs font-medium text-emerald-400 font-sans">
              (Target &lt; 1.45)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Cooling: {facility.coolingPowerKw?.toFixed(0)} kW</span>
            <span className="text-emerald-400">Optimal Range</span>
          </div>
          <div className="mt-2 h-1 bg-zinc-800 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${Math.min(100, (facility.pue / 2.0) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Compute Load (CPU & RAM) */}
        <div className="p-4 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Avg Fleet Compute</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {avgCpu}% <span className="text-xs font-normal text-zinc-400">CPU</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>RAM: {avgRam}%</span>
            <span>{totalServers} Active Nodes</span>
          </div>
          <div className="mt-2 h-1 bg-zinc-800 w-full rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${avgCpu}%` }}></div>
          </div>
        </div>

        {/* Card 4: Cold Aisle & Thermal Health */}
        <div className="p-4 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Cold Aisle Ambient</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {facility.ambientTempC?.toFixed(1) || '22.4'}°C
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Humidity: {facility.ambientHumidityPercent}%</span>
            <span className={criticalRacks.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {criticalRacks.length > 0 ? `${criticalRacks.length} Hotspots` : 'No Hotspots'}
            </span>
          </div>
          <div className="mt-2 h-1 bg-zinc-800 w-full rounded-full overflow-hidden">
            <div
              className={`h-full ${criticalRacks.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${(facility.ambientTempC / 35) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Row: Live Charts & AI Incident Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Real-Time Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Telemetry Stream Chart Card */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Live Real-Time Telemetry Curve
                </h2>
                <p className="text-xs text-zinc-400">Facility Power Draw (kW) & Average CPU Utilization %</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Power (kW)
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> CPU (%)
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="timestamp" stroke="#71717a" fontSize={10} fontStyle="mono" />
                  <YAxis stroke="#71717a" fontSize={10} fontStyle="mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="powerKw" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" />
                  <Area type="monotone" dataKey="avgCpuUsage" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Floor Zone Heat Distribution Card */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Zone Thermal & Rack Matrix
                </h3>
                <p className="text-xs text-zinc-400">Click any rack to drill down into 42U equipment elevation</p>
              </div>
              <button
                onClick={() => setActiveView('digital-twin')}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
              >
                Open 2.5D Digital Twin <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {racks.map((rack) => {
                const isCritical = rack.status === 'critical';
                const isWarning = rack.status === 'warning';
                return (
                  <button
                    key={rack.id}
                    onClick={() => onSelectRack(rack.id)}
                    className={`p-3 rounded-xl border text-left transition-all hover:scale-105 ${
                      isCritical
                        ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-white">{rack.id}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      ></span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-zinc-300">{rack.inletTempC}°C</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{rack.currentPowerKw} kW</div>
                    <div className="mt-2 text-[9px] text-zinc-400 uppercase tracking-tight truncate">{rack.zone}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: AI Anomaly & Predictive Intelligence Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active AI Anomalies Feed */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Live AI Anomaly Radar
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeAnomalies.length} Critical
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {activeAnomalies.slice(0, 2).map((anom) => (
                <div
                  key={anom.id}
                  className="p-3.5 bg-rose-500/5 border border-rose-500/30 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 font-mono uppercase">{anom.metric}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{anom.timestamp}</span>
                  </div>
                  <div className="text-xs text-zinc-200 font-medium leading-snug">{anom.possibleCause}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Device: <span className="text-zinc-200">{anom.deviceName}</span>
                  </div>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => setActiveView('root-cause')}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors"
                    >
                      Root Cause
                    </button>
                    <button
                      onClick={() => setActiveView('anomalies')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg uppercase"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Maintenance Snapshot */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Predictive Failure Horizon
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">30-Day Window</span>
            </div>

            <div className="space-y-3">
              {predictions.slice(0, 2).map((pred) => (
                <div key={pred.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{pred.deviceName}</span>
                    <span className="text-xs font-bold font-mono text-amber-400">{pred.failureProbability}% Risk</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Component: <span className="text-zinc-200">{pred.component}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                    <span>Est. Window: {pred.expectedWindowDays}</span>
                    <span className="text-emerald-400 font-semibold">{pred.confidencePercent}% Confidence</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setActiveView('predictive')}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>View Full Predictive Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
