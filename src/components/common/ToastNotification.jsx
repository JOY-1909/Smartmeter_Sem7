import React from 'react';
import { AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useEnergyData } from '../../context/EnergyDataContext';

export const ToastNotificationContainer = () => {
  const { activeToasts, removeToast } = useEnergyData();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {activeToasts.map(toast => {
        const isCritical = toast.severity === 'critical';
        const isWarning = toast.severity === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded border p-3.5 shadow-sm transition-all duration-300 flex items-start gap-3 ${
              isCritical
                ? 'border-rose-300 bg-rose-50/40 text-rose-950'
                : isWarning
                ? 'border-amber-300 bg-amber-50/40 text-amber-950'
                : 'border-sky-300 bg-sky-50/40 text-sky-950'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCritical ? (
                <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <Info className="w-5 h-5 text-sky-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wide">
                  {toast.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-snug">
                {toast.description}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              aria-label="Dismiss alert toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
