import React from 'react';
import { SAMPLE_REPORT_HISTORY } from '../../services/mockData';
import { generatePdfReport } from '../../services/exportService';
import { useEnergyData } from '../../context/EnergyDataContext';
import { useTariff } from '../../context/TariffContext';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

export const ReportHistoryTable = ({ extraReports = [] }) => {
  const { meter, latestTelemetry, alerts } = useEnergyData();
  const { computeBill } = useTariff();

  const allReports = [...extraReports, ...SAMPLE_REPORT_HISTORY];

  const handleDownload = (rep) => {
    generatePdfReport({
      reportTitle: rep.title,
      meterMetadata: meter,
      dateRange: rep.dateRange,
      consumptionKwh: rep.totalConsumptionKwh,
      billingSummary: computeBill(rep.totalConsumptionKwh),
      anomalies: alerts
    });
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Generated Reports Archive & Compliance Logs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Previous monthly statements and operational audits stored on the server.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="py-2.5 px-3">Report Title / ID</th>
              <th className="py-2.5 px-3">Date Range</th>
              <th className="py-2.5 px-3">Energy (kWh)</th>
              <th className="py-2.5 px-3">Cost (INR)</th>
              <th className="py-2.5 px-3">Anomalies</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {allReports.map(rep => (
              <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-sans">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{rep.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rep.id} • {rep.fileSize}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-600 font-sans">
                  {rep.dateRange}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {rep.totalConsumptionKwh} kWh
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  ₹{rep.totalCostInr.toLocaleString()}
                </td>
                <td className="py-3 px-3 font-sans">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    rep.anomaliesCount > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {rep.anomaliesCount} logged
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => handleDownload(rep)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
