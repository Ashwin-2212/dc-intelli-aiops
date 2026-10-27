import {
  AssetLifecycleRecord,
  PredictiveMaintenanceTask,
  ConfigurationDriftRecord,
} from '../types';

// Feature 15: Asset Lifecycle Seed Records
export const assetLifecycleSeedRecords: AssetLifecycleRecord[] = [
  {
    id: 'ASSET-SRV-001',
    name: 'SERVER-001',
    vendor: 'Dell EMC',
    model: 'PowerEdge R760 Dual Xeon 8480+',
    serialNumber: 'DL-88392-X7',
    firmware: 'iDRAC9 v6.10.30',
    ipAddress: '10.240.12.101',
    location: 'DC-01 / Room-A / Row-01 / Rack-05 (U12)',
    purchaseDate: '2023-04-15',
    installationDate: '2023-05-02',
    warrantyExpiry: '2026-05-02',
    isWarrantyActive: false, // Expired ~4 months ago
    ageMonths: 41,
    lifecycleState: 'Operational',
    healthScore: 78,
    maintenanceCount: 4,
    replacementRecommendation: 'Schedule refresh cycle in Q1 2027; warranty expired.',
  },
  {
    id: 'ASSET-SRV-004',
    name: 'SERVER-004',
    vendor: 'Dell EMC',
    model: 'PowerEdge R760 Analytics Worker',
    serialNumber: 'DL-99401-K2',
    firmware: 'iDRAC9 v6.00.00 (Outdated)',
    ipAddress: '10.240.12.104',
    location: 'DC-01 / Room-A / Row-01 / Rack-05 (U18) [DRIFT DETECTED]',
    purchaseDate: '2024-01-10',
    installationDate: '2024-01-28',
    warrantyExpiry: '2027-01-28',
    isWarrantyActive: true,
    ageMonths: 32,
    lifecycleState: 'Maintenance',
    healthScore: 62,
    maintenanceCount: 6,
    replacementRecommendation: 'Perform fan tray replacement and update BMC firmware to v6.10.30.',
  },
  {
    id: 'ASSET-SRV-007',
    name: 'SERVER-007',
    vendor: 'Oracle / Cisco',
    model: 'Exadata X9M-2 Database Server',
    serialNumber: 'OR-55210-DB1',
    firmware: 'Oracle ILOM v5.1.2',
    ipAddress: '10.240.14.201',
    location: 'DC-01 / Room-A / Row-02 / Rack-07 (U18)',
    purchaseDate: '2022-11-20',
    installationDate: '2022-12-05',
    warrantyExpiry: '2025-12-05',
    isWarrantyActive: false,
    ageMonths: 46,
    lifecycleState: 'Operational',
    healthScore: 68,
    maintenanceCount: 8,
    replacementRecommendation: 'Plan migration to Exadata X10M; thermal degradation noted.',
  },
  {
    id: 'ASSET-CRAC-02',
    name: 'CRAC-02',
    vendor: 'Schneider Electric',
    model: 'Uniflair LE Direct Expansion 80kW',
    serialNumber: 'SE-UNF-44102',
    firmware: 'EcoStruxure BMS v4.2',
    ipAddress: '10.240.20.102',
    location: 'DC-01 / Room-A / Perimeter Zone A',
    purchaseDate: '2021-06-12',
    installationDate: '2021-07-01',
    warrantyExpiry: '2026-07-01',
    isWarrantyActive: false,
    ageMonths: 62,
    lifecycleState: 'Maintenance',
    healthScore: 54,
    maintenanceCount: 12,
    replacementRecommendation: 'Overhaul blower fan motor bearings immediately.',
  },
  {
    id: 'ASSET-UPS-01',
    name: 'UPS-01',
    vendor: 'Vertiv Liebert',
    model: 'EXL S1 500kVA Double-Conversion',
    serialNumber: 'VT-EXL-99182',
    firmware: 'Vertiv Unity v8.4',
    ipAddress: '10.240.30.101',
    location: 'DC-01 / Electrical Room 1',
    purchaseDate: '2023-08-10',
    installationDate: '2023-09-01',
    warrantyExpiry: '2028-09-01',
    isWarrantyActive: true,
    ageMonths: 37,
    lifecycleState: 'Operational',
    healthScore: 94,
    maintenanceCount: 3,
    replacementRecommendation: 'Nominal operational status; next battery impedance test due in 90 days.',
  },
];

