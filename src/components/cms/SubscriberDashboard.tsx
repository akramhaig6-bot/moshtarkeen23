// ═══════════════════════════════════════════════════════════════
// تطبيق العميل المخصص — عرض جميع الأقسام 28 بعد الاستعلام
// كل عنصر يحترم Toggle الظهور/الإخفاء وإعدادات التصميم
// ═══════════════════════════════════════════════════════════════
import { Subscriber, Operation } from '@/types';
import { SubscriberCMS } from '@/types/cms';
import { resolveCMS } from '@/data/cms-defaults';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, User, Bell, Moon, Search, Globe, Menu, X, Home, Wallet, TrendingUp, CreditCard, ArrowLeftRight, Settings, Shield, HelpCircle, LogOut, Star, Phone, Mail, MapPin, ExternalLink, AlertCircle, FileText, Clock, Download, ChevronLeft, ChevronRight, ZoomIn, BarChart2,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ═══ أيقونات ═══
const ICONS: Record<string, React.ComponentType<any>> = { home:Home, wallet:Wallet, profits:TrendingUp, operations:CreditCard, withdraw:ArrowLeftRight, account:User, settings:Settings, shield:Shield, search:Search, bell:Bell, moon:Moon, globe:Globe, star:Star, help:HelpCircle, logout:LogOut, file:FileText, clock:Clock, map:MapPin };
const Ic = ({ n, s=16, c }: { n:string; s?:number; c?:string }) => { const C=ICONS[n]||Star; return <C size={s} style={c?{color:c}:undefined} />; };

// ═══ استبدال المتغيرات ═══
function rv(text: string, sub: Subscriber, ops: Operation[]): string {
  if (!text) return '';
  const now = new Date();
  const sOps = ops.filter(o => o.subscriberName === sub.name);
  const last = sOps.sort((a,b) => b.date.localeCompare(a.date))[0];
  const pct = sub.subscriptionAmount > 0 ? ((sub.profits / sub.subscriptionAmount) * 100).toFixed(1) : '0';
  return text
    .replace(/\{الاسم\}/g, sub.name).replace(/\{الهاتف\}/g, sub.phone)
    .replace(/\{الرصيد_الإجمالي\}/g, String(sub.subscriptionAmount + sub.profits))
    .replace(/\{مبلغ_الاشتراك\}/g, String(sub.subscriptionAmount))
    .replace(/\{الأرباح\}/g, String(sub.profits)).replace(/\{الرسوم\}/g, String(sub.systemFees))
    .replace(/\{البنك\}/g, sub.bankName).replace(/\{IBAN\}/g, sub.iban)
    .replace(/\{المنصة\}/g, sub.platform).replace(/\{تاريخ_الانضمام\}/g, sub.joinDate)
    .replace(/\{الحالة\}/g, sub.subscriberStatus).replace(/\{الشركة\}/g, '')
    .replace(/\{اليوم\}/g, String(now.getDate())).replace(/\{الشهر\}/g, String(now.getMonth()+1))
    .replace(/\{السنة\}/g, String(now.getFullYear()))
    .replace(/\{عدد_العمليات\}/g, String(sOps.length))
    .replace(/\{آخر_عملية\}/g, last?.operation || 'لا يوجد')
    .replace(/\{نسبة_الربح\}/g, pct + '%');
}

