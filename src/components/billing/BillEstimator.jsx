import React, { useState } from 'react';
import { useTariff } from '../../context/TariffContext';
import { useEnergyData } from '../../context/EnergyDataContext';
import { SlabBreakdownChart } from './SlabBreakdownChart';
import { TariffSettingsModal } from './TariffSettingsModal';
import { Settings, Calculator, IndianRupee, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const BillEstimator = () => {
  const { latestTelemetry, meter } = useEnergyData();
  const { tariffConfig, computeBill, computeProjection } = useTariff();

  const [simulatedKwh, setSimulatedKwh] = useState(latestTelemetry.energyKwh || 346.8);
  const [daysElapsed, setDaysElapsed] = useState(24);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Re-calculate bills
  const billCalc = computeBill(simulatedKwh);
  const projection = computeProjection(simulatedKwh, daysElapsed, 30);

  return (
    <div className="space-y-5">
      {/* Simulation & Settings Control Bar */}
      <div className="bg-white rounded border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Interactive Indian Electricity Tariff & Slab Estimator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate monthly electricity bill and evaluate how additional unit consumption impacts higher tariff slabs.
            </p>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Configure Tariff Rates</span>
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Simulate Consumption (kWh Units):</span>
              <span className="font-bold font-mono text-sky-700">{simulatedKwh} Units</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="1"
              value={simulatedKwh}
              onChange={(e) => setSimulatedKwh(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 units</span>
              <span>250 units</span>
              <span>500 units</span>
              <span>750 units</span>
              <span>1,000 units</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSimulatedKwh(latestTelemetry.energyKwh)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              Reset to Current Meter Reading ({latestTelemetry.energyKwh} kWh)
            </button>
            <button
              onClick={() => setSimulatedKwh(200)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              200 Units Benchmark
            </button>
            <button
              onClick={() => setSimulatedKwh(500)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              500 Units Benchmark
            </button>
          </div>
        </div>
      </div>

      {/* Bill Output Cards: Current vs Month-End Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Projected Month-End Bill Summary */}
        <div className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Projected Final Cycle Bill
            </span>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                ₹{projection.projectedBillAmount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">at 30 days</span>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Cycle Elapsed:</span>
                <span className="font-mono font-medium">{daysElapsed} of 30 days</span>
              </div>
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Daily Run Rate:</span>
                <span className="font-mono font-medium">{projection.dailyRunRateKwh} units / day</span>
              </div>
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Projected Total Units:</span>
                <span className="font-mono font-medium text-slate-900">{projection.projectedTotalKwh} kWh</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Effective Rate:</span>
                <span className="font-mono font-medium">₹{(projection.projectedBillAmount / projection.projectedTotalKwh).toFixed(2)} / unit</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Includes fixed capacity charges + fuel surcharge + statutory duty</span>
          </div>
        </div>

        {/* Center & Right: Detailed Bill Line Item Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Bill Line-Item Calculation for {simulatedKwh} Units
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <div>
                <span className="font-medium">1. Base Energy Charges</span>
                <p className="text-[10px] text-slate-400">Sum of consumption across tiered slabs</p>
              </div>
              <span className="font-mono font-bold text-slate-900">₹{billCalc.energyCharges.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-700">
              <div>
                <span className="font-medium">2. Fixed Demand Capacity Charge</span>
                <p className="text-[10px] text-slate-400">
                  {tariffConfig.sanctionedLoadKw} kW load @ ₹{tariffConfig.fixedChargePerKw}/kW + ₹{tariffConfig.meterRentFixed} meter rent
                </p>
              </div>
              <span className="font-mono font-medium text-slate-800">₹{billCalc.fixedCharges.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-700">
              <div>
                <span className="font-medium">3. Fuel Adjustment Charge (FAC / Surcharge)</span>
                <p className="text-[10px] text-slate-400">{simulatedKwh} units @ ₹{tariffConfig.fuelSurchargePerKwh}/kWh</p>
              </div>
              <span className="font-mono font-medium text-slate-800">₹{billCalc.facCharge.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-700 pt-2 border-t border-slate-100">
              <div>
                <span className="font-medium">4. State Electricity Duty ({billCalc.dutyPercent}%)</span>
                <p className="text-[10px] text-slate-400">Statutory state government regulatory levy</p>
              </div>
              <span className="font-mono font-medium text-slate-800">₹{billCalc.electricityDuty.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200 text-sm">
              <span className="font-bold text-slate-900">Total Estimated Bill Amount</span>
              <span className="text-xl font-bold font-mono text-sky-700">₹{billCalc.totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slab Distribution Visualization */}
      <SlabBreakdownChart billDetails={billCalc} />

      {/* Settings Modal */}
      <TariffSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
