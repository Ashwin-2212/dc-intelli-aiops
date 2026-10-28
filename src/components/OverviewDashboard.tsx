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
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/25 via-zinc-900/60 to-orange-950/20 border border-white/[0.08] backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        {/* Ambient background light spot */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Alpha Core DC-1 (Virginia)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono font-medium flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tier IV Certified
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            Real-time telemetry stream synchronized across <span className="text-zinc-200 font-mono font-semibold">24 Racks</span>, <span className="text-zinc-200 font-mono font-semibold">4 CRAC Units</span>, and <span className="text-zinc-200 font-mono font-semibold">3 UPS Inverter Trains</span>.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveView('what-if')}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-98"
          >
            <span>What-If Sandbox</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button
            onClick={() => onOpenCopilot()}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_30px_rgba(249,115,22,0.55)] transition-all flex items-center gap-2 border border-orange-400/30 hover:scale-[1.03] active:scale-98 font-sans"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Ask AIOps Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Facility Power */}
        <div className="glass-card glass-card-accent-orange p-5 rounded-2xl border border-white/[0.08]">
          <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400">Total Facility Power</span>
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {facility.totalFacilityPowerKw?.toFixed(1) || '842.5'} <span className="text-xs font-normal text-zinc-400">kW</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>IT: {facility.itEquipmentPowerKw?.toFixed(1)} kW</span>
            <span className="text-emerald-400 flex items-center font-bold">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -2.4%
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800/80 w-full rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              style={{ width: `${Math.min(100, (facility.totalFacilityPowerKw / 1100) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: PUE Metric */}
        <div className="glass-card glass-card-accent-cyan p-5 rounded-2xl border border-white/[0.08]">
          <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" />
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400">Power Usage Eff. (PUE)</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 tracking-tight">
            {facility.pue?.toFixed(2) || '1.40'}{' '}
            <span className="text-xs font-medium text-emerald-400 font-sans">
              (Target &lt; 1.45)
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Cooling: {facility.coolingPowerKw?.toFixed(0)} kW</span>
            <span className="text-emerald-400 font-bold">Optimal</span>
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800/80 w-full rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${Math.min(100, (facility.pue / 2.0) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Compute Load (CPU & RAM) */}
        <div className="glass-card glass-card-accent-emerald p-5 rounded-2xl border border-white/[0.08]">
          <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400">Avg Fleet Compute</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 tracking-tight">
            {avgCpu}% <span className="text-xs font-normal text-zinc-400">CPU</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>RAM: {avgRam}%</span>
            <span className="text-zinc-300 font-semibold">{totalServers} Active Nodes</span>
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800/80 w-full rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ width: `${avgCpu}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Cold Aisle & Thermal Health */}
        <div className="glass-card glass-card-accent-rose p-5 rounded-2xl border border-white/[0.08]">
          <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400">Cold Aisle Ambient</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {facility.ambientTempC?.toFixed(1) || '22.4'}°C
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Humidity: {facility.ambientHumidityPercent}%</span>
            <span className={criticalRacks.length > 0 ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-emerald-400 font-bold'}>
              {criticalRacks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              {criticalRacks.length > 0 ? `${criticalRacks.length} Hotspots` : 'Optimal'}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800/80 w-full rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full ${criticalRacks.length > 0 ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}
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
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Live Real-Time Telemetry Curve
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Facility Power Draw (kW) & Average CPU Utilization %</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,1)]"></span> Power (kW)
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,1)]"></span> CPU (%)
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222228" />
                  <XAxis dataKey="timestamp" stroke="#71717a" fontSize={10} fontStyle="mono" />
                  <YAxis stroke="#71717a" fontSize={10} fontStyle="mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0c14',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                    }}
                  />
                  <Area type="monotone" dataKey="powerKw" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#powerGrad)" />
                  <Area type="monotone" dataKey="avgCpuUsage" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Floor Zone Heat Distribution Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Zone Thermal & Rack Matrix
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Click any rack to drill down into 42U equipment elevation</p>
              </div>
              <button
                onClick={() => setActiveView('digital-twin')}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Open 2.5D Digital Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {racks.map((rack) => {
                const isCritical = rack.status === 'critical';
                const isWarning = rack.status === 'warning';
                return (
                  <button
                    key={rack.id}
                    onClick={() => onSelectRack && onSelectRack(rack.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-105 active:scale-95 ${
                      isCritical
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-white">{rack.id}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      ></span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-zinc-200 font-bold">{rack.inletTempC}°C</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{rack.currentPowerKw} kW</div>
                    <div className="mt-2 text-[9px] text-zinc-500 uppercase tracking-tight truncate font-mono">{rack.zone}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: AI Anomaly & Predictive Intelligence Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active AI Anomalies Feed */}
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Live AI Anomaly Radar
              </h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                {activeAnomalies.length} Critical
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {activeAnomalies.slice(0, 2).map((anom) => (
                <div
                  key={anom.id}
                  className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2 backdrop-blur-md shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider">{anom.metric}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{anom.timestamp}</span>
                  </div>
                  <div className="text-xs text-zinc-100 font-semibold leading-snug">{anom.possibleCause}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Device: <span className="text-zinc-200 font-medium">{anom.deviceName}</span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setActiveView('root-cause')}
                      className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-98"
                    >
                      Root Cause
                    </button>
                    <button
                      onClick={() => setActiveView('anomalies')}
                      className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-[10px] font-bold rounded-xl uppercase transition-all"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Maintenance Snapshot */}
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Predictive Failure Horizon
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">30-Day Window</span>
            </div>

            <div className="space-y-3">
              {predictions.slice(0, 2).map((pred) => (
                <div key={pred.id} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2 hover:border-white/[0.12] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{pred.deviceName}</span>
                    <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {pred.failureProbability}% Risk
                    </span>
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
                className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
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
