import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useEnergyData } from '../../context/EnergyDataContext';
import { Check, RotateCcw } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../../services/mockData';

export const ThresholdModal = ({ isOpen, onClose }) => {
  const { thresholds, updateThresholds } = useEnergyData();
  const [formState, setFormState] = useState(thresholds);
  const [savedMessage, setSavedMessage] = useState(false);

  // Sync with current thresholds when opening
  React.useEffect(() => {
    if (isOpen) {
      setFormState(thresholds);
      setSavedMessage(false);
    }
  }, [isOpen, thresholds]);

  const handleChange = (category, field, value) => {
    setFormState(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: Number(value)
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateThresholds(formState);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setFormState(DEFAULT_THRESHOLDS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Electrical Threshold Limits"
      subtitle="Adjust alarm thresholds for overvoltage, overcurrent, power factor, and grid frequency."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Voltage section */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
          <div className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] flex justify-between">
            <span>Voltage Thresholds (Volts)</span>
            <span className="text-slate-400 font-normal">Nominal: 230 V</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Undervoltage Alarm (Min)</label>
              <input
                type="number"
                step="1"
                value={formState.voltage.min}
                onChange={(e) => handleChange('voltage', 'min', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Overvoltage Alarm (Max)</label>
              <input
                type="number"
                step="1"
                value={formState.voltage.max}
                onChange={(e) => handleChange('voltage', 'max', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Current & Power section */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
          <div className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] flex justify-between">
            <span>Current & Power Limits</span>
            <span className="text-slate-400 font-normal">Breaker rating: 40A</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Overcurrent Limit (Amps)</label>
              <input
                type="number"
                step="0.5"
                value={formState.current.max}
                onChange={(e) => handleChange('current', 'max', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Max Power Warning (Watts)</label>
              <input
                type="number"
                step="100"
                value={formState.power.max}
                onChange={(e) => handleChange('power', 'max', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Power Factor & Frequency section */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
          <div className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] flex justify-between">
            <span>Power Quality Tolerances</span>
            <span className="text-slate-400 font-normal">Nominal: 50.00 Hz / 0.95 PF</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Low PF Penalty Limit (Min)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={formState.powerFactor.min}
                onChange={(e) => handleChange('powerFactor', 'min', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Min Grid Frequency (Hz)</label>
              <input
                type="number"
                step="0.1"
                value={formState.frequency.min}
                onChange={(e) => handleChange('frequency', 'min', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2 py-1 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to IS 12360 Norms
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
              {savedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved!
                </>
              ) : (
                'Save Thresholds'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
