// صف مشترك قابل للتوسيع داخل لوحة الإدارة

import { Subscriber } from '@/types';
import { subStatusBadge } from '@/components/shared/StatusBadges';
import { Chip } from '@/components/shared/Chip';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Wallet, AlertCircle, CreditCard, User, Pencil, Trash2, ChevronDown, Hash, Building2, Calendar, Banknote, Globe, Cpu,
} from 'lucide-react';

export function SubRow({ sub, expanded, onToggle, onEdit, onDelete }: {
  sub: Subscriber; expanded: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800">{sub.name || '(بدون اسم)'}</p>
            {sub.subscriberStatus && subStatusBadge(sub.subscriberStatus)}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {sub.phone && <span className="text-xs text-slate-400">{sub.phone}</span>}
            {sub.bankName && <span className="text-xs text-slate-400 hidden sm:inline">· {sub.bankName}</span>}
            {sub.subscriptionAmount > 0 && <span className="text-xs font-bold text-emerald-600 hidden sm:inline">· {sub.subscriptionAmount.toLocaleString()} ر.س</span>}
            {sub.currency && <span className="text-xs text-blue-500 font-bold hidden sm:inline">· {sub.currency}</span>}
            {sub.platform && <span className="text-xs text-purple-500 font-medium hidden lg:inline">· {sub.platform}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors ml-1"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {sub.iban && <Chip icon={<CreditCard size={12} />} label="آيبان" value={sub.iban} mono />}
                {sub.subscriptionAmount > 0 && <Chip icon={<Wallet size={12} />} label="الاشتراك" value={`${sub.subscriptionAmount.toLocaleString()} ر.س`} />}
                {sub.profits > 0 && <Chip icon={<TrendingUp size={12} />} label="الأرباح" value={`${sub.profits.toLocaleString()} ر.س`} green />}
                {sub.systemFees > 0 && <Chip icon={<AlertCircle size={12} />} label="رسوم النظام" value={`${sub.systemFees.toLocaleString()} ر.س`} orange />}
                {sub.systemAccount && <Chip icon={<Building2 size={12} />} label="حساب النظام" value={sub.systemAccount} mono />}
                {sub.bankName && <Chip icon={<Banknote size={12} />} label="البنك" value={sub.bankName} />}
                {sub.joinDate && <Chip icon={<Calendar size={12} />} label="الانضمام" value={sub.joinDate} />}
                {sub.walletAddress && <Chip icon={<Hash size={12} />} label="المحفظة" value={`${sub.walletAddress.slice(0, 12)}…`} mono />}
                {sub.currency && <Chip icon={<Globe size={12} />} label="العملة" value={sub.currency} />}
                {sub.platform && <Chip icon={<Cpu size={12} />} label="المنصة" value={sub.platform} />}
              </div>
              {sub.notes && (
                <div className="mt-3 p-2.5 rounded-lg bg-yellow-50 ring-1 ring-yellow-200 text-xs text-slate-600">
                  <span className="font-bold text-yellow-700">ملاحظة: </span>{sub.notes}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
