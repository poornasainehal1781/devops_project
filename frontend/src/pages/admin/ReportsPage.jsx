import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  User,
  Stethoscope,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Users
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(1); // 1, 2, 3, 4
  const [doctors, setDoctors] = useState([]);

  // Report 1: Daily Appointments State
  const [r1Data, setR1Data] = useState([]);
  const [r1Total, setR1Total] = useState(0);
  const [r1Loading, setR1Loading] = useState(false);
  const [r1Date, setR1Date] = useState('');
  const [r1Doctor, setR1Doctor] = useState('');
  const [r1Status, setR1Status] = useState('');
  const [r1Search, setR1Search] = useState('');
  const [r1Page, setR1Page] = useState(1);

  // Report 2: Doctor-Wise State
  const [r2Data, setR2Data] = useState([]);
  const [r2Total, setR2Total] = useState(0);
  const [r2Loading, setR2Loading] = useState(false);
  const [r2Search, setR2Search] = useState('');
  const [r2Page, setR2Page] = useState(1);

  // Report 3: Patient Registration State
  const [r3Data, setR3Data] = useState([]);
  const [r3Total, setR3Total] = useState(0);
  const [r3Loading, setR3Loading] = useState(false);
  const [r3StartDate, setR3StartDate] = useState('');
  const [r3EndDate, setR3EndDate] = useState('');
  const [r3Gender, setR3Gender] = useState('');
  const [r3Search, setR3Search] = useState('');
  const [r3Page, setR3Page] = useState(1);

  // Report 4: Cancellation State
  const [r4Data, setR4Data] = useState([]);
  const [r4Total, setR4Total] = useState(0);
  const [r4Loading, setR4Loading] = useState(false);
  const [r4StartDate, setR4StartDate] = useState('');
  const [r4EndDate, setR4EndDate] = useState('');
  const [r4Search, setR4Search] = useState('');
  const [r4Page, setR4Page] = useState(1);

  useEffect(() => {
    api.get('/api/doctors').then((res) => setDoctors(res.data)).catch(console.error);
  }, []);

  // Fetch Report 1
  useEffect(() => {
    if (activeTab === 1) {
      fetchReport1();
    }
  }, [activeTab, r1Date, r1Doctor, r1Status, r1Page]);

  const fetchReport1 = async () => {
    setR1Loading(true);
    try {
      const params = {
        skip: (r1Page - 1) * 20,
        limit: 20
      };
      if (r1Date) params.date = r1Date;
      if (r1Doctor) params.doctor_id = r1Doctor;
      if (r1Status) params.status = r1Status;
      if (r1Search) params.search = r1Search;

      const res = await api.get('/api/reports/daily-appointments', { params });
      setR1Data(res.data.items);
      setR1Total(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setR1Loading(false);
    }
  };

  // Fetch Report 2
  useEffect(() => {
    if (activeTab === 2) {
      fetchReport2();
    }
  }, [activeTab, r2Page]);

  const fetchReport2 = async () => {
    setR2Loading(true);
    try {
      const params = {
        skip: (r2Page - 1) * 20,
        limit: 20
      };
      if (r2Search) params.search = r2Search;

      const res = await api.get('/api/reports/doctor-wise', { params });
      setR2Data(res.data.items);
      setR2Total(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setR2Loading(false);
    }
  };

  // Fetch Report 3
  useEffect(() => {
    if (activeTab === 3) {
      fetchReport3();
    }
  }, [activeTab, r3StartDate, r3EndDate, r3Gender, r3Page]);

  const fetchReport3 = async () => {
    setR3Loading(true);
    try {
      const params = {
        skip: (r3Page - 1) * 20,
        limit: 20
      };
      if (r3StartDate) params.start_date = r3StartDate;
      if (r3EndDate) params.end_date = r3EndDate;
      if (r3Gender) params.gender = r3Gender;
      if (r3Search) params.search = r3Search;

      const res = await api.get('/api/reports/patient-registration', { params });
      setR3Data(res.data.items);
      setR3Total(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setR3Loading(false);
    }
  };

  // Fetch Report 4
  useEffect(() => {
    if (activeTab === 4) {
      fetchReport4();
    }
  }, [activeTab, r4StartDate, r4EndDate, r4Page]);

  const fetchReport4 = async () => {
    setR4Loading(true);
    try {
      const params = {
        skip: (r4Page - 1) * 20,
        limit: 20
      };
      if (r4StartDate) params.start_date = r4StartDate;
      if (r4EndDate) params.end_date = r4EndDate;
      if (r4Search) params.search = r4Search;

      const res = await api.get('/api/reports/appointment-cancellation', { params });
      setR4Data(res.data.items);
      setR4Total(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setR4Loading(false);
    }
  };

  // CSV Exporters
  const downloadCsv = async (endpoint, defaultFilename) => {
    try {
      const token = localStorage.getItem('hospital_token');
      const response = await fetch(`${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate CSV export.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hospital Analytics & Mandatory Reports</h2>
        <p className="text-xs text-slate-500 mt-0.5">Four standard regulatory hospital reports with real-time audit data and CSV export capability</p>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab(1)}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 1 ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="truncate">1. Daily Appointments</span>
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 2 ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span className="truncate">2. Doctor-Wise Performance</span>
        </button>
        <button
          onClick={() => setActiveTab(3)}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 3 ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="truncate">3. Patient Registration</span>
        </button>
        <button
          onClick={() => setActiveTab(4)}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 4 ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="truncate">4. Cancellations Log</span>
        </button>
      </div>

      {/* ================= REPORT 1: DAILY APPOINTMENTS ================= */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                value={r1Date}
                onChange={(e) => { setR1Date(e.target.value); setR1Page(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={r1Doctor}
                onChange={(e) => { setR1Doctor(e.target.value); setR1Page(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.user?.full_name}</option>
                ))}
              </select>
              <select
                value={r1Status}
                onChange={(e) => { setR1Status(e.target.value); setR1Page(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-show">No-show</option>
              </select>
              {(r1Date || r1Doctor || r1Status || r1Search) && (
                <button
                  onClick={() => { setR1Date(''); setR1Doctor(''); setR1Status(''); setR1Search(''); setR1Page(1); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  const url = `/api/reports/daily-appointments/csv?${new URLSearchParams({
                    ...(r1Date && { date: r1Date }),
                    ...(r1Doctor && { doctor_id: r1Doctor }),
                    ...(r1Status && { status: r1Status })
                  }).toString()}`;
                  downloadCsv(url, 'daily_appointments_report.csv');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {r1Loading ? (
            <LoadingSpinner text="Compiling daily appointments..." />
          ) : r1Data.length === 0 ? (
            <EmptyState title="No appointments match this criteria" icon={Calendar} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Appt ID & #</th>
                      <th className="px-5 py-3.5">Patient Name</th>
                      <th className="px-5 py-3.5">Doctor Name</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Time</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {r1Data.map((item) => (
                      <tr key={item.appointment_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-brand-600">
                          #{item.appointment_id} ({item.appointment_number})
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.patient_name}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{item.doctor_name}</td>
                        <td className="px-5 py-3.5">{item.appointment_date}</td>
                        <td className="px-5 py-3.5">{item.appointment_time}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={r1Total} page={r1Page} pageSize={20} onPageChange={setR1Page} />
            </div>
          )}
        </div>
      )}

      {/* ================= REPORT 2: DOCTOR-WISE ================= */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <form onSubmit={(e) => { e.preventDefault(); fetchReport2(); }} className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search doctor or specialty..."
                value={r2Search}
                onChange={(e) => setR2Search(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </form>

            <button
              onClick={() => downloadCsv('/api/reports/doctor-wise/csv', 'doctor_wise_appointments_report.csv')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {r2Loading ? (
            <LoadingSpinner text="Computing doctor performance telemetry..." />
          ) : r2Data.length === 0 ? (
            <EmptyState title="No doctor records found" icon={Stethoscope} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Doctor Name</th>
                      <th className="px-5 py-3.5">Specialization</th>
                      <th className="px-5 py-3.5 text-center">Total Appointments</th>
                      <th className="px-5 py-3.5 text-center text-emerald-700">Completed</th>
                      <th className="px-5 py-3.5 text-center text-rose-700">Cancelled</th>
                      <th className="px-5 py-3.5 text-center text-brand-700">Upcoming</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {r2Data.map((item) => (
                      <tr key={item.doctor_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.doctor_name}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{item.specialization}</td>
                        <td className="px-5 py-3.5 text-center font-bold">{item.total_appointments}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-emerald-600 bg-emerald-50/30">{item.completed_appointments}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-rose-600 bg-rose-50/30">{item.cancelled_appointments}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-brand-600 bg-brand-50/30">{item.upcoming_appointments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={r2Total} page={r2Page} pageSize={20} onPageChange={setR2Page} />
            </div>
          )}
        </div>
      )}

      {/* ================= REPORT 3: PATIENT REGISTRATION ================= */}
      {activeTab === 3 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-slate-400 font-bold text-[11px]">From:</span>
              <input
                type="date"
                value={r3StartDate}
                onChange={(e) => { setR3StartDate(e.target.value); setR3Page(1); }}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              />
              <span className="text-slate-400 font-bold text-[11px]">To:</span>
              <input
                type="date"
                value={r3EndDate}
                onChange={(e) => { setR3EndDate(e.target.value); setR3Page(1); }}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              />
              <select
                value={r3Gender}
                onChange={(e) => { setR3Gender(e.target.value); setR3Page(1); }}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {(r3StartDate || r3EndDate || r3Gender) && (
                <button
                  onClick={() => { setR3StartDate(''); setR3EndDate(''); setR3Gender(''); setR3Page(1); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const url = `/api/reports/patient-registration/csv?${new URLSearchParams({
                  ...(r3StartDate && { start_date: r3StartDate }),
                  ...(r3EndDate && { end_date: r3EndDate }),
                  ...(r3Gender && { gender: r3Gender })
                }).toString()}`;
                downloadCsv(url, 'patient_registration_report.csv');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {r3Loading ? (
            <LoadingSpinner text="Compiling patient demographics..." />
          ) : r3Data.length === 0 ? (
            <EmptyState title="No patient registrations found" icon={Users} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Patient ID</th>
                      <th className="px-5 py-3.5">Patient Name</th>
                      <th className="px-5 py-3.5">Gender</th>
                      <th className="px-5 py-3.5">Age</th>
                      <th className="px-5 py-3.5">Phone Number</th>
                      <th className="px-5 py-3.5">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {r3Data.map((item) => (
                      <tr key={item.patient_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-brand-600">PAT-{item.patient_id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.patient_name}</td>
                        <td className="px-5 py-3.5">{item.gender}</td>
                        <td className="px-5 py-3.5 font-semibold">{item.age ? `${item.age} yrs` : 'N/A'}</td>
                        <td className="px-5 py-3.5">{item.phone_number || 'None'}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{item.registration_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={r3Total} page={r3Page} pageSize={20} onPageChange={setR3Page} />
            </div>
          )}
        </div>
      )}

      {/* ================= REPORT 4: APPOINTMENT CANCELLATION ================= */}
      {activeTab === 4 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-slate-400 font-bold text-[11px]">From:</span>
              <input
                type="date"
                value={r4StartDate}
                onChange={(e) => { setR4StartDate(e.target.value); setR4Page(1); }}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              />
              <span className="text-slate-400 font-bold text-[11px]">To:</span>
              <input
                type="date"
                value={r4EndDate}
                onChange={(e) => { setR4EndDate(e.target.value); setR4Page(1); }}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              />
              {(r4StartDate || r4EndDate) && (
                <button
                  onClick={() => { setR4StartDate(''); setR4EndDate(''); setR4Page(1); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const url = `/api/reports/appointment-cancellation/csv?${new URLSearchParams({
                  ...(r4StartDate && { start_date: r4StartDate }),
                  ...(r4EndDate && { end_date: r4EndDate })
                }).toString()}`;
                downloadCsv(url, 'cancellation_report.csv');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {r4Loading ? (
            <LoadingSpinner text="Retrieving cancellations analysis..." />
          ) : r4Data.length === 0 ? (
            <EmptyState title="No cancellations recorded" icon={AlertTriangle} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Appt ID & #</th>
                      <th className="px-5 py-3.5">Patient Name</th>
                      <th className="px-5 py-3.5">Doctor Name</th>
                      <th className="px-5 py-3.5">Appt Date</th>
                      <th className="px-5 py-3.5">Cancelled Date</th>
                      <th className="px-5 py-3.5">Cancellation Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {r4Data.map((item) => (
                      <tr key={item.appointment_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-rose-600">
                          #{item.appointment_id} ({item.appointment_number})
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.patient_name}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{item.doctor_name}</td>
                        <td className="px-5 py-3.5">{item.appointment_date}</td>
                        <td className="px-5 py-3.5 text-slate-500">{item.cancellation_date || 'N/A'}</td>
                        <td className="px-5 py-3.5 font-medium text-rose-800 italic bg-rose-50/30">
                          {item.cancellation_reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={r4Total} page={r4Page} pageSize={20} onPageChange={setR4Page} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

