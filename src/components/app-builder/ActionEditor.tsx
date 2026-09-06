// ═══════════════════════════════════════════════════════════════
// محرر الإجراءات + شريط التقدم المرافق (القسمان الثامن والتاسع)
// على الحاسوب: درج جانبي — على الجوال: Bottom Sheet بارتفاع كامل
// كل الأنواع والخطوط والخيارات كما هي، بتخطيط مناسب للمس.
// ═══════════════════════════════════════════════════════════════
import { ActionSpec, ActionStep, ActionType, AppProject, ProgressSpec } from '@/types/app-builder';
import { DEFAULT_ACTION, PROGRESS_PRESETS, emptyStep } from '@/data/app-builder-defaults';
import { allProjectNodes } from '@/lib/app-builder';
import { IconBtn, Sheet } from '@/components/app-builder/builder-ui';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, FlaskConical, Save, Zap } from 'lucide-react';

const ACTION_GROUPS: { group: string; items: { v: ActionType; l: string }[] }[] = [
  {
    group: 'التنقل', items: [
      { v: 'none', l: '— بلا إجراء —' },
      { v: 'openPage', l: 'فتح صفحة' },
      { v: 'back', l: 'العودة للصفحة السابقة' },
      { v: 'home', l: 'العودة للرئيسية' },
      { v: 'externalLink', l: 'فتح رابط خارجي' },
      { v: 'scrollTo', l: 'التمرير إلى مكون' },
      { v: 'scrollTop', l: 'التمرير لأعلى' },
      { v: 'scrollBottom', l: 'التمرير لأسفل' },
    ],
  },
  {
    group: 'النوافذ', items: [
      { v: 'openModal', l: 'فتح نافذة منبثقة' },
      { v: 'closeModal', l: 'إغلاق النافذة الحالية' },
      { v: 'closeAllModals', l: 'إغلاق كل النوافذ' },
      { v: 'toast', l: 'إظهار Toast' },
    ],
  },
  {
    group: 'التحكم في المكونات', items: [
      { v: 'showNode', l: 'إظهار مكون' },
      { v: 'hideNode', l: 'إخفاء مكون' },
      { v: 'toggleNode', l: 'تبديل ظهور مكون' },
      { v: 'setNodeText', l: 'تعديل نص مكون' },
    ],
  },
  {
    group: 'البيانات', items: [
      { v: 'setVar', l: 'تحديث متغير' },
      { v: 'incVar', l: 'زيادة متغير' },
      { v: 'decVar', l: 'إنقاص متغير' },
      { v: 'saveLocal', l: 'حفظ في التخزين المحلي' },
      { v: 'clearLocal', l: 'مسح من التخزين المحلي' },
    ],
  },
  {
    group: 'التطبيق', items: [
      { v: 'toggleDark', l: 'تبديل الوضع الداكن' },
      { v: 'copy', l: 'نسخ للحافظة' },
      { v: 'print', l: 'طباعة' },
      { v: 'share', l: 'مشاركة' },
      { v: 'call', l: 'الاتصال برقم' },
      { v: 'mail', l: 'إرسال بريد' },
      { v: 'whatsapp', l: 'فتح واتساب' },
      { v: 'reload', l: 'إعادة تحميل' },
    ],
  },
];

const NEEDS_PAGE: ActionType[] = ['openPage'];
const NEEDS_MODAL: ActionType[] = ['openModal'];
const NEEDS_NODE: ActionType[] = ['showNode', 'hideNode', 'toggleNode', 'setNodeText', 'scrollTo'];
const NEEDS_VALUE: ActionType[] = ['externalLink', 'toast', 'setNodeText', 'setVar', 'incVar', 'decVar', 'saveLocal', 'copy', 'share', 'call', 'mail', 'whatsapp'];
const NEEDS_KEY: ActionType[] = ['setVar', 'incVar', 'decVar', 'saveLocal', 'clearLocal'];

const selCls = 'w-full h-11 lg:h-9 rounded-xl border border-slate-200 text-[13px] lg:text-xs px-2 bg-white';