// ═══ المكوّن الرئيسي ═══
export function SubscriberDashboard({ subscriber: sub, operations: ops, cms }: { subscriber: Subscriber; operations: Operation[]; cms: SubscriberCMS }) {
  const R = resolveCMS(cms);
  const [sbOpen, setSbOpen] = useState(R.sideBar.defaultState === 'open');
  const [dark, setDark] = useState(false);
  const [view, setView] = useState('home');
  const [now, setNow] = useState(new Date());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set());

  const C = dark && R.design.darkMode.enabled ? R.design.darkMode.colors : R.design.colors;
  const sOps = ops.filter(o => o.subscriberName === sub.name);

  // ساعة حية
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
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
  const cBorder = R.design.cardStyle === 'border' ? { border: `1px solid ${C.borders}` } : R.design.cardStyle === 'glass' ? { border: '1px solid rgba(255,255,255,0.2)' } : {};
  const hoverCls = R.design.hoverEffect === 'zoom' ? 'hover:scale-[1.02]' : R.design.hoverEffect === 'lift' ? 'hover:-translate-y-1 hover:shadow-lg' : R.design.hoverEffect === 'glow' ? 'hover:shadow-xl hover:shadow-blue-500/10' : '';
  const anim = R.design.animation === 'none' ? {} : { initial: { opacity: 0, y: R.design.animation === 'slide' ? 20 : R.design.animation === 'bounce' ? -10 : 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
  const fSize = R.design.fonts.baseSize === 'small' ? 'text-sm' : R.design.fonts.baseSize === 'large' ? 'text-lg' : 'text-base';
  const fWeight = R.design.fonts.weight === 'bold' ? 'font-bold' : R.design.fonts.weight === 'medium' ? 'font-medium' : 'font-normal';
  const fLine = R.design.fonts.lineHeight === 'tight' ? 'leading-tight' : R.design.fonts.lineHeight === 'wide' ? 'leading-loose' : 'leading-normal';
  const gridCls = R.design.grid === 1 ? 'grid-cols-1' : R.design.grid === 2 ? 'grid-cols-1 sm:grid-cols-2' : R.design.grid === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  const tbH = R.topBar.height === 'small' ? 48 : R.topBar.height === 'large' ? 80 : 64;
  const statusInfo = () => { const s = R.clientProfile.statusStyle; return s==='active'?{l:'نشط',c:'bg-emerald-400',t:'text-emerald-700',bg:'bg-emerald-50'}:s==='pending'?{l:'معلق',c:'bg-amber-400',t:'text-amber-700',bg:'bg-amber-50'}:s==='stopped'?{l:'موقوف',c:'bg-red-400',t:'text-red-700',bg:'bg-red-50'}:{l:'جديد',c:'bg-blue-400',t:'text-blue-700',bg:'bg-blue-50'}; };
  const badgeInfo = () => { const b = R.clientProfile.badge; return b==='vip'?{l:'⭐ VIP'}:b==='premium'?{l:'🏆 مميز'}:b==='platinum'?{l:'💎 بلاتيني'}:b==='founder'?{l:'🎖️ مؤسس'}:null; };
  const avShape = R.clientProfile.avatarShape === 'circle' ? 'rounded-full' : R.clientProfile.avatarShape === 'square' ? 'rounded-none' : 'rounded-xl';
  const dispName = R.clientProfile.displayMode === 'hidden' ? '' : R.clientProfile.displayMode === 'alias' ? (R.clientProfile.displayName || sub.name) : sub.name;
  const dispPhone = R.clientProfile.phoneDisplay === 'hidden' ? '' : R.clientProfile.phoneDisplay === 'partial' ? (sub.phone.length > 4 ? sub.phone.slice(0,2)+'••••'+sub.phone.slice(-2) : sub.phone) : sub.phone;

  // خلفيات
  const bgStyle = (): React.CSSProperties => {
    const bg = R.design.background;
    if (bg.type === 'color') return { backgroundColor: bg.color };
    if (bg.type === 'gradient') return { background: bg.gradient || `linear-gradient(${bg.gradientDirection || '135deg'}, ${C.bgMain}, ${C.bgCards})` };
    if (bg.type === 'image' && bg.image) return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: bg.fixed ? 'fixed' : 'scroll' };
    return { backgroundColor: C.bgMain };
  };
  const bgOverlay = (): React.CSSProperties => {
    const bg = R.design.background;
    if (bg.opacity < 100) return { backgroundColor: C.bgMain, opacity: bg.opacity / 100 };
    if (bg.blur > 0) return { backdropFilter: `blur(${bg.blur}px)` };
    return {};
  };

  // ═══ بطاقة عامة ═══
  const Card = ({ children, className = '', style = {}, noAnim = false }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; noAnim?: boolean }) => {
    const el = (
      <div className={`${rd} ${cShadow} ${hoverCls} p-4 transition-all duration-300 ${className}`}
        style={{ backgroundColor: R.design.cardStyle === 'glass' ? C.bgCards + 'b3' : C.bgCards, ...cBorder, ...style }}>
        {children}
      </div>
    );
    if (noAnim) return el;
    return <motion.div {...anim}>{el}</motion.div>;
  };

  // فلترة النصوص
  const activeTexts = R.texts.filter(t => t.visible && (!t.expiryDate || new Date(t.expiryDate) > now));
  const activeSections = R.sections.filter(s => s.visible && (!s.dateFrom || new Date(s.dateFrom) <= now) && (!s.dateTo || new Date(s.dateTo) >= now));
  const activeBanners = R.banners.filter(b => b.visible && !closedBanners.has(b.id) && (!b.expiryDate || new Date(b.expiryDate) > now));
  const activeAlerts = R.alerts.filter(a => a.visible);

  return (
    <div className="min-h-screen relative" style={{ ...bgStyle(), color: C.textMain, fontFamily: `'${R.design.fonts.body}', sans-serif`, fontSize: fSize, fontWeight: fWeight, lineHeight: fLine, direction: R.design.fonts.direction }} dir={R.design.fonts.direction}>
      {R.design.background.opacity < 100 && <div className="fixed inset-0 pointer-events-none" style={{ ...bgStyle(), opacity: 1 - R.design.background.opacity / 100 }} />}
      {R.design.background.blur > 0 && <div className="fixed inset-0 pointer-events-none" style={{ backdropFilter: `blur(${R.design.background.blur}px)` }} />}

      {/* ═══ 3. Top Bar ═══ */}
      {R.topBar.enabled && (
        <header className={`fixed top-0 left-0 right-0 z-50 flex items-center px-4 ${R.topBar.shadow === 'strong' ? 'shadow-lg' : R.topBar.shadow === 'light' ? 'shadow-sm' : ''} ${R.topBar.transparency === 'blur' ? 'backdrop-blur-md' : ''} ${R.topBar.transparency === 'transparent' ? 'bg-transparent' : ''}`}
          style={{ height: tbH, backgroundColor: R.topBar.transparency === 'transparent' ? 'transparent' : R.topBar.bgColor || C.bgCards, color: R.topBar.textColor || C.textMain }}>
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              {R.topBar.showLogo && R.topBar.logoType !== 'hidden' && (R.topBar.logoType === 'company' && R.company.logo ? <img src={R.company.logo} className="w-8 h-8 rounded-lg object-contain" /> : R.topBar.logoType === 'text' ? <span className="text-sm font-bold" style={{ color: C.primary }}>{R.company.shortName}</span> : <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primary+'20' }}><Building2 size={16} style={{ color: C.primary }} /></div>)}
              <div><h1 className="text-sm font-bold" style={{ color: R.topBar.textColor || C.textMain }}>{R.topBar.title}</h1>{R.topBar.subtitle && <p className="text-[10px]" style={{ color: R.topBar.textColor ? R.topBar.textColor + 'aa' : C.textSecondary }}>{R.topBar.subtitle}</p>}</div>
            </div>
            <div className="flex items-center gap-1">
              {R.topBar.showClientName && <span className="text-xs hidden sm:block" style={{ color: R.topBar.textColor || C.textSecondary }}>{sub.name}</span>}
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
        {sbOpen && R.sideBar.enabled && (<>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setSbOpen(false)} />
          <motion.aside initial={{x: R.sideBar.position==='right'?-300:300}} animate={{x:0}} exit={{x: R.sideBar.position==='right'?-300:300}} transition={{type:'spring',damping:25}}
            className={`fixed top-0 ${R.sideBar.position==='right'?'right-0':'left-0'} h-full z-[70] overflow-y-auto ${R.sideBar.shadow==='strong'?'shadow-2xl':R.sideBar.shadow==='light'?'shadow-lg':''}`}
            style={{ width: R.sideBar.width==='narrow'?72:R.sideBar.width==='wide'?300:260, backgroundColor: R.sideBar.bgColor || C.bgCards }}>
            <div className="p-4 border-b" style={{ borderColor: C.borders }}>
              <div className="flex items-center justify-between mb-2">
                {R.sideBar.header.showAvatar && <div className={`w-10 h-10 ${avShape} overflow-hidden flex items-center justify-center`} style={{ backgroundColor: C.primary+'20' }}>{R.clientProfile.avatarType==='upload'&&R.clientProfile.avatarImage?<img src={R.clientProfile.avatarImage} className="w-full h-full object-cover"/>:<span className="font-bold" style={{ color: C.primary }}>{sub.name.charAt(0)}</span>}</div>}
                <button onClick={() => setSbOpen(false)} className="p-1 rounded hover:bg-black/5"><X size={16}/></button>
              </div>
              {R.sideBar.header.showName && <p className="font-bold text-sm" style={{ color: C.textMain }}>{sub.name}</p>}
              {R.sideBar.header.showStatus && <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] ${statusInfo().bg}`}><span className={`w-1.5 h-1.5 rounded-full ${statusInfo().c}`}/><span className={statusInfo().t}>{statusInfo().l}</span></div>}
              {R.sideBar.header.showMemberNumber && <p className="text-[10px] mt-1" style={{ color: C.textSecondary }}>#{R.clientProfile.memberNumber || sub.id.slice(0,8)}</p>}
            </div>
            <nav className="p-2 space-y-0.5">
              {R.sideBar.items.filter(i=>i.visible).sort((a,b)=>a.order-b.order).map(item=>(<>
                <button key={item.id} onClick={()=>{setView(item.action);setSbOpen(false)}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/5 transition-colors" style={{ color: item.color || C.textMain }}>
                  <Ic n={item.icon} s={16} />{R.sideBar.width!=='narrow' && <><span className="flex-1 text-right">{item.label}</span>{item.badge>0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: C.primary }}>{item.badge}</span>}</>}
                </button>
                {item.separator && <div className="my-1 h-px mx-3" style={{ backgroundColor: C.borders }} />}
              </>))}
            </nav>
            <div className="p-4 border-t mt-auto" style={{ borderColor: C.borders }}>
              {R.sideBar.footer.showSupport && <a href={R.sideBar.footer.supportLink||'#'} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-black/5" style={{ color: C.primary }}><HelpCircle size={14}/>{R.sideBar.width!=='narrow' && 'الدعم الفني'}</a>}
              {R.sideBar.footer.showLogout && <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-black/5" style={{ color: C.danger }}><LogOut size={14}/>{R.sideBar.width!=='narrow' && 'خروج'}</button>}
              {R.sideBar.footer.version && <p className="text-[10px] text-center mt-2" style={{ color: C.textSecondary }}>{R.sideBar.footer.version}</p>}
              {R.sideBar.footer.copyright && <p className="text-[9px] text-center" style={{ color: C.textSecondary }}>{R.sideBar.footer.copyright}</p>}
            </div>
          </motion.aside>
        </>)}
      </AnimatePresence>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className={`${R.topBar.enabled ? `pt-[${tbH}px]` : 'pt-4'} pb-24 px-4 max-w-7xl mx-auto`} style={{ paddingTop: R.topBar.enabled ? tbH + 16 : 16, fontFamily: `'${R.design.fonts.heading}', sans-serif` }}>

        {/* ═══ صورة الغلاف ═══ */}
        {R.company.coverImage && <motion.div {...anim} className={`${rd} overflow-hidden mb-6`}><img src={R.company.coverImage} className="w-full h-32 sm:h-48 object-cover" /></motion.div>}

        {/* ═══ 2. الملف الشخصي ═══ */}
        {R.clientProfile.avatarType !== 'hidden' && R.clientProfile.displayMode !== 'hidden' && (
          <motion.div {...anim} className={`${rd} p-5 mb-6 overflow-hidden relative ${cShadow}`} style={{ background: R.clientProfile.cardBackground || C.bgCards, ...cBorder }}>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`${avShape} w-16 h-16 overflow-hidden flex items-center justify-center bg-white/20 backdrop-blur-sm ring-2 ring-white/30 flex-shrink-0`}>
                {R.clientProfile.avatarType==='upload'&&R.clientProfile.avatarImage ? <img src={R.clientProfile.avatarImage} className="w-full h-full object-cover"/> : <span className="text-2xl font-bold text-white">{sub.name.charAt(0)}</span>}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold" style={{ color: R.clientProfile.nameColor || '#ffffff' }}>{dispName}</h2>
                {R.clientProfile.title && <p className="text-xs text-white/80">{R.clientProfile.title}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white"><span className={`w-1.5 h-1.5 rounded-full ${statusInfo().c}`}/>{statusInfo().l}</div>
                  {badgeInfo() && <span className="text-[10px] text-white/90">{badgeInfo()?.l}</span>}
                  {R.clientProfile.memberLevel !== 'none' && <span className="text-[10px] text-white/90 px-1.5 py-0.5 rounded bg-white/10 capitalize">{R.clientProfile.memberLevel}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 relative z-10 flex-wrap">
              {dispPhone && <span className="text-xs text-white/70 flex items-center gap-1"><Phone size={10}/>{dispPhone}</span>}
              {R.clientProfile.showJoinDate && <span className="text-xs text-white/70">عضو منذ {sub.joinDate}</span>}
            </div>
            {R.clientProfile.personalBio && <p className="text-xs text-white/80 mt-2">{R.clientProfile.personalBio}</p>}
          </motion.div>
        )}

        {/* ═══ 1. اسم الشركة ═══ */}
        {R.company.name && <Card><div className="flex items-center gap-3">{R.company.logo && <img src={R.company.logo} className="w-10 h-10 rounded-lg object-contain"/>}<div><p className="font-bold text-sm" style={{ color: C.textMain }}>{R.company.name}</p>{R.company.description && <p className="text-xs" style={{ color: C.textSecondary }}>{R.company.description}</p>}</div></div></Card>}

        {/* ═══ 19. التنبيهات (أعلى) ═══ */}
        {activeAlerts.filter(a=>a.location==='top').map(a=>{
          const ac:Record<string,{bg:string;tx:string;bd:string}>={info:{bg:'#eff6ff',tx:'#1e40af',bd:'#bfdbfe'},success:{bg:'#f0fdf4',tx:'#166534',bd:'#bbf7d0'},warning:{bg:'#fffbeb',tx:'#92400e',bd:'#fde68a'},danger:{bg:'#fef2f2',tx:'#991b1b',bd:'#fecaca'}};
          const c=ac[a.type]||ac.info;
          return <motion.div key={a.id} {...anim} className={`${rd} p-3 mb-4 flex items-center gap-2`} style={{ backgroundColor: c.bg, border: `1px solid ${c.bd}` }}><AlertCircle size={16} style={{ color: c.tx }}/><p className="text-sm flex-1" style={{ color: c.tx }}>{a.text}</p></motion.div>;
        })}

        {/* ═══ 13. البانرات ═══ */}
        {activeBanners.sort((a,b)=>a.order-b.order).map(b=>(
          <motion.div key={b.id} {...anim} className={`${rd} p-4 mb-4 relative`} style={{ backgroundColor: b.color+'15', border: `1px solid ${b.color}30` }}>
            {b.image && <img src={b.image} className={`w-full h-32 object-cover ${rd} mb-2`}/>}
            <p className="text-sm font-bold" style={{ color: b.color }}>{b.text}</p>
            {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 inline-block" style={{ color: C.primary }}>المزيد ←</a>}
            {b.closable && <button onClick={()=>setClosedBanners(prev=>new Set(prev).add(b.id))} className="absolute top-2 left-2 p-1 rounded-full hover:bg-black/10"><X size={12}/></button>}
          </motion.div>
        ))}

        {/* ═══ 7. نصوص (أعلى) ═══ */}
        {activeTexts.filter(t=>t.location==='top').map(t=>(
          <motion.div key={t.id} {...anim} className={`${rd} p-3 mb-4 ${t.border==='frame'?'border-2':t.border==='edges'?'border-t-2 border-b-2':''}`}
            style={{ backgroundColor: t.bgType==='color'?t.bgValue:C.bgCards, borderColor: C.primary, textAlign: t.align as any }}>
            {t.title && <p className={`font-bold mb-1 ${t.size==='small'?'text-xs':t.size==='large'?'text-base':'text-sm'}`} style={{ color: t.color||C.textMain }}>{t.title}</p>}
            <p className={`${t.size==='small'?'text-xs':t.size==='large'?'text-base':'text-sm'}`} style={{ color: t.color||C.textSecondary }}>{rv(t.content,sub,sOps)}</p>
          </motion.div>
        ))}

        {/* ═══ بطاقات مالية أساسية ═══ */}
        <div className={`grid ${gridCls} ${gap} mb-6`}>
          {sub.subscriptionAmount > 0 && <Card><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primary+'15' }}><Wallet size={16} style={{ color: C.primary }}/></div><span className="text-xs" style={{ color: C.textSecondary }}>مبلغ الاشتراك</span></div><p className="text-xl font-bold" style={{ color: C.textMain }}>{sub.subscriptionAmount.toLocaleString()} <span className="text-xs">{sub.subscriptionCurrencySymbol||sub.subscriptionCurrency||'ر.س'}</span></p></Card>}
          {sub.profits > 0 && <Card><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.success+'15' }}><TrendingUp size={16} style={{ color: C.success }}/></div><span className="text-xs" style={{ color: C.textSecondary }}>الأرباح</span></div><p className="text-xl font-bold" style={{ color: C.success }}>{sub.profits.toLocaleString()} <span className="text-xs">{sub.profitsCurrencySymbol||sub.profitsCurrency||'ر.س'}</span></p></Card>}
          {sub.systemFees > 0 && <Card><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.warning+'15' }}><AlertCircle size={16} style={{ color: C.warning }}/></div><span className="text-xs" style={{ color: C.textSecondary }}>رسوم النظام</span></div><p className="text-xl font-bold" style={{ color: C.warning }}>{sub.systemFees.toLocaleString()} <span className="text-xs">{sub.systemFeesCurrencySymbol||sub.systemFeesCurrency||'ر.س'}</span></p></Card>}
          <Card><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.secondary+'15' }}><CreditCard size={16} style={{ color: C.secondary }}/></div><span className="text-xs" style={{ color: C.textSecondary }}>العمليات</span></div><p className="text-xl font-bold" style={{ color: C.textMain }}>{sOps.length}</p></Card>
        </div>

        {/* ═══ 9. بطاقات المعلومات ═══ */}
        {R.infoCards.filter(c=>c.visible).length > 0 && <div className={`grid ${gridCls} ${gap} mb-6`}>
          {R.infoCards.filter(c=>c.visible).sort((a,b)=>a.order-b.order).map(card=>(
            <Card key={card.id}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color+'15' }}><Ic n={card.icon} s={16} c={card.color}/></div><span className="text-xs" style={{ color: C.textSecondary }}>{card.title}</span></div><p className="text-xl font-bold" style={{ color: C.textMain }}>{card.value}</p>{card.change && <p className="text-[10px] mt-1" style={{ color: C.success }}>{card.change}</p>}</Card>
          ))}
        </div>}

        {/* ═══ 10. الرسوم البيانية ═══ */}
        {R.charts.filter(ch=>ch.visible).length > 0 && <div className={`${gap} mb-6 space-y-6`}>
          {R.charts.filter(ch=>ch.visible).sort((a,b)=>a.order-b.order).map(ch=>{
            // توليد بيانات من العمليات
            const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
            const genData = () => {
              if (ch.dataType === 'profits') return months.slice(0,6).map((m,i)=>({name:m.slice(0,3), value: Math.max(0, sub.profits * (0.5 + Math.random()*0.8) / 6 * (i+1))}));
              if (ch.dataType === 'balance') return months.slice(0,6).map((m,i)=>({name:m.slice(0,3), value: sub.subscriptionAmount * (0.3 + i*0.15)}));
              if (ch.dataType === 'operations') return months.slice(0,6).map((m,i)=>({name:m.slice(0,3), value: Math.floor(sOps.length/6*(i+1))}));
              return months.slice(0,6).map((m,i)=>({name:m.slice(0,3), value: Math.floor(Math.random()*100)}));
            };
            const data = genData();
            const chartColors = ch.colors.length > 0 ? ch.colors : [C.primary, C.secondary, C.success, C.warning];
            const chartTitle = ch.title || (ch.dataType==='profits'?'الأرباح':ch.dataType==='balance'?'تطور الرصيد':ch.dataType==='operations'?'العمليات':'البيانات');
            return <Card key={ch.id}>
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-sm" style={{ color: C.textMain }}>{chartTitle}</h3><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary+'15', color: C.primary }}>{ch.period==='7d'?'7 أيام':ch.period==='30d'?'30 يوم':ch.period==='3m'?'3 أشهر':ch.period==='1y'?'سنة':'الكل'}</span></div>
              <div style={{ height: ch.size==='small'?150:ch.size==='large'?300:200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {ch.type==='line' ? <LineChart data={data}><XAxis dataKey="name" tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>{ch.showNumbers && <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2} dot={{r:3,fill:chartColors[0]}}/>}<Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2} dot={false}/></LineChart>
                  : ch.type==='bar' ? <BarChart data={data}><XAxis dataKey="name" tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/><Bar dataKey="value" fill={chartColors[0]} radius={[4,4,0,0]}/></BarChart>
                  : ch.type==='area' ? <AreaChart data={data}><XAxis dataKey="name" tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/><Area type="monotone" dataKey="value" stroke={chartColors[0]} fill={chartColors[0]+'30'} strokeWidth={2}/></AreaChart>
                  : ch.type==='pie' ? <PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={ch.size==='small'?50:80} label={ch.showNumbers}>{data.map((_,i)=><Cell key={i} fill={chartColors[i%chartColors.length]}/>)}</Pie><Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/></PieChart>
                  : <BarChart data={data}><XAxis dataKey="name" tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:C.textSecondary}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/><Bar dataKey="value" fill={chartColors[0]} radius={[4,4,0,0]}/></BarChart>}
                </ResponsiveContainer>
              </div>
            </Card>;
          })}
        </div>}

        {/* ═══ 11. العدادات المتحركة ═══ */}
        {R.counters.filter(c=>c.visible).length > 0 && <div className={`grid grid-cols-2 sm:grid-cols-3 ${gap} mb-6`}>
          {R.counters.filter(c=>c.visible).sort((a,b)=>a.order-b.order).map(c=>(
            <Card key={c.id} className="text-center"><Ic n={c.icon} s={20} c={c.color}/><p className="text-2xl font-black mt-1" style={{ color: c.color }}>{c.prefix}{c.value.toLocaleString()}{c.suffix && <span className="text-xs mr-1">{c.suffix}</span>}</p>{c.title && <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{c.title}</p>}</Card>
          ))}
        </div>}

        {/* ═══ 21. أشرطة التقدم ═══ */}
        {R.progressBars.filter(p=>p.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🎯 الأهداف</h3>
          {R.progressBars.filter(p=>p.visible).sort((a,b)=>a.order-b.order).map(p=>{const pct=p.target>0?Math.min(100,Math.round(p.current/p.target*100)):0;return(
            <div key={p.id} className="mb-3"><div className="flex justify-between mb-1"><span className="text-xs font-bold" style={{ color: C.textMain }}>{p.title}</span><span className="text-xs" style={{ color: C.textSecondary }}>{pct}%</span></div><div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.borders }}><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} style={{ backgroundColor: p.color }}/></div><p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{p.current.toLocaleString()} / {p.target.toLocaleString()}</p></div>
          );})}
        </Card>}

        {/* ═══ 22. العد التنازلي ═══ */}
        {R.countdowns.filter(c=>c.visible&&c.targetDate).length > 0 && <div className={`grid ${gap} mb-6 ${R.countdowns.filter(c=>c.visible).length>1?'grid-cols-1 sm:grid-cols-2':'grid-cols-1'}`}>
          {R.countdowns.filter(c=>c.visible&&c.targetDate).sort((a,b)=>a.order-b.order).map(cd=>{
            const target=new Date(cd.targetDate+(cd.targetTime?'T'+cd.targetTime:''));const diff=Math.max(0,target.getTime()-now.getTime());
            const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
            return <Card key={cd.id} className="text-center"><p className="text-xs font-bold mb-2" style={{ color: cd.color }}>{cd.title}</p><div className="flex justify-center gap-2">{[{v:d,l:'يوم'},{v:h,l:'ساعة'},{v:m,l:'دقيقة'},{v:s,l:'ثانية'}].map((t,i)=><div key={i} className="px-3 py-2 rounded-lg" style={{ backgroundColor: cd.color+'15' }}><p className="text-lg font-black tabular-nums" style={{ color: cd.color }}>{t.v}</p><p className="text-[9px]" style={{ color: C.textSecondary }}>{t.l}</p></div>)}</div></Card>;
          })}
        </div>}

        {/* ═══ 12. الأوسمة ═══ */}
        {R.achievements.filter(a=>a.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🏆 الأوسمة</h3>
          <div className="flex flex-wrap gap-3">{R.achievements.filter(a=>a.visible).sort((a,b)=>a.order-b.order).map(a=>(
            <div key={a.id} className={`flex items-center gap-2 px-3 py-2 ${rd}`} style={{ backgroundColor: a.color==='gold'?'#fef3c7':a.color==='silver'?'#f1f5f9':a.color==='bronze'?'#fed7aa':C.primary+'15' }}>
              <span className="text-lg">{a.icon}</span><div><p className="text-xs font-bold" style={{ color: C.textMain }}>{a.name}</p>{a.description && <p className="text-[10px]" style={{ color: C.textSecondary }}>{a.description}</p>}</div>
            </div>))}
          </div>
        </Card>}

        {/* ═══ 8. الأقسام المخصصة ═══ */}
        {activeSections.filter(s=>s.location==='home').sort((a,b)=>a.order-b.order).map(sec=>(
          <Card key={sec.id} className={`mb-4 ${sec.style==='frame'?'border-2':''}`} style={{ backgroundColor: sec.bgColor||C.bgCards, borderColor: sec.style==='frame'?C.borders:undefined }}>
            <div className="flex items-center gap-2 mb-2"><Ic n={sec.icon} s={16} c={C.primary}/><h3 className="font-bold text-sm" style={{ color: C.textMain }}>{sec.title}</h3>{sec.subtitle && <span className="text-xs" style={{ color: C.textSecondary }}>{sec.subtitle}</span>}</div>
            {sec.description && <p className="text-sm mb-3" style={{ color: C.textSecondary, lineHeight: '1.8' }}>{sec.description}</p>}
            {sec.images.length > 0 && <div className={`${sec.imageDisplay==='grid'?'grid grid-cols-2 gap-2':sec.imageDisplay==='single'?'':'flex gap-2 overflow-x-auto pb-2 snap-x'}`}>
              {sec.images.map((img,i)=>(
                <img key={i} src={img} onClick={()=>setLightbox(img)} className={`${sec.imageSize==='small'?'w-20 h-20':sec.imageSize==='medium'?'w-40 h-40':sec.imageSize==='large'?'w-64 h-64':'w-full h-48'} ${rd} object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity ${sec.imageDisplay==='carousel'?'snap-center':''}`} />
              ))}
            </div>}
            {sec.videoUrl && <div className="mt-3 aspect-video rounded-lg overflow-hidden"><iframe src={sec.videoUrl.replace('watch?v=','embed/')} className="w-full h-full" allowFullScreen/></div>}
            {sec.buttons.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{sec.buttons.map(btn=><a key={btn.id} href={btn.url||'#'} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 hover:opacity-90" style={{ backgroundColor: C.primary }}>{btn.label} <ExternalLink size={11}/></a>)}</div>}
          </Card>
        ))}

        {/* ═══ 14. جدول البيانات ═══ */}
        {(R.dataTable.visible && sOps.length > 0) && (() => {
          const sorted = R.dataTable.sortOrder === 'oldest' ? [...sOps].sort((a,b) => a.date.localeCompare(b.date)) : [...sOps].sort((a,b) => b.date.localeCompare(a.date));
          const rows = R.dataTable.maxRows === 0 ? sorted : sorted.slice(0, R.dataTable.maxRows);
          const cols = R.dataTable.columns.length > 0 ? R.dataTable.columns : ['العملية','المبلغ','التاريخ','الحالة'];
          return <Card className="mb-6"><div className="p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.borders }}><h3 className="font-bold text-sm" style={{ color: C.textMain }}>{R.dataTable.title || 'سجل العمليات'}</h3><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.primary+'15', color: C.primary }}>{sOps.length} عملية</span></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ backgroundColor: R.dataTable.colors.header || C.bgMain }}>
              <th className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: C.textSecondary }}>#</th>
              {cols.map(h=><th key={h} className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: C.textSecondary }}>{h}</th>)}
            </tr></thead><tbody>{rows.map((op,i)=>(
              <tr key={op.id} className="border-t hover:bg-black/2 transition-colors" style={{ borderColor: C.borders, backgroundColor: i%2===0?R.dataTable.colors.rows:C.bgMain }}>
                <td className="px-4 py-2.5 text-xs" style={{ color: C.textSecondary }}>{i+1}</td>
                {cols.includes('العملية') && <td className="px-4 py-2.5 text-sm" style={{ color: C.textMain }}>{op.operation}</td>}
                {cols.includes('المبلغ') && <td className="px-4 py-2.5 text-sm font-bold" style={{ color: C.primary }}>{op.amount}</td>}
                {cols.includes('التاريخ') && <td className="px-4 py-2.5 text-xs" style={{ color: C.textSecondary }}>{op.date}</td>}
                {cols.includes('الحالة') && <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${op.status==='مكتمل'?'bg-emerald-100 text-emerald-700':op.status==='قيد المعالجة'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{op.status}</span></td>}
              </tr>))}</tbody></table></div>
          </div></Card>;
        })()}

        {/* ═══ 16. الرسائل ═══ */}
        {R.messages.enabled && R.messages.messages.filter(m=>m.visible!==false).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>💬 الرسائل</h3>
          {R.messages.messages.filter(m=>m.visible!==false).map(msg=>(
            <div key={msg.id} className="p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain, border: msg.priority==='urgent'?`2px solid ${C.danger}`:msg.priority==='important'?`1px solid ${C.warning}`:`1px solid ${C.borders}` }}>
              <div className="flex justify-between mb-1"><span className="text-[10px] font-bold" style={{ color: C.textSecondary }}>{msg.sender}</span><span className="text-[10px]" style={{ color: C.textSecondary }}>{msg.date}</span></div>
              <p className="text-xs" style={{ color: C.textMain }}>{rv(msg.text,sub,sOps)}</p>
              {msg.priority==='urgent' && <span className="text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded" style={{ backgroundColor: C.danger+'15', color: C.danger }}>عاجل</span>}
            </div>))}
        </Card>}

        {/* ═══ 17. التقويم ═══ */}
        {R.calendar.enabled && R.calendar.events.filter(e=>e.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📅 المواعيد</h3>
          {R.calendar.events.filter(e=>e.visible).map(ev=>(
            <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ev.color+'20' }}><span className="text-xs font-bold" style={{ color: ev.color }}>{ev.date?new Date(ev.date).getDate():''}</span></div>
              <div className="flex-1"><p className="text-xs font-bold" style={{ color: C.textMain }}>{ev.title}</p><p className="text-[10px]" style={{ color: C.textSecondary }}>{ev.date} {ev.time} · {ev.status==='upcoming'?'قادم':ev.status==='completed'?'مكتمل':'ملغي'}</p></div>
            </div>))}
        </Card>}

        {/* ═══ 18. معرض الصور ═══ */}
        {R.gallery.enabled && R.gallery.images.length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📸 معرض الصور</h3>
          <div className={`${R.gallery.display==='grid'?'grid grid-cols-3 gap-2':R.gallery.display==='masonry'?'columns-2 gap-2':'flex gap-2 overflow-x-auto pb-2'}`}>
            {R.gallery.images.map(img=>(
              <div key={img.id} className={R.gallery.display==='masonry'?'mb-2 break-inside-avoid':''}>
                <img src={img.src} alt={img.description} onClick={()=>R.gallery.zoomOnClick&&setLightbox(img.src)} className={`${R.gallery.size==='small'?'w-20 h-20':R.gallery.size==='medium'?'w-32 h-32':'w-48 h-48'} ${rd} object-cover ${R.gallery.zoomOnClick?'cursor-pointer hover:opacity-90':''} transition-opacity`} />
                {img.description && <p className="text-[9px] mt-1 text-center" style={{ color: C.textSecondary }}>{img.description}</p>}
              </div>))}
          </div>
        </Card>}

        {/* ═══ 19. التنبيهات (وسط/أسفل) ═══ */}
        {activeAlerts.filter(a=>a.location!=='top').map(a=>{
          const ac:Record<string,{bg:string;tx:string;bd:string}>={info:{bg:'#eff6ff',tx:'#1e40af',bd:'#bfdbfe'},success:{bg:'#f0fdf4',tx:'#166534',bd:'#bbf7d0'},warning:{bg:'#fffbeb',tx:'#92400e',bd:'#fde68a'},danger:{bg:'#fef2f2',tx:'#991b1b',bd:'#fecaca'}};
          const c=ac[a.type]||ac.info;
          return <motion.div key={a.id} {...anim} className={`${rd} p-3 mb-4 flex items-center gap-2`} style={{ backgroundColor:c.bg, border:`1px solid ${c.bd}` }}><AlertCircle size={16} style={{color:c.tx}}/><p className="text-sm flex-1" style={{color:c.tx}}>{a.text}</p></motion.div>;
        })}

        {/* ═══ 7. نصوص (ملخص) ═══ */}
        {activeTexts.filter(t=>t.location==='summary').map(t=>(
          <motion.div key={t.id} {...anim} className={`${rd} p-3 mb-4 ${t.border==='frame'?'border-2':t.border==='edges'?'border-t-2 border-b-2':''}`}
            style={{ backgroundColor: t.bgType==='color'?t.bgValue:C.bgCards, borderColor: C.primary, textAlign: t.align as any }}>
            {t.title && <p className="font-bold mb-1" style={{ color: t.color||C.textMain }}>{t.title}</p>}
            <p style={{ color: t.color||C.textSecondary }}>{rv(t.content,sub,sOps)}</p>
          </motion.div>))}

        {/* ═══ 20. المستندات ═══ */}
        {R.documents.filter(d=>d.visible).length > 0 && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>📄 المستندات</h3>
          {R.documents.filter(d=>d.visible).sort((a,b)=>a.order-b.order).map(doc=>(
            <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg mb-2" style={{ backgroundColor: C.bgMain }}>
              <div className="flex items-center gap-2"><FileText size={16} style={{ color: C.primary }}/><div><p className="text-xs font-bold" style={{ color: C.textMain }}>{doc.name}</p>{doc.size && <p className="text-[10px]" style={{ color: C.textSecondary }}>{doc.size}</p>}</div></div>
              {doc.showDownload && doc.fileData && <a href={doc.fileData} download={doc.name} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: C.primary }}><Download size={10}/> تحميل</a>}
            </div>))}
        </Card>}

        {/* ═══ 23. الفاتورة ═══ */}
        {R.invoice.enabled && R.invoice.visible && <Card className="mb-6">
          <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: C.borders }}>
            <div><h3 className="font-bold text-sm" style={{ color: C.textMain }}>🧾 كشف الحساب</h3><p className="text-[10px]" style={{ color: C.textSecondary }}>{sub.joinDate}</p></div>
            {R.invoice.showLogo && R.company.logo && <img src={R.company.logo} className="w-10 h-10 rounded-lg object-contain"/>}
          </div>
          {R.invoice.items.length > 0 && <div className="space-y-1 mb-3">
            {R.invoice.items.map((it,idx)=>(<div key={idx} className="flex justify-between text-xs py-1"><span style={{ color: C.textMain }}>{it.label}</span><span className="font-bold" style={{ color: it.type==='credit'?C.success:C.danger }}>{it.type==='credit'?'+':'-'}{it.amount.toLocaleString()}</span></div>))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: C.borders, color: C.textMain }}><span>الصافي</span><span>{R.invoice.items.reduce((s,it)=>s+(it.type==='credit'?it.amount:-it.amount),0).toLocaleString()} {R.invoice.currency}</span></div>
          </div>}
          {R.invoice.notes && <p className="text-[10px] mt-2 pt-2 border-t" style={{ color: C.textSecondary, borderColor: C.borders }}>{R.invoice.notes}</p>}
        </Card>}

        {/* ═══ 15. الخريطة ═══ */}
        {R.map.enabled && R.map.visible && R.map.lat && R.map.lng && <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>🗺️ {R.map.title || 'موقعنا'}</h3>
          <div className={`${rd} overflow-hidden`} style={{ height: R.map.height==='small'?200:R.map.height==='large'?400:300 }}>
            <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(R.map.lng)-0.01},${Number(R.map.lat)-0.01},${Number(R.map.lng)+0.01},${Number(R.map.lat)+0.01}&layer=${R.map.mapType==='satellite'?'satellite':'mapnik'}`} className="w-full h-full border-0" title="map"/>
          </div>
        </Card>}

        {/* ═══ 28. عناصر إضافية ═══ */}
        {Object.entries(R.widgets).some(([k,v])=>k!=='newsTickerText'&&v===true) && <Card className="mb-6"><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {R.widgets.liveClock && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><p className="text-lg font-bold tabular-nums" style={{ color: C.primary }}>{now.toLocaleTimeString('ar-SA')}</p><p className="text-[10px]" style={{ color: C.textSecondary }}>الوقت الآن</p></div>}
          {R.widgets.hijriDate && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><p className="text-sm font-bold" style={{ color: C.primary }}>{now.toLocaleDateString('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'})}</p><p className="text-[10px]" style={{ color: C.textSecondary }}>التاريخ الهجري</p></div>}
          {R.widgets.profitCalculator && <div className="text-center p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><p className="text-sm font-bold" style={{ color: C.primary }}>{sub.subscriptionAmount>0?((sub.profits/sub.subscriptionAmount)*100).toFixed(1):0}%</p><p className="text-[10px]" style={{ color: C.textSecondary }}>نسبة الربح</p></div>}
        </div>
        {R.widgets.newsTicker && R.widgets.newsTickerText && <div className="mt-3 overflow-hidden rounded-lg py-2 px-3" style={{ backgroundColor: C.primary+'10' }}><motion.p className="text-xs font-bold whitespace-nowrap" style={{ color: C.primary }} animate={{ x: ['100%', '-100%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>📰 {R.widgets.newsTickerText}</motion.p></div>}
        </Card>}

        {/* ═══ تفاصيل الحساب ═══ */}
        <Card className="mb-6"><h3 className="font-bold text-sm mb-3" style={{ color: C.textMain }}>تفاصيل الحساب</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sub.bankName && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CreditCard size={14} style={{ color: C.textSecondary }}/><div><p className="text-[10px]" style={{ color: C.textSecondary }}>البنك</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.bankName}</p></div></div>}
            {sub.iban && sub.ibanVisible && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><CreditCard size={14} style={{ color: C.textSecondary }}/><div><p className="text-[10px]" style={{ color: C.textSecondary }}>IBAN</p><p className="text-xs font-bold font-mono" style={{ color: C.textMain }}>{sub.iban}</p></div></div>}
            {sub.platform && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><TrendingUp size={14} style={{ color: C.textSecondary }}/><div><p className="text-[10px]" style={{ color: C.textSecondary }}>المنصة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.platform}</p></div></div>}
            {sub.currency && <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: C.bgMain }}><Wallet size={14} style={{ color: C.textSecondary }}/><div><p className="text-[10px]" style={{ color: C.textSecondary }}>العملة</p><p className="text-xs font-bold" style={{ color: C.textMain }}>{sub.currency}</p></div></div>}
          </div>
        </Card>

        {/* ═══ 7. نصوص (أسفل) ═══ */}
        {activeTexts.filter(t=>t.location==='bottom').map(t=>(
          <motion.div key={t.id} {...anim} className={`${rd} p-3 mb-4 ${t.border==='frame'?'border-2':t.border==='edges'?'border-t-2 border-b-2':''}`}
            style={{ backgroundColor: t.bgType==='color'?t.bgValue:C.bgCards, borderColor: C.primary, textAlign: t.align as any }}>
            {t.title && <p className="font-bold mb-1" style={{ color: t.color||C.textMain }}>{t.title}</p>}
            <p className="text-sm" style={{ color: t.color||C.textSecondary }}>{rv(t.content,sub,sOps)}</p>
          </motion.div>))}

        {/* ═══ فوتر الشركة ═══ */}
        {(R.company.phone||R.company.email||R.company.address) && <Card className="mt-6">
          <div className="flex flex-wrap gap-4">{R.company.phone && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><Phone size={11}/>{R.company.phone}</span>}{R.company.email && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><Mail size={11}/>{R.company.email}</span>}{R.company.address && <span className="text-xs flex items-center gap-1" style={{ color: C.textSecondary }}><MapPin size={11}/>{R.company.address}</span>}</div>
          <div className="flex gap-3 mt-3">{R.company.social.instagram && <a href={R.company.social.instagram} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>Instagram</a>}{R.company.social.twitter && <a href={R.company.social.twitter} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>X/Twitter</a>}{R.company.social.telegram && <a href={R.company.social.telegram} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: C.primary }}>Telegram</a>}</div>
        </Card>}
      </main>

      {/* ═══ 4. Bottom Bar ═══ */}
      {R.bottomBar.enabled && (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 ${R.bottomBar.style==='glass'?'backdrop-blur-md':''} ${R.bottomBar.style==='raised'?'mx-4 mb-3 rounded-2xl shadow-xl':R.bottomBar.style==='rounded'?'mx-4 mb-3 rounded-full shadow-lg':''}`}
          style={{ backgroundColor: R.bottomBar.style==='glass'?R.bottomBar.bgColor+'cc':R.bottomBar.bgColor, ...cBorder }}>
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {R.bottomBar.buttons.filter(b=>b.visible).sort((a,b)=>a.order-b.order).map(btn=>{
              const active = view === btn.action;
              return <button key={btn.id} onClick={()=>setView(btn.action)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${btn.highlighted?'scale-110 -translate-y-2':''} ${active?'opacity-100':'opacity-60'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${btn.highlighted?'shadow-lg':''}`} style={{ backgroundColor: btn.color+(active?'30':'15') }}>
                  <Ic n={btn.icon} s={btn.highlighted?20:16} c={btn.color}/>
                </div>
                <span className="text-[9px] font-bold" style={{ color: btn.color }}>{btn.label}</span>
                {btn.badge>0 && <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ backgroundColor: C.danger }}>{btn.badge}</span>}
              </button>;
            })}
          </div>
        </nav>
      )}

      {/* ═══ Lightbox ═══ */}
      <AnimatePresence>{lightbox && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={()=>setLightbox(null)}>
          <button className="absolute top-4 left-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30" onClick={()=>setLightbox(null)}><X size={20}/></button>
          <motion.img initial={{scale:0.8}} animate={{scale:1}} src={lightbox} className="max-w-full max-h-full rounded-xl object-contain"/>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
