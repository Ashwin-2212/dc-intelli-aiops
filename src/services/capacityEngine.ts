import {
  CapacityMilestone,
  CapacityForecastPoint,
  CapacityRecommendation,
  CapacityMetricKey,
} from '../types';

export const capacityMilestonesSeed: CapacityMilestone[] = [
  {
    key: 'cpu',
    label: 'CPU Compute Fleet Capacity',
    current: 68.0,
    days30: 76.0,
    days60: 83.0,
    days90: 89.0,
    unit: '%',
    safetyThreshold: 90.0,
    exhaustionRunwayDays: 94,
    exhaustionDate: 'Dec 17, 2026',
    status: 'warning',
    trendDirection: 'steep',
    growthRateMonthlyPercent: 7.0,
  },
  {
    key: 'ram',
    label: 'Memory (RAM) Allocation',
    current: 62.0,
    days30: 71.0,
    days60: 79.0,
    days90: 86.0,
    unit: '%',
    safetyThreshold: 90.0,
    exhaustionRunwayDays: 112,
    exhaustionDate: 'Jan 04, 2027',
    status: 'nominal',
    trendDirection: 'moderate',
    growthRateMonthlyPercent: 8.0,
  },
  {
    key: 'storage',
    label: 'Storage Array (NVMe / SAN Pool)',
    current: 71.0,
    days30: 79.0,
    days60: 88.0,
    days90: 94.0,
    unit: '%',
    safetyThreshold: 90.0,
    exhaustionRunwayDays: 68,
    exhaustionDate: 'Nov 21, 2026',
    status: 'critical',
    trendDirection: 'steep',
    growthRateMonthlyPercent: 8.5,
  },
  {
    key: 'power',
    label: 'Substation Facility Power Demand',
    current: 76.5, // 842 kW of 1,100 kW
    days30: 82.7, // 910 kW
    days60: 89.1, // 980 kW
    days90: 95.0, // 1,045 kW
    unit: '% (kW)',
    safetyThreshold: 92.0, // 1,012 kW
    exhaustionRunwayDays: 118,
    exhaustionDate: 'Jan 10, 2027',
    status: 'warning',
    trendDirection: 'steep',
    growthRateMonthlyPercent: 6.2,
  },
  {
    key: 'rack_capacity',
    label: 'Physical 42U Rack Space Occupancy',
    current: 72.0, // 30 of 42 Racks occupied
    days30: 78.0,
    days60: 84.0,
    days90: 91.0,
    unit: '%',
    safetyThreshold: 95.0,
    exhaustionRunwayDays: 106,
    exhaustionDate: 'Dec 29, 2026',
    status: 'nominal',
    trendDirection: 'moderate',
    growthRateMonthlyPercent: 6.0,
  },
  {
    key: 'cooling_capacity',
    label: 'Cooling Plant Heat Rejection (HVAC)',
    current: 61.0,
    days30: 68.0,
    days60: 76.0,
    days90: 84.0,
    unit: '%',
    safetyThreshold: 90.0,
    exhaustionRunwayDays: 135,
    exhaustionDate: 'Jan 27, 2027',
    status: 'nominal',
    trendDirection: 'moderate',
    growthRateMonthlyPercent: 7.5,
  },
];

