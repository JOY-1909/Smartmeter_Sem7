import React, { useState } from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Pause, 
  Play, 
  AlertTriangle, 
  Zap, 
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SystemStatusBanner = ({ onOpenThresholdModal }) => {
  const {
    latestTelemetry,
    overallSystemStatus,
    isConnected,
    isPaused,
    togglePause,
    triggerAnomaly,
    activeAnomaly,
    isMock,
    alerts,
    meter
  } = useEnergyData();

  const [showDevControls, setShowDevControls] = useState(false);

  const activeAlarmsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlarmsCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const bannerBg = {
    ONLINE: 'bg-white border-slate-200',
    WARNING: 'bg-amber-50/70 border-amber-300',
    FAULT: 'bg-rose-50/70 border-rose-300',
    OFFLINE: 'bg-slate-100 border-slate-300'
  }[overallSystemStatus] || 'bg-white border-slate-200';

  return (
    <div className={`rounded border ${bannerBg} p-3.5 mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Overall System Health & Telemetry Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Telemetry:
            </span>
            <StatusBadge
              status={overallSystemStatus}
              label={
                overallSystemStatus === 'FAULT'
                  ? 'GRID FAULT / EXCURSION'
                  : overallSystemStatus === 'WARNING'
                  ? 'OPERATIONAL WARNING'
                  : 'GRID ONLINE (STABLE)'
              }
              size="md"
            />
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
            <span className="text-slate-400">Meter:</span>
            <span className="font-mono font-medium text-slate-700">{meter.meterId}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Frequency:</span>
            <span className={`font-mono font-medium ${Math.abs(latestTelemetry.frequency - 50.0) > 0.3 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
              {latestTelemetry.frequency} Hz
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">THD:</span>
            <span className="font-mono font-medium text-slate-700">{latestTelemetry.thdPercent}%</span>
          </div>
        </div>

        {/* Right: Actions, Connection Pill & Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Active alarms badge */}
          {activeAlarmsCount > 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
              criticalAlarmsCount > 0
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeAlarmsCount} Active {activeAlarmsCount === 1 ? 'Alarm' : 'Alarms'}</span>
            </div>
          )}

          {/* Pause / Resume Live Stream */}
          <button
            onClick={togglePause}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isPaused
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isPaused ? "Resume real-time data flow" : "Pause live stream"}
          >
            {isPaused ? <Play className="w-3 h-3 text-amber-700" /> : <Pause className="w-3 h-3 text-slate-500" />}
            <span>{isPaused ? 'Paused' : 'Live Stream'}</span>
          </button>

          {/* Threshold Settings Trigger */}
          {onOpenThresholdModal && (
            <button
              onClick={onOpenThresholdModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Configure threshold alert limits"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Thresholds</span>
            </button>
          )}

          {/* Anomaly simulation dropdown toggle (Dev/Test helper) */}
          <button
            onClick={() => setShowDevControls(!showDevControls)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
            title="Simulate grid fault injection"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="hidden lg:inline">Inject Anomaly</span>
            {showDevControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Anomaly Injection Panel (Useful for interactive testing of real-time alarms) */}
      {showDevControls && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wide flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Simulate Grid Fault (6s):
          </span>
          <button
            onClick={() => triggerAnomaly('overvoltage')}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeAnomaly === 'overvoltage'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300'
            }`}
          >
            Surge &gt;258V
          </button>
          <button
            onClick={() => triggerAnomaly('undervoltage')}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeAnomaly === 'undervoltage'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300'
            }`}
          >
            Sag &lt;196V
          </button>
          <button
            onClick={() => triggerAnomaly('overcurrent')}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeAnomaly === 'overcurrent'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300'
            }`}
          >
            Overcurrent 38.6A
          </button>
          <button
            onClick={() => triggerAnomaly('low_pf')}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeAnomaly === 'low_pf'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300'
            }`}
          >
            Low PF (0.76)
          </button>
          <button
            onClick={() => triggerAnomaly('freq_dip')}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeAnomaly === 'freq_dip'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300'
            }`}
          >
            Freq Dip (49.3Hz)
          </button>
          {activeAnomaly && (
            <span className="text-xs font-semibold text-rose-600 animate-pulse ml-auto">
              Injecting [{activeAnomaly.toUpperCase()}] event...
            </span>
          )}
        </div>
      )}
    </div>
  );
};
