import React, { useState } from 'react';
import {
  Thermometer,
  Wind,
  Zap,
  Flame,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Cpu,
  Layers,
  Gauge,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { TelemetryEngine } from '../services/telemetrySimulator';
import {
  thermalPredictionSeedRecords,
  ThermalPredictionRecord,
} from '../services/thermalPredictionEngine';

export const CoolingIntelligenceView: React.FC = () => {
  const engine = TelemetryEngine.getInstance();
  const coolingUnits = engine.coolingUnits;
  const racks = engine.racks;

  const [coldAisleSetpoint, setColdAisleSetpoint] = useState<number>(20.5);
  const [selectedRackId, setSelectedRackId] = useState<string>('RACK-07'); // Default to canonical RACK-07

  const selectedRecord: ThermalPredictionRecord =
    thermalPredictionSeedRecords.find((r) => r.rackId === selectedRackId) ||
    thermalPredictionSeedRecords[0];

  const avgCop = +(
    coolingUnits.reduce((acc, c) => acc + c.copEfficiency, 0) / coolingUnits.length
  ).toFixed(2);
  const totalCoolingPower = +(
    coolingUnits.reduce((acc, c) => acc + c.powerDrawKw, 0)
  ).toFixed(1);

  const getRiskBadge = (risk: ThermalPredictionRecord['thermalRisk']) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white shadow-md shadow-rose-900/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-900/40';
      case 'MODERATE':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              Thermal Risk Prediction & Cooling Intelligence
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Feature 7 Enabled
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Multivariate thermodynamic forward forecasting, ASHRAE TC 9.9 envelopes, and 25-minute hotspot prediction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase">Average COP</span>
              <div className="text-base font-bold text-emerald-400">{avgCop}</div>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase">Cooling Power</span>
              <div className="text-base font-bold text-cyan-400">{totalCoolingPower} kW</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 7 — THERMAL RISK PREDICTION PRIMARY CARD */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 border-2 border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Header with Rack Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-400 border border-orange-500/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                  AI Thermal Risk Prediction Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  Thermal Inertia + CFD Model
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono text-white mt-0.5">
                Target Forecast: {selectedRecord.rackId} ({selectedRecord.rackName})
              </h2>
            </div>
          </div>

          {/* Target Rack Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Select Rack:</span>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {thermalPredictionSeedRecords.map((rec) => (
                <button
                  key={rec.rackId}
                  onClick={() => setSelectedRackId(rec.rackId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedRackId === rec.rackId
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {rec.rackId}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EXACT PROMPT FORMAT DISPLAY (RACK-07 Canonical Highlight) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Exact Prediction Specification Banner */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Thermal Prediction Summary
                </span>
                <span className="text-xs font-mono text-orange-400 font-bold">
                  {selectedRecord.rackId}
                </span>
              </div>

              {/* Exact Prompt Required Triad */}
              <div className="space-y-2 font-mono">
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Current temperature:</span>
                  <span className="text-base font-bold text-white">
                    {selectedRecord.currentTempC}°C
                  </span>
                </div>

                <div className="p-3 bg-orange-950/30 border border-orange-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-orange-300">Predicted:</span>
                  <span className="text-base font-bold text-orange-400">
                    {selectedRecord.predictedTempC}°C in {selectedRecord.predictionHorizonMinutes} minutes
                  </span>
                </div>

                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Thermal Risk:</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase ${getRiskBadge(
                      selectedRecord.thermalRisk
                    )}`}
                  >
                    {selectedRecord.thermalRisk}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-300 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60 leading-relaxed">
                <strong className="text-orange-400 block mb-1">Thermodynamic Assessment:</strong>
                {selectedRecord.predictionReason}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="text-[11px] font-mono text-zinc-400">
                Action: <span className="text-emerald-400 font-bold">{selectedRecord.mitigationRecommendation.slice(0, 48)}...</span>
              </div>
              <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-lg transition-all shadow shrink-0">
                Execute Dynamic Rebalance
              </button>
            </div>
          </div>

          {/* Right 7 Cols: 8 Monitored Variables Grid */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                8 Monitored Thermal Telemetry Streams
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">1-second Modbus & Redfish polling</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              {/* 1. Inlet Temperature */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-cyan-400" /> 1. Inlet Temp
                </span>
                <div className="text-sm font-bold text-cyan-300">
                  {selectedRecord.inletTempC}°C
                </div>
                <div className="text-[9px] text-zinc-500">Aisle Sensor Array</div>
              </div>

              {/* 2. Outlet Temperature */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-400" /> 2. Outlet Temp
                </span>
                <div className="text-sm font-bold text-rose-300">
                  {selectedRecord.outletTempC}°C
                </div>
                <div className="text-[9px] text-zinc-500">Exhaust Plenum</div>
              </div>

              {/* 3. Server Temperature */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-orange-400" /> 3. Server Temp
                </span>
                <div className="text-sm font-bold text-orange-300">
                  {selectedRecord.serverTempC}°C
                </div>
                <div className="text-[9px] text-zinc-500">CPU Package Tctl</div>
              </div>

              {/* 4. Fan Speed */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" /> 4. Fan Speed
                </span>
                <div className="text-sm font-bold text-white">
                  {selectedRecord.fanSpeedRpm.toLocaleString()} RPM
                </div>
                <div className="text-[9px] text-zinc-500">Tachometer Pulse</div>
              </div>

              {/* 5. Rack Temperature */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" /> 5. Rack Temp
                </span>
                <div className="text-sm font-bold text-amber-300">
                  {selectedRecord.rackTempC}°C
                </div>
                <div className="text-[9px] text-zinc-500">Top/Mid/Bottom Avg</div>
              </div>

              {/* 6. Workload */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-purple-400" /> 7. Workload
                </span>
                <div className="text-sm font-bold text-purple-300">
                  {selectedRecord.workloadCpuPercent}% CPU
                </div>
                <div className="text-[9px] text-zinc-500">Compute Load</div>
              </div>

              {/* 7. Power */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> 8. Power
                </span>
                <div className="text-sm font-bold text-yellow-300">
                  {selectedRecord.powerKw} kW
                </div>
                <div className="text-[9px] text-zinc-500">PDU Metred Feed</div>
              </div>

              {/* 8. Cooling State */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" /> 6. Cooling State
                </span>
                <div className="text-xs font-bold text-emerald-300 truncate" title={selectedRecord.coolingState}>
                  {selectedRecord.coolingState}
                </div>
                <div className="text-[9px] text-zinc-500">HVAC Controller</div>
              </div>
            </div>

            {/* Trajectory Area Chart: 0 to 25 minutes */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  Thermal Trajectory: Next {selectedRecord.predictionHorizonMinutes} Minutes
                </span>
                <span className="text-rose-400 text-[11px]">
                  Safety Threshold: 30.0°C (Breach at +10 min)
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selectedRecord.temperatureTrajectory}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="minute"
                      stroke="#71717a"
                      tickFormatter={(val) => `+${val}m`}
                      tick={{ fontSize: 10, fill: '#a1a1aa' }}
                    />
                    <YAxis
                      domain={[20, 38]}
                      stroke="#71717a"
                      tick={{ fontSize: 10, fill: '#a1a1aa' }}
                      tickFormatter={(val) => `${val}°C`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(val: any) => [`${val}°C`, 'Predicted Temp']}
                      labelFormatter={(label) => `Forecast: +${label} minutes`}
                    />
                    <ReferenceLine
                      y={30.0}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Critical Threshold (30°C)',
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tempC"
                      stroke="#f97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#tempGradient)"
                      dot={{ r: 4, fill: '#f97316', stroke: '#ffffff', strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2D HEAT-RISK VISUALIZATION (DATA CENTER SPATIAL GRID) */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              2D Spatial Heat-Risk Floor Visualization
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Topological cold/hot aisle containment thermal distribution with predictive risk overlay.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-xs bg-emerald-600"></span> Low (&lt;24°C)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-3 rounded-xs bg-cyan-600"></span> Moderate (25–28°C)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-xs bg-amber-600"></span> High (29–33°C)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-xs bg-rose-600 animate-pulse"></span> Critical (&gt;34°C)
            </span>
          </div>
        </div>

        {/* 2D Row Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Row 1 */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-zinc-300">Row-01 (Zone A Compute)</span>
              <span className="text-[10px] font-mono text-cyan-400">Fed by CRAC-01</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['RACK-01', 'RACK-02', 'RACK-03', 'RACK-04', 'RACK-05', 'RACK-06'].map((id) => {
                const isSelected = selectedRackId === id;
                const pred = thermalPredictionSeedRecords.find((p) => p.rackId === id);
                const temp = pred ? pred.currentTempC : 23.5;
                const risk = pred ? pred.thermalRisk : 'LOW';
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedRackId(id)}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      risk === 'CRITICAL'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                        : risk === 'HIGH'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                    } ${isSelected ? 'ring-2 ring-orange-400 shadow-lg' : ''}`}
                  >
                    <div className="text-xs font-bold font-mono">{id}</div>
                    <div className="text-[11px] font-bold font-mono mt-0.5">{temp}°C</div>
                    <div className="text-[9px] uppercase font-mono tracking-tight mt-1 opacity-80">
                      {risk} Risk
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2 (Contains RACK-07 canonical) */}
          <div className="p-4 bg-zinc-900/50 border border-orange-500/30 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-orange-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 animate-pulse" /> Row-02 (Database Row)
              </span>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                Thermal Hotspot Area
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['RACK-07', 'RACK-08', 'RACK-09', 'RACK-10', 'RACK-11', 'RACK-12'].map((id) => {
                const isSelected = selectedRackId === id;
                const pred = thermalPredictionSeedRecords.find((p) => p.rackId === id);
                const temp = pred ? pred.currentTempC : 24.0;
                const risk = pred ? pred.thermalRisk : (id === 'RACK-07' ? 'HIGH' : 'LOW');
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedRackId(id)}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      risk === 'CRITICAL'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                        : risk === 'HIGH'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                    } ${isSelected ? 'ring-2 ring-orange-400 shadow-lg scale-105' : ''}`}
                  >
                    <div className="text-xs font-bold font-mono flex items-center justify-center gap-1">
                      {id} {id === 'RACK-07' && <span className="text-[10px] text-orange-400">★</span>}
                    </div>
                    <div className="text-[11px] font-bold font-mono mt-0.5">{temp}°C</div>
                    <div className="text-[9px] uppercase font-mono tracking-tight mt-1 opacity-80">
                      {risk} Risk
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CRAC Cooling Units Matrix */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-zinc-300">Cooling HVAC Units</span>
              <span className="text-[10px] font-mono text-zinc-500">Chilled Water Loops</span>
            </div>
            <div className="space-y-2">
              {coolingUnits.slice(0, 3).map((crac) => (
                <div
                  key={crac.id}
                  className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs font-mono flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-white">{crac.id}</span>
                  </div>
                  <div className="text-right text-zinc-400">
                    <span className="text-cyan-300">{crac.supplyTempC}°C Supply</span> | <span>{crac.fanSpeedPercent}% Fan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Setpoint Optimizer & Airflow Control Card */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              Dynamic Setpoint & Cold-Aisle Temperature Optimizer
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Increasing cold aisle temperature by 1.0°C yields ~3.8% cooling energy savings without compromising server MTBF.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
          {/* Slider */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-300">
              <span>
                Target Cold Aisle Supply: <strong className="text-orange-400">{coldAisleSetpoint}°C</strong>
              </span>
              <span className="text-emerald-400">ASHRAE Recommended: 18°C – 27°C</span>
            </div>
            <input
              type="range"
              min="17"
              max="26"
              step="0.5"
              value={coldAisleSetpoint}
              onChange={(e) => setColdAisleSetpoint(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>17.0°C (Overcooled / High OpEx)</span>
              <span>21.5°C (Optimal Balance)</span>
              <span>26.0°C (High Efficiency / Strict Monitoring)</span>
            </div>
          </div>

          {/* Real-time Projected Savings */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Projected Power Savings:</span>
              <span className="text-emerald-400 font-bold">
                {+((coldAisleSetpoint - 18.5) * 12.4).toFixed(1)} kW
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Monthly Cost Reduction:</span>
              <span className="text-emerald-400 font-bold">
                ${Math.max(0, Math.round((coldAisleSetpoint - 18.5) * 12.4 * 24 * 30.5 * 0.12))} / mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
