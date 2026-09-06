// لوحة قسم «بناء تطبيق العميل» بملء الشاشة — تُفتح من زر داخل إضافة مشترك / CMS
import { Operation, Subscriber } from '@/types';
import { AppBuilderTab } from '@/components/app-builder/AppBuilderTab';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Hammer } from 'lucide-react';

export function AppBuilderPanel({ subscribers, operations, onClose }: {
  subscribers: Subscriber[];
  operations: Operation[];
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} dir="rtl"
      className="fixed inset-0 z-[95] bg-slate-100 flex flex-col overflow-hidden">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center"><Hammer size={17} /></span>
          <div>
            <p className="text-sm font-black text-slate-800">بناء تطبيق العميل</p>
            <p className="text-[11px] text-slate-400">بيئة بناء مستقلة — نفس القسم الموجود في القائمة الجانبية</p>
          </div>
        </div>
        <button onClick={onClose} className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 text-xs font-black flex items-center gap-1.5">
          <X size={14} /> إغلاق
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto">
          <AppBuilderTab subscribers={subscribers} operations={operations} />
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
