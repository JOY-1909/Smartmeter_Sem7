import React from 'react';
import { ConsumerSummary } from '../components/consumer/ConsumerSummary';
import { ApplianceBreakdownNILM } from '../components/consumer/ApplianceBreakdownNILM';
import { EnergyTipsCard } from '../components/consumer/EnergyTipsCard';
import { ConsumerAlertsCard } from '../components/consumer/ConsumerAlertsCard';
import { useAuth } from '../context/AuthContext';
import { useEnergyData } from '../context/EnergyDataContext';
import { Home, Download, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConsumerDashboardPage = () => {
  const { user } = useAuth();
  const { meter } = useEnergyData();

  return (
    <div className="space-y-5">
      {/* Consumer Welcome Header */}
      <div className="bg-white rounded border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Consumer'}
            </h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded border border-emerald-200">
              Account Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consumer ID: <strong className="font-mono text-slate-700">{meter.consumerId}</strong> • Connected Meter: <strong className="font-mono text-slate-700">{meter.meterId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Monthly Bill PDF</span>
          </Link>
        </div>
      </div>

      {/* 3 Overview Metric Cards */}
      <ConsumerSummary />

      {/* Appliance Breakdown (NILM) */}
      <ApplianceBreakdownNILM />

      {/* 2 Bottom Cards: Energy Tips + Consumer Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnergyTipsCard />
        <ConsumerAlertsCard />
      </div>
    </div>
  );
};
