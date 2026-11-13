import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  X
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';

export const PatientManagementPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected patient & history modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [visitHistory, setVisitHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query = search) => {
    setLoading(true);
    try {
      const res = await api.get('/api/patients', { params: { search: query } });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const openPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/patients/${patient.id}/history`);
      setVisitHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Patient Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive patient medical files, demographics, and visit logs</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patients by name, email, phone, blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Patient Table */}
      {loading ? (
        <LoadingSpinner text="Querying patient registry..." />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="Try modifying your search criteria."
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">DOB & Gender</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5">Emergency Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {p.user?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{p.user?.full_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.user?.email}</p>
                          <p className="text-[10px] text-slate-500">{p.user?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{p.date_of_birth}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.gender}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-100">
                        {p.blood_group || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{p.emergency_contact_name || 'None'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.emergency_contact_phone || 'None'}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openPatientDetails(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visit History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details & Visit History Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedPatient ? `Patient Medical Record: ${selectedPatient.user?.full_name}` : 'Patient Records'}
        maxWidth="max-w-3xl"
      >
        {selectedPatient && (
          <div className="space-y-5 text-xs">
            {/* Demographics Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase">DOB & Gender</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.date_of_birth} ({selectedPatient.gender})</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase">Blood Group</p>
                <p className="font-bold text-rose-600 mt-0.5">{selectedPatient.blood_group || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase">Phone</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase">Emergency Contact</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.emergency_contact_name || 'N/A'}</p>
              </div>
              {selectedPatient.address && (
                <div className="col-span-2 sm:col-span-4 mt-2 pt-2 border-t border-slate-200/60 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{selectedPatient.address}</span>
                </div>
              )}
            </div>

            {/* Visit History Section */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>Clinical Visits & Consultation Records</span>
              </h4>

              {loadingHistory ? (
                <LoadingSpinner text="Retrieving visit notes..." />
              ) : visitHistory.length === 0 ? (
                <p className="text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No appointments recorded for this patient yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {visitHistory.map((appt) => (
                    <div key={appt.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-600 text-xs">{appt.appointment_number}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-800">{appt.appointment_date} at {appt.appointment_time}</span>
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>

                      <p className="text-slate-600 font-medium">
                        Doctor: <span className="font-bold text-slate-900">Dr. {appt.doctor?.user?.full_name}</span> ({appt.doctor?.specialization})
                      </p>

                      {appt.reason_for_visit && (
                        <p className="text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                          Reason: {appt.reason_for_visit}
                        </p>
                      )}

                      {appt.medical_record && (
                        <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                          <p className="text-xs font-bold text-blue-900">Diagnosis: {appt.medical_record.diagnosis}</p>
                          <p className="text-[11px] text-slate-700">Symptoms: {appt.medical_record.symptoms}</p>
                          {appt.medical_record.prescription && (
                            <div className="text-[11px] text-slate-800 pt-1 border-t border-blue-200/50">
                              <span className="font-bold">Prescription:</span> {appt.medical_record.prescription}
                            </div>
                          )}
                          {appt.medical_record.consultation_notes && (
                            <p className="text-[11px] text-slate-600">Notes: {appt.medical_record.consultation_notes}</p>
                          )}
                          {appt.medical_record.follow_up_date && (
                            <p className="text-[10px] font-bold text-brand-700 mt-1">
                              Follow-up Date: {appt.medical_record.follow_up_date}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

