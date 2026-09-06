// أدوات شجرة المكونات + حساب التنسيقات + تقييم الشروط + استبدال المتغيرات
import { AppNode, AppPage, AppProject, NodeStyle, VisibilityRule } from '@/types/app-builder';
import { uid } from '@/lib/random';

// ─────────── نسخ عميق ───────────
export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function cloneNode(node: AppNode): AppNode {
  const c = clone(node);
  const reId = (n: AppNode) => { n.id = uid(); n.children.forEach(reId); };
  reId(c);
  return c;
}

// ─────────── بحث وتعديل داخل الشجرة ───────────
export function findNode(nodes: AppNode[], id: string): AppNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const f = findNode(n.children, id);
    if (f) return f;
  }
  return null;
}

export function findParent(nodes: AppNode[], id: string, parent: AppNode | null = null): AppNode | null {
  for (const n of nodes) {
    if (n.id === id) return parent;
    const f = findParent(n.children, id, n);
    if (f !== null || n.children.some(c => c.id === id)) return f ?? n;
  }
  return null;
}

export function nodePath(nodes: AppNode[], id: string, trail: AppNode[] = []): AppNode[] | null {
  for (const n of nodes) {
    const next = [...trail, n];
    if (n.id === id) return next;
    const f = nodePath(n.children, id, next);
    if (f) return f;
  }
  return null;
}

export function updateNode(nodes: AppNode[], id: string, patch: (n: AppNode) => AppNode): AppNode[] {
  return nodes.map(n => {
    if (n.id === id) return patch(n);
    return { ...n, children: updateNode(n.children, id, patch) };
  });
}

export function removeNode(nodes: AppNode[], id: string): AppNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: removeNode(n.children, id) }));
}

export function insertNode(nodes: AppNode[], parentId: string | null, node: AppNode, index?: number): AppNode[] {
  if (!parentId) {
    const copy = [...nodes];
    copy.splice(index ?? copy.length, 0, node);
    return copy;
  }
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = [...n.children];
      children.splice(index ?? children.length, 0, node);
      return { ...n, children };
    }
    return { ...n, children: insertNode(n.children, parentId, node, index) };
  });
}

export function duplicateNode(nodes: AppNode[], id: string): AppNode[] {
  const out: AppNode[] = [];
  for (const n of nodes) {
    const next = { ...n, children: duplicateNode(n.children, id) };
    out.push(next);
    if (n.id === id) {
      const c = cloneNode(n);
      c.name = `${n.name} — نسخة`;
      out.push(c);
    }
  }
  return out;
}

export function moveNode(nodes: AppNode[], id: string, dir: -1 | 1): AppNode[] {
  const idx = nodes.findIndex(n => n.id === id);
  if (idx >= 0) {
    const target = idx + dir;
    if (target < 0 || target >= nodes.length) return nodes;
    const copy = [...nodes];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    return copy;
  }
  return nodes.map(n => ({ ...n, children: moveNode(n.children, id, dir) }));
}

export function countNodes(nodes: AppNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

export function maxDepth(nodes: AppNode[], d = 1): number {
  return nodes.reduce((acc, n) => Math.max(acc, n.children.length ? maxDepth(n.children, d + 1) : d), 0);
}

export function flattenNodes(nodes: AppNode[], trail = ''): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  nodes.forEach(n => {
    const label = trail ? `${trail} › ${n.name}` : n.name;
    out.push({ id: n.id, label });
    out.push(...flattenNodes(n.children, label));
  });
  return out;
}

/** كل عقد المشروع (صفحات + أشرطة + نوافذ) لاستخدامها في محرر الإجراءات */
export function allProjectNodes(p: AppProject): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  p.pages.forEach(pg => out.push(...flattenNodes(pg.nodes, `📄 ${pg.name}`)));
  p.bars.forEach(b => out.push(...flattenNodes(b.nodes, `🔗 ${b.name}`)));
  p.modals.forEach(m => out.push(...flattenNodes(m.nodes, `💬 ${m.name}`)));
  return out;
}

// ─────────── تحويل NodeStyle إلى CSS ───────────
const SHADOWS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(15,23,42,0.06)',
  md: '0 4px 14px rgba(15,23,42,0.08)',
  lg: '0 10px 30px rgba(15,23,42,0.12)',
  xl: '0 20px 50px rgba(15,23,42,0.18)',
};

