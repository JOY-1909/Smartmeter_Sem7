/**
 * GridSense Centralized API Integration Service Layer
 * 
 * Provides unified REST API client functions for all views.
 * Supports switching between local high-fidelity simulated telemetry
 * and a live backend REST service via the VITE_USE_MOCK_DATA flag.
 * 
 * To wire up a real backend:
 * 1. Set VITE_USE_MOCK_DATA=false in your .env file
 * 2. Set VITE_API_BASE_URL=https://your-backend-api.domain.com/api/v1
 * 3. Replace the placeholder bodies in the functions below if your endpoint schema differs.
 */

import {
  getNextMockTelemetry,
  generateHistoricalData,
  getConsumptionSummaryData,
  INITIAL_ALERTS,
  NILM_APPLIANCE_DATA,
  SAMPLE_REPORT_HISTORY,
  METER_METADATA,
  DEFAULT_THRESHOLDS
} from './mockData';

import {
  calculateTieredBill,
  projectMonthEndBill,
  DEFAULT_TARIFF_CONFIG
} from './tariffEngine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

// Helper for simulated async network latency in mock mode
const simulateLatency = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for authenticated fetch headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('gridsense_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * 1. Real-Time Snapshot Data
 * Fetch current single-point snapshot of electrical metrics.
 * (Note: Continuous streaming is handled via useRealtimeSocket hook)
 */
export async function getRealtimeData(meterId = import.meta.env.VITE_DEFAULT_METER_ID) {
  if (USE_MOCK) {
    await simulateLatency(80);
    return {
      success: true,
      data: getNextMockTelemetry(),
      meter: METER_METADATA,
      thresholds: DEFAULT_THRESHOLDS
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/meters/${meterId}/telemetry/live`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getRealtimeData]:', error);
    throw error;
  }
}

/**
 * 2. Historical Time-Series Telemetry
 * Fetch historical data for charts across ranges ('1h', '24h', '7d', '30d', custom)
 * and resolutions ('raw', '1m', '1h', '1d').
 */
export async function getHistoricalData(range = '24h', resolution = '1h', meterId = import.meta.env.VITE_DEFAULT_METER_ID) {
  if (USE_MOCK) {
    await simulateLatency(150);
    return {
      success: true,
      range,
      resolution,
      data: generateHistoricalData(range, resolution)
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/meters/${meterId}/telemetry/historical?range=${range}&resolution=${resolution}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getHistoricalData]:', error);
    throw error;
  }
}

/**
 * 3. Consumption Summary Data
 * Aggregated energy metrics for Daily, Weekly, and Monthly consumer views.
 */
export async function getConsumptionSummary(period = 'daily', meterId = import.meta.env.VITE_DEFAULT_METER_ID) {
  if (USE_MOCK) {
    await simulateLatency(120);
    const summaries = getConsumptionSummaryData();
    return {
      success: true,
      period,
      data: summaries[period] || summaries.daily,
      allSummaries: summaries
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/meters/${meterId}/consumption/summary?period=${period}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getConsumptionSummary]:', error);
    throw error;
  }
}

/**
 * 4. NILM (Non-Intrusive Load Monitoring) Appliance Breakdown
 * Fetch sub-metering breakdown and phantom standby drain.
 */
export async function getNILMApplianceData(meterId = import.meta.env.VITE_DEFAULT_METER_ID) {
  if (USE_MOCK) {
    await simulateLatency(100);
    return {
      success: true,
      appliances: NILM_APPLIANCE_DATA,
      totalDisaggregatedKwh: 346.8,
      standbyDrainW: 85.0
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/meters/${meterId}/nilm/disaggregation`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getNILMApplianceData]:', error);
    throw error;
  }
}

/**
 * 5. Electricity Bill Estimation & Slab Projections
 * Fetch calculation based on current meter reading and customized tariff structure.
 */
export async function getBillEstimate(currentKwh = 346.82, tariffConfig = DEFAULT_TARIFF_CONFIG, daysElapsed = 24) {
  if (USE_MOCK) {
    await simulateLatency(80);
    const calculation = projectMonthEndBill(currentKwh, daysElapsed, 30, tariffConfig);
    return {
      success: true,
      data: calculation
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/billing/estimate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentKwh, tariffConfig, daysElapsed })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getBillEstimate]:', error);
    throw error;
  }
}

/**
 * 6. Alerts & Fault Logs
 * Fetch system alarms, threshold violations, and historical fault events.
 */
export async function getAlerts(filter = { severity: 'all', status: 'all' }) {
  if (USE_MOCK) {
    await simulateLatency(100);
    let alerts = [...INITIAL_ALERTS];
    if (filter.severity && filter.severity !== 'all') {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }
    if (filter.status && filter.status !== 'all') {
      alerts = alerts.filter(a => a.status === filter.status);
    }
    return {
      success: true,
      alerts,
      totalCount: alerts.length,
      activeCriticalCount: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length
    };
  }

  // TODO: Replace with real backend API call
  try {
    const params = new URLSearchParams(filter);
    const response = await fetch(`${API_BASE_URL}/alerts?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [getAlerts]:', error);
    throw error;
  }
}

/**
 * 7. Acknowledge / Dismiss Alert
 */
export async function acknowledgeAlert(alertId, note = 'Acknowledged by operator') {
  if (USE_MOCK) {
    await simulateLatency(50);
    return {
      success: true,
      alertId,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      note
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [acknowledgeAlert]:', error);
    throw error;
  }
}

/**
 * 8. Energy Consumption Reports Generation
 * Trigger or retrieve historical audit reports.
 */
export async function generateReport(params = { dateRange: '2026-08', format: 'pdf' }) {
  if (USE_MOCK) {
    await simulateLatency(300);
    const newReport = {
      id: `REP-${Date.now().toString().slice(-6)}`,
      title: `Energy Audit Report — ${params.dateRange || 'Custom Range'}`,
      dateRange: params.dateRange || 'Aug 1 - Aug 30, 2026',
      generatedAt: new Date().toLocaleString(),
      totalConsumptionKwh: 346.8,
      totalCostInr: 2427.60,
      peakDemandKw: 6.84,
      averagePowerFactor: 0.93,
      anomaliesCount: 3,
      fileFormat: params.format?.toUpperCase() || 'PDF',
      fileSize: '1.2 MB'
    };
    return {
      success: true,
      report: newReport,
      history: [newReport, ...SAMPLE_REPORT_HISTORY]
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error [generateReport]:', error);
    throw error;
  }
}

/**
 * 9. Authentication: JWT Login
 */
export async function loginUser(email, password) {
  if (USE_MOCK) {
    await simulateLatency(200);
    // Mock user identification
    const isOperator = email.includes('admin') || email.includes('operator');
    const role = isOperator ? 'operator' : 'consumer';
    const user = {
      id: isOperator ? 'USR-OP-001' : 'USR-CON-8842',
      name: isOperator ? 'Operations Control Room' : 'Rajesh Kumar',
      email,
      role, // 'operator' | 'consumer'
      meterId: 'MTR-IND-KA-0942',
      accountNumber: 'CA-993821098'
    };
    const token = `gridsense_mock_jwt_${btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }))}`;
    return {
      success: true,
      token,
      user
    };
  }

  // TODO: Replace with real backend API call
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error [loginUser]:', error);
    throw error;
  }
}
