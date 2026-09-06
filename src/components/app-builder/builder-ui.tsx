// ═══════════════════════════════════════════════════════════════
// عناصر البناء المتجاوبة (Responsive Builder Primitives)
// طبقة عرض فقط: تُنظّف طريقة ظهور أدوات الاستوديو على الجوال
// (Bottom Sheet · Drawer · Tabs · Tooltip-free touch targets)
// لا تُزيل أي وظيفة — كل أداة تبقى موجودة وتصل إليها بضغطة
// ═══════════════════════════════════════════════════════════════
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { X } from 'lucide-react';

// ─────────────── قياس نافذة العرض ───────────────
export interface Viewport { w: number; h: number }

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));
  useEffect(() => {
    let raf = 0;
    const read = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp({ w: window.innerWidth, h: window.innerHeight }));
    };
    read();
    window.addEventListener('resize', read);
    window.addEventListener('orientationchange', read);
    if (typeof visualViewport !== 'undefined') visualViewport.addEventListener('resize', read);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', read);
      window.removeEventListener('orientationchange', read);
      if (typeof visualViewport !== 'undefined') visualViewport.removeEventListener('resize', read);
    };
  }, []);
  return vp;
}

export interface BuilderMode {
  vw: number; vh: number;
  /** هاتف: شريط أدوات مضغوط + أشرطة سفلية */
  isPhone: boolean;
  /** أصغر من سطح المكتب: الألواح الجانبية تتحول إلى sheets */
  isCompact: boolean;
  /** شاشة عريضة: تخطيط الأعمدة الثلاثة الكامل */
  isWide: boolean;
}

/** نقاط التوقف المعتمدة في بيئة البناء (مستقلة عن Tailwind لأن القياس هنا فعلي) */
export function useBuilderMode(): BuilderMode {
  const { w, h } = useViewport();
  return { vw: w, vh: h, isPhone: w < 640, isCompact: w < 1024, isWide: w >= 1024 };
}

/** عرض/ارتفاع عنصر DOM بمقياس حقيقي (يتتبع تغيير حجم اللوحة وتدوير الجهاز) */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    apply();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', apply);
      return () => window.removeEventListener('resize', apply);
    }
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return { ref, size };
}

// ─────────────── النافذة/اللوح المتجاوب ───────────────
/**
 * على الشاشات العريضة: dialog في المنتصف أو drawer جانبي (كما كان).
 * على الجوال/التابلت: bottom sheet بملء العرض، قابل للسحب للإغلاق،
 * مع هيدر ثابت وفوتر ثابت حتى لا يخرج أي زر خارج الشاشة.
 */
