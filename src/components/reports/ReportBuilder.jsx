import React, { useState } from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { useTariff } from '../../context/TariffContext';
import { generatePdfReport, exportToCSV } from '../../services/exportService';
import { generateHistoricalData, NILM_APPLIANCE_DATA } from '../../services/mockData';
import { FileText, Download, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';

export const ReportBuilder = ({ onReportGenerated }) => {
  const { meter, latestTelemetry, alerts } = useEnergyData();
  const { computeBill } = useTariff();

  const [dateRangePreset, setDateRangePreset] = useState('2026-08');
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [includeSlabs, setIncludeSlabs] = useState(true);
  const [includeNILM, setIncludeNILM] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const billDetails = computeBill(latestTelemetry.energyKwh);

    setTimeout(() => {
      const success = generatePdfReport({
        reportTitle: `Official Energy Audit Report (${dateRangePreset})`,
        meterMetadata: meter,
        dateRange: dateRangePreset === '2026-08' ? 'August 1 - August 30, 2026' : 'July 1 - July 31, 2026',
        consumptionKwh: latestTelemetry.energyKwh,
        billingSummary: billDetails,
        anomalies: includeAnomalies ? alerts : [],
        appliances: includeNILM ? NILM_APPLIANCE_DATA : []
      });

      setIsGenerating(false);
      if (success) {
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 3000);
        onReportGenerated?.({
          id: `REP-${Date.now().toString().slice(-6)}`,
          title: `Energy Audit Report (${dateRangePreset})`,
          dateRange: dateRangePreset === '2026-08' ? 'Aug 1 - Aug 30, 2026' : 'Jul 1 - Jul 31, 2026',
          generatedAt: new Date().toLocaleString(),
          totalConsumptionKwh: latestTelemetry.energyKwh,
          totalCostInr: billDetails.totalBill,
          peakDemandKw: 6.84,
          averagePowerFactor: 0.94,
          anomaliesCount: alerts.length,
          fileFormat: 'PDF',
          fileSize: '1.2 MB'
        });
      }
    }, 400);
  };

  const handleExportCSV = () => {
    const historical = generateHistoricalData('30d', '1d');
    exportToCSV(historical, `gridsense_audit_${dateRangePreset}.csv`);
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Generate Official Energy Audit Report</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Produces a certified IEC Class 1.0 energy audit document with consumption analytics and power quality logs.
          </p>
        </div>

        {successNotice && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Report generated successfully!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Range and Options */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Audit Period:
            </label>
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-sky-500"
            >
              <option value="2026-08">August 2026 (Current Billing Cycle - 346.8 kWh)</option>
              <option value="2026-07">July 2026 (Previous Cycle - 382.4 kWh)</option>
              <option value="2026-Q2">Q2 2026 (Quarterly Comprehensive Audit)</option>
              <option value="custom">Custom Date Range Filter</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Sections to Include in Audit:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSlabs}
                  onChange={(e) => setIncludeSlabs(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>Tiered Tariff Slab Breakdown & Fixed Charge Itemization</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnomalies}
                  onChange={(e) => setIncludeAnomalies(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>Power Quality Anomaly & Excursion Log (Overvoltage/Sag/PF)</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNILM}
                  onChange={(e) => setIncludeNILM(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>NILM Appliance Disaggregation & Standby Vampire Drain</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Export action box */}
        <div className="bg-slate-50 rounded border border-slate-200 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Output Format & Dispatch
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export high-resolution printable PDF with utility letterhead, or download raw telemetry records in CSV for spreadsheet analysis.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-2.5">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Compiling PDF...' : 'Download Certified PDF'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
