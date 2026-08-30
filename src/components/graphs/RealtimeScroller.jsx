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
import { Play, Pause, Maximize2 } from 'lucide-react';

export const RealtimeScroller = () => {
  const { liveStreamHistory, isPaused, togglePause } = useEnergyData();
  const [selectedChannel, setSelectedChannel] = useState('power');

  const channels = [
    { id: 'power', label: 'Active Power (kW)', key: 'activePowerKw', color: '#0284c7', unit: 'kW' },
    { id: 'voltage', label: 'Voltage (V)', key: 'voltage', color: '#2563eb', unit: 'V' },
    { id: 'current', label: 'Current (A)', key: 'current', color: '#7c3aed', unit: 'A' },
    { id: 'pf', label: 'Power Factor', key: 'powerFactor', color: '#4f46e5', unit: '' },
    { id: 'freq', label: 'Frequency (Hz)', key: 'frequency', color: '#0891b2', unit: 'Hz' }
  ];

  const currentConfig = channels.find(c => c.id === selectedChannel) || channels[0];

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>High-Frequency Auto-Scrolling Telemetry</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
              Live Buffer
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming second-by-second measurements from smart meter DSP buffer.
          </p>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedChannel === ch.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch.label.split(' ')[0]}
              </button>
            ))}
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

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={liveStreamHistory} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(val) => [`${val} ${currentConfig.unit}`, currentConfig.label]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey={currentConfig.key}
              name={currentConfig.label}
              stroke={currentConfig.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Channel: <strong className="text-slate-800">{currentConfig.label}</strong></span>
        <span>Points: {liveStreamHistory.length} / 60</span>
      </div>
    </div>
  );
};
