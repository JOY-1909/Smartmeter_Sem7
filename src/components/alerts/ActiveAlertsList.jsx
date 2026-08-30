import React from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { StatusBadge } from '../common/StatusBadge';
import { AlertTriangle, AlertOctagon, Info, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const ActiveAlertsList = () => {
  const { alerts, acknowledgeAlertById, resolveAlertById, dismissAlertById, clearAllAlerts } = useEnergyData();

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'acknowledged');

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Active Grid Alarms & Threshold Excursions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold triggers requiring operator acknowledgement or dispatch action.
          </p>
        </div>

        {activeAlerts.length > 0 && (
          <button
            onClick={clearAllAlerts}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded border border-slate-100">
          <Check className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <strong className="text-slate-800 block">All Grid Parameters Normal</strong>
          <span>No unacknowledged voltage, current, or power quality excursions in the live queue.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded border transition-all ${
                  isCritical
                    ? 'bg-rose-50/40 border-rose-200 text-rose-950'
                    : isWarning
                    ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                    : 'bg-sky-50/40 border-sky-200 text-sky-950'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCritical ? (
                        <AlertOctagon className="w-5 h-5 text-rose-600" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Info className="w-5 h-5 text-sky-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <StatusBadge status={alert.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-700 mt-1">
                        {alert.description}
                      </p>

                      {/* Threshold telemetry comparison */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] font-mono text-slate-600">
                        <span>Metric: <strong className="text-slate-900 font-sans">{alert.metric}</strong></span>
                        <span>Measured: <strong className="text-rose-700">{alert.measuredValue}</strong></span>
                        <span>Limit: <strong className="text-slate-700">{alert.thresholdValue}</strong></span>
                        <span className="text-slate-400 font-sans">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {alert.recommendation && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200/60 font-sans">
                          <strong>Remedial Advice:</strong> {alert.recommendation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => acknowledgeAlertById(alert.id)}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-xs"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      onClick={() => resolveAlertById(alert.id)}
                      className="px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
                    >
                      Resolve
                    </button>

                    <button
                      onClick={() => dismissAlertById(alert.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
