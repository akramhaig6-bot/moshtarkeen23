// محرر الإجراءات + شريط التقدم المرافق (القسمان الثامن والتاسع)
import { ActionSpec, ActionStep, ActionType, AppProject, ProgressSpec } from '@/types/app-builder';
import { DEFAULT_ACTION, PROGRESS_PRESETS, emptyStep } from '@/data/app-builder-defaults';
import { allProjectNodes } from '@/lib/app-builder';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Copy, FlaskConical, Save, Zap } from 'lucide-react';

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
        {index != null && <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-black flex items-center justify-center flex-shrink-0">{index + 1}</span>}
        <select value={step.type} onChange={e => set({ type: e.target.value as ActionType, target: '', value: '' })}
          className="flex-1 h-8 rounded-lg border border-slate-200 text-xs font-bold px-2 bg-white">
          {ACTION_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
            </optgroup>
          ))}
        </select>
        {onMove && <><button onClick={() => onMove(-1)} className="p-1 text-slate-400 hover:text-slate-700"><ArrowUp size={13} /></button>
          <button onClick={() => onMove(1)} className="p-1 text-slate-400 hover:text-slate-700"><ArrowDown size={13} /></button></>}
        {onDuplicate && <button onClick={onDuplicate} className="p-1 text-slate-400 hover:text-slate-700"><Copy size={13} /></button>}
        {onRemove && <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>}
      </div>

      {NEEDS_PAGE.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
          <option value="">— اختر صفحة —</option>
          {project.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {NEEDS_MODAL.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
          <option value="">— اختر نافذة —</option>
          {project.modals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      )}
      {NEEDS_NODE.includes(step.type) && (
        <select value={step.target} onChange={e => set({ target: e.target.value })} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
          <option value="">— اختر مكوناً —</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
      )}
      {NEEDS_KEY.includes(step.type) && (
        <Input value={step.target} onChange={e => set({ target: e.target.value })} placeholder="اسم المتغير / المفتاح" className="h-8 text-xs" />
      )}
      {NEEDS_VALUE.includes(step.type) && (
        <Input value={step.value} onChange={e => set({ value: e.target.value })} placeholder="القيمة / النص (يقبل {name} و {balance})" className="h-8 text-xs" />
      )}
      {step.type === 'toast' && (
        <select value={step.tone} onChange={e => set({ tone: e.target.value as ActionStep['tone'] })} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
          <option value="success">نجاح</option><option value="error">خطأ</option><option value="info">معلومة</option><option value="warning">تحذير</option>
        </select>
      )}
      {onMove && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-500">تأخير (ms)</label>
          <Input type="number" value={step.delay} onChange={e => set({ delay: Number(e.target.value) || 0 })} className="h-7 w-24 text-xs" />
        </div>
      )}
    </div>
  );
}

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
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-amber-800">⏳ شريط تقدم مرافق</p>
        <Switch checked={spec.enabled} onCheckedChange={v => set({ enabled: v })} />
      </div>
      {spec.enabled && (
        <>
          <div className="flex flex-wrap gap-1">
            {PROGRESS_PRESETS.map(p => (
              <button key={p.id} onClick={() => set(p.patch)} className="text-[10px] px-2 py-1 rounded-full bg-white border border-amber-200 hover:bg-amber-100 font-bold">{p.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] font-bold text-slate-600">النوع
              <select value={spec.kind} onChange={e => set({ kind: e.target.value as ProgressSpec['kind'] })} className="w-full h-7 rounded border border-slate-200 text-[11px] px-1 bg-white">
                <option value="linear">خطي</option><option value="circular">دائري</option><option value="steps">شرائح</option><option value="flow">متدفق</option>
              </select></label>
            <label className="text-[10px] font-bold text-slate-600">الموضع
              <select value={spec.position} onChange={e => set({ position: e.target.value as ProgressSpec['position'] })} className="w-full h-7 rounded border border-slate-200 text-[11px] px-1 bg-white">
                <option value="inside">داخل الزر</option><option value="above">أعلى الزر</option><option value="below">أسفل الزر</option>
              </select></label>
            <label className="text-[10px] font-bold text-slate-600">المدة (ms)
              <Input type="number" value={spec.duration} onChange={e => set({ duration: Number(e.target.value) || 100 })} className="h-7 text-[11px]" /></label>
            <label className="text-[10px] font-bold text-slate-600">السماكة
              <Input type="number" value={spec.thickness} onChange={e => set({ thickness: Number(e.target.value) || 4 })} className="h-7 text-[11px]" /></label>
            <label className="text-[10px] font-bold text-slate-600">اللون
              <input type="color" value={spec.color} onChange={e => set({ color: e.target.value })} className="w-full h-7 rounded border border-slate-200" /></label>
            <label className="text-[10px] font-bold text-slate-600">لون المسار
              <input type="color" value={spec.trackColor} onChange={e => set({ trackColor: e.target.value })} className="w-full h-7 rounded border border-slate-200" /></label>
          </div>
          <Input value={spec.label} onChange={e => set({ label: e.target.value })} placeholder="نص فوق الشريط" className="h-7 text-[11px]" />
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600">إظهار النسبة</span><Switch checked={spec.showPercent} onCheckedChange={v => set({ showPercent: v })} /></div>
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600">توهج</span><Switch checked={spec.glow} onCheckedChange={v => set({ glow: v })} /></div>
          <label className="text-[10px] font-bold text-slate-600 block">الإجراء عند 100%
            <select value={spec.onComplete} onChange={e => set({ onComplete: e.target.value as ProgressSpec['onComplete'] })} className="w-full h-7 rounded border border-slate-200 text-[11px] px-1 bg-white">
              <option value="none">لا شيء</option><option value="hide">إخفاء الشريط</option><option value="toast">إظهار Toast نجاح</option>
              <option value="openPage">فتح صفحة</option><option value="openModal">فتح نافذة</option>
              <option value="showNode">إظهار مكون</option><option value="hideNode">إخفاء مكون</option>
            </select></label>
          {spec.onComplete !== 'none' && spec.onComplete !== 'hide' && (
            <Input value={spec.completeValue} onChange={e => set({ completeValue: e.target.value })} placeholder="الرسالة أو معرّف الهدف" className="h-7 text-[11px]" />
          )}
          <div className="pt-1">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div style={{ width: `${preview ?? 0}%`, height: '100%', background: spec.color, boxShadow: spec.glow ? `0 0 10px ${spec.color}` : undefined, transition: 'width .1s linear' }} />
            </div>
            <Button size="sm" variant="outline" className="h-6 text-[10px] mt-1.5" onClick={runPreview}>▶ تشغيل المعاينة</Button>
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
      <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 w-full"
        onClick={() => set({ [key]: [...steps, emptyStep()] } as Partial<ActionSpec>)}><Plus size={12} /> إضافة إجراء</Button>
    </div>
  );

  return (
    <div className="fixed inset-y-0 left-0 z-[130] w-[480px] max-w-[92vw] bg-white shadow-2xl border-l border-slate-200 flex flex-col" dir="rtl">
      <div className="h-12 flex items-center justify-between px-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-amber-500" />
          <p className="text-sm font-black text-slate-800">محرر الإجراء</p>
          <Badge variant="outline" className="text-[10px]">{count === 1 ? 'إجراء واحد' : `تسلسل من ${count} إجراءات`}</Badge>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"><X size={15} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {([['single', 'إجراء واحد'], ['sequence', 'تسلسل إجراءات'], ['conditional', 'إجراء شرطي']] as const).map(([v, l]) => (
            <button key={v} onClick={() => set({ mode: v })}
              className={`flex-1 h-8 rounded-lg text-[11px] font-black ${a.mode === v ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>

        {a.mode === 'single' && <StepRow step={a.step} project={project} onChange={s => set({ step: s })} />}

        {a.mode === 'sequence' && (
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-700">📋 التسلسل ({a.steps.length} إجراء)</p>
            {stepList(a.steps, 'steps')}
            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 w-full"
              onClick={() => { toast.success(`تم تنفيذ ${a.steps.length} إجراء بنجاح (محاكاة)`); }}>
              <FlaskConical size={12} /> اختبار التسلسل
            </Button>
          </div>
        )}

        {a.mode === 'conditional' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-2.5 space-y-2">
              <p className="text-[11px] font-black text-slate-700">الشرط</p>
              <div className="grid grid-cols-[1fr_70px_1fr] gap-1.5">
                <Input value={a.condition.field} onChange={e => set({ condition: { ...a.condition, field: e.target.value } })} placeholder="الحقل (مثال: status)" className="h-7 text-[11px]" />
                <select value={a.condition.operator} onChange={e => set({ condition: { ...a.condition, operator: e.target.value } })} className="h-7 rounded border border-slate-200 text-[11px] bg-white">
                  {['=', '≠', '>', '<', 'contains', 'empty', 'notEmpty'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <Input value={a.condition.value} onChange={e => set({ condition: { ...a.condition, value: e.target.value } })} placeholder="القيمة" className="h-7 text-[11px]" />
              </div>
            </div>
            <p className="text-[11px] font-black text-emerald-700">إذا الشرط صحيح، نفّذ:</p>
            {stepList(a.thenSteps, 'thenSteps')}
            <p className="text-[11px] font-black text-red-700">وإلا، نفّذ:</p>
            {stepList(a.elseSteps, 'elseSteps')}
          </div>
        )}

        <ProgressEditor spec={a.progress} onChange={p => set({ progress: p })} />
      </div>

      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <Button className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={() => { toast.success('تم حفظ الإجراء ✓'); onClose(); }}>
          <Save size={14} /> حفظ الإجراء
        </Button>
      </div>
    </div>
  );
}
