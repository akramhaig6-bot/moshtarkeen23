// ═══════════════════════════════════════════════════════════════
// قسم «بناء تطبيق العميل» — نقطة الدخول (القسمان الأول والثاني)
// حالة فارغة · إنشاء تطبيق فارغ · قوالب جاهزة · استيراد · قائمة التطبيقات
// ═══════════════════════════════════════════════════════════════
import { AppProject } from '@/types/app-builder';
import { Subscriber, Operation } from '@/types';
import { APP_TEMPLATES, createProject, resolveProject } from '@/data/app-builder-defaults';
import { clone, projectStats, RuntimeData, download } from '@/lib/app-builder';
import { useAppBuilderStore, readDraft, clearDraft } from '@/hooks/use-app-builder';
import { subscriberRuntimeData } from '@/lib/app-builder-runtime-data';
import { AppBuilderStudio } from '@/components/app-builder/AppBuilderStudio';
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Hammer, Smartphone, Plus, Package, Upload, Rocket, Trash2, Copy, Pencil, Download,
  Layers, FileText, MessageSquare, Link2, X, CheckCircle2,
} from 'lucide-react';

export function AppBuilderTab({ subscribers, operations, sectionName = 'بناء تطبيق العميل' }: {
  subscribers: Subscriber[];
  operations: Operation[];
  sectionName?: string;
}) {
  const { store, setStore } = useAppBuilderStore();
  const [studioId, setStudioId] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<AppProject | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', shortName: '', description: '', logo: '', favicon: '', brandColor: '#2563eb',
    lang: 'ar' as AppProject['lang'], dir: 'rtl' as AppProject['dir'], timezone: 'Asia/Riyadh',
    currency: 'SAR', themeMode: 'light' as AppProject['themeMode'], subscriberId: '', error: '',
  });

  // استعادة الجلسة غير المحفوظة (16.2)
  useEffect(() => {
    const d = readDraft();
    if (d && !store.projects.some(p => JSON.stringify(p) === JSON.stringify(d))) setDraftPrompt(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projects = store.projects || [];
  const activeProject = studioId ? projects.find(p => p.id === studioId) : null;

  const saveProject = (p: AppProject) => {
    setStore({
      ...store,
      projects: projects.some(x => x.id === p.id) ? projects.map(x => (x.id === p.id ? p : x)) : [...projects, p],
      activeProjectId: p.id,
      lastSavedAt: new Date().toISOString(),
    });
    clearDraft();
  };

  const createBlank = () => {
    if (!form.name.trim()) { setForm(f => ({ ...f, error: 'اسم التطبيق مطلوب' })); return; }
    const p = createProject({
      name: form.name.trim(), shortName: form.shortName, description: form.description,
      logo: form.logo, favicon: form.favicon, brandColor: form.brandColor,
      lang: form.lang, dir: form.dir, timezone: form.timezone, currency: form.currency,
      themeMode: form.themeMode, subscriberId: form.subscriberId || null,
    });
    p.design.primary = form.brandColor;
    saveProject(p);
    setWizard(false);
    setStudioId(p.id);
    setForm(f => ({ ...f, name: '', error: '' }));
  };

  const applyTemplate = (tpl: AppProject) => {
    const p = clone(tpl);
    p.id = Math.random().toString(36).slice(2);
    p.isTemplate = false;
    p.createdAt = new Date().toISOString();
    saveProject(p);
    setShowTemplates(false);
    setStudioId(p.id);
    toast.success(`تم إنشاء تطبيق من قالب «${tpl.name}» ✓`);
  };

  const importFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        if (!parsed?.pages) throw new Error('bad');
        const p = resolveProject(parsed);
        p.id = Math.random().toString(36).slice(2);
        saveProject(p);
        setStudioId(p.id);
        toast.success('تم استيراد التصميم ✓');
      } catch { toast.error('ملف غير صالح — أعد المحاولة'); }
    };
    r.readAsText(f);
  };

  const runtimeData: RuntimeData = useMemo(() => {
    const sub = activeProject?.subscriberId ? subscribers.find(s => s.id === activeProject.subscriberId) : null;
    return subscriberRuntimeData(sub || null, operations);
  }, [activeProject, subscribers, operations]);

  // ═══ الاستوديو ═══
  if (activeProject) {
    return (
      <AppBuilderStudio
        key={activeProject.id}
        initialProject={activeProject}
        onSave={saveProject}
        onExit={() => setStudioId(null)}
        subscribers={subscribers.map(s => ({ id: s.id, name: s.name }))}
        runtimeData={runtimeData}
      />
    );
  }

  // ═══ نقطة الدخول ═══
  return (
    <div className="space-y-6" data-testid="app-builder-tab">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Hammer size={20} />
          </span>
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{sectionName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">صمّم تطبيقاً كاملاً للعميل — صفحات، أشرطة، مكونات، نوافذ، وإجراءات بلا حدود</p>
          </div>
        </div>
        {projects.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setWizard(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs"><Plus size={13} /> تطبيق جديد</Button>
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)} className="gap-1.5 text-xs"><Package size={13} /> قالب جاهز</Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5 text-xs"><Upload size={13} /> استيراد</Button>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="application/json" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importFile(f); e.currentTarget.value = ''; }} />

      {/* الحالة الفارغة */}
      {projects.length === 0 ? (
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="py-16 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Smartphone size={96} className="mx-auto text-slate-300 mb-5" strokeWidth={1.2} />
            </motion.div>
            <h3 className="text-xl font-black text-slate-800 mb-2">ابدأ ببناء تطبيق العميل</h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-7">
              صمّم تطبيقاً كاملاً من الصفر — صفحات، أشرطة، مكونات، نوافذ، وأي شيء تريده بلا حدود
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button onClick={() => setWizard(true)} className="h-11 px-6 gap-2 bg-blue-600 hover:bg-blue-700 font-black"><Plus size={16} /> إنشاء تطبيق فارغ</Button>
              <Button variant="outline" onClick={() => setShowTemplates(true)} className="h-11 px-6 gap-2 font-black"><Package size={16} /> اختر قالباً جاهزاً</Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-11 px-6 gap-2 font-black"><Upload size={16} /> استيراد تصميم موجود</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => {
            const st = projectStats(p);
            const sub = p.subscriberId ? subscribers.find(s => s.id === p.subscriberId) : null;
            return (
              <Card key={p.id} className="border-none shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-1.5" style={{ background: p.brandColor }} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {p.logo
                      ? <img src={p.logo} alt="" className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-200" />
                      : <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: p.brandColor }}><Smartphone size={20} /></span>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-black text-slate-800 truncate">{p.name}</p>
                        {p.published && <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">منشور v{p.version}</Badge>}
                        {p.isTemplate && <Badge className="bg-amber-100 text-amber-700 text-[9px]">قالب عام</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.description || 'بلا وصف'}</p>
                      {sub && <p className="text-[10px] text-blue-600 font-bold mt-0.5">مرتبط بـ {sub.name}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {([[FileText, st.pages, 'صفحة'], [Link2, st.bars, 'شريط'], [MessageSquare, st.modals, 'نافذة'], [Layers, st.components, 'مكون']] as const).map(([Ic, v, l], i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-1.5 text-center">
                        <Ic size={12} className="mx-auto text-slate-400" />
                        <p className="text-xs font-black text-slate-700">{v}</p>
                        <p className="text-[9px] text-slate-400">{l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <Button size="sm" className="flex-1 h-8 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => setStudioId(p.id)}><Pencil size={11} /> تحرير</Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="نسخ"
                      onClick={() => { const c = clone(p); c.id = Math.random().toString(36).slice(2); c.name = `${p.name} — نسخة`; c.published = false; saveProject(c); toast.success('تم النسخ ✓'); }}><Copy size={12} /></Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تصدير"
                      onClick={() => { download(`${p.name}.json`, JSON.stringify(p, null, 2)); toast.success('تم التصدير ✓'); }}><Download size={12} /></Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50" title="حذف"
                      onClick={() => { setStore({ ...store, projects: projects.filter(x => x.id !== p.id) }); toast.success('تم حذف التطبيق'); }}><Trash2 size={12} /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══ نافذة إعدادات التطبيق الأولية ═══ */}
      {wizard && (
        <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setWizard(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-[620px] max-w-[95vw] max-h-[92vh] overflow-y-auto bg-white rounded-2xl p-5 space-y-3" dir="rtl">
            <div className="flex items-center justify-between">
              <p className="text-base font-black text-slate-800">إعدادات التطبيق الأولية</p>
              <button onClick={() => setWizard(false)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم التطبيق *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, error: '' }))}
                placeholder="مثال: تطبيقي المالي" className={`h-9 text-sm ${form.error ? 'border-red-400' : form.name ? 'border-blue-400' : ''}`} />
              {form.error ? <p className="text-[11px] text-red-600 mt-1">{form.error}</p>
                : form.name ? <p className="text-[10px] text-slate-400 mt-1">{form.name.length} حرف</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الاسم المختصر</label>
                <Input value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} className="h-9 text-sm" /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">لون العلامة التجارية</label>
                <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} className="h-9 w-full rounded-lg border border-slate-200" /></div>
            </div>

            <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الوصف</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الشعار</label>
                <div className="flex items-center gap-2">
                  {form.logo && <img src={form.logo} alt="" className="w-9 h-9 rounded object-contain border" />}
                  <input type="file" accept="image/*" className="text-[11px]" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setForm(s => ({ ...s, logo: String(r.result) })); r.readAsDataURL(f); }} />
                </div></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">أيقونة التطبيق</label>
                <div className="flex items-center gap-2">
                  {form.favicon && <img src={form.favicon} alt="" className="w-9 h-9 rounded object-contain border" />}
                  <input type="file" accept="image/*" className="text-[11px]" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setForm(s => ({ ...s, favicon: String(r.result) })); r.readAsDataURL(f); }} />
                </div></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">اللغة الافتراضية *</label>
                <select value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value as AppProject['lang'] }))} className="w-full h-9 rounded-lg border border-slate-200 text-sm px-2 bg-white">
                  <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option>
                </select></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">اتجاه التطبيق *</label>
                <div className="flex gap-1.5">{(['rtl', 'ltr', 'auto'] as const).map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, dir: d }))} className={`flex-1 h-9 rounded-lg text-[11px] font-bold border ${form.dir === d ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{d === 'auto' ? 'تلقائي' : d.toUpperCase()}</button>))}</div></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">المنطقة الزمنية</label>
                <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white">
                  {['Asia/Riyadh', 'Asia/Dubai', 'Africa/Cairo', 'Europe/London', 'UTC'].map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">العملة</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white">
                  {['SAR', 'AED', 'USD', 'EUR', 'EGP', 'USDT'].map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الوضع الافتراضي</label>
                <select value={form.themeMode} onChange={e => setForm(f => ({ ...f, themeMode: e.target.value as AppProject['themeMode'] }))} className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white">
                  <option value="light">فاتح</option><option value="dark">داكن</option><option value="system">حسب النظام</option>
                </select></div>
            </div>

            <div><label className="text-[11px] font-bold text-slate-600 block mb-1">ربط بمشترك (اختياري)</label>
              <select value={form.subscriberId} onChange={e => setForm(f => ({ ...f, subscriberId: e.target.value }))} className="w-full h-9 rounded-lg border border-slate-200 text-sm px-2 bg-white">
                <option value="">— بلا ربط —</option>
                {subscribers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">عند الربط، يظهر التطبيق في الاستعلام لهذا المشترك وتُستبدل المتغيرات ببياناته.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs" onClick={createBlank}>إنشاء التطبيق</Button>
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setWizard(false)}>إلغاء</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ مكتبة القوالب ═══ */}
      {showTemplates && (
        <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-[820px] max-w-[95vw] max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-5" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-black text-slate-800">📦 مكتبة القوالب الجاهزة</p>
              <button onClick={() => setShowTemplates(false)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[...APP_TEMPLATES(), ...(store.templates || [])].map((t, i) => {
                const st = projectStats(t);
                return (
                  <div key={`${t.id}-${i}`} className="rounded-2xl border border-slate-200 p-3 hover:shadow-lg transition-shadow">
                    <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-2">
                      <Smartphone size={30} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-black text-slate-800">{t.name}</p>
                    <p className="text-[11px] text-slate-400 mb-2 line-clamp-2 h-8">{t.description}</p>
                    <p className="text-[10px] text-slate-400 mb-2">{st.pages} صفحة · {st.bars} شريط · {st.modals} نافذة · {st.components} مكون</p>
                    <Button size="sm" className="w-full h-8 text-[11px] bg-blue-600 hover:bg-blue-700" onClick={() => applyTemplate(t)}>استخدام القالب</Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ استعادة الجلسة ═══ */}
      {draftPrompt && (
        <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[440px] bg-white rounded-2xl p-5" dir="rtl">
            <p className="text-base font-black text-slate-800 mb-1">جلسة عمل غير محفوظة</p>
            <p className="text-xs text-slate-500 mb-4">لديك جلسة عمل غير محفوظة على تطبيق «{draftPrompt.name}». هل تريد استعادتها؟</p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
                onClick={() => { saveProject(draftPrompt); setStudioId(draftPrompt.id); setDraftPrompt(null); }}>
                <CheckCircle2 size={13} /> استعادة
              </Button>
              <Button variant="outline" className="flex-1 text-xs" onClick={() => { clearDraft(); setDraftPrompt(null); }}>بدء من جديد</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** زر مختصر يفتح قسم بناء تطبيق العميل — يوضع في نهاية إضافة مشترك و CMS */
export function AppBuilderLaunchButton({ onOpen, count }: { onOpen: () => void; count: number }) {
  return (
    <Card className="border-none shadow-lg ring-1 ring-amber-200/80 overflow-hidden">
      <div className="relative bg-gradient-to-l from-amber-50/90 via-white to-white p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500" />
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0 ring-1 ring-white/50">
          <Hammer size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-black text-slate-800">🏗️ بناء تطبيق العميل</h3>
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black">نظام واجهات بلا حدود</Badge>
            {count > 0 && <Badge variant="outline" className="text-[10px]">{count} تطبيق محفوظ</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-6">
            استوديو كامل لبناء تطبيق العميل من الصفر: صفحات وصفحات فرعية، أشرطة علوية وسفلية وجانبية، مكتبة مكونات ضخمة بتداخل غير محدود،
            نوافذ منبثقة، نظام إجراءات وأشرطة تقدم، ثم معاينة ونشر — ويظهر الناتج في الاستعلام مثل تطبيق CMS تماماً.
          </p>
        </div>
        <Button onClick={onOpen}
          className="h-12 px-6 rounded-2xl gap-2 bg-gradient-to-l from-amber-500 to-orange-600 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-amber-500/30 whitespace-nowrap flex-shrink-0">
          <Rocket size={16} /> فتح بيئة البناء
        </Button>
      </div>
    </Card>
  );
}
