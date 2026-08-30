import React, { useState, useEffect } from 'react';
import { getNILMApplianceData } from '../../services/api';
import { 
  Tv, 
  Wind, 
  Thermometer, 
  Refrigerator, 
  Zap, 
  Flame, 
  Info, 
  AlertTriangle 
} from 'lucide-react';

export const ApplianceBreakdownNILM = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNILM() {
      try {
        const res = await getNILMApplianceData();
        if (res.success) {
          setAppliances(res.appliances);
        }
      } catch (err) {
        console.error('Failed to load NILM data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNILM();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HVAC': return Wind;
      case 'Water Heating': return Thermometer;
      case 'Refrigeration': return Refrigerator;
      case 'Kitchen': return Flame;
      case 'Lighting & Entertainment': return Tv;
      case 'Standby Leakage': return Zap;
      default: return Zap;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded border border-slate-200 p-5 text-center text-xs text-slate-400">
        Analyzing high-frequency appliance signatures (NILM)...
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Where is your electricity going? (AI Appliance Breakdown)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-normal">
              NILM Disaggregated
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-Intrusive Load Monitoring identifies appliances by analyzing electrical harmonic fingerprints at the meter.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total Analyzed: <strong className="text-slate-900">346.8 kWh</strong>
        </div>
      </div>

      {/* Appliance list */}
      <div className="space-y-4">
        {appliances.map(app => {
          const Icon = getCategoryIcon(app.category);
          const isStandby = app.category === 'Standby Leakage';

          return (
            <div key={app.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded ${
                    isStandby ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{app.name}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">
                      (~{app.activeHoursPerDay} hrs/day • {app.ratedPowerW}W rated)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-700 font-semibold">{app.kwhThisMonth} units ({app.percentage}%)</span>
                  <span className="text-slate-900 font-bold w-16 text-right">₹{app.estimatedCostInr.toFixed(0)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isStandby
                      ? 'bg-amber-500'
                      : app.percentage > 30
                      ? 'bg-sky-600'
                      : app.percentage > 15
                      ? 'bg-indigo-600'
                      : 'bg-slate-500'
                  }`}
                  style={{ width: `${app.percentage}%` }}
                />
              </div>

              {isStandby && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 rounded px-2 py-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Phantom Vampire Drain Alert:</strong> 85 Watts is being continuously drawn even when house is asleep (TVs, set-top boxes, adapters). Turning off master switches could save ~₹122/month.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
