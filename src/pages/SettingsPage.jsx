import React, { useState } from 'react';
import { useEnergyData } from '../context/EnergyDataContext';
import { useAuth } from '../context/AuthContext';
import { ThresholdModal } from '../components/realtime/ThresholdModal';
import { TariffSettingsModal } from '../components/billing/TariffSettingsModal';
import { 
  Sliders, 
  Wifi, 
  Cpu, 
  Receipt, 
  ShieldCheck, 
  Server, 
  Check, 
  RefreshCw,
  Zap
} from 'lucide-react';

export const SettingsPage = () => {
  const { meter, setMeter, isMock, isConnected, connectionState, triggerAnomaly } = useEnergyData();
  const { isOperator } = useAuth();

  const [meterForm, setMeterForm] = useState(meter);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);

  const handleMeterSave = (e) => {
    e.preventDefault();
    setMeter(meterForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded border border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          System Configuration & Smart Meter Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage hardware meter binding, telemetry stream endpoints, and system-wide threshold policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Smart Meter Hardware Profile */}
        <div className="bg-white rounded border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Meter Hardware & Subscriber Binding
            </h3>
          </div>

          <form onSubmit={handleMeterSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Meter Serial Number</label>
              <input
                type="text"
                value={meterForm.meterId}
                onChange={(e) => setMeterForm({ ...meterForm, meterId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Sanctioned Load (kW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={meterForm.sanctionedLoadKw}
                  onChange={(e) => setMeterForm({ ...meterForm, sanctionedLoadKw: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Connection Phase</label>
                <select
                  value={meterForm.phase}
                  onChange={(e) => setMeterForm({ ...meterForm, phase: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="Single Phase 2-Wire">Single Phase 2-Wire (230V)</option>
                  <option value="3-Phase 4-Wire">3-Phase 4-Wire (415V)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Substation / Feeder Name</label>
              <input
                type="text"
                value={meterForm.substation}
                onChange={(e) => setMeterForm({ ...meterForm, substation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Meter parameters updated!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                Save Meter Config
              </button>
            </div>
          </form>
        </div>

        {/* 2. Telemetry Bridge & API Endpoints */}
        <div className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Server className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Network & API Bridge Status
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Telemetry Engine:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {isMock ? 'Local Physics Simulator' : 'Live WebSocket Stream'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Connection State:</span>
                  <span className="font-mono text-emerald-700 font-semibold uppercase">{connectionState}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Configured REST API Base URL</label>
                <input
                  type="text"
                  readOnly
                  value={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded px-2.5 py-1.5 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Configured WebSocket Stream URL</label>
                <input
                  type="text"
                  readOnly
                  value={import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live-metrics'}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded px-2.5 py-1.5 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                To point GridSense to a real physical backend, update <code>VITE_USE_MOCK_DATA=false</code> and the URLs in your <code>.env</code> file.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => setIsThresholdModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Alarm Thresholds</span>
            </button>

            <button
              onClick={() => setIsTariffModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tariff Slab Rates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
      />
      <TariffSettingsModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
      />
    </div>
  );
};