export const capacityRecommendationsSeed: CapacityRecommendation[] = [
  {
    id: 'REC-CAP-01',
    title: 'Procure 2x High-Density All-Flash Storage Arrays (64TB NVMe-oF)',
    resourceCategory: 'Storage Array',
    priority: 'Immediate (0–30d)',
    action: 'Provision secondary Ceph/ZFS storage target in Zone B before storage pool hits 88% critical threshold in 68 days.',
    impact: 'Extends storage runway by +145 days and prevents database write locks.',
    estimatedCost: '$42,000 CapEx',
    runwayExtendedDays: 145,
  },
  {
    id: 'REC-CAP-02',
    title: 'Commission Substation Transformer 2 Automatic Bus Tie',
    resourceCategory: 'Power Substation',
    priority: 'High (30–60d)',
    action: 'Activate 500kVA secondary feeder tie-breaker to offload Bus A as facility power approaches 980 kW ceiling in 60 days.',
    impact: 'Expands available facility power ceiling from 1,100 kW to 1,600 kW (+45%).',
    estimatedCost: '$18,500 OpEx',
    runwayExtendedDays: 240,
  },
  {
    id: 'REC-CAP-03',
    title: 'Cluster Compute Node Workload Consolidation & RAM Upgrades',
    resourceCategory: 'Compute (CPU/RAM)',
    priority: 'High (30–60d)',
    action: 'Migrate underutilized VMs from Rows 1–2 onto high-density dual-socket hosts and install 32x 64GB DDR5 DIMMs.',
    impact: 'Lowers baseline CPU utilization by 9% and extends compute runway past Q1 2027.',
    estimatedCost: '$14,200 Hardware',
    runwayExtendedDays: 85,
  },
  {
    id: 'REC-CAP-04',
    title: 'Install Cold-Aisle Containment Doors & Blanking Panels in Row 3',
    resourceCategory: 'Cooling HVAC',
    priority: 'Planned (60–90d)',
    action: 'Seal remaining 24U gaps across Row 3 to eliminate hot-air recirculation as IT density expands.',
    impact: 'Improves CRAC COP efficiency by 14% and reduces cooling load by 22 kW.',
    estimatedCost: '$6,800 Materials',
    runwayExtendedDays: 90,
  },
];

/**
 * Generate high-precision time series containing:
 * 1. Historical Actual Trend (-30 days to Day 0)
 * 2. Predictive Forecast Trajectory (Day 0 to +Horizon)
 * 3. 95% Confidence Intervals (Upper and Lower uncertainty bounds)
 * 4. Safety Margin Thresholds
 */