export function styleToCss(s: NodeStyle = {}): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (s.display) css.display = s.display;
  if (s.display === 'flex') { css.flexDirection = s.direction || 'column'; css.justifyContent = s.justify; css.alignItems = s.align; }
  if (s.display === 'grid') css.gridTemplateColumns = `repeat(${s.columns || 2}, minmax(0,1fr))`;
  if (s.gap != null) css.gap = s.gap;
  if (s.width) css.width = s.width;
  if (s.height) css.height = s.height;
  if (s.maxWidth) css.maxWidth = s.maxWidth;
  if (s.padding != null) css.padding = s.padding;
  if (s.margin != null) css.margin = s.margin;
  if (s.bgGradient) css.backgroundImage = s.bgGradient;
  else if (s.bg && s.bg !== 'transparent') css.backgroundColor = s.bg;
  if (s.color) css.color = s.color;
  if (s.opacity != null) css.opacity = s.opacity;
  if (s.radius != null) css.borderRadius = s.radius;
  if (s.borderWidth && s.borderStyle !== 'none') css.border = `${s.borderWidth}px ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}`;
  if (s.shadow) css.boxShadow = SHADOWS[s.shadow] || 'none';
  if (s.fontSize) css.fontSize = s.fontSize;
  if (s.fontWeight) css.fontWeight = Number(s.fontWeight);
  if (s.textAlign) css.textAlign = s.textAlign;
  if (s.lineHeight) css.lineHeight = s.lineHeight;
  if (s.letterSpacing) css.letterSpacing = s.letterSpacing;
  const transforms: string[] = [];
  if (s.rotate) transforms.push(`rotate(${s.rotate}deg)`);
  if (s.scale && s.scale !== 1) transforms.push(`scale(${s.scale})`);
  if (transforms.length) css.transform = transforms.join(' ');
  const filters: string[] = [];
  if (s.blur) filters.push(`blur(${s.blur}px)`);
  if (s.grayscale) filters.push(`grayscale(${s.grayscale}%)`);
  if (filters.length) css.filter = filters.join(' ');
  return css;
}

// ─────────── المتغيرات الديناميكية ───────────
export interface RuntimeData {
  name: string;
  phone: string;
  balance: string;
  profits: string;
  subscription: string;
  fees: string;
  currency: string;
  date: string;
  status: string;
  vars: Record<string, string>;
}

export const DEMO_DATA: RuntimeData = {
  name: 'اسم تجريبي', phone: '05xxxxxxxx', balance: '0', profits: '0', subscription: '0',
  fees: '0', currency: 'ر.س', date: new Date().toLocaleDateString('ar-SA'), status: 'نشط', vars: {},
};

export function interpolate(text: string, data: RuntimeData): string {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (m, key: string) => {
    if (key in data && typeof (data as any)[key] === 'string') return (data as any)[key];
    if (data.vars && key in data.vars) return data.vars[key];
    return m;
  });
}

// ─────────── تقييم شروط الإظهار ───────────
export function evalCondition(field: string, operator: string, value: string, data: RuntimeData): boolean {
  const left = interpolate(field.startsWith('{') ? field : `{${field}}`, data);
  const right = interpolate(value, data);
  const ln = Number(left), rn = Number(right);
  switch (operator) {
    case '=': return left === right;
    case '≠': return left !== right;
    case '>': return !isNaN(ln) && !isNaN(rn) && ln > rn;
    case '<': return !isNaN(ln) && !isNaN(rn) && ln < rn;
    case 'contains': return left.includes(right);
    case 'empty': return left.trim() === '' || left === `{${field}}`;
    case 'notEmpty': return left.trim() !== '' && left !== `{${field}}`;
    default: return true;
  }
}

export function isNodeVisible(v: VisibilityRule, device: number, data: RuntimeData): boolean {
  if (device <= 480 && !v.mobile) return false;
  if (device > 480 && device <= 1024 && !v.tablet) return false;
  if (device > 1024 && !v.desktop) return false;
  if (v.conditional && v.field) return evalCondition(v.field, v.operator, v.value, data);
  return true;
}

// ─────────── الصفحات ───────────
export function homePage(p: AppProject): AppPage {
  return p.pages.find(pg => pg.isHome) || p.pages[0];
}

