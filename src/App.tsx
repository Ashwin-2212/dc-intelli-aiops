import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SuperAdminControlView } from './components/SuperAdminControlView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { EngineerDashboardView } from './components/EngineerDashboardView';
import { OperatorDashboardView } from './components/OperatorDashboardView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DigitalTwinView } from './components/DigitalTwinView';
import { RackManagementView } from './components/RackManagementView';
import { ServerMonitoringView } from './components/ServerMonitoringView';
import { CoolingIntelligenceView } from './components/CoolingIntelligenceView';
import { PowerEnergyView } from './components/PowerEnergyView';
import { UPSManagementView } from './components/UPSManagementView';
import { AiAnomaliesView } from './components/AiAnomaliesView';
import { AlertCorrelationView } from './components/AlertCorrelationView';
import { PredictiveMaintenanceView } from './components/PredictiveMaintenanceView';
import { CapacityPlanningView } from './components/CapacityPlanningView';
import { WhatIfSandbox } from './components/WhatIfSandbox';
import { RootCauseAnalysisView } from './components/RootCauseAnalysisView';
import { CollectorConsoleView } from './components/CollectorConsoleView';
import { IncidentWorkOrdersView } from './components/IncidentWorkOrdersView';
import { ReportsExportView } from './components/ReportsExportView';
import { SettingsAdminView } from './components/SettingsAdminView';
import { DependencyGraphView } from './components/DependencyGraphView';
import { IncidentTimelineView } from './components/IncidentTimelineView';
import { AssetLifecycleDriftView } from './components/AssetLifecycleDriftView';
import { HealthSlaView } from './components/HealthSlaView';
import { AiCopilotModal } from './components/AiCopilotModal';
import { TelemetryLiveView } from './components/TelemetryLiveView';
import { TelemetrySourcesView } from './components/TelemetrySourcesView';
import { TelemetryQualityView } from './components/TelemetryQualityView';
import { TelemetryDataExplorerView } from './components/TelemetryDataExplorerView';
import { TelemetryIncidentReplayView } from './components/TelemetryIncidentReplayView';
import { TelemetryPlatformObservabilityView } from './components/TelemetryPlatformObservabilityView';
import { TelemetryClosedLoopView } from './components/TelemetryClosedLoopView';
import { TelemetryEngine } from './services/telemetrySimulator';
import { WorkOrder, UserRole } from './types';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied';
import { RoleType } from './auth/types';
import { canRoleAccessView, getDefaultLandingRoute, getDefaultLandingView, ROUTE_VIEW_MAP } from './auth/permissions';
import { workOrderService } from './services/api';

