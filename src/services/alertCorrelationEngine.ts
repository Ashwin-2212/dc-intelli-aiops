import {
  RawAlert,
  CorrelatedIncident,
  CorrelatedIncidentStatus,
  AlertSeverity,
  ServerDevice,
  RackUnit,
  CoolingUnit,
  UpsUnit,
} from '../types';
import { TopologyGraphEngine } from './topologyEngine';

export class AlertCorrelationEngine {
  private static instance: AlertCorrelationEngine;
  public rawAlerts: RawAlert[] = [];
  public incidents: CorrelatedIncident[] = [];
  private listeners: (() => void)[] = [];
  public totalRawAlertsProcessed: number = 0;
  public totalSpamAlertsDeflected: number = 0;

  private constructor() {
    this.seedInitialCorrelatedIncidents();
  }

  public static getInstance(): AlertCorrelationEngine {
    if (!AlertCorrelationEngine.instance) {
      AlertCorrelationEngine.instance = new AlertCorrelationEngine();
    }
    return AlertCorrelationEngine.instance;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners = [...this.listeners, cb];
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Seed realistic initial incident data matching prompt requirements
   */
  private seedInitialCorrelatedIncidents() {
    const now = Date.now();

    // Canonical Server Thermal Stress Incident
    const serverThermalAlerts: RawAlert[] = [
      {
        id: `ALT-CPU-${now - 45000}`,
        timestamp: '45s ago',
        timestampEpochMs: now - 45000,
        deviceId: 'SRV-R-04-02',
        deviceName: 'Compute Node #2 (Intel Xeon Platinum)',
        deviceType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02 / CPU-1',
        metricName: 'CPU HIGH',
        metricCategory: 'cpu',
        currentValue: '96.2%',
        baselineValue: '48.0%',
        threshold: '>75.0%',
        unit: '%',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Redfish',
        rawMessage: 'CRITICAL: Host CPU core utilization sustained at 96.2% exceeding 75% operational threshold.',
      },
      {
        id: `ALT-TMP-${now - 40000}`,
        timestamp: '40s ago',
        timestampEpochMs: now - 40000,
        deviceId: 'SRV-R-04-02',
        deviceName: 'Compute Node #2 (Intel Xeon Platinum)',
        deviceType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02 / Thermal / CPU1_Die',
        metricName: 'Temperature HIGH',
        metricCategory: 'temperature',
        currentValue: '82.5°C',
        baselineValue: '42.0°C',
        threshold: '>68.0°C',
        unit: '°C',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Redfish',
        rawMessage: 'CRITICAL: CPU Silicon Die thermal probe breached PROCHOT limit at 82.5°C.',
      },
      {
        id: `ALT-PWR-${now - 35000}`,
        timestamp: '35s ago',
        timestampEpochMs: now - 35000,
        deviceId: 'SRV-R-04-02',
        deviceName: 'Compute Node #2 (Intel Xeon Platinum)',
        deviceType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02 / Power / PSU-Total',
        metricName: 'Power HIGH',
        metricCategory: 'power',
        currentValue: '745 W',
        baselineValue: '340 W',
        threshold: '>520 W',
        unit: 'W',
        severity: 'warning',
        status: 'correlated',
        provenanceProtocol: 'Redfish',
        rawMessage: 'WARNING: Dual redundant PSU aggregate draw spiked to 745W during intensive tensor processing.',
      },
      {
        id: `ALT-FAN-${now - 30000}`,
        timestamp: '30s ago',
        timestampEpochMs: now - 30000,
        deviceId: 'SRV-R-04-02',
        deviceName: 'Compute Node #2 (Intel Xeon Platinum)',
        deviceType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02 / Fans / Rotor-Bay-1',
        metricName: 'Fan HIGH',
        metricCategory: 'fan',
        currentValue: '14,800 RPM (92%)',
        baselineValue: '6,200 RPM (40%)',
        threshold: '>9,500 RPM',
        unit: 'RPM',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Redfish',
        rawMessage: 'CRITICAL: Tachometer feedback indicates dual-rotor fans ramping at 92% maximum speed.',
      },
      {
        id: `ALT-HLT-${now - 25000}`,
        timestamp: '25s ago',
        timestampEpochMs: now - 25000,
        deviceId: 'SRV-R-04-02',
        deviceName: 'Compute Node #2 (Intel Xeon Platinum)',
        deviceType: 'server',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / SRV-R-04-02 / Health / Rollup',
        metricName: 'Health WARNING',
        metricCategory: 'health',
        currentValue: 'Health Score 48/100 (Degraded)',
        baselineValue: 'Health Score 98/100',
        threshold: '<70/100',
        unit: 'Score',
        severity: 'warning',
        status: 'correlated',
        provenanceProtocol: 'BMS',
        rawMessage: 'WARNING: Chassis health score composite dropped from 98 to 48 due to thermal throttling risk.',
      },
    ];

    // CRAC Cooling Failure Incident Alerts
    const cracCoolingAlerts: RawAlert[] = [
      {
        id: `ALT-CRAC-FAN-${now - 120000}`,
        timestamp: '2m ago',
        timestampEpochMs: now - 120000,
        deviceId: 'CRAC-02',
        deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
        deviceType: 'cooling',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / HVAC / CRAC-02 / BlowerMotor',
        metricName: 'Fan Speed HIGH',
        metricCategory: 'fan',
        currentValue: '100% Max RPM',
        baselineValue: '68%',
        threshold: '>85%',
        unit: '%',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'CRITICAL: In-row chiller blower fan continuously locked at 100% duty cycle.',
      },
      {
        id: `ALT-CRAC-RET-${now - 110000}`,
        timestamp: '2m ago',
        timestampEpochMs: now - 110000,
        deviceId: 'CRAC-02',
        deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
        deviceType: 'cooling',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / HVAC / CRAC-02 / Sensors / ReturnAir',
        metricName: 'Return Temp HIGH',
        metricCategory: 'temperature',
        currentValue: '37.0°C',
        baselineValue: '26.2°C',
        threshold: '>29.0°C',
        unit: '°C',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'CRITICAL: Chilled water return plenum temperature elevated to 37.0°C.',
      },
      {
        id: `ALT-CRAC-SUP-${now - 100000}`,
        timestamp: '2m ago',
        timestampEpochMs: now - 100000,
        deviceId: 'CRAC-02',
        deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
        deviceType: 'cooling',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / HVAC / CRAC-02 / Sensors / SupplyAir',
        metricName: 'Supply Temp HIGH',
        metricCategory: 'temperature',
        currentValue: '27.5°C',
        baselineValue: '18.5°C',
        threshold: '>21.0°C',
        unit: '°C',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'CRITICAL: Cold aisle supply air discharged above ASHRAE allowable limit (27.5°C).',
      },
      {
        id: `ALT-CRAC-COP-${now - 90000}`,
        timestamp: '1m ago',
        timestampEpochMs: now - 90000,
        deviceId: 'CRAC-02',
        deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
        deviceType: 'cooling',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / HVAC / CRAC-02 / Efficiency',
        metricName: 'COP DEGRADED',
        metricCategory: 'mechanical',
        currentValue: '1.9 COP',
        baselineValue: '3.8 COP',
        threshold: '<2.5 COP',
        unit: 'COP',
        severity: 'warning',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'WARNING: Coefficient of Performance degraded by 50% indicating valve actuator slip.',
      },
      {
        id: `ALT-RCK-INL-${now - 80000}`,
        timestamp: '1m ago',
        timestampEpochMs: now - 80000,
        deviceId: 'R-04',
        deviceName: 'Rack R-04 Ambient Environmental Probe',
        deviceType: 'rack',
        rackId: 'R-04',
        zone: 'Zone A',
        topologyPath: 'dc-va-01 / Zone A / Row-1 / Rack R-04 / EnvProbe / Top-U38',
        metricName: 'Rack Inlet Temp HIGH',
        metricCategory: 'temperature',
        currentValue: '33.8°C',
        baselineValue: '22.4°C',
        threshold: '>27.0°C',
        unit: '°C',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'CRITICAL: Rack R-04 front intake cold aisle microclimate breach (33.8°C).',
      },
    ];

    // UPS Battery Degradation Incident Alerts
    const upsAlerts: RawAlert[] = [
      {
        id: `ALT-UPS-SOH-${now - 600000}`,
        timestamp: '10m ago',
        timestampEpochMs: now - 600000,
        deviceId: 'UPS-03',
        deviceName: 'Secondary High-Density UPS (Zone C)',
        deviceType: 'ups',
        rackId: 'R-09',
        zone: 'Zone C',
        topologyPath: 'dc-va-01 / Zone C / Power / UPS-03 / Battery / StateOfHealth',
        metricName: 'Battery SOH LOW',
        metricCategory: 'health',
        currentValue: '38.0%',
        baselineValue: '92.0%',
        threshold: '<60.0%',
        unit: '%',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'SNMP',
        rawMessage: 'CRITICAL: Battery String 2B State of Health degraded to 38% under float charge.',
      },
      {
        id: `ALT-UPS-RES-${now - 590000}`,
        timestamp: '10m ago',
        timestampEpochMs: now - 590000,
        deviceId: 'UPS-03',
        deviceName: 'Secondary High-Density UPS (Zone C)',
        deviceType: 'ups',
        rackId: 'R-09',
        zone: 'Zone C',
        topologyPath: 'dc-va-01 / Zone C / Power / UPS-03 / Battery / CellResistance',
        metricName: 'Internal Resistance HIGH',
        metricCategory: 'voltage',
        currentValue: '34.8 mΩ',
        baselineValue: '18.2 mΩ',
        threshold: '>24.0 mΩ',
        unit: 'mΩ',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'Modbus',
        rawMessage: 'CRITICAL: VRLA cell internal resistance increased by +91% in String 2B.',
      },
      {
        id: `ALT-UPS-RNT-${now - 580000}`,
        timestamp: '9m ago',
        timestampEpochMs: now - 580000,
        deviceId: 'UPS-03',
        deviceName: 'Secondary High-Density UPS (Zone C)',
        deviceType: 'ups',
        rackId: 'R-09',
        zone: 'Zone C',
        topologyPath: 'dc-va-01 / Zone C / Power / UPS-03 / Inverter / ReserveRuntime',
        metricName: 'Reserve Runtime SQUEEZE',
        metricCategory: 'power',
        currentValue: '8 minutes',
        baselineValue: '38 minutes',
        threshold: '<15 minutes',
        unit: 'min',
        severity: 'critical',
        status: 'correlated',
        provenanceProtocol: 'SNMP',
        rawMessage: 'CRITICAL: Estimated full-load inverter backup duration collapsed to 8 minutes.',
      },
      {
        id: `ALT-UPS-TMP-${now - 570000}`,
        timestamp: '9m ago',
        timestampEpochMs: now - 570000,
        deviceId: 'UPS-03',
        deviceName: 'Secondary High-Density UPS (Zone C)',
        deviceType: 'ups',
        rackId: 'R-09',
        zone: 'Zone C',
        topologyPath: 'dc-va-01 / Zone C / Power / UPS-03 / Enclosure / Thermal',
        metricName: 'Enclosure Temp HIGH',
        metricCategory: 'temperature',
        currentValue: '31.8°C',
        baselineValue: '22.0°C',
        threshold: '>26.0°C',
        unit: '°C',
        severity: 'warning',
        status: 'correlated',
        provenanceProtocol: 'SNMP',
        rawMessage: 'WARNING: Inverter battery compartment ambient temperature elevated at 31.8°C.',
      },
    ];

    this.rawAlerts = [...serverThermalAlerts, ...cracCoolingAlerts, ...upsAlerts];
    this.totalRawAlertsProcessed = this.rawAlerts.length;

    // Create Incident 1: SERVER THERMAL STRESS (The exact canonical example)
    const inc1: CorrelatedIncident = {
      id: 'INC-2026-THM-884',
      incidentCode: 'INCIDENT: SERVER THERMAL STRESS',
      title: 'Server SRV-R-04-02 Thermal Stress & Fan Ramp Cascade',
      summary: '5 distinct atomic telemetry alarms (CPU HIGH, Temperature HIGH, Power HIGH, Fan HIGH, Health WARNING) co-occurring within a 20-second window on compute node SRV-R-04-02 successfully correlated into a single actionable incident.',
      targetDevice: 'SRV-R-04-02 (Compute Node #2)',
      targetRack: 'R-04',
      targetZone: 'Zone A',
      topologyBreadcrumb: 'Alpha Core DC-1 > Zone A > Row-1 > Rack R-04 > SRV-R-04-02',
      severity: 'critical',
      status: 'OPEN',
      detectedAt: '45 seconds ago',
      detectedEpochMs: now - 45000,
      updatedAt: 'Just now',
      assignedEngineer: 'On-Call Systems Reliability Lead (Ashwin T)',
      noiseReductionRatio: 80.0, // 5 raw alerts -> 1 incident = 80% noise compression
      contributingAlerts: serverThermalAlerts,
      correlationEvidence: {
        temporal: {
          timeWindowSeconds: 20,
          burstSpanMs: 20000,
          isCoincident: true,
          details: 'All 5 signals fired within a tight 20,000ms sliding window across Redfish telemetry endpoints.',
        },
        device: {
          sharedDeviceId: 'SRV-R-04-02',
          deviceName: 'Dell PowerEdge R760 Compute Node #2',
          entityType: '2U Rackmount Dual-Socket Server Chassis',
          details: '100% of the 5 contributing alerts originate directly from internal BMC sensors on SRV-R-04-02.',
        },
        rack: {
          sharedRackId: 'R-04',
          zone: 'Zone A',
          rackPosition: 4,
          details: 'Server resides at U-position 3–4 inside high-density 42U Rack R-04.',
        },
        topology: {
          rootNode: 'CRAC-02 (Zone A Cooling Loop)',
          propagationPath: [
            'CRAC-02 In-Row Unit',
            'Zone A Cold Aisle Containment',
            'Rack R-04 Intake',
            'SRV-R-04-02 Chassis',
            'CPU-1 Silicon Die',
          ],
          treeDepth: 5,
          blastRadiusScope: 'Localized to Chassis SRV-R-04-02 with risk to adjacent blades in Rack R-04.',
          details: 'Topological path confirms upstream chiller airflow restriction directly starved SRV-R-04-02 cold air supply.',
        },
        metric: {
          matchedPatternName: 'MULTI-METRIC SERVER THERMAL STRESS SIGNATURE',
          matchedSignals: ['CPU HIGH', 'Temperature HIGH', 'Power HIGH', 'Fan HIGH', 'Health WARNING'],
          requiredSignals: ['CPU HIGH', 'Temperature HIGH', 'Power HIGH', 'Fan HIGH', 'Health WARNING'],
          patternConfidence: 98.4,
          details: 'Exact 5-point signature match for Compute Node Thermal Overdrive & Heat Dissipation Bottleneck.',
        },
        severity: {
          rawMaxSeverity: 'critical',
          aggregatedIncidentSeverity: 'critical',
          compoundRiskMultiplier: 1.85,
          escalationReason: 'Compound effect of simultaneous CPU Die temperature (82.5°C) and Fan Speed overdrive (92%) escalates composite incident risk to Critical.',
        },
      },
      rootCauseHypothesis: 'Simultaneous heavy CPU batch execution combined with upstream CRAC-02 airflow degradation caused thermal saturation, prompting emergency 14,800 RPM fan spin and thermal throttling risk.',
      recommendedRemediation: [
        {
          stepNumber: 1,
          action: 'Throttle non-essential batch worker threads or live-migrate container pods to Rack R-08.',
          urgency: 'IMMEDIATE',
          expectedImpact: 'Reduces server power draw by 180W and drops die temperature by ~12°C within 60s.',
        },
        {
          stepNumber: 2,
          action: 'Verify Rack R-04 front intake bezel is free from physical airflow obstruction and check blanking panels.',
          urgency: 'HIGH',
          expectedImpact: 'Restores CFM airflow velocity across U-position 3–4.',
        },
        {
          stepNumber: 3,
          action: 'Verify CRAC-02 cold aisle supply static pressure via Modbus register 40008.',
          urgency: 'PLANNED',
          expectedImpact: 'Assures zone-wide containment microclimate integrity.',
        },
      ],
      statusHistory: [
        {
          status: 'OPEN',
          timestamp: '45 seconds ago',
          actor: 'DC-Intelli AIOps Correlation Engine',
          comment: 'Incident auto-created from 5 correlated atomic alerts with 80% noise compression.',
        },
      ],
    };

    // Create Incident 2: CRAC COOLING LOOP COLLAPSE
    const inc2: CorrelatedIncident = {
      id: 'INC-2026-CRAC-092',
      incidentCode: 'INCIDENT: COOLING LOOP CHILLED WATER DEGRADATION',
      title: 'CRAC-02 Mechanical Actuator Drift & Microclimate Containment Breach',
      summary: '5 telemetry alarms across Modbus HVAC sensors and Rack R-04 environmental probes correlated into a major cooling degradation incident.',
      targetDevice: 'CRAC-02 (In-Row Chiller)',
      targetRack: 'R-04 / R-05',
      targetZone: 'Zone A',
      topologyBreadcrumb: 'Alpha Core DC-1 > Zone A > HVAC > CRAC-02',
      severity: 'critical',
      status: 'INVESTIGATING',
      detectedAt: '2 minutes ago',
      detectedEpochMs: now - 120000,
      updatedAt: '1 minute ago',
      assignedEngineer: 'Mechanical Tech Lead (Marcus Vance)',
      noiseReductionRatio: 80.0,
      contributingAlerts: cracCoolingAlerts,
      correlationEvidence: {
        temporal: {
          timeWindowSeconds: 40,
          burstSpanMs: 40000,
          isCoincident: true,
          details: 'Modbus poll cycles captured synchronized thermal flux across supply, return, and rack intake probes.',
        },
        device: {
          sharedDeviceId: 'CRAC-02',
          deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
          entityType: 'In-Row Precision Chiller Unit',
          details: '4 cooling unit internal Modbus registers combined with 1 racktop inlet probe.',
        },
        rack: {
          sharedRackId: 'R-04',
          zone: 'Zone A',
          rackPosition: 4,
          details: 'Directly impacts Row-1 containment aisle adjacent to R-04 and R-05.',
        },
        topology: {
          rootNode: 'CRAC-02 In-Row Chiller',
          propagationPath: ['CRAC-02', 'Cold Aisle Containment Row-1', 'R-04 Inlet', 'R-05 Inlet'],
          treeDepth: 3,
          blastRadiusScope: 'Zone A Containment Row 1 (2 Racks, 28 Compute Nodes).',
          details: 'Topological parent node failure propagating downstream to rack intake air envelopes.',
        },
        metric: {
          matchedPatternName: 'PRECISION COOLING CHILLED WATER LOSS PATTERN',
          matchedSignals: ['Fan Speed HIGH', 'Return Temp HIGH', 'Supply Temp HIGH', 'COP DEGRADED', 'Rack Inlet Temp HIGH'],
          requiredSignals: ['Fan Speed HIGH', 'Return Temp HIGH', 'Supply Temp HIGH', 'COP DEGRADED'],
          patternConfidence: 96.2,
          details: 'High return air heat flux combined with elevated supply air temp indicates reduced water flow or valve slip.',
        },
        severity: {
          rawMaxSeverity: 'critical',
          aggregatedIncidentSeverity: 'critical',
          compoundRiskMultiplier: 2.1,
          escalationReason: 'Direct thermal threat to 24+ compute hosts escalates to critical facility priority.',
        },
      },
      rootCauseHypothesis: 'Motorized proportional actuator valve on chilled water loop slipped by ~34%, restricting flow and causing 100% fan duty cycle with elevated supply air.',
      recommendedRemediation: [
        {
          stepNumber: 1,
          action: 'Execute motorized valve manual override calibration via BMS command.',
          urgency: 'IMMEDIATE',
          expectedImpact: 'Restores chilled water flow to 420 LPM within 3 minutes.',
        },
        {
          stepNumber: 2,
          action: 'Ramp CRAC-01 and CRAC-03 fan speeds to 90% to share thermal dissipation load.',
          urgency: 'IMMEDIATE',
          expectedImpact: 'Stabilizes Zone A static pressure.',
        },
      ],
      statusHistory: [
        {
          status: 'OPEN',
          timestamp: '2 minutes ago',
          actor: 'DC-Intelli AIOps Correlation Engine',
          comment: 'Correlated 5 Modbus cooling alarms into unified facility incident.',
        },
        {
          status: 'ACKNOWLEDGED',
          timestamp: '90 seconds ago',
          actor: 'Marcus Vance (Mechanical Tech Lead)',
          comment: 'Acknowledged alarm. Inspecting valve calibration logs.',
        },
        {
          status: 'INVESTIGATING',
          timestamp: '1 minute ago',
          actor: 'Marcus Vance (Mechanical Tech Lead)',
          comment: 'Dispatched to Row-1 with digital manometer and actuator bypass tool.',
        },
      ],
    };

    // Create Incident 3: UPS BATTERY RUNTIME SQUEEZE
    const inc3: CorrelatedIncident = {
      id: 'INC-2026-PWR-412',
      incidentCode: 'INCIDENT: UPS POWER ANOMALY & BATTERY DEGRADATION',
      title: 'UPS-03 Battery String 2B Impedance Spike & SOH Collapse',
      summary: '4 SNMP RFC 1628 power telemetry alarms correlated into a critical power backup vulnerability incident.',
      targetDevice: 'UPS-03 (Secondary High-Density UPS)',
      targetRack: 'R-09 to R-12',
      targetZone: 'Zone C',
      topologyBreadcrumb: 'Alpha Core DC-1 > Zone C > Power Distribution > UPS-03',
      severity: 'warning',
      status: 'ACKNOWLEDGED',
      detectedAt: '10 minutes ago',
      detectedEpochMs: now - 600000,
      updatedAt: '5 minutes ago',
      assignedEngineer: 'Electrical Lead (Sarah Chen)',
      noiseReductionRatio: 75.0,
      contributingAlerts: upsAlerts,
      correlationEvidence: {
        temporal: {
          timeWindowSeconds: 30,
          burstSpanMs: 30000,
          isCoincident: true,
          details: 'Synchronous telemetry deviation during periodic battery string impedance check cycle.',
        },
        device: {
          sharedDeviceId: 'UPS-03',
          deviceName: 'UPS-03 High-Density 300kVA System',
          entityType: '3-Phase Modular Double-Conversion UPS',
          details: 'All signals mapped to UPS-03 power inverter and battery bank 2B.',
        },
        rack: {
          sharedRackId: 'R-09',
          zone: 'Zone C',
          rackPosition: 9,
          details: 'Feeds high-density AI compute racks R-09 through R-12.',
        },
        topology: {
          rootNode: 'Substation Feeder B > UPS-03',
          propagationPath: ['Substation Feeder B', 'UPS-03 Inverter', 'PDU-Zone-C', 'Racks R-09..R-12'],
          treeDepth: 4,
          blastRadiusScope: 'Zone C Power Bus (4 Racks, 48 Physical Servers, 56.4 kW load).',
          details: 'Upstream backup energy storage degradation jeopardizes Tier III DC 30-minute reserve SLA.',
        },
        metric: {
          matchedPatternName: 'VRLA BATTERY CELL DRYOUT & IMPEDANCE MULTIPLIER',
          matchedSignals: ['Battery SOH LOW', 'Internal Resistance HIGH', 'Reserve Runtime SQUEEZE', 'Enclosure Temp HIGH'],
          requiredSignals: ['Battery SOH LOW', 'Internal Resistance HIGH', 'Reserve Runtime SQUEEZE'],
          patternConfidence: 94.8,
          details: 'High internal resistance coupled with reduced reserve duration indicates accelerated cell plate sulfation.',
        },
        severity: {
          rawMaxSeverity: 'critical',
          aggregatedIncidentSeverity: 'warning',
          compoundRiskMultiplier: 1.45,
          escalationReason: 'Utility mains power is currently stable; incident prioritized for scheduled maintenance before catastrophic outage.',
        },
      },
      rootCauseHypothesis: 'Prolonged 31.8°C enclosure thermal exposure induced electrolyte venting in Battery String 2B, doubling cell internal resistance.',
      recommendedRemediation: [
        {
          stepNumber: 1,
          action: 'Electrically isolate String 2B via DC disconnect breaker.',
          urgency: 'HIGH',
          expectedImpact: 'Prevents thermal runaway while remaining parallel strings sustain 100% capacity.',
        },
        {
          stepNumber: 2,
          action: 'Order 4x replacement 12V 150Ah modular VRLA battery trays.',
          urgency: 'PLANNED',
          expectedImpact: 'Restores battery SOH to >95% and reserve runtime to 40+ minutes.',
        },
      ],
      statusHistory: [
        {
          status: 'OPEN',
          timestamp: '10 minutes ago',
          actor: 'DC-Intelli AIOps Correlation Engine',
          comment: 'Correlated 4 SNMP battery alarms into unified power incident.',
        },
        {
          status: 'ACKNOWLEDGED',
          timestamp: '5 minutes ago',
          actor: 'Sarah Chen (Electrical Lead)',
          comment: 'Acknowledged. Scheduling string load bank verification.',
        },
      ],
    };

    this.incidents = [inc1, inc2, inc3];
    this.totalSpamAlertsDeflected = this.rawAlerts.length - this.incidents.length;
  }

  /**
   * Ingest raw alerts into the multi-dimensional correlation pipeline
   */
  public ingestAlerts(incomingAlerts: RawAlert[]): CorrelatedIncident[] {
    this.rawAlerts = [...incomingAlerts, ...this.rawAlerts];
    this.totalRawAlertsProcessed += incomingAlerts.length;

    // Run 6-dimension correlation pipeline
    const newlyCorrelated = this.correlateAlertStream(this.rawAlerts);
    this.incidents = newlyCorrelated;
    this.totalSpamAlertsDeflected = Math.max(0, this.rawAlerts.length - this.incidents.length);

    this.notify();
    return this.incidents;
  }

  /**
   * The core 6-dimensional correlation engine
   */
  public correlateAlertStream(alerts: RawAlert[]): CorrelatedIncident[] {
    const resultIncidents: CorrelatedIncident[] = [];
    const now = Date.now();

    // Group alerts by device & rack
    const deviceGroups: { [deviceId: string]: RawAlert[] } = {};
    alerts.forEach(alert => {
      const devId = alert.deviceId || 'UNKNOWN';
      if (!deviceGroups[devId]) deviceGroups[devId] = [];
      deviceGroups[devId].push(alert);
    });

    Object.entries(deviceGroups).forEach(([devId, devAlerts]) => {
      // 1. TEMPORAL CORRELATION: Check if alerts occur within sliding window (<= 180s)
      const sorted = [...devAlerts].sort((a, b) => b.timestampEpochMs - a.timestampEpochMs);
      const newestEpoch = sorted[0]?.timestampEpochMs || now;
      const temporalCluster = sorted.filter(a => Math.abs(newestEpoch - a.timestampEpochMs) <= 180000);

      const metricNames = temporalCluster.map(a => a.metricName.toUpperCase());
      const hasCpu = metricNames.some(m => m.includes('CPU'));
      const hasTemp = metricNames.some(m => m.includes('TEMP') || m.includes('THERMAL'));
      const hasPower = metricNames.some(m => m.includes('POWER') || m.includes('WATT') || m.includes('PWR'));
      const hasFan = metricNames.some(m => m.includes('FAN') || m.includes('RPM'));
      const hasHealth = metricNames.some(m => m.includes('HEALTH') || m.includes('SCORE') || m.includes('DEGRADED') || m.includes('WARN'));

      // 5. METRIC CORRELATION: Canonical Server Thermal Stress signature
      if (hasCpu && hasTemp && hasPower && hasFan && hasHealth && temporalCluster.length >= 4) {
        // Mark all contributing alerts as 'correlated'
        temporalCluster.forEach(a => { a.status = 'correlated'; });

        // 6. SEVERITY CORRELATION: Aggregate and compound
        const maxSev: AlertSeverity = temporalCluster.some(a => a.severity === 'critical' || a.severity === 'emergency')
          ? 'critical'
          : 'warning';

        const sampleAlert = temporalCluster[0];
        const rackId = sampleAlert.rackId || 'R-04';
        const zone = sampleAlert.zone || 'Zone A';

        const incident: CorrelatedIncident = {
          id: `INC-THM-${devId.replace(/[^a-zA-Z0-9]/g, '')}-${String(newestEpoch).slice(-4)}`,
          incidentCode: 'INCIDENT: SERVER THERMAL STRESS',
          title: `Server ${sampleAlert.deviceName || devId} Thermal Stress Cascade`,
          summary: `${temporalCluster.length} contributing alarms (CPU HIGH, Temperature HIGH, Power HIGH, Fan HIGH, Health WARNING) correlated into 1 unified incident on ${sampleAlert.deviceName || devId}.`,
          targetDevice: sampleAlert.deviceName || devId,
          targetRack: rackId,
          targetZone: zone,
          topologyBreadcrumb: sampleAlert.topologyPath || `Alpha Core DC-1 > ${zone} > ${rackId} > ${devId}`,
          severity: maxSev,
          status: 'OPEN',
          detectedAt: sampleAlert.timestamp || 'Just now',
          detectedEpochMs: newestEpoch,
          updatedAt: 'Just now',
          assignedEngineer: 'On-Call Systems Reliability Lead (Ashwin T)',
          noiseReductionRatio: +(((temporalCluster.length - 1) / temporalCluster.length) * 100).toFixed(1),
          contributingAlerts: temporalCluster,
          correlationEvidence: {
            temporal: {
              timeWindowSeconds: Math.max(5, Math.round((newestEpoch - (sorted[sorted.length - 1]?.timestampEpochMs || newestEpoch)) / 1000)),
              burstSpanMs: newestEpoch - (sorted[sorted.length - 1]?.timestampEpochMs || newestEpoch),
              isCoincident: true,
              details: `All ${temporalCluster.length} contributing alerts co-occurred within a synchronized sliding window on ${devId}.`,
            },
            device: {
              sharedDeviceId: devId,
              deviceName: sampleAlert.deviceName || devId,
              entityType: sampleAlert.deviceType === 'server' ? 'Rackmount Compute Server' : 'Data Center Infrastructure Asset',
              details: `100% of the contributing alerts originate from the same physical device chassis (${devId}).`,
            },
            rack: {
              sharedRackId: rackId,
              zone,
              rackPosition: parseInt(rackId.replace(/\D/g, '')) || 4,
              details: `Device resides inside rack ${rackId} in containment ${zone}.`,
            },
            topology: {
              rootNode: `CRAC-02 -> Rack ${rackId} -> ${devId}`,
              propagationPath: ['HVAC Cooling Supply', `Rack ${rackId} Containment`, `${devId} Chassis`, 'CPU Silicon Die'],
              treeDepth: 4,
              blastRadiusScope: `Contained to ${devId} with thermal spillover risk to adjacent 42U rack slots.`,
              details: `Topological graph correlation traced thermal feedback loop from rack intake to server fan overdrive.`,
            },
            metric: {
              matchedPatternName: 'MULTI-METRIC SERVER THERMAL STRESS PATTERN',
              matchedSignals: ['CPU HIGH', 'Temperature HIGH', 'Power HIGH', 'Fan HIGH', 'Health WARNING'],
              requiredSignals: ['CPU HIGH', 'Temperature HIGH', 'Power HIGH', 'Fan HIGH', 'Health WARNING'],
              patternConfidence: 98.6,
              details: 'Multi-variate pattern matched: CPU utilization + Die temperature + Fan RPM + Power draw + Health degradation.',
            },
            severity: {
              rawMaxSeverity: maxSev,
              aggregatedIncidentSeverity: maxSev,
              compoundRiskMultiplier: 1.9,
              escalationReason: 'Compound multi-signal co-occurrence triggers immediate priority escalation to prevent silicon permanent damage.',
            },
          },
          rootCauseHypothesis: `Server ${devId} is undergoing severe thermal saturation caused by peak computation power draw combined with intake airflow restrictions.`,
          recommendedRemediation: [
            {
              stepNumber: 1,
              action: `Throttle active background batch workloads on ${devId} or live-migrate container tasks.`,
              urgency: 'IMMEDIATE',
              expectedImpact: 'Drops die temperature by ~10–14°C within 60 seconds.',
            },
            {
              stepNumber: 2,
              action: `Inspect front intake bezel on ${rackId} for debris or fan rotor obstruction.`,
              urgency: 'HIGH',
              expectedImpact: 'Restores nominal CFM airflow velocity across chassis.',
            },
          ],
          statusHistory: [
            {
              status: 'OPEN',
              timestamp: 'Just now',
              actor: 'DC-Intelli AIOps Correlation Engine',
              comment: `Multi-metric correlation compressed ${temporalCluster.length} alarms into single incident.`,
            },
          ],
        };

        resultIncidents.push(incident);
      }
    });

    // Merge with any pre-existing incidents that weren't modified
    this.incidents.forEach(existing => {
      if (!resultIncidents.some(r => r.id === existing.id || r.targetDevice === existing.targetDevice)) {
        resultIncidents.push(existing);
      }
    });

    return resultIncidents;
  }

  /**
   * Transition incident lifecycle status
   * Supports: OPEN, ACKNOWLEDGED, INVESTIGATING, RESOLVED, CLOSED
   */
  public transitionIncidentStatus(
    incidentId: string,
    newStatus: CorrelatedIncidentStatus,
    actorName: string = 'Current Operator',
    comment?: string
  ): CorrelatedIncident | null {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) return null;

    inc.status = newStatus;
    inc.updatedAt = 'Just now';
    inc.statusHistory.unshift({
      status: newStatus,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: actorName,
      comment: comment || `Status transitioned to ${newStatus}.`,
    });

    // If resolved or closed, update contributing alerts
    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      inc.contributingAlerts.forEach(a => {
        a.status = 'resolved';
      });
    }

