import React from 'react';
import { Menu, Calendar, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, role } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">{user?.email}</p>
          </div>
          <RoleBadge role={role} />
        </div>
      </div>
    </header>
  );
};

