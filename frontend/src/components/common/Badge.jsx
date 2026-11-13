import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  
  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  
  if (normalized === 'scheduled') {
    styles = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (normalized === 'confirmed') {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (normalized === 'completed') {
    styles = "bg-indigo-50 text-indigo-700 border-indigo-200";
  } else if (normalized === 'cancelled') {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (normalized === 'no-show') {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const norm = (role || '').toUpperCase();
  let color = "bg-slate-100 text-slate-800";
  if (norm === 'ADMIN') color = "bg-purple-100 text-purple-800 border-purple-200";
  if (norm === 'DOCTOR') color = "bg-sky-100 text-sky-800 border-sky-200";
  if (norm === 'PATIENT') color = "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (norm === 'RECEPTIONIST') color = "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {norm}
    </span>
  );
};