export function Sheet({
  open, onClose, title, subtitle, icon, footer, headerExtra, children,
  desktop = 'center', widthClass = 'w-[560px]', maxWidthClass = 'max-w-[95vw]',
  bodyClass = '', panelClass = '', zIndex = 130, dismissible = true, fillHeight = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  /** شكل العرض على الشاشات العريضة */
  desktop?: 'center' | 'left' | 'right';
  widthClass?: string;
  maxWidthClass?: string;
  bodyClass?: string;
  panelClass?: string;
  zIndex?: number;
  dismissible?: boolean;
  /** يملأ ارتفاع الشاشة (مفيد للمحررات الطويلة) */
  fillHeight?: boolean;
}) {
  const { isWide } = useBuilderMode();
  const bottom = !isWide;
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  // Esc يُغلق آخر طبقة مفتوحة فقط (يمنع وصول المفتاح للاستوديو خلفها)
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (dismissible) onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [open, onClose, dismissible]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!bottom) return;
    startY.current = e.clientY;
    setDragging(true);
    const cap = (e.currentTarget as HTMLElement).setPointerCapture;
    if (typeof cap === 'function') cap.call(e.currentTarget, e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!bottom || !dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const endDrag = () => {
    if (!bottom) return;
    setDragging(false);
    if (dragY > 96) onClose();
    setDragY(0);
  };

  const enter: Record<string, Variants> = {
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
    center: { initial: { opacity: 0, scale: 0.97, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 10 } },
    left: { initial: { x: -Math.min(560, 700) }, animate: { x: 0 }, exit: { x: -Math.min(560, 700) } },
    right: { initial: { x: Math.min(560, 700) }, animate: { x: 0 }, exit: { x: Math.min(560, 700) } },
  };
  const anim = enter[bottom ? 'bottom' : desktop === 'center' ? 'center' : desktop];

  const shell = bottom
    ? 'fixed inset-x-0 bottom-0 rounded-t-3xl'
    : desktop === 'center'
      ? 'fixed inset-0 flex items-center justify-center p-3 sm:p-6 pointer-events-none'
      : desktop === 'left'
        ? `fixed inset-y-0 left-0 ${widthClass} ${maxWidthClass}`
        : `fixed inset-y-0 right-0 ${widthClass} ${maxWidthClass}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => dismissible && onClose()}
            className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" style={{ zIndex }}
            data-testid="builder-sheet-backdrop"
          />
          <div className={shell} style={{ zIndex: zIndex + 1 }} data-testid="builder-sheet">
            <motion.div
              {...anim}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onPointerDown={desktop === 'center' && !bottom ? undefined : (e => { if (desktop === 'center' && !bottom) e.stopPropagation(); })}
              style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? 'none' : undefined }}
              className={[
                'bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col min-h-0',
                bottom
                  ? `w-full max-h-[92vh] rounded-t-3xl safe-bottom ${fillHeight ? 'h-[92vh]' : ''}`
                  : desktop === 'center'
                    ? `pointer-events-auto rounded-2xl w-full ${widthClass} ${maxWidthClass} ${fillHeight ? 'h-[88vh]' : 'max-h-[88vh]'}`
                    : `rounded-none max-w-full h-full ${widthClass}`,
                panelClass,
              ].join(' ')}
              onClick={e => e.stopPropagation()}
            >
              {/* مقبض السحب على الجوال */}
              {bottom && (
                <div className="flex-shrink-0 pt-2 cursor-grab active:cursor-grabbing touch-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
                  <span className="mx-auto block h-1.5 w-11 rounded-full bg-slate-300" />
                </div>
              )}

              {(title || bottom) && (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex-shrink-0 min-h-12 rounded-t-3xl sm:rounded-t-none">
                  {icon && <span className="flex-shrink-0 text-slate-500">{icon}</span>}
                  <div className="min-w-0 flex-1">
                    {title && <p className="text-sm font-black text-slate-800 truncate leading-tight">{title}</p>}
                    {subtitle && <p className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>}
                  </div>
                  {headerExtra}
                  <button onClick={onClose} aria-label="إغلاق" title="إغلاق"
                    className="tap h-9 w-9 flex-shrink-0 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center">
                    <X size={17} />
                  </button>
                </div>
              )}

              <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain pane-scroll thin-scroll ${bodyClass}`}>
                {children}
              </div>

              {footer && (
                <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 safe-bottom">{footer}</div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────── الأزرار ───────────────
type Tone = 'default' | 'primary' | 'success' | 'danger' | 'warn' | 'violet' | 'indigo' | 'ghost';

const TONE_SOFT: Record<Tone, string> = {
  default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  warn: 'bg-amber-500 text-white hover:bg-amber-600',
  violet: 'bg-violet-600 text-white hover:bg-violet-700',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
};

const TONE_SOLID: Record<Tone, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  warn: 'bg-amber-500 text-white hover:bg-amber-600',
  violet: 'bg-violet-600 text-white hover:bg-violet-700',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
};

/** زر أيقوني — 36px على الجوال (لمس مريح) و28px على الحاسوب */
export function IconBtn({
  children, label, onClick, tone = 'ghost', disabled, className = '', active, solid = false, variant = 'soft',
}: {
  children: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  tone?: Tone;
  disabled?: boolean;
  className?: string;
  active?: boolean;
  solid?: boolean;
  variant?: 'soft' | 'solid' | 'outline';
}) {
  const pal = variant === 'solid' ? TONE_SOLID[tone] : variant === 'outline'
    ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
    : TONE_SOFT[tone];
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} aria-pressed={active}
      className={`tap h-9 w-9 lg:h-8 lg:w-8 flex-shrink-0 inline-flex items-center justify-center rounded-xl transition-colors
        disabled:opacity-35 disabled:pointer-events-none ${active ? 'ring-2 ring-blue-500/70 ' : ''}${pal} ${className}`}>
      {children}
    </button>
  );
}

/** زر شريط الأدوات: أيقونة + نص، لا ينكسر ولا يختفي على الجوال */
export function ToolBtn({
  children, icon, onClick, tone = 'default', disabled, className = '', compactLabel, title, badge,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  tone?: Tone;
  disabled?: boolean;
  className?: string;
  /** نص أقصر يُعرض على الجوال فقط */
  compactLabel?: string;
  title?: string;
  badge?: React.ReactNode;
}) {
  const pal = tone === 'default'
    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
    : TONE_SOLID[tone];
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`tap relative inline-flex items-center gap-1.5 h-9 lg:h-8 px-3 lg:px-2.5 rounded-xl text-[12px] lg:text-xs font-black whitespace-nowrap flex-shrink-0 transition-colors
        disabled:opacity-40 disabled:pointer-events-none ${pal} ${className}`}>
      {icon}
      <span className="hidden sm:inline">{children}</span>
      {compactLabel && <span className="sm:hidden">{compactLabel}</span>}
      {badge}
    </button>
  );
}

