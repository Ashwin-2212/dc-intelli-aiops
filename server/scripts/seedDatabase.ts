import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  Site,
  Rack,
  Device,
  Alert,
  Incident,
  Prediction,
  WorkOrder,
  Dependency,
  Telemetry,
} from '../models';

export async function seedDatabase(): Promise<void> {
  console.log('[Seeder] Starting idempotent database seeding...');
  const connected = await connectDatabase();
  if (!connected) {
    console.error('[Seeder Error] Could not connect to MongoDB. Aborting seed.');
    return;
  }

  // 1. Seed Demo Users
  const demoUsers = [
    {
      name: 'Ashwin T',
      email: 'admin@dcintelli.local',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      title: 'Principal Infrastructure Architect & Global Admin',
      department: 'Enterprise Infrastructure Systems',
      avatar: '👑',
    },
    {
      name: 'Sarah Chen',
      email: 'manager@dcintelli.local',
      passwordHash: 'Manager@123',
      role: 'DATA_CENTER_MANAGER',
      title: 'Data Center Operations Director',
      department: 'Facilities & Capacity Management',
      avatar: '🏢',
    },
    {
      name: 'Marcus Vance',
      email: 'engineer@dcintelli.local',
      passwordHash: 'Engineer@123',
      role: 'ENGINEER',
      title: 'Lead Site Reliability & Electrical Engineer',
      department: 'Mission Critical Operations',
      avatar: '⚡',
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'analyst@dcintelli.local',
      passwordHash: 'Analyst@123',
      role: 'VIEWER',
      title: 'Senior AIOps & Predictive Analytics Specialist',
      department: 'AI Intelligence & Thermal Modeling',
      avatar: '🧠',
    },
    {
      name: 'Alex Ray',
      email: 'operator@dcintelli.local',
      passwordHash: 'Operator@123',
      role: 'OPERATOR',
      title: 'NOC Floor & Telemetry Operator',
      department: '24/7 Operations Control Center',
      avatar: '🖥️',
    },
  ];

  for (const u of demoUsers) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const newUser = new User(u);
      await newUser.save();
      console.log(`[Seeder] Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`[Seeder] User already exists: ${u.email}`);
    }
  }

  // 2. Seed Facilities / Sites
  const sites = [
    {
      siteId: 'dc-va-01',
      name: 'Alpha Core DC-1 (Virginia)',
      location: 'Ashburn, VA - USA',
      description: 'Primary high-density AI and enterprise cloud facility',
      tier: 'Tier IV',
      status: 'operational',
      totalAreaSqFt: 45000,
      floorsCount: 2,
      zonesCount: 4,
      racksCount: 24,
      serversCount: 168,
      powerCapacityKw: 1100,
      currentPowerKw: 842.5,
      itEquipmentPowerKw: 601.8,
      coolingPowerKw: 185.2,
      pue: 1.40,
      overallHealth: 88,
      ambientTempC: 22.4,
      ambientHumidityPercent: 46.5,
      electricityRatePerKwh: 0.12,
      carbonIntensityGramsPerKwh: 380,
    },
    {
      siteId: 'dc-fra-02',
      name: 'Echo Cloud DC-2 (Frankfurt)',
      location: 'Frankfurt, Germany',
      description: 'Secondary European low-carbon colocation hub',
      tier: 'Tier III',
      status: 'operational',
      totalAreaSqFt: 32000,
      floorsCount: 1,
      zonesCount: 3,
      racksCount: 18,
      serversCount: 124,
      powerCapacityKw: 800,
      currentPowerKw: 560.0,
      itEquipmentPowerKw: 410.0,
      coolingPowerKw: 118.0,
      pue: 1.36,
      overallHealth: 94,
      ambientTempC: 20.8,
      ambientHumidityPercent: 44.0,
      electricityRatePerKwh: 0.24,
      carbonIntensityGramsPerKwh: 290,
    },
  ];

  for (const s of sites) {
    await Site.findOneAndUpdate({ siteId: s.siteId }, { $setOnInsert: s }, { upsert: true });
    console.log(`[Seeder] Ensured site: ${s.siteId} (${s.name})`);
  }

  // 3. Seed Racks (R-01 to R-12)
  const zones = ['Zone A', 'Zone B', 'Zone C'];
  for (let i = 1; i <= 12; i++) {
    const rackId = `R-${String(i).padStart(2, '0')}`;
    const zone = zones[(i - 1) % zones.length];
    const isOverheatingCandidate = rackId === 'R-04' || rackId === 'R-05';

    const rackData = {
      rackId,
      name: `Rack ${rackId} (${zone})`,
      siteId: 'dc-va-01',
      zone,
      row: `Row-${Math.ceil(i / 4)}`,
      position: ((i - 1) % 4) + 1,
      maxU: 42,
      usedU: 32 + (i % 6),
      maxPowerKw: 15.0,
      currentPowerKw: isOverheatingCandidate ? 13.8 : +(7.2 + (i * 0.4)).toFixed(1),
      inletTempC: isOverheatingCandidate ? 28.5 : +(21.5 + (i * 0.2)).toFixed(1),
      outletTempC: isOverheatingCandidate ? 36.2 : +(29.5 + (i * 0.3)).toFixed(1),
      humidityPercent: 45,
      airflowCfm: 1950,
      status: isOverheatingCandidate ? 'critical' : 'healthy',
      healthScore: isOverheatingCandidate ? 58 : 88,
      pduStatus: isOverheatingCandidate ? 'warning' : 'normal',
      weightKg: 620,
      maxWeightKg: 1000,
    };

    await Rack.findOneAndUpdate({ rackId }, { $setOnInsert: rackData }, { upsert: true });
  }
  console.log('[Seeder] Ensured 12 racks seeded for site dc-va-01.');

  // 4. Seed Critical Infrastructure Devices (Cooling, UPS, Key Servers)
  const devices = [
    // Cooling Units
    {
      deviceId: 'CRAC-01',
      name: 'CRAC Unit 01 (Zone A Direct Expansion)',
      vendor: 'Vertiv Liebert',
      model: 'DSE Downflow Chiller 100kW',
      serialNumber: 'SN-CRAC-01-VRT',
      deviceType: 'cooling',
      managementAddress: '10.240.5.10',
      siteId: 'dc-va-01',
      roomId: 'Room-A',
      status: 'healthy',
      health: 92,
      firmwareVersion: '3.4.1',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'Cooling Unit',
      specs: { type: 'CRAC', supplyTempC: 18.5, returnTempC: 26.2, fanSpeedPercent: 68, powerDrawKw: 42.5, cop: 3.8 },
      latestTelemetry: { temperature: 26.2, power: 42500, fan: 68 },
    },
    {
      deviceId: 'CRAC-02',
      name: 'CRAC Unit 02 (Zone A/B In-Row)',
      vendor: 'Schneider Electric / APC',
      model: 'InRow RC Chilled Water 60kW',
      serialNumber: 'SN-CRAC-02-APC',
      deviceType: 'cooling',
      managementAddress: '10.240.5.11',
      siteId: 'dc-va-01',
      roomId: 'Room-A',
      status: 'warning',
      health: 68,
      firmwareVersion: '2.8.0',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'In-Row Chiller',
      specs: { type: 'In-Row Chiller', supplyTempC: 21.8, returnTempC: 31.4, fanSpeedPercent: 94, powerDrawKw: 58.2, cop: 2.9 },
      latestTelemetry: { temperature: 31.4, power: 58200, fan: 94 },
    },
    // UPS Systems
    {
      deviceId: 'UPS-01',
      name: 'Primary Enterprise UPS-01 (Liebert EXL)',
      vendor: 'Vertiv',
      model: 'EXL S1 500kVA Monolithic',
      serialNumber: 'SN-UPS-01-EXL',
      deviceType: 'ups',
      managementAddress: '10.240.0.50',
      siteId: 'dc-va-01',
      roomId: 'Electrical-Room-1',
      status: 'healthy',
      health: 95,
      firmwareVersion: '4.1.2',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'Central UPS',
      specs: { capacityKva: 500, currentLoadKw: 312, loadPercent: 62.4, batteryHealthPercent: 94, runtimeRemainingMinutes: 28 },
      latestTelemetry: { loadPercent: 62.4, batteryHealth: 94, runtimeMinutes: 28 },
    },
    {
      deviceId: 'UPS-03',
      name: 'Secondary High-Density UPS-03 (Zone C)',
      vendor: 'Eaton',
      model: '9395P 300kVA High Performance',
      serialNumber: 'SN-UPS-03-EAT',
      deviceType: 'ups',
      managementAddress: '10.240.0.52',
      siteId: 'dc-va-01',
      roomId: 'Electrical-Room-2',
      status: 'warning',
      health: 64,
      firmwareVersion: '3.9.5',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'High-Density UPS',
      specs: { capacityKva: 300, currentLoadKw: 220, loadPercent: 73.3, batteryHealthPercent: 64, runtimeRemainingMinutes: 14 },
      latestTelemetry: { loadPercent: 73.3, batteryHealth: 64, runtimeMinutes: 14 },
    },
    // Key Servers
    {
      deviceId: 'SRV-R-04-02',
      name: 'Compute Node #2 (Intel Xeon 8480+)',
      vendor: 'Dell EMC',
      model: 'PowerEdge R760 2U Rack Server',
      serialNumber: 'SN-DL-98421-R04',
      deviceType: 'server',
      managementAddress: '10.240.4.12',
      siteId: 'dc-va-01',
      roomId: 'Room-A',
      rackId: 'R-04',
      uPosition: 12,
      uHeight: 2,
      status: 'critical',
      health: 45,
      firmwareVersion: 'iDRAC9 v6.10.30',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'AI Training Worker',
      specs: { cpuCores: 112, ramGb: 512, storageTb: 32 },
      latestTelemetry: { cpuUsage: 94.5, cpuTemp: 82.5, powerDrawWatts: 745, fanSpeedRpm: 14500 },
    },
    {
      deviceId: 'SRV-R-04-01',
      name: 'Database Cluster Master #1',
      vendor: 'Dell EMC',
      model: 'PowerEdge R760 2U Rack Server',
      serialNumber: 'SN-DL-98420-R04',
      deviceType: 'server',
      managementAddress: '10.240.4.11',
      siteId: 'dc-va-01',
      roomId: 'Room-A',
      rackId: 'R-04',
      uPosition: 8,
      uHeight: 2,
      status: 'healthy',
      health: 88,
      firmwareVersion: 'iDRAC9 v6.10.30',
      lastSeenAt: new Date(),
      dataMode: 'SIMULATED',
      workloadType: 'Database Cluster',
      specs: { cpuCores: 64, ramGb: 256, storageTb: 16 },
      latestTelemetry: { cpuUsage: 48.0, cpuTemp: 44.5, powerDrawWatts: 420, fanSpeedRpm: 6800 },
    },
  ];

  for (const d of devices) {
    await Device.findOneAndUpdate({ deviceId: d.deviceId }, { $setOnInsert: d }, { upsert: true });
    console.log(`[Seeder] Ensured device: ${d.deviceId} (${d.name})`);
  }

  // 5. Seed Alerts / Anomalies
  const alerts = [
    {
      alertId: 'ANOM-2026-081',
      deviceId: 'SRV-R-04-02',
      deviceName: 'Compute Node #2 (Rack R-04)',
      deviceType: 'server',
      metric: 'CPU Temperature & Power Spike',
      observedValue: '78.5°C / 745W',
      threshold: '35°C–62°C / 350W–480W',
      severity: 'critical',
      message: 'CRITICAL: Host CPU core utilization sustained at 96.2% exceeding 75% operational threshold.',
      possibleCause: 'Thermal throttling due to upstream CRAC-02 localized fan velocity loss',
      recommendedAction: 'Inspect CRAC-02 airflow louvers; redistribute high priority virtual workloads to R-08',
      source: 'isolation_forest',
      status: 'active',
      anomalyScore: 0.94,
      timestamp: new Date(Date.now() - 3 * 60000),
    },
    {
      alertId: 'ANOM-2026-079',
      deviceId: 'CRAC-02',
      deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
      deviceType: 'cooling',
      metric: 'Chilled Water Delta T Anomaly',
      observedValue: '9.6°C delta (High return temp)',
      threshold: '5.5°C–7.0°C delta',
      severity: 'warning',
      message: 'WARNING: Return water temperature delta elevated indicating reduced thermal extraction efficiency.',
      possibleCause: 'Actuator valve calibration drift reducing chilled water velocity',
      recommendedAction: 'Execute motorized valve recalibration script or manual bypass cycle',
      source: 'statistical_ml',
      status: 'active',
      anomalyScore: 0.86,
      timestamp: new Date(Date.now() - 14 * 60000),
    },
    {
      alertId: 'ANOM-2026-075',
      deviceId: 'UPS-03',
      deviceName: 'Secondary High-Density UPS (Zone C)',
      deviceType: 'ups',
      metric: 'Internal Battery Cell Resistance',
      observedValue: '34.8 mΩ (Nominal: 18 mΩ)',
      threshold: '16.0–22.0 mΩ',
      severity: 'warning',
      message: 'WARNING: Internal cell impedance exceeding nominal operating tolerance on string 2B.',
      possibleCause: 'String 2 cell dryout resulting in premature internal impedance rise',
      recommendedAction: 'Schedule string impedance test and dispatch battery module replacement',
      source: 'deterministic_rule',
      status: 'acknowledged',
      anomalyScore: 0.81,
      timestamp: new Date(Date.now() - 42 * 60000),
    },
  ];

  for (const a of alerts) {
    await Alert.findOneAndUpdate({ alertId: a.alertId }, { $setOnInsert: a }, { upsert: true });
  }
  console.log('[Seeder] Ensured alerts seeded.');

  // 6. Seed Incidents
  const incidents = [
    {
      incidentId: 'INC-2026-THM-884',
      title: 'Zone A Thermal Stress & Server Throttling Cascade',
      description: 'Localized heat concentration in Rack R-04 causing CPU throttling on compute nodes due to CRAC-02 airflow reduction.',
      severity: 'critical',
      status: 'OPEN',
      affectedDevices: ['CRAC-02', 'SRV-R-04-02', 'SRV-R-04-01'],
      affectedRacks: ['R-04', 'R-05'],
      affectedServersCount: 14,
      contributingAlerts: ['ANOM-2026-081', 'ANOM-2026-079'],
      probableRootCause: 'CRAC-02 motorized actuator valve drift causing chilled water bypass and hot-aisle air recirculation into R-04 inlet.',
      evidence: [
        { signalName: 'CPU Die Temp', currentValue: '82.5°C', baseline: '42.0°C', delta: '+40.5°C' },
        { signalName: 'CRAC-02 Return Temp', currentValue: '37.0°C', baseline: '26.0°C', delta: '+11.0°C' },
      ],
      confidence: 94,
      recommendations: [
        { action: 'Increase CRAH-03 chilled water flow by +20%', priority: 'IMMEDIATE', estimatedMinutes: 5 },
        { action: 'Migrate non-essential batch worker pods from Rack R-04 to Rack R-10', priority: 'HIGH', estimatedMinutes: 15 },
      ],
      openedAt: new Date(Date.now() - 25 * 60000),
    },
  ];

  for (const inc of incidents) {
    await Incident.findOneAndUpdate({ incidentId: inc.incidentId }, { $setOnInsert: inc }, { upsert: true });
  }
  console.log('[Seeder] Ensured incidents seeded.');

  // 7. Seed Predictive Failures
  const predictions = [
    {
      predictionId: 'PRED-SRV-001',
      deviceId: 'SRV-R-04-02',
      deviceName: 'Compute Node #2 (Dell PowerEdge R760)',
      deviceType: 'server',
      component: 'Silicon Processor Socket 1 & Motherboard VRM',
      predictionType: 'server_failure',
      predictionHorizon: 'Next 7 days',
      failureProbability: 78,
      riskScore: 82,
      riskLevel: 'HIGH',
      confidence: 91,
      supportingEvidence: [
        'Fan speed instability (±1,850 RPM tachometer jitter)',
        'Temperature trend increasing (+0.8°C/day baseline drift under nominal load)',
        'Power fluctuation detected (PSU 12V rail ripple transient +140mV)',
      ],
      factors: [
        { factor: 'Continuous Thermal Overdrive (>78°C for 140 hours)', contributionPercent: 46 },
        { factor: 'Fan Tachometer Velocity Variance (Jitter >15%)', contributionPercent: 32 },
        { factor: 'VRM Switching Transient Voltage Instability', contributionPercent: 22 },
      ],
      recommendation: 'Throttle high-priority ML worker processes and prepare hot-standby node for live container migration.',
      modelVersion: 'dc-aiops-rf-v2.4',
      generatedAt: new Date(),
    },
    {
      predictionId: 'PRED-FAN-002',
      deviceId: 'CRAC-02',
      deviceName: 'CRAC Unit 02 (Zone A/B In-Row)',
      deviceType: 'cooling',
      component: 'High-Velocity Blower Fan Motor Assembly #3',
      predictionType: 'fan_failure',
      predictionHorizon: 'Next 7 days',
      failureProbability: 84,
      riskScore: 88,
      riskLevel: 'HIGH',
      confidence: 94,
      supportingEvidence: [
        'Acoustic vibration harmonic spike (120 Hz bearing resonance >7.8 mm/s RMS)',
        'Fan speed duty cycle pegged at 100% continuous for 168 hours',
        'Motor stator casing temperature elevation (+9.4°C over baseline)',
      ],
      factors: [
        { factor: 'Vibration Harmonic Energy Spike (Bearing Race Pitting)', contributionPercent: 52 },
        { factor: 'Continuous 100% Duty Cycle Thermal Load', contributionPercent: 30 },
      ],
      recommendation: 'Replace bearing assembly on CRAC-02 fan motor #3 and execute dynamic balancing calibration.',
      modelVersion: 'dc-aiops-iso10816-v1.8',
      generatedAt: new Date(),
    },
  ];

  for (const pred of predictions) {
    await Prediction.findOneAndUpdate({ predictionId: pred.predictionId }, { $setOnInsert: pred }, { upsert: true });
  }
  console.log('[Seeder] Ensured predictive failures seeded.');

  // 8. Seed Work Orders
  const workOrders = [
    {
      workOrderId: 'WO-1042',
      title: 'Replace High-Vibration Blower Fan Bearing on CRAC-02',
      targetAsset: 'CRAC-02',
      severity: 'critical',
      status: 'in_progress',
      assignedTo: 'Mechanical Tech Lead (Marcus Vance)',
      slaDueHours: 2,
      costEstimate: 450,
      estimatedHours: 2.5,
      instructions: '1. Lockout/tagout CRAC-02 electrical feed.\n2. Evacuate localized air loop.\n3. Disassemble blower assembly and press new SKF 6205 bearing set.\n4. Re-calibrate motor RPM tachometer.',
      description: 'Vibration harmonics exceeded ISO 10816 Class II thresholds. Replace bearing set #3.',
      createdAt: new Date(Date.now() - 4 * 3600000),
    },
    {
      workOrderId: 'WO-1039',
      title: 'Inspect Battery String 2B Impedance on UPS-03',
      targetAsset: 'UPS-03',
      severity: 'high',
      status: 'open',
      assignedTo: 'Electrical Lead (Sarah Chen)',
      slaDueHours: 6,
      costEstimate: 320,
      estimatedHours: 1.8,
      instructions: '1. Connect Hioki battery internal resistance tester to string 2B.\n2. Measure conductance across all 32 cells.\n3. Identify cells with impedance >30mΩ.',
      description: 'Internal resistance rose to 34.8mΩ across cells in string 2B. Conduct load-bank discharge test.',
      createdAt: new Date(Date.now() - 6 * 3600000),
    },
  ];

  for (const wo of workOrders) {
    await WorkOrder.findOneAndUpdate({ workOrderId: wo.workOrderId }, { $setOnInsert: wo }, { upsert: true });
  }
  console.log('[Seeder] Ensured work orders seeded.');

  // 9. Seed Infrastructure Dependencies
  const dependencies = [
    {
      nodeId: 'POWER-SYS-01',
      name: 'Utility Substation Grid Feed (115kV/480V Dual Bus)',
      type: 'power_system',
      layer: 5,
      status: 'healthy',
      load: '842 kW (76.5% Capacity)',
      metrics: { voltageV: 480, freqHz: 60.0, powerFactor: 0.98 },
      parentIds: [],
      childIds: ['UPS-01', 'UPS-03'],
      redundancy: '2N',
    },
    {
      nodeId: 'UPS-01',
      name: 'UPS-01 (Liebert EXL 500kVA)',
      type: 'ups',
      layer: 4,
      status: 'healthy',
      load: '312 kW (62.4% Load)',
      metrics: { batterySoh: '94%', reserveMinutes: 28, inputV: 480, outputV: 208 },
      parentIds: ['POWER-SYS-01'],
      childIds: ['PDU-01', 'PDU-02'],
      redundancy: 'N+1',
    },
    {
      nodeId: 'UPS-03',
      name: 'UPS-03 (Eaton 9395P 300kVA)',
      type: 'ups',
      layer: 4,
      status: 'warning',
      load: '220 kW (73.3% Load)',
      metrics: { batterySoh: '64%', reserveMinutes: 14, inputV: 480, outputV: 208 },
      parentIds: ['POWER-SYS-01'],
      childIds: ['PDU-03'],
      redundancy: 'N',
    },
  ];

  for (const dep of dependencies) {
    await Dependency.findOneAndUpdate({ nodeId: dep.nodeId }, { $setOnInsert: dep }, { upsert: true });
  }
  console.log('[Seeder] Ensured infrastructure dependencies seeded.');

  // 10. Seed Historical Sample Telemetry (Simulated samples for charts)
  const existingTelemetryCount = await Telemetry.countDocuments({ deviceId: 'SRV-R-04-02' });
  if (existingTelemetryCount === 0) {
    const historicalSamples: any[] = [];
    const nowMs = Date.now();
    for (let m = 30; m >= 0; m--) {
      const sampleTime = new Date(nowMs - m * 60000);
      historicalSamples.push(
        {
          deviceId: 'SRV-R-04-02',
          metric: 'cpu',
          value: +(75 + Math.random() * 20).toFixed(1),
          unit: '%',
          source: 'redfish_simulator',
          dataMode: 'SIMULATED',
          quality: 'SIMULATED',
          timestamp: sampleTime,
        },
        {
          deviceId: 'SRV-R-04-02',
          metric: 'temperature',
          value: +(72 + Math.random() * 11).toFixed(1),
          unit: 'C',
          source: 'redfish_simulator',
          dataMode: 'SIMULATED',
          quality: 'SIMULATED',
          timestamp: sampleTime,
        },
        {
          deviceId: 'SRV-R-04-02',
          metric: 'power',
          value: Math.floor(680 + Math.random() * 80),
          unit: 'Watts',
          source: 'redfish_simulator',
          dataMode: 'SIMULATED',
          quality: 'SIMULATED',
          timestamp: sampleTime,
        }
      );
    }
    await Telemetry.insertMany(historicalSamples);
    console.log(`[Seeder] Seeded ${historicalSamples.length} simulated historical telemetry points for SRV-R-04-02.`);
  } else {
    console.log(`[Seeder] Telemetry already exists (${existingTelemetryCount} records). Skipping telemetry seed.`);
  }

  console.log('[Seeder] Idempotent database seeding completed successfully! ✨');
}

// If invoked directly from command line
if (process.argv[1]?.endsWith('seedDatabase.ts') || process.argv[1]?.endsWith('seedDatabase.js')) {
  seedDatabase()
    .catch((err) => {
      console.error('[Seeder Fatal Error]', err);
    })
    .finally(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
}
