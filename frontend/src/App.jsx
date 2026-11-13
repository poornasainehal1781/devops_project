import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { DoctorManagementPage } from './pages/admin/DoctorManagementPage';
import { DoctorAvailabilityPage } from './pages/admin/DoctorAvailabilityPage';
import { PatientManagementPage } from './pages/admin/PatientManagementPage';
import { AppointmentManagementPage } from './pages/admin/AppointmentManagementPage';
import { ReceptionistManagementPage } from './pages/admin/ReceptionistManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Doctor Pages
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';

// Patient Pages
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { DoctorSearchPage } from './pages/patient/DoctorSearchPage';
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage';
import { PatientMedicalRecordsPage } from './pages/patient/PatientMedicalRecordsPage';

// Receptionist Pages
import { ReceptionistDashboardPage } from './pages/receptionist/ReceptionistDashboardPage';
import { ReceptionistPatientsPage } from './pages/receptionist/ReceptionistPatientsPage';
import { ReceptionistAppointmentsPage } from './pages/receptionist/ReceptionistAppointmentsPage';

// Not Found
import { NotFoundPage } from './pages/NotFoundPage';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ADMIN Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/doctors" element={<DoctorManagementPage />} />
              <Route path="/admin/availability" element={<DoctorAvailabilityPage />} />
              <Route path="/admin/patients" element={<PatientManagementPage />} />
              <Route path="/admin/appointments" element={<AppointmentManagementPage />} />
              <Route path="/admin/receptionists" element={<ReceptionistManagementPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* DOCTOR Routes */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
              <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
            </Route>
          </Route>

          {/* PATIENT Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
              <Route path="/patient/doctors" element={<DoctorSearchPage />} />
              <Route path="/patient/book" element={<BookAppointmentPage />} />
              <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
              <Route path="/patient/records" element={<PatientMedicalRecordsPage />} />
            </Route>
          </Route>

          {/* RECEPTIONIST Routes */}
          <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboardPage />} />
              <Route path="/receptionist/patients" element={<ReceptionistPatientsPage />} />
              <Route path="/receptionist/appointments" element={<ReceptionistAppointmentsPage />} />
              <Route path="/receptionist/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

