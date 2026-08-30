import React from 'react';

export const SlabBreakdownChart = ({ billDetails }) => {
  if (!billDetails || !billDetails.slabBreakdown) return null;

  const { slabBreakdown, currencySymbol, energyCharges, totalKwh } = billDetails;

  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Tiered Tariff Slab Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progressive slab rate breakdown based on state electricity regulatory commission (SERC) tariff model.
          </p>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          Billed Units: <strong className="text-slate-900">{totalKwh} kWh</strong>
        </div>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-100 h-4 rounded overflow-hidden flex">
          {slabBreakdown.map((slab, idx) => {
            const widthPct = totalKwh > 0 ? (slab.unitsConsumed / totalKwh) * 100 : 0;
            if (widthPct === 0) return null;

            const colors = ['bg-emerald-600', 'bg-sky-600', 'bg-indigo-600', 'bg-amber-600'];
            const color = colors[idx % colors.length];

            return (
              <div
                key={slab.slabId}
                className={`${color} h-full transition-all duration-300 relative group`}
                style={{ width: `${widthPct}%` }}
                title={`${slab.label}: ${slab.unitsConsumed} units @ ${currencySymbol}${slab.ratePerKwh}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>0 units</span>
          <span>{totalKwh} units consumed</span>
        </div>
      </div>

      {/* Table of Slabs */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="py-2 px-3">Tariff Slab</th>
              <th className="py-2 px-3">Rate / Unit</th>
              <th className="py-2 px-3">Units in Slab</th>
              <th className="py-2 px-3 text-right">Energy Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {slabBreakdown.map(slab => (
              <tr key={slab.slabId} className={slab.unitsConsumed > 0 ? 'bg-slate-50/40' : 'text-slate-400'}>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                  {slab.label}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {currencySymbol}{slab.ratePerKwh.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {slab.unitsConsumed.toFixed(2)} kWh
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  {currencySymbol}{slab.cost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-sans font-semibold text-slate-900 bg-slate-50">
              <td colSpan={3} className="py-2.5 px-3">
                Total Energy Charges (Base Subtotal)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-700">
                {currencySymbol}{energyCharges.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
