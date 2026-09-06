// ═══════════════════════════════════════════════════════════════
// تجربة تطبيق العميل المبني — وضع مستقل بملء الشاشة (مثل تجربة CMS)
// يظهر في الاستعلام عند العثور على المشترك المرتبط بالتطبيق
// ═══════════════════════════════════════════════════════════════
import { AppProject } from '@/types/app-builder';
import { Operation, Subscriber } from '@/types';
import { subscriberRuntimeData } from '@/lib/app-builder-runtime-data';
import { AppRuntime } from '@/components/app-builder/AppRuntime';
import { useEffect, useMemo } from 'react';
import { useViewport } from '@/components/app-builder/builder-ui';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Hammer, ShieldCheck } from 'lucide-react';

export function AppExperience({ project, subscriber, operations, onClose }: {
  project: AppProject;
  subscriber: Subscriber;
  operations: Operation[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const data = useMemo(() => subscriberRuntimeData(subscriber, operations), [subscriber, operations]);
  const { w: vw } = useViewport();
  // عرض التصميم المُعلَن للمحرّك: جوال حتى 640px، وتابلت حتى 1024px، وإلا ديسكتوب
  const runtimeDevice = vw < 640 ? 375 : vw < 1024 ? 768 : 1280;

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      dir="rtl" className="builder-ui fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-sm">
      <motion.div initial={{ y: 30, opacity: 0, scale: 0.985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 sm:inset-3 md:inset-5 lg:inset-7 flex flex-col bg-white sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
        <div className="relative flex-shrink-0 min-h-14 sm:h-16 flex items-center justify-between gap-3 px-3 sm:px-5 py-2 sm:py-0 text-white bg-gradient-to-l from-slate-900 via-slate-900 to-slate-800 safe-top">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/40 ring-1 ring-white/20 flex-shrink-0">
              <Hammer size={17} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-black truncate">{project.name} — تطبيق مبني</p>
              <p className="text-[10px] sm:text-[11px] text-slate-300/70 truncate flex items-center gap-1">
                <ShieldCheck size={10} className="flex-shrink-0" />
                من قسم «بناء تطبيق العميل» · مخصص للمشترك «{subscriber.name}»
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300/70 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 whitespace-nowrap">
              الإصدار {project.version} · Esc للخروج
            </span>
            <span className="md:hidden inline-flex items-center text-[10px] font-bold text-slate-300/70 px-2 py-1 rounded-full bg-white/5 ring-1 ring-white/10 whitespace-nowrap flex-shrink-0">
              v{project.version}
            </span>
            <button type="button" onClick={onClose} title="إغلاق التطبيق والعودة إلى الاستعلام"
              className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white text-xs font-black flex items-center gap-1.5 transition-colors">
              <X size={14} /> إغلاق
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pane-scroll bg-white">
          {/* العرض يتكيّف مع اتجاه/حجم الشاشة لحظيًا (دوران الهاتف) */}
          <AppRuntime project={project} data={data} device={runtimeDevice} className="min-h-full" />
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
