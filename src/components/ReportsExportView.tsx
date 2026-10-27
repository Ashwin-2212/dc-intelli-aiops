import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Zap,
  Thermometer,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  Table,
  Eye,
  Layers,
  Calendar,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TelemetryEngine } from '../services/telemetrySimulator';

interface ReportsExportViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

type ReportType = 'pue_sustainability' | 'ashrae_thermal' | 'power_tier4' | 'rack_inventory' | 'sla_incidents';

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({ onOpenCopilot }) => {
  const engine = TelemetryEngine.getInstance();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('dc-va-01');
  const [activeReportTab, setActiveReportTab] = useState<ReportType>('pue_sustainability');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('September 2026 (Live MTD)');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const facility = engine.facilities.find((f) => f.id === selectedFacilityId) || engine.facilities[0];
  const activeAnomalies = engine.anomalies.filter((a) => a.status === 'active');
  const racksInFacility = engine.racks;

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Generate and Download PDF using jsPDF
  const generatePdfReport = (reportType: ReportType) => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const timestamp = new Date().toLocaleString();
      const reportId = `AUD-${Date.now().toString().slice(-6)}`;

      // Top Header Banner
      doc.setFillColor(15, 17, 23); // Dark background header
      doc.rect(0, 0, pageWidth, 38, 'F');

      // Title & Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('DC-INTELLI | AIOPS AUDIT & COMPLIANCE REPORT', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 185, 200);
      doc.text(`Facility: ${facility.name} (${facility.location}) | Tier: ${facility.tier}`, 14, 22);
      doc.text(`Report ID: ${reportId}  |  Generated: ${timestamp}  |  Cycle: ${selectedTimeframe}`, 14, 28);
      doc.text('Standard Compliance: ISO 50001, ASHRAE TC 9.9, Uptime Institute Tier IV', 14, 34);

      let currentY = 48;

      if (reportType === 'pue_sustainability') {
        // Section: Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('1. Executive PUE & Energy Sustainability Audit', 14, currentY);

        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          'This audit evaluates total facility energy consumption, power distribution losses, and carbon efficiency in accordance with ISO 50001.',
          14,
          currentY,
          { maxWidth: 180 }
        );

        // KPI Box
        currentY += 12;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, currentY, 182, 32, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Power Usage Effectiveness (PUE): ${facility.pue.toFixed(2)}`, 20, currentY + 10);
        doc.text(`Total Facility Load: ${facility.totalFacilityPowerKw.toFixed(1)} kW`, 20, currentY + 18);
        doc.text(`IT Equipment Load: ${facility.itEquipmentPowerKw.toFixed(1)} kW`, 20, currentY + 26);

        doc.text(`Cooling Plant Power: ${facility.coolingPowerKw.toFixed(1)} kW`, 110, currentY + 10);
        doc.text(`Electricity Tariff: $${facility.electricityRatePerKwh}/kWh`, 110, currentY + 18);
        doc.text(`Carbon Intensity: ${facility.carbonIntensityGramsPerKwh} g CO2/kWh`, 110, currentY + 26);

        // Key Findings
        currentY += 40;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('Key Sustainability Findings & Efficiency Score', 14, currentY);

        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const findings = [
          `• Average Facility PUE of ${facility.pue.toFixed(2)} meets the ASHRAE target envelope for ${facility.tier} facilities.`,
          `• Total estimated monthly energy consumption is ${(facility.totalFacilityPowerKw * 24 * 30).toLocaleString()} kWh.`,
          `• Scope 2 Carbon Footprint: ${((facility.totalFacilityPowerKw * 24 * 30 * facility.carbonIntensityGramsPerKwh) / 1000000).toFixed(2)} Metric Tons CO2e/month.`,
          `• Cooling overhead represents ${((facility.coolingPowerKw / facility.totalFacilityPowerKw) * 100).toFixed(1)}% of gross power, optimized by AIOps VFD modulation.`,
        ];
        findings.forEach((line) => {
          doc.text(line, 16, currentY);
          currentY += 6;
        });

        // Recommendations
        currentY += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('Recommended Actions for Net-Zero Optimization', 14, currentY);

        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const actions = [
          '1. Implement AI cold-aisle temperature setpoint elevation from 22.4°C to 24.0°C to reduce chiller lift.',
          '2. Install blanking panels in Zone B to eliminate hot-air recirculation across upper rack elevations.',
          '3. Dispatch maintenance to re-balance CRAC-02 variable speed fan drives for 4.2% energy savings.',
        ];
        actions.forEach((act) => {
          doc.text(act, 16, currentY);
          currentY += 6;
        });
      } else if (reportType === 'ashrae_thermal') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('2. ASHRAE TC 9.9 Thermal & Airflow Compliance Audit', 14, currentY);

        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          'Evaluation of cold-aisle server inlet temperatures against ASHRAE Class A1/A2 recommended envelopes (18.0°C to 27.0°C).',
          14,
          currentY,
          { maxWidth: 180 }
        );

        currentY += 12;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Facility Mean Ambient Temp: ${facility.ambientTempC.toFixed(1)}°C`, 20, currentY + 10);
        doc.text(`Ambient Relative Humidity: ${facility.ambientHumidityPercent.toFixed(1)}%`, 20, currentY + 19);
        doc.text(`Active CRAC Cooling Units: ${engine.coolingUnits.length} Units (N+1)`, 110, currentY + 10);
        doc.text(`Thermal Hotspots Detected: ${engine.racks.filter((r) => r.inletTempC > 27).length} Racks`, 110, currentY + 19);

        currentY += 36;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Rack Elevation Thermal Audit Breakdown', 14, currentY);

        currentY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Rack ID', 16, currentY);
        doc.text('Zone', 42, currentY);
        doc.text('Inlet Temp', 70, currentY);
        doc.text('Outlet Temp', 105, currentY);
        doc.text('Delta T', 140, currentY);
        doc.text('ASHRAE Status', 165, currentY);

        currentY += 4;
        doc.line(14, currentY, 196, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        engine.racks.slice(0, 8).forEach((r) => {
          const delta = (r.outletTempC - r.inletTempC).toFixed(1);
          const isCompliant = r.inletTempC >= 18 && r.inletTempC <= 27;
          doc.text(r.id, 16, currentY);
          doc.text(r.zone, 42, currentY);
          doc.text(`${r.inletTempC.toFixed(1)}°C`, 70, currentY);
          doc.text(`${r.outletTempC.toFixed(1)}°C`, 105, currentY);
          doc.text(`${delta}°C`, 140, currentY);
          doc.text(isCompliant ? 'PASS (A1)' : 'EXCEEDANCE', 165, currentY);
          currentY += 6;
        });
      } else if (reportType === 'power_tier4') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('3. Tier IV Critical Power & UPS Redundancy Audit', 14, currentY);

        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          'Verification of 2N electrical path redundancy, UPS battery string impedance, generator transfer ATS, and runtime buffer.',
          14,
          currentY,
          { maxWidth: 180 }
        );

        currentY += 12;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Electrical Architecture: 2N Concurrent Maintainable`, 20, currentY + 10);
        doc.text(`Utility Feeders: Feeder A & Feeder B (Dual Grid)`, 20, currentY + 19);
        doc.text(`UPS Total Modules: ${engine.upsUnits.length} Online Units`, 110, currentY + 10);
        doc.text(`Aggregate Battery Runtime: ~22.5 Minutes`, 110, currentY + 19);

        currentY += 36;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('UPS Unit Battery String & Load Assessment', 14, currentY);

        currentY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('UPS ID', 16, currentY);
        doc.text('Capacity (kW)', 46, currentY);
        doc.text('Load %', 80, currentY);
        doc.text('Battery SoH', 110, currentY);
        doc.text('Runtime', 144, currentY);
        doc.text('Status', 172, currentY);

        currentY += 4;
        doc.line(14, currentY, 196, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        engine.upsUnits.forEach((u) => {
          doc.text(u.id, 16, currentY);
          doc.text(`${u.capacityKva} kVA`, 46, currentY);
          doc.text(`${u.loadPercent.toFixed(1)}%`, 80, currentY);
          doc.text(`${u.batteryHealthPercent}%`, 110, currentY);
          doc.text(`${u.runtimeRemainingMinutes} min`, 144, currentY);
          doc.text(u.status.toUpperCase(), 172, currentY);
          currentY += 6;
        });
      } else if (reportType === 'rack_inventory') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('4. Data Center Server Fleet & 42U Rack Inventory Audit', 14, currentY);

        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Comprehensive physical asset snapshot of ${engine.racks.length} rack elevations across ${facility.zonesCount} facility zones.`,
          14,
          currentY,
          { maxWidth: 180 }
        );

        currentY += 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Rack ID', 16, currentY);
        doc.text('Zone', 42, currentY);
        doc.text('Power (kW)', 68, currentY);
        doc.text('U Occupancy', 100, currentY);
        doc.text('Health Score', 135, currentY);
        doc.text('Fleet Status', 168, currentY);

        currentY += 4;
        doc.line(14, currentY, 196, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        engine.racks.forEach((r) => {
          doc.text(r.id, 16, currentY);
          doc.text(r.zone, 42, currentY);
          doc.text(`${r.currentPowerKw.toFixed(1)} kW`, 68, currentY);
          doc.text(`${r.usedU}/${r.maxU} U`, 100, currentY);
          doc.text(`${r.healthScore}/100`, 135, currentY);
          doc.text(r.status.toUpperCase(), 168, currentY);
          currentY += 6;
        });
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('5. SLA Availability & Work Order Remediation Audit', 14, currentY);

        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          '99.999% Five-Nines uptime ledger, active incident MTTR analysis, and open work orders compliance certification.',
          14,
          currentY,
          { maxWidth: 180 }
        );

        currentY += 12;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('Uptime SLA Delivered: 99.9992% (Exceeds 5-Nines Commitment)', 20, currentY + 10);
        doc.text('Total Unscheduled Downtime: 0.00 Minutes', 20, currentY + 19);
        doc.text(`Active Work Orders: ${engine.workOrders.length} Dispatched`, 110, currentY + 10);
        doc.text('Mean Time to Detect (MTTD): 4.2 Seconds (AIOps)', 110, currentY + 19);

        currentY += 36;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Open Work Orders & SLA Due Windows', 14, currentY);

        currentY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('WO ID', 16, currentY);
        doc.text('Asset', 40, currentY);
        doc.text('Priority', 70, currentY);
        doc.text('Assigned Lead', 98, currentY);
        doc.text('SLA Window', 142, currentY);
        doc.text('Status', 170, currentY);

        currentY += 4;
        doc.line(14, currentY, 196, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        engine.workOrders.slice(0, 6).forEach((wo) => {
          doc.text(wo.id, 16, currentY);
          doc.text(wo.targetAsset.slice(0, 12), 40, currentY);
          doc.text(wo.severity.toUpperCase(), 70, currentY);
          doc.text(wo.assignedTo.split(' ')[0] + ' ' + (wo.assignedTo.split(' ')[1] || ''), 98, currentY);
          doc.text(`${wo.slaDueHours} Hours`, 142, currentY);
          doc.text(wo.status.toUpperCase(), 170, currentY);
          currentY += 6;
        });
      }

      // Bottom Digital Sign-Off Footer
      const footerY = 265;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, footerY, 196, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('DIGITAL COMPLIANCE ATTESTATION & SIGN-OFF', 14, footerY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Lead Data Center Facility Engineer: Marcus Vance, PE', 14, footerY + 11);
      doc.text('AIOps Autonomous Verification Hash: 0x9f82ab47c102', 14, footerY + 16);
      doc.text('Chief Sustainability & Compliance Officer: Dr. Evelyn Reed', 110, footerY + 11);
      doc.text('Confidential - For Internal Governance and Regulatory Audit Bodies', 110, footerY + 16);

      // Save PDF to file
      const fileName = `DC-Intelli_${reportType.toUpperCase()}_Audit_${facility.id}.pdf`;
      doc.save(fileName);
      showNotification(`Successfully generated and downloaded ${fileName}!`, 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showNotification(`Failed to generate PDF: ${err.message}`, 'info');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export JSON/CSV Raw Telemetry
  const exportRawData = (format: 'json' | 'csv') => {
    let content = '';
    let mimeType = 'text/plain';
    const filename = `DC-Intelli_${activeReportTab}_${facility.id}`;

    if (format === 'json') {
      content = JSON.stringify(
        {
          auditType: activeReportTab,
          timestamp: new Date().toISOString(),
          facility,
          racks: engine.racks,
          coolingUnits: engine.coolingUnits,
          upsUnits: engine.upsUnits,
          anomalies: engine.anomalies,
          predictions: engine.predictions,
          workOrders: engine.workOrders,
        },
        null,
        2
      );
      mimeType = 'application/json';
    } else {
      const rows = [
        ['Rack_ID', 'Zone', 'Inlet_Temp_C', 'Outlet_Temp_C', 'Power_kW', 'U_Occupancy', 'Health_Score', 'Status'],
        ...engine.racks.map((r) => [
          r.id,
          r.zone,
          r.inletTempC,
          r.outletTempC,
          r.currentPowerKw,
          `${r.usedU}/${r.maxU}`,
          r.healthScore,
          r.status,
        ]),
      ];
      content = rows.map((e) => e.join(',')).join('\n');
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Exported ${filename}.${format} successfully!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0c] border border-zinc-800/90 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                Executive Audit Reports & PDF Generator
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                On-Screen Audit Inspection • Certified ISO 50001 & ASHRAE TC 9.9 Reports • Vector PDF Downloads
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Facility Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer font-mono font-medium"
            >
              {engine.facilities.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-900 text-zinc-200">
                  {f.name} ({f.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer font-mono font-medium"
            >
              <option value="September 2026 (Live MTD)" className="bg-zinc-900">September 2026 (Live MTD)</option>
              <option value="August 2026 (Full Month)" className="bg-zinc-900">August 2026 (Full Month)</option>
              <option value="Q3 2026 Executive Summary" className="bg-zinc-900">Q3 2026 Executive Summary</option>
              <option value="Annual 2026 ISO Audit Pack" className="bg-zinc-900">Annual 2026 ISO Audit Pack</option>
            </select>
          </div>

          {/* AI Copilot Audit Review */}
          {onOpenCopilot && (
            <button
              onClick={() =>
                onOpenCopilot(
                  `Generate an executive summary and regulatory audit finding for ${facility.name} covering PUE (${facility.pue}), ASHRAE compliance, and Tier IV uptime.`
                )
              }
              className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Audit Copilot</span>
            </button>
          )}

          {/* Direct Print */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            title="Print Screen directly via Browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono flex items-center justify-between border shadow-lg transition-all animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-white px-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Report Category Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          {
            id: 'pue_sustainability',
            title: 'PUE & Sustainability',
            subtitle: 'ISO 50001 Energy Audit',
            icon: Zap,
            color: 'text-orange-400',
            border: 'border-orange-500/40',
            activeBg: 'bg-orange-950/30 text-orange-200 border-orange-500',
          },
          {
            id: 'ashrae_thermal',
            title: 'ASHRAE TC 9.9 Thermal',
            subtitle: 'Cold-Aisle Envelopes',
            icon: Thermometer,
            color: 'text-cyan-400',
            border: 'border-cyan-500/40',
            activeBg: 'bg-cyan-950/30 text-cyan-200 border-cyan-500',
          },
          {
            id: 'power_tier4',
            title: 'Tier IV Power & UPS',
            subtitle: '2N Redundancy & Battery SoH',
            icon: ShieldCheck,
            color: 'text-emerald-400',
            border: 'border-emerald-500/40',
            activeBg: 'bg-emerald-950/30 text-emerald-200 border-emerald-500',
          },
          {
            id: 'rack_inventory',
            title: 'Server Fleet Inventory',
            subtitle: '42U Elevations & Asset Health',
            icon: Server,
            color: 'text-indigo-400',
            border: 'border-indigo-500/40',
            activeBg: 'bg-indigo-950/30 text-indigo-200 border-indigo-500',
          },
          {
            id: 'sla_incidents',
            title: 'SLA & Five-Nines Uptime',
            subtitle: '99.999% SLA & Work Orders',
            icon: Activity,
            color: 'text-amber-400',
            border: 'border-amber-500/40',
            activeBg: 'bg-amber-950/30 text-amber-200 border-amber-500',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as ReportType)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? tab.activeBg
                  : 'bg-[#0a0a0c] border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold">Active</span>}
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold font-mono text-white leading-snug">{tab.title}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">{tab.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive On-Screen Report Document */}
      <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Document Watermark / Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/5 via-purple-500/5 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />

        {/* On-Screen Document Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase tracking-wide">
                Official Regulatory Audit Statement
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold">
                AIOps Verified
              </span>
            </div>

            <h2 className="text-2xl font-bold font-mono text-white mt-2">
              {activeReportTab === 'pue_sustainability' && 'Facility PUE & Energy Sustainability Certification Report'}
              {activeReportTab === 'ashrae_thermal' && 'ASHRAE TC 9.9 Thermal Envelope & Airflow Compliance Statement'}
              {activeReportTab === 'power_tier4' && 'Uptime Institute Tier IV Critical Power & UPS Battery Audit'}
              {activeReportTab === 'rack_inventory' && '42U Server Fleet Physical Inventory & U-Space Density Ledger'}
              {activeReportTab === 'sla_incidents' && 'SLA Availability (99.999%) & Remediation Compliance Ledger'}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-zinc-400">
              <span>Facility: <strong className="text-zinc-200">{facility.name}</strong></span>
              <span>•</span>
              <span>Location: <strong className="text-zinc-200">{facility.location}</strong></span>
              <span>•</span>
              <span>Classification: <strong className="text-orange-400">{facility.tier} Concurrent Maintainable</strong></span>
              <span>•</span>
              <span>Audit Period: <strong className="text-zinc-200">{selectedTimeframe}</strong></span>
            </div>
          </div>

          {/* Quick PDF & Raw Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => generatePdfReport(activeReportTab)}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF Document'}</span>
            </button>

            <button
              onClick={() => exportRawData('csv')}
              className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportRawData('json')}
              className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Tab 1: PUE & Sustainability Audit Screen */}
        {activeReportTab === 'pue_sustainability' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Live Facility PUE</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{facility.pue.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Benchmark Target: &lt; 1.45</div>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Total Facility Power</div>
                <div className="text-2xl font-bold font-mono text-orange-400 mt-1">{facility.totalFacilityPowerKw.toFixed(1)} kW</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">IT Load: {facility.itEquipmentPowerKw.toFixed(1)} kW</div>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Cooling Power Overhead</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{facility.coolingPowerKw.toFixed(1)} kW</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{((facility.coolingPowerKw / facility.totalFacilityPowerKw) * 100).toFixed(1)}% of total energy</div>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Monthly Scope 2 Carbon</div>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                  {((facility.totalFacilityPowerKw * 24 * 30 * facility.carbonIntensityGramsPerKwh) / 1000000).toFixed(1)} MT
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{facility.carbonIntensityGramsPerKwh} g CO2/kWh grid</div>
              </div>
            </div>

            {/* Audit Findings Table */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ISO 50001 Energy Management Compliance Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                      <th className="p-3">Audit Metric</th>
                      <th className="p-3">Measured Telemetry</th>
                      <th className="p-3">Compliance Standard</th>
                      <th className="p-3">Variance / Delta</th>
                      <th className="p-3">Auditor Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    <tr>
                      <td className="p-3 font-semibold text-white">Annualized Average PUE</td>
                      <td className="p-3 text-emerald-400 font-bold">{facility.pue.toFixed(2)}</td>
                      <td className="p-3">&lt; 1.45 (Tier IV Standard)</td>
                      <td className="p-3 text-emerald-400">-0.05 (Favorable)</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">COMPLIANT</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Chiller Plant COP Efficiency</td>
                      <td className="p-3 text-cyan-400 font-bold">4.85 COP</td>
                      <td className="p-3">&gt; 4.20 COP (ASHRAE 90.4)</td>
                      <td className="p-3 text-emerald-400">+0.65 COP</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">COMPLIANT</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Transformer & UPS Efficiency</td>
                      <td className="p-3 text-orange-400 font-bold">96.8%</td>
                      <td className="p-3">&gt; 95.0% Double Conversion</td>
                      <td className="p-3 text-emerald-400">+1.8%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">COMPLIANT</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Renewable Energy Match (PPA)</td>
                      <td className="p-3 text-purple-400 font-bold">78.5%</td>
                      <td className="p-3">&gt; 70.0% Corporate Net-Zero</td>
                      <td className="p-3 text-emerald-400">+8.5%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">EXCEEDS GOAL</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-xl space-y-2">
              <div className="text-xs font-bold font-mono text-orange-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                Auditor Corrective Action Directives:
              </div>
              <ul className="text-xs font-mono text-zinc-300 space-y-1.5 pl-4 list-disc">
                <li>Optimize CRAC-02 variable frequency drive setpoints to eliminate 14.2 kW of localized overcooling in Zone A.</li>
                <li>Verify containment sealing along cold aisle Row 2 to ensure thermal bypass remains below 3.0%.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: ASHRAE Thermal Compliance Audit Screen */}
        {activeReportTab === 'ashrae_thermal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">ASHRAE Standard</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-1">TC 9.9 Class A1 / A2</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Recommended: 18.0°C – 27.0°C</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Cold-Aisle Mean Inlet</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">22.4°C (Optimal)</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Allowable Range Respected</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Thermal Compliance Rate</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">98.2% compliant</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">1 minor localized rack delta</div>
              </div>
            </div>

            {/* Racks Thermal Table */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-white">42U Elevation Inlet / Return Temperature Verification</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                      <th className="p-3">Rack ID</th>
                      <th className="p-3">Zone</th>
                      <th className="p-3">Inlet Temp (°C)</th>
                      <th className="p-3">Outlet Temp (°C)</th>
                      <th className="p-3">Delta T</th>
                      <th className="p-3">ASHRAE Envelope Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {racksInFacility.map((rack) => {
                      const delta = (rack.outletTempC - rack.inletTempC).toFixed(1);
                      const isNormal = rack.inletTempC >= 18 && rack.inletTempC <= 27;
                      return (
                        <tr key={rack.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 font-bold text-white">{rack.id}</td>
                          <td className="p-3 text-zinc-400">{rack.zone}</td>
                          <td className="p-3 font-semibold text-emerald-400">{rack.inletTempC.toFixed(1)}°C</td>
                          <td className="p-3 text-orange-400">{rack.outletTempC.toFixed(1)}°C</td>
                          <td className="p-3 text-zinc-300">{delta}°C</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                isNormal
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {isNormal ? 'PASS (ASHRAE A1)' : 'ELEVATED INLET'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tier IV Power & UPS Redundancy Audit */}
        {activeReportTab === 'power_tier4' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Architecture</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">2N Concurrent Maintainable</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Dual active distribution paths</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Online UPS Capacity</div>
                <div className="text-lg font-bold font-mono text-orange-400 mt-1">1,200 kW Total (3 Units)</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Load balanced at 70.2%</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Battery Reserve Buffer</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-1">22.5 Minutes Full Load</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ATS Generator Transfer: 8.5 sec</div>
              </div>
            </div>

            {/* UPS Table */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-white">UPS Battery Modules & Internal Impedance Verification</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                      <th className="p-3">UPS Unit</th>
                      <th className="p-3">Capacity</th>
                      <th className="p-3">Active Load</th>
                      <th className="p-3">Battery SoH (%)</th>
                      <th className="p-3">Runtime Buffer</th>
                      <th className="p-3">Redundancy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {engine.upsUnits.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/30">
                        <td className="p-3 font-bold text-white">{u.id}</td>
                        <td className="p-3">{u.capacityKva} kVA</td>
                        <td className="p-3 text-orange-400">{u.loadPercent.toFixed(1)}% ({u.currentLoadKw.toFixed(0)} kW)</td>
                        <td className="p-3 font-bold text-emerald-400">{u.batteryHealthPercent}% SoH</td>
                        <td className="p-3 text-cyan-400 font-semibold">{u.runtimeRemainingMinutes} min</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Server Fleet & 42U Rack Inventory */}
        {activeReportTab === 'rack_inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Total Racks Monitored</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{engine.racks.length}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Across {facility.zonesCount} Zones</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Total Server Chassis</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{facility.serversCount}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">100% BMC Redfish connected</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">U-Space Occupancy</div>
                <div className="text-2xl font-bold font-mono text-orange-400 mt-1">74.2%</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">130 U available capacity</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Mean Asset Health</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">94.8 / 100</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">MTBF &gt; 85,000 Hours</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-white">Asset Elevation Ledger & Power Draw</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                      <th className="p-3">Rack ID</th>
                      <th className="p-3">Zone</th>
                      <th className="p-3">Power Draw (kW)</th>
                      <th className="p-3">U Space</th>
                      <th className="p-3">Health Score</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {engine.racks.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-800/30">
                        <td className="p-3 font-bold text-white">{r.id}</td>
                        <td className="p-3 text-zinc-400">{r.zone}</td>
                        <td className="p-3 text-orange-400 font-semibold">{r.currentPowerKw.toFixed(1)} kW</td>
                        <td className="p-3">{r.usedU} / {r.maxU} U</td>
                        <td className="p-3 font-bold text-emerald-400">{r.healthScore}/100</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SLA & Five-Nines Uptime Ledger */}
        {activeReportTab === 'sla_incidents' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Delivered Uptime SLA</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">99.9992%</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Commitment: 99.999% (Five-Nines)</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Mean Time to Remediate (MTTR)</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">18.4 Minutes</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">AIOps Automated Dispatch</div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="text-[11px] text-zinc-400 font-mono">Active Work Orders</div>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{engine.workOrders.length}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">100% within SLA Due Window</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-white">Work Order Resolution & Compliance Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Target Asset</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Assigned Lead</th>
                      <th className="p-3">SLA Due Window</th>
                      <th className="p-3">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {engine.workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-zinc-800/30">
                        <td className="p-3 font-bold text-white">{wo.id}</td>
                        <td className="p-3 font-semibold text-orange-400">{wo.targetAsset}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              wo.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : wo.severity === 'high'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {wo.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300">{wo.assignedTo}</td>
                        <td className="p-3 text-zinc-400">{wo.slaDueHours} Hours</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-[10px] font-bold">
                            {wo.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Digital Compliance Sign-Off Footer */}
        <div className="border-t border-zinc-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-mono text-white">Digital Cryptographic Audit Signature Verified</div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  SHA-256 Digest: 0x8a72cf109b43e8d2... | Issued by DC-Intelli AIOps Autonomous Certifier
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generatePdfReport(activeReportTab)}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Generate Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
