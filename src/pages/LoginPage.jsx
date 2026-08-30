import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('consumer@gridsense.io');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = await login(email, password);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickLogin = async (type) => {
    if (type === 'operator') {
      setEmail('operator@gridsense.io');
      setPassword('admin123');
      await login('operator@gridsense.io', 'admin123');
      navigate('/', { replace: true });
    } else {
      setEmail('consumer@gridsense.io');
      setPassword('password123');
      await login('consumer@gridsense.io', 'password123');
      navigate('/consumer', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-sky-400 shadow-sm">
            <Zap className="w-6 h-6 fill-sky-400" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-xl font-bold tracking-tight text-slate-900">
          GRIDSENSE<span className="text-sky-600 font-semibold ml-0.5">OS</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Smart Energy Meter Monitoring & Grid Intelligence Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email / Meter ID
              </label>
              <div className="relative rounded border border-slate-300 focus-within:border-sky-500">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none rounded"
                  placeholder="name@gridsense.io"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded border border-slate-300 focus-within:border-sky-500">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none rounded font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-colors shadow-xs"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Pair Programming / Review */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 text-center uppercase tracking-wide">
              Quick 1-Click Test Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('operator')}
                className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <span className="text-xs font-bold text-slate-800 block">⚡ Control Room</span>
                <span className="text-[10px] text-slate-500 font-mono">operator@gridsense.io</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('consumer')}
                className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <span className="text-xs font-bold text-slate-800 block">🏠 Consumer</span>
                <span className="text-[10px] text-slate-500 font-mono">consumer@gridsense.io</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured with TLS 1.3 & JWT Encrypted Telemetry Handshake</span>
        </div>
      </div>
    </div>
  );
};
