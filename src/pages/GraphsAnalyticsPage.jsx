import React, { useState } from 'react';
import { RealtimeScroller } from '../components/graphs/RealtimeScroller';
import { HistoricalGraph } from '../components/graphs/HistoricalGraph';
import { DualAxisOverlay } from '../components/graphs/DualAxisOverlay';
import { LineChart, BarChart2, Activity, Layers } from 'lucide-react';

export const GraphsAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('historical'); // 'historical' | 'realtime' | 'dual'

  return (
    <div className="space-y-5">
      {/* Header with Navigation Tabs */}
      <div className="bg-white rounded border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Real-Time & Historical Waveform Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-channel power graphs, time-series aggregation, and cross-metric correlation overlays.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('historical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'historical'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Historical Series</span>
          </button>
          <button
            onClick={() => setActiveTab('dual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'dual'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual-Axis Overlay</span>
          </button>
          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'realtime'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Scroller</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'historical' && <HistoricalGraph />}
      {activeTab === 'dual' && <DualAxisOverlay />}
      {activeTab === 'realtime' && <RealtimeScroller />}
    </div>
  );
};
