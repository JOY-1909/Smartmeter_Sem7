import React from 'react';
import { ActiveAlertsList } from '../components/alerts/ActiveAlertsList';
import { AlertHistoryTable } from '../components/alerts/AlertHistoryTable';
import { AnomalyDiagnostics } from '../components/alerts/AnomalyDiagnostics';

export const AlertsLogPage = () => {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded border border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Central Grid Alarms, Threshold Excursions & Diagnostics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time incident response management, operator acknowledgements, and historical event analysis.
        </p>
      </div>

      {/* 1. Active Alarm Queue with 1-click ack/resolve */}
      <ActiveAlertsList />

      {/* 2. Comprehensive Historical Filter Table */}
      <AlertHistoryTable />

      {/* 3. Diagnostic & Remediation Guidelines */}
      <AnomalyDiagnostics />
    </div>
  );
};
