// ═══════════════════════════════════════════════════════════════
// محرّك تشغيل تطبيق العميل — يعرض مشروع AppProject كتطبيق حقيقي
// يُستخدم في: المعاينة داخل الاستوديو، وفي الاستعلام، وفي تجربة CMS
// ═══════════════════════════════════════════════════════════════
import {
  AppBar, AppModal, AppNode, AppPage, AppProject, ActionSpec, ActionStep,
} from '@/types/app-builder';
import {
  RuntimeData, DEMO_DATA, interpolate, styleToCss, isNodeVisible, homePage, barsForPage, findNode,
} from '@/lib/app-builder';
import { COMPONENTS_BY_TYPE } from '@/data/app-builder-defaults';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ─────────────── أيقونة ديناميكية ───────────────
export function DynIcon({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) {
  const C = (Icons as any)[name] || Icons.Star;
  return <C size={size} className={className} />;
}

// ─────────────── حالة التشغيل ───────────────
interface RuntimeCtx {
  data: RuntimeData;
  device: number;
  editable: boolean;
  selectedId?: string | null;
  onSelectNode?: (id: string) => void;
  hiddenNodes: Record<string, boolean>;
  toggleHidden: (id: string, v?: boolean) => void;
  textOverrides: Record<string, string>;
  setText: (id: string, v: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  goPage: (id: string) => void;
  back: () => void;
  project: AppProject;
  setVar: (k: string, v: string) => void;
  scrollTo: (id: string) => void;
}

const Ctx = React.createContext<RuntimeCtx | null>(null);
const useRT = () => React.useContext(Ctx)!;

// ─────────────── شريط تقدم مرافق ───────────────
function ProgressBar({ spec, value }: { spec: ActionSpec['progress']; value: number }) {
  const pct = Math.round(value);
  if (spec.kind === 'circular') {
    const r = 26, c = 2 * Math.PI * r;
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke={spec.trackColor} strokeWidth={spec.thickness / 2} />
          <circle cx="32" cy="32" r={r} fill="none" stroke={spec.color} strokeWidth={spec.thickness / 2}
            strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
            transform="rotate(-90 32 32)" style={{ transition: 'stroke-dashoffset .1s linear' }} />
          {spec.showPercent && <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill={spec.color}>{pct}%</text>}
        </svg>
        {spec.label && <span className="text-[11px] text-slate-500">{spec.label}</span>}
      </div>
    );
  }
  if (spec.kind === 'steps') {
    const done = Math.round((value / 100) * spec.steps);
    return (
      <div className="py-2">
        <div className="flex gap-1">
          {Array.from({ length: spec.steps }).map((_, i) => (
            <div key={i} className="flex-1 rounded-full transition-colors"
              style={{ height: spec.thickness, background: i < done ? spec.color : spec.trackColor, borderRadius: spec.radius }} />
          ))}
        </div>
        {spec.showPercent && <p className="text-[10px] text-slate-500 text-center mt-1">{spec.label} {pct}%</p>}
      </div>
    );
  }
  return (
    <div className="py-2">
      <div className="w-full overflow-hidden" style={{ height: spec.thickness, background: spec.trackColor, borderRadius: spec.radius }}>
        <div style={{
          width: `${value}%`, height: '100%', background: spec.color, borderRadius: spec.radius,
          transition: 'width .1s linear',
          boxShadow: spec.glow ? `0 0 12px ${spec.color}` : undefined,
          backgroundImage: spec.kind === 'flow' ? `linear-gradient(90deg, ${spec.color}, #ffffff88, ${spec.color})` : undefined,
        }} />
      </div>
      {(spec.showPercent || spec.label) && (
        <p className="text-[10px] text-slate-500 text-center mt-1">{spec.label} {spec.showPercent ? `${pct}%` : ''}</p>
      )}
    </div>
  );
}

// ─────────────── تنفيذ الإجراءات ───────────────
function useActionRunner(node: AppNode) {
  const rt = useRT();
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const runStep = useCallback((s: ActionStep) => {
    const v = interpolate(s.value, rt.data);
    switch (s.type) {
      case 'openPage': if (s.target) rt.goPage(s.target); break;
      case 'back': rt.back(); break;
      case 'home': rt.goPage(homePage(rt.project).id); break;
      case 'externalLink': if (v) window.open(v, '_blank'); break;
      case 'scrollTo': rt.scrollTo(s.target); break;
      case 'scrollTop': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'scrollBottom': window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); break;
      case 'openModal': if (s.target) rt.openModal(s.target); break;
      case 'closeModal': case 'closeAllModals': rt.closeModal(); break;
      case 'toast': toast[s.tone === 'error' ? 'error' : s.tone === 'warning' ? 'warning' : s.tone === 'info' ? 'info' : 'success'](v || 'تم'); break;
      case 'showNode': rt.toggleHidden(s.target, false); break;
      case 'hideNode': rt.toggleHidden(s.target, true); break;
      case 'toggleNode': rt.toggleHidden(s.target); break;
      case 'setNodeText': rt.setText(s.target, v); break;
      case 'setVar': rt.setVar(s.target, v); break;
      case 'incVar': rt.setVar(s.target, String((Number(rt.data.vars[s.target] || 0) + (Number(v) || 1)))); break;
      case 'decVar': rt.setVar(s.target, String((Number(rt.data.vars[s.target] || 0) - (Number(v) || 1)))); break;
      case 'saveLocal': try { localStorage.setItem(`mapp_var_${s.target}`, v); } catch { /* ignore */ } break;
      case 'clearLocal': try { localStorage.removeItem(`mapp_var_${s.target}`); } catch { /* ignore */ } break;
      case 'toggleDark': document.documentElement.classList.toggle('dark'); break;
      case 'copy': navigator.clipboard?.writeText(v).then(() => toast.success('تم النسخ')); break;
      case 'print': window.print(); break;
      case 'share': if (navigator.share) navigator.share({ text: v }).catch(() => undefined); else toast.info(v); break;
      case 'call': window.location.href = `tel:${v}`; break;
      case 'mail': window.location.href = `mailto:${v}`; break;
      case 'whatsapp': window.open(`https://wa.me/${v.replace(/\D/g, '')}`, '_blank'); break;
      case 'reload': window.location.reload(); break;
      default: break;
    }
  }, [rt]);

  const runSteps = useCallback(async (steps: ActionStep[]) => {
    for (const s of steps) {
      if (s.condition?.enabled && s.condition.field) {
        const ok = interpolate(`{${s.condition.field}}`, rt.data) === interpolate(s.condition.value, rt.data);
        if (!ok) continue;
      }
      if (s.delay) await new Promise(r => setTimeout(r, s.delay));
      runStep(s);
    }
  }, [runStep, rt.data]);

  const fire = useCallback(() => {
    const a = node.action;
    if (!a) return;
    const exec = () => {
      if (a.mode === 'single') runStep(a.step);
      else if (a.mode === 'sequence') void runSteps(a.steps);
      else {
        const ok = interpolate(`{${a.condition.field}}`, rt.data) === interpolate(a.condition.value, rt.data);
        void runSteps(ok ? a.thenSteps : a.elseSteps);
      }
    };
    if (a.progress.enabled) {
      if (timer.current) clearInterval(timer.current);
      setProgress(0);
      const stepPct = 100 / Math.max(1, a.progress.duration / 100);
      timer.current = setInterval(() => {
        setProgress(p => {
          const next = Math.min(100, (p ?? 0) + stepPct);
          if (next >= 100) {
            if (timer.current) clearInterval(timer.current);
            exec();
            if (a.progress.onComplete === 'toast') toast.success(a.progress.completeValue || 'اكتمل');
            if (a.progress.onComplete === 'openPage' && a.progress.completeValue) rt.goPage(a.progress.completeValue);
            if (a.progress.onComplete === 'openModal' && a.progress.completeValue) rt.openModal(a.progress.completeValue);
            if (a.progress.onComplete === 'showNode') rt.toggleHidden(a.progress.completeValue, false);
            if (a.progress.onComplete === 'hideNode') rt.toggleHidden(a.progress.completeValue, true);
            if (a.progress.afterBehavior === 'hide') setTimeout(() => setProgress(null), 400);
          }
          return next;
        });
      }, 100);
    } else exec();
  }, [node.action, runStep, runSteps, rt]);

  return { fire, progress, spec: node.action?.progress };
}

