// ═══════════════════════════════════════════════════════════════
// لوحة الخصائص (القسم 3.4 + العاشر + الحادي عشر)
// على الحاسوب: أقسام قابلة للطي (Accordions) — كما هي.
// على الجوال: تبويبات أفقية + حقول كبيرة اللمس، بنفس الحقول تمامًا.
// لا يوجد أي حقل محذوف أو مخفي — فقط إعادة تنظيم للعرض.
// ═══════════════════════════════════════════════════════════════
import { AppBar, AppModal, AppNode, AppPage, AppProject, NodeStyle } from '@/types/app-builder';
import { COMPONENTS_BY_TYPE, BAR_KIND_LABELS, MODAL_KIND_LABELS } from '@/data/app-builder-defaults';
import { nodePath } from '@/lib/app-builder';
import { ChipTabs, Field, Row, ToggleRow, useBuilderMode } from '@/components/app-builder/builder-ui';
import { useState } from 'react';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Zap, Copy, Trash2, Save } from 'lucide-react';

interface SectionDef { id: string; title: string; icon: string; content: React.ReactNode }

// ─────────── قسم قابل للطي (سطح المكتب) ───────────
function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-3 lg:py-2.5 hover:bg-slate-50 min-h-11 lg:min-h-0">
        <span className="text-[12px] lg:text-xs font-black text-slate-700">{icon} {title}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

/** عرض الأقسام: تبويبات على الجوال، أكورديون على الحاسوب */
function Sections({ sections, tabsMode }: { sections: SectionDef[]; tabsMode: boolean }) {
  const [tab, setTab] = useState(sections[0]?.id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  if (!tabsMode) {
    return (
      <>
        {sections.map((s, i) => (
          <Section key={s.id} title={s.title} icon={s.icon} defaultOpen={i === 0 || expanded[s.id]}>{s.content}</Section>
        ))}
      </>
    );
  }
  const active = sections.find(s => s.id === tab) || sections[0];
  return (
    <>
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-2 py-2">
        <ChipTabs items={sections.map(s => [s.id, `${s.icon} ${s.title}`] as [string, string])} value={active?.id} onChange={setTab} />
      </div>
      <div className="p-3 space-y-2.5">{active?.content}</div>
    </>
  );
}

// ─────────── حقول مشتركة ───────────
function Num({ value, onChange, min, max, step = 1 }: { value?: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(min ?? -9999, (value ?? 0) - (step === 0.05 ? 0.05 : step === 0.1 ? 0.1 : step)))}
        className="tap h-9 w-9 lg:h-7 lg:w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black inline-flex items-center justify-center" aria-label="إنقاص">−</button>
      <Input type="number" value={value ?? ''} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))}
        className="h-9 lg:h-7 text-[13px] lg:text-[11px] text-center" />
      <button type="button" onClick={() => onChange(Math.min(max ?? 9999, (value ?? 0) + (step === 0.05 ? 0.05 : step === 0.1 ? 0.1 : step)))}
        className="tap h-9 w-9 lg:h-7 lg:w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black inline-flex items-center justify-center" aria-label="زيادة">+</button>
    </div>
  );
}

