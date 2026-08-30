import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { DEFAULT_THRESHOLDS, METER_METADATA, INITIAL_ALERTS, generateInitialSparkline } from '../services/mockData';

const EnergyDataContext = createContext(null);

const SPARKLINE_BUFFER_SIZE = 30;

export const EnergyDataProvider = ({ children }) => {
  // Configurable thresholds
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('gridsense_thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  // Rolling sparkline buffers for all 6 core metrics
  const [sparklines, setSparklines] = useState({
    voltage: generateInitialSparkline(230.5, 1.2, SPARKLINE_BUFFER_SIZE),
    current: generateInitialSparkline(14.2, 0.8, SPARKLINE_BUFFER_SIZE),
    activePower: generateInitialSparkline(3080, 200, SPARKLINE_BUFFER_SIZE),
    energy: generateInitialSparkline(346.8, 0.05, SPARKLINE_BUFFER_SIZE),
    powerFactor: generateInitialSparkline(0.94, 0.015, SPARKLINE_BUFFER_SIZE),
    frequency: generateInitialSparkline(50.02, 0.05, SPARKLINE_BUFFER_SIZE),
  });

  // Live waveform rolling history for graph (last 60 ticks)
  const [liveStreamHistory, setLiveStreamHistory] = useState([]);

  // Alerts state
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('gridsense_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  // Real-time toast notifications queue
  const [activeToasts, setActiveToasts] = useState([]);

  // Cooldown tracker to avoid alert spamming
  const lastAlertTimestampRef = useRef({});

  // Meter metadata
  const [meter, setMeter] = useState(METER_METADATA);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gridsense_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    localStorage.setItem('gridsense_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Toast removal helper
  const removeToast = useCallback((toastId) => {
    setActiveToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Alert evaluator against current thresholds
  const evaluateAlerts = useCallback((telemetry) => {
    const now = Date.now();
    const newAlarms = [];

    const canTrigger = (key, cooldownMs = 15000) => {
      const last = lastAlertTimestampRef.current[key] || 0;
      if (now - last > cooldownMs) {
        lastAlertTimestampRef.current[key] = now;
        return true;
      }
      return false;
    };

    // 1. Overvoltage check (> max)
    if (telemetry.voltage > thresholds.voltage.max && canTrigger('overvoltage')) {
      newAlarms.push({
        id: `ALT-${now}-OV`,
        type: 'OVERVOLTAGE',
        title: 'Critical Overvoltage Warning',
        description: `Line voltage reached ${telemetry.voltage} V (Threshold limit: ${thresholds.voltage.max} V).`,
        severity: 'critical',
        status: 'active',
        timestamp: now,
        metric: 'Voltage',
        measuredValue: `${telemetry.voltage} V`,
        thresholdValue: `> ${thresholds.voltage.max} V`,
        recommendation: 'Verify supply transformer tap setting or check for neutral disconnection.'
      });
    }

    // 2. Undervoltage check (< min)
    if (telemetry.voltage < thresholds.voltage.min && canTrigger('undervoltage')) {
      newAlarms.push({
        id: `ALT-${now}-UV`,
        type: 'UNDERVOLTAGE',
        title: 'Severe Undervoltage Detected',
        description: `Line voltage sagged to ${telemetry.voltage} V (Lower limit: ${thresholds.voltage.min} V).`,
        severity: 'critical',
        status: 'active',
        timestamp: now,
        metric: 'Voltage',
        measuredValue: `${telemetry.voltage} V`,
        thresholdValue: `< ${thresholds.voltage.min} V`,
        recommendation: 'Check for heavy feeder line overloading or phase imbalance.'
      });
    }

    // 3. Overcurrent check
    if (telemetry.current > thresholds.current.max && canTrigger('overcurrent')) {
      newAlarms.push({
        id: `ALT-${now}-OC`,
        type: 'OVERCURRENT',
        title: 'Overcurrent Alarm',
        description: `Current draw spiked to ${telemetry.current} A (Breaker threshold: ${thresholds.current.max} A).`,
        severity: 'critical',
        status: 'active',
        timestamp: now,
        metric: 'Current',
        measuredValue: `${telemetry.current} A`,
        thresholdValue: `> ${thresholds.current.max} A`,
        recommendation: 'Immediate load shedding advised to prevent circuit breaker trip.'
      });
    }

    // 4. Low Power Factor check (< min)
    if (telemetry.powerFactor < thresholds.powerFactor.min && canTrigger('low_pf')) {
      newAlarms.push({
        id: `ALT-${now}-PF`,
        type: 'LOW_POWER_FACTOR',
        title: 'Poor Power Factor Warning',
        description: `Power factor dropped to ${telemetry.powerFactor} (Penalty threshold: < ${thresholds.powerFactor.min}).`,
        severity: 'warning',
        status: 'active',
        timestamp: now,
        metric: 'Power Factor',
        measuredValue: `${telemetry.powerFactor}`,
        thresholdValue: `< ${thresholds.powerFactor.min}`,
        recommendation: 'Reactive power is high. Engage local APFC / power factor correction capacitor.'
      });
    }

    // 5. Frequency Deviation check
    if ((telemetry.frequency < thresholds.frequency.min || telemetry.frequency > thresholds.frequency.max) && canTrigger('freq')) {
      newAlarms.push({
        id: `ALT-${now}-FQ`,
        type: 'FREQ_ANOMALY',
        title: 'Grid Frequency Instability',
        description: `Grid frequency shifted to ${telemetry.frequency} Hz (Nominal band: 49.5 - 50.5 Hz).`,
        severity: 'warning',
        status: 'active',
        timestamp: now,
        metric: 'Frequency',
        measuredValue: `${telemetry.frequency} Hz`,
        thresholdValue: `Outside 49.5 - 50.5 Hz`,
        recommendation: 'Regional grid generation-load mismatch detected.'
      });
    }

    if (newAlarms.length > 0) {
      setAlerts(prev => [...newAlarms, ...prev]);

      // Push toasts for critical/warning
      newAlarms.forEach(alarm => {
        const toastId = `toast-${alarm.id}`;
        setActiveToasts(prev => [
          ...prev,
          {
            id: toastId,
            title: alarm.title,
            description: alarm.description,
            severity: alarm.severity,
            timestamp: alarm.timestamp
          }
        ]);

        // Auto remove toast after 7s
        setTimeout(() => {
          removeToast(toastId);
        }, 7000);
      });
    }
  }, [thresholds, removeToast]);

  // Telemetry tick callback
  const handleTelemetry = useCallback((data) => {
    // 1. Update rolling sparkline arrays
    setSparklines(prev => {
      const appendPoint = (arr, val) => {
        const updated = [...arr.slice(1), {
          time: data.timeString,
          timestamp: data.timestamp,
          value: val
        }];
        return updated;
      };

      return {
        voltage: appendPoint(prev.voltage, data.voltage),
        current: appendPoint(prev.current, data.current),
        activePower: appendPoint(prev.activePower, data.activePower),
        energy: appendPoint(prev.energy, data.energyKwh),
        powerFactor: appendPoint(prev.powerFactor, data.powerFactor),
        frequency: appendPoint(prev.frequency, data.frequency),
      };
    });

    // 2. Append to Live Stream History (keep last 60 points)
    setLiveStreamHistory(prev => {
      const updated = [...prev, {
        time: data.timeString,
        timestamp: data.timestamp,
        voltage: data.voltage,
        current: data.current,
        activePowerKw: Number((data.activePower / 1000).toFixed(3)),
        powerFactor: data.powerFactor,
        frequency: data.frequency
      }];
      if (updated.length > 60) updated.shift();
      return updated;
    });

    // 3. Evaluate threshold alerts
    evaluateAlerts(data);
  }, [evaluateAlerts]);

  // Hook into WebSocket
  const {
    latestTelemetry,
    isConnected,
    connectionState,
    isPaused,
    togglePause,
    triggerAnomaly,
    activeAnomaly,
    isMock
  } = useRealtimeSocket(handleTelemetry);

  // Status threshold evaluators for metric cards
  const getMetricStatus = (metricKey, value) => {
    switch (metricKey) {
      case 'voltage':
        if (value > thresholds.voltage.max || value < thresholds.voltage.min) return 'critical';
        if (value > 245 || value < 215) return 'warning';
        return 'normal';
      case 'current':
        if (value > thresholds.current.max) return 'critical';
        if (value > thresholds.current.warning) return 'warning';
        return 'normal';
      case 'activePower':
        if (value > thresholds.power.max) return 'critical';
        if (value > thresholds.power.warning) return 'warning';
        return 'normal';
      case 'powerFactor':
        if (value < thresholds.powerFactor.min) return 'critical';
        if (value < 0.90) return 'warning';
        return 'normal';
      case 'frequency':
        if (value < thresholds.frequency.min || value > thresholds.frequency.max) return 'critical';
        if (value < 49.8 || value > 50.2) return 'warning';
        return 'normal';
      case 'energy':
        return 'normal';
      default:
        return 'normal';
    }
  };

  // Overall system health indicator
  const overallSystemStatus = (() => {
    if (!isConnected) return 'OFFLINE';
    const vStatus = getMetricStatus('voltage', latestTelemetry.voltage);
    const iStatus = getMetricStatus('current', latestTelemetry.current);
    const fStatus = getMetricStatus('frequency', latestTelemetry.frequency);
    if (vStatus === 'critical' || iStatus === 'critical' || fStatus === 'critical') return 'FAULT';
    if (vStatus === 'warning' || iStatus === 'warning' || fStatus === 'warning') return 'WARNING';
    return 'ONLINE';
  })();

  // Alert actions
  const acknowledgeAlertById = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  };

  const resolveAlertById = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
  };

  const dismissAlertById = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
  };

  return (
    <EnergyDataContext.Provider value={{
      latestTelemetry,
      sparklines,
      liveStreamHistory,
      thresholds,
      updateThresholds,
      getMetricStatus,
      overallSystemStatus,
      isConnected,
      connectionState,
      isPaused,
      togglePause,
      triggerAnomaly,
      activeAnomaly,
      isMock,
      meter,
      setMeter,
      alerts,
      activeToasts,
      removeToast,
      acknowledgeAlertById,
      resolveAlertById,
      dismissAlertById,
      clearAllAlerts
    }}>
      {children}
    </EnergyDataContext.Provider>
  );
};

export const useEnergyData = () => {
  const context = useContext(EnergyDataContext);
  if (!context) {
    throw new Error('useEnergyData must be used within an EnergyDataProvider');
  }
  return context;
};
