import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { getConsumptionSummary } from '../../services/api';
import { TrendingDown, TrendingUp, Calendar, Zap, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const PeriodConsumptionBar = () => {
  const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      try {
        const res = await getConsumptionSummary(period);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load consumption summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [period]);

  const isDown = data?.deltaPercent < 0;

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      {/* Header & Period Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Energy Consumption by Period & Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Benchmark current consumption against equivalent previous interval.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                period === p
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-slate-50 rounded border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Current {period} Total
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">{data.currentPeriod}</span>
              <span className="text-xs font-semibold text-slate-500">{data.unit}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Previous {period}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-600">{data.previousPeriod}</span>
              <span className="text-xs font-semibold text-slate-500">{data.unit}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Period Variance
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                isDown ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                {Math.abs(data.deltaPercent)}%
              </span>
              <span className="text-[11px] text-slate-500">
                {isDown ? 'Conservation efficiency' : 'Higher demand'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="h-72 w-full">
        {loading || !data ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            Loading consumption analysis...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                unit=" kWh"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val, name) => [`${val} kWh`, name === 'current' ? `Current ${period}` : `Previous ${period}`]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(val) => val === 'current' ? `Current ${period}` : `Previous ${period}`}
              />
              <Bar dataKey="current" fill="#0284c7" radius={[2, 2, 0, 0]} />
              <Bar dataKey="previous" fill="#94a3b8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