/** زر قائمة (قائمة منسدلة/شيت) — صفوف كبيرة قابلة للضغط */
export function MenuRow({
  icon, label, hint, onClick, tone = 'default', trailing, disabled,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'danger' | 'primary';
  trailing?: React.ReactNode;
  disabled?: boolean;
}) {
  const pal = tone === 'danger' ? 'text-red-600' : tone === 'primary' ? 'text-blue-700' : 'text-slate-700';
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-3 lg:py-2 rounded-xl text-right transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 ${pal}`}>
      {icon && <span className="flex-shrink-0 opacity-80">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] lg:text-xs font-black truncate">{label}</span>
        {hint && <span className="block text-[11px] font-normal text-slate-400 truncate">{hint}</span>}
      </span>
      {trailing}
    </button>
  );
}

// ─────────────── تبويبات أفقية (تمرير جانبي عند الضيق) ───────────────
export function ChipTabs<T extends string>({
  items, value, onChange, className = '', size = 'md',
}: {
  items: [T, React.ReactNode, (string | number)?][];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [value]);
  return (
    <div role="tablist" className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 ${className}`}>
      {items.map(([v, l, count]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v}
          ref={el => { refs.current[v] = el; }}
          onClick={() => onChange(v)}
          className={`tap flex-shrink-0 whitespace-nowrap rounded-xl font-black transition-colors inline-flex items-center gap-1
            ${size === 'sm' ? 'h-8 px-2.5 text-[11px]' : 'h-9 lg:h-8 px-3 text-[12px] lg:text-[11px]'}
            ${value === v ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <span className="truncate max-w-[42vw] lg:max-w-none">{l}</span>
          {count != null && (
            <span className={`text-[10px] tabular-nums ${value === v ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** شريط أدوات أفقي قابل للتمرير — يمنع اختفاء أي زر خارج الشاشة */
export function ScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 ${className}`}>
      {children}
    </div>
  );
}

// ─────────────── حقول النماذج ───────────────
export function Field({
  label, hint, children, className = '', inline = true,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** inline = تسمية بجانب الحقل على الشاشات العريضة، وفوقه على الجوال */
  inline?: boolean;
}) {
  return (
    <div className={`${inline ? 'flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2' : 'space-y-1'} ${className}`}>
      <label className="text-[11px] sm:text-[10px] font-bold text-slate-500 sm:w-[100px] lg:w-[86px] flex-shrink-0 leading-tight">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
      {hint && <p className="text-[10px] text-slate-400 sm:hidden">{hint}</p>}
    </div>
  );
}

/** صف بيانات مضغوط (تسمية + حقل) يبقى مقروءًا على الجوال */
export function Row({ label, children, className = '' }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-[11px] lg:text-[10px] font-bold text-slate-500 w-[92px] lg:w-[86px] flex-shrink-0 leading-tight">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/** مفتاح تشغيل/إيقاف بمنطقة لمس كاملة الصف */
export function ToggleRow({ label, checked, onChange, hint }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; hint?: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-2 min-h-11 lg:min-h-9 cursor-pointer select-none py-0.5">
      <span className="text-[12px] lg:text-[10px] font-bold text-slate-600">
        {label}
        {hint && <span className="block text-[10px] font-normal text-slate-400">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <span className={`flex items-center w-10 h-6 rounded-full p-0.5 flex-shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1 ${checked ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
        <span className="w-5 h-5 rounded-full bg-white shadow" />
      </span>
    </label>
  );
}

// ─────────────── حالة فارغة مساعدة ───────────────
export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-400 text-center py-4">{children}</p>;
}

/** زر عائم يفتح لوحة الخصائص على الجوال عند تحديد عنصر (لا يضيع الوصول) */
export function FloatingPill({
  onClick, children, tone = 'primary', className = '',
}: { onClick: () => void; children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`fixed z-[124] inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl text-[12px] font-black shadow-2xl ring-1 ring-black/5 active:scale-95 transition
        ${TONE_SOLID[tone]} ${className}`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.6rem)', insetInlineStart: '50%', transform: 'translateX(50%)' }}>
      {children}
    </button>
  );
}

/** يُستعمل في الشريط العلوي: يُظهر الزر كنص على الحاسوب وكأيقونة على الجوال */
export function useNarrowLabel(wide: string, narrow: string) {
  const { isWide } = useBuilderMode();
  return useCallback(() => (isWide ? wide : narrow), [isWide, wide, narrow]);
}
