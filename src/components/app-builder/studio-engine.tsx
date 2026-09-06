// ═══════════════════════════════════════════════════════════════
// محرّك حالة الاستوديو (Studio Engine)
// كل الحالة والأوامر الخاصة ببيئة البناء في مكان واحد، وتُستهلك عبر
// Context حتى تبقى مكوّنات الواجهة مستقرة الهوية (لا يُعاد تركيبها
// عند كل ضغطة مفتاح — مهم جدًا للكتابة على شاشة الهاتف).
// الوظائف مطابقة تمامًا لما كان عليه الاستوديو، لم يُحذف أي أمر.
// ═══════════════════════════════════════════════════════════════
import {
  AppBar, AppModal, AppNode, AppPage, AppProject, BarKind, ModalKind, Selection,
} from '@/types/app-builder';
import {
  createNode, createPage, createBar, createModal, BAR_KIND_LABELS, COMPONENTS_BY_TYPE, slugify,
} from '@/data/app-builder-defaults';
import {
  clone, cloneNode, countNodes, countReferences, download, duplicateNode, findNode, insertNode,
  moveNode, preflight, projectStats, removeNode, RuntimeData, bumpVersion,
} from '@/lib/app-builder';
import { useProjectEditor } from '@/hooks/use-app-builder';
import { useBuilderMode } from '@/components/app-builder/builder-ui';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export type Drawer = null | 'components' | 'design' | 'data' | 'actions';
export type Dropdown = null | 'pages' | 'bars' | 'modals' | 'templates';
/** اللوحة المفتوحة على الجوال كـ bottom sheet */
export type MobilePanel = null | 'tree' | 'props' | 'add' | 'tools' | 'data';
export type DeviceKey = 375 | 768 | 1280 | 0;

export interface StudioEngine {
  // حالة المحرر
  project: AppProject;
  commit: (fn: (p: AppProject) => AppProject) => void;
  replace: (p: AppProject) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
  lastSaved: Date | null;
  doSave: () => void;
  onExit: () => void;
  subscribers: { id: string; name: string }[];
  runtimeData: RuntimeData;
  mode: ReturnType<typeof useBuilderMode>;

  // التحديد والتنقل
  selection: Selection;
  setSelection: (s: Selection) => void;
  pageId: string;
  setPageId: (id: string) => void;
  page?: AppPage;
  editingModalId: string | null;
  setEditingModalId: (id: string | null) => void;
  editingModal?: AppModal | null;
  goToPage: (dir: -1 | 1) => void;
  selectPage: (id: string) => void;
  selectModal: (id: string) => void;
  backToPage: () => void;

