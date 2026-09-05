// ═══════════════════════════════════════════════════════════════
// استوديو تصميم تطبيق العميل (CMS) — الأقسام 1 إلى 28
// كل شيء اختياري وقابل للإظهار/الإخفاء (Toggle)
// + رفع صور الأقسام + نسخ تصميم من مشترك + قوالب مخصصة
// ═══════════════════════════════════════════════════════════════
import { SubscriberCMS, SideBarItem, CustomSectionButton, CMSTemplate } from '@/types/cms';
import { Subscriber } from '@/types';
import { resolveCMS, CMS_TEMPLATES } from '@/data/cms-defaults';
import { uid, todayStr } from '@/lib/random';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User, Monitor, Smartphone, Menu, Type, Layout, Palette, LayoutTemplate, Plus, X, Upload, Eye, EyeOff, Star, Image, Home, Wallet, TrendingUp, CreditCard, ArrowLeftRight, Settings, Shield, HelpCircle, LogOut, Search, Bell, Moon, Globe, Award, Crown, Heart, BarChart3, Timer, FileText, MapPin, MessageSquare, Calendar, AlertTriangle, FileDown, Target, Clock, Receipt, Sparkles, Copy, Save, Trash2, Import, Download } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<any>> = { home: Home, wallet: Wallet, profits: TrendingUp, operations: CreditCard, withdraw: ArrowLeftRight, account: User, settings: Settings, shield: Shield, search: Search, bell: Bell, moon: Moon, globe: Globe, star: Star, award: Award, crown: Crown, heart: Heart, help: HelpCircle, logout: LogOut, file: FileText, chart: BarChart3, timer: Timer, target: Target, clock: Clock };
function Ic({ name, size = 15 }: { name: string; size?: number }) { const C = ICONS[name] || Star; return <C size={size} />; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) { return <div className="flex items-center justify-between py-1.5"><label className="text-xs font-bold text-slate-700">{label}</label><Switch checked={checked} onCheckedChange={onChange} /></div>; }
function Clr({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-600 min-w-[70px]">{label}</label><input type="color" value={value} onChange={e => onChange(e.target.value)} className="h-7 w-8 rounded border border-slate-200 cursor-pointer" /><Input value={value} onChange={e => onChange(e.target.value)} className="h-7 text-[10px] font-mono flex-1" /></div>; }
function IconBtn({ value, onChange }: { value: string; onChange: (v: string) => void }) { const [open, setOpen] = useState(false); return <div className="relative"><button type="button" onClick={() => setOpen(!open)} className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><Ic name={value} /></button>{open && <div className="absolute z-50 top-9 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 grid grid-cols-6 gap-1 w-56">{Object.keys(ICONS).map(k => <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }} className={`p-1.5 rounded-lg flex items-center justify-center ${value === k ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}><Ic name={k} size={14} /></button>)}</div>}</div>; }
function SH({ icon, title, num }: { icon: React.ReactNode; title: string; num: string }) { return <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-black text-slate-800 flex items-center gap-2">{icon}{title}</h4><Badge variant="outline" className="text-[10px]">{num}</Badge></div>; }
function Sel({ value, onChange, options, label, className = '' }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; label?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{label}</label>}
      <Select value={value} onValueChange={onChange}><SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent></Select>
    </div>
  );
}
// رفع ملفات متعددة كـ Base64
function MultiImageUpload({ onAdd, label = 'رفع صور' }: { onAdd: (urls: string[]) => void; label?: string }) {
  return (
    <label className="h-7 px-2 rounded border border-slate-200 text-[10px] cursor-pointer flex items-center gap-1 hover:bg-slate-50 w-fit">
      <Upload size={10} />{label}
      <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
        const fs = Array.from(e.target.files || []);
        if (!fs.length) return;
        let left = fs.length; const urls: string[] = [];
        fs.forEach(f => { const r = new FileReader(); r.onload = () => { urls.push(String(r.result || '')); if (--left === 0) onAdd(urls); }; r.readAsDataURL(f); });
        e.currentTarget.value = '';
      }} />
    </label>
  );
}
function SingleImageUpload({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      {label && <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{label}</label>}
      <div className="flex items-center gap-1">
        {value ? <img src={value} className="w-9 h-9 rounded object-cover border border-slate-200" alt={label} /> : <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center"><Image size={13} className="text-slate-400" /></div>}
        <label className="h-7 px-2 rounded border border-slate-200 text-[10px] cursor-pointer flex items-center gap-1 hover:bg-slate-50"><Upload size={10} />رفع<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onChange(String(r.result || '')); r.readAsDataURL(f); } }} /></label>
        {value && <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => onChange('')}><X size={10} /></Button>}
      </div>
    </div>
  );
}

type T = 'company' | 'profile' | 'topbar' | 'bottombar' | 'sidebar' | 'colors' | 'texts' | 'sections' | 'cards' | 'charts' | 'counters' | 'achievements' | 'banners' | 'datatable' | 'map' | 'messages' | 'calendar' | 'gallery' | 'alerts' | 'docs' | 'progress' | 'countdown' | 'invoice' | 'templates' | 'design' | 'widgets';
type ArrayKey = 'texts' | 'sections' | 'infoCards' | 'charts' | 'counters' | 'achievements' | 'banners' | 'alerts' | 'documents' | 'progressBars' | 'countdowns';
interface CustomTpl { id: string; name: string; createdAt: string; data: SubscriberCMS; }

export function CMSBuilder({ cms, onChange, subscribers = [] }: { cms: SubscriberCMS; onChange: (c: SubscriberCMS) => void; subscribers?: Subscriber[] }) {
  const [tab, setTab] = useState<T>('company');

  // ═══ محدثات موحّدة ═══
  const up = <K extends keyof SubscriberCMS>(k: K, p: Partial<SubscriberCMS[K]>) => onChange({ ...cms, [k]: { ...(cms[k] as any), ...p } } as SubscriberCMS);
  const setA = (k: ArrayKey, arr: any[]) => onChange({ ...cms, [k]: arr } as SubscriberCMS);
  const pushA = (k: ArrayKey, item: any) => setA(k, [...(cms[k] as any[]), item]);
  const updA = (k: ArrayKey, i: number, p: Record<string, any>) => { const a = [...(cms[k] as any[])]; a[i] = { ...a[i], ...p }; setA(k, a); };
  const rmA = (k: ArrayKey, id: string) => setA(k, (cms[k] as any[]).filter(x => x.id !== id));
  // مصفوفات متداخلة داخل كائنات
  const updBB = (i: number, p: Record<string, any>) => up('bottomBar', { buttons: cms.bottomBar.buttons.map((x, j) => j === i ? { ...x, ...p } : x) });
  const updSBi = (i: number, p: Partial<SideBarItem>) => up('sideBar', { items: cms.sideBar.items.map((x, j) => j === i ? { ...x, ...p } : x) });
  const updMsg = (i: number, p: Record<string, any>) => up('messages', { messages: cms.messages.messages.map((x, j) => j === i ? { ...x, ...p } : x) });
  const updEv = (i: number, p: Record<string, any>) => up('calendar', { events: cms.calendar.events.map((x, j) => j === i ? { ...x, ...p } : x) });
  const updGal = (i: number, p: Record<string, any>) => up('gallery', { images: cms.gallery.images.map((x, j) => j === i ? { ...x, ...p } : x) });
  const updInv = (idx: number, p: Record<string, any>) => up('invoice', { items: cms.invoice.items.map((x, j) => j === idx ? { ...x, ...p } : x) });

  const applyTpl = (tpl: CMSTemplate | CustomTpl, isCustom = false) => {
    const t: any = tpl;
    const n: SubscriberCMS = JSON.parse(JSON.stringify(cms));
    if (isCustom) {
      // قالب مخصص = لقطة كاملة من إعدادات CMS
      onChange({ ...t.data, templateId: t.id });
      toast.success(`تم تطبيق "${t.name}"`);
      return;
    }
    if (t.design) n.design = { ...n.design, ...t.design, colors: { ...n.design.colors, ...(t.design.colors || {}) }, fonts: { ...n.design.fonts, ...(t.design.fonts || {}) } };
    if (t.topBar) n.topBar = { ...n.topBar, ...t.topBar };
    if (t.bottomBar) n.bottomBar = { ...n.bottomBar, ...t.bottomBar, buttons: cms.bottomBar.buttons };
    if (t.sideBar) n.sideBar = { ...n.sideBar, ...t.sideBar, items: cms.sideBar.items };
    n.templateId = t.id;
    onChange(n);
    toast.success(`تم تطبيق "${t.name}"`);
  };

  // ═══ القوالب المخصصة (localStorage) ═══
  const [customTpls, setCustomTpls] = useState<CustomTpl[]>(() => { try { return JSON.parse(localStorage.getItem('custom_cms_templates') || '[]'); } catch { return []; } });
  const [tplName, setTplName] = useState('');
  const [importText, setImportText] = useState('');
  const persistTpls = (list: CustomTpl[]) => { setCustomTpls(list); try { localStorage.setItem('custom_cms_templates', JSON.stringify(list)); } catch { /* تجاهل */ } };
  const saveCustomTpl = () => {
    if (!tplName.trim()) { toast.error('أدخل اسم القالب أولاً'); return; }
    const t: CustomTpl = { id: 'custom-' + uid(), name: tplName.trim(), createdAt: todayStr(), data: JSON.parse(JSON.stringify(cms)) };
    persistTpls([...customTpls, t]);
    setTplName('');
    toast.success(`تم حفظ القالب "${t.name}"`);
  };
  const delCustomTpl = (id: string) => { persistTpls(customTpls.filter(t => t.id !== id)); toast.info('تم حذف القالب المخصص'); };
  const exportTpl = (t: CustomTpl) => {
    navigator.clipboard?.writeText(JSON.stringify(t.data, null, 2)).then(() => toast.success('تم نسخ JSON القالب — الصقه في أي مكان')).catch(() => toast.error('تعذر النسخ'));
  };
  const importTpl = () => {
    try {
      const data = JSON.parse(importText) as SubscriberCMS;
      if (!data || typeof data !== 'object' || !data.design) throw new Error('bad');
      onChange({ ...resolveCMS(data), templateId: 'imported' });
      setImportText('');
      toast.success('تم استيراد القالب وتطبيقه');
    } catch { toast.error('JSON غير صالح'); }
  };

  // ═══ نسخ تصميم من مشترك ═══
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyFrom, setCopyFrom] = useState('none');
  const [copyStep, setCopyStep] = useState<'pick' | 'mode' | 'partial'>('pick');
  const [copyParts, setCopyParts] = useState<Record<string, boolean>>({ company: true, clientProfile: true, topBar: true, bottomBar: true, sideBar: true, colors: true, texts: true, sections: true, design: true, template: true });
  const COPY_PART_LABELS: Record<string, string> = { company: 'الشركة', clientProfile: 'الملف الشخصي', topBar: 'Top Bar', bottomBar: 'Bottom Bar', sideBar: 'Side Bar', colors: 'الألوان', texts: 'النصوص', sections: 'الأقسام', design: 'التصميم', template: 'القالب' };
  const doCopy = (mode: 'replace' | 'merge') => {
    const src = subscribers.find(s => s.id === copyFrom);
    if (!src) { toast.error('اختر مشتركاً أولاً'); return; }
    const srcC = resolveCMS(src.cms);
    const n: SubscriberCMS = JSON.parse(JSON.stringify(cms));
    const objCopy = (key: keyof SubscriberCMS) => { (n as any)[key] = mode === 'replace' ? JSON.parse(JSON.stringify((srcC as any)[key])) : { ...(n as any)[key], ...(srcC as any)[key] }; };
    if (copyParts.company) objCopy('company');
    if (copyParts.clientProfile) objCopy('clientProfile');
    if (copyParts.topBar) { objCopy('topBar'); (n as any).topBar.customButtons = mode === 'replace' ? [...srcC.topBar.customButtons] : [...(cms.topBar.customButtons || []), ...srcC.topBar.customButtons]; }
    if (copyParts.bottomBar) { objCopy('bottomBar'); (n as any).bottomBar.buttons = mode === 'replace' ? JSON.parse(JSON.stringify(srcC.bottomBar.buttons)) : cms.bottomBar.buttons; }
    if (copyParts.sideBar) { objCopy('sideBar'); (n as any).sideBar.items = mode === 'replace' ? JSON.parse(JSON.stringify(srcC.sideBar.items)) : cms.sideBar.items; }
    if (copyParts.colors) {
      n.design = { ...n.design, colors: mode === 'replace' ? { ...srcC.design.colors } : { ...n.design.colors, ...srcC.design.colors }, darkMode: { ...n.design.darkMode, colors: { ...n.design.darkMode.colors, ...srcC.design.darkMode.colors } } };
    }
    if (copyParts.design) {
      const { colors: _c, darkMode: _d, ...restDesign } = srcC.design;
      n.design = { ...n.design, ...restDesign, background: { ...n.design.background, ...srcC.design.background }, fonts: { ...n.design.fonts, ...srcC.design.fonts }, query: { ...n.design.query, ...srcC.design.query } };
    }
    if (copyParts.texts) n.texts = mode === 'replace' ? JSON.parse(JSON.stringify(srcC.texts)) : [...cms.texts, ...srcC.texts.map(t => ({ ...t, id: uid() }))];
    if (copyParts.sections) n.sections = mode === 'replace' ? JSON.parse(JSON.stringify(srcC.sections)) : [...cms.sections, ...srcC.sections.map(s => ({ ...s, id: uid() }))];
    if (copyParts.template) n.templateId = srcC.templateId;
    onChange(n);
    toast.success(`تم ${mode === 'replace' ? 'استبدال' : 'دمج'} إعدادات التصميم من ${src.name}`);
    setCopyOpen(false); setCopyStep('pick'); setCopyFrom('none');
  };

  // ═══ عناصر افتراضية جديدة ═══
  const mkText = () => ({ id: uid(), title: '', content: '', icon: 'star', color: '#3b82f6', size: 'medium' as const, align: 'right' as const, bgType: 'none' as const, bgValue: '', border: 'none' as const, type: 'normal' as const, location: 'summary' as const, visible: true, expiryDate: '' });
  const mkSec = () => ({ id: uid(), title: '', subtitle: '', icon: 'star', description: '', images: [], imageDisplay: 'single' as const, imageSize: 'medium' as const, videoUrl: '', buttons: [], location: 'home' as const, order: cms.sections.length, collapsible: false, defaultState: 'open' as const, bgColor: '#ffffff', style: 'card' as const, visible: true, dateFrom: '', dateTo: '' });
  const mkCard = () => ({ id: uid(), title: '', value: '', icon: 'wallet', color: '#3b82f6', change: '', sparkline: [], size: 'medium' as const, visible: true, order: cms.infoCards.length });
  const mkChart = () => ({ id: uid(), type: 'line' as const, title: '', dataType: 'profits' as const, period: '30d' as const, colors: ['#3b82f6'], showNumbers: true, size: 'medium' as const, visible: true, order: cms.charts.length });
  const mkCounter = () => ({ id: uid(), value: 0, prefix: '', suffix: '', title: '', icon: 'star', color: '#3b82f6', duration: 2 as const, visible: true, order: cms.counters.length });
  const mkAch = () => ({ id: uid(), name: '', icon: '⭐', color: 'gold' as const, customColor: '', description: '', dateEarned: '', visible: true, order: cms.achievements.length });
  const mkBanner = () => ({ id: uid(), text: '', image: '', url: '', color: '#3b82f6', location: 'top' as const, closable: true, expiryDate: '', visible: true, order: cms.banners.length });
  const mkAlert = () => ({ id: uid(), text: '', type: 'info' as const, icon: 'bell', closable: true, location: 'top' as const, visible: true, order: cms.alerts.length });
  const mkDoc = () => ({ id: uid(), name: '', fileData: '', fileType: '', icon: 'file', size: '', date: '', showDownload: true, visible: true, order: cms.documents.length });
  const mkProg = () => ({ id: uid(), title: '', current: 0, target: 100, color: '#3b82f6', shape: 'linear' as const, visible: true, order: cms.progressBars.length });
  const mkCd = () => ({ id: uid(), title: '', targetDate: '', targetTime: '', color: '#3b82f6', size: 'small' as const, visible: true, order: cms.countdowns.length });

  const tabs: { id: T; label: string; icon: React.ReactNode }[] = [
    { id: 'company', label: 'الشركة', icon: <Building2 size={13} /> }, { id: 'profile', label: 'الملف', icon: <User size={13} /> }, { id: 'topbar', label: 'علوي', icon: <Monitor size={13} /> }, { id: 'bottombar', label: 'سفلي', icon: <Smartphone size={13} /> }, { id: 'sidebar', label: 'جانبي', icon: <Menu size={13} /> }, { id: 'colors', label: 'ألوان', icon: <Palette size={13} /> }, { id: 'texts', label: 'نصوص', icon: <Type size={13} /> }, { id: 'sections', label: 'أقسام', icon: <Layout size={13} /> }, { id: 'cards', label: 'بطاقات', icon: <CreditCard size={13} /> }, { id: 'charts', label: 'رسوم', icon: <BarChart3 size={13} /> }, { id: 'counters', label: 'عدادات', icon: <Timer size={13} /> }, { id: 'achievements', label: 'أوسمة', icon: <Award size={13} /> }, { id: 'banners', label: 'بانرات', icon: <Sparkles size={13} /> }, { id: 'datatable', label: 'جدول', icon: <FileText size={13} /> }, { id: 'map', label: 'خريطة', icon: <MapPin size={13} /> }, { id: 'messages', label: 'رسائل', icon: <MessageSquare size={13} /> }, { id: 'calendar', label: 'تقويم', icon: <Calendar size={13} /> }, { id: 'gallery', label: 'معرض', icon: <Image size={13} /> }, { id: 'alerts', label: 'تنبيهات', icon: <AlertTriangle size={13} /> }, { id: 'docs', label: 'مستندات', icon: <FileDown size={13} /> }, { id: 'progress', label: 'تقدم', icon: <Target size={13} /> }, { id: 'countdown', label: 'عد تنازلي', icon: <Clock size={13} /> }, { id: 'invoice', label: 'فاتورة', icon: <Receipt size={13} /> }, { id: 'templates', label: 'قوالب', icon: <LayoutTemplate size={13} /> }, { id: 'design', label: 'تصميم', icon: <Palette size={13} /> }, { id: 'widgets', label: 'إضافات', icon: <Globe size={13} /> },
  ];

  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div><CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2"><LayoutTemplate size={16} className="text-violet-600" /> استوديو تصميم تطبيق العميل — 28 قسم</CardTitle><CardDescription className="text-[11px] mt-0.5">كل مشترك = تطبيق مستقل. كل شيء اختياري (Toggle).</CardDescription></div>
          <div className="flex items-center gap-2">
            {subscribers.length > 0 && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] border-violet-200 text-violet-700 hover:bg-violet-50" onClick={() => setCopyOpen(!copyOpen)}>
                <Copy size={12} /> نسخ تصميم من مشترك
              </Button>
            )}
            <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[10px]">CMS</Badge>
          </div>
        </div>
        {/* ═══ لوحة نسخ التصميم من مشترك آخر ═══ */}
        {copyOpen && subscribers.length > 0 && (
          <div className="mt-2 p-3 rounded-xl border border-violet-200 bg-violet-50/50 space-y-2">
            {copyStep === 'pick' && (
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={copyFrom} onValueChange={v => { setCopyFrom(v); if (v !== 'none') setCopyStep('mode'); }}>
                  <SelectTrigger className="h-8 text-xs w-56 bg-white"><SelectValue placeholder="اختر المشترك المصدر" /></SelectTrigger>
                  <SelectContent>{subscribers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-[10px] text-slate-500">يُنسخ تصميم CMS فقط — لا تُنسخ البيانات (الاسم، الهاتف، الآيبان...)</span>
              </div>
            )}
            {copyStep === 'mode' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">ماذا تريد النسخ من <span className="text-violet-700">{subscribers.find(s => s.id === copyFrom)?.name}</span>؟</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-xs" onClick={() => { setCopyParts({ company: true, clientProfile: true, topBar: true, bottomBar: true, sideBar: true, colors: true, texts: true, sections: true, design: true, template: true }); doCopy('replace'); }}>نسخ كل الإعدادات</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs border-violet-200" onClick={() => setCopyStep('partial')}>نسخ جزئي…</Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setCopyOpen(false); setCopyStep('pick'); }}>إلغاء</Button>
                </div>
              </div>
            )}
            {copyStep === 'partial' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  {Object.keys(COPY_PART_LABELS).map(k => (
                    <label key={k} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white rounded-lg px-2 py-1.5 border border-slate-200 cursor-pointer">
                      <Checkbox checked={!!copyParts[k]} onCheckedChange={v => setCopyParts(p => ({ ...p, [k]: !!v }))} className="h-3.5 w-3.5" />
                      {COPY_PART_LABELS[k]}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <span className="text-[10px] text-slate-500">إذا كانت الإعدادات الحالية موجودة:</span>
                  <Button size="sm" className="h-7 bg-violet-600 hover:bg-violet-700 text-[11px]" onClick={() => doCopy('merge')}>دمج مع الحالي</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] border-violet-200" onClick={() => doCopy('replace')}>استبدال</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { setCopyOpen(false); setCopyStep('pick'); }}>إلغاء</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={v => setTab(v as T)}>
          <div className="border-b border-slate-100 px-3 overflow-x-auto"><TabsList className="bg-transparent h-auto py-1.5 gap-0.5 justify-start flex-nowrap">{tabs.map(t => <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 data-[state=inactive]:text-slate-500 whitespace-nowrap">{t.icon}{t.label}</TabsTrigger>)}</TabsList></div>
          <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

            {/* 1. الشركة */}
            <TabsContent value="company" className="mt-0 space-y-3">
              <SH icon={<Building2 size={14} className="text-violet-600" />} title="🏢 هوية الشركة" num="1/28" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-600">اسم الشركة</label><Input value={cms.company.name} onChange={e => up('company', { name: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">المختصر</label><Input value={cms.company.shortName} onChange={e => up('company', { shortName: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">الوصف</label><Input value={cms.company.description} onChange={e => up('company', { description: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">الموقع</label><Input value={cms.company.website} onChange={e => up('company', { website: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">البريد</label><Input value={cms.company.email} onChange={e => up('company', { email: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">الهاتف</label><div className="flex gap-1"><Input value={cms.company.phone} onChange={e => up('company', { phone: e.target.value })} className="h-8 text-xs flex-1" /><Button variant="outline" size="sm" className={`h-8 px-2 text-[10px] ${cms.company.whatsappEnabled ? 'bg-green-50 text-green-700' : ''}`} onClick={() => up('company', { whatsappEnabled: !cms.company.whatsappEnabled })}>WA</Button></div></div>
                <div><label className="text-[10px] font-bold text-slate-600">العنوان</label><Input value={cms.company.address} onChange={e => up('company', { address: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">السجل التجاري</label><Input value={cms.company.commercialReg} onChange={e => up('company', { commercialReg: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="flex flex-wrap gap-3 items-end">
                <SingleImageUpload label="الشعار" value={cms.company.logo} onChange={v => up('company', { logo: v })} />
                <SingleImageUpload label="Favicon" value={cms.company.favicon} onChange={v => up('company', { favicon: v })} />
                <SingleImageUpload label="صورة غلاف" value={cms.company.coverImage} onChange={v => up('company', { coverImage: v })} />
              </div>
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-bold text-slate-700 mb-1 block">السوشيال ميديا</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{(['instagram', 'twitter', 'telegram', 'tiktok', 'linkedin', 'snapchat'] as const).map(s => <div key={s}><label className="text-[9px] text-slate-500">{s}</label><Input value={cms.company.social[s]} onChange={e => up('company', { social: { ...cms.company.social, [s]: e.target.value } })} className="h-7 text-[10px]" /></div>)}</div></div>
            </TabsContent>

            {/* 2. الملف الشخصي */}
            <TabsContent value="profile" className="mt-0 space-y-3">
              <SH icon={<User size={14} className="text-violet-600" />} title="👤 الملف الشخصي للعميل" num="2/28" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-600">صورة العميل</label><Select value={cms.clientProfile.avatarType} onValueChange={v => up('clientProfile', { avatarType: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upload">رفع</SelectItem><SelectItem value="auto">تلقائي</SelectItem><SelectItem value="hidden">إخفاء</SelectItem></SelectContent></Select></div>
                {cms.clientProfile.avatarType === 'upload' && <SingleImageUpload label="صورة العميل (Base64)" value={cms.clientProfile.avatarImage} onChange={v => up('clientProfile', { avatarImage: v })} />}
                <div><label className="text-[10px] font-bold text-slate-600">شكل الصورة</label><Select value={cms.clientProfile.avatarShape} onValueChange={v => up('clientProfile', { avatarShape: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="circle">دائرية</SelectItem><SelectItem value="square">مربعة</SelectItem><SelectItem value="rounded">مستديرة</SelectItem></SelectContent></Select></div>
                <div><label className="text-[10px] font-bold text-slate-600">اسم العرض</label><Select value={cms.clientProfile.displayMode} onValueChange={v => up('clientProfile', { displayMode: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="original">الأصلي</SelectItem><SelectItem value="alias">مستعار</SelectItem><SelectItem value="hidden">إخفاء</SelectItem></SelectContent></Select></div>
                {cms.clientProfile.displayMode === 'alias' && <div><label className="text-[10px] font-bold text-slate-600">الاسم المستعار</label><Input value={cms.clientProfile.displayName} onChange={e => up('clientProfile', { displayName: e.target.value })} className="h-8 text-xs" /></div>}
                <div><label className="text-[10px] font-bold text-slate-600">اللقب</label><Input value={cms.clientProfile.title} onChange={e => up('clientProfile', { title: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">رقم العضوية</label><Input value={cms.clientProfile.memberNumber} onChange={e => up('clientProfile', { memberNumber: e.target.value })} className="h-8 text-xs" /></div>
                <div><label className="text-[10px] font-bold text-slate-600">الشارة</label><Select value={cms.clientProfile.badge} onValueChange={v => up('clientProfile', { badge: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">بدون</SelectItem><SelectItem value="vip">⭐ VIP</SelectItem><SelectItem value="premium">🏆 مميز</SelectItem><SelectItem value="platinum">💎 بلاتيني</SelectItem><SelectItem value="founder">🎖️ مؤسس</SelectItem></SelectContent></Select></div>
                <div><label className="text-[10px] font-bold text-slate-600">المستوى</label><Select value={cms.clientProfile.memberLevel} onValueChange={v => up('clientProfile', { memberLevel: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">بدون</SelectItem><SelectItem value="bronze">Bronze</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="platinum">Platinum</SelectItem><SelectItem value="diamond">Diamond</SelectItem></SelectContent></Select></div>
                <div><label className="text-[10px] font-bold text-slate-600">الحالة</label><Select value={cms.clientProfile.statusStyle} onValueChange={v => up('clientProfile', { statusStyle: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">🟢 نشط</SelectItem><SelectItem value="pending">🟡 معلق</SelectItem><SelectItem value="stopped">🔴 موقوف</SelectItem><SelectItem value="new">🔵 جديد</SelectItem></SelectContent></Select></div>
                <div><label className="text-[10px] font-bold text-slate-600">الهاتف</label><Select value={cms.clientProfile.phoneDisplay} onValueChange={v => up('clientProfile', { phoneDisplay: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">كامل</SelectItem><SelectItem value="partial">مخفي جزئياً</SelectItem><SelectItem value="hidden">مخفي</SelectItem></SelectContent></Select></div>
                <div><label className="text-[10px] font-bold text-slate-600">لون الاسم</label><div className="flex gap-1"><input type="color" value={cms.clientProfile.nameColor} onChange={e => up('clientProfile', { nameColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer" /><Input value={cms.clientProfile.nameColor} onChange={e => up('clientProfile', { nameColor: e.target.value })} className="h-8 text-[10px] font-mono flex-1" /></div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2"><Toggle label="إظهار البلد" checked={cms.clientProfile.showCountry} onChange={v => up('clientProfile', { showCountry: v })} /><Toggle label="تاريخ الانضمام" checked={cms.clientProfile.showJoinDate} onChange={v => up('clientProfile', { showJoinDate: v })} /></div>
              <div><label className="text-[10px] font-bold text-slate-600">نص تعريفي</label><Textarea value={cms.clientProfile.personalBio} onChange={e => up('clientProfile', { personalBio: e.target.value })} rows={2} className="text-xs" /></div>
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-bold text-slate-600">خلفية البطاقة</label><div className="flex gap-2 items-center"><Select value={cms.clientProfile.cardBgType} onValueChange={v => up('clientProfile', { cardBgType: v as any })}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="color">لون</SelectItem><SelectItem value="gradient">تدرج</SelectItem><SelectItem value="image">صورة</SelectItem><SelectItem value="transparent">شفافة</SelectItem></SelectContent></Select><Input value={cms.clientProfile.cardBackground} onChange={e => up('clientProfile', { cardBackground: e.target.value })} className="h-8 text-[10px] flex-1 font-mono" /></div></div>
            </TabsContent>

            {/* 3. Top Bar */}
            <TabsContent value="topbar" className="mt-0 space-y-3">
              <SH icon={<Monitor size={14} className="text-violet-600" />} title="📱 Top Bar" num="3/28" />
              <Toggle label="تفعيل" checked={cms.topBar.enabled} onChange={v => up('topBar', { enabled: v })} />
              {cms.topBar.enabled && <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-600">العنوان</label><Input value={cms.topBar.title} onChange={e => up('topBar', { title: e.target.value })} className="h-8 text-xs" /></div>
                  <div><label className="text-[10px] font-bold text-slate-600">فرعي</label><Input value={cms.topBar.subtitle} onChange={e => up('topBar', { subtitle: e.target.value })} className="h-8 text-xs" /></div>
                  <div><label className="text-[10px] font-bold text-slate-600">خلفية</label><div className="flex gap-1"><input type="color" value={cms.topBar.bgColor} onChange={e => up('topBar', { bgColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer" /><Input value={cms.topBar.bgColor} onChange={e => up('topBar', { bgColor: e.target.value })} className="h-8 text-[10px] font-mono flex-1" /></div></div>
                  <div><label className="text-[10px] font-bold text-slate-600">لون النصوص</label><div className="flex gap-1"><input type="color" value={cms.topBar.textColor} onChange={e => up('topBar', { textColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer" /><Input value={cms.topBar.textColor} onChange={e => up('topBar', { textColor: e.target.value })} className="h-8 text-[10px] font-mono flex-1" /></div></div>
                </div>
                {/* إعدادات الشعار والمظهر */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border-t border-slate-100 pt-2">
                  <Sel label="نوع الشعار" value={cms.topBar.logoType} onChange={v => up('topBar', { logoType: v as any })} options={[{ v: 'company', l: 'شعار الشركة' }, { v: 'icon', l: 'أيقونة' }, { v: 'text', l: 'نص' }, { v: 'hidden', l: 'إخفاء' }]} />
                  <Sel label="موقع الشعار" value={cms.topBar.logoPosition} onChange={v => up('topBar', { logoPosition: v as any })} options={[{ v: 'right', l: 'يمين' }, { v: 'left', l: 'يسار' }, { v: 'center', l: 'وسط' }]} />
                  <Sel label="الشفافية" value={cms.topBar.transparency} onChange={v => up('topBar', { transparency: v as any })} options={[{ v: 'solid', l: 'معتم' }, { v: 'transparent', l: 'شفاف' }, { v: 'blur', l: 'ضبابي' }]} />
                  <Sel label="الظل" value={cms.topBar.shadow} onChange={v => up('topBar', { shadow: v as any })} options={[{ v: 'none', l: 'بدون' }, { v: 'light', l: 'خفيف' }, { v: 'strong', l: 'قوي' }]} />
                  <Sel label="الارتفاع" value={cms.topBar.height} onChange={v => up('topBar', { height: v as any })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }]} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-1 border-t border-slate-100 pt-2">
                  <Toggle label="الشعار" checked={cms.topBar.showLogo} onChange={v => up('topBar', { showLogo: v })} /><Toggle label="اسم العميل" checked={cms.topBar.showClientName} onChange={v => up('topBar', { showClientName: v })} /><Toggle label="🔔 إشعارات" checked={cms.topBar.showNotifications} onChange={v => up('topBar', { showNotifications: v })} /><Toggle label="🌙 داكن" checked={cms.topBar.showDarkMode} onChange={v => up('topBar', { showDarkMode: v })} /><Toggle label="🔍 بحث" checked={cms.topBar.showSearch} onChange={v => up('topBar', { showSearch: v })} /><Toggle label="🌐 لغة" checked={cms.topBar.showLanguage} onChange={v => up('topBar', { showLanguage: v })} /><Toggle label="☰ قائمة" checked={cms.topBar.showMenu} onChange={v => up('topBar', { showMenu: v })} /><Toggle label="ثابت" checked={cms.topBar.sticky} onChange={v => up('topBar', { sticky: v })} /><Toggle label="مؤشر التقدم" checked={cms.topBar.showProgress} onChange={v => up('topBar', { showProgress: v })} />
                </div>
                {/* أزرار مخصصة */}
                <div className="border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-slate-700">أزرار مخصصة ({cms.topBar.customButtons.length})</label><Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => up('topBar', { customButtons: [...(cms.topBar.customButtons || []), { id: uid(), label: '', icon: 'star', url: '', color: '#3b82f6' }] })}><Plus size={10} /></Button></div>
                  {(cms.topBar.customButtons || []).map((b, i) => (
                    <div key={b.id} className="flex items-center gap-1 mb-1 p-1 rounded border border-slate-100 bg-slate-50/50">
                      <IconBtn value={b.icon} onChange={v => { const a = [...cms.topBar.customButtons]; a[i] = { ...a[i], icon: v }; up('topBar', { customButtons: a }); }} />
                      <Input value={b.label} onChange={e => { const a = [...cms.topBar.customButtons]; a[i] = { ...a[i], label: e.target.value }; up('topBar', { customButtons: a }); }} placeholder="الاسم" className="h-7 text-[10px] w-20" />
                      <Input value={b.url} onChange={e => { const a = [...cms.topBar.customButtons]; a[i] = { ...a[i], url: e.target.value }; up('topBar', { customButtons: a }); }} placeholder="الرابط" className="h-7 text-[10px] flex-1" dir="ltr" />
                      <input type="color" value={b.color} onChange={e => { const a = [...cms.topBar.customButtons]; a[i] = { ...a[i], color: e.target.value }; up('topBar', { customButtons: a }); }} className="h-7 w-6 rounded cursor-pointer" />
                      <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => up('topBar', { customButtons: cms.topBar.customButtons.filter(x => x.id !== b.id) })}><X size={10} /></Button>
                    </div>
                  ))}
                </div>
              </div>}
            </TabsContent>

            {/* 4. Bottom Bar */}
            <TabsContent value="bottombar" className="mt-0 space-y-3">
              <SH icon={<Smartphone size={14} className="text-violet-600" />} title="⬇️ Bottom Bar" num="4/28" />
              <Toggle label="تفعيل" checked={cms.bottomBar.enabled} onChange={v => up('bottomBar', { enabled: v })} />
              {cms.bottomBar.enabled && <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Sel label="عدد الأزرار" value={String(cms.bottomBar.buttonCount)} onChange={v => up('bottomBar', { buttonCount: Number(v) as any })} options={[{ v: '3', l: '3 أزرار' }, { v: '4', l: '4 أزرار' }, { v: '5', l: '5 أزرار' }]} />
                  <Sel label="الشكل" value={cms.bottomBar.style} onChange={v => up('bottomBar', { style: v as any })} options={[{ v: 'flat', l: 'مسطح' }, { v: 'raised', l: 'بارز' }, { v: 'rounded', l: 'دائري' }, { v: 'glass', l: 'زجاجي' }]} />
                  <Sel label="الظل" value={cms.bottomBar.shadow} onChange={v => up('bottomBar', { shadow: v as any })} options={[{ v: 'none', l: 'بدون' }, { v: 'light', l: 'خفيف' }, { v: 'strong', l: 'قوي' }]} />
                  <div><label className="text-[10px] font-bold text-slate-600">الخلفية</label><div className="flex gap-1"><input type="color" value={cms.bottomBar.bgColor} onChange={e => up('bottomBar', { bgColor: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /><Input value={cms.bottomBar.bgColor} onChange={e => up('bottomBar', { bgColor: e.target.value })} className="h-7 text-[10px] font-mono flex-1" /></div></div>
                </div>
                <Toggle label="إظهار على الديسكتوب" checked={cms.bottomBar.showOnDesktop} onChange={v => up('bottomBar', { showOnDesktop: v })} />
                <div className="border-t border-slate-100 pt-2"><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-slate-700">الأزرار ({cms.bottomBar.buttons.length})</label><Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => up('bottomBar', { buttons: [...cms.bottomBar.buttons, { id: uid(), icon: 'star', label: 'جديد', action: 'home', highlighted: false, color: '#3b82f6', badge: 0, visible: true, order: cms.bottomBar.buttons.length }] })}><Plus size={10} /></Button></div>
                  {cms.bottomBar.buttons.map((b, i) => (
                    <div key={b.id} className="mb-1.5 p-1.5 rounded border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <IconBtn value={b.icon} onChange={v => updBB(i, { icon: v })} />
                        <Input value={b.label} onChange={e => updBB(i, { label: e.target.value })} className="h-7 text-[10px] w-16" />
                        <Sel value={b.action} onChange={v => updBB(i, { action: v })} options={[{ v: 'home', l: 'الرئيسية' }, { v: 'wallet', l: 'المحفظة' }, { v: 'withdraw', l: 'السحب' }, { v: 'profits', l: 'الأرباح' }, { v: 'operations', l: 'العمليات' }, { v: 'account', l: 'الحساب' }, { v: 'custom', l: 'عروض/إضافات' }, { v: 'sidebar', l: 'فتح القائمة' }]} />
                        <input type="color" value={b.color} onChange={e => updBB(i, { color: e.target.value })} className="h-7 w-6 rounded cursor-pointer" />
                        <label className="flex items-center gap-0.5 text-[9px] text-slate-500">شارة<Input type="number" value={b.badge} onChange={e => updBB(i, { badge: Number(e.target.value) })} className="h-7 w-12 text-[10px]" /></label>
                        <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${b.highlighted ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`} onClick={() => updBB(i, { highlighted: !b.highlighted })}>★ مميز</Button>
                        <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${b.visible ? 'text-emerald-600' : 'text-slate-400'}`} onClick={() => updBB(i, { visible: !b.visible })}>{b.visible ? <Eye size={11} /> : <EyeOff size={11} />}</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => up('bottomBar', { buttons: cms.bottomBar.buttons.filter(x => x.id !== b.id) })}><X size={10} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}
            </TabsContent>

            {/* 5. Side Bar */}
            <TabsContent value="sidebar" className="mt-0 space-y-3">
              <SH icon={<Menu size={14} className="text-violet-600" />} title="📌 Side Bar" num="5/28" />
              <Toggle label="تفعيل" checked={cms.sideBar.enabled} onChange={v => up('sideBar', { enabled: v })} />
              {cms.sideBar.enabled && <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Sel label="الموقع" value={cms.sideBar.position} onChange={v => up('sideBar', { position: v as any })} options={[{ v: 'right', l: 'يمين' }, { v: 'left', l: 'يسار' }]} />
                  <Sel label="السلوك" value={cms.sideBar.behavior} onChange={v => up('sideBar', { behavior: v as any })} options={[{ v: 'fixed', l: 'ثابت' }, { v: 'collapsible', l: 'قابل للطي' }, { v: 'press-only', l: 'بالضغط' }]} />
                  <Sel label="الحالة الافتراضية" value={cms.sideBar.defaultState} onChange={v => up('sideBar', { defaultState: v as any })} options={[{ v: 'open', l: 'مفتوح' }, { v: 'closed', l: 'مغلق' }]} />
                  <Sel label="العرض" value={cms.sideBar.width} onChange={v => up('sideBar', { width: v as any })} options={[{ v: 'narrow', l: 'ضيق' }, { v: 'normal', l: 'عادي' }, { v: 'wide', l: 'واسع' }]} />
                  <Sel label="الظل" value={cms.sideBar.shadow} onChange={v => up('sideBar', { shadow: v as any })} options={[{ v: 'none', l: 'بدون' }, { v: 'light', l: 'خفيف' }, { v: 'strong', l: 'قوي' }]} />
                </div>
                <div><label className="text-[10px] font-bold text-slate-600">خلفية القائمة</label><div className="flex gap-1"><input type="color" value={cms.sideBar.bgColor} onChange={e => up('sideBar', { bgColor: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /><Input value={cms.sideBar.bgColor} onChange={e => up('sideBar', { bgColor: e.target.value })} className="h-7 text-[10px] font-mono flex-1" /></div></div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-1 border-t border-slate-100 pt-2">
                  <Toggle label="صورة" checked={cms.sideBar.header.showAvatar} onChange={v => up('sideBar', { header: { ...cms.sideBar.header, showAvatar: v } })} />
                  <Toggle label="اسم" checked={cms.sideBar.header.showName} onChange={v => up('sideBar', { header: { ...cms.sideBar.header, showName: v } })} />
                  <Toggle label="حالة" checked={cms.sideBar.header.showStatus} onChange={v => up('sideBar', { header: { ...cms.sideBar.header, showStatus: v } })} />
                  <Toggle label="رقم العضوية" checked={cms.sideBar.header.showMemberNumber} onChange={v => up('sideBar', { header: { ...cms.sideBar.header, showMemberNumber: v } })} />
                  <Toggle label="إعدادات سريعة" checked={cms.sideBar.header.showSettings} onChange={v => up('sideBar', { header: { ...cms.sideBar.header, showSettings: v } })} />
                </div>
                {/* العناصر */}
                <div className="border-t border-slate-100 pt-2"><div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-slate-700">العناصر ({cms.sideBar.items.length})</label><Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => up('sideBar', { items: [...cms.sideBar.items, { id: uid(), icon: 'star', label: 'عنصر', description: '', action: 'home', badge: 0, color: '', group: '', visible: true, order: cms.sideBar.items.length, separator: false }] })}><Plus size={10} /></Button></div>
                  {cms.sideBar.items.map((it, i) => (
                    <div key={it.id} className="mb-1.5 p-1.5 rounded border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <IconBtn value={it.icon} onChange={v => updSBi(i, { icon: v })} />
                        <Input value={it.label} onChange={e => updSBi(i, { label: e.target.value })} className="h-7 text-[10px] w-16" />
                        <Sel value={it.action} onChange={v => updSBi(i, { action: v })} options={[{ v: 'home', l: 'الرئيسية' }, { v: 'wallet', l: 'المحفظة' }, { v: 'withdraw', l: 'السحب' }, { v: 'profits', l: 'الأرباح' }, { v: 'operations', l: 'العمليات' }, { v: 'account', l: 'الحساب' }, { v: 'settings', l: 'الإعدادات' }, { v: 'docs', l: 'المستندات' }, { v: 'extras', l: 'العروض' }, { v: 'support', l: 'الدعم الفني' }, { v: 'sidebar', l: 'فتح القائمة' }]} />
                        <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${it.visible ? 'text-emerald-600' : 'text-slate-400'}`} onClick={() => updSBi(i, { visible: !it.visible })}>{it.visible ? <Eye size={11} /> : <EyeOff size={11} />}</Button>
                        <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${it.separator ? 'text-amber-600' : 'text-slate-400'}`} onClick={() => updSBi(i, { separator: !it.separator })} title="فاصل بعد العنصر">≡ فاصل</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => up('sideBar', { items: cms.sideBar.items.filter(x => x.id !== it.id) })}><X size={10} /></Button>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Input value={it.description} onChange={e => updSBi(i, { description: e.target.value })} placeholder="وصف فرعي" className="h-6 text-[9px] flex-1 min-w-[100px]" />
                        <label className="flex items-center gap-0.5 text-[9px] text-slate-500">Badge<Input type="number" value={it.badge} onChange={e => updSBi(i, { badge: Number(e.target.value) })} className="h-6 w-12 text-[9px]" /></label>
                        <label className="flex items-center gap-0.5 text-[9px] text-slate-500">لون<input type="color" value={it.color || '#3b82f6'} onChange={e => updSBi(i, { color: e.target.value })} className="h-6 w-6 rounded cursor-pointer" /></label>
                      </div>
                    </div>
                  ))}
                </div>
                {/* الفوتر */}
                <div className="border-t border-slate-100 pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-1"><Toggle label="دعم فني" checked={cms.sideBar.footer.showSupport} onChange={v => up('sideBar', { footer: { ...cms.sideBar.footer, showSupport: v } })} /><Toggle label="خروج" checked={cms.sideBar.footer.showLogout} onChange={v => up('sideBar', { footer: { ...cms.sideBar.footer, showLogout: v } })} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div><label className="text-[10px] font-bold text-slate-600">رابط الدعم (واتساب)</label><Input value={cms.sideBar.footer.supportLink} onChange={e => up('sideBar', { footer: { ...cms.sideBar.footer, supportLink: e.target.value } })} placeholder="https://wa.me/9665..." className="h-7 text-[10px]" dir="ltr" /></div>
                    <div><label className="text-[10px] font-bold text-slate-600">معلومات الإصدار</label><Input value={cms.sideBar.footer.version} onChange={e => up('sideBar', { footer: { ...cms.sideBar.footer, version: e.target.value } })} placeholder="v1.0" className="h-7 text-[10px]" /></div>
                    <div><label className="text-[10px] font-bold text-slate-600">حقوق النشر</label><Input value={cms.sideBar.footer.copyright} onChange={e => up('sideBar', { footer: { ...cms.sideBar.footer, copyright: e.target.value } })} placeholder="جميع الحقوق محفوظة..." className="h-7 text-[10px]" /></div>
                  </div>
                </div>
              </div>}
            </TabsContent>

            {/* 6. الألوان + الوضع الداكن المخصص */}
            <TabsContent value="colors" className="mt-0 space-y-3">
              <SH icon={<Palette size={14} className="text-violet-600" />} title="🎨 الألوان والثيمات" num="6/28" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{(['primary', 'secondary', 'success', 'warning', 'danger', 'bgMain', 'bgCards', 'textMain', 'textSecondary', 'borders'] as const).map(k => { const l: Record<string, string> = { primary: 'الرئيسي', secondary: 'الثانوي', success: 'نجاح', warning: 'تحذير', danger: 'خطر', bgMain: 'خلفية', bgCards: 'بطاقات', textMain: 'نصوص', textSecondary: 'فرعي', borders: 'حدود' }; return <Clr key={k} label={l[k]} value={cms.design.colors[k]} onChange={v => up('design', { colors: { ...cms.design.colors, [k]: v } })} />; })}</div>
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <Toggle label="تفعيل الوضع الداكن" checked={cms.design.darkMode.enabled} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, enabled: v } })} />
                <Toggle label="تبديل تلقائي حسب الوقت (6م → 6ص)" checked={cms.design.darkMode.autoSwitch} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, autoSwitch: v } })} />
                {cms.design.darkMode.enabled && (
                  <div className="mt-2 p-2 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <p className="text-[10px] font-black text-slate-700">🌙 ألوان الوضع الداكن المخصصة</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      <Clr label="الخلفية" value={cms.design.darkMode.colors.bgMain} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, colors: { ...cms.design.darkMode.colors, bgMain: v } } })} />
                      <Clr label="البطاقات" value={cms.design.darkMode.colors.bgCards} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, colors: { ...cms.design.darkMode.colors, bgCards: v } } })} />
                      <Clr label="النصوص" value={cms.design.darkMode.colors.textMain} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, colors: { ...cms.design.darkMode.colors, textMain: v } } })} />
                      <Clr label="النصوص الفرعية" value={cms.design.darkMode.colors.textSecondary} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, colors: { ...cms.design.darkMode.colors, textSecondary: v } } })} />
                      <Clr label="الحدود" value={cms.design.darkMode.colors.borders} onChange={v => up('design', { darkMode: { ...cms.design.darkMode, colors: { ...cms.design.darkMode.colors, borders: v } } })} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 7. النصوص — مع الموقع والأيقونة والتاريخ والمظهر */}
            <TabsContent value="texts" className="mt-0 space-y-3">
              <SH icon={<Type size={14} className="text-violet-600" />} title="✏️ النصوص المخصصة" num="7/28" />
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('texts', mkText())}><Plus size={10} /> إضافة</Button>
              {cms.texts.map((t, i) => (
                <div key={t.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge className={t.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{t.visible ? 'ظاهر' : 'مخفي'}</Badge>
                    <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('texts', i, { visible: !t.visible })}>{t.visible ? <EyeOff size={10} /> : <Eye size={10} />}</Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('texts', t.id)}><X size={10} /></Button></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={t.title} onChange={e => updA('texts', i, { title: e.target.value })} placeholder="عنوان" className="h-7 text-[10px]" />
                    <Sel value={t.type} onChange={v => updA('texts', i, { type: v })} options={[{ v: 'normal', l: 'عادي' }, { v: 'alert', l: 'تنبيه' }, { v: 'success', l: 'نجاح' }, { v: 'danger', l: 'خطر' }, { v: 'info', l: 'معلومة' }]} />
                  </div>
                  <Textarea value={t.content} onChange={e => updA('texts', i, { content: e.target.value })} rows={2} placeholder="{الاسم} {الأرباح} {الرصيد}" className="text-[10px]" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-slate-100 pt-2">
                    <Sel label="الموقع" value={t.location} onChange={v => updA('texts', i, { location: v })} options={[{ v: 'top', l: 'أعلى الصفحة' }, { v: 'summary', l: 'تحت الملخص' }, { v: 'bottom', l: 'أسفل الصفحة' }, { v: 'query', l: 'شاشة الاستعلام' }, { v: 'afterQuery', l: 'بعد الاستعلام' }]} />
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">تاريخ الانتهاء</label><Input type="date" value={t.expiryDate} onChange={e => updA('texts', i, { expiryDate: e.target.value })} className="h-7 text-[10px]" /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">الأيقونة</label><IconBtn value={t.icon} onChange={v => updA('texts', i, { icon: v })} /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">لون الخلفية</label><div className="flex items-center gap-1"><Select value={t.bgType} onValueChange={v => updA('texts', i, { bgType: v })}><SelectTrigger className="h-7 text-[10px] w-16"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">بدون</SelectItem><SelectItem value="color">لون</SelectItem></SelectContent></Select>{t.bgType === 'color' && <input type="color" value={t.bgValue || '#ffffff'} onChange={e => updA('texts', i, { bgValue: e.target.value })} className="h-7 w-7 rounded cursor-pointer" />}</div></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Sel label="الحدود" value={t.border} onChange={v => updA('texts', i, { border: v })} options={[{ v: 'none', l: 'بدون' }, { v: 'edges', l: 'حواف' }, { v: 'frame', l: 'إطار' }]} />
                    <Sel label="الحجم" value={t.size} onChange={v => updA('texts', i, { size: v })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }]} />
                    <Sel label="المحاذاة" value={t.align} onChange={v => updA('texts', i, { align: v })} options={[{ v: 'right', l: 'يمين' }, { v: 'left', l: 'يسار' }, { v: 'center', l: 'وسط' }]} />
                  </div>
                  <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-600">اللون</label><input type="color" value={t.color || '#3b82f6'} onChange={e => updA('texts', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /></div>
                </div>
              ))}
              {cms.texts.length === 0 && <p className="text-center text-xs text-slate-400 py-4">لا توجد نصوص</p>}
            </TabsContent>

            {/* 8. الأقسام — مع كل الحقول */}
            <TabsContent value="sections" className="mt-0 space-y-3">
              <SH icon={<Layout size={14} className="text-violet-600" />} title="📂 الأقسام المخصصة" num="8/28" />
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('sections', mkSec())}><Plus size={10} /> إضافة</Button>
              {cms.sections.map((s, i) => (
                <div key={s.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge className={s.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{s.visible ? 'ظاهر' : 'مخفي'}</Badge>
                    <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('sections', i, { visible: !s.visible })}>{s.visible ? <EyeOff size={10} /> : <Eye size={10} />}</Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('sections', s.id)}><X size={10} /></Button></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={s.title} onChange={e => updA('sections', i, { title: e.target.value })} placeholder="عنوان" className="h-7 text-[10px]" />
                    <Input value={s.subtitle} onChange={e => updA('sections', i, { subtitle: e.target.value })} placeholder="فرعي" className="h-7 text-[10px]" />
                  </div>
                  <Textarea value={s.description} onChange={e => updA('sections', i, { description: e.target.value })} rows={2} className="text-[10px]" />
                  {/* الصور */}
                  <div className="border-t border-slate-100 pt-2 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MultiImageUpload onAdd={urls => updA('sections', i, { images: [...s.images, ...urls] })} />
                      <span className="text-[10px] text-slate-500">{s.images.length} صورة</span>
                    </div>
                    {s.images.length > 0 && <div className="flex flex-wrap gap-1.5">
                      {s.images.map((img, gi) => (
                        <div key={gi} className="relative">
                          <img src={img} className="w-[60px] h-[60px] object-cover rounded-lg border border-slate-200" alt={`img-${gi}`} />
                          <button onClick={() => updA('sections', i, { images: s.images.filter((_, g) => g !== gi) })} className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow"><X size={9} /></button>
                        </div>
                      ))}
                    </div>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Sel label="نوع العرض" value={s.imageDisplay} onChange={v => updA('sections', i, { imageDisplay: v })} options={[{ v: 'single', l: 'صورة واحدة' }, { v: 'grid', l: 'شبكة' }, { v: 'slider', l: 'سلايدر أفقي' }, { v: 'carousel', l: 'كاروسيل' }]} />
                      <Sel label="حجم الصور" value={s.imageSize} onChange={v => updA('sections', i, { imageSize: v })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }, { v: 'fullscreen', l: 'ملء' }]} />
                      <Sel label="الموقع" value={s.location} onChange={v => updA('sections', i, { location: v })} options={[{ v: 'home', l: 'الرئيسية' }, { v: 'separate', l: 'صفحة مستقلة' }, { v: 'sidebar', l: 'صفحة مستقلة' }]} />
                      <Sel label="الشكل" value={s.style} onChange={v => updA('sections', i, { style: v })} options={[{ v: 'card', l: 'بطاقة' }, { v: 'borderless', l: 'بدون حدود' }, { v: 'frame', l: 'إطار' }]} />
                    </div>
                  </div>
                  {/* الفيديو والأزرار */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input value={s.videoUrl} onChange={e => updA('sections', i, { videoUrl: e.target.value })} placeholder="رابط فيديو YouTube" className="h-7 text-[10px]" dir="ltr" />
                    <Sel label="قابل للطي" value={s.collapsible ? 'yes' : 'no'} onChange={v => updA('sections', i, { collapsible: v === 'yes' })} options={[{ v: 'no', l: 'لا' }, { v: 'yes', l: 'نعم' }]} />
                    <Sel label="الحالة الافتراضية" value={s.defaultState} onChange={v => updA('sections', i, { defaultState: v as any })} options={[{ v: 'open', l: 'مفتوح' }, { v: 'closed', l: 'مغلق' }]} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end">
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">لون الخلفية</label><div className="flex gap-1"><input type="color" value={s.bgColor || '#ffffff'} onChange={e => updA('sections', i, { bgColor: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /></div></div>
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">من تاريخ</label><Input type="date" value={s.dateFrom} onChange={e => updA('sections', i, { dateFrom: e.target.value })} className="h-7 text-[10px]" /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">إلى تاريخ</label><Input type="date" value={s.dateTo} onChange={e => updA('sections', i, { dateTo: e.target.value })} className="h-7 text-[10px]" /></div>
                  </div>
                  {/* أزرار القسم */}
                  <div className="border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold text-slate-700">أزرار القسم ({s.buttons.length})</label><Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => { const btns: CustomSectionButton[] = [...s.buttons, { id: uid(), label: '', url: '' }]; updA('sections', i, { buttons: btns }); }}><Plus size={10} /> إضافة زر</Button></div>
                    {s.buttons.map((btn, bi) => (
                      <div key={btn.id} className="flex items-center gap-1 mb-1">
                        <Input value={btn.label} onChange={e => { const btns = [...s.buttons]; btns[bi] = { ...btns[bi], label: e.target.value }; updA('sections', i, { buttons: btns }); }} placeholder="اسم الزر" className="h-7 text-[10px] w-24" />
                        <Input value={btn.url} onChange={e => { const btns = [...s.buttons]; btns[bi] = { ...btns[bi], url: e.target.value }; updA('sections', i, { buttons: btns }); }} placeholder="الرابط" className="h-7 text-[10px] flex-1" dir="ltr" />
                        <input type="color" value={(btn as any).color || '#3b82f6'} onChange={e => { const btns = [...s.buttons]; btns[bi] = { ...btns[bi], color: e.target.value } as any; updA('sections', i, { buttons: btns }); }} className="h-7 w-6 rounded cursor-pointer" />
                        <Button variant="ghost" size="sm" className="h-7 text-red-500" onClick={() => updA('sections', i, { buttons: s.buttons.filter(x => x.id !== btn.id) })}><X size={10} /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {cms.sections.length === 0 && <p className="text-center text-xs text-slate-400 py-4">لا توجد أقسام</p>}
            </TabsContent>

            {/* 9. بطاقات — مع Sparkline */}
            <TabsContent value="cards" className="mt-0 space-y-3">
              <SH icon={<CreditCard size={14} className="text-violet-600" />} title="🃏 بطاقات المعلومات" num="9/28" />
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('infoCards', mkCard())}><Plus size={10} /> إضافة بطاقة</Button>
              {cms.infoCards.map((c, i) => (
                <div key={c.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between">
                    <Badge className={c.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{c.visible ? 'ظاهر' : 'مخفي'}</Badge>
                    <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('infoCards', i, { visible: !c.visible })}>{c.visible ? <EyeOff size={10} /> : <Eye size={10} />}</Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('infoCards', c.id)}><X size={10} /></Button></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Input value={c.title} onChange={e => updA('infoCards', i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" />
                    <Input value={c.value} onChange={e => updA('infoCards', i, { value: e.target.value })} placeholder="القيمة" className="h-7 text-[10px]" />
                    <IconBtn value={c.icon} onChange={v => updA('infoCards', i, { icon: v })} />
                    <input type="color" value={c.color} onChange={e => updA('infoCards', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input value={c.change} onChange={e => updA('infoCards', i, { change: e.target.value })} placeholder="↗ +12%" className="h-7 text-[10px]" />
                    <Sel label="الحجم" value={c.size} onChange={v => updA('infoCards', i, { size: v })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }, { v: 'wide', l: 'عريض' }]} />
                    <div><label className="text-[10px] font-bold text-slate-600">Sparkline (أرقام بفواصل)</label><Input value={c.sparkline.join(',')} onChange={e => updA('infoCards', i, { sparkline: e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) })} placeholder="1200,1500,1800" className="h-7 text-[10px]" dir="ltr" /></div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* 10. الرسوم */}
            <TabsContent value="charts" className="mt-0 space-y-3">
              <SH icon={<BarChart3 size={14} className="text-violet-600" />} title="📊 الرسوم البيانية" num="10/28" />
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('charts', mkChart())}><Plus size={10} /> إضافة</Button>
              {cms.charts.map((ch, i) => (
                <div key={ch.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between">
                    <Badge className={ch.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{ch.visible ? 'ظاهر' : 'مخفي'}</Badge>
                    <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('charts', i, { visible: !ch.visible })}>{ch.visible ? <EyeOff size={10} /> : <Eye size={10} />}</Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('charts', ch.id)}><X size={10} /></Button></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={ch.title} onChange={e => updA('charts', i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" />
                    <Sel value={ch.type} onChange={v => updA('charts', i, { type: v })} options={[{ v: 'line', l: 'خطي' }, { v: 'bar', l: 'أعمدة' }, { v: 'pie', l: 'دائري' }, { v: 'area', l: 'مساحي' }, { v: 'horizontal-bar', l: 'أعمدة أفقية' }]} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Sel label="البيانات" value={ch.dataType} onChange={v => updA('charts', i, { dataType: v })} options={[{ v: 'profits', l: 'الأرباح' }, { v: 'balance', l: 'الرصيد' }, { v: 'operations', l: 'العمليات' }, { v: 'withdrawals', l: 'السحوبات' }, { v: 'custom', l: 'مخصص' }]} />
                    <Sel label="الفترة" value={ch.period} onChange={v => updA('charts', i, { period: v })} options={[{ v: '7d', l: '7 أيام' }, { v: '30d', l: '30 يوم' }, { v: '3m', l: '3 أشهر' }, { v: '1y', l: 'سنة' }, { v: 'all', l: 'الكل' }]} />
                    <Sel label="الحجم" value={ch.size} onChange={v => updA('charts', i, { size: v })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }]} />
                    <div className="flex items-end gap-2"><Toggle label="أرقام" checked={ch.showNumbers} onChange={v => updA('charts', i, { showNumbers: v })} /></div>
                  </div>
                  <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-600">اللون الأساسي</label><input type="color" value={ch.colors[0] || '#3b82f6'} onChange={e => updA('charts', i, { colors: [e.target.value, ...ch.colors.slice(1)] })} className="h-7 w-8 rounded cursor-pointer" /></div>
                </div>
              ))}
            </TabsContent>

            {/* 11. العدادات */}
            <TabsContent value="counters" className="mt-0 space-y-3">
              <SH icon={<Timer size={14} className="text-violet-600" />} title="🔢 العدادات المتحركة" num="11/28" />
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('counters', mkCounter())}><Plus size={10} /> إضافة</Button>
              {cms.counters.map((c, i) => (
                <div key={c.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between">
                    <Badge className={c.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{c.visible ? 'ظاهر' : 'مخفي'}</Badge>
                    <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('counters', i, { visible: !c.visible })}>{c.visible ? <EyeOff size={10} /> : <Eye size={10} />}</Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('counters', c.id)}><X size={10} /></Button></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Input value={c.title} onChange={e => updA('counters', i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" />
                    <Input type="number" value={c.value} onChange={e => updA('counters', i, { value: Number(e.target.value) })} placeholder="القيمة" className="h-7 text-[10px]" />
                    <Input value={c.prefix} onChange={e => updA('counters', i, { prefix: e.target.value })} placeholder="$" className="h-7 text-[10px]" />
                    <Input value={c.suffix} onChange={e => updA('counters', i, { suffix: e.target.value })} placeholder="ر.س" className="h-7 text-[10px]" />
                  </div>
                  <div className="flex items-center gap-2"><IconBtn value={c.icon} onChange={v => updA('counters', i, { icon: v })} /><input type="color" value={c.color} onChange={e => updA('counters', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /></div>
                </div>
              ))}
            </TabsContent>

            {/* 12-23. Quick sections */}
            <TabsContent value="achievements" className="mt-0 space-y-3"><SH icon={<Award size={14} className="text-violet-600" />} title="🏆 الأوسمة" num="12/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('achievements', mkAch())}><Plus size={10} /> إضافة</Button>{cms.achievements.map((a, i) => <div key={a.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={a.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{a.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('achievements', i, { visible: !a.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('achievements', a.id)}><X size={10} /></Button></div></div><div className="grid grid-cols-2 gap-2"><Input value={a.name} onChange={e => updA('achievements', i, { name: e.target.value })} placeholder="الاسم" className="h-7 text-[10px]" /><Input value={a.icon} onChange={e => updA('achievements', i, { icon: e.target.value })} placeholder="🏆" className="h-7 text-[10px]" /><Sel value={a.color} onChange={v => updA('achievements', i, { color: v })} options={[{ v: 'gold', l: 'ذهبي' }, { v: 'silver', l: 'فضي' }, { v: 'bronze', l: 'برونزي' }, { v: 'custom', l: 'مخصص' }]} />{a.color === 'custom' && <input type="color" value={a.customColor || '#3b82f6'} onChange={e => updA('achievements', i, { customColor: e.target.value })} className="h-7 w-8 rounded cursor-pointer" />}<Input value={a.description} onChange={e => updA('achievements', i, { description: e.target.value })} placeholder="الوصف" className="h-7 text-[10px]" /></div></div>)}</TabsContent>

            {/* 13. البانرات — مع صورة ورابط ولون وتاريخ */}
            <TabsContent value="banners" className="mt-0 space-y-3"><SH icon={<Sparkles size={14} className="text-violet-600" />} title="📢 البانرات" num="13/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('banners', mkBanner())}><Plus size={10} /> إضافة</Button>{cms.banners.map((b, i) => <div key={b.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={b.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{b.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('banners', i, { visible: !b.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('banners', b.id)}><X size={10} /></Button></div></div><Input value={b.text} onChange={e => updA('banners', i, { text: e.target.value })} placeholder="نص البانر" className="h-7 text-[10px]" /><SingleImageUpload label="صورة البانر" value={b.image} onChange={v => updA('banners', i, { image: v })} /><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><Sel label="الموقع" value={b.location} onChange={v => updA('banners', i, { location: v })} options={[{ v: 'top', l: 'أعلى' }, { v: 'middle', l: 'وسط' }, { v: 'bottom', l: 'أسفل' }]} /><div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">اللون</label><input type="color" value={b.color} onChange={e => updA('banners', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /></div><div><label className="text-[10px] font-bold text-slate-600 block mb-0.5">ينتهي في</label><Input type="date" value={b.expiryDate} onChange={e => updA('banners', i, { expiryDate: e.target.value })} className="h-7 text-[10px]" /></div><Toggle label="قابل للإغلاق" checked={b.closable} onChange={v => updA('banners', i, { closable: v })} /></div><Input value={b.url} onChange={e => updA('banners', i, { url: e.target.value })} placeholder="رابط المزيد (اختياري)" className="h-7 text-[10px]" dir="ltr" /></div>)}</TabsContent>

            {/* 14. جدول البيانات — أعمدة وألوان وبحث وتصدير */}
            <TabsContent value="datatable" className="mt-0 space-y-3">
              <SH icon={<FileText size={14} className="text-violet-600" />} title="📋 جدول البيانات" num="14/28" />
              <Toggle label="إظهار" checked={cms.dataTable.visible} onChange={v => up('dataTable', { visible: v })} />
              {cms.dataTable.visible && <div className="space-y-2 border-t border-slate-100 pt-3">
                <Input value={cms.dataTable.title} onChange={e => up('dataTable', { title: e.target.value })} placeholder="العنوان" className="h-8 text-xs" />
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">الأعمدة المعروضة</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['العملية', 'المبلغ', 'التاريخ', 'الحالة', 'النوع'].map(col => (
                      <label key={col} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer ${cms.dataTable.columns.includes(col) ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <Checkbox checked={cms.dataTable.columns.includes(col)} onCheckedChange={v => up('dataTable', { columns: v ? [...cms.dataTable.columns, col] : cms.dataTable.columns.filter(c => c !== col) })} className="h-3 w-3" />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Sel label="الترتيب" value={cms.dataTable.sortOrder} onChange={v => up('dataTable', { sortOrder: v as any })} options={[{ v: 'newest', l: 'الأحدث أولاً' }, { v: 'oldest', l: 'الأقدم أولاً' }]} />
                  <Sel label="عدد الصفوف" value={String(cms.dataTable.maxRows)} onChange={v => up('dataTable', { maxRows: Number(v) as any })} options={[{ v: '5', l: '5' }, { v: '10', l: '10' }, { v: '20', l: '20' }, { v: '0', l: 'الكل' }]} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Clr label="لون الرأس" value={cms.dataTable.colors.header} onChange={v => up('dataTable', { colors: { ...cms.dataTable.colors, header: v } })} />
                  <Clr label="لون الصفوف" value={cms.dataTable.colors.rows} onChange={v => up('dataTable', { colors: { ...cms.dataTable.colors, rows: v } })} />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Toggle label="بحث داخل الجدول" checked={cms.dataTable.searchable} onChange={v => up('dataTable', { searchable: v })} />
                  <Sel label="التصدير" value={cms.dataTable.exportable} onChange={v => up('dataTable', { exportable: v as any })} options={[{ v: 'none', l: 'بدون' }, { v: 'pdf', l: 'PDF (طباعة)' }, { v: 'excel', l: 'Excel (CSV)' }]} />
                </div>
              </div>}
            </TabsContent>

            <TabsContent value="map" className="mt-0 space-y-3"><SH icon={<MapPin size={14} className="text-violet-600" />} title="🗺️ الخريطة" num="15/28" /><Toggle label="تفعيل" checked={cms.map.enabled} onChange={v => up('map', { enabled: v })} />{cms.map.enabled && <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><Input value={cms.map.title} onChange={e => up('map', { title: e.target.value })} placeholder="العنوان" className="h-8 text-xs" /><Input value={cms.map.lat} onChange={e => up('map', { lat: e.target.value })} placeholder="خط العرض" className="h-8 text-xs" /><Input value={cms.map.lng} onChange={e => up('map', { lng: e.target.value })} placeholder="خط الطول" className="h-8 text-xs" /><Sel value={cms.map.mapType} onChange={v => up('map', { mapType: v as any })} options={[{ v: 'roadmap', l: 'عادية' }, { v: 'satellite', l: 'أقمار' }]} /><Sel label="الارتفاع" value={cms.map.height} onChange={v => up('map', { height: v as any })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }]} /><Toggle label="إظهار" checked={cms.map.visible !== false} onChange={v => up('map', { visible: v })} /></div>}</TabsContent>

            {/* 16. الرسائل — مع الأولوية والقراءة */}
            <TabsContent value="messages" className="mt-0 space-y-3"><SH icon={<MessageSquare size={14} className="text-violet-600" />} title="💬 الرسائل" num="16/28" /><Toggle label="تفعيل" checked={cms.messages.enabled} onChange={v => up('messages', { enabled: v })} />{cms.messages.enabled && <div className="space-y-2 border-t border-slate-100 pt-3"><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => up('messages', { messages: [...cms.messages.messages, { id: uid(), text: '', date: new Date().toISOString().split('T')[0], read: false, priority: 'normal', sender: 'الإدارة', visible: true }] })}><Plus size={10} /> إضافة</Button>{cms.messages.messages.map((m, i) => <div key={m.id} className="p-2 rounded border border-slate-200 bg-slate-50/50 space-y-1"><div className="flex justify-between items-center"><span className="text-[10px] text-slate-400">{m.date}</span><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-5" onClick={() => updMsg(i, { visible: m.visible !== false })} title="إظهار/إخفاء">{m.visible !== false ? <Eye size={9} /> : <EyeOff size={9} />}</Button><Button variant="ghost" size="sm" className="h-5 text-red-500" onClick={() => up('messages', { messages: cms.messages.messages.filter(x => x.id !== m.id) })}><X size={10} /></Button></div></div><Input value={m.text} onChange={e => updMsg(i, { text: e.target.value })} placeholder="نص الرسالة" className="h-7 text-[10px]" /><div className="grid grid-cols-2 gap-1"><Input value={m.sender} onChange={e => updMsg(i, { sender: e.target.value })} placeholder="المرسل" className="h-7 text-[10px]" /><Sel value={m.priority} onChange={v => updMsg(i, { priority: v })} options={[{ v: 'normal', l: 'عادية' }, { v: 'important', l: 'مهمة' }, { v: 'urgent', l: 'عاجلة' }]} /></div><div className="flex gap-3"><Toggle label="مقروءة" checked={m.read} onChange={v => updMsg(i, { read: v })} /></div></div>)}</div>}</TabsContent>

            {/* 17. التقويم — مع التكرار */}
            <TabsContent value="calendar" className="mt-0 space-y-3"><SH icon={<Calendar size={14} className="text-violet-600" />} title="📅 التقويم" num="17/28" /><Toggle label="تفعيل" checked={cms.calendar.enabled} onChange={v => up('calendar', { enabled: v })} />{cms.calendar.enabled && <div className="space-y-2 border-t border-slate-100 pt-3"><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => up('calendar', { events: [...cms.calendar.events, { id: uid(), type: 'profits', title: '', date: '', time: '', description: '', status: 'upcoming', color: '#3b82f6', repeat: 'once', visible: true }] })}><Plus size={10} /> إضافة موعد</Button>{cms.calendar.events.map((ev, i) => <div key={ev.id} className="p-2 rounded border border-slate-200 bg-slate-50/50 space-y-1"><div className="flex justify-between"><span className="text-[10px] text-slate-400">{ev.date}</span><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-5" onClick={() => updEv(i, { visible: !ev.visible })}>{ev.visible ? <Eye size={9} /> : <EyeOff size={9} />}</Button><Button variant="ghost" size="sm" className="h-5 text-red-500" onClick={() => up('calendar', { events: cms.calendar.events.filter(x => x.id !== ev.id) })}><X size={10} /></Button></div></div><Input value={ev.title} onChange={e => updEv(i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" /><div className="grid grid-cols-2 gap-1"><Input type="date" value={ev.date} onChange={e => updEv(i, { date: e.target.value })} className="h-7 text-[10px]" /><Input type="time" value={ev.time} onChange={e => updEv(i, { time: e.target.value })} className="h-7 text-[10px]" /></div><div className="grid grid-cols-2 gap-1"><Sel label="التكرار" value={ev.repeat} onChange={v => updEv(i, { repeat: v })} options={[{ v: 'once', l: 'مرة واحدة' }, { v: 'weekly', l: 'أسبوعي' }, { v: 'monthly', l: 'شهري' }]} /><label className="flex items-end gap-1 text-[10px] text-slate-500">اللون<input type="color" value={ev.color} onChange={e => updEv(i, { color: e.target.value })} className="h-7 w-7 rounded cursor-pointer" /></label></div>{ev.repeat !== 'once' && <p className="text-[9px] text-slate-400">↻ سيولّد التكرار تلقائياً لمدة 3 أشهر في الداشبورد</p>}</div>)}</div>}</TabsContent>

            {/* 18. المعرض — وصف وتصنيف وحذف لكل صورة */}
            <TabsContent value="gallery" className="mt-0 space-y-3">
              <SH icon={<Image size={14} className="text-violet-600" />} title="📸 معرض الصور" num="18/28" />
              <Toggle label="تفعيل" checked={cms.gallery.enabled} onChange={v => up('gallery', { enabled: v })} />
              {cms.gallery.enabled && <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-3 gap-2"><Sel value={cms.gallery.display} onChange={v => up('gallery', { display: v as any })} options={[{ v: 'grid', l: 'شبكة' }, { v: 'slider', l: 'سلايدر' }, { v: 'masonry', l: 'Masonry' }]} /><Sel value={cms.gallery.size} onChange={v => up('gallery', { size: v as any })} options={[{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }]} /><Toggle label="تكبير" checked={cms.gallery.zoomOnClick} onChange={v => up('gallery', { zoomOnClick: v })} /></div>
                <MultiImageUpload onAdd={urls => up('gallery', { images: [...cms.gallery.images, ...urls.map(src => ({ id: uid(), src, description: '', category: 'other' as const }))] })} />
                <p className="text-[10px] text-slate-500">{cms.gallery.images.length} صورة</p>
                {cms.gallery.images.map((img, i) => (
                  <div key={img.id} className="flex items-center gap-2 p-1.5 rounded border border-slate-200 bg-white">
                    <img src={img.src} className="w-12 h-12 rounded object-cover flex-shrink-0" alt="gallery" />
                    <div className="flex-1 space-y-1">
                      <Input value={img.description} onChange={e => updGal(i, { description: e.target.value })} placeholder="وصف الصورة" className="h-7 text-[10px]" />
                      <Sel value={img.category} onChange={v => updGal(i, { category: v })} options={[{ v: 'personal', l: 'شخصية' }, { v: 'document', l: 'مستند' }, { v: 'other', l: 'أخرى' }]} />
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => up('gallery', { images: cms.gallery.images.filter(x => x.id !== img.id) })}><X size={10} /></Button>
                  </div>
                ))}
              </div>}
            </TabsContent>

            <TabsContent value="alerts" className="mt-0 space-y-3"><SH icon={<AlertTriangle size={14} className="text-violet-600" />} title="🔔 التنبيهات" num="19/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('alerts', mkAlert())}><Plus size={10} /> إضافة</Button>{cms.alerts.map((a, i) => <div key={a.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={a.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{a.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('alerts', i, { visible: !a.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('alerts', a.id)}><X size={10} /></Button></div></div><div className="flex items-center gap-2"><IconBtn value={a.icon} onChange={v => updA('alerts', i, { icon: v })} /><Input value={a.text} onChange={e => updA('alerts', i, { text: e.target.value })} placeholder="نص التنبيه" className="h-7 text-[10px] flex-1" /></div><div className="grid grid-cols-2 gap-2"><Sel value={a.type} onChange={v => updA('alerts', i, { type: v })} options={[{ v: 'info', l: 'معلومة' }, { v: 'success', l: 'نجاح' }, { v: 'warning', l: 'تحذير' }, { v: 'danger', l: 'خطر' }]} /><Sel value={a.location} onChange={v => updA('alerts', i, { location: v })} options={[{ v: 'top', l: 'أعلى' }, { v: 'middle', l: 'وسط' }, { v: 'bottom', l: 'أسفل' }]} /></div><Toggle label="قابل للإغلاق" checked={a.closable} onChange={v => updA('alerts', i, { closable: v })} /></div>)}</TabsContent>

            <TabsContent value="docs" className="mt-0 space-y-3"><SH icon={<FileDown size={14} className="text-violet-600" />} title="📄 المستندات" num="20/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('documents', mkDoc())}><Plus size={10} /> إضافة</Button>{cms.documents.map((d, i) => <div key={d.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={d.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{d.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('documents', i, { visible: !d.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('documents', d.id)}><X size={10} /></Button></div></div><Input value={d.name} onChange={e => updA('documents', i, { name: e.target.value })} placeholder="اسم المستند" className="h-7 text-[10px]" /><div className="flex items-center gap-2"><label className="h-7 px-2 rounded border border-slate-200 text-[10px] cursor-pointer flex items-center gap-1 w-fit hover:bg-slate-50"><Upload size={10} />رفع ملف<input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => updA('documents', i, { fileData: String(r.result || ''), fileType: f.type, size: `${(f.size / 1024).toFixed(1)} KB ${f.type.includes('pdf') ? 'PDF' : ''}` }); r.readAsDataURL(f); } }} /></label>{d.fileData && <span className="text-[9px] text-emerald-600">✓ ملف مرفوع</span>}<Toggle label="زر تحميل" checked={d.showDownload} onChange={v => updA('documents', i, { showDownload: v })} /></div></div>)}</TabsContent>

            <TabsContent value="progress" className="mt-0 space-y-3"><SH icon={<Target size={14} className="text-violet-600" />} title="🎯 أشرطة التقدم" num="21/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('progressBars', mkProg())}><Plus size={10} /> إضافة</Button>{cms.progressBars.map((p, i) => <div key={p.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={p.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{p.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('progressBars', i, { visible: !p.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('progressBars', p.id)}><X size={10} /></Button></div></div><div className="grid grid-cols-2 gap-2"><Input value={p.title} onChange={e => updA('progressBars', i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" /><Input type="number" value={p.current} onChange={e => updA('progressBars', i, { current: Number(e.target.value) })} placeholder="الحالي" className="h-7 text-[10px]" /><Input type="number" value={p.target} onChange={e => updA('progressBars', i, { target: Number(e.target.value) })} placeholder="الهدف" className="h-7 text-[10px]" /><input type="color" value={p.color} onChange={e => updA('progressBars', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /></div><Sel label="الشكل" value={p.shape} onChange={v => updA('progressBars', i, { shape: v })} options={[{ v: 'linear', l: 'خطي' }, { v: 'circular', l: 'دائري' }]} /><div className="flex items-center gap-2"><span className="text-[10px] text-slate-500">{p.target > 0 ? Math.round(p.current / p.target * 100) : 0}%</span><div className="flex-1 h-2 bg-slate-200 rounded-full"><div className="h-full rounded-full" style={{ width: `${Math.min(100, p.target > 0 ? p.current / p.target * 100 : 0)}%`, backgroundColor: p.color }} /></div></div></div>)}</TabsContent>

            <TabsContent value="countdown" className="mt-0 space-y-3"><SH icon={<Clock size={14} className="text-violet-600" />} title="⏱️ العد التنازلي" num="22/28" /><Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => pushA('countdowns', mkCd())}><Plus size={10} /> إضافة</Button>{cms.countdowns.map((c, i) => <div key={c.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"><div className="flex justify-between"><Badge className={c.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'}>{c.visible ? 'ظاهر' : 'مخفي'}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-6" onClick={() => updA('countdowns', i, { visible: !c.visible })}><Eye size={10} /></Button><Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => rmA('countdowns', c.id)}><X size={10} /></Button></div></div><div className="grid grid-cols-2 gap-2"><Input value={c.title} onChange={e => updA('countdowns', i, { title: e.target.value })} placeholder="العنوان" className="h-7 text-[10px]" /><Input type="date" value={c.targetDate} onChange={e => updA('countdowns', i, { targetDate: e.target.value })} className="h-7 text-[10px]" /><Input type="time" value={c.targetTime} onChange={e => updA('countdowns', i, { targetTime: e.target.value })} className="h-7 text-[10px]" /><div className="flex items-end gap-2"><input type="color" value={c.color} onChange={e => updA('countdowns', i, { color: e.target.value })} className="h-7 w-8 rounded cursor-pointer" /><Sel value={c.size} onChange={v => updA('countdowns', i, { size: v })} options={[{ v: 'small', l: 'صغير' }, { v: 'large', l: 'كبير' }]} /></div></div></div>)}</TabsContent>

            {/* 23. الفاتورة — رقم + ختم + طباعة */}
            <TabsContent value="invoice" className="mt-0 space-y-3">
              <SH icon={<Receipt size={14} className="text-violet-600" />} title="🧾 الفاتورة" num="23/28" />
              <Toggle label="تفعيل" checked={cms.invoice.enabled} onChange={v => up('invoice', { enabled: v })} />
              {cms.invoice.enabled && <div className="space-y-2 border-t border-slate-100 pt-3">
                <Toggle label="إظهار الفاتورة في الداشبورد" checked={cms.invoice.visible !== false} onChange={v => up('invoice', { visible: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-600">رقم الفاتورة</label><Input value={cms.invoice.customNumber} onChange={e => up('invoice', { customNumber: e.target.value, autoNumber: false })} placeholder="INV-2024-001" className="h-8 text-xs" dir="ltr" /></div>
                  <div><label className="text-[10px] font-bold text-slate-600">العملة</label><Input value={cms.invoice.currency} onChange={e => up('invoice', { currency: e.target.value })} placeholder="USDT" className="h-8 text-xs" /></div>
                </div>
                <Textarea value={cms.invoice.notes} onChange={e => up('invoice', { notes: e.target.value })} rows={2} placeholder="ملاحظات" className="text-xs" />
                <div className="flex items-center gap-3">
                  <SingleImageUpload label="ختم الشركة" value={cms.invoice.stampImage} onChange={v => up('invoice', { stampImage: v })} />
                  {cms.invoice.stampImage && <img src={cms.invoice.stampImage} className="h-16 object-contain -rotate-6 opacity-90 border border-slate-100 rounded" alt="stamp" />}
                </div>
                <Toggle label="زر تحميل PDF" checked={cms.invoice.showDownload} onChange={v => up('invoice', { showDownload: v })} />
                <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-slate-700">البنود</label><Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => up('invoice', { items: [...cms.invoice.items, { label: '', amount: 0, type: 'credit' }] })}><Plus size={10} /></Button></div>
                {cms.invoice.items.map((it, idx) => <div key={idx} className="flex gap-1 mb-1"><Input value={it.label} onChange={e => updInv(idx, { label: e.target.value })} placeholder="البند" className="h-7 text-[10px] flex-1" /><Input type="number" value={it.amount} onChange={e => updInv(idx, { amount: Number(e.target.value) })} placeholder="المبلغ" className="h-7 text-[10px] w-20" /><Sel value={it.type} onChange={v => updInv(idx, { type: v })} options={[{ v: 'credit', l: '+' }, { v: 'debit', l: '-' }]} /><Button variant="ghost" size="sm" className="h-7 text-red-500" onClick={() => up('invoice', { items: cms.invoice.items.filter((_, j) => j !== idx) })}><X size={10} /></Button></div>)}
              </div>}
            </TabsContent>

            {/* 24. القوالب — جاهزة + مخصصة + استيراد/تصدير */}
            <TabsContent value="templates" className="mt-0 space-y-3">
              <SH icon={<LayoutTemplate size={14} className="text-violet-600" />} title="🎨 القوالب" num="24/28" />
              <p className="text-[10px] text-slate-500">قوالب جاهزة — يمكنك تعديلها بعد التطبيق</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">{CMS_TEMPLATES.map(tpl => <div key={tpl.id} className={`rounded-xl border-2 p-2.5 cursor-pointer transition-all hover:shadow-md ${cms.templateId === tpl.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-300 bg-white'}`}><span className="text-xs font-black text-slate-800">{tpl.name}</span><p className="text-[10px] text-slate-500 mb-2">{tpl.description}</p><div className="flex gap-1 mb-2">{tpl.design?.colors && <><div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: tpl.design.colors.primary }} /><div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: tpl.design.colors.bgMain }} /></>}</div><Button size="sm" className={`w-full h-7 text-[10px] ${cms.templateId === tpl.id ? 'bg-violet-600 hover:bg-violet-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} onClick={() => applyTpl(tpl)}>{cms.templateId === tpl.id ? 'مُطبَّق ✓' : 'تطبيق'}</Button></div>)}</div>

              {/* القوالب المخصصة */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <p className="text-[11px] font-black text-slate-700">💾 القوالب المخصصة</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="اسم القالب الجديد..." className="h-8 text-xs flex-1 min-w-[160px]" />
                  <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs" onClick={saveCustomTpl}><Save size={12} /> حفظ التصميم الحالي كقالب</Button>
                </div>
                {customTpls.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {customTpls.map(t => (
                    <div key={t.id} className={`rounded-xl border-2 p-2.5 transition-all ${cms.templateId === t.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-800 truncate">{t.name}</span>
                        <Badge className="bg-amber-100 text-amber-700 border-none text-[9px]">مخصص</Badge>
                      </div>
                      <p className="text-[9px] text-slate-400 mb-2">{t.createdAt}</p>
                      <div className="flex gap-1 mb-2">{t.data?.design?.colors && <><div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: t.data.design.colors.primary }} /><div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: t.data.design.colors.bgMain }} /></>}</div>
                      <div className="flex gap-1">
                        <Button size="sm" className="flex-1 h-7 text-[10px] bg-violet-600 hover:bg-violet-700" onClick={() => applyTpl(t, true)}>{cms.templateId === t.id ? 'مُطبَّق ✓' : 'تطبيق'}</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => exportTpl(t)} title="تصدير JSON"><Download size={10} /></Button>
                        <Button size="sm" variant="outline" className="h-7 text-red-500" onClick={() => delCustomTpl(t.id)}><Trash2 size={10} /></Button>
                      </div>
                    </div>
                  ))}
                </div>}
                <div className="border-t border-slate-100 pt-2 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1"><Import size={11} /> استيراد قالب (الصق JSON)</p>
                  <Textarea value={importText} onChange={e => setImportText(e.target.value)} rows={3} placeholder='{"design": {...}, "topBar": {...}}' className="text-[10px] font-mono" dir="ltr" />
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={importTpl}>استيراد وتطبيق</Button>
                </div>
              </div>
            </TabsContent>

            {/* 25-27. التصميم */}
            <TabsContent value="design" className="mt-0 space-y-3"><SH icon={<Palette size={14} className="text-violet-600" />} title="🎨 التصميم (25-27)" num="25-27/28" />
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-black text-slate-700 mb-2 block">🔤 الخطوط (25)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><div><label className="text-[9px] text-slate-500">خط العناوين</label><Select value={cms.design.fonts.heading} onValueChange={v => up('design', { fonts: { ...cms.design.fonts, heading: v } })}><SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{['Cairo', 'Tajawal', 'IBM Plex Arabic', 'Rubik', 'Almarai'].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div><div><label className="text-[9px] text-slate-500">خط المحتوى</label><Select value={cms.design.fonts.body} onValueChange={v => up('design', { fonts: { ...cms.design.fonts, body: v } })}><SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{['Cairo', 'Tajawal', 'IBM Plex Arabic', 'Rubik', 'Almarai'].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div><Sel label="الحجم" value={cms.design.fonts.baseSize} onChange={v => up('design', { fonts: { ...cms.design.fonts, baseSize: v as any } })} options={[{ v: 'small', l: 'صغير' }, { v: 'normal', l: 'عادي' }, { v: 'large', l: 'كبير' }]} /><Sel label="السماكة" value={cms.design.fonts.weight} onChange={v => up('design', { fonts: { ...cms.design.fonts, weight: v as any } })} options={[{ v: 'normal', l: 'عادي' }, { v: 'medium', l: 'متوسط' }, { v: 'bold', l: 'عريض' }]} /><Sel label="تباعد الأسطر" value={cms.design.fonts.lineHeight} onChange={v => up('design', { fonts: { ...cms.design.fonts, lineHeight: v as any } })} options={[{ v: 'tight', l: 'ضيق' }, { v: 'normal', l: 'عادي' }, { v: 'wide', l: 'واسع' }]} /><Sel label="الاتجاه" value={cms.design.fonts.direction} onChange={v => up('design', { fonts: { ...cms.design.fonts, direction: v as any } })} options={[{ v: 'rtl', l: 'RTL' }, { v: 'ltr', l: 'LTR' }]} /></div></div>
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-black text-slate-700 mb-2 block">🖼️ الخلفيات (26)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><Sel value={cms.design.background.type} onChange={v => up('design', { background: { ...cms.design.background, type: v as any } })} options={[{ v: 'color', l: 'لون' }, { v: 'gradient', l: 'تدرج' }, { v: 'image', l: 'صورة' }, { v: 'pattern', l: 'نمط' }]} /><input type="color" value={cms.design.background.color} onChange={e => up('design', { background: { ...cms.design.background, color: e.target.value } })} className="h-7 w-full rounded cursor-pointer" /><div className="md:col-span-2"><Input value={cms.design.background.gradient} onChange={e => up('design', { background: { ...cms.design.background, gradient: e.target.value } })} placeholder="CSS gradient" className="h-7 text-[10px] font-mono" dir="ltr" /></div><Input type="number" min={0} max={100} value={cms.design.background.opacity} onChange={e => up('design', { background: { ...cms.design.background, opacity: Number(e.target.value) } })} placeholder="الشفافية %" className="h-7 text-[10px]" /><Input type="number" min={0} max={20} value={cms.design.background.blur} onChange={e => up('design', { background: { ...cms.design.background, blur: Number(e.target.value) } })} placeholder="الضبابية" className="h-7 text-[10px]" /><Toggle label="ثابتة" checked={cms.design.background.fixed} onChange={v => up('design', { background: { ...cms.design.background, fixed: v } })} /></div></div>
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-black text-slate-700 mb-2 block">📱 شاشة الاستعلام (27)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><Sel label="طريقة الاستعلام" value={cms.design.query.method} onChange={v => up('design', { query: { ...cms.design.query, method: v as any } })} options={[{ v: 'phone', l: 'الهاتف' }, { v: 'iban', l: 'الآيبان' }, { v: 'code', l: 'كود' }, { v: 'name', l: 'الاسم' }, { v: 'multi', l: 'متعدد' }]} /><Sel label="شكل الحقل" value={cms.design.query.inputStyle} onChange={v => up('design', { query: { ...cms.design.query, inputStyle: v as any } })} options={[{ v: 'flat', l: 'مسطح' }, { v: 'raised', l: 'بارز' }, { v: 'glass', l: 'زجاجي' }, { v: 'rounded', l: 'حواف مستديرة' }]} /><Sel label="التخطيط" value={cms.design.query.layout} onChange={v => up('design', { query: { ...cms.design.query, layout: v as any } })} options={[{ v: 'dashboard', l: 'داشبورد' }, { v: 'cards', l: 'بطاقات' }, { v: 'list', l: 'قائمة' }]} /><Sel label="الأعمدة" value={String(cms.design.query.grid)} onChange={v => up('design', { query: { ...cms.design.query, grid: Number(v) as any } })} options={[{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }]} /><Input value={cms.design.query.welcomeTitle} onChange={e => up('design', { query: { ...cms.design.query, welcomeTitle: e.target.value } })} placeholder="عنوان الترحيب" className="h-7 text-[10px]" /><Input value={cms.design.query.welcomeDesc} onChange={e => up('design', { query: { ...cms.design.query, welcomeDesc: e.target.value } })} placeholder="نص الترحيب" className="h-7 text-[10px]" /><Input value={cms.design.query.loadingText} onChange={e => up('design', { query: { ...cms.design.query, loadingText: e.target.value } })} placeholder="رسالة التحميل" className="h-7 text-[10px]" /><Input value={cms.design.query.errorText} onChange={e => up('design', { query: { ...cms.design.query, errorText: e.target.value } })} placeholder="رسالة الخطأ" className="h-7 text-[10px]" /><Input value={cms.design.query.successText} onChange={e => up('design', { query: { ...cms.design.query, successText: e.target.value } })} placeholder="رسالة النجاح" className="h-7 text-[10px]" /><div><label className="text-[9px] text-slate-500">لون الزر</label><input type="color" value={cms.design.query.buttonColor} onChange={e => up('design', { query: { ...cms.design.query, buttonColor: e.target.value } })} className="h-7 w-8 rounded cursor-pointer" /></div></div><div className="grid grid-cols-2 gap-1 mt-1"><Toggle label="تصفح بالسحب" checked={cms.design.query.swipeNav} onChange={v => up('design', { query: { ...cms.design.query, swipeNav: v } })} /><Sel label="مؤشرات التنقل" value={cms.design.navIndicators} onChange={v => up('design', { navIndicators: v as any })} options={[{ v: 'dots', l: 'نقاط' }, { v: 'numbers', l: 'أرقام' }, { v: 'progress', l: 'شريط تقدم' }, { v: 'none', l: 'بدون' }]} /></div></div>
              <div className="border-t border-slate-100 pt-2"><label className="text-[10px] font-black text-slate-700 mb-2 block">🎨 إعدادات الداشبورد</label><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><Sel label="التخطيط" value={cms.design.layout} onChange={v => up('design', { layout: v as any })} options={[{ v: 'dashboard', l: 'داشبورد' }, { v: 'cards', l: 'بطاقات' }, { v: 'list', l: 'قائمة' }]} /><Sel label="الأعمدة" value={String(cms.design.grid)} onChange={v => up('design', { grid: Number(v) as any })} options={[{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }]} /><Sel label="نمط البطاقة" value={cms.design.cardStyle} onChange={v => up('design', { cardStyle: v as any })} options={[{ v: 'flat', l: 'مسطح' }, { v: 'shadow', l: 'ظل' }, { v: 'border', l: 'إطار' }, { v: 'glass', l: 'زجاجي' }, { v: 'neumorphism', l: 'نيومورفيزم' }]} /><Sel label="الحواف" value={cms.design.corners} onChange={v => up('design', { corners: v as any })} options={[{ v: 'sharp', l: 'حادة' }, { v: 'slight', l: 'خفيفة' }, { v: 'very-rounded', l: 'مستديرة جداً' }]} /><Sel label="تأثير التحويم" value={cms.design.hoverEffect} onChange={v => up('design', { hoverEffect: v as any })} options={[{ v: 'zoom', l: 'تكبير' }, { v: 'lift', l: 'رفع' }, { v: 'glow', l: 'توهج' }, { v: 'none', l: 'بدون' }]} /><Sel label="حركة الظهور" value={cms.design.animation} onChange={v => up('design', { animation: v as any })} options={[{ v: 'fade', l: 'تلاشي' }, { v: 'slide', l: 'انزلاق' }, { v: 'bounce', l: 'ارتداد' }, { v: 'none', l: 'بدون' }]} /><Sel label="المسافات" value={cms.design.spacing} onChange={v => up('design', { spacing: v as any })} options={[{ v: 'tight', l: 'ضيقة' }, { v: 'normal', l: 'عادية' }, { v: 'wide', l: 'واسعة' }]} /></div></div>
            </TabsContent>

            {/* 28. إضافات */}
            <TabsContent value="widgets" className="mt-0 space-y-3"><SH icon={<Globe size={14} className="text-violet-600" />} title="🧩 عناصر إضافية" num="28/28" /><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><Toggle label="🕐 ساعة" checked={cms.widgets.liveClock} onChange={v => up('widgets', { liveClock: v })} /><Toggle label="📅 هجري" checked={cms.widgets.hijriDate} onChange={v => up('widgets', { hijriDate: v })} /><Toggle label="💱 عملات" checked={cms.widgets.currencyRates} onChange={v => up('widgets', { currencyRates: v })} /><Toggle label="🥇 ذهب" checked={cms.widgets.goldPrice} onChange={v => up('widgets', { goldPrice: v })} /><Toggle label="₿ بتكوين" checked={cms.widgets.btcPrice} onChange={v => up('widgets', { btcPrice: v })} /><Toggle label="🌤️ طقس" checked={cms.widgets.weather} onChange={v => up('widgets', { weather: v })} /><Toggle label="🧮 حاسبة أرباح" checked={cms.widgets.profitCalculator} onChange={v => up('widgets', { profitCalculator: v })} /><Toggle label="📱 QR" checked={cms.widgets.qrCode} onChange={v => up('widgets', { qrCode: v })} /><Toggle label="📰 شريط أخبار" checked={cms.widgets.newsTicker} onChange={v => up('widgets', { newsTicker: v })} /></div>{cms.widgets.newsTicker && <Input value={cms.widgets.newsTickerText} onChange={e => up('widgets', { newsTickerText: e.target.value })} placeholder="نص شريط الأخبار..." className="h-8 text-xs" />}</TabsContent>

          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
