import React from 'react';
import { Lightbulb, CheckCircle2, TrendingDown } from 'lucide-react';

export const EnergyTipsCard = () => {
  const tips = [
    {
      title: "Set Inverter AC to 24°C instead of 18°C",
      impact: "Saves ~18% cooling cost (approx. ₹185/month)",
      reason: "Every 1°C temperature rise lowers compressor power draw by 6%."
    },
    {
      title: "Shift Geyser heating to off-peak morning (6:30 AM)",
      impact: "Reduces peak demand load penalty",
      reason: "Running geyser simultaneously with microwave causes sudden 4.5kW surge."
    },
    {
      title: "Switch off idle set-top box & audio dock power strips",
      impact: "Saves ~17.4 units/month (approx. ₹122/month)",
      reason: "Eliminates phantom standby drain detected during 2 AM - 5 AM."
    }
  ];

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Personalized Energy Savings Recommendations
        </h4>
      </div>

      <div className="space-y-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-slate-800">{tip.title}</span>
              <span className="shrink-0 text-[10px] font-bold font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                {tip.impact}
              </span>
            </div>
            <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
              {tip.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
