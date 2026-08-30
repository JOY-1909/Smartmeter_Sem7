# GridSense — Smart Energy Meter Monitoring Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e.svg)](https://recharts.org/)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)]()

**GridSense** is an enterprise-grade Smart Energy Meter telemetry and consumer analytics web application. Built with a control-room design aesthetic for utility engineers and a simplified self-service dashboard for residential consumers.

---

## ⚡ Key Feature Modules

### 1. Real-Time Telemetry & Control Room (`/`)
- **6 Core Electrical Metric Cards**: Line Voltage ($V$), Load Current ($A$), Active Power ($W/\text{kW}$), Cumulative Energy ($\text{kWh}$), Power Factor ($\text{PF}$), Grid Frequency ($\text{Hz}$).
- **Rolling Sparklines**: 30-point moving micro-charts on every metric card.
- **Threshold-Aware Status Indicators**: Normal (green), Warning (amber), and Critical (red) state detection based on configurable limits.
- **Live Waveform Stream**: Second-by-second auto-scrolling telemetry chart with pause/resume and multi-channel toggles.
- **Universal Grid Status Banner**: Live telemetry health indicator with frequency deviation, THD%, and 1-click anomaly injection tools for demonstration.

### 2. User / Consumer Dashboard (`/consumer`)
- **Executive Bill Estimate**: Real-time month-to-date accrued cost and projected month-end billing total.
- **Month-over-Month Comparison**: Usage comparison against previous cycle with percentage delta badges.
- **NILM Appliance Disaggregation**: AI-assisted non-intrusive load breakdown (HVAC, Water Heater, Refrigerator, Induction, Entertainment).
- **Phantom / Vampire Load Detection**: Continuous standby load leakage identification (e.g. 85W vampire drain) with cost savings estimates.
- **Personalized Energy-Saving Recommendations**: Non-technical actionable tips.

### 3. Real-Time & Historical Waveform Analytics (`/graphs`)
- **Auto-Scrolling Live Scroller**: Live moving stream with selectable channels.
- **Historical Time-Series**: Preset range filters (`1h`, `24h`, `7d`, `30d`, `custom`) with resolution stepping (`Raw`, `1-min Avg`, `Hourly Avg`, `Daily Avg`).
- **Multi-Metric Dual-Axis Overlays**: Correlate Voltage ($V$) vs Current ($A$) or Active Power ($\text{kW}$) vs Power Factor ($\text{PF}$) on separate Y-axes.
- **CSV Data Export**: Direct spreadsheet export of filtered time-series data.

### 4. Periodic Consumption Analysis & Heatmaps (`/consumption`)
- **Tabbed Comparisons**: Daily, Weekly, and Monthly energy bar charts with previous-period comparison bars and variance indicators.
- **24h × 7d Peak Load Heatmap Matrix**: Week-long hour-by-hour load intensity matrix highlighting evening peak surcharge hours (6 PM – 10 PM).

### 5. Indian Tiered Tariff Slab Bill Estimator (`/billing`)
- **Progressive Slab Engine**: Full Indian state regulatory tariff model (e.g., 0–100 @ ₹4.15, 101–200 @ ₹5.60, 201–400 @ ₹7.15, >400 @ ₹8.90).
- **Comprehensive Cost Itemization**: Fixed capacity charges ($₹/\text{kW}$), Fuel Adjustment Surcharges (FAC), and State Electricity Duty ($6\%$).
- **Interactive Simulator**: Slider to test potential billing at different consumption tiers.
- **Configurable Tariff Builder**: Add, edit, or delete slabs and rates dynamically.

### 6. Official Energy Audit Reports (`/reports`)
- **PDF Report Generator**: High-resolution printable energy audit statement with utility letterhead, summary stats, slab cost breakdown, and anomaly logs.
- **Direct CSV Exporter**: Raw tabular data download.
- **Report Archives**: History log of previous monthly statements with 1-click re-download.

