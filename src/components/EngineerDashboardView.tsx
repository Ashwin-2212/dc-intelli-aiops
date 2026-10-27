import React, { useState } from 'react';
import {
  Wrench,
  Thermometer,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BatteryCharging,
  Layers,
  Search,
  Sliders,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { UserRole } from '../types';

interface EngineerDashboardViewProps {
  currentRole: UserRole;
  setActiveView: (view: string) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const EngineerDashboardView: React.FC<EngineerDashboardViewProps> = ({
  currentRole,
  setActiveView,
  onOpenCopilot,
}) => {
  const engine = TelemetryEngine.getInstance();
  const racks = engine.racks;
  const coolingUnits = engine.coolingUnits;
  const upsUnits = engine.upsUnits;
  const [calibrationFeedback, setCalibrationFeedback] = useState<string | null>(null);

  const runCalibration = (testName: string) => {
    setCalibrationFeedback(`Running calibrated hardware diagnostic for: ${testName}... OK (Zero Offset applied).`);
    setTimeout(() => setCalibrationFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Engineer Diagnostic Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/40 border border-emerald-600/40 shadow-lg shadow-emerald-950/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-xl">
              <Wrench className="w-6 h-6 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-sans">
                  INFRASTRUCTURE &amp; FIELD ENGINEER DIAGNOSTICS
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-xs font-mono font-semibold rounded border border-emerald-400">
                  FIELD &amp; HARDWARE DIAGNOSTICS
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-mono mt-0.5">
                Hardware Probing • Thermal Delta-T Balancing • Battery Cell Impedance • Causal Root-Cause Graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('root-cause')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
            >
              <GitBranch className="w-4 h-4" />
              ROOT CAUSE ANALYSIS (RCA)
            </button>
            <button
              onClick={() => setActiveView('predictive')}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs font-mono rounded-xl border border-zinc-700 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              FAILURE PREDICTION
            </button>
          </div>
        </div>

        {calibrationFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono rounded-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {calibrationFeedback}
          </div>
        )}
      </div>

      {/* Engineering Diagnostic Toolkit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool 1: Thermal Delta-T */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Thermometer className="w-4 h-4" />
              Inlet / Outlet Thermal Delta-T
            </span>
            <span className="px-2 py-0.5 bg-zinc-950 text-zinc-300 text-[10px] font-mono rounded border border-zinc-800">
              ΔT: 11.4°C
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Measures cold aisle supply vs hot aisle return differential. High delta indicates restricted chassis air baffling.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">Tolerance: 8°C - 14°C</span>
            <button
              onClick={() => runCalibration('Inlet/Outlet Delta-T Probe')}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded"
            >
              Calibrate Probe
            </button>
          </div>
        </div>

        {/* Tool 2: Battery Impedance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <BatteryCharging className="w-4 h-4" />
              UPS Battery Cell Impedance
            </span>
            <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[10px] font-mono rounded border border-purple-800">
              18.2 mΩ (AVG)
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time spectroscopic impedance measurements on VRLA strings. UPS-03 String 2B shows &gt;32mΩ spike.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">String 2B Degraded</span>
            <button
              onClick={() => runCalibration('UPS-03 String 2B Cell Sensor')}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded"
            >
              Zero Offset
            </button>
          </div>
        </div>

        {/* Tool 3: Blower Fan Vibration */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              CRAC Blower Fan Vibration (FFT)
            </span>
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[10px] font-mono rounded border border-cyan-800">
              2.4 mm/s RMS
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Harmonic vibration sensor detecting early stage ball bearing pitting in CRAC-02 evaporator fan assembly.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">ISO 10816 Class II</span>
            <button
              onClick={() => runCalibration('CRAC-02 Vibration Sensor')}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded"
            >
              Run Spectrum
            </button>
          </div>
        </div>
      </div>

      {/* Field Inspection & Hardware Status Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-zinc-200 text-sm">Hardware Asset Telemetry Diagnostics</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">All 14 Racks across Zone A &amp; Zone B</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {racks.map((rack) => (
            <div
              key={rack.id}
              className={`p-4 rounded-xl border transition-all ${
                rack.inletTempC > 32
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : rack.inletTempC > 28
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-zinc-200 text-xs font-mono">{rack.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    rack.inletTempC > 32
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : rack.inletTempC > 28
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {rack.inletTempC > 32 ? 'CRITICAL' : rack.inletTempC > 28 ? 'WARNING' : 'HEALTHY'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                <div>
                  Inlet Temp: <span className="text-zinc-200 font-bold">{rack.inletTempC.toFixed(1)}°C</span>
                </div>
                <div>
                  Power: <span className="text-zinc-200 font-bold">{rack.currentPowerKw.toFixed(1)} kW</span>
                </div>
                <div>
                  Max Cap: <span className="text-zinc-200 font-bold">{rack.maxPowerKw} kW</span>
                </div>
                <div>
                  U Space: <span className="text-zinc-200 font-bold">{rack.usedU} / {rack.maxU}U</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500">Zone: {rack.zone} • Row {rack.row}</span>
                <button
                  onClick={() => setActiveView('racks')}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Inspect 42U <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
