import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Zap,
  DollarSign,
  Clock,
  ShieldCheck,
  Layers,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Bot,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { UserRole } from '../types';

interface ManagerDashboardViewProps {
  currentRole: UserRole;
  setActiveView: (view: string) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  currentRole,
  setActiveView,
  onOpenCopilot,
}) => {
  const engine = TelemetryEngine.getInstance();
  const facility = engine.facilities[0];
  const workOrders = engine.workOrders;

  const monthlyBudgetKwH = 650000;
  const estimatedConsumedKwH = 582400;
  const budgetUtilizationPct = Math.round((estimatedConsumedKwH / monthlyBudgetKwH) * 100);
  const electricityRatePerKwh = facility.electricityRatePerKwh || 0.11;
  const estimatedCost = Math.round(estimatedConsumedKwH * electricityRatePerKwh);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-zinc-900 to-blue-950/40 border border-blue-600/40 shadow-lg shadow-blue-950/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-sans">
                  DATA CENTER OPERATIONS MANAGER COCKPIT
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-200 text-xs font-mono font-semibold rounded border border-blue-400">
                  OPERATIONS &amp; CAPACITY
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-mono mt-0.5">
                Executive SLA Tracking • Power Budgets • 90-Day Runway Forecast • Maintenance Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('capacity')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              CAPACITY RUNWAY
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs font-mono rounded-xl border border-zinc-700 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              MONTHLY AUDIT
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PUE Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>EFFICIENCY (PUE)</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{facility.pue.toFixed(2)}</span>
            <span className="text-xs font-mono text-emerald-400">Target: 1.35</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '88%' }} />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
            <span>IT: {facility.itEquipmentPowerKw?.toFixed(1) || '602.0'} kW</span>
            <span>Total: {facility.totalFacilityPowerKw?.toFixed(1) || '842.5'} kW</span>
          </div>
        </div>

        {/* Financial Energy Cost */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>MONTHLY POWER BUDGET</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">${estimatedCost.toLocaleString()}</span>
            <span className="text-xs font-mono text-zinc-400">/ ${Math.round(monthlyBudgetKwH * electricityRatePerKwh).toLocaleString()}</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${budgetUtilizationPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${budgetUtilizationPct}%` }} />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
            <span>{budgetUtilizationPct}% Consumed</span>
            <span className="text-emerald-400">Within Budget</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>FACILITY SLA UPTIME</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">99.988%</span>
            <span className="text-xs font-mono text-emerald-400">Tier IV (99.99%)</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.9%' }} />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
            <span>MTTR: 14.2 min</span>
            <span className="text-emerald-400">COMPLIANT</span>
          </div>
        </div>

        {/* Capacity Runway */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>CAPACITY RUNWAY</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">82 Days</span>
            <span className="text-xs font-mono text-amber-400">Until 85% Compute</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
            <span>Rack Slots: 41% Free</span>
            <span>Power Cap: 257 kW</span>
          </div>
        </div>
      </div>

      {/* Two-Column Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Work Orders & SLA Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-zinc-200 text-sm">Active Maintenance &amp; Work Orders</h3>
            </div>
            <button
              onClick={() => setActiveView('incidents')}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
            >
              View Board <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {workOrders.slice(0, 4).map((wo) => (
              <div
                key={wo.id}
                className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200">{wo.title}</div>
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>Target: {wo.targetAsset}</span>
                    <span>•</span>
                    <span>Assigned: {wo.assignedTo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      wo.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : wo.severity === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {wo.severity.toUpperCase()}
                  </span>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">{wo.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Facility Resource Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-zinc-200 text-sm">Site Capacity Allocations</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">{facility.name}</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>Compute Workload (CPU Cores)</span>
                <span>68.5% / 80% Threshold</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '68.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>Facility Electrical Feeder Draw</span>
                <span>{(((facility.totalFacilityPowerKw || 842) / 1100) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '76.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>CRAC Chilled Air Heat Exchange Capacity</span>
                <span>72.4% (Zone A High Thermal Load)</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '72.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>Available 42U Physical Rack Slots</span>
                <span>59% Occupied (14 Racks In-Use, 10 Available)</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '59%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
