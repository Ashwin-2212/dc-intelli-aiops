import React, { useState } from 'react';
import {
  Layers,
  Thermometer,
  Zap,
  Activity,
  Wind,
  Server,
  ChevronRight,
  ChevronDown,
  Building2,
  FolderTree,
  Cpu,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Flame,
  Search,
  Maximize2,
  CornerDownRight,
} from 'lucide-react';
import { DigitalTwinEngine } from '../services/digitalTwinEngine';
import { DigitalTwinNode, DigitalTwinNodeType } from '../types';

interface DigitalTwinViewProps {
  onSelectRack: (rackId: string) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ onSelectRack }) => {
  const engine = DigitalTwinEngine.getInstance();
  const rootNode = engine.treeRoot;

  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode>(rootNode);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set(['DC-01', 'BLD-01', 'ROOM-A', 'ROW-01', 'ROW-02', 'RACK-01', 'RACK-07', 'SRV-001'])
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tree' | '2d_layout' | 'relationships'>('tree');

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedNodeIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedNodeIds(next);
  };

  const getNodeIcon = (type: DigitalTwinNodeType) => {
    switch (type) {
      case 'data_center':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'room':
        return <Boxes className="w-4 h-4 text-cyan-400" />;
      case 'row':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'rack':
        return <Server className="w-4 h-4 text-orange-400" />;
      case 'device':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'component':
      default:
        return <Zap className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getStateColor = (state: DigitalTwinNode['deviceState']) => {
    switch (state) {
      case 'critical':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'warning':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'standby':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      case 'maintenance':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      case 'offline':
        return 'text-zinc-500 bg-zinc-800 border-zinc-700';
      case 'online':
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    }
  };

  // Render Tree Node Recursively
  const renderTreeNode = (node: DigitalTwinNode, depth = 0) => {
    const isExpanded = expandedNodeIds.has(node.id);
    const isSelected = selectedNode.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none font-mono text-xs">
        <div
          onClick={() => {
            setSelectedNode(node);
            if (node.type === 'rack') {
              onSelectRack(node.id);
            }
          }}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
          className={`flex items-center justify-between py-2 pr-3 rounded-xl cursor-pointer transition-all ${
            isSelected
              ? 'bg-orange-500/20 border border-orange-500/50 text-white font-bold shadow-md'
              : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="text-zinc-400 hover:text-white p-0.5 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block ml-1 opacity-20">•</span>
            )}

            <span className="shrink-0">{getNodeIcon(node.type)}</span>
            <span className="truncate">{node.name}</span>
            <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 rounded">
              L{node.level}:{node.type}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {node.incidents.criticalCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
            <span
              className={`text-[9px] uppercase px-2 py-0.5 rounded-full border font-bold ${getStateColor(
                node.deviceState
              )}`}
            >
              {node.deviceState}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-zinc-800/80 ml-4 my-0.5">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-orange-400" />
              Logical Digital Twin Studio
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Feature 8 (7-Level Hierarchy)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Data Center → Building → Room → Row → Rack → Device → Component topological state reflection.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Logical Hierarchy Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('2d_layout')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === '2d_layout'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>2D Topological Floor</span>
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'relationships'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Relationships & Lineage</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Tree / 2D Floor + Right Inspector Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Tree or 2D Layout */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <span className="font-bold uppercase tracking-wider text-orange-400">
                Logical Hierarchy Explorer
              </span>
              <span className="text-[10px] text-zinc-500">
                (7 Strict Structural Tiers)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setExpandedNodeIds(
                    new Set([
                      'DC-01',
                      'BLD-01',
                      'ROOM-A',
                      'ROW-01',
                      'ROW-02',
                      'RACK-01',
                      'RACK-02',
                      'RACK-07',
                      'SRV-001',
                      'SRV-002',
                      'SRV-003',
                      'SRV-007-DB1',
                    ])
                  )
                }
                className="text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedNodeIds(new Set(['DC-01']))}
                className="text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
              >
                Collapse
              </button>
            </div>
          </div>

          {activeTab === 'tree' ? (
            /* 7-Level Tree Browser */
            <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
              {renderTreeNode(rootNode)}
            </div>
          ) : activeTab === '2d_layout' ? (
            /* 2D Topological Grid */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span className="font-bold text-cyan-400">DC-01 / Building-01 / Room-A</span>
                  <span className="text-zinc-500">Floor Coordinates: 24m x 18m</span>
                </div>

                {/* Cold Aisle 1 */}
                <div className="border border-cyan-500/30 rounded-lg p-3 bg-cyan-950/20 space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center justify-between">
                    <span>Row-01 (Zone A Compute)</span>
                    <span>CRAC-01 Supply (18.5°C)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['RACK-01', 'RACK-02'].map((rackId) => {
                      const rackNode = engine.findNodeById(rackId);
                      if (!rackNode) return null;
                      const isSelected = selectedNode.id === rackNode.id;
                      return (
                        <div
                          key={rackId}
                          onClick={() => setSelectedNode(rackNode)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{rackNode.name}</div>
                          <div className="text-[11px] font-mono mt-1 text-cyan-400">
                            {rackNode.temperature.currentC}°C | {rackNode.power.currentKw} kW
                          </div>
                          <div className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                            Health: {rackNode.health}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hot Aisle Corridor */}
                <div className="py-1 px-3 bg-orange-950/20 border border-orange-500/20 rounded text-[10px] font-mono text-orange-400 text-center uppercase tracking-widest">
                  ▲ Hot Aisle Return (Exhaust 34.2°C) ▲
                </div>

                {/* Cold Aisle 2 (Row-02 with RACK-07) */}
                <div className="border border-orange-500/30 rounded-lg p-3 bg-orange-950/20 space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-orange-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Row-02 (Database Cluster Tier)
                    </span>
                    <span>CRAC-03 Restricted</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['RACK-07'].map((rackId) => {
                      const rackNode = engine.findNodeById(rackId);
                      if (!rackNode) return null;
                      const isSelected = selectedNode.id === rackNode.id;
                      return (
                        <div
                          key={rackId}
                          onClick={() => setSelectedNode(rackNode)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                              : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{rackNode.name}</div>
                          <div className="text-[11px] font-mono mt-1 text-rose-400 font-bold">
                            {rackNode.temperature.currentC}°C (HIGH RISK)
                          </div>
                          <div className="text-[9px] font-mono text-rose-300 mt-1 uppercase">
                            Health: {rackNode.health}% • 2 Incidents
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Relationships & Lineage View */
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4 font-mono text-xs">
              <div className="text-zinc-400">
                Lineage for node: <strong className="text-white">{selectedNode.name}</strong>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] uppercase text-zinc-500">Upstream Power Source</span>
                  <div className="font-bold text-amber-400 mt-0.5">
                    {selectedNode.relationships.upstreamPowerSource}
                  </div>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] uppercase text-zinc-500">Upstream Cooling Unit</span>
                  <div className="font-bold text-cyan-400 mt-0.5">
                    {selectedNode.relationships.upstreamCoolingUnit}
                  </div>
                </div>
                {selectedNode.relationships.networkSwitchId && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] uppercase text-zinc-500">Network Switch Fabric</span>
                    <div className="font-bold text-purple-400 mt-0.5">
                      {selectedNode.relationships.networkSwitchId}
                    </div>
                  </div>
                )}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] uppercase text-zinc-500">Connected Topology Peers</span>
                  <div className="font-bold text-white mt-0.5">
                    {selectedNode.relationships.connectedPeersCount} interconnected entities ({selectedNode.relationships.dependencyRole})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Comprehensive Digital Twin State Reflection Pane */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border-2 border-zinc-800 rounded-2xl p-5 space-y-5 shadow-2xl">
          {/* Node Title & Breadcrumbs */}
          <div className="space-y-2 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNodeIcon(selectedNode.type)}
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-orange-400">
                  Level {selectedNode.level}: {selectedNode.type.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border font-mono font-bold ${getStateColor(
                  selectedNode.deviceState
                )}`}
              >
                {selectedNode.deviceState}
              </span>
            </div>

            <h2 className="text-base font-bold font-mono text-white">
              {selectedNode.name}
            </h2>

            <div className="text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800 truncate" title={selectedNode.path}>
              <span className="text-zinc-600 font-bold">Path: </span>
              {selectedNode.path}
            </div>
          </div>

          {/* 8 Mandatory Digital Twin Properties */}
          <div className="space-y-3 font-mono text-xs">
            {/* 1. Device State & 2. Health */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Device State
                </span>
                <div className="text-sm font-bold text-white uppercase">
                  {selectedNode.deviceState}
                </div>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Health Score
                </span>
                <div
                  className={`text-sm font-bold ${
                    selectedNode.health > 85
                      ? 'text-emerald-400'
                      : selectedNode.health > 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedNode.health}%
                </div>
              </div>
            </div>

            {/* 3. Location */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" /> Location Profile
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                <div>Campus: <strong className="text-white">{selectedNode.location.dataCenter}</strong></div>
                <div>Building: <strong className="text-white">{selectedNode.location.building}</strong></div>
                <div>Hall: <strong className="text-white">{selectedNode.location.room}</strong></div>
                <div>Aisle: <strong className="text-white">{selectedNode.location.row}</strong></div>
                {selectedNode.location.rack && (
                  <div>Rack: <strong className="text-orange-400">{selectedNode.location.rack}</strong></div>
                )}
                {selectedNode.location.uPosition && (
                  <div>RU Slot: <strong className="text-orange-400">U{selectedNode.location.uPosition}</strong></div>
                )}
              </div>
            </div>

            {/* 4. Capacity & 5. Power */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-blue-400" /> Capacity
                </span>
                <div className="text-xs font-bold text-white">
                  {selectedNode.capacity.used} / {selectedNode.capacity.total} {selectedNode.capacity.unit}
                </div>
                <div className="text-[10px] text-cyan-400">
                  {selectedNode.capacity.utilizationPercent}% Utilized
                </div>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> Power Draw
                </span>
                <div className="text-xs font-bold text-white">
                  {selectedNode.power.currentKw} kW / {selectedNode.power.ratedKw} kW
                </div>
                {selectedNode.power.powerFactor && (
                  <div className="text-[10px] text-zinc-400">
                    PF: {selectedNode.power.powerFactor}
                  </div>
                )}
              </div>
            </div>

            {/* 6. Temperature */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" /> Temperature Telemetry
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">
                  Current: <strong className="text-white">{selectedNode.temperature.currentC}°C</strong>
                </span>
                <span className="text-zinc-400">
                  Baseline: {selectedNode.temperature.baselineC}°C
                </span>
                <span className={`font-bold ${selectedNode.temperature.deltaC > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  +{selectedNode.temperature.deltaC}°C ({selectedNode.temperature.sensorLocation})
                </span>
              </div>
            </div>

            {/* 7. Active Incidents */}
            <div className={`p-3 rounded-xl border ${selectedNode.incidents.activeCount > 0 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-zinc-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" /> Correlated Incidents
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${selectedNode.incidents.activeCount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {selectedNode.incidents.activeCount} Active ({selectedNode.incidents.criticalCount} Critical)
                </span>
              </div>
              {selectedNode.incidents.summary && (
                <div className="text-[11px] text-zinc-300 mt-1.5 leading-relaxed">
                  {selectedNode.incidents.summary}
                </div>
              )}
            </div>

            {/* 8. Relationships & Upstream Dependencies */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <Share2 className="w-3 h-3 text-purple-400" /> Lineage & Dependencies
              </span>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>
                  <span className="text-zinc-500">Power Source: </span>
                  <strong className="text-amber-300">{selectedNode.relationships.upstreamPowerSource}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Cooling Unit: </span>
                  <strong className="text-cyan-300">{selectedNode.relationships.upstreamCoolingUnit}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Dependency: </span>
                  <strong className="text-purple-300">{selectedNode.relationships.dependencyRole}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
