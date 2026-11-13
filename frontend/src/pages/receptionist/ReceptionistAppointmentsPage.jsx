import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  XCircle,
  AlertCircle,
  CheckCircle2,
  User,
  Stethoscope
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ReceptionistAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [search, setSearch] = useState('');

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookDate, setBookDate] = useState(todayStr);
  const [bookSlotsData, setBookSlotsData] = useState(null);
  const [loadingBookSlots, setLoadingBookSlots] = useState(false);
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Reschedule & Cancel
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '10:00:00' });
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/doctors?is_available=true');
      setDoctors(res.data);
      if (res.data.length > 0 && !bookDoctorId) setBookDoctorId(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients');
      setPatients(res.data);
      if (res.data.length > 0 && !bookPatientId) setBookPatientId(res.data[0].id);
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

  // Slot generator for receptionist booking modal
  useEffect(() => {
    if (isBookModalOpen && bookDoctorId && bookDate) {
      setLoadingBookSlots(true);
      setBookTime('');
      api.get(`/api/doctors/${bookDoctorId}/slots?date=${bookDate}`)
        .then((res) => setBookSlotsData(res.data))
        .catch(console.error)
        .finally(() => setLoadingBookSlots(false));
    }
  }, [isBookModalOpen, bookDoctorId, bookDate]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookTime) {
      setBookingError('Please choose an available appointment slot.');
      return;
    }
    setBookingError('');
    setBookingSubmitting(true);
    try {
      await api.post('/api/appointments', {
        patient_id: parseInt(bookPatientId),
        doctor_id: parseInt(bookDoctorId),
        appointment_date: bookDate,
        appointment_time: `${bookTime}:00`,
        reason_for_visit: bookReason
      });
      setIsBookModalOpen(false);
      setBookTime('');
      setBookReason('');
      fetchAppointments();
    } catch (err) {
      setBookingError(err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post(`/api/appointments/${selectedAppt.id}/cancel`, {
        cancellation_reason: cancelReason || 'Cancelled at front desk'
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleSubmit = async (e) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Front Desk Appointment Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Book consultations for patients, manage bookings, and handle reschedules</p>
        </div>
        <button
          onClick={() => {
            setBookingError('');
            setIsBookModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment for Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={(e) => { e.preventDefault(); fetchAppointments({ search }); }} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name, appt #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                fetchAppointments({ doctor: e.target.value });
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.user?.full_name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                fetchAppointments({ status: e.target.value });
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>

            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                fetchAppointments({ date: e.target.value });
              }}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
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
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner text="Loading appointment schedule..." />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments found" icon={Calendar} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Appt #</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Assigned Specialist</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-amber-700">
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
                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAppt(appt);
                              setRescheduleData({ date: appt.appointment_date, time: appt.appointment_time });
                              setIsRescheduleModalOpen(true);
                            }}
                            title="Reschedule"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppt(appt);
                              setIsCancelModalOpen(true);
                            }}
                            title="Cancel"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Front Desk Appointment Booking" maxWidth="max-w-2xl">
        {bookingError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {bookingError}
          </div>
        )}
        <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={bookPatientId}
                onChange={(e) => setBookPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.full_name} ({p.user?.phone || p.user?.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Doctor *</label>
              <select
                required
                value={bookDoctorId}
                onChange={(e) => setBookDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.user?.full_name} ({d.specialization}) - ${d.consultation_fee}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                min={todayStr}
                required
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Slots */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-2">Select Time Slot *</label>
            {loadingBookSlots ? (
              <LoadingSpinner text="Checking available slots..." />
            ) : !bookSlotsData?.is_working_day ? (
              <p className="text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
                Doctor is not available on this date.
              </p>
            ) : bookSlotsData?.slots?.length === 0 ? (
              <p className="text-slate-400">No slots available.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {bookSlotsData.slots.map((s) => (
                  <button
                    key={s.start_time}
                    type="button"
                    disabled={!s.is_available}
                    onClick={() => setBookTime(s.start_time)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      !s.is_available
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                        : bookTime === s.start_time
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-500'
                    }`}
                  >
                    {s.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Visit Reason / Notes</label>
            <input
              type="text"
              value={bookReason}
              onChange={(e) => setBookReason(e.target.value)}
              placeholder="e.g. Walk-in consultation, BP check"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingSubmitting || !bookTime || !bookSlotsData?.is_working_day}
              className="px-4 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {bookingSubmitting ? 'Confirming...' : 'Book Patient Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancellation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Appointment">
        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {actionError}
          </div>
        )}
        <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to cancel appointment <span className="font-mono font-bold">{selectedAppt?.appointment_number}</span>?
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cancellation Reason *</label>
            <textarea
              required
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Appointment Date *</label>
            <input
              type="date"
              min={todayStr}
              required
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Appointment Time *</label>
            <input
              type="time"
              required
              value={rescheduleData.time.slice(0, 5)}
              onChange={(e) => setRescheduleData({ ...rescheduleData, time: `${e.target.value}:00` })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              className="px-4 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow-md shadow-amber-500/20"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

