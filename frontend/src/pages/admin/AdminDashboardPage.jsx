import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/stats/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Compiling hospital analytics..." />;

  const statusDistribution = stats?.status_distribution || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 p-6 rounded-3xl text-white shadow-xl shadow-brand-900/10">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold tracking-wide backdrop-blur-sm mb-2">
            Administrator Command Center
          </span>
          <h2 className="text-2xl font-black tracking-tight">CarePoint Operations Overview</h2>
          <p className="text-brand-100 text-xs mt-1">Real-time patient bookings, department metrics, and staffing telemetry</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/doctors"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-brand-50 transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Doctor</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600/60 border border-white/20 text-white font-bold text-xs hover:bg-brand-600 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Reports</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={stats?.total_doctors ?? 0}
          icon={Stethoscope}
          color="blue"
          subtitle="Active hospital specialists"
        />
        <StatCard
          title="Registered Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="emerald"
          subtitle="All patient profiles"
        />
        <StatCard
          title="Total Appointments"
          value={stats?.total_appointments ?? 0}
          icon={Calendar}
          color="purple"
          subtitle="Cumulative bookings"
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.today_appointments ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Booked for today"
        />
      </div>

      {/* Appointment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <h4 className="text-xl font-black text-indigo-600 mt-1">{stats?.completed_appointments ?? 0}</h4>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming</p>
            <h4 className="text-xl font-black text-brand-600 mt-1">{stats?.upcoming_appointments ?? 0}</h4>
          </div>
          <div className="p-3 bg-blue-50 text-brand-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelled</p>
            <h4 className="text-xl font-black text-rose-600 mt-1">{stats?.cancelled_appointments ?? 0}</h4>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">7-Day Appointment Activity Trend</h3>
              <p className="text-xs text-slate-400">Volume of patient bookings over recent days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.daily_trend || []}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialization Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Doctors by Specialization</h3>
              <p className="text-xs text-slate-400">Departmental doctor staffing distribution</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.specialization_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

