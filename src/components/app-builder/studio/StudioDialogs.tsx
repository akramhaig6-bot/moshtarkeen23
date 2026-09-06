// ═══════════════════════════════════════════════════════════════
// نوافذ الاستوديو (Dialogs) — كلها تتحول إلى Bottom Sheets على الجوال
// بنفس الحقول والخيارات تمامًا كما على الحاسوب، بلا أي نقص
// ═══════════════════════════════════════════════════════════════
import { useStudio } from '@/components/app-builder/studio-engine';
import { AppProject, BarKind, ModalKind } from '@/types/app-builder';
import { BAR_KIND_LABELS, MODAL_KIND_LABELS, MODAL_LIBRARY, slugify } from '@/data/app-builder-defaults';
import { countNodes, countReferences } from '@/lib/app-builder';
import { ChipTabs, Field, Sheet, ToggleRow } from '@/components/app-builder/builder-ui';
import { AppRuntime } from '@/components/app-builder/AppRuntime';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FileText, Link2, MessageSquare, Grid3x3, CheckCircle2, AlertTriangle, XCircle, FlaskConical,
  Smartphone, Tablet, Monitor, Maximize2, X, RotateCcw, Minus, type LucideIcon,
} from 'lucide-react';

// ─────────────── إنشاء / تعديل صفحة ───────────────
export function PageForm() {
  const st = useStudio();
  const { newPage, setNewPage } = st;
  const isEdit = !!newPage.editId;
  const footer = (
    <div className="flex gap-2">
      <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-blue-600 hover:bg-blue-700" onClick={st.submitPage}>{isEdit ? 'حفظ التعديل' : 'إنشاء الصفحة'}</Button>
      <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => st.setNewPage(s => ({ ...s, open: false }))}>إلغاء</Button>
    </div>
  );
  return (
    <Sheet open={newPage.open} onClose={() => st.setNewPage(s => ({ ...s, open: false }))}
      title={isEdit ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'} icon={<FileText size={16} />} widthClass="w-[560px]" footer={footer} bodyClass="p-3 sm:p-4 space-y-3">
      <Field label="اسم الصفحة *">
        <Input value={newPage.name} onChange={e => setNewPage(s => ({ ...s, name: e.target.value, error: '' }))}
          placeholder="مثال: صفحة أرباحي" className={`h-10 text-sm ${newPage.error ? 'border-red-400' : ''}`} />
      </Field>
      {newPage.error && <p className="text-[11px] text-red-600">- {newPage.error}</p>}
      {newPage.name && <p className="text-[10px] text-slate-400">{newPage.name.length} حرف · الرابط: /{slugify(newPage.name)}</p>}

      <Field label="نوع الصفحة *">
        <div className="flex gap-2">
          {([['normal', 'عادية'], ['home', 'رئيسية'], ['sub', 'فرعية']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setNewPage(s => ({ ...s, type: v }))}
              className={`flex-1 h-11 lg:h-8 rounded-xl text-[13px] lg:text-xs font-bold border ${newPage.type === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </Field>
      {newPage.type === 'home' && st.project.pages.some(p => p.isHome && p.id !== newPage.editId) &&
        <p className="text-[11px] text-amber-600">⚠ توجد صفحة رئيسية أخرى — سيتم استبدالها</p>}

      {newPage.type === 'sub' && (
        <Field label="الصفحة الأم *">
          <select value={newPage.parentId} onChange={e => setNewPage(s => ({ ...s, parentId: e.target.value, error: '' }))}
            className="w-full h-11 lg:h-9 rounded-xl border border-slate-200 text-sm px-2 bg-white">
            <option value="">— اختر —</option>
            {st.project.pages.filter(p => p.id !== newPage.editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}

      {!isEdit && (
        <Field label="التخطيط الأولي *" inline={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
            {([['blank', 'فارغة'], ['one', 'عمود'], ['two', 'عمودان'], ['three', '3 أعمدة'], ['grid', 'شبكة 2×2']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setNewPage(s => ({ ...s, layout: v }))}
                className={`h-16 rounded-xl text-[11px] font-bold border flex flex-col items-center justify-center gap-1
                  ${newPage.layout === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                <Grid3x3 size={16} />{l}
              </button>
            ))}
          </div>
        </Field>
      )}

      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-slate-600">لون الخلفية</label>
        <input type="color" value={newPage.bg} onChange={e => setNewPage(s => ({ ...s, bg: e.target.value }))} className="h-10 w-16 rounded-lg border border-slate-200" />
        <span className="text-[11px] font-mono text-slate-400">{newPage.bg}</span>
      </div>
    </Sheet>
  );
}

