// رقاقة عرض معلومة (شريحة بيانات)

import React from 'react';

export function Chip({ icon, label, value, mono = false, green = false, orange = false }: {
  icon: React.ReactNode; label: string; value: string;
  mono?: boolean; green?: boolean; orange?: boolean;
}) {
  return (
    <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-2.5 space-y-0.5">
      <div className="flex items-center gap-1 text-slate-400">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-xs font-bold break-all leading-tight ${mono ? 'font-mono' : ''} ${green ? 'text-emerald-600' : orange ? 'text-orange-600' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}