export function generateAdvancedCapacityCurves(
  horizon: '30d' | '60d' | '90d' | '180d' | '365d' = '90d'
): CapacityForecastPoint[] {
  const points: CapacityForecastPoint[] = [];
  const futureDays =
    horizon === '30d'
      ? 30
      : horizon === '60d'
      ? 60
      : horizon === '90d'
      ? 90
      : horizon === '180d'
      ? 180
      : 365;

  const now = new Date('2026-09-14T00:00:00Z');

  // 1. Generate Historical Actuals (Past 30 Days)
  for (let d = -30; d <= 0; d += 2) {
    const dateObj = new Date(now.getTime() + d * 86400000);
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const ratio = (d + 30) / 30; // 0 to 1

    // Historical actuals with natural operational noise
    const noise = (Math.sin(d * 0.4) * 0.8);
    const cpuAct = +(58.0 + ratio * 10.0 + noise).toFixed(1);
    const ramAct = +(53.0 + ratio * 9.0 + noise * 0.7).toFixed(1);
    const storageAct = +(62.0 + ratio * 9.0 + (d * 0.05)).toFixed(1);
    const powerAct = +(740 + ratio * 102.5 + noise * 12).toFixed(1);
    const rackAct = +(65.0 + ratio * 7.0).toFixed(1);
    const coolingAct = +(52.0 + ratio * 9.0 + noise * 1.1).toFixed(1);

    points.push({
      date: dateLabel,
      dayOffset: d,
      isHistorical: true,
      cpuTrend: Math.min(100, cpuAct),
      cpuThreshold: 90.0,

      ramTrend: Math.min(100, ramAct),
      ramThreshold: 90.0,

      storageTrend: Math.min(100, storageAct),
      storageThreshold: 90.0,

      powerTrend: Math.min(1100, powerAct),
      powerThreshold: 1012.0, // 92% of 1,100 kW

      rackTrend: Math.min(100, rackAct),
      rackThreshold: 95.0,

      coolingTrend: Math.min(100, coolingAct),
      coolingThreshold: 90.0,

      projectedCost: Math.round(64000 + ratio * 8500),
    });
  }

  // 2. Generate Forecast with 95% Confidence Interval Bands (Day 1 to futureDays)
  const step = Math.max(1, Math.floor(futureDays / 25));
  for (let d = 2; d <= futureDays; d += step) {
    const dateObj = new Date(now.getTime() + d * 86400000);
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const progressRatio = d / 90; // Normalized to 90 days

    // Uncertainty band widens over time (cone of uncertainty ±sigma * sqrt(t))
    const uncertaintySpan = +(2.0 + Math.sqrt(d) * 0.85).toFixed(1);

    // Exact milestone trajectories:
    // CPU: 68% -> 76% (30d) -> 83% (60d) -> 89% (90d)
    const cpuMean = +(68.0 + (d <= 30 ? d * (8 / 30) : d <= 60 ? 8 + (d - 30) * (7 / 30) : 15 + (d - 60) * (6 / 30))).toFixed(1);
    const ramMean = +(62.0 + (d <= 30 ? d * (9 / 30) : d <= 60 ? 9 + (d - 30) * (8 / 30) : 17 + (d - 60) * (7 / 30))).toFixed(1);
    const storageMean = +(71.0 + (d <= 30 ? d * (8 / 30) : d <= 60 ? 8 + (d - 30) * (9 / 30) : 17 + (d - 60) * (6 / 30))).toFixed(1);
    const powerMean = +(842.5 + (d <= 30 ? d * (67.5 / 30) : d <= 60 ? 67.5 + (d - 30) * (70 / 30) : 137.5 + (d - 60) * (65 / 30))).toFixed(1);
    const rackMean = +(72.0 + (d <= 30 ? d * (6 / 30) : d <= 60 ? 6 + (d - 30) * (6 / 30) : 12 + (d - 60) * (7 / 30))).toFixed(1);
    const coolingMean = +(61.0 + (d <= 30 ? d * (7 / 30) : d <= 60 ? 7 + (d - 30) * (8 / 30) : 15 + (d - 60) * (8 / 30))).toFixed(1);

    points.push({
      date: dateLabel,
      dayOffset: d,
      isHistorical: false,
      
      // CPU
      cpuForecast: Math.min(100, cpuMean),
      cpuLower: Math.max(0, +(cpuMean - uncertaintySpan).toFixed(1)),
      cpuUpper: Math.min(100, +(cpuMean + uncertaintySpan).toFixed(1)),
      cpuThreshold: 90.0,

      // RAM
      ramForecast: Math.min(100, ramMean),
      ramLower: Math.max(0, +(ramMean - uncertaintySpan * 0.9).toFixed(1)),
      ramUpper: Math.min(100, +(ramMean + uncertaintySpan * 0.9).toFixed(1)),
      ramThreshold: 90.0,

      // Storage
      storageForecast: Math.min(100, storageMean),
      storageLower: Math.max(0, +(storageMean - uncertaintySpan * 1.1).toFixed(1)),
      storageUpper: Math.min(100, +(storageMean + uncertaintySpan * 1.1).toFixed(1)),
      storageThreshold: 90.0,

      // Power
      powerForecast: Math.min(1100, powerMean),
      powerLower: Math.max(700, +(powerMean - uncertaintySpan * 12).toFixed(1)),
      powerUpper: Math.min(1200, +(powerMean + uncertaintySpan * 12).toFixed(1)),
      powerThreshold: 1012.0,

      // Rack Capacity
      rackForecast: Math.min(100, rackMean),
      rackLower: Math.max(0, +(rackMean - uncertaintySpan * 0.7).toFixed(1)),
      rackUpper: Math.min(100, +(rackMean + uncertaintySpan * 0.7).toFixed(1)),
      rackThreshold: 95.0,

      // Cooling
      coolingForecast: Math.min(100, coolingMean),
      coolingLower: Math.max(0, +(coolingMean - uncertaintySpan * 0.8).toFixed(1)),
      coolingUpper: Math.min(100, +(coolingMean + uncertaintySpan * 0.8).toFixed(1)),
      coolingThreshold: 90.0,

      projectedCost: Math.round(72500 + progressRatio * 18000),
    });
  }

  return points;
}
