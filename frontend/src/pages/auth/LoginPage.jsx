import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hospital, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const role = user.role.toUpperCase();
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (role === 'RECEPTIONIST') navigate('/receptionist/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
            <Hospital className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          CarePoint Hospital
        </h2>
        <p className="mt-1 text-center text-sm font-medium text-slate-500">
          Online Appointment and Patient Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Role Switcher (One-Click Demo)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hospital.com')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 transition-colors"
              >
                <span className="font-bold block text-slate-800">Admin</span>
                <span className="text-[11px] text-slate-400 truncate block">admin@hospital.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dr.smith@hospital.com')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 transition-colors"
              >
                <span className="font-bold block text-slate-800">Doctor (Smith)</span>
                <span className="text-[11px] text-slate-400 truncate block">dr.smith@hospital.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('reception@hospital.com')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 transition-colors"
              >
                <span className="font-bold block text-slate-800">Receptionist</span>
                <span className="text-[11px] text-slate-400 truncate block">reception@hospital.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('john.doe@patient.com')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 transition-colors"
              >
                <span className="font-bold block text-slate-800">Patient (John)</span>
                <span className="text-[11px] text-slate-400 truncate block">john.doe@patient.com</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New patient?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Register an account here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

