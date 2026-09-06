// ═══════════════════════════════════════════════════════════════
// بيئة البناء (Builder Environment) — استوديو بناء تطبيق العميل
// 6 مناطق: شريط أدوات · شجرة · لوحة · خصائص · شريط حالة · لوحات عائمة
// ═══════════════════════════════════════════════════════════════
import {
  AppBar, AppModal, AppNode, AppPage, AppProject, BarKind, ModalKind, Selection,
} from '@/types/app-builder';
import {
  COMPONENT_LIBRARY, CATEGORY_LABELS, COMPONENTS_BY_TYPE, BAR_KIND_LABELS, MODAL_KIND_LABELS,
  createNode, createPage, createBar, createModal, MODAL_LIBRARY, slugify,
} from '@/data/app-builder-defaults';
import {
  clone, cloneNode, countNodes, countReferences, download, duplicateNode, findNode, insertNode,
  moveNode, nodePath, preflight, projectStats, removeNode, RuntimeData, bumpVersion,
} from '@/lib/app-builder';
import { useProjectEditor } from '@/hooks/use-app-builder';
import { AppRuntime, DynIcon } from '@/components/app-builder/AppRuntime';
import { PropertiesPanel } from '@/components/app-builder/PropertiesPanel';
import { ActionEditor } from '@/components/app-builder/ActionEditor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Save, Undo2, Redo2, FileText, Link2, MessageSquare, Blocks, Palette, Database, Zap, Settings,
  Smartphone, Tablet, Monitor, Eye, Rocket, ArrowRight, ChevronDown, ChevronLeft, Plus, Trash2,
  Copy, Search, X, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Package, Upload, Download, Map,
  CheckCircle2, AlertTriangle, XCircle, Grid3x3, Ruler, Minus, Layers, FlaskConical,
} from 'lucide-react';

const DEVICES = [
  { w: 375, label: 'جوال', icon: Smartphone },
  { w: 768, label: 'تابلت', icon: Tablet },
  { w: 1280, label: 'ديسكتوب', icon: Monitor },
] as const;

type Drawer = null | 'components' | 'design' | 'data' | 'actions';
type Dropdown = null | 'pages' | 'bars' | 'modals' | 'templates';

