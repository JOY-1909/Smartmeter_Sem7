import React from 'react';
import { LiveMetricGrid } from '../components/realtime/LiveMetricGrid';
import { LiveWaveformStream } from '../components/realtime/LiveWaveformStream';
import { useEnergyData } from '../context/EnergyDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Cpu, 
  Server, 
  Activity, 
  ChevronRight, 
  AlertTriangle, 
  Download, 
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const RealtimeMonitorPage = () => {
  const { meter, alerts, latestTelemetry } = useEnergyData();
  const outletContext = useOutletContext();

  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Top Banner Context Card */}
      <div className="bg-white rounded border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Grid Telemetry & Control Room Monitor
            </h1>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200">
              Primary Feeder
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time Class 1.0 smart meter electrical parameters, RMS calculations, and power quality surveillance.
          </p>
        </div>

        {/* Substation Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-400 block text-[10px]">Sanctioned Load</span>
            <span className="font-bold text-slate-800 font-mono">{meter.sanctionedLoadKw} kW (1-Phase)</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-400 block text-[10px]">Substation Feeder</span>
            <span className="font-bold text-slate-800 font-mono">{meter.substation}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-400 block text-[10px]">Firmware / Security</span>
            <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {meter.firmwareVersion}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Core Metric Cards with Sparklines */}
      <LiveMetricGrid />

      {/* Live Waveform Stream Chart */}
      <LiveWaveformStream />

      {/* Quick Alerts & Anomaly Preview Strip */}
      <div className="bg-white rounded border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Electrical Excursions & Alarms
            </h4>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            View Full Alert Log ({alerts.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 text-center">
            No active grid threshold excursions detected. System nominal.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <StatusBadge status={alert.severity} size="sm" />
                  <div>
                    <span className="font-semibold text-slate-800">{alert.title}</span>
                    <span className="text-slate-500 ml-2">{alert.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Value: <strong className="text-slate-700">{alert.measuredValue}</strong></span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
