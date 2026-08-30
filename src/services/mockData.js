/**
 * GridSense Mock Data & Grid Physics Simulation Engine
 * Generates realistic electrical telemetry, time-series, NILM appliance breakdown,
 * and historical logs when operating without an active backend.
 */

export const DEFAULT_THRESHOLDS = {
  voltage: { min: 207, max: 253, nominal: 230, unit: 'V' },        // ±10% per IS 12360 / IEC 60038
  current: { warning: 30, max: 40, unit: 'A' },                   // Max 40A service breaker
  power: { warning: 7000, max: 9000, unit: 'W' },
  powerFactor: { min: 0.85, nominal: 0.95, unit: '' },            // Penalized if <0.85
  frequency: { min: 49.5, max: 50.5, nominal: 50.0, unit: 'Hz' }, // Standard Indian Grid Frequency
  energy: { monthlyBudget: 450, unit: 'kWh' }
};

export const METER_METADATA = {
  meterId: "MTR-IND-KA-0942",
  consumerName: "Rajesh Kumar",
  consumerId: "CON-884210-BLR",
  sanctionedLoadKw: 7.5,
  phase: "Single Phase 2-Wire",
  installationDate: "2024-03-15",
  transformerId: "DT-BLR-SOUTH-118",
  substation: "Koramangala 66/11kV Substation",
  firmwareVersion: "v2.4.12-secure",
  ipAddress: "192.168.1.145",
  lastCalibrationDate: "2025-11-10",
  status: "ONLINE" // ONLINE | OFFLINE | FAULT
};

// Generate initial 30 sparkline data points
export const generateInitialSparkline = (nominal, variance, count = 30) => {
  const points = [];
  const now = Date.now();
  let val = nominal;
  for (let i = count - 1; i >= 0; i--) {
    val += (Math.random() - 0.5) * variance;
    // Bound reasonably
    val = Math.max(nominal * 0.85, Math.min(nominal * 1.15, val));
    points.push({
      time: new Date(now - i * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now - i * 1000,
      value: Number(val.toFixed(2))
    });
  }
  return points;
};

// State store for cumulative energy integration in mock mode
let currentCumulativeKwh = 346.82;
let lastTickTime = Date.now();

/**
 * Generate next live telemetry tick with physical consistency
 */
export const getNextMockTelemetry = (previousState = null, forceAnomaly = null) => {
  const now = Date.now();
  const timeDeltaHours = Math.max(0.0001, (now - lastTickTime) / 3600000);
  lastTickTime = now;

  let voltage = previousState ? previousState.voltage : 230.5;
  let current = previousState ? previousState.current : 14.2;
  let powerFactor = previousState ? previousState.powerFactor : 0.94;
  let frequency = previousState ? previousState.frequency : 50.02;

  // Random walk
  voltage += (Math.random() - 0.49) * 0.8;
  voltage = Math.max(215, Math.min(245, voltage));

  // Current variation (simulates appliances turning on/off)
  current += (Math.random() - 0.5) * 0.4;
  current = Math.max(2.5, Math.min(32.0, current));

  // Power factor slightly responds to current
  powerFactor += (Math.random() - 0.5) * 0.01;
  powerFactor = Math.max(0.82, Math.min(0.99, powerFactor));

  // Grid frequency fluctuation
  frequency += (Math.random() - 0.5) * 0.04;
  frequency = Math.max(49.75, Math.min(50.25, frequency));

  // Inject manual anomaly if requested for testing
  if (forceAnomaly === 'overvoltage') voltage = 258.4;
  if (forceAnomaly === 'undervoltage') voltage = 196.2;
  if (forceAnomaly === 'overcurrent') current = 38.6;
  if (forceAnomaly === 'low_pf') powerFactor = 0.76;
  if (forceAnomaly === 'freq_dip') frequency = 49.32;

  // Physical formulas
  const activePowerW = voltage * current * powerFactor;
  const apparentPowerVa = voltage * current;
  const reactivePowerVar = Math.sqrt(Math.max(0, Math.pow(apparentPowerVa, 2) - Math.pow(activePowerW, 2)));

  // Integrate energy: kWh += kW * deltaHours
  currentCumulativeKwh += (activePowerW / 1000) * timeDeltaHours;

  const timestampStr = new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    timestamp: now,
    timeString: timestampStr,
    voltage: Number(voltage.toFixed(1)),
    current: Number(current.toFixed(2)),
    activePower: Number(activePowerW.toFixed(1)),
    apparentPower: Number(apparentPowerVa.toFixed(1)),
    reactivePower: Number(reactivePowerVar.toFixed(1)),
    energyKwh: Number(currentCumulativeKwh.toFixed(3)),
    powerFactor: Number(powerFactor.toFixed(3)),
    frequency: Number(frequency.toFixed(2)),
    thdPercent: Number((2.1 + (Math.random() - 0.5) * 0.4).toFixed(1)),
    phaseAngleDeg: Number((Math.acos(powerFactor) * (180 / Math.PI)).toFixed(1)),
    neutralCurrent: Number((Math.random() * 0.8).toFixed(2)),
    gridStatus: (voltage > 255 || voltage < 200 || frequency < 49.4 || frequency > 50.6) ? 'FAULT' : 'ONLINE'
  };
};

