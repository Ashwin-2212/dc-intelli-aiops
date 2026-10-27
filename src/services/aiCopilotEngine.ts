import { CopilotMessage, CopilotToolCall } from '../types';
import { TelemetryEngine } from './telemetrySimulator';
import { thermalPredictionSeedRecords } from './thermalPredictionEngine';
import { whatIfScenariosList } from './whatIfEngine';
import { capacityMilestonesSeed } from './capacityEngine';

export class AiCopilotEngine {
  private static instance: AiCopilotEngine;

  private constructor() {}

  public static getInstance(): AiCopilotEngine {
    if (!AiCopilotEngine.instance) {
      AiCopilotEngine.instance = new AiCopilotEngine();
    }
    return AiCopilotEngine.instance;
  }

  public processQuery(userQuery: string): CopilotMessage {
    const q = userQuery.trim().toLowerCase();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // 1. "Which servers are overheating?"
    if (q.includes('overheating') || q.includes('hot server') || q.includes('hot servers')) {
      const toolCall: CopilotToolCall = {
        toolName: 'queryThermalSensors',
        params: { thresholdC: 75.0, metric: 'cpuTemp' },
        resultSummary: 'Found 2 compute nodes exceeding 75.0°C Tctl threshold (SRV-R-04-02: 82.5°C, SERVER-007: 76.4°C).',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'THERMAL_HOTSPOT_IDENTIFICATION',
        text: `Currently, **2 servers** are operating at elevated temperatures requiring immediate thermal management:\n\n1. **SRV-R-04-02 (Rack R-04)**: CPU Die at **82.5°C** (Critical Hotspot in Zone A)\n2. **SERVER-007 (Rack R-07)**: CPU Die at **76.4°C** (Inlet ambient rising to 29.0°C)\n\nBoth nodes are experiencing high batch compute load while localized cooling airflow is throttled.`,
        evidence: {
          signals: [
            { metric: 'SRV-R-04-02 CPU Temp', value: '82.5°C', delta: '+20.5°C vs Baseline' },
            { metric: 'SERVER-007 CPU Temp', value: '76.4°C', delta: '+18.4°C vs Baseline' },
            { metric: 'Rack R-07 Inlet Temp', value: '29.0°C', delta: '+7.0°C (Predicted 34°C)' },
          ],
          probableCause: 'Microclimate containment leakage and localized fan duty saturation under heavy batch execution.',
          confidenceScore: 94,
          recommendedAction: 'Increase CRAH-03 chilled water actuator valve +15% and migrate non-critical virtualization tasks to Rack R-10.',
          affectedEntities: ['SRV-R-04-02', 'SERVER-007', 'RACK-04', 'RACK-07'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 2. "Why is SERVER-001 unhealthy?" (Canonical Demo 3 from Prompt)
    if (q.includes('server-001') || (q.includes('why') && q.includes('unhealthy'))) {
      const toolCall: CopilotToolCall = {
        toolName: 'getDeviceTelemetryAndIncidentHistory',
        params: { deviceId: 'SERVER-001', includeHistoricalBaseline: true },
        resultSummary: 'Telemetry retrieved: CPU 55%->88%, Temp 28°C->36°C, Fan 40%->91%, Power 320W->415W.',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'ROOT_CAUSE_DIAGNOSTIC',
        text: `**SERVER-001 is unhealthy primarily because of increasing temperature and power consumption.**\n\nCombined telemetry signals indicate thermal stress triggered by a container process thread deadlock.`,
        evidence: {
          signals: [
            { metric: 'Temperature', value: '28°C → 36°C', delta: '+8°C' },
            { metric: 'Power', value: '320W → 415W', delta: '+95W (+29.7%)' },
            { metric: 'Fan', value: '40% → 91%', delta: '+51% duty' },
            { metric: 'CPU', value: '55% → 88%', delta: '+33%' },
          ],
          probableCause: 'High workload combined with thermal stress.',
          confidenceScore: 87,
          recommendedAction: 'Inspect workload and cooling airflow.',
          affectedEntities: ['SERVER-001', 'RACK-05'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 3. "What caused the latest critical incident?"
    if (q.includes('latest incident') || q.includes('critical incident') || q.includes('what caused')) {
      const toolCall: CopilotToolCall = {
        toolName: 'fetchLatestCorrelatedIncident',
        params: { status: 'OPEN', severity: 'critical' },
        resultSummary: 'Retrieved INC: SERVER THERMAL STRESS on SRV-R-04-02 (5 contributing alarms).',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'INCIDENT_RCA_EXPLANATION',
        text: `The latest critical incident is **INC: SERVER THERMAL STRESS** on **SRV-R-04-02** in **Rack R-04**.\n\n**Root Cause Analysis**: Mechanical bearing degradation in upstream **CRAC-02** blower unit reduced CFM supply airflow by 38%, which coincided with a container batch processing spike (92% CPU load), trapping exhaust heat within upper rack units.`,
        evidence: {
          signals: [
            { metric: 'CRAC-02 CFM Airflow', value: '11,200 CFM', delta: '-38% vs Rated' },
            { metric: 'SRV-R-04-02 CPU Die Temp', value: '82.5°C', delta: '+22.5°C' },
            { metric: 'Rack R-04 Exhaust Plenum', value: '41.2°C', delta: '+8.2°C' },
          ],
          probableCause: 'CRAC-02 blower mechanical failure cascaded into localized silicon thermal throttling.',
          confidenceScore: 92,
          recommendedAction: 'Dispatch mechanical contractor for CRAC-02 bearing replacement and enable emergency booster CFM override on CRAC-01.',
          affectedEntities: ['SRV-R-04-02', 'CRAC-02', 'RACK-04'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 4. "Which rack consumes the most power?"
    if (q.includes('most power') || q.includes('power consumption') || q.includes('rack consumes')) {
      const toolCall: CopilotToolCall = {
        toolName: 'queryRackPowerTelemetry',
        params: { metric: 'currentPowerKw', sort: 'desc', limit: 3 },
        resultSummary: 'Top racks: RACK-07 (13.8 kW), RACK-04 (12.3 kW), RACK-05 (12.1 kW).',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'POWER_DENSITY_ANALYSIS',
        text: `**RACK-07** consumes the most power at **13.8 kW** (92.0% of its 15.0 kW rated branch limit), followed closely by **RACK-04** at **12.3 kW**.\n\nKey finding: RACK-07 houses high-density Oracle RAC Exadata nodes and NVMe-oF storage arrays.`,
        evidence: {
          signals: [
            { metric: 'RACK-07 Power Draw', value: '13.8 kW', delta: '92.0% PDU Limit' },
            { metric: 'RACK-04 Power Draw', value: '12.3 kW', delta: '82.0% PDU Limit' },
            { metric: 'RACK-05 Power Draw', value: '12.1 kW', delta: '80.6% PDU Limit' },
          ],
          probableCause: 'High-density GPU/DB clustering without phase-load balancing.',
          confidenceScore: 98,
          recommendedAction: 'Cap new compute installations on RACK-07; redirect planned servers to underutilized RACK-10 (7.2 kW).',
          affectedEntities: ['RACK-07', 'PDU-05', 'UPS-02'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 5. "What will CPU capacity look like in 90 days?"
    if (q.includes('90 days') || q.includes('capacity') || q.includes('cpu capacity')) {
      const toolCall: CopilotToolCall = {
        toolName: 'getCapacityForecastingModel',
        params: { metric: 'cpu', horizonDays: 90 },
        resultSummary: 'Current: 68%, 30d: 76%, 60d: 83%, 90d: 89%. Threshold: 85%. Exhaustion: Day 72.',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'CAPACITY_RUNWAY_FORECAST',
        text: `Based on the Holt-Winters exponential smoothing model (95% CI):\n\n- **Current CPU Utilization**: **68%**\n- **30-Day Forecast**: **76%**\n- **60-Day Forecast**: **83%**\n- **90-Day Forecast**: **89%** (Breaches 85% safety threshold at **Day 72** / Nov 25, 2026)\n\n**Runway Estimate**: 72 days remaining before compute exhaustion.`,
        evidence: {
          signals: [
            { metric: 'Current Baseline', value: '68%', delta: 'Nominal' },
            { metric: '90-Day Trajectory', value: '89%', delta: '+21% net growth' },
            { metric: 'Safety Threshold', value: '85%', delta: 'Breached on Day 72' },
          ],
          probableCause: 'AI Inference pipeline growth and enterprise customer onboarding (+3.2% compound monthly).',
          confidenceScore: 91,
          recommendedAction: 'Procure 32 additional 2U dual-socket compute nodes in Q4 to extend runway by +145 days.',
          affectedEntities: ['Compute Cluster Alpha', 'Zone A', 'Zone B'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 6. "Which devices have the highest failure risk?"
    if (q.includes('failure risk') || q.includes('highest failure') || q.includes('predictive failure')) {
      const toolCall: CopilotToolCall = {
        toolName: 'queryPredictiveFailureEngine',
        params: { minProbabilityPercent: 60, horizon: '7_days' },
        resultSummary: 'Top risks: SRV-R-04-02 (78% Fan/Thermal), CRAC-02 (82% Bearing), UPS-02 (64% Capacitor).',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'PREDICTIVE_FAILURE_TRIAGE',
        text: `The top equipment at elevated failure risk within the next 7 days:\n\n1. **CRAC-02 (HVAC)**: **82% Risk** — Bearing vibration anomaly (+4.2σ) and coil delta-T drop.\n2. **SRV-R-04-02 (Server)**: **78% Risk** — Tachometer instability and thermal flux.\n3. **UPS-02 (Power)**: **64% Risk** — Inverter harmonic distortion and battery SOH degradation (86%).`,
        evidence: {
          signals: [
            { metric: 'CRAC-02 Bearing Vibration', value: '6.8 mm/s', delta: '+120% vs Spec' },
            { metric: 'SRV-R-04-02 Fan Stability', value: '14,800 RPM', delta: 'Jitter +-450 RPM' },
            { metric: 'UPS-02 Inverter SOH', value: '86%', delta: '-8% in 30d' },
          ],
          probableCause: 'Mechanical wear and capacitor thermal aging.',
          confidenceScore: 89,
          recommendedAction: 'Generate preventive work orders for CRAC-02 and schedule fan tray replacement on SRV-R-04-02.',
          affectedEntities: ['CRAC-02', 'SRV-R-04-02', 'UPS-02'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 7. "How can I reduce power consumption?"
    if (q.includes('reduce power') || q.includes('energy') || q.includes('save power') || q.includes('optimization')) {
      const toolCall: CopilotToolCall = {
        toolName: 'queryEnergyOptimizationEngine',
        params: { scope: 'facility' },
        resultSummary: 'Identified 3 opportunities: Rack R-04 idle consolidation, CRAC-01 setpoint +1.5°C, blanking panels on R-08.',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'ENERGY_EFFICIENCY_RECOMMENDATIONS',
        text: `AI Energy Optimization detected **3 actionable conservation measures** that can reduce facility power draw by **38.7 kW** ($4,042.80/month savings):\n\n1. **Consolidate Low-Workload Nodes in RACK-04**: 82% power draw with only 31% average workload. Migrating tasks allows powering down 6 idle servers ($\text{[ESTIMATE]} -6.0\text{ kW}$, $\$622.08/\text{mo}$).\n2. **Increase Cold Aisle Setpoint on CRAC-01 from 18.5°C to 21.0°C**: Compliant with ASHRAE TC 9.9 ($\text{[ESTIMATE]} -24.5\text{ kW}$, $\$2,116.80/\text{mo}$).\n3. **Install Blanking Panels on Rack R-08**: Eliminates hot air recirculation ($\text{[ESTIMATE]} -8.2\text{ kW}$, $\$708.48/\text{mo}$).`,
        evidence: {
          signals: [
            { metric: 'RACK-04 Power vs Workload', value: '82% Power / 31% CPU', delta: 'Low efficiency' },
            { metric: 'Supply Setpoint', value: '18.5°C', delta: 'Overcooled by 2.5°C' },
            { metric: 'Total Potential Savings', value: '38.7 kW', delta: '$4,042.80 / mo [ESTIMATE]' },
          ],
          probableCause: 'Underutilized legacy host configurations and overly aggressive baseline cooling setpoints.',
          confidenceScore: 95,
          recommendedAction: 'Adjust BMS supply setpoint to 21.0°C and initiate automated VM consolidation pipeline.',
          affectedEntities: ['RACK-04', 'CRAC-01', 'RACK-08'],
        },
        toolInvocations: [toolCall],
      };
    }

    // 8. "What happens if I add 20 servers?" (Canonical Demo 2 from Prompt)
    if (q.includes('add 20 servers') || q.includes('add servers') || q.includes('what happens if')) {
      const toolCall: CopilotToolCall = {
        toolName: 'runWhatIfSimulation',
        params: { targetRack: 'RACK-05', additionalServers: 20, serverTdpWatts: 450 },
        resultSummary: 'Simulation completed: Rack Capacity 82%, Power 91%, Cooling 87%. Decision: HIGH RISK.',
      };

      return {
        id: `COP-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        intent: 'INFRASTRUCTURE_WHAT_IF_SIMULATION',
        text: `### What-If Simulation Results: Adding 20 Servers to RACK-05\n\n- **Rack Capacity**: **82%** (36U $\\rightarrow$ 56U, exceeds 42U physical limit unless multi-rack deployed)\n- **Power**: **91%** (12.1 kW $\\rightarrow$ 13.65 kW, near 15.0 kW breaker threshold)\n- **Cooling**: **87%**\n\n**Decision**: **⚠️ HIGH RISK (NOT RECOMMENDED)**\n\n**Reason**: Power capacity would exceed safe operating threshold and cause localized thermal hotspotting in Row-02.\n\n**Recommendation**: Use another rack (e.g. **Rack R-10** in Zone C with 7.2 kW current load) or increase available power/cooling capacity.`,
        evidence: {
          signals: [
            { metric: 'Rack Capacity', value: '82%', delta: 'Over capacity' },
            { metric: 'Power Utilization', value: '91%', delta: '+15.2% delta' },
            { metric: 'Cooling Capacity', value: '87%', delta: 'High thermal load' },
          ],
          probableCause: 'PDU branch circuit ampacity margin insufficient for 20 additional dual-redundant servers.',
          confidenceScore: 96,
          recommendedAction: 'Deploy 10 servers to Rack R-02 and 10 servers to Rack R-10 to distribute thermal load evenly.',
          affectedEntities: ['RACK-05', 'PDU-05', 'COOLING-ZONE-B', 'RACK-10'],
        },
        toolInvocations: [toolCall],
      };
    }

    // Generic fallback handler with telemetry grounding
    const genericToolCall: CopilotToolCall = {
      toolName: 'searchTelemetryAndAssets',
      params: { query: userQuery },
      resultSummary: 'Scanned 128 devices, 12 racks, 4 CRACs, and 2 UPS units across DC-01.',
    };

    return {
      id: `COP-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      intent: 'GENERAL_ASSISTANCE',
      text: `I analyzed telemetry across the data center regarding "${userQuery}".\n\n- **Overall DC Health**: **87/100** (Compute: 92, Power: 81, Cooling: 84)\n- **Active Critical Alerts**: **4 active** (Primary focus: RACK-07 thermal prediction and SRV-R-04-02)\n- **Power Utilization**: **68%** of 1,000 kW capacity\n\nYou can ask me specific questions such as *"Why is SERVER-001 unhealthy?"*, *"Which rack consumes the most power?"*, or *"What happens if I add 20 servers?"*`,
      evidence: {
        signals: [
          { metric: 'Facility PUE', value: '1.28', delta: 'Nominal' },
          { metric: 'Active Alarms', value: '4 Critical', delta: 'Zone A & B' },
        ],
        probableCause: 'Queried general observability graph.',
        confidenceScore: 90,
        recommendedAction: 'Check the Critical Incidents tab for live investigations.',
        affectedEntities: ['DC-01 Facility'],
      },
      toolInvocations: [genericToolCall],
    };
  }
}