function MainAppContent() {
  const { user, role, isAuthenticated, isLoading, switchRole } = useAuth();

  const [activeView, setActiveViewInternal] = useState<string>('super-admin');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [selectedRackForElevation, setSelectedRackForElevation] = useState<string>('R-04');
  const [workOrderNotification, setWorkOrderNotification] = useState<string | null>(null);

  // Subscribe to TelemetryEngine tick updates to keep entire app reactive
  const [, setTick] = useState(0);

  useEffect(() => {
    const engine = TelemetryEngine.getInstance();
    const unsubscribe = engine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Synchronized view setter with browser history/URL
  const setActiveView = useCallback((view: string, updateUrl: boolean = true) => {
    setActiveViewInternal(view);
    if (updateUrl && typeof window !== 'undefined') {
      const path = Object.keys(ROUTE_VIEW_MAP).find((p) => ROUTE_VIEW_MAP[p] === view) || `/${view}`;
      window.history.pushState({ view }, '', path);
    }
  }, []);

  // Sync role and route on login / session restore / role switch
  useEffect(() => {
    if (!isAuthenticated || !role) return;

    // Synchronize legacy currentRole state with auth role
    const r = String(role).toUpperCase();
    if (r === 'ADMIN') setCurrentRole('super_admin');
    else if (r === 'MANAGER' || r === 'DATA_CENTER_MANAGER') setCurrentRole('manager');
    else if (r === 'ENGINEER' || r === 'OPERATOR') setCurrentRole('engineer');
    else if (r === 'ANALYST' || r === 'VIEWER') setCurrentRole('viewer');

    const path = window.location.pathname;

    // If on /login or root /, redirect to role default
    if (path === '/login' || path === '/') {
      const defaultView = getDefaultLandingView(role);
      const defaultRoute = getDefaultLandingRoute(role);
      setActiveViewInternal(defaultView);
      window.history.replaceState({ view: defaultView }, '', defaultRoute);
    } else {
      // Check if URL matches a known view
      const matchedView = ROUTE_VIEW_MAP[path] || path.replace('/', '');
      if (matchedView) {
        setActiveViewInternal(matchedView);
      }
    }
  }, [isAuthenticated, role]);

  // Listen for browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.view) {
        setActiveViewInternal(e.state.view);
      } else {
        const path = window.location.pathname;
        const matchedView = ROUTE_VIEW_MAP[path] || (role ? getDefaultLandingView(role) : 'overview');
        setActiveViewInternal(matchedView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [role]);

  const handleOpenCopilot = (prompt?: string) => {
    if (prompt) setCopilotInitialPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const handleSelectRack = (rackId: string) => {
    setSelectedRackForElevation(rackId);
    setActiveView('racks');
  };

  const handleSearchSelect = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('super') || q.includes('admin') || q.includes('kill') || q.includes('root')) {
      setActiveView('super-admin');
    } else if (q.includes('manager') || q.includes('budget') || q.includes('cockpit')) {
      setActiveView('manager-cockpit');
    } else if (q.includes('engineer') || q.includes('probe') || q.includes('diag')) {
      setActiveView('engineer-diag');
    } else if (q.includes('operator') || q.includes('noc')) {
      setActiveView('operator-noc');
    } else if (q.includes('collector') || q.includes('redfish') || q.includes('snmp') || q.includes('modbus') || q.includes('protocol')) {
      setActiveView('collectors');
    } else if (q.includes('rack') || q.includes('r-')) {
      setActiveView('racks');
    } else if (q.includes('server') || q.includes('cpu') || q.includes('blade')) {
      setActiveView('servers');
    } else if (q.includes('correlat') || q.includes('spam') || q.includes('stress') || q.includes('thermal stress') || q.includes('feature 2')) {
      setActiveView('alert-correlation');
    } else if (q.includes('cool') || q.includes('crac') || q.includes('chiller') || q.includes('temp')) {
      setActiveView('cooling');
    } else if (q.includes('power') || q.includes('pue') || q.includes('kw') || q.includes('energy')) {
      setActiveView('power');
    } else if (q.includes('ups') || q.includes('battery')) {
      setActiveView('ups');
    } else if (q.includes('anom') || q.includes('alert')) {
      setActiveView('anomalies');
    } else if (q.includes('predict') || q.includes('fail') || q.includes('vibrat')) {
      setActiveView('predictive');
    } else if (q.includes('what') || q.includes('simul')) {
      setActiveView('what-if');
    } else if (q.includes('telemetry live') || q.includes('stream') || q.includes('live telemetry')) {
      setActiveView('telemetry-live');
    } else if (q.includes('sources') || q.includes('source') || q.includes('sensor trust') || q.includes('esp32')) {
      setActiveView('telemetry-sources');
    } else if (q.includes('quality') || q.includes('dual health') || q.includes('completeness') || q.includes('freshness')) {
      setActiveView('telemetry-quality');
    } else if (q.includes('explorer') || q.includes('query') || q.includes('search telemetry') || q.includes('filter')) {
      setActiveView('telemetry-explorer');
    } else if (q.includes('replay') || q.includes('counterfactual') || q.includes('scrubber') || q.includes('what would')) {
      setActiveView('telemetry-replay');
    } else if (q.includes('closed loop') || q.includes('decision') || q.includes('outcome') || q.includes('approve')) {
      setActiveView('telemetry-closed-loop');
    } else if (q.includes('platform') || q.includes('pipeline health') || q.includes('audit log') || q.includes('events/sec')) {
      setActiveView('telemetry-platform');
    } else if (q.includes('report') || q.includes('audit') || q.includes('pdf') || q.includes('export')) {
      setActiveView('reports');
    } else {
      handleOpenCopilot(query);
    }
  };

  const handleGenerateWorkOrder = (sourceItem: any) => {
    const engine = TelemetryEngine.getInstance();
    const newOrder: WorkOrder = {
      id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Remediation for ${sourceItem.deviceName || sourceItem.targetAsset || sourceItem.deviceId || 'Asset'}`,
      targetAsset: sourceItem.deviceName || sourceItem.deviceId || 'CRAC-02',
      severity: sourceItem.severity || 'high',
      status: 'open',
      assignedTo: 'On-Call Technician (Auto-Dispatched)',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      slaDueHours: sourceItem.severity === 'critical' ? 2 : 6,
      description: `Automated work order triggered by AIOps Engine for ${sourceItem.metric || sourceItem.component || 'Incident'}. Action required immediately.`,
    };

    engine.workOrders = [newOrder, ...engine.workOrders];
    workOrderService.create(newOrder).catch((err) => {
      console.warn('[WorkOrder API Warning] Could not persist to MongoDB:', err);
    });
    setWorkOrderNotification(`Work Order ${newOrder.id} dispatched successfully!`);
    setTimeout(() => setWorkOrderNotification(null), 4000);
    setActiveView('incidents');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    let mappedRole: RoleType = 'ADMIN';
    const roleStr = String(newRole);
    if (roleStr === 'super_admin' || roleStr === 'ADMIN') mappedRole = 'ADMIN';
    else if (roleStr === 'manager' || roleStr === 'MANAGER') mappedRole = 'MANAGER';
    else if (roleStr === 'engineer' || roleStr === 'ENGINEER') mappedRole = 'ENGINEER';
    else if (roleStr === 'viewer' || roleStr === 'ANALYST') mappedRole = 'ANALYST';
    switchRole(mappedRole);
  };

  // Loading security context screen
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050508] text-zinc-300 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-600/50 flex items-center justify-center shadow-lg shadow-purple-950">
            <span className="w-4 h-4 rounded-full bg-purple-400 animate-ping" />
          </div>
          <div className="text-xs text-zinc-400">Loading DC-Intelli Security Context...</div>
        </div>
      </div>
    );
  }

  // If unauthenticated: render Login Page
  if (!isAuthenticated || !user) {
    return (
      <LoginPage
        onLoginSuccess={(loggedRole) => {
          const defaultView = getDefaultLandingView(loggedRole);
          const defaultRoute = getDefaultLandingRoute(loggedRole);
          setActiveViewInternal(defaultView);
          window.history.replaceState({ view: defaultView }, '', defaultRoute);
        }}
      />
    );
  }

  // Check role authorization for currently active view
  const isAuthorizedForView = canRoleAccessView(role, activeView);

  return (
    <div className="flex h-screen bg-[#070709] text-zinc-100 overflow-hidden font-sans select-none antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentRole={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenCopilot={() => handleOpenCopilot()}
          onOpenSimulationModal={() => setActiveView('what-if')}
          onSearchSelect={handleSearchSelect}
        />

        {/* Work Order Toast Notification */}
        {workOrderNotification && (
          <div className="bg-purple-600 text-white font-mono text-xs px-4 py-2 flex items-center justify-between shadow-lg z-30">
            <span>👑 {workOrderNotification}</span>
            <button
              onClick={() => setWorkOrderNotification(null)}
              className="text-white font-bold text-sm px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar cyber-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            {!isAuthorizedForView ? (
              <AccessDenied
                onReturnToDashboard={() => setActiveView(getDefaultLandingView(role!))}
                restrictedViewName={activeView}
              />
            ) : (
              <>
                {activeView === 'super-admin' && (
                  <SuperAdminControlView
                    currentRole={currentRole}
                    onRoleChange={handleRoleChange}
                    setActiveView={setActiveView}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'manager-cockpit' && (
                  <ManagerDashboardView
                    currentRole={currentRole}
                    setActiveView={setActiveView}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'engineer-diag' && (
                  <EngineerDashboardView
                    currentRole={currentRole}
                    setActiveView={setActiveView}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'operator-noc' && (
                  <OperatorDashboardView
                    currentRole={currentRole}
                    setActiveView={setActiveView}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'overview' && (
                  <OverviewDashboard
                    setActiveView={setActiveView}
                    onOpenCopilot={handleOpenCopilot}
                    onSelectRack={handleSelectRack}
                  />
                )}

                {activeView === 'digital-twin' && (
                  <DigitalTwinView onSelectRack={handleSelectRack} />
                )}

                {(activeView === 'racks' || activeView === 'assets') && (
                  <RackManagementView selectedRackId={selectedRackForElevation} />
                )}

                {activeView === 'servers' && <ServerMonitoringView />}

                {activeView === 'cooling' && <CoolingIntelligenceView />}

                {(activeView === 'power' || activeView === 'energy-optimizer') && <PowerEnergyView />}

                {activeView === 'ups' && <UPSManagementView />}

                {activeView === 'alert-correlation' && (
                  <AlertCorrelationView
                    setActiveView={setActiveView}
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'anomalies' && (
                  <AiAnomaliesView
                    setActiveView={setActiveView}
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                  />
                )}

                {activeView === 'predictive' && (
                  <PredictiveMaintenanceView onGenerateWorkOrder={handleGenerateWorkOrder} />
                )}

                {activeView === 'collectors' && <CollectorConsoleView />}

                {activeView === 'capacity' && <CapacityPlanningView />}

                {activeView === 'what-if' && <WhatIfSandbox />}

                {activeView === 'root-cause' && (
                  <RootCauseAnalysisView
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'incidents' && <IncidentWorkOrdersView />}

                {activeView === 'dependencies' && <DependencyGraphView onOpenCopilot={handleOpenCopilot} />}

                {activeView === 'timeline' && <IncidentTimelineView onOpenCopilot={handleOpenCopilot} />}

                {activeView === 'assets-drift' && (
                  <AssetLifecycleDriftView
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                    onOpenCopilot={handleOpenCopilot}
                  />
                )}

                {activeView === 'health-sla' && <HealthSlaView onOpenCopilot={handleOpenCopilot} />}

                {activeView === 'reports' && <ReportsExportView onOpenCopilot={handleOpenCopilot} />}

                {/* Telemetry Intelligence Engine Views */}
                {activeView === 'telemetry-live' && (
                  <TelemetryLiveView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-sources' && (
                  <TelemetrySourcesView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-quality' && (
                  <TelemetryQualityView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-explorer' && (
                  <TelemetryDataExplorerView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-replay' && (
                  <TelemetryIncidentReplayView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-closed-loop' && (
                  <TelemetryClosedLoopView onOpenCopilot={handleOpenCopilot} />
                )}

                {activeView === 'telemetry-platform' && (
                  <TelemetryPlatformObservabilityView onOpenCopilot={handleOpenCopilot} />
                )}

                {(activeView === 'settings' || activeView === 'security') && <SettingsAdminView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* AI Operations Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => {
          setIsCopilotOpen(false);
          setCopilotInitialPrompt('');
        }}
        initialPrompt={copilotInitialPrompt}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
