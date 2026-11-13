import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Building,
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctor_id');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId || '');
  const [doctorDetail, setDoctorDetail] = useState(null);

  // Selected date defaults to tomorrow or today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Slot generation data
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successAppt, setSuccessAppt] = useState(null);

  useEffect(() => {
    api.get('/api/doctors?is_available=true')
      .then((res) => {
        setDoctors(res.data);
        if (!selectedDoctorId && res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      api.get(`/api/doctors/${selectedDoctorId}`)
        .then((res) => setDoctorDetail(res.data))
        .catch(console.error);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  const fetchSlots = async (docId, dateStr) => {
    setLoadingSlots(true);
    setSelectedTime('');
    setError('');
    try {
      const res = await api.get(`/api/doctors/${docId}/slots?date=${dateStr}`);
      setSlotsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setError('Please select an available appointment time slot.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        doctor_id: parseInt(selectedDoctorId),
        appointment_date: selectedDate,
        appointment_time: `${selectedTime}:00`,
        reason_for_visit: reason
      };

      const res = await api.post('/api/appointments', payload);
      setSuccessAppt(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment. Slot may have been taken.');
      // Refresh slots
      fetchSlots(selectedDoctorId, selectedDate);
    } finally {
      setSubmitting(false);
    }
  };

  if (successAppt) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Appointment Confirmed!</h3>
        <p className="text-xs text-slate-500">
          Your appointment has been registered in the hospital management system.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2 mt-4 font-medium text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">Appointment #:</span>
            <span className="font-mono font-bold text-brand-700">{successAppt.appointment_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Doctor:</span>
            <span className="font-bold text-slate-900">Dr. {doctorDetail?.user?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Specialty:</span>
            <span>{doctorDetail?.specialization}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time:</span>
            <span className="font-bold text-slate-900">{successAppt.appointment_date} at {successAppt.appointment_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-700 font-bold">{successAppt.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            to="/patient/appointments"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
          >
            View My Appointments
          </Link>
          <button
            onClick={() => {
              setSuccessAppt(null);
              setSelectedTime('');
              setReason('');
              fetchSlots(selectedDoctorId, selectedDate);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link to="/patient/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specialist Directory</span>
      </Link>

      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Schedule Clinical Appointment</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select your practitioner, target date, and choose an available consultation slot</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor and Date Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Doctor Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Choose Specialist
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.full_name} ({d.specialization})
                </option>
              ))}
            </select>

            {doctorDetail && (
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <p className="font-bold text-slate-900 leading-tight">Dr. {doctorDetail.user?.full_name}</p>
                <p className="text-[11px] text-brand-600 font-semibold">{doctorDetail.specialization}</p>
                <p className="text-[11px] text-slate-400">{doctorDetail.qualifications}</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">Fee: ${doctorDetail.consultation_fee}</p>
                <p className="text-[11px] text-slate-500">Location: {doctorDetail.room_number || 'General OPD'}</p>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Appointment Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Past dates are strictly disabled.</span>
            </p>
          </div>
        </div>

        {/* Slot Selection & Chief Complaint */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Available Consultation Slots
              </label>
              {slotsData && (
                <span className="text-xs font-semibold text-slate-500">
                  {slotsData.day_name}, {slotsData.date}
                </span>
              )}
            </div>

            {loadingSlots ? (
              <LoadingSpinner text="Computing real-time doctor availability..." />
            ) : !slotsData?.is_working_day ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">Doctor Unavailable on this Date</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {slotsData?.is_on_leave
                    ? 'Doctor is on scheduled leave. Please choose another date.'
                    : 'The doctor does not have consultation hours on this weekday.'}
                </p>
              </div>
            ) : slotsData?.slots?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No slots generated for this schedule.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {slotsData.slots.map((s) => {
                  const isSelected = selectedTime === s.start_time;
                  return (
                    <button
                      key={s.start_time}
                      type="button"
                      disabled={!s.is_available}
                      onClick={() => setSelectedTime(s.start_time)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                        !s.is_available
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/25 ring-2 ring-brand-500 ring-offset-1'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-500 hover:text-brand-600'
                      }`}
                      title={!s.is_available ? s.reason_unavailable : `Available from ${s.start_time} to ${s.end_time}`}
                    >
                      <span>{s.start_time}</span>
                      {!s.is_available && (
                        <span className="block text-[9px] font-normal truncate opacity-80 mt-0.5">
                          {s.reason_unavailable}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Reason for visit */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                4. Reason for Visit (Chief Symptoms / Complaints)
              </label>
              <textarea
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your medical concerns, e.g. headache for 3 days, routine cardiology review..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedTime || !slotsData?.is_working_day}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Confirming Reservation...' : 'Confirm Appointment'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

