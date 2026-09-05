// لوحة البحث السريع (⌘K)

import { Subscriber, Operation } from '@/types';
import { statusBadge, subStatusBadge } from '@/components/shared/StatusBadges';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search, LayoutDashboard, Settings, User, Shield, ClipboardList, UserPlus, SlidersHorizontal, Crown, BarChart2, Keyboard,
} from 'lucide-react';

export function CommandPalette({ open, query, onQueryChange, onClose, subscribers, operations, onNavigate }: {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  subscribers: Subscriber[];
  operations: Operation[];
  onNavigate: (tab: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const navCommands = [
    { icon: <LayoutDashboard size={14} />, label: 'لوحة التحكم', tab: 'dashboard' },
    { icon: <Shield size={14} />, label: 'نظام الاستعلام', tab: 'admin' },
    { icon: <ClipboardList size={14} />, label: 'سجل العمليات', tab: 'addOperations' },
    { icon: <UserPlus size={14} />, label: 'إضافة مشترك', tab: 'addSubscriber' },
    { icon: <SlidersHorizontal size={14} />, label: 'إدارة النظام', tab: 'systemAdmin' },
    { icon: <Crown size={14} />, label: 'النظام المتقدم', tab: 'advanced' },
    { icon: <BarChart2 size={14} />, label: 'التقارير', tab: 'reports' },
    { icon: <Settings size={14} />, label: 'الإعدادات', tab: 'settings' },
  ];

  const q = query.trim().toLowerCase();
  const filteredNav = q ? navCommands.filter(c => c.label.includes(q) || c.tab.includes(q)) : navCommands;
  const filteredSubs = q.length >= 2 ? subscribers.filter(s =>
    s.name.toLowerCase().includes(q) || s.phone.includes(q)
  ).slice(0, 5) : [];
  const filteredOps = q.length >= 2 ? operations.filter(o =>
    o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q)
  ).slice(0, 3) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-200"
        onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => onQueryChange(e.target.value)}
            placeholder="بحث في النظام... (اكتب للبدء)"
            className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent text-right" dir="rtl" />
          <kbd className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2" dir="rtl">
          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div className="mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">التنقل</p>
              {filteredNav.map(cmd => (
                <button key={cmd.tab} onClick={() => onNavigate(cmd.tab)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors text-right">
                  <span className="text-slate-400">{cmd.icon}</span>
                  {cmd.label}
                </button>
              ))}
            </div>
          )}
          {/* Subscribers */}
          {filteredSubs.length > 0 && (
            <div className="mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">مشتركون</p>
              {filteredSubs.map(s => (
                <button key={s.id} onClick={() => onNavigate('admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors text-right">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User size={12} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.phone}</p>
                  </div>
                  <span className="mr-auto">{subStatusBadge(s.subscriberStatus)}</span>
                </button>
              ))}
            </div>
          )}
          {/* Operations */}
          {filteredOps.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">عمليات</p>
              {filteredOps.map(o => (
                <button key={o.id} onClick={() => onNavigate('addOperations')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors text-right">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={12} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{o.subscriberName} — {o.operation}</p>
                    <p className="text-xs text-slate-400">{o.amount} · {o.date}</p>
                  </div>
                  <span className="mr-auto">{statusBadge(o.status)}</span>
                </button>
              ))}
            </div>
          )}
          {filteredNav.length === 0 && filteredSubs.length === 0 && filteredOps.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد نتائج لـ "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1">↵</kbd> تنفيذ</span>
          <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1">ESC</kbd> إغلاق</span>
          <span className="flex items-center gap-1"><Keyboard size={10} /> {subscribers.length} مشترك · {operations.length} عملية</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