// ─────────────── معالج إنشاء شريط (3 خطوات) ───────────────
export function BarForm() {
  const st = useStudio();
  const { newBar, setNewBar } = st;
  const footer = (
    <div className="flex gap-2">
      {newBar.step > 1 && <Button variant="outline" className="h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => setNewBar(s => ({ ...s, step: (s.step - 1) as 1 | 2 | 3 }))}>السابق</Button>}
      {newBar.step < 3
        ? <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-emerald-600 hover:bg-emerald-700" disabled={newBar.step === 1 && !newBar.kind} onClick={() => setNewBar(s => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 }))}>التالي</Button>
        : <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-emerald-600 hover:bg-emerald-700" onClick={st.submitBar}>إنشاء الشريط</Button>}
      <Button variant="outline" className="h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => setNewBar(s => ({ ...s, open: false }))}>إلغاء</Button>
    </div>
  );
  return (
    <Sheet open={newBar.open} onClose={() => setNewBar(s => ({ ...s, open: false }))}
      title={`إضافة شريط جديد — الخطوة ${newBar.step}/3`} icon={<Link2 size={16} />} widthClass="w-[600px]" footer={footer} bodyClass="p-3 sm:p-4 space-y-3">
      <div className="flex gap-1.5">
        {[1, 2, 3].map(n => (
          <span key={n} className={`h-1.5 flex-1 rounded-full ${newBar.step >= n ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        ))}
      </div>

      {newBar.step === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(BAR_KIND_LABELS) as [BarKind, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setNewBar(s => ({ ...s, kind: k, name: s.name || l }))}
              className={`p-3 rounded-xl border text-center min-h-[64px] ${newBar.kind === k ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200 hover:bg-slate-50'}`}>
              <Minus size={16} className="mx-auto text-slate-500 mb-1" />
              <p className="text-[12px] font-bold text-slate-700">{l}</p>
            </button>
          ))}
        </div>
      )}

      {newBar.step === 2 && (
        <div className="space-y-2">
          <Field label="يظهر في">
            <div className="flex gap-2">
              {([['all', 'كل الصفحات'], ['selected', 'صفحات محددة']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setNewBar(s => ({ ...s, scope: v }))}
                  className={`flex-1 h-11 lg:h-8 rounded-xl text-[13px] lg:text-xs font-bold border ${newBar.scope === v ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </Field>
          {newBar.scope === 'selected' && (
            <div className="max-h-[40vh] overflow-y-auto overscroll-contain pane-scroll space-y-1 border border-slate-200 rounded-xl p-2">
              {st.project.pages.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-[13px] min-h-10 cursor-pointer">
                  <input type="checkbox" className="accent-emerald-600 w-5 h-5" checked={newBar.pages.includes(p.id)}
                    onChange={e => setNewBar(s => ({ ...s, pages: e.target.checked ? [...s.pages, p.id] : s.pages.filter(x => x !== p.id) }))} />
                  {p.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {newBar.step === 3 && (
        <div className="space-y-2">
          <Field label="اسم الشريط"><Input value={newBar.name} onChange={e => setNewBar(s => ({ ...s, name: e.target.value }))} placeholder="الشريط العلوي الرئيسي" className="h-11 lg:h-9 text-sm" /></Field>
          <Field label="التخطيط الأولي">
            <div className="flex gap-2">
              {([['empty', 'فارغ'], ['template', 'قالب جاهز']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setNewBar(s => ({ ...s, preset: v }))}
                  className={`flex-1 h-11 lg:h-8 rounded-xl text-[13px] lg:text-xs font-bold border ${newBar.preset === v ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </Field>
        </div>
      )}
    </Sheet>
  );
}

// ─────────────── إنشاء نافذة منبثقة ───────────────
export function ModalForm() {
  const st = useStudio();
  const { newModal, setNewModal } = st;
  return (
    <Sheet open={newModal.open} onClose={() => setNewModal(s => ({ ...s, open: false }))} title="إنشاء نافذة منبثقة"
      icon={<MessageSquare size={16} />} widthClass="w-[600px]" bodyClass="p-3 sm:p-4 space-y-3"
      footer={<div className="flex gap-2">
        <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-violet-600 hover:bg-violet-700" onClick={st.submitModal}>إنشاء النافذة</Button>
        <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => setNewModal(s => ({ ...s, open: false }))}>إلغاء</Button>
      </div>}>
      <Field label="اسم النافذة *">
        <Input value={newModal.name} onChange={e => setNewModal(s => ({ ...s, name: e.target.value, error: '' }))}
          placeholder="مثال: نافذة السحب" className={`h-11 lg:h-9 text-sm ${newModal.error ? 'border-red-400' : ''}`} />
      </Field>
      {newModal.error && <p className="text-[11px] text-red-600">- {newModal.error}</p>}

      <Field label="نوع النافذة *" inline={false}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(Object.entries(MODAL_KIND_LABELS) as [ModalKind, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setNewModal(s => ({ ...s, kind: k }))}
              className={`p-2.5 rounded-xl border text-[11px] font-bold min-h-11 ${newModal.kind === k ? 'bg-violet-50 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </Field>

      <Field label="الحجم الأولي *" inline={false}>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {([['sm', 'صغير 400'], ['md', 'متوسط 600'], ['lg', 'كبير 800'], ['xl', 'ضخم 1000'], ['full', 'ملء الشاشة']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setNewModal(s => ({ ...s, size: v }))}
              className={`h-11 rounded-xl text-[11px] font-bold border ${newModal.size === v ? 'bg-violet-50 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </Field>

      <ToggleRow label="قابلة للإغلاق" checked={newModal.closable} onChange={v => setNewModal(s => ({ ...s, closable: v }))} />
    </Sheet>
  );
}

// ─────────────── مكتبة النوافذ الجاهزة ───────────────
export function ModalLibrarySheet() {
  const st = useStudio();
  return (
    <Sheet open={st.showModalLibrary} onClose={() => st.setShowModalLibrary(false)} title="📚 مكتبة النوافذ الجاهزة"
      widthClass="w-[760px]" bodyClass="p-3 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODAL_LIBRARY.map(t => (
          <div key={t.id} className="rounded-xl border border-slate-200 p-3 active:bg-slate-50 lg:hover:shadow-md transition-shadow">
            <div className="h-16 rounded-lg bg-slate-100 flex items-center justify-center mb-2"><MessageSquare size={20} className="text-slate-400" /></div>
            <p className="text-[13px] lg:text-xs font-black text-slate-800">{t.label}</p>
            <p className="text-[11px] text-slate-400 mb-2 leading-5">{t.description}</p>
            <Button size="sm" className="w-full h-10 lg:h-7 text-[11px] bg-violet-600 hover:bg-violet-700"
              onClick={() => { const m = t.build(); st.commit(p => ({ ...p, modals: [...p.modals, m] })); toast.success(`تمت إضافة نافذة ${m.name} ✓`); st.setShowModalLibrary(false); st.setEditingModalId(m.id); }}>
              + إضافة للتطبيق
            </Button>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

// ─────────────── خريطة التطبيق ───────────────
export function SitemapSheet() {
  const st = useStudio();
  const roots = st.project.pages.filter(p => !p.parentId);
  return (
    <Sheet open={st.showSitemap} onClose={() => st.setShowSitemap(false)} title="🗺 خريطة التطبيق" widthClass="w-[820px]" bodyClass="p-3 sm:p-4 space-y-3">
      {roots.map(r => (
        <div key={r.id}>
          <button onClick={() => { st.selectPage(r.id); st.setShowSitemap(false); }}
            className="w-full sm:w-40 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-right hover:shadow-md">
            <p className="text-[13px] font-black text-slate-800">{r.name}</p>
            <p className="text-[10px] text-slate-400">{countNodes(r.nodes)} مكون</p>
          </button>
          <div className="sm:mr-8 mt-2 flex flex-wrap gap-2 border-r-2 border-dashed border-slate-200 pr-3">
            {st.project.pages.filter(p => p.parentId === r.id).map(c => (
              <button key={c.id} onClick={() => { st.selectPage(c.id); st.setShowSitemap(false); }}
                className="flex-1 sm:w-36 sm:flex-none min-h-11 p-2 rounded-lg border border-slate-200 bg-white text-right hover:shadow">
                <p className="text-[12px] font-bold text-slate-700">{c.name}</p>
                <p className="text-[9px] text-slate-400">{countNodes(c.nodes)} مكون</p>
              </button>
            ))}
            {st.project.pages.filter(p => p.parentId === r.id).length === 0 && <p className="text-[10px] text-slate-400 py-1">لا صفحات فرعية</p>}
          </div>
        </div>
      ))}
      {roots.length === 0 && <p className="text-[11px] text-slate-400 text-center py-6">لا توجد صفحات بعد</p>}
    </Sheet>
  );
}

// ─────────────── إعدادات التطبيق (تسعة تبويبات) ───────────────
const SETTINGS_TABS: [string, string][] = [
  ['identity', '📱 الهوية'], ['colors', '🎨 الألوان'], ['fonts', '🔤 الخطوط'],
  ['lang', '🌐 اللغة والاتجاه'], ['mode', '🌗 الوضع'], ['social', '🌍 الروابط'],
  ['contact', '📞 الاتصال'], ['legal', '📄 الوثائق'], ['advanced', '🔧 متقدم'],
];

export function AppSettingsSheet() {
  const st = useStudio();
  const [tab, setTab] = useState('identity');
  const { project, mode } = st;
  const set = (patch: Partial<AppProject>) => st.commit(p => ({ ...p, ...patch }));

  return (
    <Sheet open={st.showAppSettings} onClose={() => st.setShowAppSettings(false)} title="⚙️ إعدادات التطبيق"
      widthClass="w-[900px]" bodyClass="p-0" fillHeight icon={<Link2 size={16} />}
      footer={<div className="flex gap-2">
        <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-blue-600 hover:bg-blue-700" onClick={() => { st.doSave(); st.setShowAppSettings(false); }}>💾 حفظ الإعدادات</Button>
        <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => st.setShowAppSettings(false)}>إلغاء</Button>
      </div>}>
      <div className={mode.isWide ? 'flex min-h-0 h-full' : ''}>
        <div className={mode.isWide
          ? 'w-48 bg-slate-50 border-l border-slate-200 p-2 space-y-1 overflow-y-auto flex-shrink-0'
          : 'sticky top-0 z-10 bg-white/95 backdrop-blur px-3 py-2 border-b border-slate-100'}>
          {mode.isWide
            ? SETTINGS_TABS.map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold ${tab === v ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:bg-white/60'}`}>{l}</button>
            ))
            : <ChipTabs items={SETTINGS_TABS} value={tab} onChange={setTab} size="sm" />}
        </div>

        <div className={mode.isWide ? 'flex-1 min-w-0 p-4 overflow-y-auto pane-scroll thin-scroll space-y-3' : 'p-3 space-y-3'}>
          {tab === 'identity' && <>
            <Field label="اسم التطبيق"><Input value={project.name} onChange={e => set({ name: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="الاسم المختصر"><Input value={project.shortName} onChange={e => set({ shortName: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="الوصف"><textarea value={project.description} onChange={e => set({ description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></Field>
            <Field label="الكلمات المفتاحية"><Input value={project.keywords} onChange={e => set({ keywords: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="رقم الإصدار"><Input value={project.version} onChange={e => set({ version: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="الشعار" inline={false}>
              <div className="flex items-center gap-2 flex-wrap">
                {project.logo && <img src={project.logo} alt="" className="w-10 h-10 rounded object-contain border" />}
                <input type="file" accept="image/*" className="builder-file" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => set({ logo: String(r.result) }); r.readAsDataURL(f); }} />
                {project.logo && <button onClick={() => set({ logo: '' })} className="text-[11px] text-red-500 underline">إزالة</button>}
              </div>
            </Field>
            <Field label="أيقونة التطبيق" inline={false}>
              <div className="flex items-center gap-2 flex-wrap">
                {project.favicon && <img src={project.favicon} alt="" className="w-8 h-8 rounded object-contain border" />}
                <input type="file" accept="image/*" className="builder-file" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => set({ favicon: String(r.result) }); r.readAsDataURL(f); }} />
                {project.favicon && <button onClick={() => set({ favicon: '' })} className="text-[11px] text-red-500 underline">إزالة</button>}
              </div>
            </Field>
            <Field label="لون العلامة"><input type="color" value={project.brandColor} onChange={e => set({ brandColor: e.target.value })} className="h-10 w-20 rounded border" /></Field>
          </>}

          {tab === 'colors' && (Object.entries(project.design).filter(([k]) => k.includes('primary') || k.includes('secondary') || k.includes('success') || k.includes('warning') || k.includes('danger') || k.startsWith('bg') || k.startsWith('text') || k === 'borders') as [string, string][]).map(([k, v]) => (
            <Field key={k} label={k}>
              <div className="flex items-center gap-2">
                <input type="color" value={String(v).startsWith('#') ? String(v) : '#ffffff'} onChange={e => st.commit(p => ({ ...p, design: { ...p.design, [k]: e.target.value } }))} className="h-10 w-16 rounded border" />
                <Input value={String(v)} onChange={e => st.commit(p => ({ ...p, design: { ...p.design, [k]: e.target.value } }))} className="h-10 lg:h-8 text-[12px] font-mono flex-1" />
              </div>
            </Field>
          ))}

          {tab === 'fonts' && <>
            <Field label="خط العناوين"><Input value={project.design.headingFont} onChange={e => st.commit(p => ({ ...p, design: { ...p.design, headingFont: e.target.value } }))} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="خط المحتوى"><Input value={project.design.bodyFont} onChange={e => st.commit(p => ({ ...p, design: { ...p.design, bodyFont: e.target.value } }))} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="الحجم الأساسي"><Input type="number" value={project.design.baseSize} onChange={e => st.commit(p => ({ ...p, design: { ...p.design, baseSize: Number(e.target.value) } }))} className="h-10 lg:h-8 text-sm" /></Field>
          </>}

          {tab === 'lang' && <>
            <Field label="اللغة الافتراضية">
              <select value={project.lang} onChange={e => set({ lang: e.target.value as AppProject['lang'] })} className="h-11 lg:h-9 rounded-xl border border-slate-200 text-sm px-2 w-full bg-white">
                <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option>
              </select>
            </Field>
            <Field label="الاتجاه">
              <div className="flex gap-2">{(['rtl', 'ltr', 'auto'] as const).map(d => (
                <button key={d} onClick={() => set({ dir: d })} className={`flex-1 h-11 lg:h-8 rounded-xl text-[13px] lg:text-xs font-bold border ${project.dir === d ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{d.toUpperCase()}</button>))}</div>
            </Field>
            <Field label="المنطقة الزمنية"><Input value={project.timezone} onChange={e => set({ timezone: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
            <Field label="العملة"><Input value={project.currency} onChange={e => set({ currency: e.target.value })} className="h-10 lg:h-8 text-sm" /></Field>
          </>}

          {tab === 'mode' && (
            <Field label="الوضع الافتراضي">
              <div className="flex gap-2">{([['light', 'فاتح'], ['dark', 'داكن'], ['system', 'حسب النظام']] as const).map(([v, l]) => (
                <button key={v} onClick={() => set({ themeMode: v })} className={`flex-1 h-11 lg:h-8 rounded-xl text-[13px] lg:text-xs font-bold border ${project.themeMode === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>))}</div>
            </Field>
          )}

          {tab === 'social' && (Object.keys(project.social) as (keyof AppProject['social'])[]).map(k => (
            <Field key={k} label={k}><Input value={project.social[k]} onChange={e => set({ social: { ...project.social, [k]: e.target.value } })} className="h-10 lg:h-8 text-sm" /></Field>
          ))}

          {tab === 'contact' && (Object.keys(project.contact) as (keyof AppProject['contact'])[]).map(k => (
            <Field key={k} label={k}><Input value={project.contact[k]} onChange={e => set({ contact: { ...project.contact, [k]: e.target.value } })} className="h-10 lg:h-8 text-sm" /></Field>
          ))}

          {tab === 'legal' && <>
            <Field label="الشروط والأحكام" inline={false}><textarea value={project.legal.terms} onChange={e => set({ legal: { ...project.legal, terms: e.target.value } })} rows={5} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></Field>
            <Field label="سياسة الخصوصية" inline={false}><textarea value={project.legal.privacy} onChange={e => set({ legal: { ...project.legal, privacy: e.target.value } })} rows={5} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></Field>
          </>}

          {tab === 'advanced' && <>
            <Field label="ربط بمشترك">
              <select value={project.subscriberId || ''} onChange={e => set({ subscriberId: e.target.value || null })} className="h-11 lg:h-9 rounded-xl border border-slate-200 text-sm px-2 w-full bg-white">
                <option value="">— بلا ربط (قالب عام) —</option>
                {st.subscribers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <ToggleRow label="قالب لكل المشتركين" checked={project.isTemplate} onChange={v => set({ isTemplate: v })} />
            <p className="text-[11px] text-slate-400">معرّف المشروع: {project.id}</p>
          </>}
        </div>
      </div>
    </Sheet>
  );
}

const DEVICE_ICONS: [number, LucideIcon][] = [
  [0, Maximize2], [375, Smartphone], [768, Tablet], [1280, Monitor],
];

// ─────────────── المعاينة بملء الشاشة ───────────────
export function PreviewOverlay() {
  const st = useStudio();
  const { mode } = st;
  const [pDevice, setPDevice] = useState<number>(st.device || 375);
  const [tick, setTick] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [fit, setFit] = useState(true);
  const deviceW = pDevice === 0 ? Math.max(320, mode.vw - 16) : pDevice;
  const scale = fit ? Math.min(1, Math.max(0.35, (mode.vw - (mode.isWide ? 96 : 14)) / deviceW)) : 1;
  // ارتفاع الإطار: يستغل المساحة المتاحة تحت الشريط العلوي وفوق شريط الحالة
  const frameH = Math.max(280, Math.round((mode.vh - (mode.isWide ? 150 : 130)) / (mode.isWide ? 1 : 1)));

  if (!st.showPreview) return null;
  return (
    <div className="fixed inset-0 z-[150] bg-slate-900 flex flex-col" dir="rtl" data-testid="builder-preview">
      <div className="bg-slate-800 text-white flex-shrink-0 pt-[env(safe-area-inset-top,0px)]">
        <div className="min-h-12 flex items-center gap-1.5 px-2 lg:px-3">
          <button onClick={() => st.setShowPreview(false)} className="h-10 lg:h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[12px] font-black inline-flex items-center gap-1.5 flex-shrink-0">
            ← رجوع للتحرير
          </button>
          <div className="flex-1 flex justify-start lg:justify-center gap-1 overflow-x-auto no-scrollbar py-1">
            {DEVICE_ICONS.map(([w, Ic]) => (
              <button key={w} onClick={() => setPDevice(w)}
                className={`h-9 lg:h-8 px-2.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 flex-shrink-0 ${pDevice === w ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/10'}`}>
                <Ic size={12} /> {w === 0 ? 'تلقائي' : w}
              </button>
            ))}
            <button onClick={() => setFit(f => !f)} className={`h-9 lg:h-8 px-2.5 rounded-xl text-[11px] font-bold flex-shrink-0 ${fit ? 'bg-sky-500 text-white' : 'text-white/70 hover:bg-white/10'}`}>ملاءمة</button>
          </div>
          <button onClick={() => setTestMode(t => !t)} className={`h-9 lg:h-8 px-2.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 flex-shrink-0 ${testMode ? 'bg-amber-500 text-white' : 'text-white/70 hover:bg-white/10'}`}>
            <FlaskConical size={12} /><span className="hidden sm:inline">وضع الاختبار</span><span className="sm:hidden">اختبار</span>
          </button>
          <button onClick={() => setTick(t => t + 1)} className="h-9 w-9 lg:w-auto lg:px-2.5 lg:h-8 rounded-xl text-white/70 hover:bg-white/10 flex items-center justify-center flex-shrink-0" title="إعادة تحميل"><RotateCcw size={13} /></button>
          <button onClick={() => st.setShowPreview(false)} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center flex-shrink-0"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto pane-scroll p-1.5 sm:p-2 lg:p-6 flex justify-center items-start">
        <div key={tick} className="bg-white rounded-[24px] lg:rounded-[28px] shadow-2xl overflow-hidden ring-2 lg:ring-8 ring-slate-700 relative flex-shrink-0"
          style={{ width: Math.round(deviceW * scale), height: frameH }}>
          <div className="absolute top-0 left-0 origin-top-left"
            style={{ width: deviceW, height: Math.round(frameH / scale), transform: scale !== 1 ? `scale(${scale})` : undefined }}>
            <AppRuntime project={st.project} data={st.runtimeData} device={deviceW} />
          </div>
        </div>
      </div>

      {testMode && (
        <div className="min-h-10 bg-amber-500/90 text-white text-[11px] font-bold flex items-center px-3 lg:px-4 py-1 flex-shrink-0">
          🧪 وضع الاختبار — كل تفاعل يعمل فعلياً · المتغيرات تُستبدل ببيانات {st.runtimeData.name}
        </div>
      )}
      <div className="bg-slate-800 text-white/60 text-[10px] flex items-center justify-center px-3 py-1.5 flex-shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
        💡 المتغيرات تعرض بيانات المشترك المرتبط — إن لم يوجد، تُعرض بيانات تجريبية
      </div>
    </div>
  );
}

// ─────────────── النشر ───────────────
export function PublishSheet() {
  const st = useStudio();
  const [version, setVersion] = useState(st.bumpVersion(st.project.version));
  const [notes, setNotes] = useState('');
  const [scope, setScope] = useState<'subscriber' | 'template'>(st.project.subscriberId ? 'subscriber' : 'template');
  const [subId, setSubId] = useState(st.project.subscriberId || '');
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const steps = ['جارٍ التحقق من التصميم…', 'جارٍ تجهيز الأصول…', 'جارٍ إنشاء نسخة نهائية…', 'جارٍ التطبيق للمشترك…'];

  const start = () => {
    setPublishing(true);
    setProgress(0);
    const iv = setInterval(() => setProgress(p => {
      const n = Math.min(100, p + 4);
      if (n >= 100) { clearInterval(iv); st.doPublish(version, notes, scope, subId); }
      return n;
    }), 60);
  };

  return (
    <Sheet open={st.showPublish} onClose={() => !publishing && st.setShowPublish(false)} title="🚀 نشر التطبيق"
      widthClass="w-[680px]" bodyClass="p-3 sm:p-4 space-y-4"
      footer={<div className="space-y-1.5">
        <div className="flex gap-2">
          <Button disabled={st.hasErrors || publishing} className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-emerald-600 hover:bg-emerald-700" onClick={start}>🚀 نشر الآن</Button>
          <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => { st.doSave(); st.setShowPublish(false); toast.success('تم حفظ المسودة'); }}>💾 حفظ كمسودة</Button>
          <Button variant="outline" className="h-11 lg:h-9 text-[13px] lg:text-xs" disabled={publishing} onClick={() => st.setShowPublish(false)}>إلغاء</Button>
        </div>
        {st.hasErrors && <p className="text-[11px] text-red-600 leading-5">يوجد أخطاء يجب إصلاحها قبل النشر (أزرار بلا إجراء أو بلا صفحة رئيسية).</p>}
      </div>}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {([['الصفحات', st.stats.pages], ['الأشرطة', st.stats.bars], ['النوافذ', st.stats.modals], ['المكونات', st.stats.components], ['الحجم KB', st.stats.assetsKB]] as const).map(([l, v]) => (
          <div key={l} className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center">
            <p className="text-[10px] text-slate-400 font-bold">{l}</p><p className="text-base font-black text-slate-800">{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 p-3 space-y-1.5 max-h-[40vh] overflow-y-auto overscroll-contain pane-scroll">
        <p className="text-[12px] font-black text-slate-700 mb-1">التحقق قبل النشر</p>
        {st.checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px]">
            {c.level === 'ok' ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : c.level === 'warn' ? <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />}
            <span className={c.level === 'error' ? 'text-red-700 font-bold' : 'text-slate-600'}>{c.text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="الإصدار"><Input value={version} onChange={e => setVersion(e.target.value)} className="h-11 lg:h-8 text-sm" /></Field>
        <Field label="نطاق النشر">
          <select value={scope} onChange={e => setScope(e.target.value as 'subscriber' | 'template')} className="w-full h-11 lg:h-8 rounded-xl border border-slate-200 text-sm px-2 bg-white">
            <option value="subscriber">للمشترك الحالي فقط</option><option value="template">كقالب لكل المشتركين</option>
          </select>
        </Field>
      </div>
      {scope === 'subscriber' && (
        <Field label="المشترك">
          <select value={subId} onChange={e => setSubId(e.target.value)} className="w-full h-11 lg:h-8 rounded-xl border border-slate-200 text-sm px-2 bg-white">
            <option value="">— اختر مشتركاً —</option>{st.subscribers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="ملاحظات الإصدار" inline={false}>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      </Field>

      {publishing && (
        <div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-[11px] text-slate-500 mt-1.5">{steps[Math.min(steps.length - 1, Math.floor(progress / 25))]} ({Math.round(progress)}%)</p>
        </div>
      )}
    </Sheet>
  );
}

// ─────────────── تأكيد الحذف ───────────────
export function DeleteSheet() {
  const st = useStudio();
  const t = st.deleteTarget;
  if (!t) return null;
  let title = 'تأكيد الحذف';
  let body = 'هل تريد الحذف؟ هذا الإجراء لا يمكن التراجع عنه.';
  const warnings: string[] = [];
  let blocked = false;

  if (t.kind === 'page') {
    const pg = st.project.pages.find(p => p.id === t.id);
    const kids = st.project.pages.filter(p => p.parentId === t.id);
    const refs = countReferences(st.project, 'openPage', t.id);
    title = 'حذف الصفحة';
    body = `هل تريد حذف صفحة "${pg?.name}"؟ سيتم حذف جميع المكونات والصفحات الفرعية المرتبطة بها.`;
    if (kids.length) warnings.push(`⚠ سيتم حذف ${kids.length} صفحة فرعية أيضاً`);
    if (refs) warnings.push(`⚠ يوجد ${refs} زر يشير لهذه الصفحة — ستصبح روابط معطّلة`);
    if (st.project.pages.length <= 1) { warnings.push('⚠ لا يمكن حذف آخر صفحة — أنشئ صفحة جديدة أولاً'); blocked = true; }
  }
  if (t.kind === 'bar') {
    const b = st.project.bars.find(x => x.id === t.id);
    title = 'حذف الشريط';
    body = `هل تريد حذف شريط "${b?.name}"؟`;
    if (b?.nodes.length) warnings.push(`⚠ الشريط يحوي ${countNodes(b.nodes)} مكون`);
  }
  if (t.kind === 'modal') {
    const m = st.project.modals.find(x => x.id === t.id);
    const refs = countReferences(st.project, 'openModal', m.id);
    title = 'حذف النافذة';
    body = `هل تريد حذف نافذة "${m?.name}"؟`;
    if (refs) warnings.push(`⚠ هذه النافذة تُفتح من ${refs} زر — ستصبح تلك الأزرار بدون إجراء`);
  }
  if (t.kind === 'node') { title = 'حذف المكون'; body = 'سيتم حذف المكون وكل ما بداخله.'; }

  return (
    <Sheet open={!!t} onClose={() => st.setDeleteTarget(null)} title={title} widthClass="w-[480px]" bodyClass="p-3 sm:p-4 space-y-2"
      footer={<div className="flex gap-2">
        <Button disabled={blocked} className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-red-600 hover:bg-red-700" onClick={st.confirmDelete}>حذف</Button>
        <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => st.setDeleteTarget(null)}>إلغاء</Button>
      </div>}>
      <p className="text-[13px] lg:text-xs text-slate-500 leading-6">{body}</p>
      {warnings.map((w, i) => <p key={i} className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-2 leading-5">{w}</p>)}
    </Sheet>
  );
}

// ─────────────── تأكيد الخروج ───────────────
export function ExitSheet() {
  const st = useStudio();
  return (
    <Sheet open={st.showExitConfirm} onClose={() => st.setShowExitConfirm(false)} title="لديك تغييرات غير محفوظة"
      subtitle="إذا خرجت الآن، ستفقد التغييرات غير المحفوظة" widthClass="w-[460px]" bodyClass="p-4"
      footer={<div className="flex flex-col sm:flex-row gap-2">
        <Button className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs bg-blue-600 hover:bg-blue-700" onClick={() => { st.doSave(); st.onExit(); }}>حفظ ثم خروج</Button>
        <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs text-red-600 border-red-200" onClick={st.onExit}>خروج بدون حفظ</Button>
        <Button variant="outline" className="flex-1 h-11 lg:h-9 text-[13px] lg:text-xs" onClick={() => st.setShowExitConfirm(false)}>إلغاء</Button>
      </div>}>
      <p className="text-[12px] text-slate-500 leading-6">يمكنك أيضًا العودة للشريط العلوي والضغط على «حفظ» في أي وقت.</p>
    </Sheet>
  );
}
