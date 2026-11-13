import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  Filter,
  Calendar,
  Award,
  DollarSign,
  Building,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const DoctorSearchPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  useEffect(() => {
    api.get('/api/doctors/specializations/all').then((res) => setSpecializations(res.data)).catch(console.error);
    fetchDoctors();
  }, []);

  const fetchDoctors = async (query = search, spec = selectedSpec) => {
    setLoading(true);
    try {
      const params = { is_available: true };
      if (query) params.search = query;
      if (spec) params.specialization = spec;

      const res = await api.get('/api/doctors', { params });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search, selectedSpec);
  };

  const handleSpecSelect = (spec) => {
    setSelectedSpec(spec);
    fetchDoctors(search, spec);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Find Specialists & Doctors</h2>
        <p className="text-xs text-slate-500 mt-0.5">Browse certified medical faculty, check consultation fees, and select your doctor</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, specialty, qualifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => handleSpecSelect('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedSpec === '' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Specialties
            </button>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecSelect(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSpec === spec ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Searching for medical specialists..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors matched your criteria"
          description="Try selecting a different specialization or clearing search terms."
          icon={Stethoscope}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-base">
                      {doc.user?.full_name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">Dr. {doc.user?.full_name}</h3>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">{doc.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doc.qualifications}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.experience_years} years clinical experience</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.room_number || 'General OPD'}</span>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation</span>
                  <span className="text-base font-extrabold text-emerald-600">${doc.consultation_fee}</span>
                </div>
                <Link
                  to={`/patient/book?doctor_id=${doc.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

