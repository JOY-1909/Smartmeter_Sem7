import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { getHistoricalData } from '../../services/api';
import { DateRangePicker } from '../common/DateRangePicker';
import { exportToCSV } from '../../services/exportService';
import { Download, Layers, Calendar, Filter } from 'lucide-react';

export const HistoricalGraph = () => {
  const [range, setRange] = useState('24h');
  const [resolution, setResolution] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('activePowerKw');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await getHistoricalData(range, resolution);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [range, resolution]);

  const handleExport = () => {
    exportToCSV(data, `gridsense_historical_${range}_${resolution}.csv`);
  };

  const metricConfigs = {
    activePowerKw: { label: 'Active Power', unit: 'kW', color: '#0284c7', fill: '#e0f2fe' },
    voltage: { label: 'Voltage', unit: 'V', color: '#2563eb', fill: '#dbeafe' },
    current: { label: 'Current', unit: 'A', color: '#7c3aed', fill: '#ede9fe' },
    energyKwh: { label: 'Cumulative Energy', unit: 'kWh', color: '#0d9488', fill: '#ccfbf1' },
    powerFactor: { label: 'Power Factor', unit: '', color: '#4f46e5', fill: '#e0e7ff' },
  };

  const activeConf = metricConfigs[selectedMetric] || metricConfigs.activePowerKw;

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Historical Energy & Load Profile
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Query aggregated time-series telemetry with custom resolution stepping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Resolution Selector */}
          <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <span className="text-[10px] text-slate-400 self-center px-1.5 font-mono">Res:</span>
            {['1m', '1h', '1d'].map(res => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  resolution === res
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {res === '1m' ? '1-Min Avg' : res === '1h' ? '1-Hr Avg' : 'Daily Avg'}
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Second Row: Date range picker + Metric toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <DateRangePicker
          selectedRange={range}
          onRangeChange={(newRange) => setRange(newRange)}
        />

        <div className="flex items-center gap-1 text-xs">
          {Object.entries(metricConfigs).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                selectedMetric === key
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {conf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-80 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            Loading historical data series...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConf.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={activeConf.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dateLabel"
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
                formatter={(val) => [`${val} ${activeConf.unit}`, activeConf.label]}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                name={activeConf.label}
                stroke={activeConf.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${selectedMetric})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Range: {range.toUpperCase()} | Resolution: {resolution}</span>
        <span>Total Records: {data.length}</span>
      </div>
    </div>
  );
};
