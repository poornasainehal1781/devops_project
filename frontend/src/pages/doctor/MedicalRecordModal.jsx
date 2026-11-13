import React, { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const MedicalRecordModal = ({ isOpen, onClose, appointment }) => {
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    consultation_notes: '',
    prescription: '',
    follow_up_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (appointment?.id) {
      // Check if existing medical record exists
      api.get(`/api/medical-records/appointment/${appointment.id}`)
        .then((res) => {
          if (res.data) {
            setFormData({
              symptoms: res.data.symptoms || '',
              diagnosis: res.data.diagnosis || '',
              consultation_notes: res.data.consultation_notes || '',
              prescription: res.data.prescription || '',
              follow_up_date: res.data.follow_up_date || ''
            });
          }
        })
        .catch(() => {
          // No previous record, start fresh
          setFormData({
            symptoms: '',
            diagnosis: '',
            consultation_notes: '',
            prescription: '',
            follow_up_date: ''
          });
        });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        appointment_id: appointment.id,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        consultation_notes: formData.consultation_notes,
        prescription: formData.prescription,
        follow_up_date: formData.follow_up_date || null
      };

      await api.post('/api/medical-records', payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save medical consultation record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Consultation: ${appointment?.patient_name || 'Patient'} (${appointment?.appointment_number})`}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Medical record successfully documented and appointment marked as Completed!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Presented Symptoms *</label>
          <textarea
            required
            rows="2"
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="e.g. Chest pain radiating to left shoulder, shortness of breath on mild exertion..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
          <input
            type="text"
            required
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="e.g. Stable Angina Pectoris, Primary Essential Hypertension"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Prescription & Dosage (Rx)</label>
          <textarea
            rows="3"
            value={formData.prescription}
            onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
            placeholder="e.g. 1. Tab. Aspirin 75mg OD after breakfast (30 days)&#10;2. Tab. Atorvastatin 20mg HS (30 days)"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Consultation Advice / Doctor's Notes</label>
          <textarea
            rows="2"
            value={formData.consultation_notes}
            onChange={(e) => setFormData({ ...formData, consultation_notes: e.target.value })}
            placeholder="Dietary instructions, lifestyle modifications, warning signs to watch for..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Recommended Follow-up Date</label>
          <input
            type="date"
            value={formData.follow_up_date}
            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-bold shadow-md shadow-brand-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save & Complete Visit'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

