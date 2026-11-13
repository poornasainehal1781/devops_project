import React from 'react';
import { Activity } from 'lucide-react';

export const LoadingSpinner = ({ text = "Loading records..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-brand-600">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

