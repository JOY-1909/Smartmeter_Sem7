import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConsumerAlertsCard = () => {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Approaching Higher Tariff Slab Tier 3',
      message: 'You have consumed 346.8 units. Consuming 54 more units will push usage into the ₹7.15/unit slab.',
      action: 'Set Budget Alert',
      link: '/billing'
    },
    {
      id: 2,
      type: 'info',
      title: 'Power Quality is Clean & Stable',
      message: 'Voltage is steady at 230V ± 2%. Your appliances are operating under optimal safety conditions.',
      action: 'View Power Quality',
      link: '/graphs'
    }
  ];

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-sky-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Account Notices & Bill Alerts
          </h4>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div
            key={a.id}
            className={`p-3 rounded border text-xs ${
              a.type === 'warning'
                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              {a.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{a.title}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
              {a.message}
            </p>
            <Link
              to={a.link}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 hover:text-sky-700 underline"
            >
              <span>{a.action}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
