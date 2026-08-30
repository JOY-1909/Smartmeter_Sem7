import React from 'react';
import { BookOpen, ShieldAlert, Cpu, Lightbulb } from 'lucide-react';

export const AnomalyDiagnostics = () => {
  const guides = [
    {
      title: "Overvoltage (>253 V) / Voltage Sag (<207 V)",
      cause: "Transformer tap mismatch, grid feeder off-loading during light night hours, or heavy inductive startups.",
      action: "Check local distribution transformer (DT) tap setting. Isolate sensitive electronic loads with voltage stabilizer / servo regulator."
    },
    {
      title: "Low Power Factor (<0.85 PF)",
      cause: "Uncompensated inductive loads such as induction motors, AC compressors, and magnetic ballasts.",
      action: "Install Automatic Power Factor Correction (APFC) capacitor bank. Prevents low-PF penalty surcharges on electricity bill."
    },
    {
      title: "High Phantom / Vampire Standby Load",
      cause: "Idling electronic appliances (smart TVs, gaming setups, set-top boxes, smart assistants) drawing power 24/7.",
      action: "Utilize smart power strips with auto-shutoff relays to eliminate off-peak phantom load leakage (~85W)."
    }
  ];

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <BookOpen className="w-4 h-4 text-sky-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Grid Anomaly Diagnostic & Remediation Guidelines
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((g, idx) => (
          <div key={idx} className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
            <h5 className="font-bold text-slate-800 text-[12px]">{g.title}</h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-700">Root Cause:</strong> {g.cause}
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-emerald-700">Corrective Action:</strong> {g.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