  // لوحات
  device: DeviceKey;
  setDevice: (d: DeviceKey) => void;
  zoom: number;
  setZoom: (updater: number | ((z: number) => number)) => void;
  autoFit: boolean;
  setAutoFit: (v: boolean | ((a: boolean) => boolean)) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean | ((s: boolean) => boolean)) => void;
  showRuler: boolean;
  setShowRuler: (v: boolean | ((s: boolean) => boolean)) => void;
  drawer: Drawer;
  setDrawer: (d: Drawer | ((x: Drawer) => Drawer)) => void;
  dropdown: Dropdown;
  setDropdown: (d: Dropdown | ((x: Dropdown) => Dropdown)) => void;
  mobilePanel: MobilePanel;
  setMobilePanel: (p: MobilePanel | ((x: MobilePanel) => MobilePanel)) => void;
  treeOpen: Record<string, boolean>;
  setTreeOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  // نوافذ الاستوديو
  showActionEditor: boolean;
  setShowActionEditor: (v: boolean | ((s: boolean) => boolean)) => void;
  showAppSettings: boolean;
  setShowAppSettings: (v: boolean | ((s: boolean) => boolean)) => void;
  showPreview: boolean;
  setShowPreview: (v: boolean | ((s: boolean) => boolean)) => void;
  showPublish: boolean;
  setShowPublish: (v: boolean | ((s: boolean) => boolean)) => void;
  showSitemap: boolean;
  setShowSitemap: (v: boolean | ((s: boolean) => boolean)) => void;
  showModalLibrary: boolean;
  setShowModalLibrary: (v: boolean | ((s: boolean) => boolean)) => void;
  showExitConfirm: boolean;
  setShowExitConfirm: (v: boolean | ((s: boolean) => boolean)) => void;
  requestExit: () => void;

  // مكتبة المكونات
  componentSearch: string;
  setComponentSearch: (v: string) => void;
  componentCat: string;
  setComponentCat: (v: string) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  nodeTemplates: AppNode[];
  setNodeTemplates: React.Dispatch<React.SetStateAction<AppNode[]>>;
  addComponent: (type: string) => void;
  saveSelectionAsTemplate: () => void;

  // تحرير العقد
  currentOwner: { kind: 'page' | 'modal'; id: string };
  mutateNodes: (ownerKind: 'page' | 'bar' | 'modal', ownerId: string, fn: (nodes: AppNode[]) => AppNode[]) => void;
  nodeListOf: (ownerKind: 'page' | 'bar' | 'modal' | undefined, ownerId: string | undefined) => AppNode[] | undefined;
  duplicateSelectedNode: () => void;
  deleteNode: (id: string, ownerKind: 'page' | 'bar' | 'modal', ownerId: string) => void;
  moveSelectedNode: (dir: -1 | 1) => void;

  // نماذج الإنشاء
  newPage: NewPageState;
  setNewPage: React.Dispatch<React.SetStateAction<NewPageState>>;
  openCreatePage: (patch?: Partial<NewPageState>) => void;
  openEditPage: (p: AppPage) => void;
  openCreateSubPage: (parentId: string) => void;
  submitPage: () => void;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  newBar: NewBarState;
  setNewBar: React.Dispatch<React.SetStateAction<NewBarState>>;
  openCreateBar: () => void;
  submitBar: () => void;
  duplicateBar: (id: string) => void;
  newModal: NewModalState;
  setNewModal: React.Dispatch<React.SetStateAction<NewModalState>>;
  openCreateModal: () => void;
  submitModal: () => void;
  deleteTarget: DeleteTarget | null;
  setDeleteTarget: (t: DeleteTarget | null) => void;
  confirmDelete: () => void;

  // النشر والتصدير
  stats: ReturnType<typeof projectStats>;
  pageNodeCount: number;
  checks: ReturnType<typeof preflight>;
  hasErrors: boolean;
  doPublish: (version: string, notes: string, scope: 'subscriber' | 'template', subId: string) => void;
  bumpVersion: (v: string) => string;
  exportJson: (light: boolean) => void;
  importJson: (file: File) => void;
}

export interface NewPageState {
  open: boolean; editId: string | null; name: string; type: 'normal' | 'home' | 'sub';
  parentId: string; layout: AppPage['layout']; bg: string; error: string;
}
export interface NewBarState {
  open: boolean; step: 1 | 2 | 3; kind: BarKind | null; scope: 'all' | 'selected';
  pages: string[]; name: string; preset: 'empty' | 'template';
}
export interface NewModalState {
  open: boolean; name: string; kind: ModalKind; size: AppModal['size']; closable: boolean; error: string;
}
export interface DeleteTarget { kind: 'page' | 'bar' | 'modal' | 'node'; id: string }

const StudioContext = createContext<StudioEngine | null>(null);
export const useStudio = (): StudioEngine => useContext(StudioContext) as StudioEngine;

