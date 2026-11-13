import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  Heart,
  Activity,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const PatientMedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.patient_id) {
      api.get(`/api/medical-records/patient/${user.patient_id}`)
        .then((res) => setRecords(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Electronic Medical & Prescription Records</h2>
        <p className="text-xs text-slate-500 mt-0.5">Your official clinical consultation notes, diagnosis summaries, and medical prescriptions</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving medical records history..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No medical records found"
          description="Your medical visit notes and prescriptions will automatically appear here once a doctor completes your consultation."
          icon={FileText}
        />
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Dr. {r.doctor?.user?.full_name}</h3>
                    <p className="text-xs text-brand-600 font-semibold">{r.doctor?.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Clinical Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Symptoms */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Reported Symptoms</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{r.symptoms}</p>
                </div>

                {/* Diagnosis */}
                <div className="p-3.5 bg-brand-50/50 border border-brand-100/60 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-brand-700 block tracking-wider">Clinical Diagnosis</span>
                  <p className="text-brand-900 font-bold leading-relaxed">{r.diagnosis}</p>
                </div>
              </div>

              {/* Prescription (Rx) */}
              {r.prescription && (
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Pill className="w-4 h-4" />
                    <span>Prescription & Medical Regimen (Rx)</span>
                  </div>
                  <pre className="text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-200/50">
                    {r.prescription}
                  </pre>
                </div>
              )}

              {/* Consultation notes */}
              {r.consultation_notes && (
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Doctor's Advice & Instructions</span>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {r.consultation_notes}
                  </p>
                </div>
              )}

              {/* Follow-up date badge */}
              {r.follow_up_date && (
                <div className="pt-2 flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Next Recommended Consultation:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200 text-xs">
                    {r.follow_up_date}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