export function AppBuilderStudio({
  initialProject, onSave, onExit, subscribers, runtimeData,
}: {
  initialProject: AppProject;
  onSave: (p: AppProject) => void;
  onExit: () => void;
  subscribers: { id: string; name: string }[];
  runtimeData: RuntimeData;
}) {
  const { project, commit, undo, redo, replace, dirty, setDirty, canUndo, canRedo } = useProjectEditor(initialProject);
  const [selection, setSelection] = useState<Selection>({ kind: null, id: null });
  const [device, setDevice] = useState<number>(375);
  const [pageId, setPageId] = useState<string>(initialProject.pages[0]?.id || '');
  const [editingModalId, setEditingModalId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [dropdown, setDropdown] = useState<Dropdown>(null);
  const [showActionEditor, setShowActionEditor] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [showModalLibrary, setShowModalLibrary] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>({ pages: true, bars: true, modals: true });
  const [componentSearch, setComponentSearch] = useState('');
  const [componentCat, setComponentCat] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [nodeTemplates, setNodeTemplates] = useState<AppNode[]>([]);

  // نماذج إنشاء
  const [newPage, setNewPage] = useState<{ open: boolean; editId: string | null; name: string; type: 'normal' | 'home' | 'sub'; parentId: string; layout: AppPage['layout']; bg: string; error: string }>(
    { open: false, editId: null, name: '', type: 'normal', parentId: '', layout: 'blank', bg: '#ffffff', error: '' });
  const [newBar, setNewBar] = useState<{ open: boolean; step: 1 | 2 | 3; kind: BarKind | null; scope: 'all' | 'selected'; pages: string[]; name: string; preset: 'empty' | 'template' }>(
    { open: false, step: 1, kind: null, scope: 'all', pages: [], name: '', preset: 'empty' });
  const [newModal, setNewModal] = useState<{ open: boolean; name: string; kind: ModalKind; size: AppModal['size']; closable: boolean; error: string }>(
    { open: false, name: '', kind: 'modal', size: 'md', closable: true, error: '' });
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'page' | 'bar' | 'modal' | 'node'; id: string } | null>(null);

  const page = project.pages.find(p => p.id === pageId) || project.pages[0];
  const editingModal = editingModalId ? project.modals.find(m => m.id === editingModalId) : null;
  const stats = useMemo(() => projectStats(project), [project]);

  // ── حفظ ──
  const doSave = useCallback(() => {
    onSave(project);
    setDirty(false);
    setLastSaved(new Date());
    toast.success('تم حفظ التطبيق ✓');
  }, [project, onSave, setDirty]);

  // حفظ تلقائي كل 30 ثانية (16.1)
  useEffect(() => {
    const iv = setInterval(() => {
      if (dirty) { onSave(project); setDirty(false); setLastSaved(new Date()); }
    }, 30000);
    return () => clearInterval(iv);
  }, [dirty, project, onSave, setDirty]);

  // ── اختصارات (16.6) ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); setShowPreview(true); return; }
      if (typing) return;
      if (e.key === 'Delete' && selection.kind === 'node' && selection.id) { setDeleteTarget({ kind: 'node', id: selection.id }); }
      if (e.key === 'Escape') { setSelection({ kind: null, id: null }); setDropdown(null); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selection.kind === 'node' && selection.id) { e.preventDefault(); duplicateSelectedNode(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [doSave, undo, redo, selection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── مساعدات تعديل العقد ──
  const ownerOf = (sel: Selection) => sel.ownerKind || 'page';
  const currentOwner = editingModal
    ? { kind: 'modal' as const, id: editingModal.id }
    : { kind: 'page' as const, id: page?.id || '' };

  const mutateNodes = useCallback((ownerKind: 'page' | 'bar' | 'modal', ownerId: string, fn: (nodes: AppNode[]) => AppNode[]) => {
    commit(p => {
      if (ownerKind === 'bar') return { ...p, bars: p.bars.map(b => (b.id === ownerId ? { ...b, nodes: fn(b.nodes) } : b)) };
      if (ownerKind === 'modal') return { ...p, modals: p.modals.map(m => (m.id === ownerId ? { ...m, nodes: fn(m.nodes) } : m)) };
      return { ...p, pages: p.pages.map(pg => (pg.id === ownerId ? { ...pg, nodes: fn(pg.nodes) } : pg)) };
    });
  }, [commit]);

  const addComponent = (type: string) => {
    const node = createNode(type);
    // إن كان المحدد حاوية → يُضاف داخلها، وإلا في نهاية الوعاء الحالي
    let ownerKind: 'page' | 'bar' | 'modal' = currentOwner.kind;
    let ownerId = currentOwner.id;
    let parentId: string | null = null;
    if (selection.kind === 'node' && selection.id && selection.ownerId) {
      ownerKind = selection.ownerKind || 'page';
      ownerId = selection.ownerId;
      const list = ownerKind === 'bar' ? project.bars.find(b => b.id === ownerId)?.nodes
        : ownerKind === 'modal' ? project.modals.find(m => m.id === ownerId)?.nodes
          : project.pages.find(p => p.id === ownerId)?.nodes;
      const target = list ? findNode(list, selection.id) : null;
      if (target && COMPONENTS_BY_TYPE[target.type]?.container) parentId = target.id;
    } else if (selection.kind === 'bar' && selection.id) {
      ownerKind = 'bar'; ownerId = selection.id;
    }
    if (!ownerId) { toast.error('اختر صفحة أولاً'); return; }
    mutateNodes(ownerKind, ownerId, nodes => insertNode(nodes, parentId, node));
    setSelection({ kind: 'node', id: node.id, ownerKind, ownerId });
    toast.success(`تمت إضافة «${node.name}» ✓`);
  };

  const duplicateSelectedNode = () => {
    if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
    mutateNodes(selection.ownerKind || 'page', selection.ownerId, nodes => duplicateNode(nodes, selection.id!));
    toast.success('تم النسخ ✓');
  };

  const deleteNode = (id: string, ownerKind: 'page' | 'bar' | 'modal', ownerId: string) => {
    mutateNodes(ownerKind, ownerId, nodes => removeNode(nodes, id));
    setSelection({ kind: null, id: null });
    toast.success('تم حذف المكون');
  };

  const moveSelectedNode = (dir: -1 | 1) => {
    if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
    mutateNodes(selection.ownerKind || 'page', selection.ownerId, nodes => moveNode(nodes, selection.id!, dir));
  };

  // ── صفحات ──
  const submitPage = () => {
    const name = newPage.name.trim();
    if (!name) { setNewPage(s => ({ ...s, error: 'اسم الصفحة مطلوب' })); return; }
    const dup = project.pages.some(p => p.name === name && p.id !== newPage.editId);
    if (dup) { setNewPage(s => ({ ...s, error: 'يوجد صفحة بنفس الاسم — اختر اسماً مختلفاً' })); return; }
    if (newPage.type === 'sub' && !newPage.parentId) { setNewPage(s => ({ ...s, error: 'اختر الصفحة الأم' })); return; }

    if (newPage.editId) {
      commit(p => ({
        ...p, pages: p.pages.map(x => (x.id === newPage.editId
          ? { ...x, name, slug: slugify(name), bg: newPage.bg, parentId: newPage.type === 'sub' ? newPage.parentId : null, isHome: newPage.type === 'home' ? true : x.isHome }
          : newPage.type === 'home' ? { ...x, isHome: false } : x)),
      }));
      toast.success('تم حفظ تعديل الصفحة ✓');
    } else {
      const created = createPage(name, {
        layout: newPage.layout, bg: newPage.bg,
        parentId: newPage.type === 'sub' ? newPage.parentId : null,
        isHome: newPage.type === 'home',
      });
      commit(p => ({
        ...p,
        pages: [...(newPage.type === 'home' ? p.pages.map(x => ({ ...x, isHome: false })) : p.pages), created],
      }));
      setPageId(created.id);
      setEditingModalId(null);
      toast.success(`تم إنشاء صفحة ${name} ✓`);
    }
    setNewPage({ open: false, editId: null, name: '', type: 'normal', parentId: '', layout: 'blank', bg: '#ffffff', error: '' });
  };

  const deletePage = (id: string) => {
    const kids = project.pages.filter(p => p.parentId === id);
    commit(p => ({ ...p, pages: p.pages.filter(x => x.id !== id && x.parentId !== id) }));
    if (pageId === id) {
      const next = project.pages.find(p => p.id !== id && p.parentId !== id);
      setPageId(next?.id || '');
    }
    toast.success(`تم حذف الصفحة${kids.length ? ` و ${kids.length} صفحة فرعية` : ''}`);
  };

  const duplicatePage = (id: string) => {
    const src = project.pages.find(p => p.id === id);
    if (!src) return;
    const copy = clone(src);
    copy.id = Math.random().toString(36).slice(2);
    copy.name = `${src.name} — نسخة`;
    copy.slug = slugify(copy.name);
    copy.isHome = false;
    copy.nodes = src.nodes.map(cloneNode);
    commit(p => ({ ...p, pages: [...p.pages, copy] }));
    toast.success('تم نسخ الصفحة ✓');
  };

  // ── أشرطة ──
  const submitBar = () => {
    if (!newBar.kind) return;
    const bar = createBar(newBar.name.trim() || BAR_KIND_LABELS[newBar.kind], newBar.kind);
    bar.scope = newBar.scope;
    bar.pages = newBar.pages;
    if (newBar.preset === 'template') {
      bar.nodes = newBar.kind === 'bottom'
        ? ['الرئيسية', 'أرباحي', 'العمليات', 'حسابي'].map(l => { const n = createNode('buttonGhost', l); n.props.label = l; n.style.color = bar.color; return n; })
        : [(() => { const n = createNode('logo'); return n; })(), (() => { const n = createNode('h3', 'العنوان'); n.props.text = project.name; n.style.color = bar.color; n.style.fontSize = 15; return n; })()];
    }
    commit(p => ({ ...p, bars: [...p.bars, bar] }));
    setSelection({ kind: 'bar', id: bar.id });
    setNewBar({ open: false, step: 1, kind: null, scope: 'all', pages: [], name: '', preset: 'empty' });
    toast.success(`تم إنشاء شريط ${bar.name} ✓`);
  };

  // ── نوافذ ──
  const submitModal = () => {
    const name = newModal.name.trim();
    if (!name) { setNewModal(s => ({ ...s, error: 'اسم النافذة مطلوب' })); return; }
    const m = createModal(name, newModal.kind, newModal.size);
    m.closable = newModal.closable;
    commit(p => ({ ...p, modals: [...p.modals, m] }));
    setEditingModalId(m.id);
    setSelection({ kind: 'modal', id: m.id });
    setNewModal({ open: false, name: '', kind: 'modal', size: 'md', closable: true, error: '' });
    toast.success(`تم إنشاء نافذة ${name} ✓`);
  };

  // ── نشر / تصدير ──
  const checks = useMemo(() => preflight(project), [project]);
  const hasErrors = checks.some(c => c.level === 'error');

  const doPublish = (version: string, notes: string, scope: 'subscriber' | 'template', subId: string) => {
    commit(p => ({
      ...p, version, releaseNotes: notes, published: true,
      publishedAt: new Date().toISOString(),
      isTemplate: scope === 'template',
      subscriberId: scope === 'subscriber' ? (subId || null) : null,
    }));
    setTimeout(() => {
      onSave({
        ...project, version, releaseNotes: notes, published: true,
        publishedAt: new Date().toISOString(),
        isTemplate: scope === 'template',
        subscriberId: scope === 'subscriber' ? (subId || null) : null,
      });
      setDirty(false);
      setShowPublish(false);
      toast.success('تم نشر التطبيق بنجاح ✓');
    }, 100);
  };

  const exportJson = (light: boolean) => {
    const copy = clone(project);
    if (light) {
      const strip = (nodes: AppNode[]) => nodes.forEach(n => {
        if (typeof n.props.src === 'string' && n.props.src.startsWith('data:')) n.props.src = '';
        if (Array.isArray(n.props.images)) n.props.images = [];
        strip(n.children);
      });
      copy.pages.forEach(p => strip(p.nodes));
      copy.bars.forEach(b => strip(b.nodes));
      copy.modals.forEach(m => strip(m.nodes));
      copy.logo = ''; copy.favicon = '';
    }
    download(`${slugify(project.name)}${light ? '-light' : ''}.json`, JSON.stringify(copy, null, 2));
    toast.success('تم التصدير ✓');
  };

  // ── الشجرة ───────────────────────────────────
  const TreeNode = ({ node, ownerKind, ownerId, depth }: { node: AppNode; ownerKind: 'page' | 'bar' | 'modal'; ownerId: string; depth: number }) => {
    const [open, setOpen] = useState(true);
    const selected = selection.kind === 'node' && selection.id === node.id;
    return (
      <div>
        <div className={`group flex items-center gap-1 py-1 pl-1 rounded-lg cursor-pointer ${selected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
          style={{ paddingRight: 6 + depth * 12 }}
          onClick={() => setSelection({ kind: 'node', id: node.id, ownerKind, ownerId })}>
          {node.children.length > 0
            ? <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="text-slate-400"><ChevronDown size={11} className={open ? '' : '-rotate-90'} /></button>
            : <span className="w-[11px]" />}
          <DynIcon name={COMPONENTS_BY_TYPE[node.type]?.icon || 'Square'} size={11} className="text-slate-400 flex-shrink-0" />
          <span className={`text-[11px] truncate flex-1 ${node.hidden ? 'line-through text-slate-400' : 'text-slate-700'}`}>{node.name}</span>
          <button onClick={e => { e.stopPropagation(); mutateNodes(ownerKind, ownerId, ns => ns.map(function upd(n): AppNode { return n.id === node.id ? { ...n, hidden: !n.hidden } : { ...n, children: n.children.map(upd) }; })); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5">{node.hidden ? <EyeOff size={10} /> : <Eye size={10} />}</button>
          <button onClick={e => { e.stopPropagation(); mutateNodes(ownerKind, ownerId, ns => ns.map(function upd(n): AppNode { return n.id === node.id ? { ...n, locked: !n.locked } : { ...n, children: n.children.map(upd) }; })); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5">{node.locked ? <Lock size={10} /> : <Unlock size={10} />}</button>
          <button onClick={e => { e.stopPropagation(); mutateNodes(ownerKind, ownerId, ns => duplicateNode(ns, node.id)); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5"><Copy size={10} /></button>
          <button onClick={e => { e.stopPropagation(); mutateNodes(ownerKind, ownerId, ns => moveNode(ns, node.id, -1)); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5"><ArrowUp size={10} /></button>
          <button onClick={e => { e.stopPropagation(); mutateNodes(ownerKind, ownerId, ns => moveNode(ns, node.id, 1)); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5"><ArrowDown size={10} /></button>
          <button onClick={e => { e.stopPropagation(); deleteNode(node.id, ownerKind, ownerId); }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 ml-1"><Trash2 size={10} /></button>
        </div>
        {open && node.children.map(c => <TreeNode key={c.id} node={c} ownerKind={ownerKind} ownerId={ownerId} depth={depth + 1} />)}
      </div>
    );
  };

  const TreeGroup = ({ id, icon, label, count, children, addLabel, onAdd }: { id: string; icon: React.ReactNode; label: string; count: number; children: React.ReactNode; addLabel: string; onAdd: () => void }) => (
    <div className="mb-1">
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <button onClick={() => setTreeOpen(o => ({ ...o, [id]: !o[id] }))} className="text-slate-400"><ChevronDown size={12} className={treeOpen[id] ? '' : '-rotate-90'} /></button>
        {icon}
        <span className="text-[11px] font-black text-slate-700 flex-1">{label} ({count})</span>
        <button onClick={onAdd} title={addLabel} className="p-0.5 rounded text-blue-600 hover:bg-blue-50"><Plus size={12} /></button>
      </div>
      {treeOpen[id] && <div className="pr-2">{count === 0 ? <p className="text-[10px] text-slate-400 px-3 py-1">لا يوجد</p> : children}</div>}
    </div>
  );

  // ── واجهة ───────────────────────────────────
  const canvasWidth = Math.round(device * (zoom / 100));

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] bg-slate-100 flex flex-col" data-testid="app-builder-studio">
      {/* ═══ [1] الشريط العلوي ═══ */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center gap-1.5 px-3 flex-shrink-0 overflow-x-auto">
        {/* الملف */}
        <Button size="sm" onClick={doSave} className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs relative flex-shrink-0">
          <Save size={13} /> حفظ
          {dirty && <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white" />}
        </Button>
        <Button size="sm" variant="outline" disabled={!canUndo} onClick={undo} className="h-8 w-8 p-0 flex-shrink-0" title="تراجع (Ctrl+Z)"><Undo2 size={13} /></Button>
        <Button size="sm" variant="outline" disabled={!canRedo} onClick={redo} className="h-8 w-8 p-0 flex-shrink-0" title="إعادة"><Redo2 size={13} /></Button>
        <span className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />

        {/* إدارة البنية */}
        <div className="relative flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => setDropdown(d => (d === 'pages' ? null : 'pages'))} className="h-8 gap-1 text-xs"><FileText size={13} /> الصفحات <ChevronDown size={11} /></Button>
          {dropdown === 'pages' && <PagesDropdown />}
        </div>
        <div className="relative flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => setDropdown(d => (d === 'bars' ? null : 'bars'))} className="h-8 gap-1 text-xs"><Link2 size={13} /> الأشرطة <ChevronDown size={11} /></Button>
          {dropdown === 'bars' && <BarsDropdown />}
        </div>
        <div className="relative flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => setDropdown(d => (d === 'modals' ? null : 'modals'))} className="h-8 gap-1 text-xs"><MessageSquare size={13} /> النوافذ <ChevronDown size={11} /></Button>
          {dropdown === 'modals' && <ModalsDropdown />}
        </div>
        <Button size="sm" onClick={() => setDrawer(d => (d === 'components' ? null : 'components'))} className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs flex-shrink-0"><Blocks size={13} /> إضافة مكون</Button>
        <span className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />

        {/* التصميم والبيانات */}
        <Button size="sm" variant="outline" onClick={() => { setSelection({ kind: 'design', id: 'design' }); setDrawer(null); }} className="h-8 gap-1 text-xs flex-shrink-0"><Palette size={13} /> التصميم</Button>
        <Button size="sm" variant="outline" onClick={() => setDrawer(d => (d === 'data' ? null : 'data'))} className="h-8 gap-1 text-xs flex-shrink-0"><Database size={13} /> البيانات</Button>
        <div className="relative flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => setDropdown(d => (d === 'templates' ? null : 'templates'))} className="h-8 gap-1 text-xs"><Package size={13} /> القوالب <ChevronDown size={11} /></Button>
          {dropdown === 'templates' && <TemplatesDropdown />}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAppSettings(true)} className="h-8 gap-1 text-xs flex-shrink-0"><Settings size={13} /> إعدادات التطبيق</Button>

        <div className="flex-1" />

        {/* العرض */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          {DEVICES.map(d => (
            <button key={d.w} onClick={() => setDevice(d.w)} title={`${d.label} ${d.w}`}
              className={`px-2 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${device === d.w ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
              <d.icon size={12} />{d.w}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowPreview(true)} className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs flex-shrink-0"><Eye size={13} /> معاينة</Button>
        <Button size="sm" onClick={() => setShowPublish(true)} className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-700 text-xs flex-shrink-0"><Rocket size={13} /> نشر</Button>
        <Button size="sm" variant="outline" onClick={() => (dirty ? setShowExitConfirm(true) : onExit())} className="h-8 gap-1 text-xs flex-shrink-0"><ArrowRight size={13} /> خروج</Button>
      </div>

      {/* ═══ الجسم ═══ */}
      <div className="flex-1 flex min-h-0" onClick={() => setDropdown(null)}>
        {/* [2] الشجرة — يمين */}
        <aside className="w-[260px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Layers size={14} className="text-slate-500" />
            <p className="text-xs font-black text-slate-700 truncate">🏠 {project.name}</p>
          </div>
          <div className="p-1.5 flex-1">
            <TreeGroup id="pages" icon={<FileText size={12} className="text-blue-500" />} label="الصفحات" count={project.pages.length}
              addLabel="صفحة جديدة" onAdd={() => setNewPage(s => ({ ...s, open: true, editId: null, name: '', error: '' }))}>
              {project.pages.map(pg => (
                <div key={pg.id}>
                  <div className={`group flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer ${pageId === pg.id && !editingModalId ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                    onClick={() => { setPageId(pg.id); setEditingModalId(null); setSelection({ kind: 'page', id: pg.id }); }}>
                    <FileText size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-700 truncate flex-1">{pg.name}</span>
                    {pg.isHome && <Badge className="bg-blue-100 text-blue-700 text-[8px] px-1 py-0">رئيسية</Badge>}
                    {pg.parentId && <Badge variant="outline" className="text-[8px] px-1 py-0">فرعية</Badge>}
                    <button onClick={e => { e.stopPropagation(); setNewPage({ open: true, editId: null, name: '', type: 'sub', parentId: pg.id, layout: 'blank', bg: '#ffffff', error: '' }); }}
                      title="إنشاء صفحة فرعية" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5"><Plus size={10} /></button>
                    <button onClick={e => { e.stopPropagation(); duplicatePage(pg.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 p-0.5"><Copy size={10} /></button>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'page', id: pg.id }); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={10} /></button>
                  </div>
                  {pageId === pg.id && pg.nodes.map(n => <TreeNode key={n.id} node={n} ownerKind="page" ownerId={pg.id} depth={1} />)}
                </div>
              ))}
            </TreeGroup>

            <TreeGroup id="bars" icon={<Link2 size={12} className="text-emerald-500" />} label="الأشرطة" count={project.bars.length}
              addLabel="إضافة شريط" onAdd={() => setNewBar(s => ({ ...s, open: true, step: 1 }))}>
              {project.bars.map(b => (
                <div key={b.id}>
                  <div className={`group flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer ${selection.kind === 'bar' && selection.id === b.id ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelection({ kind: 'bar', id: b.id })}>
                    <Link2 size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-700 truncate flex-1">{b.name}</span>
                    <span className="text-[9px] text-slate-400">{BAR_KIND_LABELS[b.kind]}</span>
                    <button onClick={e => { e.stopPropagation(); commit(p => ({ ...p, bars: p.bars.map(x => (x.id === b.id ? { ...x, enabled: !x.enabled } : x)) })); }}
                      className="text-slate-400 p-0.5">{b.enabled ? <Eye size={10} /> : <EyeOff size={10} />}</button>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'bar', id: b.id }); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={10} /></button>
                  </div>
                  {selection.kind === 'bar' && selection.id === b.id && b.nodes.map(n => <TreeNode key={n.id} node={n} ownerKind="bar" ownerId={b.id} depth={1} />)}
                </div>
              ))}
            </TreeGroup>

            <TreeGroup id="modals" icon={<MessageSquare size={12} className="text-violet-500" />} label="النوافذ المنبثقة" count={project.modals.length}
              addLabel="نافذة جديدة" onAdd={() => setNewModal(s => ({ ...s, open: true }))}>
              {project.modals.map(m => (
                <div key={m.id}>
                  <div className={`group flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer ${editingModalId === m.id ? 'bg-violet-50 ring-1 ring-violet-200' : 'hover:bg-slate-50'}`}
                    onClick={() => { setEditingModalId(m.id); setSelection({ kind: 'modal', id: m.id }); }}>
                    <MessageSquare size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-700 truncate flex-1">{m.name}</span>
                    <span className={`text-[9px] ${countReferences(project, 'openModal', m.id) ? 'text-slate-400' : 'text-amber-600'}`}>
                      {countReferences(project, 'openModal', m.id) || 'غير مستخدمة'}
                    </span>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'modal', id: m.id }); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={10} /></button>
                  </div>
                  {editingModalId === m.id && m.nodes.map(n => <TreeNode key={n.id} node={n} ownerKind="modal" ownerId={m.id} depth={1} />)}
                </div>
              ))}
            </TreeGroup>

            <button onClick={() => setSelection({ kind: 'design', id: 'design' })}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-black ${selection.kind === 'design' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Palette size={12} /> التصميم العام
            </button>
          </div>
        </aside>

        {/* [3] اللوحة */}
        <main className="flex-1 min-w-0 flex flex-col bg-slate-200/60">
          {/* شريط اللوحة */}
          <div className="h-11 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center gap-2 px-3 flex-shrink-0">
            {editingModal ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                <span className="text-[11px] font-black text-amber-800">تحرير النافذة: {editingModal.name}</span>
                <button onClick={() => { setEditingModalId(null); setSelection({ kind: 'page', id: page?.id || null }); }} className="text-[10px] font-bold text-amber-700 underline">← رجوع للصفحة</button>
              </div>
            ) : (
              <>
                <span className="text-[11px] font-bold text-slate-500">تعرض: <b className="text-slate-800">{page?.name}</b></span>
                <button onClick={() => { const i = project.pages.findIndex(p => p.id === pageId); if (i > 0) setPageId(project.pages[i - 1].id); }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500" title="الصفحة السابقة"><ChevronLeft size={14} className="rotate-180" /></button>
                <button onClick={() => { const i = project.pages.findIndex(p => p.id === pageId); if (i < project.pages.length - 1) setPageId(project.pages[i + 1].id); }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500" title="الصفحة التالية"><ChevronLeft size={14} /></button>
              </>
            )}
            <div className="flex-1" />
            {selection.kind === 'node' && (
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-1.5 py-1">
                <button onClick={() => moveSelectedNode(-1)} className="p-0.5 text-blue-700"><ArrowUp size={12} /></button>
                <button onClick={() => moveSelectedNode(1)} className="p-0.5 text-blue-700"><ArrowDown size={12} /></button>
                <button onClick={duplicateSelectedNode} className="p-0.5 text-blue-700"><Copy size={12} /></button>
                <button onClick={() => selection.id && setDeleteTarget({ kind: 'node', id: selection.id })} className="p-0.5 text-red-600"><Trash2 size={12} /></button>
              </div>
            )}
          </div>

          {/* اللوحة نفسها */}
          <div className="flex-1 overflow-auto p-6 flex justify-center" onClick={() => setSelection({ kind: null, id: null })}>
            <div className="relative" onClick={e => e.stopPropagation()}>
              {showRuler && <div className="absolute -top-5 inset-x-0 h-4 bg-white/80 border border-slate-200 rounded text-[8px] flex items-center justify-between px-1 text-slate-400"><span>0</span><span>{device}px</span></div>}
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-300 transition-all"
                style={{
                  width: canvasWidth, minHeight: 560,
                  backgroundImage: showGrid ? 'linear-gradient(#0000000a 1px,transparent 1px),linear-gradient(90deg,#0000000a 1px,transparent 1px)' : undefined,
                  backgroundSize: showGrid ? '16px 16px' : undefined,
                }}>
                {page || editingModal ? (
                  <AppRuntime
                    project={project}
                    data={runtimeData}
                    device={device}
                    editable
                    selectedId={selection.kind === 'node' ? selection.id : null}
                    onSelectNode={(id) => {
                      if (id.startsWith('bar:')) { setSelection({ kind: 'bar', id: id.slice(4) }); return; }
                      const ownerKind = editingModal ? 'modal' : 'page';
                      const ownerId = editingModal ? editingModal.id : page.id;
                      // ابحث في الأشرطة أيضاً
                      const inBar = project.bars.find(b => findNode(b.nodes, id));
                      if (inBar) { setSelection({ kind: 'node', id, ownerKind: 'bar', ownerId: inBar.id }); return; }
                      setSelection({ kind: 'node', id, ownerKind, ownerId });
                    }}
                    currentPageId={page?.id}
                    onPageChange={setPageId}
                    previewModalId={editingModalId}
                  />
                ) : (
                  <div className="p-14 text-center text-slate-400">لا توجد صفحات — أنشئ صفحة جديدة</div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* [4] لوحة الخصائص — يسار */}
        <aside className="w-[340px] bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
          <PropertiesPanel
            project={project}
            selection={selection as any}
            onProjectChange={commit}
            onOpenActionEditor={() => setShowActionEditor(true)}
            onDuplicate={duplicateSelectedNode}
            onDelete={() => selection.id && setDeleteTarget({ kind: 'node', id: selection.id })}
            onSaveAsTemplate={() => {
              if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
              const list = selection.ownerKind === 'bar' ? project.bars.find(b => b.id === selection.ownerId)?.nodes
                : selection.ownerKind === 'modal' ? project.modals.find(m => m.id === selection.ownerId)?.nodes
                  : project.pages.find(p => p.id === selection.ownerId)?.nodes;
              const n = list ? findNode(list, selection.id) : null;
              if (n) { setNodeTemplates(t => [...t, cloneNode(n)]); toast.success('تم حفظ المكون كقالب ✓'); }
            }}
          />
        </aside>
      </div>

      {/* ═══ [5] شريط الحالة ═══ */}
      <div className="h-9 bg-white border-t border-slate-200 flex items-center gap-3 px-3 text-[10px] text-slate-500 flex-shrink-0 overflow-x-auto">
        <span className="flex items-center gap-1"><FileText size={11} /> {stats.pages} صفحات</span>
        <span className="flex items-center gap-1"><Blocks size={11} /> {page ? countNodes(page.nodes) : 0} مكون في الصفحة</span>
        <span className="flex items-center gap-1"><Link2 size={11} /> {stats.bars} شريط</span>
        <span className="flex items-center gap-1"><MessageSquare size={11} /> {stats.modals} نافذة</span>
        {selection.kind === 'node' && selection.id && (() => {
          const list = selection.ownerKind === 'bar' ? project.bars.find(b => b.id === selection.ownerId)?.nodes
            : selection.ownerKind === 'modal' ? project.modals.find(m => m.id === selection.ownerId)?.nodes
              : project.pages.find(p => p.id === selection.ownerId)?.nodes;
          const path = list ? nodePath(list, selection.id) : null;
          return path ? <span className="truncate">📍 {path.map(n => n.name).join(' › ')}</span> : null;
        })()}
        <div className="flex-1" />
        <span className={`font-bold ${dirty ? 'text-orange-600' : 'text-emerald-600'}`}>{dirty ? '● تغييرات غير محفوظة' : '✓ محفوظ'}</span>
        {lastSaved && <span>آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}</span>}
        <span className="w-px h-4 bg-slate-200" />
        <button onClick={() => setZoom(z => Math.max(40, z - 10))} className="px-1.5 hover:bg-slate-100 rounded">−</button>
        <span className="tabular-nums">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="px-1.5 hover:bg-slate-100 rounded">+</button>
        <button onClick={() => setZoom(100)} className="hover:bg-slate-100 rounded px-1.5">ملاءمة</button>
        <button onClick={() => setShowGrid(g => !g)} className={`p-1 rounded ${showGrid ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}><Grid3x3 size={11} /></button>
        <button onClick={() => setShowRuler(r => !r)} className={`p-1 rounded ${showRuler ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}><Ruler size={11} /></button>
      </div>

      {/* ═══ [6] درج مكتبة المكونات ═══ */}
      <AnimatePresence>
        {drawer === 'components' && (
          <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 w-[380px] max-w-[92vw] bg-white shadow-2xl border-l border-slate-200 z-[120] flex flex-col">
            <div className="p-3 border-b border-slate-200 space-y-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-800">🧱 مكتبة المكونات</p>
                <button onClick={() => setDrawer(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X size={15} /></button>
              </div>
              <div className="relative">
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={componentSearch} onChange={e => setComponentSearch(e.target.value)} placeholder="ابحث عن مكون…" className="h-8 pr-8 text-xs" />
              </div>
              <div className="flex flex-wrap gap-1">
                {([['all', 'الكل'], ...Object.entries(CATEGORY_LABELS), ['fav', '⭐ المفضلة'], ['tpl', '📌 قوالبي']] as [string, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setComponentCat(v)}
                    className={`text-[10px] px-2 py-1 rounded-full font-bold ${componentCat === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {componentCat === 'tpl' ? (
                <div className="space-y-2">
                  {nodeTemplates.length === 0 && <p className="text-xs text-slate-400 text-center py-6">لا توجد قوالب مكونات محفوظة بعد</p>}
                  {nodeTemplates.map((t, i) => (
                    <button key={i} onClick={() => {
                      const n = cloneNode(t);
                      mutateNodes(currentOwner.kind, currentOwner.id, ns => [...ns, n]);
                      toast.success('تمت إضافة القالب ✓');
                    }} className="w-full text-right px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold">{t.name}</button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {COMPONENT_LIBRARY
                    .filter(c => componentCat === 'all' || (componentCat === 'fav' ? favorites.includes(c.type) : c.category === componentCat))
                    .filter(c => !componentSearch || c.label.includes(componentSearch) || c.description.includes(componentSearch))
                    .map(c => (
                      <div key={c.type} title={c.description}
                        onDoubleClick={() => addComponent(c.type)}
                        onClick={() => addComponent(c.type)}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('text/component', c.type)}
                        className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
                        <button onClick={e => { e.stopPropagation(); setFavorites(f => (f.includes(c.type) ? f.filter(x => x !== c.type) : [...f, c.type])); }}
                          className={`absolute top-1 left-1 opacity-0 group-hover:opacity-100 ${favorites.includes(c.type) ? 'opacity-100 text-amber-500' : 'text-slate-300'}`}>★</button>
                        <DynIcon name={c.icon} size={18} className="mx-auto text-indigo-600 mb-1" />
                        <p className="text-[10px] font-bold text-slate-700 leading-tight">{c.label}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* درج البيانات */}
      <AnimatePresence>
        {drawer === 'data' && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: 0.2 }}
            className="fixed inset-y-0 right-0 w-[340px] max-w-[92vw] bg-white shadow-2xl border-r border-slate-200 z-[120] flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <p className="text-sm font-black text-slate-800">📊 البيانات والمتغيرات</p>
              <button onClick={() => setDrawer(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X size={15} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[11px] font-black text-slate-700 mb-1.5">متغيرات المشترك الجاهزة</p>
                <div className="flex flex-wrap gap-1">
                  {['{name}', '{phone}', '{balance}', '{profits}', '{subscription}', '{fees}', '{currency}', '{status}', '{date}'].map(v => (
                    <button key={v} onClick={() => { navigator.clipboard?.writeText(v); toast.success(`تم نسخ ${v}`); }}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200 hover:bg-blue-50">{v}</button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">استخدم هذه الرموز داخل نصوص المكونات — تُستبدل ببيانات المشترك الحقيقية عند العرض.</p>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-700 mb-1.5">متغيرات مخصصة</p>
                {project.variables.map(v => (
                  <div key={v.id} className="flex gap-1 mb-1.5">
                    <Input value={v.name} onChange={e => commit(p => ({ ...p, variables: p.variables.map(x => (x.id === v.id ? { ...x, name: e.target.value } : x)) }))} placeholder="الاسم" className="h-7 text-[11px]" />
                    <Input value={v.value} onChange={e => commit(p => ({ ...p, variables: p.variables.map(x => (x.id === v.id ? { ...x, value: e.target.value } : x)) }))} placeholder="القيمة" className="h-7 text-[11px]" />
                    <button onClick={() => commit(p => ({ ...p, variables: p.variables.filter(x => x.id !== v.id) }))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="h-7 text-[10px] w-full gap-1"
                  onClick={() => commit(p => ({ ...p, variables: [...p.variables, { id: Math.random().toString(36).slice(2), name: 'متغير', value: '' }] }))}>
                  <Plus size={11} /> إضافة متغير
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* محرر الإجراء */}
      {showActionEditor && selection.kind === 'node' && selection.id && selection.ownerId && (() => {
        const list = selection.ownerKind === 'bar' ? project.bars.find(b => b.id === selection.ownerId)?.nodes
          : selection.ownerKind === 'modal' ? project.modals.find(m => m.id === selection.ownerId)?.nodes
            : project.pages.find(p => p.id === selection.ownerId)?.nodes;
        const n = list ? findNode(list, selection.id) : null;
        if (!n) return null;
        return (
          <ActionEditor
            action={n.action}
            project={project}
            onClose={() => setShowActionEditor(false)}
            onChange={a => mutateNodes(selection.ownerKind || 'page', selection.ownerId!, ns => {
              const upd = (l: AppNode[]): AppNode[] => l.map(x => (x.id === n.id ? { ...x, action: a } : { ...x, children: upd(x.children) }));
              return upd(ns);
            })}
          />
        );
      })()}

      {/* ═══ النوافذ المنبثقة للاستوديو ═══ */}
      {newPage.open && <PageModal />}
      {newBar.open && <BarModal />}
      {newModal.open && <ModalCreateModal />}
      {showAppSettings && <AppSettingsModal />}
      {showPreview && <PreviewOverlay />}
      {showPublish && <PublishModal />}
      {showSitemap && <SitemapModal />}
      {showModalLibrary && <ModalLibraryModal />}
      {deleteTarget && <DeleteConfirm />}
      {showExitConfirm && (
        <Overlay onClose={() => setShowExitConfirm(false)}>
          <div className="w-[420px] bg-white rounded-2xl p-5">
            <p className="text-base font-black text-slate-800 mb-1">لديك تغييرات غير محفوظة</p>
            <p className="text-xs text-slate-500 mb-4">إذا خرجت الآن، ستفقد التغييرات غير المحفوظة.</p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { doSave(); onExit(); }}>حفظ ثم خروج</Button>
              <Button variant="outline" className="flex-1 text-xs text-red-600 border-red-200" onClick={onExit}>خروج بدون حفظ</Button>
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setShowExitConfirm(false)}>إلغاء</Button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );

  // ═══════════════ مكوّنات فرعية داخلية ═══════════════

  function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()} className="max-h-[92vh] overflow-y-auto">{children}</motion.div>
      </div>
    );
  }

  function PagesDropdown() {
    const [q, setQ] = useState('');
    return (
      <div onClick={e => e.stopPropagation()} className="absolute top-9 right-0 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-slate-800">الصفحات ({project.pages.length})</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => { setShowSitemap(true); setDropdown(null); }}><Map size={11} /> خريطة</Button>
            <Button size="sm" className="h-6 text-[10px] gap-1 bg-blue-600" onClick={() => { setNewPage(s => ({ ...s, open: true, editId: null, name: '', error: '' })); setDropdown(null); }}><Plus size={11} /> صفحة</Button>
          </div>
        </div>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن صفحة…" className="h-7 text-xs mb-2" />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {project.pages.filter(p => p.name.includes(q)).map(p => (
            <div key={p.id} className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => { setPageId(p.id); setEditingModalId(null); setDropdown(null); }}>
              <FileText size={12} className="text-slate-400" />
              <span className="text-xs text-slate-700 flex-1 truncate">{p.name}</span>
              {p.isHome && <Badge className="bg-blue-100 text-blue-700 text-[8px]">رئيسية</Badge>}
              {p.parentId && <Badge variant="outline" className="text-[8px]">فرعية</Badge>}
              <button onClick={e => { e.stopPropagation(); setNewPage({ open: true, editId: p.id, name: p.name, type: p.isHome ? 'home' : p.parentId ? 'sub' : 'normal', parentId: p.parentId || '', layout: p.layout, bg: p.bg, error: '' }); setDropdown(null); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 p-0.5">✏</button>
              <button onClick={e => { e.stopPropagation(); duplicatePage(p.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 p-0.5"><Copy size={11} /></button>
              <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'page', id: p.id }); setDropdown(null); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function BarsDropdown() {
    return (
      <div onClick={e => e.stopPropagation()} className="absolute top-9 right-0 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-slate-800">الأشرطة ({project.bars.length})</p>
          <Button size="sm" className="h-6 text-[10px] gap-1 bg-emerald-600" onClick={() => { setNewBar(s => ({ ...s, open: true, step: 1 })); setDropdown(null); }}><Plus size={11} /> إضافة شريط</Button>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {project.bars.length === 0 && <p className="text-[11px] text-slate-400 py-3 text-center">لا توجد أشرطة</p>}
          {project.bars.map(b => (
            <div key={b.id} className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => { setSelection({ kind: 'bar', id: b.id }); setDropdown(null); }}>
              <Link2 size={12} className="text-slate-400" />
              <span className="text-xs text-slate-700 flex-1 truncate">{b.name}</span>
              <span className="text-[9px] text-slate-400">{b.scope === 'all' ? 'كل الصفحات' : `${b.pages.length} صفحة`}</span>
              {b.enabled ? <Eye size={11} className="text-emerald-500" /> : <EyeOff size={11} className="text-slate-300" />}
              <button onClick={e => { e.stopPropagation(); const c = clone(b); c.id = Math.random().toString(36).slice(2); c.name = `${b.name} — نسخة`; c.nodes = b.nodes.map(cloneNode); commit(p => ({ ...p, bars: [...p.bars, c] })); toast.success('تم النسخ'); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 p-0.5"><Copy size={11} /></button>
              <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'bar', id: b.id }); setDropdown(null); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ModalsDropdown() {
    const [q, setQ] = useState('');
    return (
      <div onClick={e => e.stopPropagation()} className="absolute top-9 right-0 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-slate-800">النوافذ المنبثقة ({project.modals.length})</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { setShowModalLibrary(true); setDropdown(null); }}>📚 مكتبة</Button>
            <Button size="sm" className="h-6 text-[10px] gap-1 bg-violet-600" onClick={() => { setNewModal(s => ({ ...s, open: true })); setDropdown(null); }}><Plus size={11} /> نافذة</Button>
          </div>
        </div>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن نافذة…" className="h-7 text-xs mb-2" />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {project.modals.filter(m => m.name.includes(q)).map(m => {
            const refs = countReferences(project, 'openModal', m.id);
            return (
              <div key={m.id} className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => { setEditingModalId(m.id); setSelection({ kind: 'modal', id: m.id }); setDropdown(null); }}>
                <MessageSquare size={12} className="text-slate-400" />
                <span className="text-xs text-slate-700 flex-1 truncate">{m.name}</span>
                <span className={`text-[9px] ${refs ? 'text-slate-400' : 'text-amber-600 font-bold'}`}>{refs ? `مستخدمة في ${refs}` : 'غير مستخدمة'}</span>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget({ kind: 'modal', id: m.id }); setDropdown(null); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={11} /></button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function TemplatesDropdown() {
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <div onClick={e => e.stopPropagation()} className="absolute top-9 right-0 w-[280px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1">
        <button onClick={() => { exportJson(false); setDropdown(null); }} className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-bold flex items-center gap-2"><Download size={12} /> تصدير JSON كامل</button>
        <button onClick={() => { exportJson(true); setDropdown(null); }} className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-bold flex items-center gap-2"><Download size={12} /> تصدير JSON خفيف (بلا صور)</button>
        <button onClick={() => fileRef.current?.click()} className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-bold flex items-center gap-2"><Upload size={12} /> استيراد تصميم JSON</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            try {
              const parsed = JSON.parse(String(r.result));
              if (!parsed?.pages) throw new Error('bad');
              replace({ ...parsed, id: project.id });
              setPageId(parsed.pages[0]?.id || '');
              setDirty(true);
              toast.success('تم استيراد التصميم ✓');
            } catch { toast.error('ملف غير صالح — أعد المحاولة'); }
          };
          r.readAsText(f);
          setDropdown(null);
        }} />
      </div>
    );
  }

  function PageModal() {
    const isEdit = !!newPage.editId;
    return (
      <Overlay onClose={() => setNewPage(s => ({ ...s, open: false }))}>
        <div className="w-[520px] max-w-[94vw] bg-white rounded-2xl p-5 space-y-3">
          <p className="text-base font-black text-slate-800">{isEdit ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}</p>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم الصفحة *</label>
            <Input value={newPage.name} onChange={e => setNewPage(s => ({ ...s, name: e.target.value, error: '' }))}
              placeholder="مثال: صفحة أرباحي" className={`h-9 text-sm ${newPage.error ? 'border-red-400' : ''}`} />
            {newPage.error && <p className="text-[11px] text-red-600 mt-1">{newPage.error}</p>}
            {newPage.name && <p className="text-[10px] text-slate-400 mt-1">{newPage.name.length} حرف · الرابط: /{slugify(newPage.name)}</p>}
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">نوع الصفحة *</label>
            <div className="flex gap-2">
              {([['normal', 'عادية'], ['home', 'رئيسية'], ['sub', 'فرعية']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setNewPage(s => ({ ...s, type: v }))}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold border ${newPage.type === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
            {newPage.type === 'home' && project.pages.some(p => p.isHome && p.id !== newPage.editId) &&
              <p className="text-[11px] text-amber-600 mt-1">⚠ توجد صفحة رئيسية أخرى — سيتم استبدالها</p>}
          </div>
          {newPage.type === 'sub' && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">الصفحة الأم *</label>
              <select value={newPage.parentId} onChange={e => setNewPage(s => ({ ...s, parentId: e.target.value, error: '' }))} className="w-full h-9 rounded-lg border border-slate-200 text-sm px-2 bg-white">
                <option value="">— اختر —</option>
                {project.pages.filter(p => p.id !== newPage.editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          {!isEdit && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">التخطيط الأولي *</label>
              <div className="grid grid-cols-5 gap-1.5">
                {([['blank', 'فارغة'], ['one', 'عمود'], ['two', 'عمودان'], ['three', '3 أعمدة'], ['grid', 'شبكة 2×2']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setNewPage(s => ({ ...s, layout: v }))}
                    className={`h-14 rounded-lg text-[10px] font-bold border flex flex-col items-center justify-center gap-1 ${newPage.layout === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    <Grid3x3 size={14} />{l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">لون الخلفية</label>
            <input type="color" value={newPage.bg} onChange={e => setNewPage(s => ({ ...s, bg: e.target.value }))} className="h-8 w-12 rounded border border-slate-200" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs" onClick={submitPage}>{isEdit ? 'حفظ التعديل' : 'إنشاء الصفحة'}</Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setNewPage(s => ({ ...s, open: false }))}>إلغاء</Button>
          </div>
        </div>
      </Overlay>
    );
  }

  function BarModal() {
    return (
      <Overlay onClose={() => setNewBar(s => ({ ...s, open: false }))}>
        <div className="w-[560px] max-w-[94vw] bg-white rounded-2xl p-5 space-y-3">
          <p className="text-base font-black text-slate-800">إضافة شريط جديد — الخطوة {newBar.step}/3</p>
          {newBar.step === 1 && (
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(BAR_KIND_LABELS) as [BarKind, string][]).map(([k, l]) => (
                <button key={k} onClick={() => setNewBar(s => ({ ...s, kind: k, name: s.name || l }))}
                  className={`p-3 rounded-xl border text-center ${newBar.kind === k ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <Minus size={16} className="mx-auto text-slate-500 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700">{l}</p>
                </button>
              ))}
            </div>
          )}
          {newBar.step === 2 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">يظهر في</label>
              <div className="flex gap-2">
                {([['all', 'كل الصفحات'], ['selected', 'صفحات محددة']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setNewBar(s => ({ ...s, scope: v }))}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold border ${newBar.scope === v ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
                ))}
              </div>
              {newBar.scope === 'selected' && (
                <div className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2">
                  {project.pages.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="accent-emerald-600" checked={newBar.pages.includes(p.id)}
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
              <label className="text-[11px] font-bold text-slate-600 block">اسم الشريط</label>
              <Input value={newBar.name} onChange={e => setNewBar(s => ({ ...s, name: e.target.value }))} placeholder="الشريط العلوي الرئيسي" className="h-9 text-sm" />
              <label className="text-[11px] font-bold text-slate-600 block mt-2">التخطيط الأولي</label>
              <div className="flex gap-2">
                {([['empty', 'فارغ'], ['template', 'قالب جاهز']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setNewBar(s => ({ ...s, preset: v }))}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold border ${newBar.preset === v ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            {newBar.step > 1 && <Button variant="outline" className="text-xs" onClick={() => setNewBar(s => ({ ...s, step: (s.step - 1) as 1 | 2 | 3 }))}>السابق</Button>}
            {newBar.step < 3
              ? <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs" disabled={newBar.step === 1 && !newBar.kind} onClick={() => setNewBar(s => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 }))}>التالي</Button>
              : <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={submitBar}>إنشاء الشريط</Button>}
            <Button variant="outline" className="text-xs" onClick={() => setNewBar(s => ({ ...s, open: false }))}>إلغاء</Button>
          </div>
        </div>
      </Overlay>
    );
  }

  function ModalCreateModal() {
    return (
      <Overlay onClose={() => setNewModal(s => ({ ...s, open: false }))}>
        <div className="w-[560px] max-w-[94vw] bg-white rounded-2xl p-5 space-y-3">
          <p className="text-base font-black text-slate-800">إنشاء نافذة منبثقة</p>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم النافذة *</label>
            <Input value={newModal.name} onChange={e => setNewModal(s => ({ ...s, name: e.target.value, error: '' }))} placeholder="مثال: نافذة السحب" className={`h-9 text-sm ${newModal.error ? 'border-red-400' : ''}`} />
            {newModal.error && <p className="text-[11px] text-red-600 mt-1">{newModal.error}</p>}
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">نوع النافذة *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.entries(MODAL_KIND_LABELS) as [ModalKind, string][]).map(([k, l]) => (
                <button key={k} onClick={() => setNewModal(s => ({ ...s, kind: k }))}
                  className={`p-2 rounded-lg border text-[10px] font-bold ${newModal.kind === k ? 'bg-violet-50 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">الحجم الأولي *</label>
            <div className="flex gap-1.5">
              {([['sm', 'صغير 400'], ['md', 'متوسط 600'], ['lg', 'كبير 800'], ['xl', 'ضخم 1000'], ['full', 'ملء الشاشة']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setNewModal(s => ({ ...s, size: v }))}
                  className={`flex-1 h-8 rounded-lg text-[10px] font-bold border ${newModal.size === v ? 'bg-violet-50 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" checked={newModal.closable} onChange={e => setNewModal(s => ({ ...s, closable: e.target.checked }))} className="accent-violet-600" />
            قابلة للإغلاق
          </label>
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-xs" onClick={submitModal}>إنشاء النافذة</Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setNewModal(s => ({ ...s, open: false }))}>إلغاء</Button>
          </div>
        </div>
      </Overlay>
    );
  }

  function ModalLibraryModal() {
    return (
      <Overlay onClose={() => setShowModalLibrary(false)}>
        <div className="w-[720px] max-w-[94vw] bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-black text-slate-800">📚 مكتبة النوافذ الجاهزة</p>
            <button onClick={() => setShowModalLibrary(false)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MODAL_LIBRARY.map(t => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow">
                <div className="h-16 rounded-lg bg-slate-100 flex items-center justify-center mb-2"><MessageSquare size={20} className="text-slate-400" /></div>
                <p className="text-xs font-black text-slate-800">{t.label}</p>
                <p className="text-[10px] text-slate-400 mb-2">{t.description}</p>
                <Button size="sm" className="w-full h-7 text-[10px] bg-violet-600 hover:bg-violet-700"
                  onClick={() => { const m = t.build(); commit(p => ({ ...p, modals: [...p.modals, m] })); toast.success(`تمت إضافة نافذة ${m.name} ✓`); setShowModalLibrary(false); setEditingModalId(m.id); }}>
                  + إضافة للتطبيق
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  function SitemapModal() {
    const roots = project.pages.filter(p => !p.parentId);
    return (
      <Overlay onClose={() => setShowSitemap(false)}>
        <div className="w-[760px] max-w-[94vw] bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-black text-slate-800">🗺 خريطة التطبيق</p>
            <button onClick={() => setShowSitemap(false)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            {roots.map(r => (
              <div key={r.id}>
                <button onClick={() => { setPageId(r.id); setEditingModalId(null); setShowSitemap(false); }}
                  className="w-40 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-right hover:shadow-md">
                  <p className="text-xs font-black text-slate-800">{r.name}</p>
                  <p className="text-[10px] text-slate-400">{countNodes(r.nodes)} مكون</p>
                </button>
                <div className="mr-8 mt-2 flex flex-wrap gap-2 border-r-2 border-dashed border-slate-200 pr-4">
                  {project.pages.filter(p => p.parentId === r.id).map(c => (
                    <button key={c.id} onClick={() => { setPageId(c.id); setEditingModalId(null); setShowSitemap(false); }}
                      className="w-36 p-2 rounded-lg border border-slate-200 bg-white text-right hover:shadow">
                      <p className="text-[11px] font-bold text-slate-700">{c.name}</p>
                      <p className="text-[9px] text-slate-400">{countNodes(c.nodes)} مكون</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  function AppSettingsModal() {
    const [tab, setTab] = useState('identity');
    const tabs = [
      ['identity', '📱 الهوية'], ['colors', '🎨 الألوان'], ['fonts', '🔤 الخطوط'],
      ['lang', '🌐 اللغة والاتجاه'], ['mode', '🌗 الوضع'], ['social', '🌍 الروابط'],
      ['contact', '📞 الاتصال'], ['legal', '📄 الوثائق'], ['advanced', '🔧 متقدم'],
    ];
    const set = (patch: Partial<AppProject>) => commit(p => ({ ...p, ...patch }));
    return (
      <Overlay onClose={() => setShowAppSettings(false)}>
        <div className="w-[860px] max-w-[94vw] h-[80vh] bg-white rounded-2xl flex overflow-hidden">
          <div className="w-48 bg-slate-50 border-l border-slate-200 p-2 space-y-1 overflow-y-auto flex-shrink-0">
            {tabs.map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold ${tab === v ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:bg-white/60'}`}>{l}</button>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-black text-slate-800">⚙️ إعدادات التطبيق</p>
              <button onClick={() => setShowAppSettings(false)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tab === 'identity' && <>
                <F label="اسم التطبيق"><Input value={project.name} onChange={e => set({ name: e.target.value })} className="h-8 text-sm" /></F>
                <F label="الاسم المختصر"><Input value={project.shortName} onChange={e => set({ shortName: e.target.value })} className="h-8 text-sm" /></F>
                <F label="الوصف"><textarea value={project.description} onChange={e => set({ description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></F>
                <F label="الكلمات المفتاحية"><Input value={project.keywords} onChange={e => set({ keywords: e.target.value })} className="h-8 text-sm" /></F>
                <F label="رقم الإصدار"><Input value={project.version} onChange={e => set({ version: e.target.value })} className="h-8 text-sm" /></F>
                <F label="الشعار">
                  <div className="flex items-center gap-2">
                    {project.logo && <img src={project.logo} alt="" className="w-10 h-10 rounded object-contain border" />}
                    <input type="file" accept="image/*" className="text-[11px]" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => set({ logo: String(r.result) }); r.readAsDataURL(f); }} />
                  </div>
                </F>
                <F label="أيقونة التطبيق">
                  <div className="flex items-center gap-2">
                    {project.favicon && <img src={project.favicon} alt="" className="w-8 h-8 rounded object-contain border" />}
                    <input type="file" accept="image/*" className="text-[11px]" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => set({ favicon: String(r.result) }); r.readAsDataURL(f); }} />
                  </div>
                </F>
                <F label="لون العلامة"><input type="color" value={project.brandColor} onChange={e => set({ brandColor: e.target.value })} className="h-8 w-16 rounded border" /></F>
              </>}
              {tab === 'colors' && (Object.entries(project.design).filter(([k]) => k.includes('primary') || k.includes('secondary') || k.includes('success') || k.includes('warning') || k.includes('danger') || k.startsWith('bg') || k.startsWith('text') || k === 'borders') as [string, string][]).map(([k, v]) => (
                <F key={k} label={k}><input type="color" value={String(v).startsWith('#') ? String(v) : '#ffffff'} onChange={e => commit(p => ({ ...p, design: { ...p.design, [k]: e.target.value } }))} className="h-8 w-16 rounded border" /></F>
              ))}
              {tab === 'fonts' && <>
                <F label="خط العناوين"><Input value={project.design.headingFont} onChange={e => commit(p => ({ ...p, design: { ...p.design, headingFont: e.target.value } }))} className="h-8 text-sm" /></F>
                <F label="خط المحتوى"><Input value={project.design.bodyFont} onChange={e => commit(p => ({ ...p, design: { ...p.design, bodyFont: e.target.value } }))} className="h-8 text-sm" /></F>
                <F label="الحجم الأساسي"><Input type="number" value={project.design.baseSize} onChange={e => commit(p => ({ ...p, design: { ...p.design, baseSize: Number(e.target.value) } }))} className="h-8 text-sm" /></F>
              </>}
              {tab === 'lang' && <>
                <F label="اللغة الافتراضية">
                  <select value={project.lang} onChange={e => set({ lang: e.target.value as AppProject['lang'] })} className="h-8 rounded-lg border border-slate-200 text-sm px-2 w-full bg-white">
                    <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option>
                  </select></F>
                <F label="الاتجاه">
                  <div className="flex gap-2">{(['rtl', 'ltr', 'auto'] as const).map(d => (
                    <button key={d} onClick={() => set({ dir: d })} className={`flex-1 h-8 rounded-lg text-xs font-bold border ${project.dir === d ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{d.toUpperCase()}</button>))}</div>
                </F>
                <F label="المنطقة الزمنية"><Input value={project.timezone} onChange={e => set({ timezone: e.target.value })} className="h-8 text-sm" /></F>
                <F label="العملة"><Input value={project.currency} onChange={e => set({ currency: e.target.value })} className="h-8 text-sm" /></F>
              </>}
              {tab === 'mode' && <F label="الوضع الافتراضي">
                <div className="flex gap-2">{([['light', 'فاتح'], ['dark', 'داكن'], ['system', 'حسب النظام']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => set({ themeMode: v })} className={`flex-1 h-8 rounded-lg text-xs font-bold border ${project.themeMode === v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>{l}</button>))}</div>
              </F>}
              {tab === 'social' && (Object.keys(project.social) as (keyof AppProject['social'])[]).map(k => (
                <F key={k} label={k}><Input value={project.social[k]} onChange={e => set({ social: { ...project.social, [k]: e.target.value } })} className="h-8 text-sm" /></F>
              ))}
              {tab === 'contact' && (Object.keys(project.contact) as (keyof AppProject['contact'])[]).map(k => (
                <F key={k} label={k}><Input value={project.contact[k]} onChange={e => set({ contact: { ...project.contact, [k]: e.target.value } })} className="h-8 text-sm" /></F>
              ))}
              {tab === 'legal' && <>
                <F label="الشروط والأحكام"><textarea value={project.legal.terms} onChange={e => set({ legal: { ...project.legal, terms: e.target.value } })} rows={5} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></F>
                <F label="سياسة الخصوصية"><textarea value={project.legal.privacy} onChange={e => set({ legal: { ...project.legal, privacy: e.target.value } })} rows={5} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></F>
              </>}
              {tab === 'advanced' && <>
                <F label="ربط بمشترك">
                  <select value={project.subscriberId || ''} onChange={e => set({ subscriberId: e.target.value || null })} className="h-8 rounded-lg border border-slate-200 text-sm px-2 w-full bg-white">
                    <option value="">— بلا ربط (قالب عام) —</option>
                    {subscribers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></F>
                <F label="قالب لكل المشتركين"><input type="checkbox" checked={project.isTemplate} onChange={e => set({ isTemplate: e.target.checked })} className="accent-blue-600 w-4 h-4" /></F>
                <p className="text-[11px] text-slate-400">معرّف المشروع: {project.id}</p>
              </>}
            </div>
            <div className="px-4 py-3 border-t border-slate-200 flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { doSave(); setShowAppSettings(false); }}>💾 حفظ الإعدادات</Button>
              <Button variant="outline" className="text-xs" onClick={() => setShowAppSettings(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      </Overlay>
    );

    function F({ label, children }: { label: string; children: React.ReactNode }) {
      return <div className="flex items-center gap-3"><label className="text-[11px] font-bold text-slate-600 w-36 flex-shrink-0">{label}</label><div className="flex-1 min-w-0">{children}</div></div>;
    }
  }

  function PreviewOverlay() {
    const [pDevice, setPDevice] = useState(device);
    const [tick, setTick] = useState(0);
    const [testMode, setTestMode] = useState(false);
    return (
      <div className="fixed inset-0 z-[150] bg-slate-900 flex flex-col" dir="rtl">
        <div className="h-12 bg-slate-800 flex items-center gap-2 px-3 text-white flex-shrink-0">
          <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent text-white border-white/20" onClick={() => setShowPreview(false)}>← رجوع للتحرير</Button>
          <div className="flex-1 flex justify-center gap-1">
            {DEVICES.map(d => (
              <button key={d.w} onClick={() => setPDevice(d.w)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${pDevice === d.w ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/10'}`}>
                <d.icon size={12} /> {d.w}
              </button>
            ))}
          </div>
          <button onClick={() => setTestMode(t => !t)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${testMode ? 'bg-amber-500 text-white' : 'text-white/70 hover:bg-white/10'}`}><FlaskConical size={12} /> وضع الاختبار</button>
          <button onClick={() => setTick(t => t + 1)} className="px-2.5 py-1.5 rounded-lg text-[11px] text-white/70 hover:bg-white/10">🔄 إعادة تحميل</button>
          <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
          <div key={tick} className="bg-white rounded-[28px] shadow-2xl overflow-hidden ring-8 ring-slate-700" style={{ width: pDevice, maxWidth: '100%', minHeight: 600 }}>
            <AppRuntime project={project} data={runtimeData} device={pDevice} />
          </div>
        </div>
        {testMode && (
          <div className="h-10 bg-amber-500/90 text-white text-[11px] font-bold flex items-center px-4 flex-shrink-0">
            🧪 وضع الاختبار — كل تفاعل يعمل فعلياً · المتغيرات تُستبدل ببيانات {runtimeData.name}
          </div>
        )}
        <div className="h-8 bg-slate-800 text-white/60 text-[10px] flex items-center justify-center flex-shrink-0">
          💡 المتغيرات تعرض بيانات المشترك المرتبط — إن لم يوجد، تُعرض بيانات تجريبية
        </div>
      </div>
    );
  }

  function PublishModal() {
    const [version, setVersion] = useState(bumpVersion(project.version));
    const [notes, setNotes] = useState('');
    const [scope, setScope] = useState<'subscriber' | 'template'>(project.subscriberId ? 'subscriber' : 'template');
    const [subId, setSubId] = useState(project.subscriberId || '');
    const [publishing, setPublishing] = useState(false);
    const [progress, setProgress] = useState(0);
    const steps = ['جارٍ التحقق من التصميم…', 'جارٍ تجهيز الأصول…', 'جارٍ إنشاء نسخة نهائية…', 'جارٍ التطبيق للمشترك…'];

    const start = () => {
      setPublishing(true);
      setProgress(0);
      const iv = setInterval(() => setProgress(p => {
        const n = Math.min(100, p + 4);
        if (n >= 100) { clearInterval(iv); doPublish(version, notes, scope, subId); }
        return n;
      }), 60);
    };

    return (
      <Overlay onClose={() => !publishing && setShowPublish(false)}>
        <div className="w-[640px] max-w-[94vw] bg-white rounded-2xl p-5 space-y-4">
          <p className="text-base font-black text-slate-800">🚀 نشر التطبيق</p>

          <div className="grid grid-cols-5 gap-2">
            {([['الصفحات', stats.pages], ['الأشرطة', stats.bars], ['النوافذ', stats.modals], ['المكونات', stats.components], ['الحجم KB', stats.assetsKB]] as const).map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center">
                <p className="text-[10px] text-slate-400 font-bold">{l}</p><p className="text-base font-black text-slate-800">{v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-3 space-y-1.5 max-h-40 overflow-y-auto">
            <p className="text-[11px] font-black text-slate-700 mb-1">التحقق قبل النشر</p>
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {c.level === 'ok' ? <CheckCircle2 size={13} className="text-emerald-500" /> : c.level === 'warn' ? <AlertTriangle size={13} className="text-amber-500" /> : <XCircle size={13} className="text-red-500" />}
                <span className={c.level === 'error' ? 'text-red-700 font-bold' : 'text-slate-600'}>{c.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الإصدار</label><Input value={version} onChange={e => setVersion(e.target.value)} className="h-8 text-sm" /></div>
            <div><label className="text-[11px] font-bold text-slate-600 block mb-1">نطاق النشر</label>
              <select value={scope} onChange={e => setScope(e.target.value as 'subscriber' | 'template')} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
                <option value="subscriber">للمشترك الحالي فقط</option><option value="template">كقالب لكل المشتركين</option>
              </select></div>
          </div>
          {scope === 'subscriber' && (
            <div><label className="text-[11px] font-bold text-slate-600 block mb-1">المشترك</label>
              <select value={subId} onChange={e => setSubId(e.target.value)} className="w-full h-8 rounded-lg border border-slate-200 text-xs px-2 bg-white">
                <option value="">— اختر مشتركاً —</option>{subscribers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
          )}
          <div><label className="text-[11px] font-bold text-slate-600 block mb-1">ملاحظات الإصدار</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></div>

          {publishing && (
            <div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="text-[11px] text-slate-500 mt-1.5">{steps[Math.min(steps.length - 1, Math.floor(progress / 25))]} ({Math.round(progress)}%)</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button disabled={hasErrors || publishing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={start}>🚀 نشر الآن</Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={() => { doSave(); setShowPublish(false); toast.success('تم حفظ المسودة'); }}>💾 حفظ كمسودة</Button>
            <Button variant="outline" className="text-xs" disabled={publishing} onClick={() => setShowPublish(false)}>إلغاء</Button>
          </div>
          {hasErrors && <p className="text-[11px] text-red-600">يوجد أخطاء يجب إصلاحها قبل النشر (أزرار بلا إجراء أو بلا صفحة رئيسية).</p>}
        </div>
      </Overlay>
    );
  }

  function DeleteConfirm() {
    if (!deleteTarget) return null;
    const t = deleteTarget;
    let title = 'تأكيد الحذف';
    let body = 'هل تريد الحذف؟ هذا الإجراء لا يمكن التراجع عنه.';
    let warnings: string[] = [];
    let blocked = false;

    if (t.kind === 'page') {
      const pg = project.pages.find(p => p.id === t.id);
      const kids = project.pages.filter(p => p.parentId === t.id);
      const refs = countReferences(project, 'openPage', t.id);
      title = 'حذف الصفحة';
      body = `هل تريد حذف صفحة "${pg?.name}"؟ سيتم حذف جميع المكونات والصفحات الفرعية المرتبطة بها.`;
      if (kids.length) warnings.push(`⚠ سيتم حذف ${kids.length} صفحة فرعية أيضاً`);
      if (refs) warnings.push(`⚠ يوجد ${refs} زر يشير لهذه الصفحة — ستصبح روابط معطّلة`);
      if (project.pages.length <= 1) { warnings.push('⚠ لا يمكن حذف آخر صفحة — أنشئ صفحة جديدة أولاً'); blocked = true; }
    }
    if (t.kind === 'bar') {
      const b = project.bars.find(x => x.id === t.id);
      title = 'حذف الشريط';
      body = `هل تريد حذف شريط "${b?.name}"؟`;
      if (b?.nodes.length) warnings.push(`⚠ الشريط يحوي ${countNodes(b.nodes)} مكون`);
    }
    if (t.kind === 'modal') {
      const m = project.modals.find(x => x.id === t.id);
      const refs = countReferences(project, 'openModal', t.id);
      title = 'حذف النافذة';
      body = `هل تريد حذف نافذة "${m?.name}"؟`;
      if (refs) warnings.push(`⚠ هذه النافذة تُفتح من ${refs} زر — ستصبح تلك الأزرار بدون إجراء`);
    }
    if (t.kind === 'node') { title = 'حذف المكون'; body = 'سيتم حذف المكون وكل ما بداخله.'; }

    const confirm = () => {
      if (t.kind === 'page') deletePage(t.id);
      if (t.kind === 'bar') { commit(p => ({ ...p, bars: p.bars.filter(b => b.id !== t.id) })); toast.success('تم حذف الشريط'); }
      if (t.kind === 'modal') { commit(p => ({ ...p, modals: p.modals.filter(m => m.id !== t.id) })); if (editingModalId === t.id) setEditingModalId(null); toast.success('تم حذف النافذة'); }
      if (t.kind === 'node' && selection.ownerId) deleteNode(t.id, selection.ownerKind || 'page', selection.ownerId);
      setDeleteTarget(null);
    };

    return (
      <Overlay onClose={() => setDeleteTarget(null)}>
        <div className="w-[440px] max-w-[94vw] bg-white rounded-2xl p-5">
          <p className="text-base font-black text-slate-800 mb-1">{title}</p>
          <p className="text-xs text-slate-500 mb-2">{body}</p>
          {warnings.map((w, i) => <p key={i} className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mb-1">{w}</p>)}
          <div className="flex gap-2 mt-3">
            <Button disabled={blocked} className="flex-1 bg-red-600 hover:bg-red-700 text-xs" onClick={confirm}>حذف</Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
          </div>
        </div>
      </Overlay>
    );
  }
}
