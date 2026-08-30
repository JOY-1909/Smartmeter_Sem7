import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEnergyData } from '../../context/EnergyDataContext';
import { 
  Zap, 
  Clock, 
  User, 
  LogOut, 
  Radio, 
  ShieldAlert, 
  Layers,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { user, isOperator, switchRole, logout } = useAuth();
  const { isConnected, isMock, meter, connectionState } = useEnergyData();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand / Meter Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-sky-400">
              <Zap className="w-4 h-4 fill-sky-400" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                GRIDSENSE<span className="text-sky-600 font-semibold ml-0.5">OS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] font-mono rounded border border-slate-200">
                {meter.meterId}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Local Clock & Substation Metadata (Control Room feel) */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-700">
              {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] text-slate-400">IST (UTC+5:30)</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{isMock ? 'High-Precision Physics Simulator' : 'Live WebSocket Stream'}</span>
          </div>
        </div>

        {/* Right: Quick Role Switcher, Account & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher for seamless demo / test evaluation */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded p-0.5 bg-slate-50 text-[11px]">
            <button
              onClick={() => switchRole('operator')}
              className={`px-2 py-0.5 rounded transition-colors ${
                isOperator
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Control Room
            </button>
            <button
              onClick={() => switchRole('consumer')}
              className={`px-2 py-0.5 rounded transition-colors ${
                !isOperator
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consumer View
            </button>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.name || 'Operator'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {user?.role || 'operator'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
