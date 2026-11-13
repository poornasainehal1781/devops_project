import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  FileEdit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { MedicalRecordModal } from './MedicalRecordModal';

export const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [search, setSearch] = useState('');

  const [selectedApptForRecord, setSelectedApptForRecord] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      const st = filters.status !== undefined ? filters.status : selectedStatus;
      const dt = filters.date !== undefined ? filters.date : targetDate;
      const q = filters.search !== undefined ? filters.search : search;

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

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Doctor Appointment Roster</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage consultations, electronic prescriptions, and mark clinical outcomes</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchAppointments({ search }); }} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient name, phone, appointment #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
          >
          </input>

          {(selectedStatus || targetDate || search) && (
            <button
              onClick={() => {
                setSelectedStatus('');
                setTargetDate('');
                setSearch('');
                fetchAppointments({ status: '', date: '', search: '' });
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner text="Retrieving appointment schedule..." />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments found" icon={Calendar} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Appointment #</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Chief Complaint</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Clinical Actions</th>
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
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        DOB: {appt.patient?.date_of_birth} ({appt.patient?.gender}) • Blood: {appt.patient?.blood_group || 'N/A'}
                      </p>
                      <p className="text-[10px] text-slate-500">{appt.patient?.user?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{appt.appointment_date}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {appt.appointment_time}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-slate-600 italic truncate">{appt.reason_for_visit || 'Routine Consultation'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setSelectedApptForRecord({
                                id: appt.id,
                                appointment_number: appt.appointment_number,
                                patient_name: appt.patient?.user?.full_name
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>{appt.status === 'Completed' ? 'View / Edit Rx' : 'Consult & Prescribe'}</span>
                          </button>
                        )}

                        {appt.status !== 'Completed' && appt.status !== 'Cancelled' && appt.status !== 'No-show' && (
                          <button
                            onClick={() => handleStatusUpdate(appt.id, 'No-show')}
                            title="Mark as No-Show"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
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

      {/* Record & Consultation Modal */}
      {selectedApptForRecord && (
        <MedicalRecordModal
          isOpen={!!selectedApptForRecord}
          onClose={() => {
            setSelectedApptForRecord(null);
            fetchAppointments();
          }}
          appointment={selectedApptForRecord}
        />
      )}
    </div>
  );
};