export function pageChildren(p: AppProject, parentId: string): AppPage[] {
  return p.pages.filter(pg => pg.parentId === parentId);
}

export function barsForPage(p: AppProject, pageId: string) {
  return p.bars.filter(b => b.enabled && (b.scope === 'all' || b.pages.includes(pageId)));
}

/** كم زر يشير إلى صفحة/نافذة معيّنة */
export function countReferences(p: AppProject, kind: 'openPage' | 'openModal', targetId: string): number {
  let count = 0;
  const scanNodes = (nodes: AppNode[]) => nodes.forEach(n => {
    const a = n.action;
    if (a) {
      const steps = [a.step, ...a.steps, ...a.thenSteps, ...a.elseSteps];
      count += steps.filter(s => s.type === kind && s.target === targetId).length;
    }
    scanNodes(n.children);
  });
  p.pages.forEach(pg => scanNodes(pg.nodes));
  p.bars.forEach(b => scanNodes(b.nodes));
  p.modals.forEach(m => scanNodes(m.nodes));
  return count;
}

/** التحقق قبل النشر (القسم 14.2) */
export interface Check { level: 'ok' | 'warn' | 'error'; text: string }
export function preflight(p: AppProject): Check[] {
  const checks: Check[] = [];
  const hasHome = p.pages.some(pg => pg.isHome);
  checks.push(hasHome
    ? { level: 'ok', text: 'التطبيق له صفحة رئيسية' }
    : { level: 'error', text: 'لا توجد صفحة رئيسية — عيّن صفحة رئيسية' });

  const unusedModals = p.modals.filter(m => countReferences(p, 'openModal', m.id) === 0);
  checks.push(unusedModals.length
    ? { level: 'warn', text: `${unusedModals.length} نافذة غير مستخدمة (لا يوجد زر يفتحها)` }
    : { level: 'ok', text: 'كل النوافذ مستخدمة' });

  let buttonsNoAction = 0;
  let imagesNoAlt = 0;
  const scan = (nodes: AppNode[]) => nodes.forEach(n => {
    const def = n.type;
    if (['button', 'buttonOutline', 'buttonGhost', 'fab'].includes(def)) {
      const a = n.action;
      const empty = !a || (a.mode === 'single' && a.step.type === 'none') || (a.mode === 'sequence' && a.steps.length === 0);
      if (empty) buttonsNoAction++;
    }
    if (def === 'image' && !n.props.alt) imagesNoAlt++;
    scan(n.children);
  });
  p.pages.forEach(pg => scan(pg.nodes));
  p.bars.forEach(b => scan(b.nodes));
  p.modals.forEach(m => scan(m.nodes));

  checks.push(buttonsNoAction
    ? { level: 'error', text: `${buttonsNoAction} زر بدون إجراء — يجب إصلاحه قبل النشر` }
    : { level: 'ok', text: 'كل الأزرار لها إجراءات' });
  if (imagesNoAlt) checks.push({ level: 'warn', text: `${imagesNoAlt} صورة بلا نص بديل (Alt)` });

  const orphan = p.pages.filter(pg => !pg.isHome && !pg.parentId && countReferences(p, 'openPage', pg.id) === 0);
  checks.push(orphan.length
    ? { level: 'warn', text: `${orphan.length} صفحة معزولة (لا يوجد زر يفتحها)` }
    : { level: 'ok', text: 'كل الصفحات متصلة' });

  const totalNodes = p.pages.reduce((a, pg) => a + countNodes(pg.nodes), 0);
  if (totalNodes > 500) checks.push({ level: 'warn', text: 'عدد كبير من المكونات قد يبطئ الاستوديو' });

  return checks;
}

export function projectStats(p: AppProject) {
  const components = p.pages.reduce((a, pg) => a + countNodes(pg.nodes), 0)
    + p.bars.reduce((a, b) => a + countNodes(b.nodes), 0)
    + p.modals.reduce((a, m) => a + countNodes(m.nodes), 0);
  const assetsKB = Math.round(JSON.stringify(p).length / 1024);
  return { pages: p.pages.length, bars: p.bars.length, modals: p.modals.length, components, assetsKB };
}

export function bumpVersion(v: string): string {
  const parts = (v || '1.0.0').split('.').map(x => parseInt(x, 10) || 0);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

export function download(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
