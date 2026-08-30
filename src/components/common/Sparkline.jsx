import React, { useMemo } from 'react';

export const Sparkline = ({
  data = [],
  width = 120,
  height = 36,
  status = 'normal',
  strokeWidth = 1.5,
  showMinMax = false
}) => {
  const points = useMemo(() => {
    if (!data || data.length < 2) return '';

    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;
    const padding = 2;
    const innerHeight = height - padding * 2;
    const stepX = (width - padding * 2) / (values.length - 1);

    return values
      .map((val, idx) => {
        const x = padding + idx * stepX;
        const y = height - padding - ((val - min) / range) * innerHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, width, height]);

  // Color mapping strictly matching enterprise guidelines
  const strokeColor = {
    normal: '#0284c7',   // sky-600 / enterprise blue
    healthy: '#059669',  // emerald-600
    warning: '#d97706',  // amber-600
    critical: '#dc2626', // rose-600
    offline: '#94a3b8',  // slate-400
  }[status.toLowerCase()] || '#0284c7';

  if (!data || data.length < 2) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-[10px] text-slate-400">
        Streaming...
      </div>
    );
  }

  return (
    <div className="relative inline-block overflow-hidden" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};
