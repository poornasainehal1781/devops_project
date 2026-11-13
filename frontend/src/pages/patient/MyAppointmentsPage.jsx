import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  RefreshCw,
  XCircle,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  // Reschedule & Cancel state
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '10:00:00' });
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0];

  const upcomingAppts = appointments.filter((a) => {
    const isCancelled = a.status === 'Cancelled';
    const isCompleted = a.status === 'Completed';
    if (isCancelled || isCompleted) return false;
    return a.appointment_date > todayStr || (a.appointment_date === todayStr && a.appointment_time >= nowTime);
  });

  const pastAppts = appointments.filter((a) => !upcomingAppts.includes(a));

  const displayedAppts = activeTab === 'upcoming' ? upcomingAppts : pastAppts;

  const handleCancel = async (e) => {
    e.preventDefault();
    setActionError('');
    setSubmitting(true);
    try {
      await api.post(`/api/appointments/${selectedAppt.id}/cancel`, {
        cancellation_reason: cancelReason || 'Cancelled by patient'
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setActionError('');
    setSubmitting(true);
    try {
      await api.post(`/api/appointments/${selectedAppt.id}/reschedule`, {
        appointment_date: rescheduleData.date,
        appointment_time: rescheduleData.time
      });
      setIsRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Consultations & Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your upcoming hospital visits and track past consultations</p>
        </div>
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Upcoming Visits</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold">
            {upcomingAppts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past & Completed Visits</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
            {pastAppts.length}
          </span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner text="Loading appointment calendar..." />
      ) : displayedAppts.length === 0 ? (
        <EmptyState
          title={activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments on record'}
          description={activeTab === 'upcoming' ? 'Schedule a consultation with our medical specialists.' : 'Your previous consultation history will appear here.'}
          action={
            activeTab === 'upcoming' ? (
              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm"
              >
                <span>Find Doctors</span>
              </Link>
            ) : null
          }
          icon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedAppts.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brand-600 text-xs">{appt.appointment_number}</span>
                  <StatusBadge status={appt.status} />
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-base">Dr. {appt.doctor?.user?.full_name}</h4>
                  <p className="text-xs font-semibold text-brand-600">{appt.doctor?.specialization}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{appt.appointment_date}</span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.appointment_time}</span>
                  </div>
                  {appt.reason_for_visit && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      Reason: {appt.reason_for_visit}
                    </p>
                  )}
                  {appt.cancellation_reason && (
                    <p className="text-[11px] text-rose-700 italic pt-1 border-t border-rose-100">
                      Cancelled Reason: {appt.cancellation_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setRescheduleData({ date: appt.appointment_date, time: appt.appointment_time });
                        setIsRescheduleModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setIsCancelModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                {appt.status === 'Completed' && (
                  <Link
                    to="/patient/records"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Prescription</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Appointment">
        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {actionError}
          </div>
        )}
        <form onSubmit={handleCancel} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Please tell us why you need to cancel this appointment ({selectedAppt?.appointment_number}):
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cancellation Reason *</label>
            <textarea
              required
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, feeling better, rescheduling later..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Reschedule Appointment">
        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {actionError}
          </div>
        )}
        <form onSubmit={handleReschedule} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Appointment Date *</label>
            <input
              type="date"
              min={todayStr}
              required
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Appointment Time *</label>
            <input
              type="time"
              required
              value={rescheduleData.time.slice(0, 5)}
              onChange={(e) => setRescheduleData({ ...rescheduleData, time: `${e.target.value}:00` })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-bold shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

