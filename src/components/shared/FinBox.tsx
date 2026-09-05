// بطاقة مبلغ مالي ملوّنة

import React from 'react';

export function FinBox({ icon, label, value, bg, ring, color, extra }: {
  icon: React.ReactNode; label: string; value: string;
  bg: string; ring: string; color: string; extra?: React.ReactNode;
}) {
  return (
    <div className={`${bg} ring-1 ${ring} rounded-xl p-3`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs text-slate-500 font-medium">{label}</span></div>
      <p className={`text-lg font-black ${color}`}>{value}</p>
      {extra}
    </div>
  );
}