/**
 * Historical time-series generator for date ranges & resolutions
 */
export const generateHistoricalData = (rangeKey = '24h', resolution = '1h') => {
  const data = [];
  const now = Date.now();
  let pointsCount = 24;
  let intervalMs = 3600 * 1000; // 1 hour

  if (rangeKey === '1h') {
    pointsCount = 60;
    intervalMs = 60 * 1000; // 1 min
  } else if (rangeKey === '24h') {
    pointsCount = resolution === '1m' ? 1440 : 24;
    intervalMs = resolution === '1m' ? 60 * 1000 : 3600 * 1000;
  } else if (rangeKey === '7d') {
    pointsCount = resolution === '1h' ? 168 : 7;
    intervalMs = resolution === '1h' ? 3600 * 1000 : 24 * 3600 * 1000;
  } else if (rangeKey === '30d') {
    pointsCount = 30;
    intervalMs = 24 * 3600 * 1000;
  }

  // Generate diurnal curve base
  let runningEnergy = 280.0;
  for (let i = pointsCount - 1; i >= 0; i--) {
    const timePoint = new Date(now - i * intervalMs);
    const hour = timePoint.getHours();
    
    // Diurnal factor: higher in morning 7-10 and evening 18-22
    let diurnalMultiplier = 1.0;
    if (hour >= 6 && hour <= 9) diurnalMultiplier = 1.6;
    else if (hour >= 18 && hour <= 22) diurnalMultiplier = 2.1;
    else if (hour >= 12 && hour <= 15) diurnalMultiplier = 1.3;
    else if (hour >= 1 && hour <= 5) diurnalMultiplier = 0.45;

    const baseVoltage = 229 + Math.sin(i / 3) * 3 + (Math.random() - 0.5) * 2;
    const baseCurrent = (6.0 * diurnalMultiplier) + (Math.random() - 0.5) * 1.5;
    const pf = 0.92 + (Math.random() - 0.5) * 0.05;
    const powerKw = (baseVoltage * baseCurrent * pf) / 1000;
    const energyIncrement = powerKw * (intervalMs / 3600000);
    runningEnergy += energyIncrement;

    const label = rangeKey === '1h' || (rangeKey === '24h' && resolution === '1m')
      ? timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : rangeKey === '24h'
      ? `${timePoint.getHours()}:00`
      : rangeKey === '7d' && resolution === '1d'
      ? timePoint.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
      : `${timePoint.getMonth()+1}/${timePoint.getDate()} ${timePoint.getHours()}:00`;

    data.push({
      timestamp: timePoint.getTime(),
      dateLabel: label,
      isoTime: timePoint.toISOString(),
      voltage: Number(baseVoltage.toFixed(1)),
      current: Number(baseCurrent.toFixed(2)),
      activePowerKw: Number(powerKw.toFixed(2)),
      powerFactor: Number(pf.toFixed(2)),
      frequency: Number((50.0 + (Math.sin(i / 2) * 0.12) + (Math.random() - 0.5) * 0.08).toFixed(2)),
      energyKwh: Number(runningEnergy.toFixed(2)),
      periodKwh: Number(energyIncrement.toFixed(3)),
    });
  }

  return data;
};

