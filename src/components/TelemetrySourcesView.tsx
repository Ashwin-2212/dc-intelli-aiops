import React, { useState } from 'react';
import {
  Radio,
  Server,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Wifi,
  Shield,
  Layers,
  Send,
  FileCode,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { TelemetryPlatformObservability } from '../services/telemetry/TelemetryPlatformObservability';
import { TelemetryIntelligencePipeline } from '../services/telemetry/TelemetryIntelligencePipeline';
import { TelemetrySourceRegistration, TelemetrySourceType } from '../types/telemetryIntelligence';

interface TelemetrySourcesViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetrySourcesView: React.FC<TelemetrySourcesViewProps> = ({ onOpenCopilot }) => {
  const obs = TelemetryPlatformObservability.getInstance();
  const [sources, setSources] = useState<TelemetrySourceRegistration[]>(obs.getSources());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTestPayloadModal, setShowTestPayloadModal] = useState<boolean>(false);
  const [testPayloadText, setTestPayloadText] = useState<string>(
    JSON.stringify(
      {
        telemetryId: `TEL-INGEST-${Date.now().toString().slice(-4)}`,
        sourceId: 'SRC-WIN-AGENT-01',
        sourceType: 'windows_agent',
        assetId: 'SRV-R-04-02',
        assetName: 'Server SRV-R-04-02',
        assetType: 'server',
        timestamp: new Date().toISOString(),
        location: {
          dataCenter: 'dc-va-01',
          floor: 'F1',
          room: 'R01',
          rack: 'R-04',
          uPosition: 12,
        },
        metrics: {
          cpu: 84.5,
          memory: 72.0,
          temperature: 74.2,
          power: 420.0,
          networkIn: 24.5,
        },
        status: 'warning',
      },
      null,
      2
    )
  );

  const [testResult, setTestResult] = useState<string | null>(null);

  // New source form state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<TelemetrySourceType>('windows_agent');
  const [newAssetId, setNewAssetId] = useState('SRV-R-05-01');
  const [newEndpointUrl, setNewEndpointUrl] = useState('https://agent.alpha-dc.internal:8443');

  const handleRegisterSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName) return;

    const newSource: TelemetrySourceRegistration = {
      sourceId: `SRC-${Date.now().toString().slice(-4)}`,
      sourceName: newSourceName,
      sourceType: newSourceType,
      assetId: newAssetId,
      assetName: newAssetId,
      assetType: newSourceType.includes('server') || newSourceType.includes('windows') ? 'server' : 'sensor',
      endpointUrl: newEndpointUrl,
      protocol: newSourceType === 'iot_esp32_mqtt' ? 'MQTT' : newSourceType === 'redfish_bmc' ? 'Redfish' : 'REST',
      status: 'ONLINE',
      lastSeenEpochMs: Date.now(),
      lastSeenFormatted: 'Just now',
      samplingIntervalSec: 2,
      qualityScore: 98,
      sensorTrustScore: 95,
      totalPacketsReceived: 1,
      totalPacketsDropped: 0,
      totalValidationErrors: 0,
    };

    obs.registerOrUpdateSource(newSource);
    setSources(obs.getSources());
    setShowAddModal(false);
    setNewSourceName('');
  };

  const handleSendTestPayload = () => {
    try {
      const parsed = JSON.parse(testPayloadText);
      const pipeline = TelemetryIntelligencePipeline.getInstance();
      const res = pipeline.processTelemetry(parsed);

      setTestResult(
        `✅ INGEST SUCCESS!\nPacket ID: ${res.packet?.telemetryId}\nValidation: Validated & Sanitized\nAnomalies Detected: ${res.anomalies.length}\nBlast Radius Calculated: ${res.blastRadius ? 'Yes (' + res.blastRadius.affectedServersCount + ' servers)' : 'None'}`
      );
    } catch (err: any) {
      setTestResult(`❌ ERROR: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Telemetry Source & Sensor Trust Management
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/30">
                {sources.length} SOURCES ACTIVE
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Unified multi-source ingestion management for Windows agents, Redfish BMC, ESP32 IoT micro-sensors, Modbus HVAC, and Simulators.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTestPayloadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs font-mono font-medium transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-orange-400" />
            Send Ingest Payload
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium text-xs hover:opacity-90 shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Telemetry Source
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => {
          const isSim = src.sourceType === 'telemetry_simulator';
          return (
            <div
              key={src.sourceId}
              className="p-5 bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl shadow-lg transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-orange-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white truncate max-w-[180px]">{src.sourceName}</h3>
                    <div className="text-[10px] text-zinc-400 font-mono">{src.sourceId}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                    src.status === 'ONLINE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {src.status}
                </span>
              </div>

              {/* Specs and Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/40 p-3 rounded-xl border border-zinc-800/60">
                <div>
                  <span className="text-zinc-400">Protocol:</span>{' '}
                  <span className="text-zinc-200 font-bold">{src.protocol}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Sampling:</span>{' '}
                  <span className="text-zinc-200 font-bold">{src.samplingIntervalSec}s</span>
                </div>
                <div>
                  <span className="text-zinc-400">Target Asset:</span>{' '}
                  <span className="text-orange-300 font-bold">{src.assetId}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Last Seen:</span>{' '}
                  <span className="text-emerald-300 font-bold">{src.lastSeenFormatted}</span>
                </div>
              </div>

              {/* Sensor Trust & Quality Scores */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-zinc-400">Quality Score</span>
                    <span className="text-emerald-400 font-bold">{src.qualityScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${src.qualityScore}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-zinc-400">Sensor Trust Score</span>
                    <span className="text-purple-400 font-bold">{src.sensorTrustScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${src.sensorTrustScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                <span>Packets: {src.totalPacketsReceived.toLocaleString()}</span>
                <span>Errors: {src.totalValidationErrors}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Telemetry Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Register New Telemetry Source
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSource} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Edge Server Redfish Collector Node 03"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">Source Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="windows_agent">Windows OS Agent</option>
                    <option value="linux_agent">Linux eBPF Agent</option>
                    <option value="redfish_bmc">Redfish BMC (iDRAC/iLO)</option>
                    <option value="iot_esp32_mqtt">IoT Sensor (ESP32 MQTT)</option>
                    <option value="modbus_bacnet">Modbus / BACnet HVAC</option>
                    <option value="csv_import">CSV / JSON Batch Ingest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400">Target Asset ID</label>
                  <input
                    type="text"
                    required
                    value={newAssetId}
                    onChange={(e) => setNewAssetId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Endpoint URL / Broker Connection</label>
                <input
                  type="text"
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-xl"
                >
                  Register Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Ingestion Payload Modal */}
      {showTestPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-400" />
                Universal Telemetry Ingestion Tester
              </h3>
              <button onClick={() => setShowTestPayloadModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Submit raw telemetry JSON through the universal pipeline (Validation → Normalization → Quality → Baseline → Anomaly → Correlation → Storage).
            </p>

            <textarea
              rows={9}
              value={testPayloadText}
              onChange={(e) => setTestPayloadText(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-orange-500 custom-scrollbar"
            />

            {testResult && (
              <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 whitespace-pre-wrap">
                {testResult}
              </pre>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowTestPayloadModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendTestPayload}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-xl text-xs font-mono"
              >
                Execute Pipeline Ingest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
