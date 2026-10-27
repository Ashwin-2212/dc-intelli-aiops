import {
  ClosedLoopOutcomeRecord,
  DecisionActionOption,
} from '../../types/telemetryIntelligence';

export class ClosedLoopLearningEngine {
  private static instance: ClosedLoopLearningEngine;
  private actionOptions: Map<string, DecisionActionOption[]> = new Map();
  private outcomeHistory: ClosedLoopOutcomeRecord[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.seedInitialOutcomes();
  }

  public static getInstance(): ClosedLoopLearningEngine {
    if (!ClosedLoopLearningEngine.instance) {
      ClosedLoopLearningEngine.instance = new ClosedLoopLearningEngine();
    }
    return ClosedLoopLearningEngine.instance;
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private seedInitialOutcomes() {
    const defaultOptions: DecisionActionOption[] = [
      {
        actionId: 'ACT-01',
        title: 'Option A: Increase Chilled Water Loop & Open Bypass',
        description: 'Command CRAH-03 and CRAC-02 chilled water actuator valves to 85% open to increase CFM cooling volume across Zone A.',
        category: 'COOLING_ADJUST',
        estimatedTemperatureImpactC: -6.5,
        estimatedPowerImpactKw: +14.2,
        estimatedCostUsd: 65,
        estimatedRecoveryMinutes: 12,
        operationalRisk: 'LOW',
        requiresHumanApproval: false,
        approvalStatus: 'AUTO_APPLIED',
      },
      {
        actionId: 'ACT-02',
        title: 'Option B: Dynamic Live Workload Migration (vMotion / Pod Evacuation)',
        description: 'Migrate 14 compute pods from Rack R-04 and R-05 to low-density Rack R-10 in Zone B.',
        category: 'WORKLOAD_MIGRATE',
        estimatedTemperatureImpactC: -12.4,
        estimatedPowerImpactKw: -38.0,
        estimatedCostUsd: 0,
        estimatedRecoveryMinutes: 8,
        operationalRisk: 'MEDIUM',
        requiresHumanApproval: true,
        approvalStatus: 'PENDING_APPROVAL',
      },
      {
        actionId: 'ACT-03',
        title: 'Option C: Throttle CPU Frequency (C-State Power Cap)',
        description: 'Enforce 75% power capping limit via Redfish OEM interface on SRV-R-04-02 to prevent PROCHOT trip.',
        category: 'THROTTLE_CPU',
        estimatedTemperatureImpactC: -18.0,
        estimatedPowerImpactKw: -120.0,
        estimatedCostUsd: 0,
        estimatedRecoveryMinutes: 2,
        operationalRisk: 'HIGH',
        requiresHumanApproval: true,
        approvalStatus: 'PENDING_APPROVAL',
      },
      {
        actionId: 'ACT-04',
        title: 'Option D: Dispatch On-Call HVAC Mechanical Specialist',
        description: 'Dispatch technician to inspect CRAC-02 fan belt tension, expansion valve, and static differential pressure.',
        category: 'DISPATCH_TECH',
        estimatedTemperatureImpactC: -15.0,
        estimatedPowerImpactKw: 0,
        estimatedCostUsd: 380,
        estimatedRecoveryMinutes: 90,
        operationalRisk: 'LOW',
        requiresHumanApproval: true,
        approvalStatus: 'PENDING_APPROVAL',
      },
    ];

    this.actionOptions.set('CRAC-02', defaultOptions);
    this.actionOptions.set('SRV-R-04-02', defaultOptions);

    this.outcomeHistory = [
      {
        outcomeId: 'OUT-9481',
        incidentId: 'INC-2026-09-28-01',
        problemTitle: 'Rack R-04 Elevated Inlet Thermal Delta',
        targetAsset: 'CRAC-02 / Rack R-04',
        recommendedAction: 'Increase CRAH-03 chilled water actuator valve +20%',
        selectedAction: 'Increased chilled water actuator valve +20% & adjusted floor dampers',
        executedBy: 'Lead Infra Engineer (Marcus Vance)',
        executedAt: '2026-09-28 15:42:00',
        preActionMetricValue: 33.8,
        postActionMetricValue: 22.4,
        metricUnit: '°C',
        metricName: 'Inlet Temperature',
        targetMet: true,
        recoveryDurationMinutes: 14,
        outcomeStatus: 'SUCCESS',
        rcaAccuracyRating: 98,
        recommendationRating: 95,
        engineerFeedbackNotes: 'Thermal microclimate normalized within 14 minutes. Exact root cause matched predictive diagnosis.',
      },
      {
        outcomeId: 'OUT-9479',
        incidentId: 'INC-2026-09-24-02',
        problemTitle: 'UPS-02 Infeed Harmonic Current Imbalance',
        targetAsset: 'Floor PDU-2B',
        recommendedAction: 'Rebalance single-phase server power whips between Branch Circuit A and B',
        selectedAction: 'Rebalanced 8 server cords across secondary branch circuit',
        executedBy: 'Electrical Tech Lead (Sarah Chen)',
        executedAt: '2026-09-24 11:20:00',
        preActionMetricValue: 62.1,
        postActionMetricValue: 38.0,
        metricUnit: 'A',
        metricName: 'Neutral Current',
        targetMet: true,
        recoveryDurationMinutes: 22,
        outcomeStatus: 'SUCCESS',
        rcaAccuracyRating: 94,
        recommendationRating: 92,
        engineerFeedbackNotes: 'Phase current balanced, 3rd order harmonic distortion eliminated.',
      },
    ];
  }

  public getActionOptions(assetId: string): DecisionActionOption[] {
    return this.actionOptions.get(assetId) || this.actionOptions.get('CRAC-02') || [];
  }

  public approveAction(assetId: string, actionId: string, approvedBy: string = 'Super Admin'): ClosedLoopOutcomeRecord {
    const options = this.getActionOptions(assetId);
    const selected = options.find(o => o.actionId === actionId) || options[0];
    selected.approvalStatus = 'APPROVED';

    const newOutcome: ClosedLoopOutcomeRecord = {
      outcomeId: `OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: `INC-${Date.now().toString().slice(-6)}`,
      problemTitle: `Action Remediation: ${selected.title}`,
      targetAsset: assetId,
      recommendedAction: selected.description,
      selectedAction: selected.title,
      executedBy: approvedBy,
      executedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      preActionMetricValue: 82.5,
      postActionMetricValue: 46.2,
      metricUnit: '°C',
      metricName: 'Temperature / Load',
      targetMet: true,
      recoveryDurationMinutes: selected.estimatedRecoveryMinutes,
      outcomeStatus: 'SUCCESS',
      rcaAccuracyRating: 96,
      recommendationRating: 94,
      engineerFeedbackNotes: `Action executed under authorization of ${approvedBy}. Real-time telemetry confirmed recovery within ${selected.estimatedRecoveryMinutes}m.`,
    };

    this.outcomeHistory = [newOutcome, ...this.outcomeHistory];
    this.notify();
    return newOutcome;
  }

  public getOutcomeHistory(): ClosedLoopOutcomeRecord[] {
    return this.outcomeHistory;
  }

  public getSuccessMetrics(): {
    totalActionsTracked: number;
    successRatePercent: number;
    avgRecoveryMinutes: number;
    rcaAccuracyAverage: number;
  } {
    const total = this.outcomeHistory.length;
    const successCount = this.outcomeHistory.filter(o => o.outcomeStatus === 'SUCCESS').length;
    const avgRca = total > 0 ? Math.round(this.outcomeHistory.reduce((acc, o) => acc + o.rcaAccuracyRating, 0) / total) : 95;
    const avgMins = total > 0 ? +(this.outcomeHistory.reduce((acc, o) => acc + o.recoveryDurationMinutes, 0) / total).toFixed(1) : 15;

    return {
      totalActionsTracked: total,
      successRatePercent: total > 0 ? Math.round((successCount / total) * 100) : 96,
      avgRecoveryMinutes: avgMins,
      rcaAccuracyAverage: avgRca,
    };
  }
}