function StepRow({
  step, project, onChange, onRemove, onMove, onDuplicate, index,
}: {
  step: ActionStep; project: AppProject; index?: number;
  onChange: (s: ActionStep) => void;
  onRemove?: () => void;
  onMove?: (d: -1 | 1) => void;
  onDuplicate?: () => void;
}) {
  const nodes = useMemo(() => allProjectNodes(project), [project]);
  const set = (p: Partial<ActionStep>) => onChange({ ...step, ...p });
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        {index != null && <span className="w-6 h-6 lg:w-5 lg:h-5 rounded-full bg-slate-100 text-[11px] lg:text-[10px] font-black flex items-center justify-center flex-shrink-0">{index + 1}</span>}
        <select value={step.type} onChange={e => set({ type: e.target.value as ActionType, target: '', value: '' })} className={`${selCls} flex-1 font-bold min-w-0`}>
          {ACTION_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* أدوات reorder/nسخ/حذف — صف مستقل على الجوال لمنطقة لمس مريحة */}
      {(onMove || onDuplicate || onRemove) && (
        <div className="flex items-center gap-1.5">
          {onMove && <>
            <IconBtn label="تحريك لأعلى" onClick={() => onMove(-1)} variant="outline" className="!h-9 !w-9 lg:!h-7 lg:!w-7"><ArrowUp size={14} /></IconBtn>
            <IconBtn label="تحريك لأسفل" onClick={() => onMove(1)} variant="outline" className="!h-9 !w-9 lg:!h-7 lg:!w-7"><ArrowDown size={14} /></IconBtn>
          </>}
          {onDuplicate && <IconBtn label="نسخ الخطوة" onClick={onDuplicate} variant="outline" className="!h-9 !w-9 lg:!h-7 lg:!w-7"><Copy size={14} /></IconBtn>}
          {onRemove && <IconBtn label="حذف الخطوة" tone="danger" onClick={onRemove} className="!h-9 !w-9 lg:!h-7 lg:!w-7"><Trash2 size={14} /></IconBtn>}
          {onMove && (
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 ms-auto whitespace-nowrap">
              تأخير (ms)
              <Input type="number" value={step.delay} onChange={e => set({ delay: Number(e.target.value) || 0 })} className="h-9 lg:h-7 w-20 text-[13px] lg:text-xs" />
            </label>
          )}
        </div>
      )}

      {NEEDS_PAGE.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className={selCls}>
          <option value="">— اختر صفحة —</option>
          {project.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {NEEDS_MODAL.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className={selCls}>
          <option value="">— اختر نافذة —</option>
          {project.modals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      )}
      {NEEDS_NODE.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className={selCls}>
          <option value="">— اختر مكوناً —</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
      )}
      {NEEDS_KEY.includes(step.type) && (
        <Input value={step.target} onChange={e => set({ target: e.target.value })} placeholder="اسم المتغير / المفتاح" className="h-11 lg:h-8 text-[15px] lg:text-xs" />
      )}
      {NEEDS_VALUE.includes(step.type) && (
        <Input value={step.value} onChange={e => set({ value: e.target.value })} placeholder="القيمة / النص (يقبل {name} و {balance})" className="h-11 lg:h-8 text-[15px] lg:text-xs" />
      )}
      {step.type === 'toast' && (
        <select value={step.tone} onChange={e => set({ tone: e.target.value as ActionStep['tone'] })} className={selCls}>
          <option value="success">نجاح</option><option value="error">خطأ</option><option value="info">معلومة</option><option value="warning">تحذير</option>
        </select>
      )}
    </div>
  );
}

const miniSel = 'w-full h-9 lg:h-7 rounded-lg border border-slate-200 text-[13px] lg:text-[11px] px-1 bg-white';

