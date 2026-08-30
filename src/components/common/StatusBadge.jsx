import React from 'react';

export const StatusBadge = ({ status = 'normal', label = null, size = 'md' }) => {
  const normalized = (status || 'normal').toLowerCase();

  const config = {
    normal: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Normal'
    },
    online: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Online'
    },
    healthy: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Healthy'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Warning'
    },
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500 animate-pulse',
      defaultLabel: 'Critical'
    },
    fault: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500 animate-pulse',
      defaultLabel: 'Grid Fault'
    },
    info: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
      defaultLabel: 'Info'
    },
    offline: {
      bg: 'bg-slate-100 text-slate-600 border-slate-300',
      dot: 'bg-slate-400',
      defaultLabel: 'Offline'
    },
    acknowledged: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      defaultLabel: 'Acknowledged'
    },
    resolved: {
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Resolved'
    },
  }[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    defaultLabel: status
  };

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[11px] gap-1'
    : size === 'lg'
    ? 'px-3 py-1 text-sm gap-2'
    : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