function Txt({ value, onChange, placeholder }: { value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return <Input value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-9 lg:h-7 text-[13px] lg:text-[11px]" />;
}

function Sel({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full h-9 lg:h-7 rounded-lg border border-slate-200 text-[13px] lg:text-[11px] px-1.5 bg-white">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function Color({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <input type="color" value={value && value.startsWith('#') ? value : '#ffffff'} onChange={e => onChange(e.target.value)}
        className="h-9 w-12 lg:h-7 lg:w-9 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" aria-label="لون" />
      <Input value={value ?? ''} onChange={e => onChange(e.target.value)} className="h-9 lg:h-7 text-[12px] font-mono flex-1 min-w-0" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <ToggleRow label={label} checked={checked} onChange={onChange} />;
}

/** مفتاح Switch أصلي مع الحفاظ على منطقة لمس واسعة */
function SwitchRow({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  // مفتاح بمساحة لمس تغطي الصف كاملًا — مطلوب على الجوال، وغير مُخل على الحاسوب
  return <ToggleRow label={label} hint={hint} checked={checked} onChange={onChange} />;
}

// ─────────── محرر التنسيق المشترك (القسم العاشر) ───────────
function styleSections(style: NodeStyle, onChange: (s: NodeStyle) => void, isText: boolean): SectionDef[] {
  const set = (p: Partial<NodeStyle>) => onChange({ ...style, ...p });
  const out: SectionDef[] = [
    {
      id: 'layout', title: 'التخطيط والأبعاد', icon: '📐', content: (
        <>
          <Row label="نوع العرض"><Sel value={style.display} onChange={v => set({ display: v as NodeStyle['display'] })} options={[['block', 'Block'], ['flex', 'Flex'], ['grid', 'Grid'], ['inline-block', 'Inline-Block'], ['none', 'None']]} /></Row>
          {style.display === 'flex' && <>
            <Row label="الاتجاه"><Sel value={style.direction} onChange={v => set({ direction: v as 'row' | 'column' })} options={[['row', 'صف'], ['column', 'عمود']]} /></Row>
            <Row label="المحاذاة"><Sel value={style.justify} onChange={v => set({ justify: v as NodeStyle['justify'] })} options={[['flex-start', 'بداية'], ['center', 'وسط'], ['flex-end', 'نهاية'], ['space-between', 'بين'], ['space-around', 'موزع']]} /></Row>
            <Row label="عرضية"><Sel value={style.align} onChange={v => set({ align: v as NodeStyle['align'] })} options={[['flex-start', 'أعلى'], ['center', 'وسط'], ['flex-end', 'أسفل'], ['stretch', 'تمدد']]} /></Row>
          </>}
          {style.display === 'grid' && <Row label="الأعمدة"><Num value={style.columns} min={1} max={6} onChange={v => set({ columns: v })} /></Row>}
          <Row label="المسافة"><Num value={style.gap} min={0} max={64} onChange={v => set({ gap: v })} /></Row>
          <Row label="العرض"><Txt value={style.width} onChange={v => set({ width: v })} placeholder="auto / 100% / 320px" /></Row>
          <Row label="الارتفاع"><Txt value={style.height} onChange={v => set({ height: v })} placeholder="auto / 200px" /></Row>
          <Row label="العرض الأقصى"><Txt value={style.maxWidth} onChange={v => set({ maxWidth: v })} placeholder="800px" /></Row>
          <Row label="الحشوة"><Num value={style.padding} min={0} max={80} onChange={v => set({ padding: v })} /></Row>
          <Row label="الهامش"><Num value={style.margin} min={0} max={80} onChange={v => set({ margin: v })} /></Row>
        </>
      ),
    },
    {
      id: 'style', title: 'التنسيق والألوان', icon: '🎨', content: (
        <>
          <Row label="الخلفية"><Color value={style.bg} onChange={v => set({ bg: v })} /></Row>
          <Row label="تدرج"><Txt value={style.bgGradient} onChange={v => set({ bgGradient: v })} placeholder="linear-gradient(...)" /></Row>
          <Row label="لون النص"><Color value={style.color} onChange={v => set({ color: v })} /></Row>
          <Row label="الشفافية"><Num value={style.opacity} min={0} max={1} step={0.05} onChange={v => set({ opacity: v })} /></Row>
          <Row label="الزوايا"><Num value={style.radius} min={0} max={999} onChange={v => set({ radius: v })} /></Row>
          <Row label="سمك الحد"><Num value={style.borderWidth} min={0} max={12} onChange={v => set({ borderWidth: v })} /></Row>
          <Row label="لون الحد"><Color value={style.borderColor} onChange={v => set({ borderColor: v })} /></Row>
          <Row label="نمط الحد"><Sel value={style.borderStyle} onChange={v => set({ borderStyle: v as NodeStyle['borderStyle'] })} options={[['solid', 'متصل'], ['dashed', 'متقطع'], ['dotted', 'منقّط'], ['none', 'بلا']]} /></Row>
          <Row label="الظل"><Sel value={style.shadow} onChange={v => set({ shadow: v as NodeStyle['shadow'] })} options={[['none', 'بلا'], ['sm', 'صغير'], ['md', 'متوسط'], ['lg', 'كبير'], ['xl', 'ضخم']]} /></Row>
        </>
      ),
    },
  ];
  if (isText) {
    out.push({
      id: 'text', title: 'النصوص', icon: '🔤', content: (
        <>
          <Row label="حجم الخط"><Num value={style.fontSize} min={8} max={80} onChange={v => set({ fontSize: v })} /></Row>
          <Row label="السماكة"><Sel value={style.fontWeight} onChange={v => set({ fontWeight: v as NodeStyle['fontWeight'] })} options={[['400', 'عادي'], ['500', 'متوسط'], ['700', 'عريض'], ['900', 'ثقيل']]} /></Row>
          <Row label="المحاذاة"><Sel value={style.textAlign} onChange={v => set({ textAlign: v as NodeStyle['textAlign'] })} options={[['right', 'يمين'], ['center', 'وسط'], ['left', 'يسار']]} /></Row>
          <Row label="ارتفاع السطر"><Num value={style.lineHeight} min={1} max={3} step={0.1} onChange={v => set({ lineHeight: v })} /></Row>
          <Row label="تباعد الأحرف"><Num value={style.letterSpacing} min={-2} max={10} step={0.5} onChange={v => set({ letterSpacing: v })} /></Row>
        </>
      ),
    });
  }
  out.push(
    {
      id: 'fx', title: 'التحويلات والمرشحات', icon: '🔄', content: (
        <>
          <Row label="دوران"><Num value={style.rotate} min={-180} max={180} onChange={v => set({ rotate: v })} /></Row>
          <Row label="تكبير"><Num value={style.scale} min={0.2} max={3} step={0.05} onChange={v => set({ scale: v })} /></Row>
          <Row label="ضبابية"><Num value={style.blur} min={0} max={20} onChange={v => set({ blur: v })} /></Row>
          <Row label="رمادي %"><Num value={style.grayscale} min={0} max={100} onChange={v => set({ grayscale: v })} /></Row>
        </>
      ),
    },
    {
      id: 'anim', title: 'الحركة', icon: '✨', content: (
        <>
          <Row label="حركة الظهور"><Sel value={style.animation} onChange={v => set({ animation: v as NodeStyle['animation'] })} options={[['none', 'بلا'], ['fade', 'تلاشي'], ['slide-up', 'انزلاق للأعلى'], ['slide-right', 'انزلاق جانبي'], ['zoom', 'تكبير'], ['bounce', 'ارتداد']]} /></Row>
          <Row label="المدة (ms)"><Num value={style.animationDuration} min={50} max={2000} onChange={v => set({ animationDuration: v })} /></Row>
          <Row label="عند التحويم"><Sel value={style.hoverEffect} onChange={v => set({ hoverEffect: v as NodeStyle['hoverEffect'] })} options={[['none', 'بلا'], ['zoom', 'تكبير'], ['lift', 'ارتفاع'], ['glow', 'توهج']]} /></Row>
        </>
      ),
    },
  );
  return out;
}

// ─────────── محرّر محتوى المكوّن ───────────
function ContentEditor({ node, project, onChange }: { node: AppNode; project: AppProject; onChange: (props: Record<string, any>) => void }) {
  const p = node.props;
  const set = (patch: Record<string, any>) => onChange({ ...p, ...patch });
  const arrayField = (key: string, label: string) => (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      {((p[key] as string[]) || []).map((v: string, i: number) => (
        <div key={i} className="flex gap-1 items-center">
          <Input value={v} onChange={e => { const arr = [...(p[key] as string[])]; arr[i] = e.target.value; set({ [key]: arr }); }} className="h-10 lg:h-7 text-[13px] lg:text-[11px]" />
          <button onClick={() => set({ [key]: (p[key] as string[]).filter((_, j) => j !== i) })} className="tap h-9 w-9 lg:h-7 lg:w-7 flex-shrink-0 inline-flex items-center justify-center text-slate-400 hover:text-red-500" aria-label="حذف العنصر"><Trash2 size={14} /></button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-9 lg:h-7 text-[11px] w-full" onClick={() => set({ [key]: [...((p[key] as string[]) || []), 'عنصر جديد'] })}>+ إضافة</Button>
    </div>
  );

  const fields: React.ReactNode[] = [];
  const has = (k: string) => k in p;
  if (has('text')) fields.push(<Field key="text" label="النص" hint="يقبل {name} و {balance}" inline={false}>
    <textarea value={String(p.text)} onChange={e => set({ text: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] lg:text-[11px]" />
  </Field>);
  ['label', 'title', 'value', 'plan', 'price', 'period', 'change', 'hint', 'name', 'question', 'placeholder', 'alt', 'url', 'src', 'phone', 'message', 'icon'].forEach(k => {
    if (has(k)) fields.push(<Row key={k} label={k}><Txt value={String(p[k] ?? '')} onChange={v => set({ [k]: v })} /></Row>);
  });
  ['height', 'size', 'columns', 'max', 'count', 'rows', 'digits', 'seconds', 'to', 'rate', 'value'].forEach(k => {
    if (has(k) && typeof p[k] === 'number') fields.push(<Row key={`n-${k}`} label={k}><Num value={Number(p[k])} onChange={v => set({ [k]: v })} /></Row>);
  });
  if (has('options')) fields.push(<div key="options">{arrayField('options', 'الخيارات')}</div>);
  if (has('items')) fields.push(<div key="items">{arrayField('items', 'العناصر')}</div>);
  if (has('features')) fields.push(<div key="features">{arrayField('features', 'المزايا')}</div>);
  if (has('tabs')) fields.push(<div key="tabs">{arrayField('tabs', 'التبويبات')}</div>);
  if (has('events')) fields.push(<div key="events">{arrayField('events', 'الأحداث')}</div>);
  if (has('data')) fields.push(<Row key="data" label="البيانات"><Txt value={((p.data as number[]) || []).join(',')} onChange={v => set({ data: v.split(',').map(x => Number(x.trim()) || 0) })} /></Row>);
  if (has('kind')) fields.push(<Row key="kind" label="النوع"><Sel value={String(p.kind)} onChange={v => set({ kind: v })} options={[['info', 'معلومة'], ['success', 'نجاح'], ['warning', 'تحذير'], ['danger', 'خطر']]} /></Row>);
  if (has('html')) fields.push(<Field key="html" label="HTML" inline={false}>
    <textarea value={String(p.html)} onChange={e => set({ html: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[12px] lg:text-[10px] font-mono" />
  </Field>);
  if (has('pageId')) fields.push(<Row key="pageId" label="الصفحة"><Sel value={String(p.pageId)} onChange={v => set({ pageId: v })} options={[['', '— اختر —'], ...project.pages.map(pg => [pg.id, pg.name] as [string, string])]} /></Row>);
  if (node.type === 'image' || node.type === 'profileCard') {
    fields.push(<Field key="upload" label="رفع صورة" inline={false}>
      <input type="file" accept="image/*" className="builder-file" onChange={e => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = () => set(node.type === 'image' ? { src: String(r.result) } : { avatar: String(r.result) }); r.readAsDataURL(f);
      }} />
      {node.type === 'image' && p.src ? <button onClick={() => set({ src: '' })} className="text-[11px] text-red-500 underline mt-1">إزالة الصورة</button> : null}
    </Field>);
  }
  if (node.type === 'gallery') {
    fields.push(<Field key="gal" label="رفع صور المعرض" inline={false}>
      <input type="file" accept="image/*" multiple className="builder-file" onChange={e => {
        const fs = Array.from(e.target.files || []); if (!fs.length) return;
        let left = fs.length; const urls: string[] = [];
        fs.forEach(f => { const r = new FileReader(); r.onload = () => { urls.push(String(r.result)); if (--left === 0) set({ images: [...((p.images as string[]) || []), ...urls] }); }; r.readAsDataURL(f); });
      }} />
      {Array.isArray(p.images) && (p.images as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(p.images as string[]).map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover border" />
              <button onClick={() => set({ images: (p.images as string[]).filter((_, j) => j !== i) })}
                className="absolute -top-1.5 -left-1.5 h-8 w-8 lg:h-6 lg:w-6 rounded-full bg-red-500 text-white flex items-center justify-center" aria-label="حذف الصورة">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Field>);
  }
  return <>{fields.length ? fields : <p className="text-[11px] text-slate-400">لا توجد حقول محتوى لهذا المكون.</p>}</>;
}

// ─────────── اللوحة الرئيسية ───────────
export function PropertiesPanel({
  project, selection, onProjectChange, onOpenActionEditor, onDuplicate, onDelete, onSaveAsTemplate, embedded,
}: {
  project: AppProject;
  selection: { kind: 'node' | 'page' | 'bar' | 'modal' | 'design' | null; id: string | null; ownerKind?: 'page' | 'bar' | 'modal'; ownerId?: string };
  onProjectChange: (updater: (p: AppProject) => AppProject) => void;
  onOpenActionEditor: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveAsTemplate: () => void;
  /** داخل Bottom Sheet على الجوال */
  embedded?: boolean;
}) {
  const { isWide } = useBuilderMode();
  const tabsMode = !!embedded || !isWide;
  const Head = ({ title, sub, badge }: { title: React.ReactNode; sub?: React.ReactNode; badge?: React.ReactNode }) => (
    <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2">
        <span className="text-[13px] lg:text-sm font-black text-slate-800 truncate min-w-0">{title}</span>
        {badge}
      </div>
      {sub && <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub}</p>}
    </div>
  );

  // ── عنصر غير محدد ──
  if (!selection.kind || !selection.id) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm font-black text-slate-600 mb-1">لم تحدد أي عنصر</p>
        <ul className="text-[11px] text-slate-400 space-y-1.5 mt-3 text-right leading-6">
          <li>• اضغط على أي مكون في اللوحة لتحرير خصائصه</li>
          <li>• استخدم شجرة العناصر للتنقل بين الصفحات والأشرطة والنوافذ</li>
          <li>• من شريط التبويبات السفلي: البنية · اللوحة · الخصائص · أدوات</li>
          <li className="hidden lg:list-item">• Ctrl+Z للتراجع · Delete لحذف المحدد · Ctrl+S للحفظ</li>
        </ul>
      </div>
    );
  }

  // ── التصميم العام ──
  if (selection.kind === 'design') {
    const d = project.design;
    const set = (patch: Partial<typeof d>) => onProjectChange(p => ({ ...p, design: { ...p.design, ...patch } }));
    return (
      <div>
        <Head title="🎨 التصميم العام" />
        <Sections tabsMode={tabsMode} sections={[
          {
            id: 'colors', title: 'الألوان', icon: '🎨', content: (
              <>
                {([['primary', 'أساسي'], ['secondary', 'ثانوي'], ['success', 'نجاح'], ['warning', 'تحذير'], ['danger', 'خطر'], ['bgMain', 'خلفية عامة'], ['bgCards', 'خلفية البطاقات'], ['textMain', 'نص أساسي'], ['textSecondary', 'نص ثانوي'], ['borders', 'الحدود']] as const).map(([k, l]) => (
                  <Row key={k} label={l}><Color value={(d as any)[k]} onChange={v => set({ [k]: v } as any)} /></Row>
                ))}
              </>
            ),
          },
          {
            id: 'fonts', title: 'الخطوط والمقاسات', icon: '🔤', content: (
              <>
                <Row label="خط العناوين"><Txt value={d.headingFont} onChange={v => set({ headingFont: v })} /></Row>
                <Row label="خط المحتوى"><Txt value={d.bodyFont} onChange={v => set({ bodyFont: v })} /></Row>
                <Row label="الحجم الأساسي"><Num value={d.baseSize} min={10} max={22} onChange={v => set({ baseSize: v })} /></Row>
                <Row label="الزوايا"><Num value={d.radius} min={0} max={40} onChange={v => set({ radius: v })} /></Row>
                <Row label="التباعد"><Num value={d.spacing} min={0} max={40} onChange={v => set({ spacing: v })} /></Row>
              </>
            ),
          },
        ]} />
      </div>
    );
  }

  // ── صفحة ──
  if (selection.kind === 'page') {
    const page = project.pages.find(p => p.id === selection.id);
    if (!page) return null;
    const set = (patch: Partial<AppPage>) => onProjectChange(p => ({ ...p, pages: p.pages.map(x => (x.id === page.id ? { ...x, ...patch } : x)) }));
    return (
      <div>
        <Head title={`📄 ${page.name}`} badge={page.isHome ? <Badge className="bg-blue-100 text-blue-700 text-[9px]">رئيسية</Badge> : undefined} />
        <Sections tabsMode={tabsMode} sections={[
          {
            id: 'page', title: 'إعدادات الصفحة', icon: '⚙️', content: (
              <>
                <Row label="الاسم"><Txt value={page.name} onChange={v => set({ name: v })} /></Row>
                <Row label="الرابط"><Txt value={page.slug} onChange={v => set({ slug: v })} /></Row>
                <Row label="العنوان"><Txt value={page.title} onChange={v => set({ title: v })} /></Row>
                <Row label="الخلفية"><Color value={page.bg} onChange={v => set({ bg: v })} /></Row>
                <Row label="الصفحة الأم"><Sel value={page.parentId || ''} onChange={v => set({ parentId: v || null })}
                  options={[['', 'بلا'], ...project.pages.filter(x => x.id !== page.id).map(x => [x.id, x.name] as [string, string])]} /></Row>
                <div className="pt-1 space-y-1">
                  <SwitchRow label="الصفحة الرئيسية" checked={page.isHome} onChange={v => onProjectChange(p => ({ ...p, pages: p.pages.map(x => ({ ...x, isHome: x.id === page.id ? v : v ? false : x.isHome })) }))} />
                  <SwitchRow label="يتطلب تسجيل دخول" checked={page.requiresLogin} onChange={v => set({ requiresLogin: v })} />
                  <SwitchRow label="ظاهرة في التنقل" checked={page.visibleInNav} onChange={v => set({ visibleInNav: v })} />
                </div>
                <Field label="الوصف (Meta)" inline={false}>
                  <textarea value={page.metaDescription} onChange={e => set({ metaDescription: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] lg:text-[11px]" />
                </Field>
              </>
            ),
          },
        ]} />
      </div>
    );
  }

  // ── شريط ──
  if (selection.kind === 'bar') {
    const bar = project.bars.find(b => b.id === selection.id);
    if (!bar) return null;
    const set = (patch: Partial<AppBar>) => onProjectChange(p => ({ ...p, bars: p.bars.map(x => (x.id === bar.id ? { ...x, ...patch } : x)) }));
    return (
      <div>
        <Head title={`🔗 ${bar.name}`} sub={BAR_KIND_LABELS[bar.kind]} />
        <Sections tabsMode={tabsMode} sections={[
          {
            id: 'bar-layout', title: 'التخطيط', icon: '📐', content: (
              <>
                <Row label="الاسم"><Txt value={bar.name} onChange={v => set({ name: v })} /></Row>
                <Row label="الحجم"><Num value={bar.size} min={30} max={400} onChange={v => set({ size: v })} /></Row>
                <Row label="المحاذاة"><Sel value={bar.justify} onChange={v => set({ justify: v as AppBar['justify'] })} options={[['flex-start', 'بداية'], ['center', 'وسط'], ['flex-end', 'نهاية'], ['space-between', 'بين'], ['space-around', 'موزع']]} /></Row>
                <Row label="المسافة"><Num value={bar.gap} min={0} max={40} onChange={v => set({ gap: v })} /></Row>
                <Row label="الحشوة"><Num value={bar.padding} min={0} max={40} onChange={v => set({ padding: v })} /></Row>
                <ToggleRow label="ثابت (Sticky)" checked={bar.sticky} onChange={v => set({ sticky: v })} />
              </>
            ),
          },
          {
            id: 'bar-style', title: 'التنسيق', icon: '🎨', content: (
              <>
                <Row label="الخلفية"><Color value={bar.bg} onChange={v => set({ bg: v })} /></Row>
                <Row label="لون النص"><Color value={bar.color} onChange={v => set({ color: v })} /></Row>
                <Row label="الزوايا"><Num value={bar.radius} min={0} max={40} onChange={v => set({ radius: v })} /></Row>
                <Row label="الظل"><Sel value={bar.shadow} onChange={v => set({ shadow: v as AppBar['shadow'] })} options={[['none', 'بلا'], ['sm', 'صغير'], ['md', 'متوسط'], ['lg', 'كبير']]} /></Row>
              </>
            ),
          },
          {
            id: 'bar-scope', title: 'النطاق والإظهار', icon: '👁', content: (
              <>
                <ToggleRow label="مفعّل" checked={bar.enabled} onChange={v => set({ enabled: v })} />
                <Row label="النطاق"><Sel value={bar.scope} onChange={v => set({ scope: v as AppBar['scope'] })} options={[['all', 'كل الصفحات'], ['selected', 'صفحات محددة']]} /></Row>
                {bar.scope === 'selected' && (
                  <div className="space-y-0.5 max-h-[36vh] lg:max-h-40 overflow-y-auto overscroll-contain pane-scroll">
                    {project.pages.map(pg => (
                      <label key={pg.id} className="flex items-center gap-2 text-[12px] lg:text-[11px] min-h-10 lg:min-h-0 cursor-pointer">
                        <input type="checkbox" checked={bar.pages.includes(pg.id)} className="accent-blue-600 w-5 h-5"
                          onChange={e => set({ pages: e.target.checked ? [...bar.pages, pg.id] : bar.pages.filter(x => x !== pg.id) })} />
                        {pg.name}
                      </label>
                    ))}
                  </div>
                )}
                <ToggleRow label="إظهار على الجوال" checked={bar.showOn.mobile} onChange={v => set({ showOn: { ...bar.showOn, mobile: v } })} />
                <ToggleRow label="إظهار على التابلت" checked={bar.showOn.tablet} onChange={v => set({ showOn: { ...bar.showOn, tablet: v } })} />
                <ToggleRow label="إظهار على الديسكتوب" checked={bar.showOn.desktop} onChange={v => set({ showOn: { ...bar.showOn, desktop: v } })} />
              </>
            ),
          },
        ]} />
      </div>
    );
  }

  // ── نافذة ──
  if (selection.kind === 'modal') {
    const modal = project.modals.find(m => m.id === selection.id);
    if (!modal) return null;
    const set = (patch: Partial<AppModal>) => onProjectChange(p => ({ ...p, modals: p.modals.map(x => (x.id === modal.id ? { ...x, ...patch } : x)) }));
    return (
      <div>
        <Head title={`💬 ${modal.name}`} sub={MODAL_KIND_LABELS[modal.kind]} />
        <Sections tabsMode={tabsMode} sections={[
          {
            id: 'modal-size', title: 'الحجم والموضع', icon: '📐', content: (
              <>
                <Row label="الاسم"><Txt value={modal.name} onChange={v => set({ name: v })} /></Row>
                <Row label="النوع"><Sel value={modal.kind} onChange={v => set({ kind: v as AppModal['kind'] })} options={Object.entries(MODAL_KIND_LABELS) as [string, string][]} /></Row>
                <Row label="الحجم"><Sel value={modal.size} onChange={v => set({ size: v as AppModal['size'] })} options={[['sm', 'صغير 400'], ['md', 'متوسط 600'], ['lg', 'كبير 800'], ['xl', 'ضخم 1000'], ['full', 'ملء الشاشة']]} /></Row>
                <Row label="الزوايا"><Num value={modal.radius} min={0} max={40} onChange={v => set({ radius: v })} /></Row>
              </>
            ),
          },
          {
            id: 'modal-backdrop', title: 'الطبقة الخلفية', icon: '🎨', content: (
              <>
                <ToggleRow label="إظهار الطبقة" checked={modal.backdrop} onChange={v => set({ backdrop: v })} />
                <Row label="لون الطبقة"><Txt value={modal.backdropColor} onChange={v => set({ backdropColor: v })} /></Row>
              </>
            ),
          },
          {
            id: 'modal-anim', title: 'الحركة', icon: '✨', content: (
              <>
                <Row label="حركة الدخول"><Sel value={modal.enterAnimation} onChange={v => set({ enterAnimation: v as AppModal['enterAnimation'] })}
                  options={[['fade', 'تلاشي'], ['slide-up', 'انزلاق للأعلى'], ['slide-down', 'انزلاق للأسفل'], ['slide-right', 'من اليمين'], ['slide-left', 'من اليسار'], ['zoom', 'تكبير'], ['pop', 'انبثاق']]} /></Row>
                <Row label="المدة (ms)"><Num value={modal.duration} min={100} max={1500} onChange={v => set({ duration: v })} /></Row>
              </>
            ),
          },
          {
            id: 'modal-behavior', title: 'السلوك', icon: '🔒', content: (
              <>
                <ToggleRow label="قابلة للإغلاق" checked={modal.closable} onChange={v => set({ closable: v })} />
                <ToggleRow label="إغلاق بالضغط على الطبقة" checked={modal.closeOnBackdrop} onChange={v => set({ closeOnBackdrop: v })} />
                <ToggleRow label="إغلاق بمفتاح Escape" checked={modal.closeOnEscape} onChange={v => set({ closeOnEscape: v })} />
                <ToggleRow label="تظهر تلقائياً عند التحميل" checked={modal.autoOpen} onChange={v => set({ autoOpen: v })} />
                {modal.autoOpen && <Row label="التأخير (ms)"><Num value={modal.autoOpenDelay} min={0} max={20000} onChange={v => set({ autoOpenDelay: v })} /></Row>}
                <Row label="إخفاء تلقائي (ث)"><Num value={modal.autoHideSeconds} min={0} max={60} onChange={v => set({ autoHideSeconds: v })} /></Row>
                <ToggleRow label="مفعّلة" checked={modal.enabled} onChange={v => set({ enabled: v })} />
              </>
            ),
          },
        ]} />
      </div>
    );
  }

  // ── مكوّن ──
  const owner = selection.ownerKind === 'bar' ? project.bars.find(b => b.id === selection.ownerId)
    : selection.ownerKind === 'modal' ? project.modals.find(m => m.id === selection.ownerId)
      : project.pages.find(p => p.id === selection.ownerId);
  const nodes = (owner as any)?.nodes as AppNode[] | undefined;
  const path = nodes ? nodePath(nodes, selection.id) : null;
  const node = path?.[path.length - 1];
  if (!node) return <div className="p-4 text-xs text-slate-400">تعذّر العثور على المكوّن المحدد.</div>;

  const def = COMPONENTS_BY_TYPE[node.type];
  const isText = ['h1', 'h2', 'h3', 'paragraph', 'quote', 'dynamicText', 'typewriter', 'badgeText', 'codeBlock', 'list', 'checklist', 'button', 'buttonOutline', 'buttonGhost'].includes(node.type);

  const patchNode = (patch: Partial<AppNode>) => onProjectChange(p => {
    const upd = (list: AppNode[]): AppNode[] => list.map(n => (n.id === node.id ? { ...n, ...patch } : { ...n, children: upd(n.children) }));
    if (selection.ownerKind === 'bar') return { ...p, bars: p.bars.map(b => (b.id === selection.ownerId ? { ...b, nodes: upd(b.nodes) } : b)) };
    if (selection.ownerKind === 'modal') return { ...p, modals: p.modals.map(m => (m.id === selection.ownerId ? { ...m, nodes: upd(m.nodes) } : m)) };
    return { ...p, pages: p.pages.map(pg => (pg.id === selection.ownerId ? { ...pg, nodes: upd(pg.nodes) } : pg)) };
  });

  const sections: SectionDef[] = [
    {
      id: 'content', title: 'المحتوى', icon: '📝', content: (
        <>
          <Row label="اسم المكون"><Txt value={node.name} onChange={v => patchNode({ name: v })} /></Row>
          <ContentEditor node={node} project={project} onChange={props => patchNode({ props })} />
        </>
      ),
    },
    ...styleSections(node.style, style => patchNode({ style }), isText),
    {
      id: 'action', title: 'الإجراء عند الضغط', icon: '⚡', content: (
        <>
          <p className="text-[11px] text-slate-500 leading-5">
            {node.action && node.action.step.type !== 'none' ? 'يوجد إجراء محفوظ لهذا المكون' : 'لا يوجد إجراء بعد'}
          </p>
          <Button size="sm" className="w-full h-11 lg:h-8 text-[12px] lg:text-[11px] gap-1.5 bg-amber-500 hover:bg-amber-600" onClick={onOpenActionEditor}>
            <Zap size={13} /> تحرير الإجراء
          </Button>
        </>
      ),
    },
    {
      id: 'visibility', title: 'الإظهار والشروط', icon: '👁', content: (
        <>
          <ToggleRow label="مخفي" checked={node.hidden} onChange={v => patchNode({ hidden: v })} />
          <ToggleRow label="مقفل" checked={node.locked} onChange={v => patchNode({ locked: v })} />
          <ToggleRow label="إظهار شرطي" checked={node.visibility.conditional} onChange={v => patchNode({ visibility: { ...node.visibility, conditional: v } })} />
          {node.visibility.conditional && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_74px_1fr] gap-1.5">
              <Txt value={node.visibility.field} onChange={v => patchNode({ visibility: { ...node.visibility, field: v } })} placeholder="الحقل" />
              <Sel value={node.visibility.operator} onChange={v => patchNode({ visibility: { ...node.visibility, operator: v as any } })}
                options={[['=', '='], ['≠', '≠'], ['>', '>'], ['<', '<'], ['contains', 'يحوي'], ['empty', 'فارغ'], ['notEmpty', 'غير فارغ']]} />
              <Txt value={node.visibility.value} onChange={v => patchNode({ visibility: { ...node.visibility, value: v } })} placeholder="القيمة" />
            </div>
          )}
        </>
      ),
    },
    {
      id: 'responsive', title: 'التجاوب', icon: '📱', content: (
        <>
          <ToggleRow label="إظهار على الجوال" checked={node.visibility.mobile} onChange={v => patchNode({ visibility: { ...node.visibility, mobile: v } })} />
          <ToggleRow label="إظهار على التابلت" checked={node.visibility.tablet} onChange={v => patchNode({ visibility: { ...node.visibility, tablet: v } })} />
          <ToggleRow label="إظهار على الديسكتوب" checked={node.visibility.desktop} onChange={v => patchNode({ visibility: { ...node.visibility, desktop: v } })} />
        </>
      ),
    },
    {
      id: 'ops', title: 'إجراءات هذا المكون', icon: '🎯', content: (
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" variant="outline" className="h-11 lg:h-7 text-[11px] gap-1" onClick={onDuplicate}><Copy size={12} /> نسخ</Button>
          <Button size="sm" variant="outline" className="h-11 lg:h-7 text-[11px] gap-1" onClick={onSaveAsTemplate}><Save size={12} /> حفظ كقالب</Button>
          <Button size="sm" variant="outline" className="h-11 lg:h-7 text-[11px] gap-1 col-span-2 text-red-600 border-red-200 hover:bg-red-50" onClick={onDelete}><Trash2 size={12} /> حذف المكون</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Head title={node.name} sub={`${(owner as any)?.name || ''} ${path && path.length > 1 ? `› ${path.slice(0, -1).map(n => n.name).join(' › ')}` : ''}`}
        badge={<Badge variant="outline" className="text-[9px] flex-shrink-0">{def?.label || node.type}</Badge>} />
      <Sections tabsMode={tabsMode} sections={sections} />
    </div>
  );
}

export { Section };
