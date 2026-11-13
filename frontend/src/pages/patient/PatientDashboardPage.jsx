import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  Plus,
  ArrowRight,
  Heart,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const PatientDashboardPage = () => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading patient health portal..." />;

  const upcoming = stats?.upcoming_appointments || [];
  const records = stats?.recent_records || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 p-6 rounded-3xl text-white shadow-xl shadow-brand-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            Patient Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight">Your Health & Appointments Desk</h2>
          <p className="text-brand-100 text-xs mt-1">Book doctor visits, monitor appointments, and view clinical visit records</p>
        </div>
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs shadow-sm hover:bg-brand-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Consultations"
          value={stats?.total_appointments ?? 0}
          icon={Calendar}
          color="blue"
          subtitle="Hospital appointments"
        />
        <StatCard
          title="Upcoming Visits"
          value={stats?.upcoming_appointments_count ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Scheduled & confirmed"
        />
        <StatCard
          title="Completed Visits"
          value={stats?.completed_appointments_count ?? 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Consultations with Rx"
        />
      </div>

      {/* Upcoming Visits Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Consultations</h3>
          </div>
          <Link to="/patient/appointments" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="You do not have any pending doctor visits scheduled."
            action={
              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Doctors & Book</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map((appt) => (
              <div key={appt.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brand-700 text-xs">{appt.appointment_number}</span>
                  <StatusBadge status={appt.status} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{appt.doctor_name}</h4>
                <p className="text-xs text-slate-500">{appt.specialization}</p>
                <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-700 border-t border-slate-200/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> {appt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" /> {appt.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Medical Records & Prescriptions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Recent Clinical Records & Prescriptions</h3>
          </div>
          <Link to="/patient/records" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {records.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No medical records documented yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.doctor_name}</span>
                  <span className="text-slate-400 font-medium">{r.created_at}</span>
                </div>
                <p className="font-bold text-brand-800">Diagnosis: {r.diagnosis}</p>
                {r.prescription && (
                  <p className="text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                    Rx: {r.prescription}
                  </p>
                )}
                {r.follow_up_date && (
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Follow-up Date: {r.follow_up_date}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

