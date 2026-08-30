import React from 'react';
import { BillEstimator } from '../components/billing/BillEstimator';

export const BillingEstimatorPage = () => {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded border border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Electricity Bill Estimation & Slab Tariff Modeling
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Progressive slab tariff engine simulating residential and commercial billing under Indian regulatory frameworks.
        </p>
      </div>

      <BillEstimator />
    </div>
  );
};