// Feature 14: Predictive Maintenance Scheduler Seed
export const predictiveMaintenanceSeedTasks: PredictiveMaintenanceTask[] = [
  {
    id: 'PM-TASK-SRV-004',
    targetDevice: 'SERVER-004', // Exact prompt specification
    component: 'Chassis Dual-Blower Fan Tray (Zone 1-4)',
    maintenanceRisk: 'HIGH', // Exact prompt: Maintenance Risk: HIGH
    reason: 'Fan instability detected over previous 14 days.', // Exact prompt specification
    recommendedMaintenance: 'Inspect cooling fan.', // Exact prompt specification
    suggestedWindow: 'Next maintenance cycle.', // Exact prompt specification
    telemetryEvidence:
      'Tachometer duty fluctuating between 6,800 RPM and 14,200 RPM without corresponding CPU load change; bearing acoustic sensor +3.8σ.',
    status: 'SCHEDULED',
    maintenanceHistory: [
      {
        date: '2026-05-12',
        action: 'Thermal paste re-application and dust filter purge',
        technician: 'Marcus Vance (Senior DC Tech)',
        outcome: 'Completed nominally; thermal delta reduced by 4.2°C.',
      },
      {
        date: '2025-11-04',
        action: 'PSU-2 replacement following capacitor warning',
        technician: 'Elena Rostova',
        outcome: 'Resolved voltage drop issue.',
      },
      {
        date: '2025-04-18',
        action: 'Annual physical hardware inspection',
        technician: 'Marcus Vance',
        outcome: 'Clean bill of health; all fan rails nominal.',
      },
    ],
  },
  {
    id: 'PM-TASK-CRAC-02',
    targetDevice: 'CRAC-02',
    component: 'Blower Motor Drive Shaft & Pillow Block Bearings',
    maintenanceRisk: 'HIGH',
    reason: 'Vibration velocity surge (+120% vs baseline) detected over last 21 days.',
    recommendedMaintenance: 'Replace drive belt and lubricate/replace bearing assembly.',
    suggestedWindow: 'Immediate (0-48 hours window).',
    telemetryEvidence: 'Vibration sensor RMS: 6.8 mm/s (Warning threshold: 4.5 mm/s). Supply CFM down 38%.',
    status: 'PENDING_APPROVAL',
    maintenanceHistory: [
      {
        date: '2026-02-14',
        action: 'Chilled water actuator calibration',
        technician: 'HVAC Specialist Crew',
        outcome: 'Valve response time improved to 1.2s.',
      },
    ],
  },
  {
    id: 'PM-TASK-UPS-02',
    targetDevice: 'UPS-02',
    component: 'Inverter Output Filter Capacitor Bank',
    maintenanceRisk: 'MEDIUM',
    reason: 'Harmonic distortion THD increased from 2.1% to 6.8% over 30 days.',
    recommendedMaintenance: 'Inspect AC filter capacitors for electrolyte venting.',
    suggestedWindow: 'Next scheduled electrical shutdown (Window: 14 days).',
    telemetryEvidence: 'Neutral return current elevated to 44A on Substation Bus B.',
    status: 'SCHEDULED',
    maintenanceHistory: [
      {
        date: '2025-08-20',
        action: 'Battery string impedance scan & cell torque check',
        technician: 'Vertiv Field Engineer',
        outcome: 'Replaced 2 weak battery modules in String 4.',
      },
    ],
  },
];

// Feature 16: Configuration Drift Detection Seed Records
export const configurationDriftSeedRecords: ConfigurationDriftRecord[] = [
  {
    id: 'DRIFT-001',
    deviceId: 'SERVER-004', // Exact prompt specification
    deviceName: 'Server-004 (Dell PowerEdge R760)',
    driftType: 'device_moved',
    expected: 'SERVER-004 → Rack-03', // Exact prompt: Expected: SERVER-004 → Rack-03
    detected: 'SERVER-004 → Rack-05', // Exact prompt: Detected: SERVER-004 → Rack-05
    severity: 'WARNING',
    detectedAt: '2026-09-14 18:32:00 UTC',
    status: 'UNRESOLVED',
    auditHistory: [
      {
        timestamp: '2026-09-14 18:32:00 UTC',
        changedBy: 'LLDP / Redfish Auto-Discovery Scanner',
        changeSummary: 'Switch port LLDP neighbor shifted from SW-R03-P12 to SW-R05-P18.',
        previousValue: 'Rack-03 (U08)',
        newValue: 'Rack-05 (U18)',
      },
      {
        timestamp: '2026-09-14 17:15:00 UTC',
        changedBy: 'Unassigned Physical Intervention',
        changeSummary: 'Server unmounted from Rack-03 during emergency maintenance without DCIM work order update.',
        previousValue: 'Rack-03',
        newValue: 'Rack-05',
      },
    ],
  },
  {
    id: 'DRIFT-002',
    deviceId: 'SRV-R-01-02',
    deviceName: 'Server SRV-R-01-02 (Web Front 2)',
    driftType: 'changed_firmware',
    expected: 'iDRAC9 Firmware: v6.10.30',
    detected: 'iDRAC9 Firmware: v5.10.10 (Downgraded / Vulnerable)',
    severity: 'CRITICAL',
    detectedAt: '2026-09-14 12:10:00 UTC',
    status: 'UNRESOLVED',
    auditHistory: [
      {
        timestamp: '2026-09-14 12:10:00 UTC',
        changedBy: 'Automated Security Compliance Scan',
        changeSummary: 'BMC version mismatch detected against Enterprise Golden Image policy.',
        previousValue: 'v6.10.30',
        newValue: 'v5.10.10',
      },
    ],
  },
  {
    id: 'DRIFT-003',
    deviceId: 'PDU-05-BRANCH',
    deviceName: 'Floor PDU-05 Branch Breaker 14',
    driftType: 'unexpected_config',
    expected: 'Max Trip Limit: 20 Amps',
    detected: 'Max Trip Limit: 30 Amps (Over-rated breaker installed)',
    severity: 'CRITICAL',
    detectedAt: '2026-09-13 09:44:00 UTC',
    status: 'ACCEPTED_DRIFT',
    auditHistory: [
      {
        timestamp: '2026-09-13 09:44:00 UTC',
        changedBy: 'Modbus BMS Telemetry Sync',
        changeSummary: 'Breaker rating setting modified on PDU digital controller.',
        previousValue: '20 A',
        newValue: '30 A',
      },
    ],
  },
];
