import React from 'react';
import { Link } from 'react-router-dom';
import { Hospital, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
        <Hospital className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-800">404</h1>
      <h2 className="text-lg font-bold text-slate-600 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-1">
        The hospital portal page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Login / Dashboard</span>
      </Link>
    </div>
  );
};