/**
 * Consumption aggregation summary (Daily, Weekly, Monthly)
 */
export const getConsumptionSummaryData = () => {
  return {
    daily: {
      currentPeriod: 14.8,
      previousPeriod: 16.2,
      unit: 'kWh',
      deltaPercent: -8.6,
      trend: 'down',
      averageDailyCost: 96.2, // INR
      chartData: [
        { label: '00:00', current: 0.42, previous: 0.50, peak: false },
        { label: '03:00', current: 0.35, previous: 0.38, peak: false },
        { label: '06:00', current: 0.95, previous: 1.10, peak: false },
        { label: '08:00', current: 2.10, previous: 2.40, peak: true },
        { label: '11:00', current: 1.45, previous: 1.60, peak: false },
        { label: '14:00', current: 1.80, previous: 1.75, peak: false },
        { label: '17:00', current: 1.30, previous: 1.45, peak: false },
        { label: '19:00', current: 2.85, previous: 3.10, peak: true },
        { label: '21:00', current: 2.40, previous: 2.65, peak: true },
        { label: '23:00', current: 1.18, previous: 1.27, peak: false },
      ]
    },
    weekly: {
      currentPeriod: 98.4,
      previousPeriod: 106.8,
      unit: 'kWh',
      deltaPercent: -7.9,
      trend: 'down',
      averageDailyCost: 92.4,
      chartData: [
        { label: 'Mon', current: 14.2, previous: 15.6 },
        { label: 'Tue', current: 13.8, previous: 14.9 },
        { label: 'Wed', current: 14.5, previous: 15.1 },
        { label: 'Thu', current: 13.1, previous: 14.8 },
        { label: 'Fri', current: 15.4, previous: 16.2 },
        { label: 'Sat', current: 17.8, previous: 18.9 },
        { label: 'Sun', current: 19.6, previous: 21.3 },
      ]
    },
    monthly: {
      currentPeriod: 346.8,
      previousPeriod: 382.4,
      unit: 'kWh',
      deltaPercent: -9.3,
      trend: 'down',
      projectedMonthEnd: 412.0,
      chartData: [
        { label: 'Week 1', current: 88.5, previous: 96.2 },
        { label: 'Week 2', current: 84.2, previous: 94.8 },
        { label: 'Week 3', current: 91.0, previous: 98.1 },
        { label: 'Week 4 (Proj)', current: 83.1, previous: 93.3 },
      ]
    }
  };
};

/**
 * 24h x 7d Peak Usage Intensity Heatmap Matrix
 * Returns 7 rows (days) with 24 columns (hours) with load level 0.0 - 1.0
 */
export const generatePeakHeatmapMatrix = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day, dayIndex) => {
    const isWeekend = dayIndex >= 5;
    const hours = [];
    for (let h = 0; h < 24; h++) {
      let intensity = 0.15; // baseline standby
      if (h >= 6 && h <= 9) intensity = isWeekend ? 0.65 : 0.85; // Morning rush
      else if (h >= 10 && h <= 16) intensity = isWeekend ? 0.70 : 0.40; // Daytime
      else if (h >= 18 && h <= 22) intensity = 0.95; // Evening peak
      else if (h >= 23 || h <= 5) intensity = 0.20; // Night
      
      // add small stochastic variance
      intensity += (Math.random() - 0.5) * 0.1;
      intensity = Math.max(0.05, Math.min(1.0, intensity));

      hours.push({
        hour: h,
        hourLabel: `${h.toString().padStart(2, '0')}:00`,
        intensity: Number(intensity.toFixed(2)),
        kwh: Number((intensity * 3.2).toFixed(2)), // max ~3.2 kW
        isPeakWindow: (h >= 18 && h <= 22) || (h >= 7 && h <= 9)
      });
    }
    return { day, hours };
  });
};

