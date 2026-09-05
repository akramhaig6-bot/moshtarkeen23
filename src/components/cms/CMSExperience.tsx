// ═══════════════════════════════════════════════════════════════
// تجربة تطبيق العميل (CMS) — وضع مستقل بملء الشاشة
// • منفصلة تماماً عن نظام الاستعلام في الـ Layout والواجهة والتصفح
// • مرتبطة بنفس المشترك الذي تم العثور عليه
// • تعرض فقط مكونات ومحتوى CMS المحددة لهذا المشترك من لوحة الإدارة
//   (دون أي مزج مع بطاقات أو مكونات نظام الاستعلام)
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Subscriber, Operation } from '@/types';
import { SubscriberCMS } from '@/types/cms';
import { SubscriberDashboard } from '@/components/cms/SubscriberDashboard';
import { motion } from 'motion/react';
import { X, LayoutGrid, ShieldCheck } from 'lucide-react';

export function CMSExperience({ subscriber, operations, cms, onClose }: {
  subscriber: Subscriber;
  operations: Operation[];
  cms: SubscriberCMS;
  onClose: () => void;
}) {
  // Esc للإغلاق + قفل تمرير الصفحة الخلفية أثناء فتح التجربة المستقلة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Portal إلى body: ضمان عزل كامل عن أي transform/z-index في شجرة نظام الاستعلام
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      dir="rtl"
      className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 sm:inset-3 md:inset-5 lg:inset-7 flex flex-col bg-white sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10"
      >
        {/* ── شريط التجربة المستقل (هوية منفصلة عن نظام الاستعلام) ── */}
        <div className="cmsx-chrome relative flex-shrink-0 h-14 sm:h-16 flex items-center justify-between gap-3 px-3 sm:px-5 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/20 flex-shrink-0">
              <LayoutGrid size={17} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-black truncate">تطبيق العميل — تجربة مستقلة</p>
              <p className="text-[10px] sm:text-[11px] text-slate-300/70 truncate flex items-center gap-1">
                <ShieldCheck size={10} className="flex-shrink-0" />
                يعرض حصرياً محتوى CMS المخصص للمشترك «{subscriber.name}»
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300/70 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 whitespace-nowrap">
              واجهة منفصلة عن نظام الاستعلام · Esc للخروج
            </span>
            <button
              type="button"
              onClick={onClose}
              title="إغلاق التجربة والعودة إلى الاستعلام"
              className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
            >
              <X size={14} /> إغلاق
            </button>
          </div>
        </div>

        {/* ── جسم التطبيق: تصفّح مستقل بمعزل عن صفحة الاستعلام ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
          <SubscriberDashboard subscriber={subscriber} operations={operations} cms={cms} />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
