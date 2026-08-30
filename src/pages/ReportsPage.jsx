import React, { useState } from 'react';
import { ReportBuilder } from '../components/reports/ReportBuilder';
import { ReportPreviewDoc } from '../components/reports/ReportPreviewDoc';
import { ReportHistoryTable } from '../components/reports/ReportHistoryTable';

export const ReportsPage = () => {
  const [extraReports, setExtraReports] = useState([]);

  const handleReportGenerated = (newReport) => {
    setExtraReports(prev => [newReport, ...prev]);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded border border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Official Energy Consumption & Compliance Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, preview, and download official certified PDF energy audit statements and power quality logs.
        </p>
      </div>

      {/* 1. Report Builder Controls */}
      <ReportBuilder onReportGenerated={handleReportGenerated} />

      {/* 2. Visual Document Sheet Preview */}
      <ReportPreviewDoc />

      {/* 3. Historical Reports Archive Table */}
      <ReportHistoryTable extraReports={extraReports} />
    </div>
  );
};