/**
 * NILM (Non-Intrusive Load Monitoring) Disaggregation Data
 */
export const NILM_APPLIANCE_DATA = [
  {
    id: "app-ac",
    name: "Inverter AC (1.5 Ton Master Bedroom)",
    category: "HVAC",
    kwhThisMonth: 145.6,
    percentage: 42,
    activeHoursPerDay: 7.2,
    ratedPowerW: 1650,
    currentStatus: "RUNNING (ECO Mode)",
    isHighConsumer: true,
    standbyW: 4.5,
    estimatedCostInr: 1019.20,
    health: "Normal"
  },
  {
    id: "app-geyser",
    name: "Storage Water Geyser (25L)",
    category: "Water Heating",
    kwhThisMonth: 72.8,
    percentage: 21,
    activeHoursPerDay: 1.8,
    ratedPowerW: 2000,
    currentStatus: "IDLE",
    isHighConsumer: true,
    standbyW: 0.0,
    estimatedCostInr: 509.60,
    health: "Normal"
  },
  {
    id: "app-fridge",
    name: "Double-Door Refrigerator (340L)",
    category: "Refrigeration",
    kwhThisMonth: 52.0,
    percentage: 15,
    activeHoursPerDay: 24.0,
    ratedPowerW: 180,
    currentStatus: "COMPRESSOR CYCLING",
    isHighConsumer: false,
    standbyW: 12.0,
    estimatedCostInr: 364.00,
    health: "Normal"
  },
  {
    id: "app-kitchen",
    name: "Induction Cooktop & Microwave",
    category: "Kitchen",
    kwhThisMonth: 34.7,
    percentage: 10,
    activeHoursPerDay: 1.2,
    ratedPowerW: 1800,
    currentStatus: "IDLE",
    isHighConsumer: false,
    standbyW: 6.2,
    estimatedCostInr: 242.90,
    health: "Normal"
  },
  {
    id: "app-lighting",
    name: "Lighting, Ceiling Fans & TV",
    category: "Lighting & Entertainment",
    kwhThisMonth: 24.3,
    percentage: 7,
    activeHoursPerDay: 8.5,
    ratedPowerW: 320,
    currentStatus: "ACTIVE",
    isHighConsumer: false,
    standbyW: 8.0,
    estimatedCostInr: 170.10,
    health: "Normal"
  },
  {
    id: "app-standby",
    name: "Phantom / Vampire Standby Load",
    category: "Standby Leakage",
    kwhThisMonth: 17.4,
    percentage: 5,
    activeHoursPerDay: 24.0,
    ratedPowerW: 85,
    currentStatus: "CONTINUOUS DRAIN (85W)",
    isHighConsumer: false,
    standbyW: 85.0,
    estimatedCostInr: 121.80,
    health: "Optimization Recommended"
  }
];

/**
 * Initial Simulated System Alerts
 */