export function StudioProvider({
  value, children,
}: { value: StudioEngine; children: React.ReactNode }) {
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

/** البنية الكاملة لحالة الاستوديو — منطق مطابق للنسخة الأصلية */
export function useStudioEngine({
  initialProject, onSave, onExit, subscribers, runtimeData,
}: {
  initialProject: AppProject;
  onSave: (p: AppProject) => void;
  onExit: () => void;
  subscribers: { id: string; name: string }[];
  runtimeData: RuntimeData;
}): StudioEngine {
  const { project, commit, undo, redo, replace, dirty, setDirty, canUndo, canRedo } = useProjectEditor(initialProject);
  const mode = useBuilderMode();
  const [selection, setSelection] = useState<Selection>({ kind: null, id: null });
  const [device, setDevice] = useState<DeviceKey>(375);
  const [pageId, setPageId] = useState<string>(initialProject.pages[0]?.id || '');
  const [editingModalId, setEditingModalId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [dropdown, setDropdown] = useState<Dropdown>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [showActionEditor, setShowActionEditor] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [showModalLibrary, setShowModalLibrary] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [autoFit, setAutoFit] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>({ pages: true, bars: true, modals: true });
  const [componentSearch, setComponentSearch] = useState('');
  const [componentCat, setComponentCat] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [nodeTemplates, setNodeTemplates] = useState<AppNode[]>([]);

  // نماذج إنشاء
  const [newPage, setNewPage] = useState<NewPageState>(
    { open: false, editId: null, name: '', type: 'normal', parentId: '', layout: 'blank', bg: '#ffffff', error: '' });
  const [newBar, setNewBar] = useState<NewBarState>(
    { open: false, step: 1, kind: null, scope: 'all', pages: [], name: '', preset: 'empty' });
  const [newModal, setNewModal] = useState<NewModalState>(
    { open: false, name: '', kind: 'modal', size: 'md', closable: true, error: '' });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

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

  // ── مساعدات تعديل العقد ──
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

  const nodeListOf = useCallback((ownerKind: 'page' | 'bar' | 'modal' | undefined, ownerId: string | undefined) => {
    if (!ownerId) return undefined;
    return ownerKind === 'bar' ? project.bars.find(b => b.id === ownerId)?.nodes
      : ownerKind === 'modal' ? project.modals.find(m => m.id === ownerId)?.nodes
        : project.pages.find(p => p.id === ownerId)?.nodes;
  }, [project]);

  // ── اختصارات (16.6) — تبقى كما هي على الحاسوب ──
  const api = useRef<Record<string, any>>({});
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
      if (e.key === 'Escape') { setSelection({ kind: null, id: null }); setDropdown(() => null); setMobilePanel(() => null); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selection.kind === 'node' && selection.id) { e.preventDefault(); api.current.duplicateSelectedNode?.(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [doSave, undo, redo, selection]);

  // ── إضافة/تحديد المكونات ──
  const addComponent = (type: string) => {
    const node = createNode(type);
    // إن كان المحدد حاوية → يُضاف داخلها، وإلا في نهاية الوعاء الحالي
    let ownerKind: 'page' | 'bar' | 'modal' = currentOwner.kind;
    let ownerId = currentOwner.id;
    let parentId: string | null = null;
    if (selection.kind === 'node' && selection.id && selection.ownerId) {
      ownerKind = selection.ownerKind || 'page';
      ownerId = selection.ownerId;
      const list = nodeListOf(ownerKind, ownerId);
      const target = list ? findNode(list, selection.id) : null;
      if (target && COMPONENTS_BY_TYPE[target.type]?.container) parentId = target.id;
    } else if (selection.kind === 'bar' && selection.id) {
      ownerKind = 'bar'; ownerId = selection.id;
    }
    if (!ownerId) { toast.error('اختر صفحة أولاً'); return; }
    mutateNodes(ownerKind, ownerId, nodes => insertNode(nodes, parentId, node));
    setSelection({ kind: 'node', id: node.id, ownerKind, ownerId });
    if (mode.isCompact) setDrawer(null);
    toast.success(`تمت إضافة «${node.name}» ✓`);
  };

  const duplicateSelectedNode = () => {
    if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
    mutateNodes(selection.ownerKind || 'page', selection.ownerId, nodes => duplicateNode(nodes, selection.id!));
    toast.success('تم النسخ ✓');
  };
  api.current.duplicateSelectedNode = duplicateSelectedNode;

  const deleteNode = (id: string, ownerKind: 'page' | 'bar' | 'modal', ownerId: string) => {
    mutateNodes(ownerKind, ownerId, nodes => removeNode(nodes, id));
    setSelection({ kind: null, id: null });
    toast.success('تم حذف المكون');
  };

  const moveSelectedNode = (dir: -1 | 1) => {
    if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
    mutateNodes(selection.ownerKind || 'page', selection.ownerId, nodes => moveNode(nodes, selection.id!, dir));
  };

  const saveSelectionAsTemplate = () => {
    if (selection.kind !== 'node' || !selection.id || !selection.ownerId) return;
    const list = nodeListOf(selection.ownerKind, selection.ownerId);
    const n = list ? findNode(list, selection.id) : null;
    if (n) { setNodeTemplates(t => [...t, cloneNode(n)]); toast.success('تم حفظ المكون كقالب ✓'); }
  };

  // ── صفحات ──
  const openCreatePage = (patch?: Partial<NewPageState>) => {
    setNewPage(s => ({ ...s, open: true, editId: null, name: '', error: '', ...patch }));
    setDropdown(null); setMobilePanel(null);
  };
  const openEditPage = (p: AppPage) => {
    setNewPage({
      open: true, editId: p.id, name: p.name, type: p.isHome ? 'home' : p.parentId ? 'sub' : 'normal',
      parentId: p.parentId || '', layout: p.layout, bg: p.bg, error: '',
    });
    setDropdown(null); setMobilePanel(null);
  };
  const openCreateSubPage = (parentId: string) => openCreatePage({ type: 'sub', parentId });
  const closePageForm = () => setNewPage({ open: false, editId: null, name: '', type: 'normal', parentId: '', layout: 'blank', bg: '#ffffff', error: '' });

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
    closePageForm();
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
  const openCreateBar = () => { setNewBar(s => ({ ...s, open: true, step: 1 })); setDropdown(null); setMobilePanel(null); };
  const closeBarForm = () => setNewBar({ open: false, step: 1, kind: null, scope: 'all', pages: [], name: '', preset: 'empty' });

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
    closeBarForm();
    toast.success(`تم إنشاء شريط ${bar.name} ✓`);
  };

  const duplicateBar = (id: string) => {
    const b = project.bars.find(x => x.id === id);
    if (!b) return;
    const c = clone(b);
    c.id = Math.random().toString(36).slice(2);
    c.name = `${b.name} — نسخة`;
    c.nodes = b.nodes.map(cloneNode);
    commit(p => ({ ...p, bars: [...p.bars, c] }));
    toast.success('تم النسخ ✓');
  };

  // ── نوافذ ──
  const openCreateModal = () => { setNewModal(s => ({ ...s, open: true })); setDropdown(null); setMobilePanel(null); };
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

  // ── التحديد المرافق ──
  const selectPage = (id: string) => { setPageId(id); setEditingModalId(null); setSelection({ kind: 'page', id }); setDropdown(null); setMobilePanel(null); };
  const selectModal = (id: string) => { setEditingModalId(id); setSelection({ kind: 'modal', id }); setDropdown(null); setMobilePanel(null); };
  const backToPage = () => { setEditingModalId(null); setSelection({ kind: 'page', id: page?.id || null }); };
  const goToPage = (dir: -1 | 1) => {
    const i = project.pages.findIndex(p => p.id === pageId);
    const n = i + dir;
    if (n >= 0 && n < project.pages.length) setPageId(project.pages[n].id);
  };
  const requestExit = () => (dirty ? setShowExitConfirm(true) : onExit());

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
      setShowPreview(() => false);
      setShowPublish(() => false);
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

  const importJson = (file: File) => {
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
    r.readAsText(file);
    setDropdown(null);
  };

  const confirmDelete = () => {
    const t = deleteTarget;
    if (!t) return;
    if (t.kind === 'page') deletePage(t.id);
    if (t.kind === 'bar') { commit(p => ({ ...p, bars: p.bars.filter(b => b.id !== t.id) })); toast.success('تم حذف الشريط'); }
    if (t.kind === 'modal') { commit(p => ({ ...p, modals: p.modals.filter(m => m.id !== t.id) })); if (editingModalId === t.id) setEditingModalId(null); toast.success('تم حذف النافذة'); }
    if (t.kind === 'node' && selection.ownerId) deleteNode(t.id, selection.ownerKind || 'page', selection.ownerId);
    setDeleteTarget(null);
  };

  // عدد مكونات الصفحة للوحة الحالة
  const pageNodeCount = page ? countNodes(page.nodes) : 0;

  return {
    project, commit, replace, undo, redo, canUndo, canRedo, dirty, lastSaved, doSave, onExit,
    subscribers, runtimeData, mode,
    selection, setSelection, pageId, setPageId, page, editingModalId, setEditingModalId, editingModal,
    goToPage, selectPage, selectModal, backToPage,
    device, setDevice, zoom, setZoom, autoFit, setAutoFit, showGrid, setShowGrid, showRuler, setShowRuler,
    drawer, setDrawer, dropdown, setDropdown, mobilePanel, setMobilePanel, treeOpen, setTreeOpen,
    showActionEditor, setShowActionEditor, showAppSettings, setShowAppSettings, showPreview, setShowPreview,
    showPublish, setShowPublish, showSitemap, setShowSitemap, showModalLibrary, setShowModalLibrary,
    showExitConfirm, setShowExitConfirm, requestExit,
    componentSearch, setComponentSearch, componentCat, setComponentCat, favorites, setFavorites,
    nodeTemplates, setNodeTemplates, addComponent, saveSelectionAsTemplate,
    currentOwner, mutateNodes, nodeListOf, duplicateSelectedNode, deleteNode, moveSelectedNode,
    newPage, setNewPage, openCreatePage, openEditPage, openCreateSubPage, submitPage, deletePage, duplicatePage,
    newBar, setNewBar, openCreateBar, submitBar, duplicateBar,
    newModal, setNewModal, openCreateModal, submitModal,
    deleteTarget, setDeleteTarget, confirmDelete,
    stats, checks, hasErrors, doPublish, bumpVersion, exportJson, importJson, pageNodeCount,
  };
}

