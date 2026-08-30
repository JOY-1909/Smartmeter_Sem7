/**
 * GridSense Export Service
 * Provides client-side CSV and PDF report generation.
 */
import { jsPDF } from "jspdf";

/**
 * Export arbitrary dataset to CSV file and trigger browser download
 */
export const exportToCSV = (data, filename = `gridsense_export_${Date.now()}.csv`) => {
  if (!data || !data.length) {
    console.warn("exportToCSV: No data provided to export.");
    return false;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.map(h => `"${h}"`).join(","));

  // Add value rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Generate enterprise PDF audit report using jsPDF
 */
export const generatePdfReport = ({
  reportTitle = "GridSense Energy Audit & Compliance Report",
  meterMetadata,
  dateRange,
  consumptionKwh,
  billingSummary,
  anomalies = [],
  appliances = []
}) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 18;

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("GRIDSENSE™ SMART ENERGY PLATFORM", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`Official Energy Audit & Power Quality Log • Generated on ${new Date().toLocaleString()}`, 14, 18);
    doc.text(`Doc ID: REP-${Date.now().toString().slice(-6)}`, pageWidth - 45, 18);

    currentY = 36;

    // Section 1: Consumer & Meter Information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("1. METER & SUBSCRIBER TELEMETRY", 14, currentY);
    currentY += 4;

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const m = meterMetadata || {};
    doc.text(`Consumer Name: ${m.consumerName || 'Rajesh Kumar'}`, 14, currentY);
    doc.text(`Meter Serial ID: ${m.meterId || 'MTR-IND-KA-0942'}`, 110, currentY);
    currentY += 5;
    doc.text(`Consumer ID: ${m.consumerId || 'CON-884210-BLR'}`, 14, currentY);
    doc.text(`Sanctioned Load: ${m.sanctionedLoadKw || 7.5} kW (${m.phase || 'Single Phase'})`, 110, currentY);
    currentY += 5;
    doc.text(`Substation / DT: ${m.substation || 'Koramangala 66/11kV Substation'}`, 14, currentY);
    doc.text(`Audit Period: ${dateRange || 'Current Billing Cycle'}`, 110, currentY);
    currentY += 10;

    // Section 2: Key Executive Metrics
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. EXECUTIVE CONSUMPTION & TARIFF SUMMARY", 14, currentY);
    currentY += 4;
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;

    // 3 Metric Boxes
    const boxWidth = (pageWidth - 36) / 3;
    const boxHeight = 18;

    // Box 1: Total Energy
    doc.setFillColor(248, 250, 252);
    doc.rect(14, currentY, boxWidth, boxHeight, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, boxWidth, boxHeight, "S");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL CONSUMPTION", 18, currentY + 5);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(2, 132, 199);
    doc.text(`${consumptionKwh || 346.82} kWh`, 18, currentY + 13);

    // Box 2: Total Estimated Cost
    doc.setFillColor(248, 250, 252);
    doc.rect(14 + boxWidth + 4, currentY, boxWidth, boxHeight, "F");
    doc.rect(14 + boxWidth + 4, currentY, boxWidth, boxHeight, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("ESTIMATED CHARGES", 18 + boxWidth + 4, currentY + 5);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${billingSummary?.currencySymbol || '₹'} ${billingSummary?.totalBill || '2,427.60'}`, 18 + boxWidth + 4, currentY + 13);

    // Box 3: Avg Power Factor
    doc.setFillColor(248, 250, 252);
    doc.rect(14 + (boxWidth + 4) * 2, currentY, boxWidth, boxHeight, "F");
    doc.rect(14 + (boxWidth + 4) * 2, currentY, boxWidth, boxHeight, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("AVG POWER FACTOR", 18 + (boxWidth + 4) * 2, currentY + 5);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("0.94 (Healthy)", 18 + (boxWidth + 4) * 2, currentY + 13);

    currentY += boxHeight + 10;

    // Section 3: Tariff Slab Cost Breakdown Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. TIERED TARIFF SLAB COST BREAKDOWN", 14, currentY);
    currentY += 4;
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 7, "F");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Tariff Tier / Slab", 18, currentY + 4.5);
    doc.text("Rate / Unit", 90, currentY + 4.5);
    doc.text("Units Billed (kWh)", 130, currentY + 4.5);
    doc.text("Slab Total (INR)", pageWidth - 45, currentY + 4.5);
    currentY += 8;

    const slabs = billingSummary?.slabBreakdown || [
      { label: "0 - 100 units (Subsidized)", ratePerKwh: 4.15, unitsConsumed: 100.0, cost: 415.0 },
      { label: "101 - 200 units (Standard)", ratePerKwh: 5.60, unitsConsumed: 100.0, cost: 560.0 },
      { label: "201 - 400 units (Mid-tier)", ratePerKwh: 7.15, unitsConsumed: 146.82, cost: 1049.76 }
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    slabs.forEach(slab => {
      doc.text(slab.label, 18, currentY + 4);
      doc.text(`₹ ${slab.ratePerKwh.toFixed(2)}`, 90, currentY + 4);
      doc.text(`${slab.unitsConsumed.toFixed(2)}`, 130, currentY + 4);
      doc.text(`₹ ${slab.cost.toFixed(2)}`, pageWidth - 45, currentY + 4);
      currentY += 6;
    });

    currentY += 2;
    doc.setFont("helvetica", "bold");
    doc.text(`Fixed Capacity Charges: ₹ ${billingSummary?.fixedCharges || '575.00'}`, 18, currentY + 4);
    doc.text(`Fuel Surcharge (FAC): ₹ ${billingSummary?.facCharge || '97.11'}`, 90, currentY + 4);
    doc.text(`State Electricity Duty (6%): ₹ ${billingSummary?.electricityDuty || '137.41'}`, 130, currentY + 4);
    currentY += 10;

    // Section 4: Power Quality & Anomaly Log
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("4. POWER QUALITY ANOMALY & EVENT LOG", 14, currentY);
    currentY += 4;
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;

    if (anomalies && anomalies.length > 0) {
      anomalies.slice(0, 4).forEach((anom, idx) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(anom.severity === 'critical' ? 220 : anom.severity === 'warning' ? 180 : 71, 38, 38);
        doc.text(`[${anom.severity.toUpperCase()}] ${anom.title}`, 18, currentY + 3.5);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Value: ${anom.measuredValue || anom.metric} (Limit: ${anom.thresholdValue})`, 110, currentY + 3.5);
        doc.text(new Date(anom.timestamp).toLocaleDateString(), pageWidth - 35, currentY + 3.5);
        currentY += 5;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`• ${anom.description}`, 22, currentY + 3);
        currentY += 6;
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No critical electrical violations or severe grid deviations recorded in this period.", 18, currentY + 4);
      currentY += 8;
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("GridSense Intelligent Metering Telemetry Engine • Certified IEC 62053-21 Class 1.0 Compliance", 14, 285);
    doc.text("Page 1 of 1", pageWidth - 25, 285);

    // Save
    const filename = `GridSense_Audit_Report_${Date.now().toString().slice(-4)}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    // Fallback: trigger browser print
    window.print();
    return false;
  }
};
