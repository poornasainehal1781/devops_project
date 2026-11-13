import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const ReceptionistDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/stats/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading reception desk dashboard..." />;

  const todayList = stats?.today_appointments_list || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 p-6 rounded-3xl text-white shadow-xl shadow-amber-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            Front Desk Administration
          </span>
          <h2 className="text-2xl font-black tracking-tight">CarePoint Reception Desk</h2>
          <p className="text-amber-100 text-xs mt-1">Patient admissions, appointment bookings, and daily clinic check-ins</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/receptionist/patients"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-sm hover:bg-amber-50 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </Link>
          <Link
            to="/receptionist/appointments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 border border-white/20 text-white font-bold text-xs hover:bg-amber-500 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={stats?.today_appointments ?? 0}
          icon={Clock}
          color="amber"
          subtitle="All consultations today"
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats?.upcoming_appointments ?? 0}
          icon={Calendar}
          color="blue"
          subtitle="Pending future dates"
        />
        <StatCard
          title="Total Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="emerald"
          subtitle="Hospital registry"
        />
        <StatCard
          title="Registered Today"
          value={stats?.today_new_patients ?? 0}
          icon={UserPlus}
          color="purple"
          subtitle="New admissions"
        />
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Today's Scheduled Consultations</h3>
          </div>
          <Link to="/receptionist/appointments" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            <span>Open Appointment Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayList.length === 0 ? (
          <EmptyState
            title="No appointments scheduled for today"
            description="Use the Appointment Desk to book patient slots."
            icon={Calendar}
          />
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {todayList.map((appt) => (
              <div key={appt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-mono font-bold text-slate-700">
                    {appt.time}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{appt.patient_name}</p>
                    <p className="text-[11px] text-slate-400">{appt.doctor_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">{appt.appointment_number}</span>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

