import React from 'react';
import { Sparkline } from './Sparkline';
import { StatusBadge } from './StatusBadge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  unit,
  sparklineData = [],
  status = 'normal',
  statusLabel,
  nominalLabel,
  thresholdInfo,
  secondaryMetric,
  icon: Icon
}) => {
  // Calculate delta over the 30-point sparkline window
  const delta = React.useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const first = sparklineData[0]?.value ?? sparklineData[0];
    const last = sparklineData[sparklineData.length - 1]?.value ?? sparklineData[sparklineData.length - 1];
    if (typeof first !== 'number' || typeof last !== 'number') return null;
    const diff = last - first;
    const percent = first !== 0 ? (diff / first) * 100 : 0;
    return {
      diff: Number(diff.toFixed(2)),
      percent: Number(percent.toFixed(1))
    };
  }, [sparklineData]);

  // Border & background state on warning/critical
  const borderStatusClass = {
    normal: 'border-slate-200 hover:border-slate-300',
    warning: 'border-amber-300 bg-amber-50/20',
    critical: 'border-rose-300 bg-rose-50/20',
    offline: 'border-slate-200 opacity-70'
  }[status.toLowerCase()] || 'border-slate-200';

  return (
    <div className={`bg-white rounded border ${borderStatusClass} p-4 transition-all duration-200 flex flex-col justify-between`}>
      {/* Top row: Title, Icon, Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
        </div>
        <StatusBadge status={status} label={statusLabel} size="sm" />
      </div>

      {/* Main Metric Value & Sparkline Row */}
      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            {unit}
          </span>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col items-end">
          <Sparkline
            data={sparklineData}
            width={100}
            height={28}
            status={status}
          />
        </div>
      </div>

      {/* Bottom Metadata & Threshold Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          {nominalLabel && (
            <span className="text-[11px] text-slate-400">
              Nom: <span className="text-slate-600 font-mono">{nominalLabel}</span>
            </span>
          )}
          {thresholdInfo && (
            <span className="text-[11px] text-slate-400">
              Limit: <span className="text-slate-600 font-mono">{thresholdInfo}</span>
            </span>
          )}
          {secondaryMetric && (
            <span className="text-[11px] text-slate-600 font-medium font-mono">
              {secondaryMetric}
            </span>
          )}
        </div>

        {/* 30-sec Delta */}
        {delta !== null && (
          <div className="flex items-center gap-0.5 text-[11px] font-mono shrink-0">
            {delta.diff > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">+{delta.percent}%</span>
              </>
            ) : delta.diff < 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-slate-500" />
                <span className="text-slate-600">{delta.percent}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400">0.0%</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
