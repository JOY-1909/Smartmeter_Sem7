import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SystemStatusBanner } from './SystemStatusBanner';
import { ToastNotificationContainer } from '../common/ToastNotification';
import { ThresholdModal } from '../realtime/ThresholdModal';

export const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Real-time critical alarm floating toast stack */}
      <ToastNotificationContainer />

      {/* Global Top Header */}
      <Header
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* Universal Real-Time Telemetry & Status Banner */}
          <SystemStatusBanner onOpenThresholdModal={() => setIsThresholdModalOpen(true)} />

          {/* Routed page component */}
          <Outlet context={{ onOpenThresholdModal: () => setIsThresholdModalOpen(true) }} />
        </main>
      </div>

      {/* Dynamic Threshold limits configuration modal */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
      />
    </div>
  );
};
