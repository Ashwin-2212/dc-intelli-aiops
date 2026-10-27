import React, { useState, useEffect } from 'react';
import {
  Radio,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Zap,
  Flame,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Send,
  Cpu,
} from 'lucide-react';
import { CollectorManager } from '../services/collectors/CollectorManager';
import { CollectorHealthStatus, DeviceSourceMode, NormalizedTelemetryPayload } from '../services/collectors/types';

export const CollectorConsoleView: React.FC = () => {
  const manager = CollectorManager.getInstance();
  const [collectors, setCollectors] = useState<CollectorHealthStatus[]>(manager.getHealthStatuses());
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>(collectors[0]?.id || 'adapter-redfish-01');
  const [rawPayloads, setRawPayloads] = useState<NormalizedTelemetryPayload[]>([]);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [pingResult, setPingResult] = useState<{ message: string; latencyMs: number } | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  useEffect(() => {
    // Start collector manager if not running
    manager.start();

    const updateInterval = setInterval(() => {
      setCollectors(manager.getHealthStatuses());
      const latest = manager.getAllLatestNormalized();
      if (latest.length > 0) {
        setRawPayloads(latest);
      }
    }, 1500);

    const unsubscribe = manager.subscribe(payloads => {
      if (isLiveStream) {
        setRawPayloads(prev => [...payloads, ...prev].slice(0, 30));
      }
    });

    return () => {
      clearInterval(updateInterval);
      unsubscribe();
    };
  }, [isLiveStream]);

  const handleToggleSourceMode = (collectorId: string, currentMode: DeviceSourceMode) => {
    const newMode: DeviceSourceMode = currentMode === 'simulated' ? 'real_hardware' : 'simulated';
    manager.setSourceModeForAdapter(collectorId, newMode);
    setCollectors(manager.getHealthStatuses());
  };

  const handleToggleAllSources = (mode: DeviceSourceMode) => {
    manager.setSourceModeForAll(mode);
    setCollectors(manager.getHealthStatuses());
  };

  const handleTestPing = async (collectorId: string) => {
    const adapter = manager.getAdapter(collectorId);
    if (!adapter) return;
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await adapter.testConnection();
      setPingResult({ message: res.message, latencyMs: res.latencyMs });
    } catch (err: any) {
      setPingResult({ message: `Connection failed: ${err.message}`, latencyMs: 0 });
    } finally {
      setIsPinging(false);
    }
  };

  const selectedCollector = collectors.find(c => c.id === selectedCollectorId) || collectors[0];
  const selectedAdapter = manager.getAdapter(selectedCollectorId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0c] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              Edge Collector & Protocol Adapter Console
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
              Redfish • SNMP • Modbus/BACnet
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Universal Telemetry Normalization Pipeline ingesting Redfish DMTF REST, SNMP v2c/v3 MIBs, and Modbus RTU/TCP. Replace simulated sources with physical BMCs seamlessly.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl flex items-center gap-1 font-mono text-xs">
            <span className="text-zinc-500 px-2">Global Mode:</span>
            <button
              onClick={() => handleToggleAllSources('simulated')}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-all"
            >
              Simulated
            </button>
            <button
              onClick={() => handleToggleAllSources('real_hardware')}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
            >
              Physical BMCs
            </button>
          </div>

          <button
            onClick={() => setIsLiveStream(!isLiveStream)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 border ${
              isLiveStream
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <Activity className={`w-4 h-4 ${isLiveStream ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveStream ? 'Live Stream Active' : 'Stream Paused'}</span>
          </button>
        </div>
      </div>

      {/* Collector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collectors.map(col => {
          const isSelected = col.id === selectedCollectorId;
          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollectorId(col.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 font-mono ${
                isSelected
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-cyan-500/50 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'bg-[#0a0a0c] hover:bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      col.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-white uppercase">{col.protocol}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    col.deviceSourceMode === 'real_hardware'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {col.deviceSourceMode === 'real_hardware' ? 'Physical BMC' : 'Simulated'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">{col.name}</h3>
                <span className="text-[11px] text-zinc-500">Targets: {col.targetCount} Endpoints</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Latency</span>
                  <span className="text-zinc-200 font-bold">{col.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Packets</span>
                  <span className="text-zinc-200 font-bold">{col.packetCount}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Errors</span>
                  <span className={col.errorCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {col.errorCount}
                  </span>
                </div>
              </div>

              {/* Toggle Source Mode Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleToggleSourceMode(col.id, col.deviceSourceMode);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] text-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {col.deviceSourceMode === 'simulated' ? (
                  <>
                    <ToggleLeft className="w-4 h-4 text-zinc-400" />
                    <span>Switch to Physical Device</span>
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 text-cyan-400" />
                    <span>Switch to Simulation Mode</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Collector Detail Panel */}
      {selectedCollector && (
        <div className="bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                  {selectedCollector.protocol} Config
                </span>
                <h3 className="text-sm font-bold text-white">{selectedCollector.name}</h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Configured Endpoint URL: <span className="text-zinc-200">{selectedAdapter?.config.endpointUrl}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestPing(selectedCollector.id)}
                disabled={isPinging}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Test Endpoint Ping</span>
              </button>
            </div>
          </div>

          {pingResult && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-xl text-cyan-200 flex items-center justify-between">
              <span>{pingResult.message}</span>
              <span className="font-bold">{pingResult.latencyMs} ms latency</span>
            </div>
          )}

          {/* Protocol Specifications & Normalization Map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase block">Inbound Schema</span>
              <span className="text-zinc-200 font-bold block">
                {selectedCollector.protocol === 'redfish'
                  ? 'DMTF DSP0266 v1.14.0 (JSON)'
                  : selectedCollector.protocol === 'snmp'
                  ? 'RFC 1213 / RFC 1628 UPS-MIB'
                  : 'Modbus TCP / RTU Registers'}
              </span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase block">Poll Interval</span>
              <span className="text-zinc-200 font-bold block">
                {selectedAdapter?.config.pollIntervalMs} ms (Sub-second Edge Buffer)
              </span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase block">Canonical Contract</span>
              <span className="text-emerald-400 font-bold block">
                NormalizedTelemetryPayload (Quality: {selectedCollector.deviceSourceMode === 'real_hardware' ? 'GOOD' : 'SIMULATED'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Normalized Telemetry Event Stream */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live Normalized Telemetry Packet Stream
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Normalized payloads flowing through the canonical data contract into the Time-Series & Anomaly Engine.
            </p>
          </div>
          <span className="text-xs text-zinc-500">{rawPayloads.length} Packets Buffered</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar font-mono text-xs">
          {rawPayloads.slice(0, 10).map((payload, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    payload.protocol === 'redfish'
                      ? 'bg-rose-500/20 text-rose-300'
                      : payload.protocol === 'snmp'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {payload.protocol}
                </span>
                <div>
                  <span className="font-bold text-white">{payload.deviceName}</span>
                  <span className="text-zinc-500 text-[11px] ml-2">({payload.deviceId})</span>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {payload.metrics.cpuTempCelsius && (
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                    Temp: <b className="text-rose-400">{payload.metrics.cpuTempCelsius.value}°C</b>
                  </span>
                )}
                {payload.metrics.powerDrawWatts && (
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                    Power: <b className="text-amber-400">{payload.metrics.powerDrawWatts.value} W</b>
                  </span>
                )}
                {payload.metrics.fanSpeedRpm && (
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                    Fan: <b className="text-blue-400">{payload.metrics.fanSpeedRpm.value} RPM</b>
                  </span>
                )}
                {payload.metrics.supplyTempCelsius && (
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                    Supply: <b className="text-cyan-400">{payload.metrics.supplyTempCelsius.value}°C</b>
                  </span>
                )}
                {payload.metrics.batteryRuntimeMinutes && (
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                    Reserve: <b className="text-emerald-400">{payload.metrics.batteryRuntimeMinutes.value} min</b>
                  </span>
                )}

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    payload.sourceMode === 'real_hardware'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {payload.sourceMode === 'real_hardware' ? 'Physical' : 'Sim'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
