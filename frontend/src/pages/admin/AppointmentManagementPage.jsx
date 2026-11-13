import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  User,
  Stethoscope,
  XCircle,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '10:00:00' });
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      const doc = filters.doctor !== undefined ? filters.doctor : selectedDoctor;
      const st = filters.status !== undefined ? filters.status : selectedStatus;
      const dt = filters.date !== undefined ? filters.date : targetDate;
      const q = filters.search !== undefined ? filters.search : search;

      if (doc) params.doctor_id = doc;
      if (st) params.status = st;
      if (dt) params.date = dt;
      if (q) params.search = q;

      const res = await api.get('/api/appointments', { params });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    if (key === 'doctor') {
      setSelectedDoctor(val);
      fetchAppointments({ doctor: val });
    } else if (key === 'status') {
      setSelectedStatus(val);
      fetchAppointments({ status: val });
    } else if (key === 'date') {
      setTargetDate(val);
      fetchAppointments({ date: val });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments({ search });
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post(`/api/appointments/${selectedAppt.id}/cancel`, {
        cancellation_reason: cancelReason || 'Administrative cancellation'
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post(`/api/appointments/${selectedAppt.id}/reschedule`, {
        appointment_date: rescheduleData.date,
        appointment_time: rescheduleData.time
      });
      setIsRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to reschedule appointment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hospital Appointments Desk</h2>
        <p className="text-xs text-slate-500 mt-0.5">Filter, inspect, reschedule, or manage all patient clinical sessions</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name, appt #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Doctor Filter */}
            <select
              value={selectedDoctor}
              onChange={(e) => handleFilterChange('doctor', e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.user?.full_name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={targetDate}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            {(selectedDoctor || selectedStatus || targetDate || search) && (
              <button
                onClick={() => {
                  setSelectedDoctor('');
                  setSelectedStatus('');
                  setTargetDate('');
                  setSearch('');
                  fetchAppointments({ doctor: '', status: '', date: '', search: '' });
                }}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving hospital appointment logs..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments matching query"
          description="Try broadening or resetting your search filters."
          icon={Calendar}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Appointment #</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor & Specialty</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-brand-600">
                      {appt.appointment_number}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 leading-tight">{appt.patient?.user?.full_name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{appt.patient?.user?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">Dr. {appt.doctor?.user?.full_name}</p>
                      <p className="text-[11px] text-slate-400">{appt.doctor?.specialization}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{appt.appointment_date}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {appt.appointment_time}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAppt(appt);
                                setRescheduleData({ date: appt.appointment_date, time: appt.appointment_time });
                                setIsRescheduleModalOpen(true);
                              }}
                              title="Reschedule"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppt(appt);
                                setIsCancelModalOpen(true);
                              }}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            Are you sure you want to cancel appointment <span className="font-mono font-bold">{selectedAppt?.appointment_number}</span>?
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation *</label>
            <textarea
              required
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Doctor emergency leave / Patient requested schedule release..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold shadow-md shadow-rose-500/20"
            >
              Confirm Cancellation
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
              className="px-4 py-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-bold shadow-md shadow-brand-500/20"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

