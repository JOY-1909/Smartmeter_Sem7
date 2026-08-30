import React from 'react';
import { Calendar } from 'lucide-react';

export const DateRangePicker = ({
  selectedRange = '24h',
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDatesChange
}) => {
  const presets = [
    { id: '1h', label: 'Last 1 Hour' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded border border-slate-200 bg-white p-0.5 text-xs font-medium">
        {presets.map(p => {
          const isActive = selectedRange === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onRangeChange(p.id)}
              className={`px-3 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customStartDate || '2026-08-01'}
              onChange={(e) => onCustomDatesChange?.(e.target.value, customEndDate)}
              className="outline-none bg-transparent text-slate-700 font-mono text-xs"
            />
          </div>
          <span className="text-slate-400">to</span>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customEndDate || '2026-08-30'}
              onChange={(e) => onCustomDatesChange?.(customStartDate, e.target.value)}
              className="outline-none bg-transparent text-slate-700 font-mono text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
