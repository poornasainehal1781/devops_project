import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  FileEdit,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { MedicalRecordModal } from './MedicalRecordModal';

export const DoctorDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApptForRecord, setSelectedApptForRecord] = useState(null);

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

  if (loading) return <LoadingSpinner text="Retrieving clinical clinic dashboard..." />;

  const schedule = stats?.today_schedule || [];

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-sky-800 to-brand-700 p-6 rounded-3xl text-white shadow-xl shadow-sky-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            Clinical Practitioner Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight">Welcome, Dr. {stats?.doctor_name}</h2>
          <p className="text-sky-100 text-xs mt-1">Department of {stats?.specialization} • Today's Clinical Schedule</p>
        </div>
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs shadow-sm hover:bg-sky-50 transition-colors"
        >
          <span>View All Appointments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Patients"
          value={stats?.today_appointments ?? 0}
          icon={Calendar}
          color="blue"
          subtitle="Scheduled today"
        />
        <StatCard
          title="Upcoming Schedule"
          value={stats?.upcoming_appointments ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Future appointments"
        />
        <StatCard
          title="Completed Visits"
          value={stats?.completed_appointments ?? 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Consultations logged"
        />
        <StatCard
          title="Unique Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="purple"
          subtitle="Under your care"
        />
      </div>

      {/* Today's Schedule Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm">Today's Patient Schedule</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {schedule.length} {schedule.length === 1 ? 'consultation' : 'consultations'} scheduled
          </span>
        </div>

        {schedule.length === 0 ? (
          <EmptyState
            title="No appointments scheduled for today"
            description="You have no patient consultations on today's calendar."
            icon={Calendar}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {schedule.map((appt) => (
              <div key={appt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                    {appt.time}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{appt.patient_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{appt.appointment_number}</p>
                    {appt.reason && (
                      <p className="text-slate-500 text-[11px] mt-0.5 italic">Reason: {appt.reason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <StatusBadge status={appt.status} />

                  {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                    <button
                      onClick={() => setSelectedApptForRecord(appt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Start Consultation</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultation Record Modal */}
      {selectedApptForRecord && (
        <MedicalRecordModal
          isOpen={!!selectedApptForRecord}
          onClose={() => {
            setSelectedApptForRecord(null);
            fetchStats();
          }}
          appointment={selectedApptForRecord}
        />
      )}
    </div>
  );
};

