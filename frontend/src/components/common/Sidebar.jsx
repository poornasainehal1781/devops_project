import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Search,
  BookOpen,
  History,
  Shield,
  LogOut,
  Hospital
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Doctor Management', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Doctor Availability', path: '/admin/availability', icon: Clock },
          { name: 'Patient Management', path: '/admin/patients', icon: Users },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { name: 'Receptionists', path: '/admin/receptionists', icon: UserCheck },
          { name: 'Reports & Analytics', path: '/admin/reports', icon: FileText },
        ];
      case 'DOCTOR':
        return [
          { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'My Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Patients & Records', path: '/doctor/patients', icon: Users },
          { name: 'Schedule & Leaves', path: '/doctor/availability', icon: Clock },
        ];
      case 'PATIENT':
        return [
          { name: 'Patient Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Find Doctors & Book', path: '/patient/doctors', icon: Search },
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Medical Visit History', path: '/patient/records', icon: History },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Reception Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { name: 'Patient Directory', path: '/receptionist/patients', icon: Users },
          { name: 'Appointment Desk', path: '/receptionist/appointments', icon: Calendar },
          { name: 'Reports', path: '/receptionist/reports', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-tight tracking-tight">CarePoint</h1>
            <p className="text-[10px] uppercase font-semibold text-brand-600 tracking-wider">Hospital System</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate leading-snug">{user?.full_name}</p>
            <div className="mt-0.5">
              <RoleBadge role={role} />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

