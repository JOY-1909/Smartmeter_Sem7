import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TariffProvider } from './context/TariffContext';
import { EnergyDataProvider } from './context/EnergyDataContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TariffProvider>
          <EnergyDataProvider>
            <AppRoutes />
          </EnergyDataProvider>
        </TariffProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
