import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

import { RealtimeMonitorPage } from '../pages/RealtimeMonitorPage';
import { ConsumerDashboardPage } from '../pages/ConsumerDashboardPage';
import { GraphsAnalyticsPage } from '../pages/GraphsAnalyticsPage';
import { ConsumptionPage } from '../pages/ConsumptionPage';
import { BillingEstimatorPage } from '../pages/BillingEstimatorPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AlertsLogPage } from '../pages/AlertsLogPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Main Application Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RealtimeMonitorPage />} />
        <Route path="consumer" element={<ConsumerDashboardPage />} />
        <Route path="graphs" element={<GraphsAnalyticsPage />} />
        <Route path="consumption" element={<ConsumptionPage />} />
        <Route path="billing" element={<BillingEstimatorPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="alerts" element={<AlertsLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
