import React from 'react';
import { useEnergyData } from '../../context/EnergyDataContext';
import { MetricCard } from '../common/MetricCard';
import { 
  Zap, 
  Activity, 
  Flame, 
  Gauge, 
  Compass, 
  Radio 
} from 'lucide-react';

export const LiveMetricGrid = () => {
  const { latestTelemetry, sparklines, getMetricStatus, thresholds } = useEnergyData();

  const voltageStatus = getMetricStatus('voltage', latestTelemetry.voltage);
  const currentStatus = getMetricStatus('current', latestTelemetry.current);
  const powerStatus = getMetricStatus('activePower', latestTelemetry.activePower);
  const pfStatus = getMetricStatus('powerFactor', latestTelemetry.powerFactor);
  const freqStatus = getMetricStatus('frequency', latestTelemetry.frequency);
  const energyStatus = getMetricStatus('energy', latestTelemetry.energyKwh);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Voltage (V) */}
      <MetricCard
        title="Line Voltage"
        value={latestTelemetry.voltage}
        unit="V"
        sparklineData={sparklines.voltage}
        status={voltageStatus}
        statusLabel={voltageStatus === 'critical' ? 'Surge/Sag' : voltageStatus === 'warning' ? 'Deviated' : 'Normal'}
        nominalLabel={`${thresholds.voltage.nominal}V`}
        thresholdInfo={`${thresholds.voltage.min}-${thresholds.voltage.max}V`}
        icon={Zap}
      />

      {/* 2. Current (A) */}
      <MetricCard
        title="Load Current"
        value={latestTelemetry.current}
        unit="A"
        sparklineData={sparklines.current}
        status={currentStatus}
        statusLabel={currentStatus === 'critical' ? 'Overcurrent' : currentStatus === 'warning' ? 'Heavy' : 'Normal'}
        nominalLabel="<30A"
        thresholdInfo={`Max ${thresholds.current.max}A`}
        secondaryMetric={`N: ${latestTelemetry.neutralCurrent}A`}
        icon={Activity}
      />

      {/* 3. Active Power (W / kW) */}
      <MetricCard
        title="Active Power"
        value={latestTelemetry.activePower > 1000 ? (latestTelemetry.activePower / 1000).toFixed(2) : latestTelemetry.activePower}
        unit={latestTelemetry.activePower > 1000 ? "kW" : "W"}
        sparklineData={sparklines.activePower}
        status={powerStatus}
        statusLabel={powerStatus === 'critical' ? 'High Demand' : powerStatus === 'warning' ? 'Peak' : 'Normal'}
        nominalLabel="<5.0kW"
        thresholdInfo={`Max ${(thresholds.power.max / 1000).toFixed(1)}kW`}
        secondaryMetric={`${latestTelemetry.apparentPower} VA`}
        icon={Flame}
      />

      {/* 4. Cumulative Energy (kWh) */}
      <MetricCard
        title="Cycle Consumption"
        value={latestTelemetry.energyKwh}
        unit="kWh"
        sparklineData={sparklines.energy}
        status={energyStatus}
        statusLabel="Reading"
        nominalLabel="Budget: 450"
        secondaryMetric={`Run rate: ${(latestTelemetry.energyKwh / 24).toFixed(1)} u/d`}
        icon={Gauge}
      />

      {/* 5. Power Factor */}
      <MetricCard
        title="Power Factor"
        value={latestTelemetry.powerFactor}
        unit="PF"
        sparklineData={sparklines.powerFactor}
        status={pfStatus}
        statusLabel={pfStatus === 'critical' ? 'Penalty Zone' : pfStatus === 'warning' ? 'Sub-optimal' : 'Healthy'}
        nominalLabel=">0.90"
        thresholdInfo={`Min ${thresholds.powerFactor.min}`}
        secondaryMetric={`θ: ${latestTelemetry.phaseAngleDeg}°`}
        icon={Compass}
      />

      {/* 6. Frequency (Hz) */}
      <MetricCard
        title="Grid Frequency"
        value={latestTelemetry.frequency}
        unit="Hz"
        sparklineData={sparklines.frequency}
        status={freqStatus}
        statusLabel={freqStatus === 'critical' ? 'Instability' : freqStatus === 'warning' ? 'Drift' : 'Stable'}
        nominalLabel="50.00Hz"
        thresholdInfo={`${thresholds.frequency.min}-${thresholds.frequency.max}Hz`}
        secondaryMetric={`THD: ${latestTelemetry.thdPercent}%`}
        icon={Radio}
      />
    </div>
  );
};
