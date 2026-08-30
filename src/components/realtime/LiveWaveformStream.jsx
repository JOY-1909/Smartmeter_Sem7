import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useEnergyData } from '../../context/EnergyDataContext';
import { Play, Pause, RefreshCw, Eye } from 'lucide-react';

export const LiveWaveformStream = () => {
  const { liveStreamHistory, isPaused, togglePause, isConnected } = useEnergyData();

  const [visibleMetrics, setVisibleMetrics] = useState({
    power: true,
    voltage: false,
    current: true,
  });

  const toggleMetric = (key) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom clean tooltip for control room
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow border border-slate-700 font-mono">
        <div className="text-slate-400 text-[10px] mb-1 font-sans">{label} (Live Telemetry)</div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5" style={{ color: item.color }}>
            <span className="font-sans text-[11px]">{item.name}:</span>
            <span className="font-bold">{item.value} {item.unit || ''}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-4 mt-5">
      {/* Header & Metric Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Rolling Telemetry Stream</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded font-normal">
              1s Resolution
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous 60-second moving window for active power, voltage and current loads.
          </p>
        </div>

        {/* Channel toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => toggleMetric('power')}
              className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                visibleMetrics.power
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              • Power (kW)
            </button>
            <button
              onClick={() => toggleMetric('voltage')}
              className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                visibleMetrics.voltage
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              • Voltage (V)
            </button>
            <button
              onClick={() => toggleMetric('current')}
              className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                visibleMetrics.current
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              • Current (A)
            </button>
          </div>

          <button
            onClick={togglePause}
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            title={isPaused ? "Resume stream" : "Pause stream"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Recharts Live Line Chart */}
      <div className="h-64 w-full">
        {liveStreamHistory.length < 2 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            Buffering initial stream telemetry...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveStreamHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              {visibleMetrics.voltage && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#2563eb' }}
                  axisLine={{ stroke: '#93c5fd' }}
                  tickLine={false}
                  domain={[190, 270]}
                />
              )}
              <Tooltip content={<CustomTooltip />} />

              {visibleMetrics.power && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="activePowerKw"
                  name="Active Power"
                  unit="kW"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {visibleMetrics.current && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="current"
                  name="Load Current"
                  unit="A"
                  stroke="#7c3aed"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {visibleMetrics.voltage && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="voltage"
                  name="Line Voltage"
                  unit="V"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Buffer: {liveStreamHistory.length} frames</span>
        <span>Sampling: 1 Hz (Fast telemetry)</span>
      </div>
    </div>
  );
};
