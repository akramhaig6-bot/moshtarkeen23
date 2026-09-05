// خانة معلومة مصغّرة (أيقونة + عنوان + قيمة)

import React from 'react';

export function MiniInfo({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-bold text-slate-700 break-all leading-snug ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
