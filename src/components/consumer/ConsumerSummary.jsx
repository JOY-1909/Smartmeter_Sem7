import React from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { useTariff } from '../../context/TariffContext';
import { TrendingDown, TrendingUp, Calendar, Zap, AlertCircle, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConsumerSummary = () => {
  const { latestTelemetry, meter } = useEnergyData();
  const { computeProjection } = useTariff();

  // Project bill based on current kWh (e.g. 346.8 kWh in 24 days)
  const projection = computeProjection(latestTelemetry.energyKwh, 24, 30);

  // Month vs last month (Mock: this month 346.8 vs last month 382.4 at same point -> -9.3% less)
  const lastMonthSameDayKwh = 382.4;
  const usageDeltaKwh = latestTelemetry.energyKwh - lastMonthSameDayKwh;
  const usageDeltaPercent = ((usageDeltaKwh / lastMonthSameDayKwh) * 100).toFixed(1);
  const isUsageDown = Number(usageDeltaPercent) < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Estimated Bill Card */}
      <div className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Current Month Bill</span>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              Day 24 of 30
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              ₹{projection.currentBillAmount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">accrued so far</span>
          </div>

          <div className="bg-slate-50 rounded p-2.5 border border-slate-100 mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Projected Month-End Total:</span>
              <strong className="text-slate-900 font-mono">₹{projection.projectedBillAmount.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Estimated remaining cost:</span>
              <span className="font-mono">₹{projection.projectedCostVariance.toLocaleString()} (6 days left)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Based on standard slab rates</span>
          <Link to="/billing" className="font-semibold text-sky-600 hover:text-sky-800">
            View Slab Breakdown &rarr;
          </Link>
        </div>
      </div>

      {/* 2. Month's Usage vs Last Month */}
      <div className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Electricity Consumed</span>
            <span className="text-[11px] text-slate-400">August 2026</span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {latestTelemetry.energyKwh}
            </span>
            <span className="text-sm font-semibold text-slate-500">Units (kWh)</span>
          </div>

          {/* Comparison badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
              isUsageDown ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isUsageDown ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>{Math.abs(usageDeltaPercent)}% {isUsageDown ? 'lower' : 'higher'} than last month</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            You used <strong>{lastMonthSameDayKwh} units</strong> at this time last month. Great job keeping energy in check!
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Daily Run Rate:</span>
          <span className="font-mono font-semibold text-slate-700">{projection.dailyRunRateKwh} units/day</span>
        </div>
      </div>

      {/* 3. Real-Time Consumption Snapshot */}
      <div className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Current Power Draw</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live right now
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {(latestTelemetry.activePower / 1000).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">kW</span>
            <span className="text-xs text-slate-400 ml-1 font-mono">({latestTelemetry.activePower} Watts)</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 mt-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Sanctioned Connection:</span>
              <span className="font-medium text-slate-800">{meter.sanctionedLoadKw} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Capacity Utilized:</span>
              <span className="font-mono font-medium text-slate-800">
                {((latestTelemetry.activePower / (meter.sanctionedLoadKw * 1000)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Home Meter ID:</span>
          <span className="font-mono text-slate-700">{meter.meterId}</span>
        </div>
      </div>
    </div>
  );
};
