// حقل إدخال نصي مصغّر للنماذج

import React from 'react';
import { Input } from '@/components/ui/input';

export function FField({ label, value, onChange, type = 'text', icon, placeholder, mono = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: React.ReactNode; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">{icon}{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? label}
        className={`h-10 border-slate-200 bg-white focus:ring-2 focus:ring-emerald-300 transition-all ${mono ? 'font-mono text-xs' : ''}`} />
    </div>
  );
}
