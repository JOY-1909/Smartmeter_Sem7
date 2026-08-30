import React, { useState, useMemo } from 'react';
import { generatePeakHeatmapMatrix } from '../../services/mockData';
import { Flame, Clock, Info } from 'lucide-react';

export const PeakHourHeatmap = () => {
  const matrixData = useMemo(() => generatePeakHeatmapMatrix(), []);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Color generator based on 0.0 - 1.0 load intensity
  const getCellColor = (intensity) => {
    if (intensity < 0.25) return 'bg-sky-50 text-sky-900 border-sky-100 hover:border-sky-300';
    if (intensity < 0.50) return 'bg-sky-200 text-sky-950 border-sky-300 hover:border-sky-400';
    if (intensity < 0.75) return 'bg-amber-300 text-amber-950 border-amber-400 hover:border-amber-500';
    return 'bg-rose-400 text-rose-950 border-rose-500 hover:border-rose-600 font-bold';
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Peak Usage Time-of-Day Heatmap Matrix</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-normal">
              24h × 7d Profiling
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly consumption intensity across the week. High demand evening window (6 PM – 10 PM) highlighted.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="text-slate-400 text-[10px]">Load:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-sky-50 border border-sky-200"></span>
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-sky-200 border border-sky-300"></span>
            Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-amber-300 border border-amber-400"></span>
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-rose-400 border border-rose-500"></span>
            Peak
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour header numbers */}
          <div className="grid grid-cols-25 gap-1 text-[10px] font-mono text-slate-400 mb-1">
            <div className="col-span-2 text-right pr-2">Day</div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className={`text-center col-span-1 ${
                  (h >= 18 && h <= 22) ? 'text-amber-700 font-bold bg-amber-50/50 rounded-xs' : ''
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          <div className="space-y-1">
            {matrixData.map(row => (
              <div key={row.day} className="grid grid-cols-25 gap-1 items-center">
                {/* Day label */}
                <div className="col-span-2 text-xs font-medium text-slate-700 truncate pr-2 text-right">
                  {row.day.slice(0, 3)}
                </div>

                {/* 24 Hour blocks */}
                {row.hours.map(cell => (
                  <div
                    key={cell.hour}
                    onMouseEnter={() => setHoveredCell({ day: row.day, ...cell })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`col-span-1 h-7 rounded-xs border text-[9px] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${getCellColor(
                      cell.intensity
                    )}`}
                    title={`${row.day} at ${cell.hourLabel}: ~${cell.kwh} kW (${(cell.intensity * 100).toFixed(0)}% Load)`}
                  >
                    {cell.intensity > 0.85 ? '!' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover metadata preview footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {hoveredCell ? (
            <span>
              Selected: <strong className="text-slate-800">{hoveredCell.day} {hoveredCell.hourLabel}</strong> — Demand: <strong className="text-slate-900 font-mono">{hoveredCell.kwh} kW</strong> ({hoveredCell.isPeakWindow ? '⚠️ Peak Tariff Window' : 'Normal Grid Window'})
            </span>
          ) : (
            <span>Hover over any hour cell to inspect load draw and peak pricing window.</span>
          )}
        </div>

        <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Peak Surcharge Window: 18:00 – 22:00 (Evening)
        </div>
      </div>
    </div>
  );
};
