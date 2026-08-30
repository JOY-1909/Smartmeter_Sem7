import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useTariff } from '../../context/TariffContext';
import { Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_TARIFF_CONFIG } from '../../services/tariffEngine';

export const TariffSettingsModal = ({ isOpen, onClose }) => {
  const { tariffConfig, updateTariff, resetToDefaults } = useTariff();
  const [formState, setFormState] = useState(tariffConfig);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormState(tariffConfig);
      setSaved(false);
    }
  }, [isOpen, tariffConfig]);

  const handleSlabChange = (idx, field, value) => {
    const updatedSlabs = [...formState.slabs];
    updatedSlabs[idx] = {
      ...updatedSlabs[idx],
      [field]: field === 'label' ? value : Number(value)
    };
    setFormState(prev => ({ ...prev, slabs: updatedSlabs }));
  };

  const handleAddSlab = () => {
    const lastSlab = formState.slabs[formState.slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.maxKwh === Infinity ? 501 : lastSlab.maxKwh + 1) : 0;
    const newSlab = {
      id: Date.now(),
      minKwh: newMin,
      maxKwh: Infinity,
      ratePerKwh: 9.50,
      label: `> ${newMin - 1} units (High Demand)`
    };
    setFormState(prev => ({ ...prev, slabs: [...prev.slabs, newSlab] }));
  };

  const handleRemoveSlab = (idx) => {
    setFormState(prev => ({
      ...prev,
      slabs: prev.slabs.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateTariff(formState);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setFormState(DEFAULT_TARIFF_CONFIG);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Tariff & Slab Structure Settings"
      subtitle="Modify progressive Indian electricity tariff rates, sanctioned load charges, and state duties."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Fixed & Statutory Charges */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-3">
          <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
            Fixed & Statutory Regulatory Charges
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Fixed Charge (₹/kW/mo)</label>
              <input
                type="number"
                step="5"
                value={formState.fixedChargePerKw}
                onChange={(e) => setFormState(prev => ({ ...prev, fixedChargePerKw: Number(e.target.value) }))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Fuel Surcharge / FAC (₹/kWh)</label>
              <input
                type="number"
                step="0.05"
                value={formState.fuelSurchargePerKwh}
                onChange={(e) => setFormState(prev => ({ ...prev, fuelSurchargePerKwh: Number(e.target.value) }))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Electricity Duty (%)</label>
              <input
                type="number"
                step="0.5"
                value={formState.electricityDutyPercent}
                onChange={(e) => setFormState(prev => ({ ...prev, electricityDutyPercent: Number(e.target.value) }))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tiered Slabs Table */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Consumption Tier Slabs
            </div>
            <button
              type="button"
              onClick={handleAddSlab}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
            >
              <Plus className="w-3 h-3" />
              Add Slab
            </button>
          </div>

          <div className="space-y-2">
            {formState.slabs.map((slab, idx) => (
              <div key={slab.id || idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                <div className="flex-1">
                  <input
                    type="text"
                    value={slab.label}
                    onChange={(e) => handleSlabChange(idx, 'label', e.target.value)}
                    className="w-full text-xs font-medium border-b border-transparent focus:border-sky-500 outline-none text-slate-800"
                    placeholder="Slab Label"
                  />
                </div>
                <div className="w-20">
                  <span className="text-[10px] text-slate-400 block">Min kWh</span>
                  <input
                    type="number"
                    value={slab.minKwh}
                    onChange={(e) => handleSlabChange(idx, 'minKwh', e.target.value)}
                    className="w-full border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs"
                  />
                </div>
                <div className="w-20">
                  <span className="text-[10px] text-slate-400 block">Max kWh</span>
                  <input
                    type="text"
                    value={slab.maxKwh === Infinity ? 'Infinity' : slab.maxKwh}
                    onChange={(e) => handleSlabChange(idx, 'maxKwh', e.target.value === 'Infinity' ? Infinity : e.target.value)}
                    className="w-full border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs"
                  />
                </div>
                <div className="w-24">
                  <span className="text-[10px] text-slate-400 block">Rate (₹/unit)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={slab.ratePerKwh}
                    onChange={(e) => handleSlabChange(idx, 'ratePerKwh', e.target.value)}
                    className="w-full border border-slate-200 rounded px-1.5 py-0.5 font-mono font-bold text-xs"
                  />
                </div>
                {formState.slabs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlab(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 mt-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Standard Tariff Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center gap-1"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Applied!
                </>
              ) : (
                'Save Tariff Structure'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
