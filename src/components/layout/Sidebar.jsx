import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Home, 
  LineChart, 
  BarChart3, 
  Receipt, 
  FileText, 
  Bell, 
  Sliders, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ onCloseMobile }) => {
  const { alerts, isMock } = useEnergyData();
  const { isOperator } = useAuth();

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;

  const navItems = [
    {
      label: 'Real-Time Monitor',
      path: '/',
      icon: Activity,
      badge: 'LIVE',
      description: 'Control room electrical telemetry'
    },
    {
      label: 'Consumer Dashboard',
      path: '/consumer',
      icon: Home,
      description: 'Monthly summary & appliance NILM'
    },
    {
      label: 'Real-Time & Historical Graphs',
      path: '/graphs',
      icon: LineChart,
      description: 'Time-series & dual-axis overlays'
    },
    {
      label: 'Consumption Analysis',
      path: '/consumption',
      icon: BarChart3,
      description: 'Period comparisons & peak heatmap'
    },
    {
      label: 'Electricity Bill Estimator',
      path: '/billing',
      icon: Receipt,
      description: 'Tiered slabs & cost breakdown'
    },
    {
      label: 'Energy Reports',
      path: '/reports',
      icon: FileText,
      description: 'PDF/CSV export & archive'
    },
    {
      label: 'Alerts & Fault Log',
      path: '/alerts',
      icon: Bell,
      count: activeAlertsCount,
      description: 'Grid threshold excursions'
    },
    {
      label: 'Thresholds & Settings',
      path: '/settings',
      icon: Sliders,
      description: 'Meter metadata & API configs'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none min-h-[calc(100vh-53px)]">
      {/* Navigation list */}
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-sky-500/20 text-sky-300 rounded border border-sky-400/30">
                  {item.badge}
                </span>
              )}

              {item.count > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Control Room / System Footer */}
      <div className="p-3 m-3 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            GridSense Bridge
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">v1.0.0</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          {isMock ? 'Operating on physics simulation buffer.' : 'Connected to central MQTT broker.'}
        </p>
        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span>Standard: IEC 62053</span>
          <span className="font-mono text-slate-400">Class 1.0</span>
        </div>
      </div>
    </aside>
  );
};
