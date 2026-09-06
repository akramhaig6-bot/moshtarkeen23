// لوحة قسم «بناء تطبيق العميل» بملء الشاشة — تُفتح من زر داخل إضافة مشترك / CMS
// متجاوبة: رأس ثابت قابل للانكماش، وحشو يتكيّف مع الهاتف، وهوامش آمنة.
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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} dir="rtl"
      className="builder-ui fixed inset-0 z-[95] bg-slate-100 flex flex-col overflow-hidden safe-top">
      <div className="min-h-14 bg-white border-b border-slate-200 flex items-center justify-between gap-2 px-3 lg:px-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0"><Hammer size={17} /></span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate leading-tight">بناء تطبيق العميل</p>
            <p className="text-[11px] text-slate-400 truncate">بيئة بناء مستقلة — تعمل من شاشة الهاتف بالكامل</p>
          </div>
        </div>
        <button onClick={onClose}
          className="h-10 lg:h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 text-xs font-black flex items-center gap-1.5 flex-shrink-0">
          <X size={15} /> <span className="hidden sm:inline">إغلاق</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain pane-scroll p-3 sm:p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto w-full">
          <AppBuilderTab subscribers={subscribers} operations={operations} />
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
