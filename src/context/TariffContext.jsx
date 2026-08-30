import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_TARIFF_CONFIG, calculateTieredBill, projectMonthEndBill } from '../services/tariffEngine';

const TariffContext = createContext(null);

export const TariffProvider = ({ children }) => {
  const [tariffConfig, setTariffConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('gridsense_tariff_config');
      return saved ? JSON.parse(saved) : DEFAULT_TARIFF_CONFIG;
    } catch {
      return DEFAULT_TARIFF_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('gridsense_tariff_config', JSON.stringify(tariffConfig));
  }, [tariffConfig]);

  const updateTariff = (newConfig) => {
    setTariffConfig(newConfig);
  };

  const updateSlab = (slabId, updatedFields) => {
    setTariffConfig(prev => ({
      ...prev,
      slabs: prev.slabs.map(s => s.id === slabId ? { ...s, ...updatedFields } : s)
    }));
  };

  const addSlab = (newSlab) => {
    setTariffConfig(prev => {
      const nextId = prev.slabs.length ? Math.max(...prev.slabs.map(s => s.id)) + 1 : 1;
      return {
        ...prev,
        slabs: [...prev.slabs, { ...newSlab, id: nextId }]
      };
    });
  };

  const removeSlab = (slabId) => {
    setTariffConfig(prev => ({
      ...prev,
      slabs: prev.slabs.filter(s => s.id !== slabId)
    }));
  };

  const resetToDefaults = () => {
    setTariffConfig(DEFAULT_TARIFF_CONFIG);
  };

  const computeBill = (kwh) => calculateTieredBill(kwh, tariffConfig);
  const computeProjection = (currentKwh, daysElapsed = 24, totalDays = 30) => 
    projectMonthEndBill(currentKwh, daysElapsed, totalDays, tariffConfig);

  return (
    <TariffContext.Provider value={{
      tariffConfig,
      updateTariff,
      updateSlab,
      addSlab,
      removeSlab,
      resetToDefaults,
      computeBill,
      computeProjection
    }}>
      {children}
    </TariffContext.Provider>
  );
};

export const useTariff = () => {
  const context = useContext(TariffContext);
  if (!context) {
    throw new Error('useTariff must be used within a TariffProvider');
  }
  return context;
};
