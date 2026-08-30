import React from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { useTariff } from '../../context/TariffContext';
import { NILM_APPLIANCE_DATA } from '../../services/mockData';
import { ShieldCheck, Zap, Printer } from 'lucide-react';

export const ReportPreviewDoc = () => {
  const { meter, latestTelemetry, alerts } = useEnergyData();
  const { computeBill } = useTariff();

  const bill = computeBill(latestTelemetry.energyKwh);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Live Report Document Preview
        </h4>
        <button
          onClick={handlePrint}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Sheet View */}
      <div className="border border-slate-200 p-6 rounded bg-white text-slate-800 space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-sky-400">
                <Zap className="w-3.5 h-3.5 fill-sky-400" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                GRIDSENSE™ SMART ENERGY AUDIT REPORT
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Class 1.0 Automated Meter Reading (AMR) & Power Quality Telemetry Record
            </p>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>Doc ID: <strong className="text-slate-900">REP-2026-08-30</strong></div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Consumer</span>
            <strong className="text-slate-900">{meter.consumerName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Meter Serial ID</span>
            <strong className="text-slate-900 font-mono">{meter.meterId}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Sanctioned Load</span>
            <strong className="text-slate-900">{meter.sanctionedLoadKw} kW (1-Ph)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Audit Period</span>
            <strong className="text-slate-900">August 2026</strong>
          </div>
        </div>

        {/* 3 Executive Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Energy</span>
            <span className="text-xl font-bold font-mono text-sky-700">{latestTelemetry.energyKwh} kWh</span>
          </div>
          <div className="p-3 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Accrued Cost</span>
            <span className="text-xl font-bold font-mono text-slate-900">₹{bill.totalBill.toFixed(2)}</span>
          </div>
          <div className="p-3 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Average PF</span>
            <span className="text-xl font-bold font-mono text-emerald-700">0.94 (Compliant)</span>
          </div>
        </div>

        {/* Slab Breakdown Table */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Tiered Tariff Energy Charge Itemization
          </h5>
          <table className="w-full text-xs text-left border border-slate-200 rounded">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Tariff Slab</th>
                <th className="py-2 px-3">Rate / Unit</th>
                <th className="py-2 px-3">Billed Units</th>
                <th className="py-2 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {bill.slabBreakdown.map(s => (
                <tr key={s.slabId}>
                  <td className="py-1.5 px-3 font-sans">{s.label}</td>
                  <td className="py-1.5 px-3">₹{s.ratePerKwh.toFixed(2)}</td>
                  <td className="py-1.5 px-3">{s.unitsConsumed.toFixed(2)} kWh</td>
                  <td className="py-1.5 px-3 text-right font-bold">₹{s.cost.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/70 font-sans font-semibold">
                <td colSpan={3} className="py-2 px-3">Fixed Charges + Surcharge + 6% Duty</td>
                <td className="py-2 px-3 text-right font-mono text-slate-900 font-bold">
                  ₹{(bill.fixedCharges + bill.facCharge + bill.electricityDuty).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Power Quality Anomaly Log */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Power Quality & Grid Deviation Log
          </h5>
          <div className="space-y-1.5 text-xs">
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className="p-2 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-slate-800">[{a.severity.toUpperCase()}] {a.title}</span>
                  <span className="text-slate-500 ml-2">{a.description}</span>
                </div>
                <span className="font-mono text-slate-600 shrink-0">{a.measuredValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>GridSense Telemetry AMR Engine • Certified IEC 62053-21 Class 1.0</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
