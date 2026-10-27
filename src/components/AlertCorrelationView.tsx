import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Thermometer,
  Zap,
  Wind,
  Activity,
  Radio,
  RefreshCw,
  Eye,
  Check,
  Play,
  RotateCcw,
  Share2,
  Boxes,
  Info,
  Server,
  TrendingDown,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AlertCorrelationEngine } from '../services/alertCorrelationEngine';
import { CorrelatedIncident, CorrelatedIncidentStatus, RawAlert, AlertSeverity } from '../types';
import { incidentService } from '../services/api';

interface AlertCorrelationViewProps {
  setActiveView: (view: string) => void;
  onGenerateWorkOrder: (item: any) => void;
  onOpenCopilot?: (prompt?: string) => void;
}

export const AlertCorrelationView: React.FC<AlertCorrelationViewProps> = ({
  setActiveView,
  onGenerateWorkOrder,
  onOpenCopilot,
}) => {
  const engine = AlertCorrelationEngine.getInstance();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, [engine]);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    engine.incidents[0]?.id || 'INC-2026-THM-884'
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isInjectingBurst, setIsInjectingBurst] = useState<boolean>(false);
  const [burstFeedback, setBurstFeedback] = useState<string | null>(null);
  const [activeDimensionTab, setActiveDimensionTab] = useState<'all' | 'temporal' | 'device' | 'rack' | 'topology' | 'metric' | 'severity'>('all');

  const incidents = engine.incidents;
  const currentIncident: CorrelatedIncident | undefined =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  // Filtering
  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incidentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.targetDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const totalRawAlerts = engine.rawAlerts.length;
  const totalIncidents = engine.incidents.length;
  const noiseCompressionRate = totalRawAlerts > 0
    ? (((totalRawAlerts - totalIncidents) / totalRawAlerts) * 100).toFixed(1)
    : '0.0';

  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const ackCount = incidents.filter((i) => i.status === 'ACKNOWLEDGED').length;
  const invCount = incidents.filter((i) => i.status === 'INVESTIGATING').length;
  const resCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  const closedCount = incidents.filter((i) => i.status === 'CLOSED').length;

  const handleStatusChange = (newStatus: CorrelatedIncidentStatus) => {
    if (!currentIncident) return;
    engine.transitionIncidentStatus(
      currentIncident.id,
      newStatus,
      'NOC Engineer (Current Session)',
      `Operator transitioned incident status to ${newStatus}.`
    );
    incidentService.updateStatus(currentIncident.id, newStatus).catch((err) => {
      console.warn('[Incident API Warning] Could not persist status to MongoDB:', err);
    });
  };

  const handleTriggerThermalBurst = () => {
    setIsInjectingBurst(true);
    engine.triggerServerThermalStressBurst('SRV-R-04-02', 'R-04');
    setSelectedIncidentId('INC-THM-SRVR0402-'); // Prefix match or latest
    setTimeout(() => {
      setIsInjectingBurst(false);
      setBurstFeedback('Injected 5 atomic alerts: CPU HIGH + Temp HIGH + Power HIGH + Fan HIGH + Health WARNING → Correlated into INCIDENT: SERVER THERMAL STRESS');
      setTimeout(() => setBurstFeedback(null), 5000);
      if (engine.incidents.length > 0) {
        setSelectedIncidentId(engine.incidents[0].id);
      }
    }, 400);
  };

  const handleResetEngine = () => {
    engine.resetEngine();
    setSelectedIncidentId(engine.incidents[0]?.id || '');
    setBurstFeedback('Reset correlation stream to baseline state.');
    setTimeout(() => setBurstFeedback(null), 3000);
  };

  const getStatusBadge = (status: CorrelatedIncidentStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs';
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INVESTIGATING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CLOSED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'cpu':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'temperature':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'power':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'fan':
        return <Wind className="w-4 h-4 text-blue-400" />;
      case 'health':
        return <Activity className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0d] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <GitMerge className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                  FEATURE 2 — Multi-Metric Alert Correlation Studio
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-bold">
                  Zero Alert Spam
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Autonomous 6-dimension correlation pipeline: compresses discrete sensor noise into high-fidelity actionable incidents.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerThermalBurst}
            disabled={isInjectingBurst}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-rose-950/30 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Inject Canonical Burst (5-Metric Stress)</span>
          </button>

          <button
            onClick={handleResetEngine}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stream</span>
          </button>
        </div>
      </div>

      {/* Burst Toast Alert */}
      {burstFeedback && (
        <div className="p-3 bg-gradient-to-r from-orange-950/80 via-zinc-900 to-zinc-950 border border-orange-500/50 rounded-xl font-mono text-xs text-orange-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{burstFeedback}</span>
          </div>
          <button onClick={() => setBurstFeedback(null)} className="text-zinc-400 hover:text-white text-sm px-1">✕</button>
        </div>
      )}

      {/* KPI Compression & Noise Reduction Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Raw Telemetry Alarms</span>
          <div className="text-lg font-bold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-zinc-400" />
            <span>{totalRawAlerts} Signals</span>
          </div>
          <span className="text-[10px] text-zinc-400">Redfish / SNMP / Modbus</span>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Unified Incidents</span>
          <div className="text-lg font-bold text-orange-400 flex items-center gap-1.5">
            <GitMerge className="w-4 h-4 text-orange-400" />
            <span>{totalIncidents} Correlated</span>
          </div>
          <span className="text-[10px] text-zinc-400">Multi-Variate Clusters</span>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 rounded-xl space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Noise Reduction</span>
          <div className="text-lg font-bold text-emerald-300 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>{noiseCompressionRate}%</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Spam Suppressed</span>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Open / Active</span>
          <div className="text-lg font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{openCount} OPEN</span>
          </div>
          <span className="text-[10px] text-zinc-400">Requires triage</span>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">In Progress</span>
          <div className="text-lg font-bold text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{ackCount + invCount} Active</span>
          </div>
          <span className="text-[10px] text-zinc-400">{ackCount} Ack / {invCount} Invest</span>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Remediated</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resCount + closedCount} Resolved</span>
          </div>
          <span className="text-[10px] text-zinc-400">{resCount} Res / {closedCount} Closed</span>
        </div>
      </div>

      {/* Main Studio Two-Column Grid: Incidents List & Deep-Dive Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incidents Browser & Filter (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0a0a0d] border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-orange-400" />
                Correlated Incidents ({filteredIncidents.length})
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Anti-Spam Feed</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, asset, metric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-white pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {['ALL', 'OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    filterStatus === st
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {st} {st === 'ALL' ? `(${incidents.length})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Cards Stream */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const isCritical = inc.severity === 'critical';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border-orange-500/60 shadow-lg shadow-orange-950/30'
                      : 'bg-[#0a0a0d] hover:bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-orange-400">{inc.incidentCode}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadge(inc.status)}`}>
                          {inc.status}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold font-mono text-white line-clamp-1">{inc.title}</h3>
                    </div>

                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-zinc-400 line-clamp-2">
                    {inc.summary}
                  </div>

                  {/* Badges footer */}
                  <div className="mt-3 pt-2 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Server className="w-3 h-3 text-orange-400" />
                      <span>{inc.targetDevice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {inc.contributingAlerts.length} Contributing Alerts
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {inc.noiseReductionRatio}% Deflected
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Incident Inspector & Contributing Alerts (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {currentIncident ? (
            <div className="bg-[#0a0a0d] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Incident Header & Lifecycle Status Control */}
              <div className="border-b border-zinc-800 pb-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                        {currentIncident.id}
                      </span>
                      <span className="text-sm font-bold text-white tracking-wide">
                        {currentIncident.incidentCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadge(currentIncident.status)}`}>
                        {currentIncident.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold font-mono text-white">{currentIncident.title}</h2>
                    <p className="text-xs text-zinc-400 font-mono">{currentIncident.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        onOpenCopilot?.(
                          `Analyze correlated incident ${currentIncident.incidentCode} on ${currentIncident.targetDevice}. Contributing alerts: ${currentIncident.contributingAlerts.map(a => `${a.metricName}: ${a.currentValue}`).join(', ')}. Recommend root cause fix.`
                        )
                      }
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Copilot AI</span>
                    </button>

                    <button
                      onClick={() =>
                        onGenerateWorkOrder({
                          deviceId: currentIncident.targetDevice,
                          deviceName: currentIncident.title,
                          metric: currentIncident.incidentCode,
                          severity: currentIncident.severity,
                        })
                      }
                      className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Dispatch WO</span>
                    </button>
                  </div>
                </div>

                {/* Status Switcher Toolbar */}
                <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-orange-400" />
                      Lifecycle Status Transition (Active State Machine):
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Assigned: <strong className="text-zinc-200">{currentIncident.assignedEngineer}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'] as CorrelatedIncidentStatus[]).map(
                      (st) => {
                        const isCurrent = currentIncident.status === st;
                        return (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(st)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                              isCurrent
                                ? `${getStatusBadge(st)} shadow font-black scale-102`
                                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
                            }`}
                          >
                            {isCurrent && <Check className="w-3 h-3" />}
                            <span>{st}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* 6-Dimension Correlation Radar & Explanations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-orange-400" />
                    6-Dimension Correlation Radar Proof
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Noise Compressed by {currentIncident.noiseReductionRatio}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  {/* 1. Temporal Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-orange-400">1. TEMPORAL</span>
                      <span>{currentIncident.correlationEvidence.temporal.timeWindowSeconds}s window</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.temporal.details}
                    </div>
                  </div>

                  {/* 2. Device Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-cyan-400">2. DEVICE</span>
                      <span className="text-zinc-300 font-bold">{currentIncident.correlationEvidence.device.sharedDeviceId}</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.device.details}
                    </div>
                  </div>

                  {/* 3. Rack Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-purple-400">3. RACK</span>
                      <span className="text-zinc-300 font-bold">{currentIncident.correlationEvidence.rack.sharedRackId}</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.rack.details}
                    </div>
                  </div>

                  {/* 4. Topology Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-emerald-400">4. TOPOLOGY</span>
                      <span>Depth: {currentIncident.correlationEvidence.topology.treeDepth}</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.topology.details}
                    </div>
                  </div>

                  {/* 5. Metric Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-amber-400">5. METRIC</span>
                      <span className="text-emerald-400 font-bold">{currentIncident.correlationEvidence.metric.patternConfidence}% Match</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.metric.details}
                    </div>
                  </div>

                  {/* 6. Severity Correlation */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-rose-400">6. SEVERITY</span>
                      <span className="text-rose-400 font-bold">{currentIncident.severity.toUpperCase()}</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 leading-snug">
                      {currentIncident.correlationEvidence.severity.escalationReason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Canonical Multi-Metric Equation Banner */}
              <div className="p-4 bg-gradient-to-r from-orange-950/30 via-zinc-900 to-purple-950/30 border border-orange-500/30 rounded-2xl font-mono text-xs space-y-2">
                <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Multi-Metric Correlation Pattern Matched:
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">CPU HIGH</span>
                  <span className="text-zinc-500 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">Temperature HIGH</span>
                  <span className="text-zinc-500 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">Power HIGH</span>
                  <span className="text-zinc-500 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">Fan HIGH</span>
                  <span className="text-zinc-500 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">Health WARNING</span>
                  <span className="text-zinc-400 font-bold">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black shadow-md">
                    {currentIncident.incidentCode}
                  </span>
                </div>
              </div>

              {/* ALL CONTRIBUTING ALERTS INSIDE THE INCIDENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-orange-400" />
                      All Contributing Telemetry Alerts ({currentIncident.contributingAlerts.length})
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Atomic sensor deviations suppressed from alert spam and encapsulated inside this incident.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Source Protocol Breakdown
                  </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider bg-zinc-900/40">
                        <th className="p-2.5">Metric & Signal</th>
                        <th className="p-2.5">Current Value</th>
                        <th className="p-2.5">Baseline</th>
                        <th className="p-2.5">Threshold</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5">Protocol</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {currentIncident.contributingAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="p-2.5 text-white font-semibold flex items-center gap-2">
                            {getMetricIcon(alert.metricCategory)}
                            <div>
                              <div>{alert.metricName}</div>
                              <div className="text-[10px] text-zinc-400 font-normal">{alert.id}</div>
                            </div>
                          </td>
                          <td className="p-2.5 font-bold text-rose-400">{alert.currentValue}</td>
                          <td className="p-2.5 text-zinc-400">{alert.baselineValue}</td>
                          <td className="p-2.5 text-amber-400/90">{alert.threshold}</td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              alert.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                              {alert.provenanceProtocol}
                            </span>
                          </td>
                          <td className="p-2.5 text-zinc-400 text-[11px]">{alert.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remediation Playbook & Prescriptive Actions */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Prescriptive Remediation Actions ({currentIncident.recommendedRemediation.length})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Automated Triage</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {currentIncident.recommendedRemediation.map((rem) => (
                    <div
                      key={rem.stepNumber}
                      className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {rem.stepNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-zinc-800 text-amber-300">
                              {rem.urgency}
                            </span>
                            <span className="text-zinc-200 font-semibold">{rem.action}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            <span className="text-zinc-500">Expected Impact:</span> {rem.expectedImpact}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          onGenerateWorkOrder({
                            deviceId: currentIncident.targetDevice,
                            deviceName: `Remediation Step ${rem.stepNumber}: ${rem.action}`,
                            metric: currentIncident.incidentCode,
                            severity: rem.urgency === 'IMMEDIATE' ? 'critical' : 'high',
                          })
                        }
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 shrink-0 self-end sm:self-auto"
                      >
                        <Wrench className="w-3 h-3 text-orange-400" />
                        <span>Dispatch WO</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifecycle & Status Audit Trail */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Incident Lifecycle Audit Trail ({currentIncident.statusHistory.length} events)
                </h3>

                <div className="space-y-2 font-mono text-xs">
                  {currentIncident.statusHistory.map((hist, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${getStatusBadge(hist.status)}`}>
                          {hist.status}
                        </span>
                        <span className="text-zinc-300 text-[11px]">{hist.comment}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 shrink-0">
                        {hist.actor} • {hist.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-[#0a0a0d] border border-zinc-800 rounded-2xl">
              No incident selected or matching current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