// ─────────────── مكوّنات العرض ───────────────
function NodeView({ node }: { node: AppNode }) {
  const rt = useRT();
  const { fire, progress, spec } = useActionRunner(node);
  const css = styleToCss(node.style);
  const hidden = rt.hiddenNodes[node.id];
  const visible = isNodeVisible(node.visibility, rt.device, rt.data) && !hidden;
  const text = (key: string, fallback = '') =>
    interpolate(rt.textOverrides[node.id] ?? String(node.props[key] ?? fallback), rt.data);

  if (!visible && !rt.editable) return null;

  const select = (e: React.MouseEvent) => {
    if (!rt.editable) return;
    e.stopPropagation();
    rt.onSelectNode?.(node.id);
  };

  const wrapperClass = [
    rt.editable ? 'relative cursor-pointer transition-shadow' : '',
    rt.editable && rt.selectedId === node.id ? 'outline outline-2 outline-blue-500 outline-offset-2 rounded-lg' : '',
    !visible && rt.editable ? 'opacity-30' : '',
    node.style.hoverEffect === 'zoom' ? 'hover:scale-[1.02] transition-transform' : '',
    node.style.hoverEffect === 'lift' ? 'hover:-translate-y-0.5 transition-transform' : '',
  ].filter(Boolean).join(' ');

  const anim = node.style.animation && node.style.animation !== 'none'
    ? {
      initial: node.style.animation === 'fade' ? { opacity: 0 }
        : node.style.animation === 'slide-up' ? { opacity: 0, y: 14 }
          : node.style.animation === 'slide-right' ? { opacity: 0, x: 14 }
            : node.style.animation === 'zoom' ? { opacity: 0, scale: 0.94 } : { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0, x: 0, scale: 1 },
      transition: { duration: (node.style.animationDuration || 300) / 1000 },
    } : {};

  const kids = <>{node.children.map(c => <NodeView key={c.id} node={c} />)}</>;

  let body: React.ReactNode = null;
  switch (node.type) {
    case 'container': case 'row': case 'column': case 'grid': case 'card': case 'buttonGroup':
      body = <div style={css}>{kids}{rt.editable && node.children.length === 0 && <span className="text-[10px] text-slate-400 border border-dashed border-slate-300 rounded-lg py-3 text-center block">حاوية فارغة — أفلت مكونات هنا</span>}</div>;
      break;
    case 'section':
      body = <div style={css}><p className="text-sm font-black text-slate-800 mb-2">{text('title')}</p>{kids}</div>;
      break;
    case 'tabs': {
      body = <TabsRender node={node} css={css} />;
      break;
    }
    case 'accordion': case 'expandableCard':
      body = <AccordionRender node={node} css={css} label={text('title')} />;
      break;
    case 'carousel':
      body = <CarouselRender node={node} css={css} />;
      break;
    case 'embeddedPage': {
      const pg = rt.project.pages.find(p => p.id === node.props.pageId);
      body = <div style={css} className="p-2">{pg ? <PageBody page={pg} /> : <span className="text-[11px] text-slate-400">اختر صفحة لعرضها</span>}</div>;
      break;
    }
    case 'iframe':
      body = <iframe src={String(node.props.src || '')} title={node.name} style={{ ...css, width: '100%', height: Number(node.props.height) || 240, border: 0 }} />;
      break;
    case 'h1': body = <h1 style={css}>{text('text')}</h1>; break;
    case 'h2': body = <h2 style={css}>{text('text')}</h2>; break;
    case 'h3': body = <h3 style={css}>{text('text')}</h3>; break;
    case 'paragraph': case 'dynamicText':
      body = <p style={{ ...css, whiteSpace: 'pre-line' }}>{text('text')}</p>; break;
    case 'typewriter': body = <Typewriter text={text('text')} css={css} />; break;
    case 'quote': body = <blockquote style={{ ...css, borderRight: '3px solid #94a3b8' }}>{text('text')}</blockquote>; break;
    case 'list': {
      const items: string[] = node.props.items || [];
      body = node.props.ordered
        ? <ol style={css} className="list-decimal pr-5 space-y-1">{items.map((it, i) => <li key={i}>{interpolate(it, rt.data)}</li>)}</ol>
        : <ul style={css} className="list-disc pr-5 space-y-1">{items.map((it, i) => <li key={i}>{interpolate(it, rt.data)}</li>)}</ul>;
      break;
    }
    case 'checklist':
      body = <div style={css} className="space-y-1">{(node.props.items || []).map((it: string, i: number) => (
        <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-blue-600" />{interpolate(it, rt.data)}</label>
      ))}</div>;
      break;
    case 'badgeText': body = <span style={{ ...css, display: 'inline-block' }}>{text('text')}</span>; break;
    case 'codeBlock': body = <pre style={{ ...css, overflowX: 'auto' }}><code>{text('text')}</code></pre>; break;
    case 'divider': body = <div style={{ ...css, height: 1, background: node.style.bg || '#e2e8f0' }} />; break;
    case 'spacer': body = <div style={{ height: Number(node.props.height) || 24 }} />; break;
    case 'image':
      body = node.props.src
        ? <img src={String(node.props.src)} alt={String(node.props.alt || '')} style={{ ...css, width: '100%', height: Number(node.props.height) || 160, objectFit: 'cover' }} />
        : <div style={{ ...css, height: Number(node.props.height) || 160 }} className="bg-slate-100 flex items-center justify-center text-slate-400"><Icons.Image size={26} /></div>;
      break;
    case 'gallery': {
      const imgs: string[] = node.props.images || [];
      body = <div style={{ ...css, display: 'grid', gridTemplateColumns: `repeat(${node.props.columns || 3},minmax(0,1fr))` }}>
        {imgs.length ? imgs.map((s, i) => <img key={i} src={s} alt="" className="w-full h-24 object-cover rounded-lg" />)
          : <div className="col-span-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><Icons.Images size={22} /></div>}
      </div>;
      break;
    }
    case 'icon': body = <span style={css}><DynIcon name={String(node.props.icon || 'Star')} size={Number(node.props.size) || 32} /></span>; break;
    case 'logo': body = rt.project.logo ? <img src={rt.project.logo} alt={rt.project.name} style={{ ...css, height: 40, objectFit: 'contain' }} /> : <span style={css} className="font-black">{rt.project.name}</span>; break;
    case 'qrcode': body = <div style={css} className="flex justify-center"><QRCodeSVG value={String(node.props.value || ' ')} size={Number(node.props.size) || 128} /></div>; break;
    case 'video':
      body = node.props.src
        ? <video src={String(node.props.src)} controls style={{ ...css, width: '100%', height: Number(node.props.height) || 220 }} />
        : <div style={{ ...css, height: Number(node.props.height) || 220 }} className="bg-slate-900 text-slate-500 flex items-center justify-center rounded-xl"><Icons.Video size={26} /></div>;
      break;
    case 'audio': body = <audio src={String(node.props.src || '')} controls style={css} className="w-full" />; break;
    case 'button': case 'buttonOutline': case 'buttonGhost': case 'fab': case 'copyButton':
      body = (
        <div>
          <button type="button" style={{ ...css, width: node.style.width || '100%' }}
            className="inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            onClick={(e) => { if (rt.editable) return; e.stopPropagation(); if (node.type === 'copyButton') { navigator.clipboard?.writeText(interpolate(String(node.props.value || ''), rt.data)); toast.success('تم النسخ'); } fire(); }}>
            {node.props.icon ? <DynIcon name={String(node.props.icon)} size={16} /> : null}
            {text('label')}
            {rt.editable && node.action && node.action.step.type !== 'none' && <Icons.Zap size={12} className="opacity-70" />}
          </button>
          {spec?.enabled && progress != null && <ProgressBar spec={spec} value={progress} />}
        </div>
      );
      break;
    case 'linkExternal':
      body = <a href={String(node.props.url || '#')} target="_blank" rel="noreferrer" style={css} className="inline-flex items-center gap-1.5">{text('label')} <Icons.ExternalLink size={13} /></a>;
      break;
    case 'linkWhatsapp':
      body = <button type="button" style={{ ...css, width: '100%' }} className="inline-flex items-center justify-center gap-2"
        onClick={() => !rt.editable && window.open(`https://wa.me/${String(node.props.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(String(node.props.message || ''))}`, '_blank')}>
        <Icons.MessageCircle size={16} />{text('label')}</button>;
      break;
    case 'linkCall':
      body = <button type="button" style={{ ...css, width: '100%' }} className="inline-flex items-center justify-center gap-2"
        onClick={() => !rt.editable && (window.location.href = `tel:${node.props.phone}`)}>
        <Icons.Phone size={16} />{text('label')}</button>;
      break;
    case 'inputText': case 'inputEmail': case 'inputPhone': case 'inputNumber': case 'inputPassword': case 'inputDate': case 'inputFile':
      body = <label style={css} className="block">
        <span className="text-xs font-bold text-slate-600 block mb-1">{text('label')}</span>
        <input type={node.type === 'inputEmail' ? 'email' : node.type === 'inputNumber' ? 'number' : node.type === 'inputPassword' ? 'password' : node.type === 'inputDate' ? 'date' : node.type === 'inputFile' ? 'file' : node.type === 'inputPhone' ? 'tel' : 'text'}
          placeholder={String(node.props.placeholder || '')} disabled={rt.editable}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
      </label>;
      break;
    case 'inputTextarea':
      body = <label style={css} className="block"><span className="text-xs font-bold text-slate-600 block mb-1">{text('label')}</span>
        <textarea rows={Number(node.props.rows) || 3} placeholder={String(node.props.placeholder || '')} disabled={rt.editable}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" /></label>;
      break;
    case 'checkbox': body = <label style={css} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-blue-600" disabled={rt.editable} />{text('label')}</label>; break;
    case 'switch': body = <label style={css} className="flex items-center justify-between gap-3 text-sm">{text('label')}<input type="checkbox" className="accent-blue-600 w-9 h-5" disabled={rt.editable} /></label>; break;
    case 'radioGroup':
      body = <div style={css}><p className="text-xs font-bold text-slate-600 mb-1">{text('label')}</p>
        {(node.props.options || []).map((o: string, i: number) => <label key={i} className="flex items-center gap-2 text-sm"><input type="radio" name={node.id} className="accent-blue-600" disabled={rt.editable} />{o}</label>)}</div>;
      break;
    case 'select':
      body = <label style={css} className="block"><span className="text-xs font-bold text-slate-600 block mb-1">{text('label')}</span>
        <select disabled={rt.editable} className="w-full h-10 rounded-lg border border-slate-200 px-2 text-sm bg-white">
          {(node.props.options || []).map((o: string, i: number) => <option key={i}>{o}</option>)}</select></label>;
      break;
    case 'rating':
      body = <div style={css}><p className="text-xs font-bold text-slate-600 mb-1">{text('label')}</p>
        <div className="flex gap-1 text-amber-400">{[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} size={18} fill="currentColor" />)}</div></div>;
      break;
    case 'otp':
      body = <div style={css}><p className="text-xs font-bold text-slate-600 mb-1">{text('label')}</p>
        <div className="flex gap-2" dir="ltr">{Array.from({ length: Number(node.props.digits) || 4 }).map((_, i) =>
          <input key={i} maxLength={1} disabled={rt.editable} className="w-10 h-11 text-center rounded-lg border border-slate-200 font-black" />)}</div></div>;
      break;
    case 'loginForm':
      body = <div style={css} className="space-y-2"><p className="text-sm font-black">{text('title')}</p>
        <input placeholder="اسم المستخدم" disabled={rt.editable} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        <input type="password" placeholder="كلمة المرور" disabled={rt.editable} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        <button className="w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-bold">دخول</button></div>;
      break;
    case 'contactForm':
      body = <div style={css} className="space-y-2"><p className="text-sm font-black">{text('title')}</p>
        <input placeholder="الاسم" disabled={rt.editable} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        <textarea rows={3} placeholder="رسالتك" disabled={rt.editable} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button className="w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-bold">إرسال</button></div>;
      break;
    case 'infoCard':
      body = <div style={css} className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><DynIcon name={String(node.props.icon || 'Info')} size={18} /></span>
        <div className="min-w-0"><p className="text-[11px] font-bold text-slate-400">{text('title')}</p>
          <p className="text-lg font-black text-slate-800 truncate">{text('value')}</p>
          {node.props.hint ? <p className="text-[10px] text-slate-400">{text('hint')}</p> : null}</div></div>;
      break;
    case 'statCard':
      body = <div style={css}><div className="flex items-center justify-between"><p className="text-[11px] opacity-70 font-bold">{text('title')}</p>
        <DynIcon name={String(node.props.icon || 'TrendingUp')} size={16} /></div>
        <p className="text-2xl font-black mt-1">{text('value')}</p>
        <p className="text-[11px] opacity-70">{text('change')}</p></div>;
      break;
    case 'profileCard':
      body = <div style={css} className="flex items-center gap-3">
        {node.props.avatar ? <img src={String(node.props.avatar)} alt="" className="w-12 h-12 rounded-full object-cover" />
          : <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center"><Icons.UserRound size={22} className="text-slate-400" /></span>}
        <div><p className="text-sm font-black text-slate-800">{text('name')}</p><p className="text-[11px] text-slate-400">{text('title')}</p></div></div>;
      break;
    case 'priceCard':
      body = <div style={css}><p className="text-sm font-black text-slate-800">{text('plan')}</p>
        <p className="text-3xl font-black text-blue-600 my-1">{text('price')} <span className="text-xs text-slate-400">{text('period')}</span></p>
        <ul className="space-y-1 text-xs text-slate-600">{(node.props.features || []).map((f: string, i: number) => <li key={i} className="flex items-center gap-1.5"><Icons.Check size={12} className="text-emerald-500" />{f}</li>)}</ul></div>;
      break;
    case 'alertCard': {
      const kind = String(node.props.kind || 'info');
      const tones: Record<string, string> = { info: 'bg-blue-50 text-blue-800 border-blue-200', success: 'bg-emerald-50 text-emerald-800 border-emerald-200', warning: 'bg-amber-50 text-amber-800 border-amber-200', danger: 'bg-red-50 text-red-800 border-red-200' };
      body = <div style={css} className={`border text-sm font-bold ${tones[kind] || tones.info}`}>{text('text')}</div>;
      break;
    }
    case 'balanceCard':
      body = <div style={css}><p className="text-xs opacity-80 font-bold">{text('title')}</p>
        <p className="text-3xl font-black mt-1 tabular-nums">{text('value')} <span className="text-sm opacity-80">{rt.data.currency}</span></p></div>;
      break;
    case 'simpleTable': {
      const cols: string[] = node.props.columns || [];
      const rows: string[][] = node.props.rows || [];
      body = <div style={css} className="overflow-x-auto"><table className="w-full text-xs">
        <thead><tr className="bg-slate-50">{cols.map((c, i) => <th key={i} className="p-2 text-right font-black text-slate-500">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100">{r.map((c, j) => <td key={j} className="p-2 text-slate-700">{interpolate(c, rt.data)}</td>)}</tr>)}</tbody>
      </table></div>;
      break;
    }
    case 'opsTable': {
      const ops = (rt.data.vars.__ops ? JSON.parse(rt.data.vars.__ops) : []) as { operation: string; amount: string; date: string; status: string }[];
      const list = ops.slice(0, Number(node.props.max) || 5);
      body = <div style={css} className="overflow-x-auto"><table className="w-full text-xs">
        <thead><tr className="bg-slate-50">{['العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => <th key={h} className="p-2 text-right font-black text-slate-500">{h}</th>)}</tr></thead>
        <tbody>{(list.length ? list : [{ operation: 'عملية تجريبية', amount: '1,000', date: rt.data.date, status: 'مكتمل' }]).map((o, i) => (
          <tr key={i} className="border-t border-slate-100"><td className="p-2 font-bold text-slate-700">{o.operation}</td><td className="p-2">{o.amount}</td><td className="p-2 text-slate-400">{o.date}</td><td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">{o.status}</span></td></tr>))}</tbody>
      </table></div>;
      break;
    }
    case 'repeater': {
      const count = Number(node.props.count) || 3;
      body = <div style={css}>{Array.from({ length: count }).map((_, i) => (
        <div key={i}>{node.children.map(c => <NodeView key={`${c.id}-${i}`} node={c} />)}</div>))}</div>;
      break;
    }
    case 'lineChart': case 'sparkline': {
      const data: number[] = node.props.data || [];
      const max = Math.max(1, ...data);
      const pts = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * 100},${40 - (v / max) * 36}`).join(' ');
      body = <div style={css}>{node.props.title ? <p className="text-xs font-black text-slate-600 mb-1">{text('title')}</p> : null}
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-16"><polyline points={pts} fill="none" stroke={rt.project.design.primary} strokeWidth="2" /></svg></div>;
      break;
    }
    case 'barChart': {
      const data: number[] = node.props.data || [];
      const max = Math.max(1, ...data);
      body = <div style={css}><p className="text-xs font-black text-slate-600 mb-1">{text('title')}</p>
        <div className="flex items-end gap-1.5 h-20">{data.map((v, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, background: rt.project.design.primary }} />)}</div></div>;
      break;
    }
    case 'pieChart': {
      const data: number[] = node.props.data || [];
      const total = data.reduce((a, b) => a + b, 0) || 1;
      const colors = [rt.project.design.primary, rt.project.design.secondary, rt.project.design.success, rt.project.design.warning];
      let acc = 0;
      const grad = data.map((v, i) => { const from = (acc / total) * 360; acc += v; return `${colors[i % colors.length]} ${from}deg ${(acc / total) * 360}deg`; }).join(',');
      body = <div style={css}><p className="text-xs font-black text-slate-600 mb-1">{text('title')}</p>
        <div className="w-24 h-24 rounded-full mx-auto" style={{ background: `conic-gradient(${grad})` }} /></div>;
      break;
    }
    case 'gauge': {
      const v = Number(node.props.value) || 0;
      body = <div style={css} className="text-center"><p className="text-xs font-black text-slate-600">{text('title')}</p>
        <svg viewBox="0 0 100 55" className="w-32 mx-auto"><path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={rt.project.design.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray={126} strokeDashoffset={126 * (1 - v / 100)} /></svg>
        <p className="text-lg font-black text-slate-800 -mt-2">{v}%</p></div>;
      break;
    }
    case 'progressLinear': {
      const v = Number(node.props.value) || 0;
      body = <div style={css}><div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1"><span>{text('title')}</span><span>{v}%</span></div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: String(node.props.color || rt.project.design.primary) }} /></div></div>;
      break;
    }
    case 'progressCircle': {
      const v = Number(node.props.value) || 0; const r = 26, c = 2 * Math.PI * r;
      body = <div style={css} className="text-center"><svg width="70" height="70" viewBox="0 0 64 64" className="mx-auto">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={String(node.props.color || rt.project.design.primary)} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform="rotate(-90 32 32)" />
        <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{v}%</text></svg>
        <p className="text-[11px] font-bold text-slate-500">{text('title')}</p></div>;
      break;
    }
    case 'timeline':
      body = <div style={css} className="space-y-2">{(node.props.events || []).map((e: string, i: number) => (
        <div key={i} className="flex gap-2 items-start"><span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: rt.project.design.primary }} /><p className="text-sm text-slate-600">{interpolate(e, rt.data)}</p></div>))}</div>;
      break;
    case 'countdown': body = <Countdown node={node} css={css} label={text('title')} />; break;
    case 'counterUp': body = <CounterUp node={node} css={css} label={text('title')} />; break;
    case 'liveClock': body = <LiveClock css={css} />; break;
    case 'calculator': body = <ProfitCalculator node={node} css={css} />; break;
    case 'currencyConverter': body = <Converter node={node} css={css} />; break;
    case 'poll':
      body = <div style={css}><p className="text-sm font-black text-slate-800 mb-2">{text('question')}</p>
        {(node.props.options || []).map((o: string, i: number) => <button key={i} className="w-full text-right px-3 py-2 mb-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm">{o}</button>)}</div>;
      break;
    case 'map':
      body = <iframe title="map" style={{ ...css, width: '100%', height: Number(node.props.height) || 200, border: 0 }}
        src={`https://maps.google.com/maps?q=${node.props.lat},${node.props.lng}&z=13&output=embed`} />;
      break;
    case 'customHtml': body = <div style={css} dangerouslySetInnerHTML={{ __html: interpolate(String(node.props.html || ''), rt.data) }} />; break;
    case 'pdfViewer': body = <iframe title="pdf" src={String(node.props.src || '')} style={{ ...css, width: '100%', height: Number(node.props.height) || 320, border: 0 }} />; break;
    default:
      body = <div style={css} className="text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg p-3">{COMPONENTS_BY_TYPE[node.type]?.label || node.type}</div>;
  }

  const El: any = Object.keys(anim).length ? motion.div : 'div';
  return (
    <El id={`node-${node.id}`} data-node-id={node.id} className={wrapperClass} onClick={select} {...anim}>
      {body}
      {rt.editable && rt.selectedId === node.id && (
        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black z-10 pointer-events-none">{node.name}</span>
      )}
      {rt.editable && !visible && (
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-700 text-white text-[9px] font-black z-10 pointer-events-none">مخفي حالياً</span>
      )}
    </El>
  );
}

// ─────────────── مكونات مساعدة تفاعلية ───────────────
function TabsRender({ node, css }: { node: AppNode; css: React.CSSProperties }) {
  const [i, setI] = useState(0);
  const tabs: string[] = node.props.tabs || [];
  return (
    <div style={css}>
      <div className="flex gap-1 border-b border-slate-200 mb-2">
        {tabs.map((t, idx) => (
          <button key={idx} onClick={(e) => { e.stopPropagation(); setI(idx); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-lg ${i === idx ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}>{t}</button>
        ))}
      </div>
      {node.children[i] ? <NodeView node={node.children[i]} /> : <p className="text-[11px] text-slate-400">أضف مكوناً لكل تبويب</p>}
    </div>
  );
}

function AccordionRender({ node, css, label }: { node: AppNode; css: React.CSSProperties; label: string }) {
  const [open, setOpen] = useState(!!node.props.open);
  return (
    <div style={css}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} className="w-full flex items-center justify-between text-sm font-bold text-slate-700">
        {label}<Icons.ChevronDown size={15} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && <div className="mt-2 space-y-2">{node.children.map(c => <NodeView key={c.id} node={c} />)}</div>}
    </div>
  );
}

function CarouselRender({ node, css }: { node: AppNode; css: React.CSSProperties }) {
  const [i, setI] = useState(0);
  const n = node.children.length;
  return (
    <div style={css}>
      {n ? node.children[i % n] && <NodeView node={node.children[i % n]} /> : <p className="text-[11px] text-slate-400">أضف شرائح</p>}
      {n > 1 && <div className="flex justify-center gap-2 mt-2">
        <button onClick={e => { e.stopPropagation(); setI(v => (v - 1 + n) % n); }} className="p-1 rounded bg-slate-100"><Icons.ChevronRight size={14} /></button>
        <button onClick={e => { e.stopPropagation(); setI(v => (v + 1) % n); }} className="p-1 rounded bg-slate-100"><Icons.ChevronLeft size={14} /></button>
      </div>}
    </div>
  );
}

function Typewriter({ text, css }: { text: string; css: React.CSSProperties }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const iv = setInterval(() => { i++; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, 55);
    return () => clearInterval(iv);
  }, [text]);
  return <p style={css}>{shown}<span className="animate-pulse">|</span></p>;
}

function Countdown({ node, css, label }: { node: AppNode; css: React.CSSProperties; label: string }) {
  const total = Number(node.props.seconds) || 60;
  const [left, setLeft] = useState(total);
  useEffect(() => { setLeft(total); const iv = setInterval(() => setLeft(l => (l > 0 ? l - 1 : 0)), 1000); return () => clearInterval(iv); }, [total]);
  const m = String(Math.floor(left / 60)).padStart(2, '0'), s = String(left % 60).padStart(2, '0');
  return <div style={css} className="text-center"><p className="text-[11px] font-bold text-slate-500">{label}</p><p className="text-2xl font-black tabular-nums text-slate-800" dir="ltr">{m}:{s}</p></div>;
}

function CounterUp({ node, css, label }: { node: AppNode; css: React.CSSProperties; label: string }) {
  const to = Number(node.props.to) || 100;
  const [v, setV] = useState(0);
  useEffect(() => { let cur = 0; const step = Math.max(1, Math.round(to / 40)); const iv = setInterval(() => { cur = Math.min(to, cur + step); setV(cur); if (cur >= to) clearInterval(iv); }, 40); return () => clearInterval(iv); }, [to]);
  return <div style={css} className="text-center"><p className="text-[11px] font-bold text-slate-500">{label}</p>
    <p className="text-2xl font-black tabular-nums text-slate-800">{node.props.prefix}{v.toLocaleString()}{node.props.suffix}</p></div>;
}

function LiveClock({ css }: { css: React.CSSProperties }) {
  const [t, setT] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setT(new Date()), 1000); return () => clearInterval(iv); }, []);
  return <p style={css} className="tabular-nums text-center" dir="ltr">{t.toLocaleTimeString('ar-SA')}</p>;
}

function ProfitCalculator({ node, css }: { node: AppNode; css: React.CSSProperties }) {
  const [amount, setAmount] = useState(1000);
  const rate = Number(node.props.rate) || 12;
  return <div style={css}>
    <p className="text-xs font-black text-slate-700 mb-2">حاسبة الأرباح ({rate}%)</p>
    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} onClick={e => e.stopPropagation()}
      className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm mb-2" />
    <p className="text-sm font-black text-emerald-700">الربح المتوقع: {Math.round(amount * rate / 100).toLocaleString()}</p>
  </div>;
}

function Converter({ node, css }: { node: AppNode; css: React.CSSProperties }) {
  const [v, setV] = useState(100);
  const rate = Number(node.props.rate) || 1;
  return <div style={css}>
    <p className="text-xs font-black text-slate-700 mb-2">محول {node.props.from} → {node.props.to}</p>
    <input type="number" value={v} onChange={e => setV(Number(e.target.value) || 0)} onClick={e => e.stopPropagation()}
      className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm mb-2" />
    <p className="text-sm font-black text-blue-700">{(v * rate).toLocaleString()} {node.props.to}</p>
  </div>;
}

// ─────────────── الأشرطة والصفحات ───────────────
function BarView({ bar }: { bar: AppBar }) {
  const rt = useRT();
  const horizontal = ['top', 'bottom', 'sub', 'announcement'].includes(bar.kind);
  const showOn = rt.device <= 480 ? bar.showOn.mobile : rt.device <= 1024 ? bar.showOn.tablet : bar.showOn.desktop;
  if (!showOn) return null;
  return (
    <div
      data-bar-id={bar.id}
      onClick={(e) => { if (rt.editable) { e.stopPropagation(); rt.onSelectNode?.(`bar:${bar.id}`); } }}
      className={rt.editable ? 'cursor-pointer' : ''}
      style={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        justifyContent: bar.justify, alignItems: 'center',
        gap: bar.gap, padding: bar.padding,
        background: bar.bg, color: bar.color, borderRadius: bar.radius,
        [horizontal ? 'minHeight' : 'width']: bar.size,
        boxShadow: bar.shadow === 'none' ? undefined : '0 4px 14px rgba(15,23,42,0.12)',
      } as React.CSSProperties}>
      {bar.nodes.length
        ? bar.nodes.map(n => <NodeView key={n.id} node={n} />)
        : <span className="text-[10px] opacity-60">شريط فارغ — أضف مكونات</span>}
    </div>
  );
}

function PageBody({ page }: { page: AppPage }) {
  return (
    <div style={{ background: page.bg }} className="p-3 space-y-3">
      {page.nodes.length
        ? page.nodes.map(n => <NodeView key={n.id} node={n} />)
        : <div className="border-2 border-dashed border-slate-200 rounded-2xl py-14 text-center text-slate-400">
          <Icons.Palette size={34} className="mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold">الصفحة فارغة</p>
          <p className="text-[11px]">أضف مكونات من مكتبة المكونات</p>
        </div>}
    </div>
  );
}

// ─────────────── النافذة المنبثقة ───────────────
function ModalView({ modal, onClose }: { modal: AppModal; onClose: () => void }) {
  useEffect(() => {
    if (!modal.closeOnEscape) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal.closeOnEscape, onClose]);
  useEffect(() => {
    if (modal.kind === 'toast' && modal.autoHideSeconds > 0) {
      const t = setTimeout(onClose, modal.autoHideSeconds * 1000);
      return () => clearTimeout(t);
    }
  }, [modal, onClose]);

  const sizes: Record<string, number> = { sm: 400, md: 600, lg: 800, xl: 1000, full: 99999 };
  const width = sizes[modal.size] || 600;

  const positions: Record<string, string> = {
    modal: 'items-center justify-center',
    fullscreen: 'items-stretch justify-stretch',
    'drawer-right': 'items-stretch justify-end',
    'drawer-left': 'items-stretch justify-start',
    'drawer-top': 'items-start justify-center',
    sheet: 'items-end justify-center',
    popover: 'items-start justify-end',
    alert: 'items-center justify-center',
    toast: 'items-start justify-center',
  };

  const enter: Record<string, any> = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    'slide-up': { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
    'slide-down': { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
    'slide-right': { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
    'slide-left': { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
    zoom: { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 } },
    pop: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  };

  return (
    <div className={`absolute inset-0 z-40 flex p-3 ${positions[modal.kind] || positions.modal}`}
      style={{ background: modal.backdrop ? modal.backdropColor : 'transparent' }}
      onClick={() => modal.closeOnBackdrop && onClose()}>
      <motion.div {...(enter[modal.enterAnimation] || enter.zoom)} transition={{ duration: modal.duration / 1000 }}
        onClick={e => e.stopPropagation()}
        className="bg-white shadow-2xl overflow-y-auto max-h-full"
        style={{
          width: modal.kind === 'fullscreen' || modal.size === 'full' ? '100%' : Math.min(width, 10000),
          maxWidth: '100%',
          height: modal.kind === 'fullscreen' ? '100%' : undefined,
          borderRadius: modal.radius,
        }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <p className="text-sm font-black text-slate-800">{modal.name}</p>
          {modal.closable && <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><Icons.X size={16} /></button>}
        </div>
        <div className="p-3 space-y-3">{modal.nodes.map(n => <NodeView key={n.id} node={n} />)}</div>
      </motion.div>
    </div>
  );
}

// ─────────────── المحرّك الرئيسي ───────────────
export function AppRuntime({
  project, data = DEMO_DATA, device = 375, editable = false, selectedId, onSelectNode,
  currentPageId, onPageChange, previewModalId, className = '',
}: {
  project: AppProject;
  data?: RuntimeData;
  device?: number;
  editable?: boolean;
  selectedId?: string | null;
  onSelectNode?: (id: string) => void;
  currentPageId?: string;
  onPageChange?: (id: string) => void;
  /** عرض نافذة معينة للتحرير/المعاينة */
  previewModalId?: string | null;
  className?: string;
}) {
  const [internalPage, setInternalPage] = useState<string>(currentPageId || homePage(project).id);
  const pageId = currentPageId ?? internalPage;
  const [history, setHistory] = useState<string[]>([]);
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({});
  const [vars, setVars] = useState<Record<string, string>>({});

  const goPage = useCallback((id: string) => {
    setHistory(h => [...h, pageId]);
    if (onPageChange) onPageChange(id); else setInternalPage(id);
    setOpenModalId(null);
  }, [pageId, onPageChange]);

  const back = useCallback(() => {
    setHistory(h => {
      const prev = h[h.length - 1];
      if (prev) { if (onPageChange) onPageChange(prev); else setInternalPage(prev); }
      return h.slice(0, -1);
    });
  }, [onPageChange]);

  const page = project.pages.find(p => p.id === pageId) || homePage(project);

  // نوافذ تفتح تلقائياً
  useEffect(() => {
    if (editable) return;
    const auto = project.modals.find(m => m.enabled && m.autoOpen);
    if (auto) {
      const t = setTimeout(() => setOpenModalId(auto.id), auto.autoOpenDelay || 0);
      return () => clearTimeout(t);
    }
  }, [project.modals, editable]);

  const runtimeData: RuntimeData = useMemo(() => ({ ...data, vars: { ...data.vars, ...vars } }), [data, vars]);

  const ctx: RuntimeCtx = useMemo(() => ({
    data: runtimeData, device, editable, selectedId, onSelectNode,
    hiddenNodes,
    toggleHidden: (id, v) => setHiddenNodes(h => ({ ...h, [id]: v ?? !h[id] })),
    textOverrides,
    setText: (id, v) => setTextOverrides(t => ({ ...t, [id]: v })),
    openModal: (id) => setOpenModalId(id),
    closeModal: () => setOpenModalId(null),
    goPage, back, project,
    setVar: (k, v) => setVars(s => ({ ...s, [k]: v })),
    scrollTo: (id) => document.getElementById(`node-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
  }), [runtimeData, device, editable, selectedId, onSelectNode, hiddenNodes, textOverrides, goPage, back, project]);

  const bars = barsForPage(project, page.id);
  const topBars = bars.filter(b => b.kind === 'announcement' || b.kind === 'top' || b.kind === 'sub');
  const bottomBars = bars.filter(b => b.kind === 'bottom');
  const rightBars = bars.filter(b => b.kind === 'right');
  const leftBars = bars.filter(b => b.kind === 'left');
  const floatBars = bars.filter(b => b.kind === 'floating');

  const editingModal = previewModalId ? project.modals.find(m => m.id === previewModalId) : null;
  const shownModal = editingModal || (openModalId ? project.modals.find(m => m.id === openModalId) : null);

  return (
    <Ctx.Provider value={ctx}>
      <div dir={project.dir === 'ltr' ? 'ltr' : 'rtl'} className={`relative flex flex-col min-h-full ${className}`}
        style={{ background: project.design.bgMain, color: project.design.textMain, fontSize: project.design.baseSize }}>
        {topBars.map(b => <BarView key={b.id} bar={b} />)}
        <div className="flex-1 flex min-h-0">
          {rightBars.map(b => <BarView key={b.id} bar={b} />)}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <PageBody page={page} />
          </div>
          {leftBars.map(b => <BarView key={b.id} bar={b} />)}
        </div>
        {bottomBars.map(b => <BarView key={b.id} bar={b} />)}
        {floatBars.map(b => (
          <div key={b.id} className="absolute bottom-16 left-4 z-30"><BarView bar={b} /></div>
        ))}
        <AnimatePresence>
          {shownModal && <ModalView key={shownModal.id} modal={shownModal} onClose={() => setOpenModalId(null)} />}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
