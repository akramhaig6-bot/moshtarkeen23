// ═══════════════════════════════════════════════════════════════
// تطبيق العميل المخصص — عرض جميع الأقسام 28 بعد الاستعلام
// كل عنصر يحترم Toggle الظهور/الإخفاء وإعدادات التصميم
// + تنقل بين الأقسام (views) + Bottom Bar + Widgets + تصدير
// ═══════════════════════════════════════════════════════════════
import { Subscriber, Operation } from '@/types';
import { SubscriberCMS, CalendarEvent, DesignColors, CustomText, CustomSection, CustomAlert, Countdown } from '@/types/cms';
import { resolveCMS, WALLET_SECTION_TITLE } from '@/data/cms-defaults';
import { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import {
  Building2, User, Bell, Moon, Search, Globe, Menu, X, Home, Wallet, TrendingUp, CreditCard, ArrowLeftRight, Settings, Shield, HelpCircle, LogOut, Star, Phone, Mail, MapPin, ExternalLink, AlertCircle, FileText, Clock, Download, ChevronLeft, ChevronRight, Share2, Printer, FileSpreadsheet, Calculator, CloudSun, Coins, Bitcoin, DollarSign,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ═══ أيقونات ═══
const ICONS: Record<string, React.ComponentType<any>> = { home: Home, wallet: Wallet, profits: TrendingUp, operations: CreditCard, withdraw: ArrowLeftRight, account: User, settings: Settings, shield: Shield, search: Search, bell: Bell, moon: Moon, globe: Globe, star: Star, help: HelpCircle, logout: LogOut, file: FileText, clock: Clock, map: MapPin };
const Ic = ({ n, s = 16, c }: { n: string; s?: number; c?: string }) => { const C = ICONS[n] || Star; return <C size={s} style={c ? { color: c } : undefined} />; };

// ═══ الاستعلامات (views) ═══
const NAV_VIEWS = ['home', 'wallet', 'profits', 'operations', 'withdraw', 'account', 'settings'];
const VIEW_TITLES: Record<string, string> = { home: 'الرئيسية', wallet: WALLET_SECTION_TITLE, profits: 'أرباحي', operations: 'العمليات', withdraw: 'السحب', account: 'حسابي', settings: 'الإعدادات', docs: 'المستندات', extras: 'العروض الجديدة' };

// ═══ استبدال المتغيرات ═══
function rv(text: string, sub: Subscriber, ops: Operation[]): string {
  if (!text) return '';
  const now = new Date();
  const sOps = ops.filter(o => o.subscriberName === sub.name);
  const last = sOps.sort((a, b) => b.date.localeCompare(a.date))[0];
  const pct = sub.subscriptionAmount > 0 ? ((sub.profits / sub.subscriptionAmount) * 100).toFixed(1) : '0';
  return text
    .replace(/\{الاسم\}/g, sub.name).replace(/\{الهاتف\}/g, sub.phone)
    .replace(/\{الرصيد_الإجمالي\}/g, String(sub.subscriptionAmount + sub.profits))
    .replace(/\{مبلغ_الاشتراك\}/g, String(sub.subscriptionAmount))
    .replace(/\{الأرباح\}/g, String(sub.profits)).replace(/\{الرسوم\}/g, String(sub.systemFees))
    .replace(/\{البنك\}/g, sub.bankName).replace(/\{IBAN\}/g, sub.iban)
    .replace(/\{المنصة\}/g, sub.platform).replace(/\{تاريخ_الانضمام\}/g, sub.joinDate)
    .replace(/\{الحالة\}/g, sub.subscriberStatus).replace(/\{الشركة\}/g, '')
    .replace(/\{اليوم\}/g, String(now.getDate())).replace(/\{الشهر\}/g, String(now.getMonth() + 1))
    .replace(/\{السنة\}/g, String(now.getFullYear()))
    .replace(/\{عدد_العمليات\}/g, String(sOps.length))
    .replace(/\{آخر_عملية\}/g, last?.operation || 'لا يوجد')
    .replace(/\{نسبة_الربح\}/g, pct + '%');
}

// ═══ Sparkline بسيطة بـ SVG ═══
const Spark = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null;
  const w = 100, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(2)},${(h - 2 - ((v - min) / ((max - min) || 1)) * (h - 4)).toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full mt-2 block" style={{ height: 30 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// تصنيف نوع العملية (عمود "النوع")
const opKind = (opName: string): { label: string; color: string } => {
  if (opName.includes('سحب')) return { label: 'سحب', color: '#ef4444' };
  if (opName.includes('إيداع') || opName.includes('ايداع')) return { label: 'إيداع', color: '#2563eb' };
  if (opName.includes('أرباح') || opName.includes('ارباح')) return { label: 'أرباح', color: '#10b981' };
  if (opName.includes('رسوم')) return { label: 'رسوم', color: '#f59e0b' };
  return { label: 'أخرى', color: '#64748b' };
};

// ═══ توليد المواعيد المتكررة لمدة 3 أشهر قادمة ═══
function expandEvents(events: CalendarEvent[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setMonth(end.getMonth() + 3);
  events.forEach(ev => {
    if (!ev.visible) return;
    const base = new Date(ev.date);
    if (!ev.date || isNaN(base.getTime()) || ev.repeat === 'once' || !ev.repeat) { out.push(ev); return; }
    let cur = new Date(base);
    let guard = 0;
    while (cur < now && guard < 120) { cur = new Date(cur); if (ev.repeat === 'weekly') cur.setDate(cur.getDate() + 7); else cur.setMonth(cur.getMonth() + 1); guard++; }
    while (cur <= end && guard < 200) {
      out.push({ ...ev, id: `${ev.id}_${cur.toISOString().slice(0, 10)}`, date: cur.toISOString().slice(0, 10) });
      cur = new Date(cur);
      if (ev.repeat === 'weekly') cur.setDate(cur.getDate() + 7); else cur.setMonth(cur.getMonth() + 1);
      guard++;
    }
  });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ═══ نافذة طباعة مساعدة ═══
function printDoc(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'width=860,height=960');
  if (!w) { toast.error('تعذر فتح نافذة الطباعة — اسمح بالنوافذ المنبثقة'); return; }
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>${title}</title><style>
    *{box-sizing:border-box} body{font-family:'Cairo','Tajawal',Tahoma,sans-serif;padding:28px;color:#1e293b}
    h1{font-size:20px;margin:0 0 4px} .muted{color:#64748b;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:14px} th,td{padding:9px 12px;text-align:right;font-size:13px;border-bottom:1px solid #e2e8f0}
    th{background:#f1f5f9;font-size:12px} .net{margin-top:14px;font-size:16px;font-weight:800;display:flex;justify-content:space-between;border-top:2px solid #1e293b;padding-top:10px}
    .notes{margin-top:14px;font-size:11px;color:#64748b;border-top:1px dashed #cbd5e1;padding-top:8px}
    .stamp{margin-top:18px;max-width:130px;transform:rotate(-8deg);opacity:.85} .head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e3a8a;padding-bottom:10px}
    .num{direction:ltr;font-family:monospace}
  </style></head><body>${bodyHtml}<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script></body></html>`);
  w.document.close();
}

// ═══ طبقة التصميم (Skin) ═══
// سبب الاهتزاز/الرفة في البطاقات (المحفظة خصوصاً): كانت هذه المكوّنات تُعرَّف داخل
// جسم المكوّن الأم، فكل إعادة رسم كانت تُنتج «نوع مكوّن» جديد بالكامل، ويرى React أنه
// مكوّن مختلف → يحذف الشجرة ويعيد تركيبها. إعادة التركيب تُشغّل حركة الظهور
// (opacity 0→1 / y 20→0) من الصفر، ومع نبضة الساعة كل ثانية كانت البطاقات والعناوين
// ترتجف ولا تستقر أبداً. النقل إلى مستوى الوحدة + تمرير التصميم عبر Context يثبّت الهوية.
type EntryAnim = {
  initial?: { opacity?: number; y?: number };
  animate?: { opacity?: number; y?: number };
  transition?: { duration?: number; delay?: number };
};
type DashSkin = {
  C: DesignColors;
  rd: string;
  cShadow: string;
  cBorder: React.CSSProperties;
  hoverCls: string;
  glass: boolean;
  anim: EntryAnim;
  gap: string;
  gridCls: string;
  sub: Subscriber;
  ops: Operation[];
  setView: (v: string) => void;
  setLightbox: (src: string | null) => void;
  closeAlert: (id: string) => void;
};
const SkinCtx = createContext<DashSkin | null>(null);
const useSkin = (): DashSkin => useContext(SkinCtx) as DashSkin;

// نبضة زمنية معزولة داخل المكوّن الصغير وحده (ساعة حية / عد تنازلي)
// حتى لا تُعاد قراءة الداشبورد بالكامل كل ثانية.
function useSecondsTick(intervalMs = 1000): Date {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}

// ═══ بطاقة عامة (مع Stagger delay اختياري) ═══
const Card = ({ children, className = '', style = {}, noAnim = false, delay = 0 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; noAnim?: boolean; delay?: number }) => {
  const { C, rd, cShadow, cBorder, hoverCls, glass, anim } = useSkin();
  const el = (
    <div className={`${rd} ${cShadow} ${hoverCls} p-4 transition-all duration-300 ${className}`}
      style={{ backgroundColor: glass ? C.bgCards + 'b3' : C.bgCards, ...cBorder, ...style }}>
      {children}
    </div>
  );
  if (noAnim) return el;
  return <motion.div initial={anim.initial} animate={anim.animate} transition={delay ? { ...(anim.transition || {}), delay } : anim.transition}>{el}</motion.div>;
};

// غلاف العرض الفرعي: عنوان + زر رجوع
const SubView = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { C, anim, setView } = useSkin();
  return (
    <>
      <motion.div initial={anim.initial} animate={anim.animate} transition={anim.transition} className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black" style={{ color: C.textMain }}>{title}</h2>
        <button onClick={() => setView('home')} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-80" style={{ backgroundColor: C.primary + '15', color: C.primary }}>
          <ChevronRight size={13} /> رجوع للرئيسية
        </button>
      </motion.div>
      {children}
    </>
  );
};

// نص مخصص متكرر
const CustomTextCard = ({ t }: { t: CustomText }) => {
  const { C, rd, anim, sub, ops } = useSkin();
  return (
    <motion.div key={t.id} initial={anim.initial} animate={anim.animate} transition={anim.transition} className={`${rd} p-3 mb-4 ${t.border === 'frame' ? 'border-2' : t.border === 'edges' ? 'border-t-2 border-b-2' : ''} flex items-start gap-2`}
      style={{ backgroundColor: t.bgType === 'color' ? t.bgValue : C.bgCards, borderColor: t.bgType === 'color' && t.bgValue ? t.bgValue : C.primary, textAlign: (t.align as any) || 'right' }}>
      {t.icon && t.icon !== 'star' && <span className="mt-0.5"><Ic n={t.icon} s={15} c={t.color || C.primary} /></span>}
      <div className="flex-1">
        {t.title && <p className={`font-bold mb-1 ${t.size === 'small' ? 'text-xs' : t.size === 'large' ? 'text-base' : 'text-sm'}`} style={{ color: t.color || C.textMain }}>{t.title}</p>}
        <p className={`${t.size === 'small' ? 'text-xs' : t.size === 'large' ? 'text-base' : 'text-sm'}`} style={{ color: t.color || C.textSecondary }}>{rv(t.content, sub, ops)}</p>
      </div>
    </motion.div>
  );
};

// تنبيه ملوّن
const AlertCard = ({ a }: { a: CustomAlert }) => {
  const { rd, anim, closeAlert } = useSkin();
  const ac: Record<string, { bg: string; tx: string; bd: string }> = { info: { bg: '#eff6ff', tx: '#1e40af', bd: '#bfdbfe' }, success: { bg: '#f0fdf4', tx: '#166534', bd: '#bbf7d0' }, warning: { bg: '#fffbeb', tx: '#92400e', bd: '#fde68a' }, danger: { bg: '#fef2f2', tx: '#991b1b', bd: '#fecaca' } };
  const c = ac[a.type] || ac.info;
  return (
    <motion.div initial={anim.initial} animate={anim.animate} transition={anim.transition} className={`${rd} p-3 mb-4 flex items-center gap-2`} style={{ backgroundColor: c.bg, border: `1px solid ${c.bd}` }}>
      <AlertCircle size={16} style={{ color: c.tx }} />
      <p className="text-sm flex-1" style={{ color: c.tx }}>{a.text}</p>
      {a.closable && <button onClick={() => closeAlert(a.id)} className="p-1 rounded-full hover:bg-black/10"><X size={12} /></button>}
    </motion.div>
  );
};

// بطاقة قسم مخصص (تُستخدم في الرئيسية والصفحات المستقلة)
const SectionCard = ({ sec }: { sec: CustomSection }) => {
  const { C, rd, setLightbox } = useSkin();
  const [open, setOpen] = useState(sec.defaultState !== 'closed');
  const body = (
    <>
      {sec.description && <p className="text-sm mb-3" style={{ color: C.textSecondary, lineHeight: '1.8' }}>{sec.description}</p>}
      {sec.images.length > 0 && <div className={`${sec.imageDisplay === 'grid' ? 'grid grid-cols-2 gap-2' : sec.imageDisplay === 'single' ? '' : 'flex gap-2 overflow-x-auto pb-2 snap-x'}`}>
        {sec.images.map((img, i) => (
          <img key={i} src={img} alt={`${sec.title} ${i + 1}`} onClick={() => setLightbox(img)} className={`${sec.imageSize === 'small' ? 'w-20 h-20' : sec.imageSize === 'medium' ? 'w-40 h-40' : sec.imageSize === 'large' ? 'w-full h-56' : 'w-full h-72'} ${sec.imageDisplay === 'single' || sec.imageSize === 'large' || sec.imageSize === 'fullscreen' ? 'w-full' : ''} ${rd} object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity ${sec.imageDisplay === 'carousel' || sec.imageDisplay === 'slider' ? 'snap-center' : ''}`} />
        ))}
      </div>}
      {sec.videoUrl && <div className="mt-3 aspect-video rounded-lg overflow-hidden"><iframe src={sec.videoUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={sec.title} /></div>}
      {sec.buttons.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{sec.buttons.map(btn => <a key={btn.id} href={btn.url || '#'} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 hover:opacity-90" style={{ backgroundColor: btn.color || C.primary }}>{btn.label} <ExternalLink size={11} /></a>)}</div>}
    </>
  );
  if (sec.collapsible) {
    return (
      <Card key={sec.id} className={`mb-4 ${sec.style === 'frame' ? 'border-2' : ''}`} style={{ backgroundColor: sec.bgColor || C.bgCards, borderColor: sec.style === 'frame' ? C.borders : undefined }}>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2">
          <Ic n={sec.icon} s={16} c={C.primary} />
          <h3 className="font-bold text-sm flex-1 text-right" style={{ color: C.textMain }}>{sec.title}</h3>
          {sec.subtitle && <span className="text-xs" style={{ color: C.textSecondary }}>{sec.subtitle}</span>}
          <ChevronLeft size={14} className={`transition-transform ${open ? '-rotate-90' : ''}`} style={{ color: C.textSecondary }} />
        </button>
        {open && <div className="mt-3">{body}</div>}
      </Card>
    );
  }
  return (
    <Card key={sec.id} className={`mb-4 ${sec.style === 'frame' ? 'border-2' : ''}`} style={{ backgroundColor: sec.bgColor || C.bgCards, borderColor: sec.style === 'frame' ? C.borders : undefined }}>
      <div className="flex items-center gap-2 mb-2"><Ic n={sec.icon} s={16} c={C.primary} /><h3 className="font-bold text-sm" style={{ color: C.textMain }}>{sec.title}</h3>{sec.subtitle && <span className="text-xs" style={{ color: C.textSecondary }}>{sec.subtitle}</span>}</div>
      {body}
    </Card>
  );
};

// ═══ أدوات الوقت: تنبض داخلياً فقط ═══
const LiveClockTile = () => {
  const { C } = useSkin();
  const now = useSecondsTick(1000);
  return (
    <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}>
      <p className="text-lg font-bold tabular-nums" style={{ color: C.primary }}>{now.toLocaleTimeString('ar-SA')}</p>
      <p className="text-[10px]" style={{ color: C.textSecondary }}>الوقت الآن</p>
    </div>
  );
};

const HijriDateTile = () => {
  const { C } = useSkin();
  const now = useSecondsTick(60000);
  return (
    <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}>
      <p className="text-[11px] font-bold leading-5" style={{ color: C.primary }}>{now.toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p className="text-[10px]" style={{ color: C.textSecondary }}>التاريخ الهجري</p>
    </div>
  );
};

// بطاقات العد التنازلي — النبضة الثانية داخلها فقط، فلا تهتز بقية البطاقات
const CountdownCards = ({ items, variant = 'full' }: { items: Countdown[]; variant?: 'full' | 'compact' }) => {
  const { C, gap } = useSkin();
  const now = useSecondsTick(1000);
  const list = items.filter(c => c.visible && c.targetDate).sort((a, b) => (a.order || 0) - (b.order || 0));
  if (list.length === 0) return null;
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map(cd => {
          const target = new Date(cd.targetDate + (cd.targetTime ? 'T' + cd.targetTime : '')); const diff = Math.max(0, target.getTime() - now.getTime());
          const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000);
          return <Card key={cd.id} className="text-center"><p className="text-xs font-bold mb-1" style={{ color: cd.color }}>{cd.title}</p><p className="text-2xl font-black tabular-nums" style={{ color: cd.color }}>{d} <span className="text-xs">يوم</span> {h} <span className="text-xs">ساعة</span></p></Card>;
        })}
      </div>
    );
  }
  return (
    <div className={`grid ${gap} mb-6 ${list.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {list.map(cd => {
        const target = new Date(cd.targetDate + (cd.targetTime ? 'T' + cd.targetTime : '')); const diff = Math.max(0, target.getTime() - now.getTime());
        const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
        return <Card key={cd.id} className="text-center"><p className="text-xs font-bold mb-2" style={{ color: cd.color }}>{cd.title}</p><div className="flex justify-center gap-2">{[{ v: d, l: 'يوم' }, { v: h, l: 'ساعة' }, { v: m, l: 'دقيقة' }, { v: s, l: 'ثانية' }].map((t, i) => <div key={i} className="px-3 py-2 rounded-lg" style={{ backgroundColor: cd.color + '15' }}><p className="text-lg font-black tabular-nums" style={{ color: cd.color }}>{t.v}</p><p className="text-[9px]" style={{ color: C.textSecondary }}>{t.l}</p></div>)}</div></Card>;
      })}
    </div>
  );
};

// ═══ المكوّن الرئيسي ═══
export function SubscriberDashboard({ subscriber: sub, operations: ops, cms }: { subscriber: Subscriber; operations: Operation[]; cms: SubscriberCMS }) {
  const R = useMemo(() => resolveCMS(cms), [cms]);
  const [sbOpen, setSbOpen] = useState(R.sideBar.defaultState === 'open');
  const [dark, setDark] = useState(false);
  const [view, setView] = useState('home');
  const [now, setNow] = useState(new Date());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set());
  const [closedAlerts, setClosedAlerts] = useState<Set<string>>(new Set());
  const [tableSearch, setTableSearch] = useState('');
  const [showWithdrawText, setShowWithdrawText] = useState(false);
  // حالة قراءة الرسائل (محلية فقط)
  const [msgRead, setMsgRead] = useState<Set<string>>(() => new Set(R.messages.messages.filter(m => m.read).map(m => m.id)));
  // حاسبة الأرباح
  const [calcAmount, setCalcAmount] = useState<string>(sub.subscriptionAmount ? String(sub.subscriptionAmount) : '10000');
  const [calcRate, setCalcRate] = useState<string>(sub.subscriptionAmount > 0 ? String(Math.round((sub.profits / sub.subscriptionAmount) * 100)) : '10');
  const [calcMonths, setCalcMonths] = useState('12');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const C = dark && R.design.darkMode.enabled ? R.design.darkMode.colors : R.design.colors;
  const sOps = useMemo(() => ops.filter(o => o.subscriberName === sub.name), [ops, sub.name]);
  const isSubView = view !== 'home';

  // إعادة فحص نافذة التاريخ (نصوص/أقسام/بانرات مرتبطة بتاريخ) — كل دقيقة مرة.
  // الساعة الحية والعد التنازلي انتقلا لمكوّناتهما الخاصة (LiveClockTile / CountdownCards)
  // حتى لا تُعاد قراءة الداشبورد بالكامل كل ثانية فتُعاد حركات الظهور من الصفر.
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  // وضع داكن تلقائي
  useEffect(() => { if (R.design.darkMode.autoSwitch) { const h = new Date().getHours(); setDark(h >= 18 || h < 6); } }, [R.design.darkMode.autoSwitch]);
  // تحميل خطوط جوجل
  useEffect(() => {
    const fonts = new Set([R.design.fonts.heading, R.design.fonts.body].filter(Boolean));
    fonts.forEach(f => {
      if (!document.querySelector(`link[data-font="${f}"]`)) {
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.font = f;
        l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;500;700&display=swap`;
        document.head.appendChild(l);
      }
    });
  }, [R.design.fonts.heading, R.design.fonts.body]);

  // ═══ مساعدات ═══
  const gap = R.design.spacing === 'tight' ? 'gap-2' : R.design.spacing === 'wide' ? 'gap-6' : 'gap-4';
  const rd = R.design.corners === 'sharp' ? 'rounded-none' : R.design.corners === 'very-rounded' ? 'rounded-2xl' : 'rounded-xl';
  const cShadow = R.design.cardStyle === 'shadow' ? 'shadow-md' : R.design.cardStyle === 'glass' ? 'backdrop-blur-xl shadow-lg' : R.design.cardStyle === 'neumorphism' ? 'shadow-[5px_5px_10px_rgba(0,0,0,0.08),-5px_-5px_10px_rgba(255,255,255,0.9)]' : R.design.cardStyle === 'border' ? 'border' : '';
  const cBorder = useMemo<React.CSSProperties>(() => R.design.cardStyle === 'border' ? { border: `1px solid ${C.borders}` } : R.design.cardStyle === 'glass' ? { border: '1px solid rgba(255,255,255,0.2)' } : {}, [R.design.cardStyle, C.borders]);
  const hoverCls = R.design.hoverEffect === 'zoom' ? 'hover:scale-[1.02]' : R.design.hoverEffect === 'lift' ? 'hover:-translate-y-1 hover:shadow-lg' : R.design.hoverEffect === 'glow' ? 'hover:shadow-xl hover:shadow-blue-500/10' : '';
  // حركات الظهور حسب الإعدادات (fade/slide/bounce/none) — كائن ثابت الهوية
  const anim: EntryAnim = useMemo(() => R.design.animation === 'none'
    ? {}
    : { initial: { opacity: 0, y: R.design.animation === 'slide' ? 20 : R.design.animation === 'bounce' ? -10 : 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } }, [R.design.animation]);

  const fSize = R.design.fonts.baseSize === 'small' ? 'text-sm' : R.design.fonts.baseSize === 'large' ? 'text-lg' : 'text-base';
  const fWeight = R.design.fonts.weight === 'bold' ? 'font-bold' : R.design.fonts.weight === 'medium' ? 'font-medium' : 'font-normal';
  const fLine = R.design.fonts.lineHeight === 'tight' ? 'leading-tight' : R.design.fonts.lineHeight === 'wide' ? 'leading-loose' : 'leading-normal';
  const gridCls = R.design.grid === 1 ? 'grid-cols-1' : R.design.grid === 2 ? 'grid-cols-1 sm:grid-cols-2' : R.design.grid === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  const tbH = R.topBar.height === 'small' ? 48 : R.topBar.height === 'large' ? 80 : 64;
  const statusInfo = () => { const s = R.clientProfile.statusStyle; return s === 'active' ? { l: 'نشط', c: 'bg-emerald-400', t: 'text-emerald-700', bg: 'bg-emerald-50' } : s === 'pending' ? { l: 'معلق', c: 'bg-amber-400', t: 'text-amber-700', bg: 'bg-amber-50' } : s === 'stopped' ? { l: 'موقوف', c: 'bg-red-400', t: 'text-red-700', bg: 'bg-red-50' } : { l: 'جديد', c: 'bg-blue-400', t: 'text-blue-700', bg: 'bg-blue-50' }; };
  const badgeInfo = () => { const b = R.clientProfile.badge; return b === 'vip' ? { l: '⭐ VIP' } : b === 'premium' ? { l: '🏆 مميز' } : b === 'platinum' ? { l: '💎 بلاتيني' } : b === 'founder' ? { l: '🎖️ مؤسس' } : null; };
  const avShape = R.clientProfile.avatarShape === 'circle' ? 'rounded-full' : R.clientProfile.avatarShape === 'square' ? 'rounded-none' : 'rounded-xl';
  const dispName = R.clientProfile.displayMode === 'hidden' ? '' : R.clientProfile.displayMode === 'alias' ? (R.clientProfile.displayName || sub.name) : sub.name;
  const dispPhone = R.clientProfile.phoneDisplay === 'hidden' ? '' : R.clientProfile.phoneDisplay === 'partial' ? (sub.phone.length > 4 ? sub.phone.slice(0, 2) + '••••' + sub.phone.slice(-2) : sub.phone) : sub.phone;
  const curSym = (sym?: string, code?: string) => sym || code || 'ر.س';
  const netBalance = sub.subscriptionAmount + sub.profits - sub.systemFees;

  // طبقة التصميم المشتركة بين المكوّنات المثبتة في أعلى الملف
  const skin: DashSkin = useMemo(() => ({
    C, rd, cShadow, cBorder, hoverCls, anim, gap, gridCls,
    glass: R.design.cardStyle === 'glass',
    sub, ops: sOps,
    setView, setLightbox,
    closeAlert: (id: string) => setClosedAlerts(prev => new Set(prev).add(id)),
  }), [C, rd, cShadow, cBorder, hoverCls, anim, gap, gridCls, R.design.cardStyle, sub, sOps]);

  // خلفيات
  const bgStyle = (): React.CSSProperties => {
    const bg = R.design.background;
    if (bg.type === 'color') return { backgroundColor: bg.color };
    if (bg.type === 'gradient') return { background: bg.gradient || `linear-gradient(${bg.gradientDirection || '135deg'}, ${C.bgMain}, ${C.bgCards})` };
    if (bg.type === 'image' && bg.image) return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: bg.fixed ? 'fixed' : 'scroll' };
    return { backgroundColor: C.bgMain };
  };

  // التنقل: من Bottom Bar / Side Bar
  const go = (action: string) => {
    if (action === 'sidebar') { setSbOpen(true); return; }
    if (action === 'support') { const link = R.sideBar.footer.supportLink; if (link) window.open(link, '_blank'); else toast.info('لا يوجد رابط دعم مُعدّ'); return; }
    if (action === 'custom' || action === 'extras') { setView('extras'); return; }
    setView(action);
    // اختياري (?.) لأن بعض البيئات/الـ DOM المصغّر لا يوفّر scrollTo
    mainRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  // فلترة النصوص والعناصر
  const activeTexts = R.texts.filter(t => t.visible && (!t.expiryDate || new Date(t.expiryDate) > now));
  const activeSections = R.sections.filter(s => s.visible && (!s.dateFrom || new Date(s.dateFrom) <= now) && (!s.dateTo || new Date(s.dateTo) >= now));
  const activeBanners = R.banners.filter(b => b.visible && !closedBanners.has(b.id) && (!b.expiryDate || new Date(b.expiryDate) > now));
  const activeAlerts = R.alerts.filter(a => a.visible && !closedAlerts.has(a.id));
  const homeSections = activeSections.filter(s => (s.location || 'home') === 'home').sort((a, b) => a.order - b.order);
  const separateSections = activeSections.filter(s => s.location === 'separate' || s.location === 'sidebar').sort((a, b) => a.order - b.order);
  const expandedCalEvents = useMemo(() => expandEvents(R.calendar.events), [R.calendar.events]);

  // ═══ بطاقات مالية (تُستخدم في الرئيسية + محفظة المستثمر) ═══
  const financialCards = (
    <div className={`grid ${gridCls} ${gap} mb-6`}>
      {sub.subscriptionAmount > 0 && <Card delay={0}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primary + '15' }}><Wallet size={16} style={{ color: C.primary }} /></div><span className="text-xs" style={{ color: C.textSecondary }}>مبلغ الاشتراك</span></div><p className="text-xl font-bold" style={{ color: C.textMain }}>{sub.subscriptionAmount.toLocaleString()} <span className="text-xs">{curSym(sub.subscriptionCurrencySymbol, sub.subscriptionCurrency)}</span></p></Card>}
      {sub.profits > 0 && <Card delay={0.08}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.success + '15' }}><TrendingUp size={16} style={{ color: C.success }} /></div><span className="text-xs" style={{ color: C.textSecondary }}>الأرباح</span></div><p className="text-xl font-bold" style={{ color: C.success }}>{sub.profits.toLocaleString()} <span className="text-xs">{curSym(sub.profitsCurrencySymbol, sub.profitsCurrency)}</span></p></Card>}
      {sub.systemFees > 0 && <Card delay={0.16}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.warning + '15' }}><AlertCircle size={16} style={{ color: C.warning }} /></div><span className="text-xs" style={{ color: C.textSecondary }}>رسوم النظام</span></div><p className="text-xl font-bold" style={{ color: C.warning }}>{sub.systemFees.toLocaleString()} <span className="text-xs">{curSym(sub.systemFeesCurrencySymbol, sub.systemFeesCurrency)}</span></p></Card>}
      <Card delay={0.24}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.secondary + '15' }}><CreditCard size={16} style={{ color: C.secondary }} /></div><span className="text-xs" style={{ color: C.textSecondary }}>الصافي المتاح</span></div><p className="text-xl font-bold" style={{ color: C.textMain }}>{netBalance.toLocaleString()}</p></Card>
    </div>
  );

  // بطاقة المحفظة الرقمية
  const walletCard = sub.walletAddress ? (
    <Card className="mb-6">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: C.textMain }}><Wallet size={15} style={{ color: C.primary }} /> المحفظة الرقمية</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        {sub.walletPlatform && <div className="p-2 rounded-lg text-center" style={{ backgroundColor: C.bgMain }}><p className="text-[10px]" style={{ color: C.textSecondary }}>المنصة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.walletPlatform}</p></div>}
        {sub.walletCurrency && <div className="p-2 rounded-lg text-center" style={{ backgroundColor: C.bgMain }}><p className="text-[10px]" style={{ color: C.textSecondary }}>العملة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.walletCurrency}</p></div>}
        {sub.walletNetwork && <div className="p-2 rounded-lg text-center" style={{ backgroundColor: C.bgMain }}><p className="text-[10px]" style={{ color: C.textSecondary }}>الشبكة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.walletNetwork}</p></div>}
      </div>
      <div className="p-2 rounded-lg flex items-center justify-between gap-2" style={{ backgroundColor: C.bgMain }}>
        <code className="text-[10px] font-mono break-all flex-1" style={{ color: C.textMain }}>{sub.walletAddressValue || sub.walletAddress}</code>
        <button onClick={() => { navigator.clipboard?.writeText(sub.walletAddressValue || sub.walletAddress); toast.success('تم نسخ العنوان'); }} className="text-[10px] px-2 py-1 rounded-md font-bold flex-shrink-0" style={{ backgroundColor: C.primary + '15', color: C.primary }}>نسخ</button>
      </div>
    </Card>
  ) : null;

  // ═══ بطاقات المعلومات (مع Sparkline) ═══
  const visibleInfoCards = R.infoCards.filter(c => c.visible).sort((a, b) => a.order - b.order);
  const infoCardsBlock = visibleInfoCards.length > 0 && (
    <div className={`grid ${gridCls} ${gap} mb-6`}>
      {visibleInfoCards.map((card, i) => (
        <Card key={card.id} delay={i * 0.1}>
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '15' }}><Ic n={card.icon} s={16} c={card.color} /></div><span className="text-xs" style={{ color: C.textSecondary }}>{card.title}</span></div>
          <p className="text-xl font-bold" style={{ color: C.textMain }}>{card.value}</p>
          {card.change && <p className="text-[10px] mt-1" style={{ color: C.success }}>{card.change}</p>}
          {card.sparkline && card.sparkline.length > 1 && <Spark data={card.sparkline} color={card.color} />}
        </Card>
      ))}
    </div>
  );

  // ═══ جدول البيانات: بحث + أعمدة + تصدير ═══
  const tableBlock = (() => {
    if (!R.dataTable.visible || sOps.length === 0) return null;
    const sorted = R.dataTable.sortOrder === 'oldest' ? [...sOps].sort((a, b) => a.date.localeCompare(b.date)) : [...sOps].sort((a, b) => b.date.localeCompare(a.date));
    const q = tableSearch.trim().toLowerCase();
    const searched = q ? sorted.filter(op => `${op.operation} ${op.amount} ${op.date} ${op.status}`.toLowerCase().includes(q)) : sorted;
    const rows = R.dataTable.maxRows === 0 ? searched : searched.slice(0, R.dataTable.maxRows);
    const cols = R.dataTable.columns.length > 0 ? R.dataTable.columns : ['العملية', 'المبلغ', 'التاريخ', 'الحالة'];
    const exportTable = () => {
      if (R.dataTable.exportable === 'excel') {
        const header = ['#', ...cols];
        const csv = [header, ...searched.map((op, i) => [String(i + 1), op.operation, op.amount, op.date, op.status, opKind(op.operation).label].slice(0, header.length))].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `operations-${sub.name}.csv`; a.click(); URL.revokeObjectURL(url);
        toast.success('تم تصدير الجدول CSV');
      } else if (R.dataTable.exportable === 'pdf') {
        const trs = searched.map((op, i) => `<tr><td>${i + 1}</td>${cols.includes('العملية') ? `<td>${op.operation}</td>` : ''}${cols.includes('المبلغ') ? `<td class="num">${op.amount}</td>` : ''}${cols.includes('النوع') ? `<td>${opKind(op.operation).label}</td>` : ''}${cols.includes('التاريخ') ? `<td class="num">${op.date}</td>` : ''}${cols.includes('الحالة') ? `<td>${op.status}</td>` : ''}</tr>`).join('');
        printDoc(R.dataTable.title || 'سجل العمليات', `<h1>${R.dataTable.title || 'سجل العمليات'}</h1><p class="muted">${sub.name} · ${searched.length} عملية · ${new Date().toLocaleDateString('ar-SA')}</p><table><thead><tr><th>#</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${trs}</tbody></table>`);
      }
    };
    return (
      <Card className="mb-6" noAnim>
        <div className="p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2" style={{ borderColor: C.borders }}>
            <h3 className="font-bold text-sm" style={{ color: C.textMain }}>{R.dataTable.title || 'سجل العمليات'}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary + '15', color: C.primary }}>{sOps.length} عملية</span>
              {R.dataTable.searchable && (
                <div className="relative">
                  <input value={tableSearch} onChange={e => setTableSearch(e.target.value)} placeholder="بحث..." className="h-7 w-32 sm:w-40 rounded-lg pr-7 text-[11px] border outline-none" style={{ backgroundColor: C.bgMain, borderColor: C.borders, color: C.textMain }} />
                  <Search size={11} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: C.textSecondary }} />
                </div>
              )}
              {R.dataTable.exportable && R.dataTable.exportable !== 'none' && (
                <button onClick={exportTable} className="h-7 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1" style={{ backgroundColor: C.primary + '15', color: C.primary }}>
                  {R.dataTable.exportable === 'pdf' ? <><Printer size={10} /> تصدير PDF</> : <><FileSpreadsheet size={10} /> تصدير Excel</>}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ backgroundColor: R.dataTable.colors.header || C.bgMain }}>
            <th className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: R.dataTable.colors.text || C.textSecondary }}>#</th>
            {cols.map(h => <th key={h} className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: R.dataTable.colors.text || C.textSecondary }}>{h}</th>)}
          </tr></thead><tbody>{rows.map((op, i) => (
            <tr key={op.id} className="border-t transition-colors" style={{ borderColor: C.borders, backgroundColor: i % 2 === 0 ? R.dataTable.colors.rows : C.bgMain }}>
              <td className="px-4 py-2.5 text-xs" style={{ color: C.textSecondary }}>{i + 1}</td>
              {cols.includes('العملية') && <td className="px-4 py-2.5 text-sm" style={{ color: C.textMain }}>{op.operation}</td>}
              {cols.includes('المبلغ') && <td className="px-4 py-2.5 text-sm font-bold" style={{ color: C.primary }}>{op.amount}</td>}
              {cols.includes('النوع') && <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: opKind(op.operation).color + '15', color: opKind(op.operation).color }}>{opKind(op.operation).label}</span></td>}
              {cols.includes('التاريخ') && <td className="px-4 py-2.5 text-xs" style={{ color: C.textSecondary }}>{op.date}</td>}
              {cols.includes('الحالة') && <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${op.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-700' : op.status === 'قيد المعالجة' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{op.status}</span></td>}
            </tr>))}</tbody></table></div>
          {rows.length === 0 && <p className="text-center text-xs py-6" style={{ color: C.textSecondary }}>لا توجد نتائج مطابقة للبحث</p>}
        </div>
      </Card>
    );
  })();

  // ═══ الفاتورة: عرض الختم + تحميل PDF ═══
  const invoiceBlock = (() => {
    if (!R.invoice.enabled || !R.invoice.visible) return null;
    const net = R.invoice.items.reduce((s, it) => s + (it.type === 'credit' ? it.amount : -it.amount), 0);
    const printInvoice = () => {
      const rows = R.invoice.items.map(it => `<tr><td>${it.label}</td><td class="num" style="color:${it.type === 'credit' ? '#059669' : '#dc2626'}">${it.type === 'credit' ? '+' : '-'}${it.amount.toLocaleString()} ${R.invoice.currency}</td></tr>`).join('');
      printDoc(R.invoice.customNumber || 'كشف حساب', `
        <div class="head">
          <div><h1>${R.company.name || 'كشف حساب'}</h1><p class="muted">${R.invoice.customNumber || ''}</p></div>
          ${R.invoice.showLogo && R.company.logo ? `<img src="${R.company.logo}" style="width:52px;height:52px;object-fit:contain"/>` : ''}
        </div>
        <p class="muted" style="margin-top:8px">العميل: <b>${sub.name}</b>${sub.iban ? ` · IBAN: <span class="num">${sub.iban}</span>` : ''} · التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        <table><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="net"><span>الصافي</span><span class="num">${net.toLocaleString()} ${R.invoice.currency}</span></div>
        ${R.invoice.stampImage ? `<img class="stamp" src="${R.invoice.stampImage}"/>` : ''}
        ${R.invoice.notes ? `<p class="notes">${R.invoice.notes}</p>` : ''}`);
    };
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: C.borders }}>
          <div><h3 className="font-bold text-sm" style={{ color: C.textMain }}>🧾 كشف الحساب</h3>{R.invoice.customNumber && <p className="text-[10px] font-mono" style={{ color: C.textSecondary }}>{R.invoice.customNumber}</p>}<p className="text-[10px]" style={{ color: C.textSecondary }}>{sub.joinDate}</p></div>
          {R.invoice.showLogo && R.company.logo && <img src={R.company.logo} className="w-10 h-10 rounded-lg object-contain" alt="logo" />}
        </div>
        {R.invoice.items.length > 0 && <div className="space-y-1 mb-3">
          {R.invoice.items.map((it, idx) => (<div key={idx} className="flex justify-between text-xs py-1"><span style={{ color: C.textMain }}>{it.label}</span><span className="font-bold" style={{ color: it.type === 'credit' ? C.success : C.danger }}>{it.type === 'credit' ? '+' : '-'}{it.amount.toLocaleString()}</span></div>))}
          <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: C.borders, color: C.textMain }}><span>الصافي</span><span>{net.toLocaleString()} {R.invoice.currency}</span></div>
        </div>}
        {R.invoice.notes && <p className="text-[10px] mt-2 pt-2 border-t" style={{ color: C.textSecondary, borderColor: C.borders }}>{R.invoice.notes}</p>}
        <div className="flex items-end justify-between mt-3">
          {R.invoice.stampImage
            ? <img src={R.invoice.stampImage} alt="ختم الشركة" className="h-20 object-contain opacity-90 -rotate-6" />
            : <span />}
          {R.invoice.showDownload && <button onClick={printInvoice} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 hover:opacity-90" style={{ backgroundColor: C.primary }}><Download size={11} /> تحميل PDF</button>}
        </div>
      </Card>
    );
  })();

  // ═══ Widgets إضافية ═══
  const qrValue = `${window.location.origin}/query/${sub.id}`;
  const downloadQR = () => {
    const canvas = qrWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = (canvas as HTMLCanvasElement).toDataURL('image/png');
    a.download = `qr-${sub.name || 'client'}.png`;
    a.click();
    toast.success('تم تحميل QR');
  };
  const shareQR = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `استعلام ${sub.name}`, url: qrValue });
      else { await navigator.clipboard.writeText(qrValue); toast.success('تم نسخ رابط الاستعلام'); }
    } catch { /* أُلغيت المشاركة */ }
  };

  const widgetsBlock = (() => {
    const anyWidget = R.widgets.liveClock || R.widgets.hijriDate || R.widgets.currencyRates || R.widgets.goldPrice || R.widgets.btcPrice || R.widgets.weather || R.widgets.profitCalculator || R.widgets.qrCode || R.widgets.newsTicker;
    if (!anyWidget) return null;
    const rateCalc = () => {
      const amt = Number(calcAmount) || 0, rate = Number(calcRate) || 0, months = Number(calcMonths) || 0;
      setCalcResult(amt * (rate / 100) * (months / 12));
    };
    return (
      <div className="space-y-4 mb-6">
        {(R.widgets.liveClock || R.widgets.hijriDate || R.widgets.currencyRates || R.widgets.goldPrice || R.widgets.btcPrice || R.widgets.weather || R.widgets.profitCalculator) && (
          <Card>
            <h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🧩 أدوات إضافية</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {R.widgets.liveClock && <LiveClockTile />}
              {R.widgets.hijriDate && <HijriDateTile />}
              {R.widgets.currencyRates && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><DollarSign size={16} className="mx-auto" style={{ color: C.success }} /><p className="text-sm font-bold" style={{ color: C.textMain }}>1 USD = 3.75 SAR</p><p className="text-[9px]" style={{ color: C.textSecondary }}>سعر الصرف · أسعار تقريبية</p></div>}
              {R.widgets.goldPrice && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><Coins size={16} className="mx-auto" style={{ color: '#d4af37' }} /><p className="text-sm font-bold" style={{ color: C.textMain }}>285 ر.س / جرام</p><p className="text-[9px]" style={{ color: C.textSecondary }}>الذهب 24 · أسعار تقريبية</p></div>}
              {R.widgets.btcPrice && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><Bitcoin size={16} className="mx-auto" style={{ color: '#f7931a' }} /><p className="text-sm font-bold" style={{ color: C.textMain }}>≈ $97,000</p><p className="text-[9px]" style={{ color: C.textSecondary }}>بيتكوين · أسعار تقريبية</p></div>}
              {R.widgets.weather && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CloudSun size={16} className="mx-auto" style={{ color: C.primary }} /><p className="text-sm font-bold" style={{ color: C.textMain }}>الرياض ☀️ 25°C</p><p className="text-[9px]" style={{ color: C.textSecondary }}>الطقس اليوم</p></div>}
            </div>
            {R.widgets.profitCalculator && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: C.bgMain }}>
                <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: C.textMain }}><Calculator size={12} style={{ color: C.primary }} /> حاسبة الأرباح التفاعلية</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} placeholder="المبلغ" className="h-8 rounded-lg px-2 text-xs border outline-none" style={{ backgroundColor: C.bgCards, borderColor: C.borders, color: C.textMain }} />
                  <input type="number" value={calcRate} onChange={e => setCalcRate(e.target.value)} placeholder="نسبة الربح %" className="h-8 rounded-lg px-2 text-xs border outline-none" style={{ backgroundColor: C.bgCards, borderColor: C.borders, color: C.textMain }} />
                  <input type="number" value={calcMonths} onChange={e => setCalcMonths(e.target.value)} placeholder="المدة بالأشهر" className="h-8 rounded-lg px-2 text-xs border outline-none" style={{ backgroundColor: C.bgCards, borderColor: C.borders, color: C.textMain }} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={rateCalc} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: C.primary }}>احسب</button>
                  {calcResult !== null && <p className="text-xs font-bold" style={{ color: C.success }}>الربح المتوقع: {calcResult.toLocaleString(undefined, { maximumFractionDigits: 2 })} {curSym(sub.profitsCurrencySymbol, sub.profitsCurrency)}</p>}
                </div>
              </div>
            )}
            {R.widgets.newsTicker && R.widgets.newsTickerText && <div className="mt-3 overflow-hidden rounded-lg py-2 px-3" style={{ backgroundColor: C.primary + '10' }}><motion.p className="text-xs font-bold whitespace-nowrap" style={{ color: C.primary }} animate={{ x: ['100%', '-100%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>📰 {R.widgets.newsTickerText}</motion.p></div>}
          </Card>
        )}
        {R.widgets.qrCode && (
          <Card>
            <div className="flex items-center gap-4 flex-wrap">
              <div ref={qrWrapRef} className="p-2 bg-white rounded-xl flex-shrink-0"><QRCodeCanvas value={qrValue} size={110} includeMargin /></div>
              <div className="flex-1 min-w-[160px]">
                <h3 className="font-bold text-sm mb-1" style={{ color: C.textMain }}>📱 QR الاستعلام</h3>
                <p className="text-[11px] mb-2 break-all" style={{ color: C.textSecondary }}>{qrValue}</p>
                <div className="flex gap-2">
                  <button onClick={downloadQR} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: C.primary }}><Download size={11} /> تحميل QR</button>
                  <button onClick={shareQR} className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1" style={{ backgroundColor: C.primary + '15', color: C.primary }}><Share2 size={11} /> مشاركة</button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  })();

  // ═══ تفاصيل الحساب (الرئيسية + حسابي) ═══
  const accountDetailsCard = (
    <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>تفاصيل الحساب</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sub.bankName && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CreditCard size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>البنك</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.bankName}{sub.bankCountry ? ` · ${sub.bankCountry}` : ''}</p></div></div>}
        {sub.iban && sub.ibanVisible && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CreditCard size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>IBAN</p><p className="text-xs font-bold font-mono" style={{ color: C.textMain }}>{sub.iban}</p></div></div>}
        {sub.accountNumber && sub.accountNumberVisible && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CreditCard size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>رقم الحساب</p><p className="text-xs font-bold font-mono" style={{ color: C.textMain }}>{sub.accountNumber}</p></div></div>}
        {sub.systemAccount && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><Shield size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>حساب النظام</p><p className="text-xs font-bold font-mono" style={{ color: C.textMain }}>{sub.systemAccount}</p></div></div>}
        {sub.platform && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><TrendingUp size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>المنصة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.platform}</p></div></div>}
        {sub.currency && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><Wallet size={14} style={{ color: C.textSecondary }} /><div><p className="text-[10px]" style={{ color: C.textSecondary }}>العملة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.currency}</p></div></div>}
      </div>
    </Card>
  );

  // بطاقة الملف الشخصي (الرئيسية + حسابي)
  const profileCard = R.clientProfile.avatarType !== 'hidden' && R.clientProfile.displayMode !== 'hidden' && (
    <motion.div {...anim} className={`${rd} p-5 mb-6 overflow-hidden relative ${cShadow}`} style={{ background: R.clientProfile.cardBackground || C.bgCards, ...cBorder }}>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`${avShape} w-16 h-16 overflow-hidden flex items-center justify-center bg-white/20 backdrop-blur-sm ring-2 ring-white/30 flex-shrink-0`}>
          {R.clientProfile.avatarType === 'upload' && R.clientProfile.avatarImage ? <img src={R.clientProfile.avatarImage} className="w-full h-full object-cover" alt="avatar" /> : <span className="text-2xl font-bold text-white">{sub.name.charAt(0)}</span>}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{ color: R.clientProfile.nameColor || '#ffffff' }}>{dispName}</h2>
          {R.clientProfile.title && <p className="text-xs text-white/80">{R.clientProfile.title}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white"><span className={`w-1.5 h-1.5 rounded-full ${statusInfo().c}`} />{statusInfo().l}</div>
            {badgeInfo() && <span className="text-[10px] text-white/90">{badgeInfo()?.l}</span>}
            {R.clientProfile.memberLevel !== 'none' && <span className="text-[10px] text-white/90 px-1.5 py-0.5 rounded bg-white/10 capitalize">{R.clientProfile.memberLevel}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 relative z-10 flex-wrap">
        {dispPhone && <span className="text-xs text-white/70 flex items-center gap-1"><Phone size={10} />{dispPhone}</span>}
        {R.clientProfile.showJoinDate && <span className="text-xs text-white/70">عضو منذ {sub.joinDate}</span>}
        {R.clientProfile.showCountry && <span className="text-xs text-white/70">🌍 {sub.bankCountry || 'السعودية'}</span>}
      </div>
      {R.clientProfile.personalBio && <p className="text-xs text-white/80 mt-2">{R.clientProfile.personalBio}</p>}
    </motion.div>
  );

  // بطاقة السحب
  const withdrawCard = (
    <Card className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.success + '15' }}><ArrowLeftRight size={18} style={{ color: C.success }} /></div>
        <div><h3 className="font-bold text-sm" style={{ color: C.textMain }}>طلب سحب الأرباح</h3><p className="text-[11px]" style={{ color: C.textSecondary }}>الصافي المتاح للسحب: {netBalance.toLocaleString()} {curSym(sub.profitsCurrencySymbol, sub.profitsCurrency)}</p></div>
      </div>
      <p className="text-xs mb-3" style={{ color: C.textSecondary }}>اضغط الزر لتأكيد طلب السحب — سيتم التحويل إلى محفظتك المسجلة{sub.walletPlatform ? ` (${sub.walletPlatform} · ${sub.walletNetwork})` : ''}.</p>
      {!showWithdrawText ? (
        <button onClick={() => setShowWithdrawText(true)} className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: C.success }}>
          <ArrowLeftRight size={14} /> تأكيد طلب السحب
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-center" style={{ backgroundColor: C.success + '12', border: `1px solid ${C.success}40` }}>
          <p className="text-sm font-bold" style={{ color: C.success }}>{rv(sub.withdrawalText || 'تم استلام طلب السحب بنجاح.', sub, sOps)}</p>
        </motion.div>
      )}
    </Card>
  );

  // ═══ التمرير بالسحب (Swipe Navigation) ═══
  const swipeOn = R.design.query.swipeNav === true;
  const onTouchStart = (e: React.TouchEvent) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!swipeOn || !touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const cur = NAV_VIEWS.indexOf(view);
      if (dx < 0) setView(NAV_VIEWS[(cur + 1) % NAV_VIEWS.length]);          // يسار = التالي
      else setView(NAV_VIEWS[(cur - 1 + NAV_VIEWS.length) % NAV_VIEWS.length]); // يمين = السابق
      return;
    }
    if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.4) {
      window.scrollBy({ top: dy < 0 ? window.innerHeight : -window.innerHeight, behavior: 'smooth' });
    }
  };

  // مؤشرات التنقل
  const showIndicators = swipeOn && R.design.navIndicators !== 'none' && !lightbox;
  const bbVisibleCount = R.bottomBar.buttons.filter(b => b.visible).length;

  return (
    <SkinCtx.Provider value={skin}>
    <div
      className="min-h-screen relative"
      style={{ ...bgStyle(), color: C.textMain, fontFamily: `'${R.design.fonts.body}', sans-serif`, fontSize: fSize, fontWeight: fWeight, lineHeight: fLine, direction: R.design.fonts.direction }}
      dir={R.design.fonts.direction}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {R.design.background.opacity < 100 && <div className="fixed inset-0 pointer-events-none" style={{ ...bgStyle(), opacity: 1 - R.design.background.opacity / 100 }} />}
      {R.design.background.blur > 0 && <div className="fixed inset-0 pointer-events-none" style={{ backdropFilter: `blur(${R.design.background.blur}px)` }} />}

      {/* ═══ 3. Top Bar ═══ */}
      {R.topBar.enabled && (
        <header className={`${R.topBar.sticky ? 'fixed top-0 left-0 right-0' : 'relative'} z-50 flex items-center px-4 ${R.topBar.shadow === 'strong' ? 'shadow-lg' : R.topBar.shadow === 'light' ? 'shadow-sm' : ''} ${R.topBar.transparency === 'blur' ? 'backdrop-blur-md' : ''}`}
          style={{ height: tbH, backgroundColor: R.topBar.transparency === 'transparent' ? 'transparent' : R.topBar.bgColor || C.bgCards, color: R.topBar.textColor || C.textMain }}>
          <div className={`flex items-center justify-between w-full max-w-7xl mx-auto ${R.topBar.logoPosition === 'left' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${R.topBar.logoPosition === 'center' ? 'mx-auto' : ''}`}>
              {R.topBar.showLogo && R.topBar.logoType !== 'hidden' && (R.topBar.logoType === 'company' && R.company.logo ? <img src={R.company.logo} className="w-8 h-8 rounded-lg object-contain" alt="logo" /> : R.topBar.logoType === 'text' ? <span className="text-sm font-bold" style={{ color: R.topBar.textColor || C.primary }}>{R.company.shortName || R.company.name}</span> : <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primary + '20' }}><Building2 size={16} style={{ color: C.primary }} /></div>)}
              <div><h1 className="text-sm font-bold" style={{ color: R.topBar.textColor || C.textMain }}>{R.topBar.title}</h1>{R.topBar.subtitle && <p className="text-[10px]" style={{ color: R.topBar.textColor ? R.topBar.textColor + 'aa' : C.textSecondary }}>{R.topBar.subtitle}</p>}</div>
            </div>
            <div className={`flex items-center gap-1 ${R.topBar.logoPosition === 'center' ? 'absolute left-4' : ''}`}>
              {R.topBar.showClientName && <span className="text-xs hidden sm:block" style={{ color: R.topBar.textColor || C.textSecondary }}>{sub.name}</span>}
              {R.topBar.customButtons.filter(b => b.label).map(b => <a key={b.id} href={b.url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/10" title={b.label} style={{ color: b.color || R.topBar.textColor }}><Ic n={b.icon} s={15} /></a>)}
              {R.topBar.showSearch && <button className="p-2 rounded-lg hover:bg-black/5"><Search size={16} style={{ color: R.topBar.textColor || C.textSecondary }} /></button>}
              {R.topBar.showDarkMode && <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-black/5"><Moon size={16} style={{ color: R.topBar.textColor || C.textSecondary }} /></button>}
              {R.topBar.showNotifications && <button className="p-2 rounded-lg hover:bg-black/5"><Bell size={16} style={{ color: R.topBar.textColor || C.textSecondary }} /></button>}
              {R.topBar.showLanguage && <button className="p-2 rounded-lg hover:bg-black/5"><Globe size={16} style={{ color: R.topBar.textColor || C.textSecondary }} /></button>}
              {R.topBar.showMenu && <button onClick={() => setSbOpen(!sbOpen)} className="p-2 rounded-lg hover:bg-black/5"><Menu size={16} style={{ color: R.topBar.textColor || C.textSecondary }} /></button>}
            </div>
          </div>
          {R.topBar.showProgress && <div className="absolute bottom-0 left-0 right-0 h-0.5"><div className="h-full w-1/3" style={{ backgroundColor: C.primary }} /></div>}
        </header>
      )}

      {/* ═══ 5. Side Bar ═══ */}
      <AnimatePresence>
        {sbOpen && R.sideBar.enabled && (
          <>
            <motion.div key="sb-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setSbOpen(false)} />
            <motion.aside key="sb-panel" initial={{ x: R.sideBar.position === 'right' ? 320 : -320 }} animate={{ x: 0 }} exit={{ x: R.sideBar.position === 'right' ? 320 : -320 }} transition={{ type: 'spring', damping: 25 }}
              className={`fixed top-0 ${R.sideBar.position === 'right' ? 'right-0' : 'left-0'} h-full z-[70] overflow-y-auto flex flex-col ${R.sideBar.shadow === 'strong' ? 'shadow-2xl' : R.sideBar.shadow === 'light' ? 'shadow-lg' : ''}`}
              style={{ width: R.sideBar.width === 'narrow' ? 72 : R.sideBar.width === 'wide' ? 300 : 260, backgroundColor: R.sideBar.bgColor || C.bgCards }}>
              <div className="p-4 border-b" style={{ borderColor: C.borders }}>
                <div className="flex items-center justify-between mb-2">
                  {R.sideBar.header.showAvatar && <div className={`w-10 h-10 ${avShape} overflow-hidden flex items-center justify-center`} style={{ backgroundColor: C.primary + '20' }}>{R.clientProfile.avatarType === 'upload' && R.clientProfile.avatarImage ? <img src={R.clientProfile.avatarImage} className="w-full h-full object-cover" alt="avatar" /> : <span className="font-bold" style={{ color: C.primary }}>{sub.name.charAt(0)}</span>}</div>}
                  <button onClick={() => setSbOpen(false)} className="p-1 rounded hover:bg-black/5"><X size={16} /></button>
                </div>
                {R.sideBar.header.showName && <p className="font-bold text-sm" style={{ color: C.textMain }}>{sub.name}</p>}
                {R.sideBar.header.showStatus && <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] ${statusInfo().bg}`}><span className={`w-1.5 h-1.5 rounded-full ${statusInfo().c}`} /><span className={statusInfo().t}>{statusInfo().l}</span></div>}
                {R.sideBar.header.showMemberNumber && <p className="text-[10px] mt-1" style={{ color: C.textSecondary }}>#{R.clientProfile.memberNumber || sub.id.slice(0, 8)}</p>}
              </div>
              <nav className="p-2 space-y-0.5 flex-1">
                {R.sideBar.items.filter(i => i.visible).sort((a, b) => a.order - b.order).map(item => (
                  <div key={item.id}>
                    <button onClick={() => { go(item.action); setSbOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/5 transition-colors" style={{ color: item.color || C.textMain }}>
                      <Ic n={item.icon} s={16} c={item.color || undefined} />
                      {R.sideBar.width !== 'narrow' && <>
                        <span className="flex-1 text-right">
                          {item.label}
                          {item.description && <span className="block text-[9px] font-normal" style={{ color: C.textSecondary }}>{item.description}</span>}
                        </span>
                        {item.badge > 0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: item.color || C.primary }}>{item.badge}</span>}
                      </>}
                    </button>
                    {item.separator && <div className="my-1 h-px mx-3" style={{ backgroundColor: C.borders }} />}
                  </div>
                ))}
              </nav>
              <div className="p-4 border-t mt-auto" style={{ borderColor: C.borders }}>
                {R.sideBar.footer.showSupport && <a href={R.sideBar.footer.supportLink || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-black/5" style={{ color: C.primary }}><HelpCircle size={14} />{R.sideBar.width !== 'narrow' && 'الدعم الفني'}</a>}
                {R.sideBar.footer.showLogout && <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-black/5" style={{ color: C.danger }}><LogOut size={14} />{R.sideBar.width !== 'narrow' && 'خروج'}</button>}
                {R.sideBar.footer.version && <p className="text-[10px] text-center mt-2" style={{ color: C.textSecondary }}>{R.sideBar.footer.version}</p>}
                {R.sideBar.footer.copyright && <p className="text-[9px] text-center" style={{ color: C.textSecondary }}>{R.sideBar.footer.copyright}</p>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main ref={mainRef} className="pb-28 px-4 max-w-7xl mx-auto" style={{ paddingTop: R.topBar.enabled && R.topBar.sticky ? tbH + 16 : 16, fontFamily: `'${R.design.fonts.heading}', sans-serif` }}>

        {/* ─── عرض: الرئيسية ─── */}
        {view === 'home' && <>
          {R.company.coverImage && <motion.div {...anim} className={`${rd} overflow-hidden mb-6`}><img src={R.company.coverImage} className="w-full h-32 sm:h-48 object-cover" alt="cover" /></motion.div>}

          {/* الملف الشخصي */}
          {profileCard}

          {/* اسم الشركة */}
          {R.company.name && <Card className="mb-6"><div className="flex items-center gap-3">{R.company.logo && <img src={R.company.logo} className="w-10 h-10 rounded-lg object-contain" alt="logo" />}<div><p className="font-bold text-sm" style={{ color: C.textMain }}>{R.company.name}</p>{R.company.description && <p className="text-xs" style={{ color: C.textSecondary }}>{R.company.description}</p>}</div></div></Card>}

          {/* نصوص شاشة الاستعلام/بعد الاستعلام (تظهر كشريط ترحيبي في الأعلى) */}
          {activeTexts.filter(t => t.location === 'query' || t.location === 'afterQuery').map(t => <CustomTextCard key={t.id} t={t} />)}

          {/* التنبيهات (أعلى) */}
          {activeAlerts.filter(a => a.location === 'top').map(a => <AlertCard key={a.id} a={a} />)}

          {/* البانرات */}
          {activeBanners.sort((a, b) => a.order - b.order).map(b => (
            <motion.div key={b.id} {...anim} className={`${rd} p-4 mb-4 relative`} style={{ backgroundColor: b.color + '15', border: `1px solid ${b.color}30` }}>
              {b.image && <img src={b.image} className={`w-full h-32 object-cover ${rd} mb-2`} alt="banner" />}
              <p className="text-sm font-bold" style={{ color: b.color }}>{b.text}</p>
              {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 inline-block" style={{ color: C.primary }}>المزيد ←</a>}
              {b.closable && <button onClick={() => setClosedBanners(prev => new Set(prev).add(b.id))} className="absolute top-2 left-2 p-1 rounded-full hover:bg-black/10"><X size={12} /></button>}
            </motion.div>
          ))}

          {/* نصوص (أعلى) */}
          {activeTexts.filter(t => t.location === 'top').map(t => <CustomTextCard key={t.id} t={t} />)}

          {/* البطاقات المالية */}
          {financialCards}

          {/* بطاقات المعلومات */}
          {infoCardsBlock}

          {/* الرسوم البيانية */}
          {R.charts.filter(ch => ch.visible).length > 0 && <div className={`${gap} mb-6 space-y-6`}>
            {R.charts.filter(ch => ch.visible).sort((a, b) => a.order - b.order).map((ch, i) => {
              const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
              const genData = () => {
                if (ch.dataType === 'profits') return months.slice(0, 12).map((m, idx) => ({ name: m.slice(0, 3), value: Math.max(0, sub.profits * (0.5 + 0.4 * Math.sin(idx)) / 6 * (idx + 1)) }));
                if (ch.dataType === 'balance') return months.slice(0, 12).map((m, idx) => ({ name: m.slice(0, 3), value: Math.round(sub.subscriptionAmount * (0.3 + idx * 0.06)) }));
                if (ch.dataType === 'operations') return months.slice(0, 12).map((m, idx) => ({ name: m.slice(0, 3), value: Math.floor(sOps.length / 12 * (idx + 1)) }));
                if (ch.dataType === 'custom') return [{ name: 'أسهم', value: 45 }, { name: 'رقمية', value: 30 }, { name: 'ذهب', value: 15 }, { name: 'سيولة', value: 10 }];
                return months.slice(0, 6).map((m, idx) => ({ name: m.slice(0, 3), value: Math.floor(Math.random() * 100) }));
              };
              const data = genData();
              const chartColors = ch.colors.length > 0 ? ch.colors : [C.primary, C.secondary, C.success, C.warning];
              const chartTitle = ch.title || (ch.dataType === 'profits' ? 'الأرباح' : ch.dataType === 'balance' ? 'تطور الرصيد' : ch.dataType === 'operations' ? 'العمليات' : 'البيانات');
              return (
                <Card key={ch.id} delay={i * 0.1}>
                  <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-sm" style={{ color: C.textMain }}>{chartTitle}</h3><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary + '15', color: C.primary }}>{ch.period === '7d' ? '7 أيام' : ch.period === '30d' ? '30 يوم' : ch.period === '3m' ? '3 أشهر' : ch.period === '1y' ? 'سنة' : 'الكل'}</span></div>
                  <div style={{ height: ch.size === 'small' ? 150 : ch.size === 'large' ? 300 : 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {ch.type === 'line' ? <LineChart data={data}><XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /><Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2} dot={ch.showNumbers ? { r: 3, fill: chartColors[0] } : false} /></LineChart>
                        : ch.type === 'bar' || ch.type === 'horizontal-bar' ? <BarChart data={data} layout={ch.type === 'horizontal-bar' ? 'vertical' : 'horizontal'}><XAxis dataKey={ch.type === 'horizontal-bar' ? 'value' : 'name'} type={ch.type === 'horizontal-bar' ? 'number' : 'category'} tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><YAxis dataKey={ch.type === 'horizontal-bar' ? 'name' : 'value'} type={ch.type === 'horizontal-bar' ? 'category' : 'number'} tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} width={ch.type === 'horizontal-bar' ? 60 : undefined} /><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /><Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} /></BarChart>
                          : ch.type === 'area' ? <AreaChart data={data}><XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /><Area type="monotone" dataKey="value" stroke={chartColors[0]} fill={chartColors[0] + '30'} strokeWidth={2} /></AreaChart>
                            : ch.type === 'pie' ? <PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={ch.size === 'small' ? 50 : 80} label={ch.showNumbers}>{data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /></PieChart>
                              : <BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /><Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} /></BarChart>}
                    </ResponsiveContainer>
                  </div>
                </Card>
              );
            })}
          </div>}

          {/* العدادات */}
          {R.counters.filter(c => c.visible).length > 0 && <div className={`grid grid-cols-2 sm:grid-cols-3 ${gap} mb-6`}>
            {R.counters.filter(c => c.visible).sort((a, b) => a.order - b.order).map((c, i) => (
              <Card key={c.id} className="text-center" delay={i * 0.1}><Ic n={c.icon} s={20} c={c.color} /><p className="text-2xl font-black mt-1" style={{ color: c.color }}>{c.prefix}{c.value.toLocaleString()}{c.suffix && <span className="text-xs mr-1">{c.suffix}</span>}</p>{c.title && <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{c.title}</p>}</Card>
            ))}
          </div>}

          {/* أشرطة التقدم */}
          {R.progressBars.filter(p => p.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🎯 الأهداف</h3>
            {R.progressBars.filter(p => p.visible).sort((a, b) => a.order - b.order).map(p => { const pct = p.target > 0 ? Math.min(100, Math.round(p.current / p.target * 100)) : 0; return (
              <div key={p.id} className="mb-3"><div className="flex justify-between mb-1"><span className="text-xs font-bold" style={{ color: C.textMain }}>{p.title}</span><span className="text-xs" style={{ color: C.textSecondary }}>{pct}%</span></div><div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.borders }}><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} style={{ backgroundColor: p.color }} /></div><p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{p.current.toLocaleString()} / {p.target.toLocaleString()}</p></div>
            ); })}
          </Card>}

          {/* العد التنازلي */}
          <CountdownCards items={R.countdowns} />

          {/* الأوسمة */}
          {R.achievements.filter(a => a.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🏆 الأوسمة</h3>
            <div className="flex flex-wrap gap-3">{R.achievements.filter(a => a.visible).sort((a, b) => a.order - b.order).map(a => (
              <div key={a.id} className={`flex items-center gap-2 px-3 py-2 ${rd}`} style={{ backgroundColor: a.color === 'gold' ? '#fef3c7' : a.color === 'silver' ? '#f1f5f9' : a.color === 'bronze' ? '#fed7aa' : (a.customColor || C.primary) + '15' }}>
                <span className="text-lg">{a.icon}</span><div><p className="text-xs font-bold" style={{ color: C.textMain }}>{a.name}</p>{a.description && <p className="text-[10px]" style={{ color: C.textSecondary }}>{a.description}</p>}</div>
              </div>))}
            </div>
          </Card>}

          {/* الأقسام المخصصة (الرئيسية) */}
          {homeSections.map(sec => <SectionCard key={sec.id} sec={sec} />)}

          {/* روابط الصفحات المستقلة */}
          {separateSections.length > 0 && (
            <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📂 صفحات مستقلة</h3>
              <div className="flex flex-wrap gap-2">{separateSections.map(s => (
                <button key={s.id} onClick={() => setView(`sec:${s.id}`)} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-80" style={{ backgroundColor: C.primary + '12', color: C.primary }}><Ic n={s.icon} s={13} /> {s.title}</button>
              ))}</div>
            </Card>
          )}

          {/* جدول البيانات */}
          {tableBlock}

          {/* الرسائل (مع حالة القراءة) */}
          {R.messages.enabled && R.messages.messages.filter(m => m.visible !== false).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>💬 الرسائل <span className="text-[10px] font-normal" style={{ color: C.textSecondary }}>({R.messages.messages.filter(m => m.visible !== false && !msgRead.has(m.id)).length} غير مقروءة)</span></h3>
            {R.messages.messages.filter(m => m.visible !== false).map(msg => {
              const unread = !msgRead.has(msg.id);
              return (
                <button key={msg.id} onClick={() => setMsgRead(prev => new Set(prev).add(msg.id))} className="w-full text-right p-2.5 rounded-lg mb-2 relative transition-all hover:opacity-90"
                  style={{ backgroundColor: unread ? C.primary + '0d' : C.bgMain, border: msg.priority === 'urgent' ? `2px solid ${C.danger}` : msg.priority === 'important' ? `1px solid ${C.warning}` : `1px solid ${C.borders}` }}>
                  {unread && <span className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />}
                  <div className="flex justify-between mb-1 pl-4"><span className="text-[10px] font-bold" style={{ color: C.textSecondary }}>{msg.sender}</span><span className="text-[10px]" style={{ color: C.textSecondary }}>{msg.date}</span></div>
                  <p className="text-xs pl-4" style={{ color: C.textMain, fontWeight: unread ? 700 : 400 }}>{rv(msg.text, sub, sOps)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {msg.priority === 'urgent' && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: C.danger + '15', color: C.danger }}>عاجل</span>}
                    {msg.priority === 'important' && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: C.warning + '15', color: C.warning }}>مهم</span>}
                    {!unread && <span className="text-[9px]" style={{ color: C.textSecondary }}>✓ مقروءة</span>}
                  </div>
                </button>
              );
            })}
          </Card>}

          {/* التقويم (مع توليد المواعيد المتكررة) */}
          {R.calendar.enabled && expandedCalEvents.length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📅 المواعيد</h3>
            {expandedCalEvents.slice(0, 14).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ev.color + '20' }}><span className="text-xs font-bold" style={{ color: ev.color }}>{ev.date ? new Date(ev.date).getDate() : ''}</span></div>
                <div className="flex-1"><p className="text-xs font-bold" style={{ color: C.textMain }}>{ev.title} {ev.repeat === 'weekly' && <span className="text-[9px] font-normal" style={{ color: C.textSecondary }}>· أسبوعي</span>}{ev.repeat === 'monthly' && <span className="text-[9px] font-normal" style={{ color: C.textSecondary }}>· شهري</span>}</p><p className="text-[10px]" style={{ color: C.textSecondary }}>{ev.date} {ev.time} · {ev.status === 'upcoming' ? 'قادم' : ev.status === 'completed' ? 'مكتمل' : 'ملغي'}</p></div>
              </div>))}
          </Card>}

          {/* معرض الصور */}
          {R.gallery.enabled && R.gallery.images.length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📸 معرض الصور</h3>
            <div className={`${R.gallery.display === 'grid' ? 'grid grid-cols-3 gap-2' : R.gallery.display === 'masonry' ? 'columns-2 gap-2' : 'flex gap-2 overflow-x-auto pb-2'}`}>
              {R.gallery.images.map(img => (
                <div key={img.id} className={R.gallery.display === 'masonry' ? 'mb-2 break-inside-avoid' : ''}>
                  <img src={img.src} alt={img.description} onClick={() => R.gallery.zoomOnClick && setLightbox(img.src)} className={`${R.gallery.size === 'small' ? 'w-20 h-20' : R.gallery.size === 'medium' ? 'w-32 h-32' : 'w-48 h-48'} ${rd} object-cover ${R.gallery.zoomOnClick ? 'cursor-pointer hover:opacity-90' : ''} transition-opacity`} />
                  {img.description && <p className="text-[9px] mt-1 text-center" style={{ color: C.textSecondary }}>{img.description}</p>}
                </div>))}
            </div>
          </Card>}

          {/* التنبيهات (وسط/أسفل) */}
          {activeAlerts.filter(a => a.location !== 'top').map(a => <AlertCard key={a.id} a={a} />)}

          {/* نصوص (ملخص) */}
          {activeTexts.filter(t => t.location === 'summary').map(t => <CustomTextCard key={t.id} t={t} />)}

          {/* المستندات */}
          {R.documents.filter(d => d.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📄 المستندات</h3>
            {R.documents.filter(d => d.visible).sort((a, b) => a.order - b.order).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain }}>
                <div className="flex items-center gap-2"><FileText size={16} style={{ color: C.primary }} /><div><p className="text-xs font-bold" style={{ color: C.textMain }}>{doc.name}</p>{doc.size && <p className="text-[10px]" style={{ color: C.textSecondary }}>{doc.size}</p>}</div></div>
                {doc.showDownload && doc.fileData && <a href={doc.fileData} download={doc.name} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: C.primary }}><Download size={10} /> تحميل</a>}
              </div>))}
          </Card>}

          {/* الفاتورة */}
          {invoiceBlock}

          {/* الخريطة */}
          {R.map.enabled && R.map.visible && R.map.lat && R.map.lng && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🗺️ {R.map.title || 'موقعنا'}</h3>
            <div className={`${rd} overflow-hidden`} style={{ height: R.map.height === 'small' ? 200 : R.map.height === 'large' ? 400 : 300 }}>
              <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(R.map.lng) - 0.01},${Number(R.map.lat) - 0.01},${Number(R.map.lng) + 0.01},${Number(R.map.lat) + 0.01}&layer=${R.map.mapType === 'satellite' ? 'satellite' : 'mapnik'}`} className="w-full h-full border-0" title="map" />
            </div>
          </Card>}

          {/* Widgets */}
          {widgetsBlock}

          {/* تفاصيل الحساب */}
          {accountDetailsCard}

          {/* نصوص (أسفل) */}
          {activeTexts.filter(t => t.location === 'bottom').map(t => <CustomTextCard key={t.id} t={t} />)}

          {/* فوتر الشركة */}
          {(R.company.phone || R.company.email || R.company.address) && <Card className="mt-6">
            <div className="flex flex-wrap gap-4">{R.company.phone && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><Phone size={11} />{R.company.phone}</span>}{R.company.email && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><Mail size={11} />{R.company.email}</span>}{R.company.address && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><MapPin size={11} />{R.company.address}</span>}</div>
            <div className="flex gap-3 mt-3">{R.company.social.instagram && <a href={R.company.social.instagram} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>Instagram</a>}{R.company.social.twitter && <a href={R.company.social.twitter} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>X/Twitter</a>}{R.company.social.telegram && <a href={R.company.social.telegram} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>Telegram</a>}</div>
          </Card>}
        </>}

        {/* ─── عرض: محفظة المستثمر ─── */}
        {view === 'wallet' && (
          <SubView title={`💼 ${WALLET_SECTION_TITLE}`}>
            {financialCards}
            {walletCard}
            {R.company.name && <Card className="mb-6"><div className="flex items-center gap-3">{R.company.logo && <img src={R.company.logo} className="w-10 h-10 rounded-lg object-contain" alt="logo" />}<div><p className="font-bold text-sm" style={{ color: C.textMain }}>{R.company.name}</p>{R.company.description && <p className="text-xs" style={{ color: C.textSecondary }}>{R.company.description}</p>}</div></div></Card>}
            {activeTexts.filter(t => t.location === 'summary').map(t => <CustomTextCard key={t.id} t={t} />)}
          </SubView>
        )}

        {/* ─── عرض: أرباحي ─── */}
        {view === 'profits' && (
          <SubView title="📈 أرباحي">
            <div className={`grid ${gridCls} ${gap} mb-6`}>
              <Card delay={0}><p className="text-xs" style={{ color: C.textSecondary }}>إجمالي الأرباح</p><p className="text-2xl font-black" style={{ color: C.success }}>{sub.profits.toLocaleString()} <span className="text-xs">{curSym(sub.profitsCurrencySymbol, sub.profitsCurrency)}</span></p>{sub.subscriptionAmount > 0 && <p className="text-[10px] mt-1" style={{ color: C.success }}>نسبة الربح {((sub.profits / sub.subscriptionAmount) * 100).toFixed(1)}%</p>}</Card>
              <Card delay={0.08}><p className="text-xs" style={{ color: C.textSecondary }}>الاشتراك</p><p className="text-2xl font-black" style={{ color: C.primary }}>{sub.subscriptionAmount.toLocaleString()}</p></Card>
              <Card delay={0.16}><p className="text-xs" style={{ color: C.textSecondary }}>عدد العمليات</p><p className="text-2xl font-black" style={{ color: C.textMain }}>{sOps.length}</p></Card>
            </div>
            {R.charts.filter(ch => ch.visible).length > 0 && <div className="space-y-4 mb-6">
              {R.charts.filter(ch => ch.visible).sort((a, b) => a.order - b.order).map(ch => (
                <Card key={ch.id}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>{ch.title || 'الرسم البياني'}</h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {ch.type === 'pie' ? <PieChart><Pie data={sOps.map((o, i) => ({ name: `عملية ${i + 1}`, value: Number(o.amount.replace(/[^\d.]/g, '')) || 1 }))} dataKey="value" nameKey="name" outerRadius={75} label={ch.showNumbers}>{sOps.map((_, i) => <Cell key={i} fill={[C.primary, C.success, C.warning, C.secondary][i % 4]} />)}</Pie><Tooltip /></PieChart>
                        : <BarChart data={sOps.map(o => ({ name: o.date.slice(5), value: Number(o.amount.replace(/[^\d.]/g, '')) || 0 }))}><XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: C.textSecondary }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" fill={C.primary} radius={[4, 4, 0, 0]} /></BarChart>}
                    </ResponsiveContainer>
                  </div>
                </Card>
              ))}
            </div>}
            {R.counters.filter(c => c.visible).length > 0 && <div className={`grid grid-cols-2 sm:grid-cols-4 ${gap} mb-6`}>
              {R.counters.filter(c => c.visible).sort((a, b) => a.order - b.order).map(c => <Card key={c.id} className="text-center"><p className="text-xl font-black" style={{ color: c.color }}>{c.prefix}{c.value.toLocaleString()}{c.suffix}</p><p className="text-[10px]" style={{ color: C.textSecondary }}>{c.title}</p></Card>)}
            </div>}
            {R.progressBars.filter(p => p.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🎯 الأهداف</h3>
              {R.progressBars.filter(p => p.visible).sort((a, b) => a.order - b.order).map(p => { const pct = p.target > 0 ? Math.min(100, Math.round(p.current / p.target * 100)) : 0; return (
                <div key={p.id} className="mb-3"><div className="flex justify-between mb-1"><span className="text-xs font-bold" style={{ color: C.textMain }}>{p.title}</span><span className="text-xs" style={{ color: C.textSecondary }}>{pct}%</span></div><div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.borders }}><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }} style={{ backgroundColor: p.color }} /></div></div>
              ); })}
            </Card>}
            <CountdownCards items={R.countdowns} variant="compact" />
          </SubView>
        )}

        {/* ─── عرض: العمليات ─── */}
        {view === 'operations' && (
          <SubView title="📋 سجل العمليات">
            <div className={`grid grid-cols-2 sm:grid-cols-4 ${gap} mb-6`}>
              <Card delay={0}><p className="text-xs" style={{ color: C.textSecondary }}>كل العمليات</p><p className="text-xl font-black" style={{ color: C.textMain }}>{sOps.length}</p></Card>
              <Card delay={0.08}><p className="text-xs" style={{ color: C.textSecondary }}>مكتملة</p><p className="text-xl font-black" style={{ color: C.success }}>{sOps.filter(o => o.status === 'مكتمل').length}</p></Card>
              <Card delay={0.16}><p className="text-xs" style={{ color: C.textSecondary }}>قيد المعالجة</p><p className="text-xl font-black" style={{ color: C.warning }}>{sOps.filter(o => o.status === 'قيد المعالجة').length}</p></Card>
              <Card delay={0.24}><p className="text-xs" style={{ color: C.textSecondary }}>إجمالي المبالغ</p><p className="text-xl font-black" style={{ color: C.primary }}>{sOps.reduce((s, o) => s + (Number(String(o.amount).replace(/[^\d.]/g, '')) || 0), 0).toLocaleString()}</p></Card>
            </div>
            {tableBlock}
          </SubView>
        )}

        {/* ─── عرض: السحب ─── */}
        {view === 'withdraw' && (
          <SubView title="💸 السحب">
            {withdrawCard}
            {financialCards}
          </SubView>
        )}

        {/* ─── عرض: حسابي ─── */}
        {view === 'account' && (
          <SubView title="👤 حسابي">
            {profileCard}
            {accountDetailsCard}
            {walletCard}
          </SubView>
        )}

        {/* ─── عرض: الإعدادات ─── */}
        {view === 'settings' && (
          <SubView title="⚙️ الإعدادات">
            <Card className="mb-4">
              <h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>إعدادات العرض</h3>
              {R.design.darkMode.enabled && (
                <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: C.borders }}>
                  <span className="text-xs flex items-center gap-2" style={{ color: C.textMain }}><Moon size={14} /> الوضع الداكن</span>
                  <button onClick={() => setDark(!dark)} className="w-10 h-5.5 h-6 rounded-full relative transition-colors" style={{ backgroundColor: dark ? C.primary : C.borders }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ [dark ? 'right' : 'left']: '2px' } as React.CSSProperties} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: C.borders }}>
                <span className="text-xs flex items-center gap-2" style={{ color: C.textMain }}><Bell size={14} /> الإشعارات</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.success + '15', color: C.success }}>مفعّلة</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: C.borders }}>
                <span className="text-xs flex items-center gap-2" style={{ color: C.textMain }}><Globe size={14} /> اللغة</span>
                <span className="text-xs font-bold" style={{ color: C.primary }}>العربية</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs flex items-center gap-2" style={{ color: C.textMain }}><Star size={14} /> القالب</span>
                <span className="text-xs" style={{ color: C.textSecondary }}>{R.templateId || 'افتراضي'}</span>
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-sm mb-2" style={{ color: C.textMain }}>حول التطبيق</h3>
              <p className="text-xs" style={{ color: C.textSecondary }}>{R.company.name || 'تطبيق العميل'} {R.sideBar.footer.version ? `· ${R.sideBar.footer.version}` : ''}</p>
              {R.sideBar.footer.copyright && <p className="text-[10px] mt-1" style={{ color: C.textSecondary }}>{R.sideBar.footer.copyright}</p>}
            </Card>
          </SubView>
        )}

        {/* ─── عرض: المستندات ─── */}
        {view === 'docs' && (
          <SubView title="📄 المستندات">
            {R.documents.filter(d => d.visible).length > 0 ? <Card>
              {R.documents.filter(d => d.visible).sort((a, b) => a.order - b.order).map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain }}>
                  <div className="flex items-center gap-2"><FileText size={16} style={{ color: C.primary }} /><div><p className="text-xs font-bold" style={{ color: C.textMain }}>{doc.name}</p>{doc.size && <p className="text-[10px]" style={{ color: C.textSecondary }}>{doc.size} {doc.date && `· ${doc.date}`}</p>}</div></div>
                  {doc.showDownload && doc.fileData && <a href={doc.fileData} download={doc.name} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: C.primary }}><Download size={10} /> تحميل</a>}
                </div>))}
            </Card> : <Card><p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>لا توجد مستندات متاحة</p></Card>}
          </SubView>
        )}

        {/* ─── عرض: العروض / الإضافات ─── */}
        {view === 'extras' && (
          <SubView title="🎁 العروض الجديدة">
            {activeBanners.length > 0 ? activeBanners.sort((a, b) => a.order - b.order).map(b => (
              <motion.div key={b.id} {...anim} className={`${rd} p-4 mb-4 relative`} style={{ backgroundColor: b.color + '15', border: `1px solid ${b.color}30` }}>
                {b.image && <img src={b.image} className={`w-full h-32 object-cover ${rd} mb-2`} alt="banner" />}
                <p className="text-sm font-bold" style={{ color: b.color }}>{b.text}</p>
                {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 inline-block" style={{ color: C.primary }}>المزيد ←</a>}
                {b.closable && <button onClick={() => setClosedBanners(prev => new Set(prev).add(b.id))} className="absolute top-2 left-2 p-1 rounded-full hover:bg-black/10"><X size={12} /></button>}
              </motion.div>
            )) : <Card><p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>لا توجد عروض حالياً</p></Card>}
            {separateSections.length > 0 && <div className="space-y-4">{separateSections.map(sec => <SectionCard key={sec.id} sec={sec} />)}</div>}
          </SubView>
        )}

        {/* ─── عرض: قسم مستقل sec:<id> ─── */}
        {view.startsWith('sec:') && (() => {
          const sec = activeSections.find(s => `sec:${s.id}` === view);
          return (
            <SubView title={sec?.title || 'قسم'}>
              {sec ? <SectionCard key={sec.id} sec={sec} /> : <Card><p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>القسم غير متاح حالياً</p></Card>}
            </SubView>
          );
        })()}

        {/* ─── عرض غير معروف ─── */}
        {!['home', 'wallet', 'profits', 'operations', 'withdraw', 'account', 'settings', 'docs', 'extras'].includes(view) && !view.startsWith('sec:') && (
          <SubView title="القسم">
            <Card><p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>هذا القسم غير متاح — <button onClick={() => setView('home')} className="font-bold underline" style={{ color: C.primary }}>الرجوع للرئيسية</button></p></Card>
          </SubView>
        )}
      </main>

      {/* ═══ 4. Bottom Bar ═══ */}
      {(() => {
        if (!R.bottomBar.enabled || bbVisibleCount === 0) return null;
        const btns = R.bottomBar.buttons.filter(b => b.visible).sort((a, b) => a.order - b.order).slice(0, R.bottomBar.buttonCount || 5);
        // الزر المميز يظهر أكبر في المنتصف
        const hi = btns.findIndex(b => b.highlighted);
        if (hi > -1 && btns.length > 2) {
          const [b] = btns.splice(hi, 1);
          btns.splice(Math.floor(btns.length / 2), 0, b);
        }
        const shadowCls = R.bottomBar.shadow === 'strong' ? 'shadow-2xl' : R.bottomBar.shadow === 'light' ? 'shadow-lg' : '';
        return (
          <nav className={`fixed bottom-0 left-0 right-0 z-50 ${R.bottomBar.style === 'glass' ? 'backdrop-blur-md' : ''} ${!R.bottomBar.showOnDesktop ? 'lg:hidden' : ''} ${shadowCls} ${R.bottomBar.style === 'raised' ? 'mx-4 mb-3 rounded-2xl' : R.bottomBar.style === 'rounded' ? 'mx-4 mb-3 rounded-full' : ''}`}
            style={{ backgroundColor: R.bottomBar.style === 'glass' ? (R.bottomBar.bgColor || '#ffffff') + 'cc' : (R.bottomBar.bgColor || '#ffffff'), ...cBorder }}>
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
              {btns.map(btn => {
                const active = view === btn.action;
                return (
                  <button key={btn.id} onClick={() => go(btn.action)}
                    className={`flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl transition-all relative ${btn.highlighted ? 'scale-110 -translate-y-2' : ''} ${active ? 'opacity-100' : 'opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${btn.highlighted ? 'shadow-lg' : ''}`} style={{ backgroundColor: btn.color + (active ? '30' : '15') }}>
                      <Ic n={btn.icon} s={btn.highlighted ? 20 : 16} c={btn.color} />
                    </div>
                    <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: btn.color }}>{btn.label}</span>
                    {btn.badge > 0 && <span className="absolute top-0 right-0 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ backgroundColor: C.danger }}>{btn.badge}</span>}
                  </button>
                );
              })}
            </div>
          </nav>
        );
      })()}

      {/* ═══ مؤشرات التنقل (Swipe) ═══ */}
      {showIndicators && (
        <div className="fixed left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ bottom: R.bottomBar.enabled && bbVisibleCount > 0 ? 72 : 14 }}>
          {R.design.navIndicators === 'progress' ? (
            <div className="w-32 h-1 rounded-full overflow-hidden pointer-events-auto" style={{ backgroundColor: C.borders }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${((NAV_VIEWS.indexOf(view === 'home' ? 'home' : NAV_VIEWS.includes(view) ? view : 'home') + 1) / NAV_VIEWS.length) * 100}%`, backgroundColor: C.primary }} />
            </div>
          ) : R.design.navIndicators === 'numbers' ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full pointer-events-auto" style={{ backgroundColor: C.bgCards + 'cc', backdropFilter: 'blur(6px)' }}>
              {NAV_VIEWS.map((v, i) => (
                <button key={v} onClick={() => setView(v)} className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all`} style={{ backgroundColor: view === v ? C.primary : 'transparent', color: view === v ? '#fff' : C.textSecondary }} title={VIEW_TITLES[v]}>{i + 1}</button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-auto" style={{ backgroundColor: C.bgCards + 'cc', backdropFilter: 'blur(6px)' }}>
              {NAV_VIEWS.map(v => (
                <button key={v} onClick={() => setView(v)} className={`rounded-full transition-all ${view === v ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`} style={{ backgroundColor: view === v ? C.primary : C.borders }} title={VIEW_TITLES[v]} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Lightbox ═══ */}
      <AnimatePresence>{lightbox && (
        <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 left-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30" onClick={() => setLightbox(null)}><X size={20} /></button>
          <motion.img key="lb-img" initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={lightbox} className="max-w-full max-h-full rounded-xl object-contain" alt="preview" />
        </motion.div>
      )}</AnimatePresence>
    </div>
    </SkinCtx.Provider>
  );
}