### 7. Centralized Alerts & Fault Logging (`/alerts`)
- **Threshold Violation Engine**: Real-time alerts for Overvoltage ($>253\text{V}$), Undervoltage ($<207\text{V}$), Overcurrent ($>40\text{A}$), Low PF ($<0.85$), and Frequency instability.
- **Floating Toast Notifications**: Instant slide-in alerts on incoming critical grid events.
- **Operator Incident Response**: 1-click Acknowledge, Resolve, and Dismiss actions.
- **Filterable Event Log**: Search and filter by severity, status, and metric type.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18 with Vite
- **Routing**: React Router v6 (with `ProtectedRoute` auth guards)
- **Styling**: Tailwind CSS (Custom enterprise palette, 1px borders, slate/navy control-room theme)
- **Data Visualization**: Recharts & Custom SVG Sparklines
- **Icons**: Lucide React
- **Report Engine**: jsPDF & Native Print CSS
- **State Management**: React Context API (`EnergyDataContext`, `TariffContext`, `AuthContext`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone or navigate to the project directory
cd "c:/Users/ACER/Desktop/major project"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🔑 Demo Login Credentials

The application includes 1-click login buttons on the login page (`/login`):

| Role | Email | Password | Dashboard Experience |
|------|-------|----------|----------------------|
| **Control Room Operator** | `operator@gridsense.io` | `admin123` | Control Room telemetry, waveform stream, thresholds |
| **Residential Consumer** | `consumer@gridsense.io` | `password123` | Bill estimate, NILM appliance breakdown, savings tips |

---

## 🔌 Connecting to a Real Backend & WebSocket / MQTT Bridge

GridSense is architected with a decoupled integration layer in `/src/services/api.js` and `/src/hooks/useRealtimeSocket.js`.

### Step 1: Update `.env` Configuration
Change `VITE_USE_MOCK_DATA` to `false` and set your backend URLs:

```env
# Disable simulation mode
VITE_USE_MOCK_DATA=false

# REST API Base URL
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# Live WebSocket / MQTT Bridge Endpoint
VITE_WS_URL=wss://api.yourdomain.com/ws/live-metrics

# Default Meter ID
VITE_DEFAULT_METER_ID=MTR-IND-KA-0942
```

### Step 2: REST API Contracts (`/src/services/api.js`)

| Function | Method | Target Endpoint | Description |
|----------|--------|-----------------|-------------|
| `getRealtimeData(meterId)` | `GET` | `/meters/{id}/telemetry/live` | Single snapshot of electrical parameters |
| `getHistoricalData(range, res, meterId)` | `GET` | `/meters/{id}/telemetry/historical?range={r}&resolution={res}` | Time-series data array |
| `getConsumptionSummary(period, meterId)` | `GET` | `/meters/{id}/consumption/summary?period={p}` | Aggregated kWh by period |
| `getNILMApplianceData(meterId)` | `GET` | `/meters/{id}/nilm/disaggregation` | Sub-metering breakdown |
| `getBillEstimate(kwh, config)` | `POST` | `/billing/estimate` | Tiered slab calculation |
| `getAlerts(filters)` | `GET` | `/alerts?severity={s}&status={st}` | Active & historical alarms |
| `acknowledgeAlert(id, note)` | `POST` | `/alerts/{id}/acknowledge` | Acknowledge alarm |
| `generateReport(params)` | `POST` | `/reports/generate` | Generate audit statement |
| `loginUser(email, pass)` | `POST` | `/auth/login` | JWT Authentication |

### Step 3: WebSocket Telemetry Payload Schema (`useRealtimeSocket.js`)

Your WebSocket or MQTT WebSocket bridge should stream JSON frames matching this schema:

```json
{
  "timestamp": 1756555200000,
  "timeString": "17:30:00",
  "voltage": 230.4,
  "current": 14.25,
  "activePower": 3085.2,
  "apparentPower": 3283.2,
  "reactivePower": 1124.0,
  "energyKwh": 346.820,
  "powerFactor": 0.940,
  "frequency": 50.02,
  "thdPercent": 2.1,
  "phaseAngleDeg": 19.9,
  "neutralCurrent": 0.32,
  "gridStatus": "ONLINE"
}
```

---

## 📦 Deployment Configuration

### Building for Production
```bash
npm run build
```
This produces an optimized production bundle in `/dist`.

### Vercel
A `vercel.json` file is included with SPA rewrites:
```bash
vercel deploy --prod
```

### Netlify
A `netlify.toml` file is included with 200 rewrite fallback:
```bash
netlify deploy --prod --dir=dist
```

---

## 📄 License
MIT License • Developed for GridSense Smart Energy Systems.
