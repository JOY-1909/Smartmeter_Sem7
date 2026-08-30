/**
 * Indian Tiered/Slab Tariff Calculation Engine
 * Supports multi-tier progressive billing, fixed capacity charges,
 * electricity duty, fuel adjustment charge (FAC), and month-end projections.
 */

export const DEFAULT_TARIFF_CONFIG = {
  currencySymbol: "₹",
  fixedChargePerKw: 70.0, // ₹ per kW of sanctioned load per month
  sanctionedLoadKw: 7.5,
  slabs: [
    { id: 1, minKwh: 0, maxKwh: 100, ratePerKwh: 4.15, label: "0 - 100 units (Subsidized)" },
    { id: 2, minKwh: 101, maxKwh: 200, ratePerKwh: 5.60, label: "101 - 200 units (Standard)" },
    { id: 3, minKwh: 201, maxKwh: 400, ratePerKwh: 7.15, label: "201 - 400 units (Mid-tier)" },
    { id: 4, minKwh: 401, maxKwh: Infinity, ratePerKwh: 8.90, label: "> 400 units (High-tier)" },
  ],
  fuelSurchargePerKwh: 0.28, // FAC (Fuel Adjustment Charge)
  electricityDutyPercent: 6.0, // State electricity duty %
  meterRentFixed: 50.0,
};

/**
 * Calculate detailed bill breakdown for a given kWh consumption
 */
export const calculateTieredBill = (totalKwh, tariffConfig = DEFAULT_TARIFF_CONFIG) => {
  const kwh = Math.max(0, Number(totalKwh) || 0);
  const fixedCharges = tariffConfig.fixedChargePerKw * tariffConfig.sanctionedLoadKw + tariffConfig.meterRentFixed;

  let remainingKwh = kwh;
  let energyCharges = 0;
  const slabBreakdown = [];

  for (let i = 0; i < tariffConfig.slabs.length; i++) {
    const slab = tariffConfig.slabs[i];
    const slabSpan = slab.maxKwh === Infinity ? Infinity : (slab.maxKwh - slab.minKwh + (i === 0 ? 1 : 0));
    
    // Units falling in this slab
    const unitsInSlab = Math.max(0, Math.min(remainingKwh, slabSpan));
    const costForSlab = unitsInSlab * slab.ratePerKwh;

    slabBreakdown.push({
      slabId: slab.id,
      label: slab.label,
      minKwh: slab.minKwh,
      maxKwh: slab.maxKwh,
      ratePerKwh: slab.ratePerKwh,
      unitsConsumed: Number(unitsInSlab.toFixed(2)),
      cost: Number(costForSlab.toFixed(2)),
      isCurrentTier: unitsInSlab > 0 && (remainingKwh <= slabSpan || i === tariffConfig.slabs.length - 1)
    });

    energyCharges += costForSlab;
    remainingKwh -= unitsInSlab;
    if (remainingKwh <= 0) break;
  }

  // Fuel Adjustment Charge (FAC)
  const facCharge = kwh * tariffConfig.fuelSurchargePerKwh;

  // Subtotal before tax
  const subtotal = energyCharges + fixedCharges + facCharge;

  // Electricity Duty / State Tax
  const electricityDuty = (subtotal * tariffConfig.electricityDutyPercent) / 100;

  // Final Total Bill
  const totalBill = subtotal + electricityDuty;

  // Average effective rate per unit (₹/kWh)
  const effectiveRate = kwh > 0 ? totalBill / kwh : 0;

  return {
    totalKwh: Number(kwh.toFixed(2)),
    energyCharges: Number(energyCharges.toFixed(2)),
    fixedCharges: Number(fixedCharges.toFixed(2)),
    facCharge: Number(facCharge.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    electricityDuty: Number(electricityDuty.toFixed(2)),
    dutyPercent: tariffConfig.electricityDutyPercent,
    totalBill: Number(totalBill.toFixed(2)),
    effectiveRate: Number(effectiveRate.toFixed(2)),
    currencySymbol: tariffConfig.currencySymbol,
    slabBreakdown
  };
};

/**
 * Estimate projected month-end bill based on current elapsed days in cycle
 */
export const projectMonthEndBill = (currentKwh, daysElapsed = 24, totalDaysInCycle = 30, tariffConfig = DEFAULT_TARIFF_CONFIG) => {
  const safeDaysElapsed = Math.max(1, Math.min(totalDaysInCycle, daysElapsed));
  const dailyRunRateKwh = currentKwh / safeDaysElapsed;
  const projectedTotalKwh = dailyRunRateKwh * totalDaysInCycle;

  const currentBill = calculateTieredBill(currentKwh, tariffConfig);
  const projectedBill = calculateTieredBill(projectedTotalKwh, tariffConfig);

  return {
    currentKwh: Number(currentKwh.toFixed(2)),
    daysElapsed: safeDaysElapsed,
    totalDaysInCycle,
    daysRemaining: totalDaysInCycle - safeDaysElapsed,
    dailyRunRateKwh: Number(dailyRunRateKwh.toFixed(2)),
    projectedTotalKwh: Number(projectedTotalKwh.toFixed(2)),
    currentBillAmount: currentBill.totalBill,
    projectedBillAmount: projectedBill.totalBill,
    projectedCostVariance: Number((projectedBill.totalBill - currentBill.totalBill).toFixed(2)),
    currentBillDetails: currentBill,
    projectedBillDetails: projectedBill
  };
};
