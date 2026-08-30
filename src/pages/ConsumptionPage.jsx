import React from 'react';
import { PeriodConsumptionBar } from '../components/consumption/PeriodConsumptionBar';
import { PeakHourHeatmap } from '../components/consumption/PeakHourHeatmap';
import { BarChart3, Download, Layers } from 'lucide-react';
import { exportToCSV } from '../services/exportService';
import { getConsumptionSummaryData } from '../services/mockData';

export const ConsumptionPage = () => {
  const handleExportConsumption = () => {
    const summary = getConsumptionSummaryData();
    const rows = [
      ...summary.daily.chartData.map(d => ({ Period: 'Daily (Hourly)', Label: d.label, UnitsConsumedKwh: d.current, PreviousKwh: d.previous })),
      ...summary.weekly.chartData.map(d => ({ Period: 'Weekly (Daily)', Label: d.label, UnitsConsumedKwh: d.current, PreviousKwh: d.previous })),
      ...summary.monthly.chartData.map(d => ({ Period: 'Monthly (Weekly)', Label: d.label, UnitsConsumedKwh: d.current, PreviousKwh: d.previous })),
    ];
    exportToCSV(rows, 'gridsense_consumption_aggregates.csv');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Energy Consumption & Load Distribution Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic energy aggregation, baseline vs peak comparative trends, and Time-of-Use (ToU) heatmaps.
          </p>
        </div>

        <button
          onClick={handleExportConsumption}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Aggregates CSV</span>
        </button>
      </div>

      {/* 1. Period Consumption Bar Chart (Daily / Weekly / Monthly) */}
      <PeriodConsumptionBar />

      {/* 2. Peak Hour Heatmap Matrix */}
      <PeakHourHeatmap />
    </div>
  );
};