function ProgressEditor({ spec, onChange }: { spec: ProgressSpec; onChange: (s: ProgressSpec) => void }) {
  const [preview, setPreview] = useState<number | null>(null);
  const set = (p: Partial<ProgressSpec>) => onChange({ ...spec, ...p });
  const runPreview = () => {
    setPreview(0);
    const step = 100 / Math.max(1, spec.duration / 100);
    const iv = setInterval(() => setPreview(v => {
      const n = Math.min(100, (v ?? 0) + step);
      if (n >= 100) clearInterval(iv);
      return n;
    }), 100);
  };
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] lg:text-xs font-black text-amber-800">⏳ شريط تقدم مرافق</p>
        <Switch checked={spec.enabled} onCheckedChange={v => set({ enabled: v })} />
      </div>
      {spec.enabled && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {PROGRESS_PRESETS.map(p => (
              <button key={p.id} onClick={() => set(p.patch)} className="h-9 lg:h-auto min-w-9 lg:min-w-0 px-2.5 lg:py-1 rounded-xl text-[11px] lg:text-[10px] bg-white border border-amber-200 hover:bg-amber-100 font-bold whitespace-nowrap">{p.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="text-[11px] font-bold text-slate-600">النوع
              <select value={spec.kind} onChange={e => set({ kind: e.target.value as ProgressSpec['kind'] })} className={miniSel}>
                <option value="linear">خطي</option><option value="circular">دائري</option><option value="steps">شرائح</option><option value="flow">متدفق</option>
              </select></label>
            <label className="text-[11px] font-bold text-slate-600">الموضع
              <select value={spec.position} onChange={e => set({ position: e.target.value as ProgressSpec['position'] })} className={miniSel}>
                <option value="inside">داخل الزر</option><option value="above">أعلى الزر</option><option value="below">أسفل الزر</option>
              </select></label>
            <label className="text-[11px] font-bold text-slate-600">المدة (ms)
              <Input type="number" value={spec.duration} onChange={e => set({ duration: Number(e.target.value) || 100 })} className="h-9 lg:h-7 text-[13px] lg:text-[11px]" /></label>
            <label className="text-[11px] font-bold text-slate-600">السماكة
              <Input type="number" value={spec.thickness} onChange={e => set({ thickness: Number(e.target.value) || 4 })} className="h-9 lg:h-7 text-[13px] lg:text-[11px]" /></label>
            <label className="text-[11px] font-bold text-slate-600">اللون
              <input type="color" value={spec.color} onChange={e => set({ color: e.target.value })} className="w-full h-9 lg:h-7 rounded-lg border border-slate-200" /></label>
            <label className="text-[11px] font-bold text-slate-600">لون المسار
              <input type="color" value={spec.trackColor} onChange={e => set({ trackColor: e.target.value })} className="w-full h-9 lg:h-7 rounded-lg border border-slate-200" /></label>
          </div>
          <Input value={spec.label} onChange={e => set({ label: e.target.value })} placeholder="نص فوق الشريط" className="h-11 lg:h-7 text-[13px] lg:text-[11px]" />
          <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-slate-600">إظهار النسبة</span><Switch checked={spec.showPercent} onCheckedChange={v => set({ showPercent: v })} /></div>
          <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-slate-600">توهج</span><Switch checked={spec.glow} onCheckedChange={v => set({ glow: v })} /></div>
          <label className="text-[11px] font-bold text-slate-600 block">الإجراء عند 100%
            <select value={spec.onComplete} onChange={e => set({ onComplete: e.target.value as ProgressSpec['onComplete'] })} className={miniSel}>
              <option value="none">لا شيء</option><option value="hide">إخفاء الشريط</option><option value="toast">إظهار Toast نجاح</option>
              <option value="openPage">فتح صفحة</option><option value="openModal">فتح نافذة</option>
              <option value="showNode">إظهار مكون</option><option value="hideNode">إخفاء مكون</option>
            </select></label>
          {spec.onComplete !== 'none' && spec.onComplete !== 'hide' && (
            <Input value={spec.completeValue} onChange={e => set({ completeValue: e.target.value })} placeholder="الرسالة أو معرّف الهدف" className="h-11 lg:h-7 text-[13px] lg:text-[11px]" />
          )}
          <div className="pt-1">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div style={{ width: `${preview ?? 0}%`, height: '100%', background: spec.color, boxShadow: spec.glow ? `0 0 10px ${spec.color}` : undefined, transition: 'width .1s linear' }} />
            </div>
            <Button size="sm" variant="outline" className="h-10 lg:h-6 text-[11px] lg:text-[10px] mt-2" onClick={runPreview}>▶ تشغيل المعاينة</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function ActionEditor({ action, project, onChange, onClose }: {
  action: ActionSpec | null;
  project: AppProject;
  onChange: (a: ActionSpec) => void;
  onClose: () => void;
}) {
  const a = action || DEFAULT_ACTION();
  const set = (p: Partial<ActionSpec>) => onChange({ ...a, ...p });
  const count = a.mode === 'single' ? 1 : a.mode === 'sequence' ? a.steps.length : a.thenSteps.length + a.elseSteps.length;

  const stepList = (steps: ActionStep[], key: 'steps' | 'thenSteps' | 'elseSteps') => (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <StepRow key={s.id} step={s} project={project} index={i}
          onChange={n => set({ [key]: steps.map(x => (x.id === s.id ? n : x)) } as Partial<ActionSpec>)}
          onRemove={() => set({ [key]: steps.filter(x => x.id !== s.id) } as Partial<ActionSpec>)}
          onDuplicate={() => set({ [key]: [...steps.slice(0, i + 1), { ...s, id: Math.random().toString(36).slice(2) }, ...steps.slice(i + 1)] } as Partial<ActionSpec>)}
          onMove={d => {
            const t = i + d; if (t < 0 || t >= steps.length) return;
            const c = [...steps]; [c[i], c[t]] = [c[t], c[i]];
            set({ [key]: c } as Partial<ActionSpec>);
          }} />
      ))}
      <Button size="sm" variant="outline" className="h-11 lg:h-7 text-[12px] lg:text-[11px] gap-1 w-full"
        onClick={() => set({ [key]: [...steps, emptyStep()] } as Partial<ActionSpec>)}><Plus size={14} /> إضافة إجراء</Button>
    </div>
  );

  return (
    <Sheet open onClose={onClose} title="محرر الإجراء" icon={<Zap size={16} className="text-amber-500" />}
      desktop="left" widthClass="w-[520px]" bodyClass="p-3 space-y-3" fillHeight
      headerExtra={<Badge variant="outline" className="text-[10px] flex-shrink-0 hidden sm:inline-flex">{count === 1 ? 'إجراء واحد' : `تسلسل من ${count} إجراءات`}</Badge>}
      footer={<Button className="w-full h-11 lg:h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-[13px] lg:text-sm" onClick={() => { toast.success('تم حفظ الإجراء ✓'); onClose(); }}>
        <Save size={15} /> حفظ الإجراء
      </Button>}>
      <p className="sm:hidden text-[10px] text-slate-400 -mt-1">{count === 1 ? 'إجراء واحد' : `تسلسل من ${count} إجراءات`}</p>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {([['single', 'إجراء واحد'], ['sequence', 'تسلسل إجراءات'], ['conditional', 'إجراء شرطي']] as const).map(([v, l]) => (
          <button key={v} onClick={() => set({ mode: v })}
            className={`flex-1 h-11 lg:h-8 rounded-lg text-[12px] lg:text-[11px] font-black ${a.mode === v ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {a.mode === 'single' && <StepRow step={a.step} project={project} onChange={s => set({ step: s })} />}

      {a.mode === 'sequence' && (
        <div className="space-y-2">
          <p className="text-[12px] lg:text-xs font-black text-slate-700">📋 التسلسل ({a.steps.length} إجراء)</p>
          {stepList(a.steps, 'steps')}
          <Button size="sm" variant="outline" className="h-11 lg:h-7 text-[12px] lg:text-[11px] gap-1 w-full"
            onClick={() => { toast.success(`تم تنفيذ ${a.steps.length} إجراء بنجاح (محاكاة)`); }}>
            <FlaskConical size={13} /> اختبار التسلسل
          </Button>
        </div>
      )}

      {a.mode === 'conditional' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 p-2.5 space-y-2">
            <p className="text-[11px] font-black text-slate-700">الشرط</p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_86px_1fr] gap-1.5">
              <Input value={a.condition.field} onChange={e => set({ condition: { ...a.condition, field: e.target.value } })} placeholder="الحقل (مثال: status)" className="h-11 lg:h-7 text-[15px] lg:text-[11px]" />
              <select value={a.condition.operator} onChange={e => set({ condition: { ...a.condition, operator: e.target.value } })} className="h-11 lg:h-7 rounded-lg border border-slate-200 text-[13px] lg:text-[11px] bg-white px-1">
                {['=', '≠', '>', '<', 'contains', 'empty', 'notEmpty'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Input value={a.condition.value} onChange={e => set({ condition: { ...a.condition, value: e.target.value } })} placeholder="القيمة" className="h-11 lg:h-7 text-[15px] lg:text-[11px]" />
            </div>
          </div>
          <p className="text-[11px] font-black text-emerald-700">إذا الشرط صحيح، نفّذ:</p>
          {stepList(a.thenSteps, 'thenSteps')}
          <p className="text-[11px] font-black text-red-700">وإلا، نفّذ:</p>
          {stepList(a.elseSteps, 'elseSteps')}
        </div>
      )}

      <ProgressEditor spec={a.progress} onChange={p => set({ progress: p })} />
    </Sheet>
  );
}
