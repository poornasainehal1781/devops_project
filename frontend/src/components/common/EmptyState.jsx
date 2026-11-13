import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = "No records found", description = "There is currently no data to display.", action, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-700">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