export const INITIAL_ALERTS = [
  {
    id: "ALT-2026-089",
    type: "OVERVOLTAGE",
    title: "Overvoltage Surge Detected",
    description: "Line voltage reached 254.2V (exceeding upper threshold 253V) for 4.2 seconds.",
    severity: "critical", // info | warning | critical
    status: "active",     // active | acknowledged | resolved
    timestamp: Date.now() - 14 * 60 * 1000,
    metric: "Voltage",
    measuredValue: "254.2 V",
    thresholdValue: "> 253.0 V",
    recommendation: "Check upstream grid tap changer. Sensitive inductive equipment may trip."
  },
  {
    id: "ALT-2026-088",
    type: "LOW_POWER_FACTOR",
    title: "Low Power Factor Warning",
    description: "Power factor dropped to 0.81 during peak evening AC compressor startup.",
    severity: "warning",
    status: "active",
    timestamp: Date.now() - 48 * 60 * 1000,
    metric: "Power Factor",
    measuredValue: "0.81",
    thresholdValue: "< 0.85",
    recommendation: "Consider automatic capacitor bank installation to avoid utility low-PF surcharge."
  },
  {
    id: "ALT-2026-087",
    type: "STANDBY_LOAD",
    title: "Excessive Standby Drain Detected",
    description: "Continuous 88W baseline load sustained during off-peak hours (02:00 - 05:30 AM).",
    severity: "info",
    status: "acknowledged",
    timestamp: Date.now() - 6 * 3600 * 1000,
    metric: "Phantom Load",
    measuredValue: "88 W continuous",
    thresholdValue: "> 50 W night baseline",
    recommendation: "Identify idling smart TVs, gaming consoles, or set-top boxes on standby."
  },
  {
    id: "ALT-2026-086",
    type: "LOAD_SURGE",
    title: "High Peak Demand Spike",
    description: "Simultaneous startup of 2 heavy loads pushed active power to 6.84 kW (91% of sanctioned load).",
    severity: "warning",
    status: "resolved",
    timestamp: Date.now() - 22 * 3600 * 1000,
    metric: "Active Power",
    measuredValue: "6.84 kW",
    thresholdValue: "> 6.00 kW",
    recommendation: "Stagger water heater and EV charging schedules to avoid maximum demand penalties."
  },
  {
    id: "ALT-2026-085",
    type: "FREQ_ANOMALY",
    title: "Grid Frequency Deviation",
    description: "Grid frequency briefly dipped to 49.42 Hz during regional transmission line tripping.",
    severity: "info",
    status: "resolved",
    timestamp: Date.now() - 46 * 3600 * 1000,
    metric: "Frequency",
    measuredValue: "49.42 Hz",
    thresholdValue: "< 49.50 Hz",
    recommendation: "Grid-side transient event. System returned to nominal within 18 seconds."
  }
];

/**
 * Sample Report Archive
 */
export const SAMPLE_REPORT_HISTORY = [
  {
    id: "REP-2026-08-M",
    title: "Monthly Energy Audit — August 2026",
    dateRange: "Aug 1, 2026 - Aug 30, 2026",
    generatedAt: "2026-08-30 17:00:00",
    totalConsumptionKwh: 346.8,
    totalCostInr: 2427.60,
    peakDemandKw: 6.84,
    averagePowerFactor: 0.93,
    anomaliesCount: 4,
    fileFormat: "PDF",
    fileSize: "1.4 MB"
  },
  {
    id: "REP-2026-07-M",
    title: "Monthly Energy Audit — July 2026",
    dateRange: "Jul 1, 2026 - Jul 31, 2026",
    generatedAt: "2026-08-01 09:15:00",
    totalConsumptionKwh: 382.4,
    totalCostInr: 2795.50,
    peakDemandKw: 7.12,
    averagePowerFactor: 0.91,
    anomaliesCount: 6,
    fileFormat: "PDF",
    fileSize: "1.5 MB"
  },
  {
    id: "REP-2026-W34",
    title: "Weekly Operational Summary — W34",
    dateRange: "Aug 18, 2026 - Aug 24, 2026",
    generatedAt: "2026-08-25 08:00:00",
    totalConsumptionKwh: 98.4,
    totalCostInr: 688.80,
    peakDemandKw: 6.20,
    averagePowerFactor: 0.94,
    anomaliesCount: 1,
    fileFormat: "PDF",
    fileSize: "840 KB"
  }
];
