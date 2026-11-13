import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Plane
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorAvailabilityPage = () => {
  const { role, user } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Availability state for 7 days
  const [schedule, setSchedule] = useState(
    DAYS.map((day, idx) => ({
      day_of_week: idx,
      day_name: day,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      is_active: idx < 5 // Mon-Fri active by default
    }))
  );

  const [leaves, setLeaves] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isAdmin) {
      api.get('/api/doctors').then((res) => {
        setDoctors(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id);
        }
      }).finally(() => setLoading(false));
    } else if (user?.doctor_id) {
      setSelectedDoctorId(user.doctor_id);
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorSchedule(selectedDoctorId);
      fetchDoctorLeaves(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchDoctorSchedule = async (docId) => {
    try {
      const res = await api.get(`/api/doctors/${docId}/availability`);
      const existing = res.data;
      if (existing && existing.length > 0) {
        setSchedule(
          DAYS.map((day, idx) => {
            const match = existing.find((item) => item.day_of_week === idx);
            if (match) {
              return {
                day_of_week: idx,
                day_name: day,
                start_time: match.start_time.slice(0, 5),
                end_time: match.end_time.slice(0, 5),
                slot_duration_minutes: match.slot_duration_minutes,
                is_active: match.is_active
              };
            }
            return {
              day_of_week: idx,
              day_name: day,
              start_time: '09:00',
              end_time: '17:00',
              slot_duration_minutes: 30,
              is_active: false
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctorLeaves = async (docId) => {
    try {
      const res = await api.get(`/api/doctors/${docId}/leaves`);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDayToggle = (dayIdx) => {
    setSchedule(
      schedule.map((item) =>
        item.day_of_week === dayIdx ? { ...item, is_active: !item.is_active } : item
      )
    );
  };

  const handleTimeChange = (dayIdx, field, val) => {
    setSchedule(
      schedule.map((item) =>
        item.day_of_week === dayIdx ? { ...item, [field]: val } : item
      )
    );
  };

  const handleSaveSchedule = async () => {
    if (!selectedDoctorId) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = schedule
        .filter((item) => item.is_active)
        .map((item) => ({
          day_of_week: item.day_of_week,
          start_time: `${item.start_time}:00`,
          end_time: `${item.end_time}:00`,
          slot_duration_minutes: parseInt(item.slot_duration_minutes) || 30,
          is_active: true
        }));

      await api.post(`/api/doctors/${selectedDoctorId}/availability`, payload);
      setMessage({ type: 'success', text: 'Doctor working hours successfully updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save schedule.' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    try {
      await api.post(`/api/doctors/${selectedDoctorId}/leaves`, leaveData);
      setIsLeaveModalOpen(false);
      setLeaveData({ start_date: '', end_date: '', reason: '' });
      fetchDoctorLeaves(selectedDoctorId);
      setMessage({ type: 'success', text: 'Leave record added successfully!' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to apply leave');
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (window.confirm('Delete this leave period?')) {
      try {
        await api.delete(`/api/doctors/leaves/${leaveId}`);
        fetchDoctorLeaves(selectedDoctorId);
      } catch (err) {
        alert('Failed to delete leave');
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading availability calendar..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Doctor Availability & Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure clinical consultation hours, slot durations, and planned absence leaves</p>
        </div>

        {isAdmin && doctors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Select Doctor:</span>
            <select
              value={selectedDoctorId || ''}
              onChange={(e) => setSelectedDoctorId(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.full_name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Weekly Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm">Weekly Consultation Hours</h3>
          </div>
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Schedule...' : 'Save Schedule'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.day_of_week}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 w-40">
                <input
                  type="checkbox"
                  id={`day_${item.day_of_week}`}
                  checked={item.is_active}
                  onChange={() => handleDayToggle(item.day_of_week)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor={`day_${item.day_of_week}`} className="font-bold text-xs text-slate-800 cursor-pointer">
                  {item.day_name}
                </label>
              </div>

              {item.is_active ? (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold text-[11px]">Start:</span>
                    <input
                      type="time"
                      value={item.start_time}
                      onChange={(e) => handleTimeChange(item.day_of_week, 'start_time', e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold text-[11px]">End:</span>
                    <input
                      type="time"
                      value={item.end_time}
                      onChange={(e) => handleTimeChange(item.day_of_week, 'end_time', e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold text-[11px]">Slot:</span>
                    <select
                      value={item.slot_duration_minutes}
                      onChange={(e) => handleTimeChange(item.day_of_week, 'slot_duration_minutes', e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value={15}>15 mins</option>
                      <option value={20}>20 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">Day off / Clinic closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaves & Planned Absences */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Planned Leaves & Absences</h3>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>

        {leaves.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No upcoming leaves scheduled. Doctor is fully on duty.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{l.start_date}</span>
                    <span className="text-slate-400">to</span>
                    <span className="font-bold text-slate-800">{l.end_date}</span>
                  </div>
                  {l.reason && <p className="text-[11px] text-slate-500 mt-0.5">{l.reason}</p>}
                </div>
                <button
                  onClick={() => handleDeleteLeave(l.id)}
                  title="Remove Leave"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Record Doctor Leave">
        <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={leaveData.start_date}
              onChange={(e) => setLeaveData({ ...leaveData, start_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              required
              value={leaveData.end_date}
              onChange={(e) => setLeaveData({ ...leaveData, end_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Leave</label>
            <input
              type="text"
              value={leaveData.reason}
              onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
              placeholder="e.g. Medical Conference / Personal Leave"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow-md shadow-amber-500/20"
            >
              Confirm Leave
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

