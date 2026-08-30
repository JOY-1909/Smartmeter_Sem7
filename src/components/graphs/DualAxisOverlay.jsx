import React, { useState, useEffect } from 'react';
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
import { getHistoricalData } from '../../services/api';

export const DualAxisOverlay = () => {
  const [data, setData] = useState([]);
  const [overlayPreset, setOverlayPreset] = useState('vi'); // 'vi' (Voltage + Current) | 'ppf' (Power + PF)

  useEffect(() => {
    async function loadData() {
      const res = await getHistoricalData('24h', '1h');
      if (res.success) setData(res.data);
    }
    loadData();
  }, []);

  const isVI = overlayPreset === 'vi';

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Multi-Metric Dual-Axis Overlay Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Correlate load demand spikes with line voltage drop and power factor variations.
          </p>
        </div>

        <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            onClick={() => setOverlayPreset('vi')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isVI ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voltage (V) vs Current (A)
          </button>
          <button
            onClick={() => setOverlayPreset('ppf')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !isVI ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Power (kW) vs Power Factor
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            
            {/* Left Y Axis */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 10, fill: isVI ? '#2563eb' : '#0284c7' }}
              axisLine={{ stroke: isVI ? '#93c5fd' : '#7dd3fc' }}
              tickLine={false}
              domain={isVI ? [200, 260] : [0, 'auto']}
              unit={isVI ? ' V' : ' kW'}
            />

            {/* Right Y Axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: isVI ? '#7c3aed' : '#4f46e5' }}
              axisLine={{ stroke: isVI ? '#c4b5fd' : '#a5b4fc' }}
              tickLine={false}
              domain={isVI ? [0, 30] : [0.7, 1.0]}
              unit={isVI ? ' A' : ''}
            />

            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {isVI ? (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  name="Line Voltage (V)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="current"
                  name="Load Current (A)"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </>
            ) : (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="activePowerKw"
                  name="Active Power (kW)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="powerFactor"
                  name="Power Factor (PF)"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Dual Y-Axis Mode: {isVI ? "Voltage (Left Y) vs Current (Right Y)" : "Power (Left Y) vs Power Factor (Right Y)"}</span>
        <span>Time Span: Last 24 Hours</span>
      </div>
    </div>
  );
};
