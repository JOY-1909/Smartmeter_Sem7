import React, { useState } from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { StatusBadge } from '../common/StatusBadge';
import { exportToCSV } from '../../services/exportService';
import { Filter, Download, Search } from 'lucide-react';

export const AlertHistoryTable = () => {
  const { alerts, acknowledgeAlertById, resolveAlertById } = useEnergyData();

  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        alert.metric.toLowerCase().includes(q) ||
        alert.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    const rows = filteredAlerts.map(a => ({
      AlertId: a.id,
      Type: a.type,
      Title: a.title,
      Severity: a.severity,
      Status: a.status,
      Metric: a.metric,
      MeasuredValue: a.measuredValue,
      ThresholdLimit: a.thresholdValue,
      Timestamp: new Date(a.timestamp).toISOString(),
      Description: a.description
    }));
    exportToCSV(rows, 'gridsense_alert_logs.csv');
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Comprehensive Alarm Audit & Event History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Filterable historical archive of all transient electrical events and trip warnings.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Alert Log CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 w-48">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alarm or metric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 outline-none w-full"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-medium outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Notices</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredAlerts.length} of {alerts.length} events
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="py-2.5 px-3">Severity / ID</th>
              <th className="py-2.5 px-3">Alarm Event</th>
              <th className="py-2.5 px-3">Metric & Limit</th>
              <th className="py-2.5 px-3">Measured</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No alerts match your active filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="space-y-0.5">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="block font-mono text-[10px] text-slate-400">{alert.id}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block">{alert.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{alert.description}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-medium">{alert.metric}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{alert.thresholdValue}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {alert.measuredValue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={alert.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {alert.status === 'active' ? (
                      <button
                        onClick={() => acknowledgeAlertById(alert.id)}
                        className="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700"
                      >
                        Ack
                      </button>
                    ) : alert.status === 'acknowledged' ? (
                      <button
                        onClick={() => resolveAlertById(alert.id)}
                        className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-medium"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Closed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