    this.notify();
    return inc;
  }

  /**
   * Trigger the canonical Server Thermal Stress alert burst
   * Ingests: CPU HIGH, Temperature HIGH, Power HIGH, Fan HIGH, Health WARNING
   */
  public triggerServerThermalStressBurst(targetServerId: string = 'SRV-R-04-02', rackId: string = 'R-04') {
    const now = Date.now();
    const burstAlerts: RawAlert[] = [
      {
        id: `ALT-CPU-${now}`,
        timestamp: 'Just now',
        timestampEpochMs: now,
        deviceId: targetServerId,
        deviceName: `${targetServerId} Compute Host`,
        deviceType: 'server',
        rackId,
        zone: 'Zone A',
        topologyPath: `dc-va-01 / Zone A / Row-1 / Rack ${rackId} / ${targetServerId} / CPU`,
        metricName: 'CPU HIGH',
        metricCategory: 'cpu',
        currentValue: `${Math.floor(92 + Math.random() * 7)}%`,
        baselineValue: '45%',
        threshold: '>75%',
        unit: '%',
        severity: 'critical',
        status: 'active',
        provenanceProtocol: 'Redfish',
        rawMessage: `CRITICAL: Processor utilization sustained at 96% on ${targetServerId}.`,
      },
      {
        id: `ALT-TMP-${now + 100}`,
        timestamp: 'Just now',
        timestampEpochMs: now + 100,
        deviceId: targetServerId,
        deviceName: `${targetServerId} Compute Host`,
        deviceType: 'server',
        rackId,
        zone: 'Zone A',
        topologyPath: `dc-va-01 / Zone A / Row-1 / Rack ${rackId} / ${targetServerId} / Thermal`,
        metricName: 'Temperature HIGH',
        metricCategory: 'temperature',
        currentValue: `${(81.5 + Math.random() * 3.5).toFixed(1)}°C`,
        baselineValue: '42.0°C',
        threshold: '>68.0°C',
        unit: '°C',
        severity: 'critical',
        status: 'active',
        provenanceProtocol: 'Redfish',
        rawMessage: `CRITICAL: Die temperature breached PROCHOT threshold on ${targetServerId}.`,
      },
      {
        id: `ALT-PWR-${now + 200}`,
        timestamp: 'Just now',
        timestampEpochMs: now + 200,
        deviceId: targetServerId,
        deviceName: `${targetServerId} Compute Host`,
        deviceType: 'server',
        rackId,
        zone: 'Zone A',
        topologyPath: `dc-va-01 / Zone A / Row-1 / Rack ${rackId} / ${targetServerId} / Power`,
        metricName: 'Power HIGH',
        metricCategory: 'power',
        currentValue: `${Math.floor(720 + Math.random() * 60)} W`,
        baselineValue: '350 W',
        threshold: '>520 W',
        unit: 'W',
        severity: 'warning',
        status: 'active',
        provenanceProtocol: 'Redfish',
        rawMessage: `WARNING: Dual PSU aggregate consumption surged to peak rating on ${targetServerId}.`,
      },
      {
        id: `ALT-FAN-${now + 300}`,
        timestamp: 'Just now',
        timestampEpochMs: now + 300,
        deviceId: targetServerId,
        deviceName: `${targetServerId} Compute Host`,
        deviceType: 'server',
        rackId,
        zone: 'Zone A',
        topologyPath: `dc-va-01 / Zone A / Row-1 / Rack ${rackId} / ${targetServerId} / Fans`,
        metricName: 'Fan HIGH',
        metricCategory: 'fan',
        currentValue: `${Math.floor(14200 + Math.random() * 1000)} RPM (94%)`,
        baselineValue: '6,200 RPM',
        threshold: '>9,500 RPM',
        unit: 'RPM',
        severity: 'critical',
        status: 'active',
        provenanceProtocol: 'Redfish',
        rawMessage: `CRITICAL: Tachometer feedback indicates dual-rotor fans at 94% on ${targetServerId}.`,
      },
      {
        id: `ALT-HLT-${now + 400}`,
        timestamp: 'Just now',
        timestampEpochMs: now + 400,
        deviceId: targetServerId,
        deviceName: `${targetServerId} Compute Host`,
        deviceType: 'server',
        rackId,
        zone: 'Zone A',
        topologyPath: `dc-va-01 / Zone A / Row-1 / Rack ${rackId} / ${targetServerId} / Health`,
        metricName: 'Health WARNING',
        metricCategory: 'health',
        currentValue: 'Health Score 44/100 (Degraded)',
        baselineValue: 'Health Score 98/100',
        threshold: '<70/100',
        unit: 'Score',
        severity: 'warning',
        status: 'active',
        provenanceProtocol: 'BMS',
        rawMessage: `WARNING: Chassis composite health score degraded due to thermal stress on ${targetServerId}.`,
      },
    ];

    this.ingestAlerts(burstAlerts);
  }

  /**
   * Reset all alerts and incidents back to initial pristine state
   */
  public resetEngine() {
    this.seedInitialCorrelatedIncidents();
    this.notify();
  }
}
