// ═══════════════════════════════════════════════════════════════
// ألواح الاستوديو — Layout متجاوب بالكامل (هاتف ← تابلت ← الحاسوب)
// كل الأوامر الأصلية محفوظة: شريط أدوات، شجرة، لوحة، خصائص،
// شريط حالة، درج المكونات، درج البيانات، القوائم المنسدلة.
// على الجوال تتحول الألواح الجانبية إلى Bottom Sheets + شريط تبويبات.
// ═══════════════════════════════════════════════════════════════
import { useStudio } from '@/components/app-builder/studio-engine';
import { AppNode, AppProject, Selection } from '@/types/app-builder';
import { COMPONENT_LIBRARY, COMPONENTS_BY_TYPE, CATEGORY_LABELS, MODAL_KIND_LABELS, BAR_KIND_LABELS } from '@/data/app-builder-defaults';
import { AppRuntime, DynIcon } from '@/components/app-builder/AppRuntime';
import { cloneNode, countReferences, duplicateNode, findNode, moveNode, nodePath } from '@/lib/app-builder';
import {
  ChipTabs, FloatingPill, IconBtn, MenuRow, ScrollRow, Sheet, ToolBtn, ToggleRow, useElementSize,
} from '@/components/app-builder/builder-ui';
import { PropertiesPanel } from '@/components/app-builder/PropertiesPanel';
import { ActionEditor } from '@/components/app-builder/ActionEditor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import {
  Save, Undo2, Redo2, FileText, Link2, MessageSquare, Blocks, Palette, Database, Settings,
  Smartphone, Tablet, Monitor, Eye, Rocket, ChevronDown, ChevronLeft, Plus, Trash2, Copy, Search,
  EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Package, Upload, Download, Map, Grid3x3, Ruler,
  Layers, MoreVertical, Menu, Maximize2, MoveHorizontal, Sparkles, X, Check,
} from 'lucide-react';

export const DEVICES = [
  { w: 375, label: 'جوال', icon: Smartphone },
  { w: 768, label: 'تابلت', icon: Tablet },
  { w: 1280, label: 'ديسكتوب', icon: Monitor },
  { w: 0, label: 'تلقائي', icon: Maximize2 },
] as const;

// ═══════════════════════ [1] الشريط العلوي ═══════════════════════
export function StudioTopBar() {
  const st = useStudio();
  const { mode } = st;
  const selectDesign = useDesignSelector();
  const anchors = useRef<Record<string, HTMLDivElement | null>>({});
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  if (!mode.isWide) return null;

  const toggleDd = (key: 'pages' | 'bars' | 'modals' | 'templates') => {
    const next = st.dropdown === key ? null : key;
    st.setDropdown(next);
    if (next) {
      const r = anchors.current[next]?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
    } else setPos(null);
  };

  const dd = (key: 'pages' | 'bars' | 'modals' | 'templates', icon: React.ReactNode, label: string) => (
    <div ref={el => { anchors.current[key] = el; }} className="relative flex-shrink-0">
      <ToolBtn icon={icon} title={label} onClick={() => toggleDd(key)}>
        {label}
        <ChevronDown size={11} className={st.dropdown === key ? 'rotate-180' : ''} />
      </ToolBtn>
    </div>
  );

  return (
    <>
      <div className="min-h-14 bg-white border-b border-slate-200 flex items-center gap-1.5 px-3 flex-shrink-0 overflow-x-auto no-scrollbar">
        <ToolBtn icon={<Save size={13} />} tone="primary" onClick={st.doSave} title="حفظ (Ctrl+S)">
          حفظ
          {st.dirty && <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white" />}
        </ToolBtn>
        <IconBtn label="تراجع (Ctrl+Z)" onClick={st.undo} disabled={!st.canUndo} variant="outline"><Undo2 size={14} /></IconBtn>
        <IconBtn label="إعادة" onClick={st.redo} disabled={!st.canRedo} variant="outline"><Redo2 size={14} /></IconBtn>
        <span className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />

        {dd('pages', <FileText size={13} />, 'الصفحات')}
        {dd('bars', <Link2 size={13} />, 'الأشرطة')}
        {dd('modals', <MessageSquare size={13} />, 'النوافذ')}
        <ToolBtn icon={<Blocks size={13} />} tone="indigo" title="مكتبة المكونات"
          onClick={() => st.setDrawer(d => (d === 'components' ? null : 'components'))}>إضافة مكون</ToolBtn>
        <span className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />

        <ToolBtn icon={<Palette size={13} />} title="التصميم العام" onClick={selectDesign}>التصميم</ToolBtn>
        <ToolBtn icon={<Database size={13} />} title="البيانات والمتغيرات" onClick={() => st.setDrawer(d => (d === 'data' ? null : 'data'))}>البيانات</ToolBtn>
        {dd('templates', <Package size={13} />, 'القوالب')}
        <ToolBtn icon={<Settings size={13} />} title="إعدادات التطبيق" onClick={() => st.setShowAppSettings(true)}>إعدادات التطبيق</ToolBtn>

        <div className="flex-1" />

        <DeviceSwitcher />
        <ToolBtn icon={<Eye size={13} />} tone="success" title="معاينة (Ctrl+P)" onClick={() => st.setShowPreview(true)}>معاينة</ToolBtn>
        <ToolBtn icon={<Rocket size={13} />} tone="violet" title="نشر التطبيق" onClick={() => st.setShowPublish(true)}>نشر</ToolBtn>
        <ToolBtn icon={<ChevronLeft size={13} className="rotate-180" />} title="خروج من الاستوديو" onClick={st.requestExit} className="!bg-white">خروج</ToolBtn>
      </div>

      {/* القوائم المنسدلة: طبقة عائمة خارج حدود الشريط حتى لا تُقصَّ أي أداة */}
      {st.dropdown && pos && (
        <>
          <div className="fixed inset-0 z-[134]" onClick={() => { st.setDropdown(null); setPos(null); }} />
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed z-[135] w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3"
            style={{ top: pos.top, right: pos.right }}>
            {st.dropdown === 'pages' && <PagesList />}
            {st.dropdown === 'bars' && <BarsList />}
            {st.dropdown === 'modals' && <ModalsList />}
            {st.dropdown === 'templates' && <div className="p-1"><TemplatesList /></div>}
          </motion.div>
        </>
      )}
    </>
  );
}

/** تحديد التصميم العام وفتح لوحة الخصائص مباشرة على الجوال */
function useDesignSelector() {
  const st = useStudio();
  return useCallback(() => {
    st.setSelection({ kind: 'design', id: 'design' });
    st.setDrawer(null);
    st.setDropdown(null);
    if (st.mode.isCompact) st.setMobilePanel('props');
  }, [st]);
}

function DeviceSwitcher() {
  const st = useStudio();
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5 flex-shrink-0">
      {DEVICES.map(d => (
        <button key={d.w} onClick={() => st.setDevice(d.w)} title={`${d.label}${d.w ? ` ${d.w}px` : ' — بعرض الشاشة'}`}
          className={`h-7 px-2 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${st.device === d.w ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
          <d.icon size={12} />{d.w || 'AUTO'}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════ [1-ب] الشريط المضغوط (جوال/تابلت) ═══════════════════════
export function StudioCompactBar() {
  const st = useStudio();
  const { project, page, editingModal, mode } = st;
  const selectDesign = useDesignSelector();
  if (mode.isWide) return null;   // شريط الحاسوب يتكفّل بالأوامر هناك
  return (
    <>
      <div className="lg:hidden min-h-14 bg-white border-b border-slate-200 flex items-center gap-1.5 px-2 pt-[env(safe-area-inset-top,0px)] flex-shrink-0">
        <IconBtn label="كل الأدوات" onClick={() => st.setMobilePanel('tools')} variant="outline"><Menu size={17} /></IconBtn>

        <button onClick={() => st.setMobilePanel('tree')} className="flex-1 min-w-0 text-right px-1 py-1 rounded-xl active:bg-slate-100">
          <p className="text-[12px] font-black text-slate-800 truncate leading-tight">{project.name}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <Layers size={10} className="flex-shrink-0" />
            {editingModal ? `تحرير نافذة: ${editingModal.name}` : `صفحة: ${page?.name || '—'}`}
            <ChevronDown size={10} className="rotate-180" />
          </p>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <IconBtn label="تراجع" onClick={st.undo} disabled={!st.canUndo} variant="outline"><Undo2 size={16} /></IconBtn>
          <IconBtn label="إعادة" onClick={st.redo} disabled={!st.canRedo} variant="outline"><Redo2 size={16} /></IconBtn>
          <button onClick={st.doSave} title="حفظ"
            className="relative h-10 px-3 rounded-xl bg-blue-600 text-white text-[12px] font-black inline-flex items-center gap-1.5 flex-shrink-0">
            <Save size={15} /> حفظ
            {st.dirty && <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-orange-500 ring-2 ring-white" />}
          </button>
        </div>
      </div>

      {/* شريط أدوات سريعة — قابل للتمرير أفقيًا حتى لا يخرج أي زر خارج الشاشة */}
      <div className="lg:hidden bg-white/90 backdrop-blur border-b border-slate-200 flex-shrink-0">
        <ScrollRow className="px-2 py-1.5">
          <ToolBtn icon={<Blocks size={13} />} tone="indigo" compactLabel="" onClick={() => st.setDrawer(d => (d === 'components' ? null : 'components'))}>
            إضافة مكون
          </ToolBtn>
          <ToolBtn icon={<Palette size={13} />} onClick={selectDesign}>التصميم</ToolBtn>
          <ToolBtn icon={<FileText size={13} />} onClick={() => st.setDropdown(d => (d === 'pages' ? null : 'pages'))}>الصفحات</ToolBtn>
          <ToolBtn icon={<Link2 size={13} />} onClick={() => st.setDropdown(d => (d === 'bars' ? null : 'bars'))}>الأشرطة</ToolBtn>
          <ToolBtn icon={<MessageSquare size={13} />} onClick={() => st.setDropdown(d => (d === 'modals' ? null : 'modals'))}>النوافذ</ToolBtn>
          <ToolBtn icon={<Database size={13} />} onClick={() => st.setDrawer(d => (d === 'data' ? null : 'data'))}>البيانات</ToolBtn>
          <ToolBtn icon={<Package size={13} />} onClick={() => st.setDropdown(d => (d === 'templates' ? null : 'templates'))}>القوالب</ToolBtn>
          <ToolBtn icon={<Settings size={13} />} onClick={() => st.setShowAppSettings(true)}>إعدادات</ToolBtn>
          <ToolBtn icon={<Eye size={13} />} tone="success" onClick={() => st.setShowPreview(true)}>معاينة</ToolBtn>
          <ToolBtn icon={<Rocket size={13} />} tone="violet" onClick={() => st.setShowPublish(true)}>نشر</ToolBtn>
        </ScrollRow>
      </div>
    </>
  );
}

/** تحديد عنصر وفتح لوحة خصائصه — يمنع الوصول لحدث الصف حتى لا يُغلق الشيت */
function useOpenProperties() {
  const st = useStudio();
  return useCallback((e: React.MouseEvent, sel: Selection) => {
    e.stopPropagation();
    st.setSelection(sel);
    if (st.mode.isCompact) st.setMobilePanel('props');
  }, [st]);
}

/** غلاف لأزرار الصفوف: يمنع الحدث من الوصول لنقرة الصف نفسها */
function stop(fn: () => void) {
  return (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
}

// ═══════════════════════ [2] الشجرة ═══════════════════════
export function TreePanel() {
  const st = useStudio();
  const openProps = useOpenProperties();
  const { project, pageId, editingModalId, selection } = st;
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
        <Layers size={15} className="text-slate-500 flex-shrink-0" />
        <p className="text-[12px] font-black text-slate-700 truncate flex-1">🏠 {project.name}</p>
        <IconBtn label="صفحة جديدة" onClick={() => st.openCreatePage()}><Plus size={15} /></IconBtn>
      </div>
      <div className="p-1.5 flex-1 min-h-0 overflow-y-auto overscroll-contain pane-scroll thin-scroll">
        <TreeGroup id="pages" icon={<FileText size={13} className="text-blue-500" />} label="الصفحات" count={project.pages.length}
          addLabel="صفحة جديدة" onAdd={() => st.openCreatePage()}>
          {project.pages.map(pg => (
            <div key={pg.id}>
              <div className={`group flex items-center gap-1 px-2 py-2 lg:py-1 rounded-xl cursor-pointer min-h-11 lg:min-h-0
                ${pageId === pg.id && !editingModalId ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                onClick={() => st.selectPage(pg.id)}>
                <FileText size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-[12px] lg:text-[11px] text-slate-700 truncate flex-1 min-w-0">{pg.name}</span>
                {pg.isHome && <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1 py-0 flex-shrink-0">رئيسية</Badge>}
                {pg.parentId && <Badge variant="outline" className="text-[9px] px-1 py-0 flex-shrink-0">فرعية</Badge>}
                <IconBtn label="خصائص الصفحة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7 text-blue-600"
                  onClick={e => openProps(e, { kind: 'page', id: pg.id })}><Settings size={13} /></IconBtn>
                <IconBtn label="إنشاء صفحة فرعية" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.openCreateSubPage(pg.id)}><Plus size={13} /></IconBtn>
                <IconBtn label="نسخ الصفحة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.duplicatePage(pg.id)}><Copy size={12} /></IconBtn>
                <IconBtn label="حذف الصفحة" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.setDeleteTarget({ kind: 'page', id: pg.id })}><Trash2 size={12} /></IconBtn>
              </div>
              {pageId === pg.id && pg.nodes.map(n => <NodeRow key={n.id} node={n} ownerKind="page" ownerId={pg.id} depth={1} />)}
            </div>
          ))}
        </TreeGroup>

        <TreeGroup id="bars" icon={<Link2 size={13} className="text-emerald-500" />} label="الأشرطة" count={project.bars.length}
          addLabel="إضافة شريط" onAdd={st.openCreateBar}>
          {project.bars.map(b => (
            <div key={b.id}>
              <div className={`group flex items-center gap-1 px-2 py-2 lg:py-1 rounded-xl cursor-pointer min-h-11 lg:min-h-0
                ${selection.kind === 'bar' && selection.id === b.id ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-slate-50'}`}
                onClick={() => { st.setSelection({ kind: 'bar', id: b.id }); if (st.mode.isCompact) st.setMobilePanel('props'); }}>
                <Link2 size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-[12px] lg:text-[11px] text-slate-700 truncate flex-1 min-w-0">{b.name}</span>
                <span className="text-[9px] text-slate-400 flex-shrink-0">{BAR_KIND_LABELS[b.kind]}</span>
                <IconBtn label={b.enabled ? 'إخفاء الشريط' : 'إظهار الشريط'} className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.commit(p => ({ ...p, bars: p.bars.map(x => (x.id === b.id ? { ...x, enabled: !x.enabled } : x)) }))}>
                  {b.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                </IconBtn>
                <IconBtn label="حذف الشريط" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.setDeleteTarget({ kind: 'bar', id: b.id })}><Trash2 size={12} /></IconBtn>
              </div>
              {selection.kind === 'bar' && selection.id === b.id && b.nodes.map(n => <NodeRow key={n.id} node={n} ownerKind="bar" ownerId={b.id} depth={1} />)}
            </div>
          ))}
        </TreeGroup>

        <TreeGroup id="modals" icon={<MessageSquare size={13} className="text-violet-500" />} label="النوافذ المنبثقة" count={project.modals.length}
          addLabel="نافذة جديدة" onAdd={st.openCreateModal}>
          {project.modals.map(m => (
            <div key={m.id}>
              <div className={`group flex items-center gap-1 px-2 py-2 lg:py-1 rounded-xl cursor-pointer min-h-11 lg:min-h-0
                ${editingModalId === m.id ? 'bg-violet-50 ring-1 ring-violet-200' : 'hover:bg-slate-50'}`}
                onClick={() => { st.selectModal(m.id); if (st.mode.isCompact) st.setMobilePanel('props'); }}>
                <MessageSquare size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-[12px] lg:text-[11px] text-slate-700 truncate flex-1 min-w-0">{m.name}</span>
                <span className={`text-[9px] flex-shrink-0 ${countReferences(project, 'openModal', m.id) ? 'text-slate-400' : 'text-amber-600 font-bold'}`}>
                  {countReferences(project, 'openModal', m.id) || 'غير مستخدمة'}
                </span>
                <IconBtn label="حذف النافذة" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-7 lg:!w-7"
                  onClick={() => st.setDeleteTarget({ kind: 'modal', id: m.id })}><Trash2 size={12} /></IconBtn>
              </div>
              {editingModalId === m.id && m.nodes.map(n => <NodeRow key={n.id} node={n} ownerKind="modal" ownerId={m.id} depth={1} />)}
            </div>
          ))}
        </TreeGroup>

        <button onClick={designClickFor(st)}
          className={`w-full flex items-center gap-2 px-2.5 py-3 lg:py-2 rounded-xl text-[12px] lg:text-[11px] font-black min-h-11 lg:min-h-0
            ${st.selection.kind === 'design' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Palette size={13} /> التصميم العام
        </button>
      </div>
    </div>
  );
}

/** يبسّط فتح لوحة الخصائص على الجوال عند اختيار «التصميم العام» */
function designClickFor(st: ReturnType<typeof useStudio>) {
  return () => {
    st.setSelection({ kind: 'design', id: 'design' });
    if (st.mode.isCompact) st.setMobilePanel('props');
  };
}

function TreeGroup({ id, icon, label, count, children, addLabel, onAdd }: {
  id: string; icon: React.ReactNode; label: string; count: number; children: React.ReactNode; addLabel: string; onAdd: () => void;
}) {
  const st = useStudio();
  const open = st.treeOpen[id];
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <button onClick={() => st.setTreeOpen(o => ({ ...o, [id]: !o[id] }))} className="tap h-8 w-8 inline-flex items-center justify-center text-slate-400 rounded-lg hover:bg-slate-100" aria-label={open ? 'طي' : 'توسيع'}>
          <ChevronDown size={14} className={open ? '' : '-rotate-90'} />
        </button>
        {icon}
        <span className="text-[11px] lg:text-[11px] font-black text-slate-700 flex-1">{label} ({count})</span>
        <IconBtn label={addLabel} onClick={onAdd} className="!h-8 !w-8 text-blue-600 hover:!bg-blue-50"><Plus size={14} /></IconBtn>
      </div>
      {open && <div className="pr-2">{count === 0 ? <p className="text-[10px] text-slate-400 px-3 py-1">لا يوجد</p> : children}</div>}
    </div>
  );
}

/** صف مكوّن في الشجرة — كل إجراءات الزر الأصلي موجودة، وتُعرض كقائمة داخل الصف على الجوال */
export function NodeRow({ node, ownerKind, ownerId, depth }: { node: AppNode; ownerKind: 'page' | 'bar' | 'modal'; ownerId: string; depth: number }) {
  const st = useStudio();
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  const selected = st.selection.kind === 'node' && st.selection.id === node.id;
  const upd = (fn: (n: AppNode) => AppNode) => st.mutateNodes(ownerKind, ownerId, ns => ns.map(function u(n): AppNode {
    return n.id === node.id ? fn(n) : { ...n, children: n.children.map(u) };
  }));

  const actions: { icon: React.ReactNode; label: string; run: () => void; danger?: boolean }[] = [
    { icon: node.hidden ? <Eye size={14} /> : <EyeOff size={14} />, label: node.hidden ? 'إظهار المكوّن' : 'إخفاء المكوّن', run: () => upd(n => ({ ...n, hidden: !n.hidden })) },
    { icon: node.locked ? <Unlock size={14} /> : <Lock size={14} />, label: node.locked ? 'فك القفل' : 'قفل المكوّن', run: () => upd(n => ({ ...n, locked: !n.locked })) },
    { icon: <Copy size={14} />, label: 'نسخ المكوّن', run: () => st.mutateNodes(ownerKind, ownerId, ns => duplicateNode(ns, node.id)) },
    { icon: <ArrowUp size={14} />, label: 'تحريك لأعلى', run: () => st.mutateNodes(ownerKind, ownerId, ns => moveNode(ns, node.id, -1)) },
    { icon: <ArrowDown size={14} />, label: 'تحريك لأسفل', run: () => st.mutateNodes(ownerKind, ownerId, ns => moveNode(ns, node.id, 1)) },
    { icon: <Sparkles size={14} />, label: 'حفظ كقالب', run: () => { st.setSelection({ kind: 'node', id: node.id, ownerKind, ownerId }); st.saveSelectionAsTemplate(); } },
    { icon: <Trash2 size={14} />, label: 'حذف المكوّن', run: () => st.deleteNode(node.id, ownerKind, ownerId), danger: true },
  ];

  return (
    <div>
      <div className={`group flex items-center gap-1 py-2 lg:py-1 px-1 rounded-xl cursor-pointer min-h-11 lg:min-h-0
        ${selected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
        style={{ paddingInlineEnd: 6 + depth * 12 }}
        onClick={() => { st.setSelection({ kind: 'node', id: node.id, ownerKind, ownerId }); if (st.mode.isCompact) st.setMobilePanel('props'); }}>
        {node.children.length > 0
          ? <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="tap h-6 w-6 inline-flex items-center justify-center text-slate-400"><ChevronDown size={13} className={open ? '' : '-rotate-90'} /></button>
          : <span className="w-[13px] flex-shrink-0" />}
        <NodeIcon type={node.type} />
        <span className={`text-[12px] lg:text-[11px] truncate flex-1 min-w-0 ${node.hidden ? 'line-through text-slate-400' : 'text-slate-700'}`}>{node.name}</span>

        {/* الحاسوب: أزرار مصغّرة تظهر عند التحويم */}
        <div className="hidden lg:flex items-center gap-0.5">
          {actions.map((a, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); a.run(); }} title={a.label} aria-label={a.label}
              className={`hover-reveal opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:bg-white ${a.danger ? 'hover:text-red-500' : 'hover:text-slate-700'}`}>
              {a.icon}
            </button>
          ))}
        </div>

        {/* الجوال: قائمة إجراءات موسّعة داخل الصف */}
        <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }} aria-label="إجراءات المكوّن"
          className="tap h-8 w-8 lg:hidden inline-flex items-center justify-center rounded-lg text-slate-400 bg-slate-100 flex-shrink-0">
          <MoreVertical size={15} className={menu ? 'rotate-90' : ''} />
        </button>
      </div>

      {menu && (
        <div className="lg:hidden flex flex-wrap gap-1 pb-2 mb-1" style={{ paddingInlineStart: 22 + depth * 12 }}>
          {actions.map((a, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setMenu(false); a.run(); }}
              className={`inline-flex items-center gap-1 h-9 px-2.5 rounded-xl text-[11px] font-bold border
                ${a.danger ? 'text-red-600 border-red-200 bg-red-50' : 'text-slate-600 border-slate-200 bg-white'}`}>
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      )}

      {open && node.children.map(c => <NodeRow key={c.id} node={c} ownerKind={ownerKind} ownerId={ownerId} depth={depth + 1} />)}
    </div>
  );
}

function NodeIcon({ type }: { type: string }) {
  const def = COMPONENTS_BY_TYPE[type];
  return <DynIcon name={def?.icon || 'Square'} size={12} className="text-slate-400 flex-shrink-0" />;
}

// ═══════════════════════ [3] اللوحة (Canvas) ═══════════════════════
export function CanvasPane() {
  const st = useStudio();
  const { mode, page, editingModal, device, zoom, autoFit, showGrid, showRuler, selection, runtimeData, project } = st;
  const { ref: boxRef, size: box } = useElementSize<HTMLDivElement>();
  const { ref: innerRef, size: inner } = useElementSize<HTMLDivElement>();
  const [dropping, setDropping] = useState(false);

  const padPx = mode.isWide ? 48 : mode.isCompact ? 16 : 24;
  const availW = Math.max(240, (box.w || mode.vw) - padPx);
  const deviceW = device === 0 ? Math.round(availW) : device;
  const scale = autoFit ? Math.min(1, availW / deviceW) : zoom / 100;

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-slate-200/60">
      {/* شريط اللوحة */}
      <div className="min-h-11 bg-white/85 backdrop-blur border-b border-slate-200 flex items-center gap-1.5 px-2 lg:px-3 flex-shrink-0 overflow-x-auto no-scrollbar">
        {editingModal ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 flex-shrink-0">
            <span className="text-[11px] font-black text-amber-800 truncate">تحرير النافذة: {editingModal.name}</span>
            <button onClick={st.backToPage} className="text-[11px] font-bold text-amber-700 underline whitespace-nowrap">← رجوع للصفحة</button>
          </div>
        ) : (
          <>
            <IconBtn label="الصفحة السابقة" onClick={() => st.goToPage(-1)} variant="outline" className="!h-8 !w-8 flex-shrink-0"><ChevronRightSmall dir="prev" /></IconBtn>
            <div className="flex-shrink-0 min-w-0 max-w-[52vw]">
              <p className="text-[11px] font-bold text-slate-500 truncate">تعرض: <b className="text-slate-800">{page?.name}</b></p>
            </div>
            <IconBtn label="الصفحة التالية" onClick={() => st.goToPage(1)} variant="outline" className="!h-8 !w-8 flex-shrink-0"><ChevronRightSmall dir="next" /></IconBtn>
          </>
        )}
        <div className="flex-1" />
        {selection.kind === 'node' && (
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-xl px-1.5 py-1 flex-shrink-0">
            <IconBtn label="تحريك لأعلى" onClick={() => st.moveSelectedNode(-1)} className="!h-9 !w-9 lg:!h-7 lg:!w-7 !bg-transparent !text-blue-700 hover:!bg-white"><ArrowUp size={15} /></IconBtn>
            <IconBtn label="تحريك لأسفل" onClick={() => st.moveSelectedNode(1)} className="!h-9 !w-9 lg:!h-7 lg:!w-7 !bg-transparent !text-blue-700 hover:!bg-white"><ArrowDown size={15} /></IconBtn>
            <IconBtn label="نسخ المكوّن" onClick={st.duplicateSelectedNode} className="!h-9 !w-9 lg:!h-7 lg:!w-7 !bg-transparent !text-blue-700 hover:!bg-white"><Copy size={15} /></IconBtn>
            <IconBtn label="حذف المكوّن" onClick={() => selection.id && st.setDeleteTarget({ kind: 'node', id: selection.id })} className="!h-9 !w-9 lg:!h-7 lg:!w-7 !bg-transparent !text-red-600 hover:!bg-white"><Trash2 size={15} /></IconBtn>
          </div>
        )}
      </div>

      {/* اللوحة نفسها — تتقلص تلقائيًا لتناسب عرض الشاشة */}
      <div ref={boxRef} className="flex-1 min-h-0 overflow-auto pane-scroll" onClick={() => st.setSelection({ kind: null, id: null })}
        onDragOver={e => { e.preventDefault(); setDropping(true); }}
        onDragLeave={() => setDropping(false)}
        onDrop={e => {
          e.preventDefault(); setDropping(false);
          const type = e.dataTransfer.getData('text/component');
          if (type) st.addComponent(type);
        }}>
        <div className="min-h-full w-full flex justify-center items-start" style={{ padding: padPx / 2 }}>
          <div className="relative" onClick={e => e.stopPropagation()}
            style={{ width: Math.max(1, Math.round(deviceW * scale)), height: inner.h ? Math.max(1, Math.round(inner.h * scale)) : undefined }}>
            <div ref={innerRef} className="absolute top-0 left-0 origin-top-left" style={{ width: deviceW, transform: `scale(${scale})` }}>
              {showRuler && (
                <div className="absolute -top-5 inset-x-0 h-4 bg-white/85 border border-slate-200 rounded text-[9px] flex items-center justify-between px-1 text-slate-400">
                  <span>0</span><span>{deviceW}px{scale !== 1 ? ` · عرض فعلي ${Math.round(deviceW * scale)}px` : ''}</span>
                </div>
              )}
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-300"
                style={{
                  minHeight: 520,
                  backgroundImage: showGrid ? 'linear-gradient(#0000000a 1px,transparent 1px),linear-gradient(90deg,#0000000a 1px,transparent 1px)' : undefined,
                  backgroundSize: showGrid ? '16px 16px' : undefined,
                }}>
                {page || editingModal ? (
                  <AppRuntimeEditable deviceW={deviceW} />
                ) : (
                  <div className="p-8 lg:p-14 text-center text-slate-400">
                    <p className="text-sm font-bold mb-2">لا توجد صفحات</p>
                    <button onClick={() => st.openCreatePage()} className="h-9 px-3 rounded-xl bg-blue-600 text-white text-xs font-black">إنشاء صفحة جديدة</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ChevronRightSmall({ dir }: { dir: 'prev' | 'next' }) {
  return <ChevronLeft size={15} className={dir === 'prev' ? 'rotate-180' : ''} />;
}

/** يربط المحرّك بلوحة اللوحة: تحديد بالنقر + دعم الأشرطة والنوافذ */
function AppRuntimeEditable({ deviceW }: { deviceW: number }) {
  const st = useStudio();
  const { project, page, editingModal, selection, runtimeData, editingModalId } = st;
  return (
    <AppRuntime
      project={project}
      data={runtimeData}
      device={deviceW}
      editable
      selectedId={selection.kind === 'node' ? selection.id : null}
      onSelectNode={(id: string) => {
        if (id.startsWith('bar:')) { st.setSelection({ kind: 'bar', id: id.slice(4) }); if (st.mode.isCompact) st.setMobilePanel('props'); return; }
        const ownerKind = editingModal ? 'modal' : 'page';
        const ownerId = editingModal ? editingModal.id : page.id;
        const inBar = project.bars.find(b => findNode(b.nodes, id));
        if (inBar) { st.setSelection({ kind: 'node', id, ownerKind: 'bar', ownerId: inBar.id }); if (st.mode.isCompact) st.setMobilePanel('props'); return; }
        st.setSelection({ kind: 'node', id, ownerKind, ownerId });
        if (st.mode.isCompact) st.setMobilePanel('props');
      }}
      currentPageId={page?.id}
      onPageChange={st.setPageId}
      previewModalId={editingModalId}
    />
  );
}

// ═══════════════════════ [4] لوحة الخصائص ═══════════════════════
export function PropsPane({ embedded }: { embedded?: boolean }) {
  const st = useStudio();
  return (
    <PropertiesPanel
      project={st.project}
      selection={st.selection}
      onProjectChange={st.commit}
      onOpenActionEditor={() => st.setShowActionEditor(true)}
      onDuplicate={st.duplicateSelectedNode}
      onDelete={() => st.selection.id && st.setDeleteTarget({ kind: 'node', id: st.selection.id })}
      onSaveAsTemplate={st.saveSelectionAsTemplate}
      embedded={embedded}
    />
  );
}

// ═══════════════════════ [5] شريط الحالة ═══════════════════════
export function StatusStrip() {
  const st = useStudio();
  const { project, selection, stats, dirty, lastSaved, zoom, autoFit } = st;
  // مسار العنصر المحدد — يُحسب مباشرة (لحظي ورخيص ولا يحتاج تخزينًا)
  const path = (() => {
    if (selection.kind !== 'node' || !selection.id) return null;
    const list = st.nodeListOf(selection.ownerKind, selection.ownerId);
    const p = list ? nodePath(list, selection.id) : null;
    return p ? p.map(n => n.name).join(' › ') : null;
  })();

  return (
    <div className="bg-white border-t border-slate-200 flex-shrink-0">
      <div className="min-h-9 flex items-center gap-2 px-2 lg:px-3 text-[11px] lg:text-[10px] text-slate-500 overflow-x-auto no-scrollbar">
        <Stat icon={<FileText size={11} />} text={`${stats.pages} صفحات`} />
        <Stat icon={<Blocks size={11} />} text={`${st.pageNodeCount ?? 0} مكون في الصفحة`} />
        <Stat icon={<Link2 size={11} />} text={`${stats.bars} شريط`} />
        <Stat icon={<MessageSquare size={11} />} text={`${stats.modals} نافذة`} />
        {path && <span className="truncate flex-shrink-0 max-w-[46vw] lg:max-w-none">📍 {path}</span>}
        <div className="flex-1" />
        <span className={`font-bold whitespace-nowrap ${dirty ? 'text-orange-600' : 'text-emerald-600'}`}>{dirty ? '● تغييرات غير محفوظة' : '✓ محفوظ'}</span>
        {lastSaved && <span className="whitespace-nowrap">آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}</span>}
        <span className="w-px h-4 bg-slate-200 flex-shrink-0" />
        <button onClick={() => { st.setAutoFit(false); st.setZoom((z: number) => Math.max(40, z - 10)); }} className="tap h-8 w-8 px-1 hover:bg-slate-100 rounded-lg flex-shrink-0" aria-label="تصغير">−</button>
        <span className="tabular-nums whitespace-nowrap">{autoFit ? 'ملاءمة' : `${zoom}%`}</span>
        <button onClick={() => { st.setAutoFit(false); st.setZoom((z: number) => Math.min(200, z + 10)); }} className="tap h-8 w-8 px-1 hover:bg-slate-100 rounded-lg flex-shrink-0" aria-label="تكبير">+</button>
        <button onClick={() => { st.setZoom(100); st.setAutoFit(true); }} className="tap h-8 px-2 hover:bg-slate-100 rounded-lg whitespace-nowrap flex-shrink-0">ملاءمة</button>
        <IconBtn label="الشبكة" active={st.showGrid} onClick={() => st.setShowGrid((g: boolean) => !g)} className={`!h-8 !w-8 ${st.showGrid ? '!bg-blue-100 !text-blue-700' : ''}`}><Grid3x3 size={13} /></IconBtn>
        <IconBtn label="المسطرة" active={st.showRuler} onClick={() => st.setShowRuler((r: boolean) => !r)} className={`!h-8 !w-8 ${st.showRuler ? '!bg-blue-100 !text-blue-700' : ''}`}><Ruler size={13} /></IconBtn>
      </div>
    </div>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="flex items-center gap-1 whitespace-nowrap flex-shrink-0">{icon} {text}</span>;
}

// ═══════════════════════ [6] شريط التبويبات السفلي ═══════════════════════
export function MobileTabs() {
  const st = useStudio();
  const active = st.mobilePanel;
  if (st.mode.isWide) return null;
  const tabs: { id: 'tree' | 'props' | 'tools'; icon: React.ReactNode; label: string; badge?: React.ReactNode }[] = [
    { id: 'tree', icon: <Layers size={18} />, label: 'البنية' },
    { id: 'props', icon: <Settings size={18} />, label: 'الخصائص', badge: st.selection.kind ? <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" /> : null },
    { id: 'tools', icon: <Menu size={18} />, label: 'أدوات' },
  ];
  return (
    <div className="lg:hidden bg-white border-t border-slate-200 flex-shrink-0 pb-[env(safe-area-inset-bottom,0px)] relative z-[120]" data-testid="builder-mobile-tabs">
      <div className="h-14 flex items-stretch">
        <TabBtn active={active === 'tree'} {...tabs[0]} onClick={() => st.setMobilePanel(p => (p === 'tree' ? null : 'tree'))} />
        <TabBtn active={active === null} onClick={() => st.setMobilePanel(null)}
          icon={<MoveHorizontal size={18} />} label="اللوحة" />
        <button onClick={() => st.setDrawer(d => (d === 'components' ? null : 'components'))}
          className="relative -mt-5 mx-1 w-14 flex-shrink-0 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex flex-col items-center justify-center gap-0.5">
          <Blocks size={20} />
          <span className="text-[9px] font-black leading-none">إضافة</span>
        </button>
        <TabBtn active={active === 'props'} {...tabs[1]} onClick={() => st.setMobilePanel(p => (p === 'props' ? null : 'props'))} />
        <TabBtn active={active === 'tools'} {...tabs[2]} onClick={() => st.setMobilePanel(p => (p === 'tools' ? null : 'tools'))} />
      </div>
    </div>
  );
}

function TabBtn({ active, icon, label, onClick, badge }: { active?: boolean; icon: React.ReactNode; label: string; onClick: () => void; badge?: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 transition-colors ${active ? 'text-blue-700' : 'text-slate-400'}`}>
      {active && <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-blue-600" />}
      {icon}
      <span className="text-[9px] font-black leading-none">{label}</span>
      {badge}
    </button>
  );
}

// ═══════════════════════ [7] قوائم البنية (تُستعمل في القوائم المنسدلة والـ Sheets) ═══════════════════════
export function PagesList() {
  const st = useStudio();
  const openProps = useOpenProperties();
  const [q, setQ] = useState('');
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-black text-slate-800">الصفحات ({st.project.pages.length})</p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-8 lg:h-6 text-[10px] gap-1" onClick={() => { st.setShowSitemap(true); st.setDropdown(null); st.setMobilePanel(null); }}><Map size={11} /> خريطة</Button>
          <Button size="sm" className="h-8 lg:h-6 text-[10px] gap-1 bg-blue-600" onClick={() => st.openCreatePage()}><Plus size={11} /> صفحة</Button>
        </div>
      </div>
      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن صفحة…" className="h-10 lg:h-7 text-[15px] lg:text-xs mb-2" />
      <div className="max-h-[52vh] lg:max-h-64 overflow-y-auto overscroll-contain pane-scroll space-y-1">
        {st.project.pages.filter(p => p.name.includes(q)).map(p => (
          <div key={p.id} className={`group flex items-center gap-1.5 px-2 py-2 lg:py-1.5 rounded-xl cursor-pointer min-h-11 lg:min-h-0
            ${st.pageId === p.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            onClick={() => st.selectPage(p.id)}>
            <FileText size={13} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] lg:text-xs text-slate-700 flex-1 truncate min-w-0">{p.name}</span>
            {p.isHome && <Badge className="bg-blue-100 text-blue-700 text-[9px] flex-shrink-0">رئيسية</Badge>}
            {p.parentId && <Badge variant="outline" className="text-[9px] flex-shrink-0">فرعية</Badge>}
            <IconBtn label="خصائص الصفحة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8 text-blue-600" onClick={e => openProps(e, { kind: 'page', id: p.id })}><Settings size={14} /></IconBtn>
            <IconBtn label="تعديل الصفحة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={() => st.openEditPage(p)}>✏️</IconBtn>
            <IconBtn label="نسخ الصفحة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={() => st.duplicatePage(p.id)}><Copy size={13} /></IconBtn>
            <IconBtn label="حذف الصفحة" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={() => st.setDeleteTarget({ kind: 'page', id: p.id })}><Trash2 size={13} /></IconBtn>
          </div>
        ))}
        {st.project.pages.filter(p => p.name.includes(q)).length === 0 && <p className="text-[11px] text-slate-400 py-3 text-center">لا نتائج مطابقة</p>}
      </div>
    </div>
  );
}

export function BarsList() {
  const st = useStudio();
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-black text-slate-800">الأشرطة ({st.project.bars.length})</p>
        <Button size="sm" className="h-8 lg:h-6 text-[10px] gap-1 bg-emerald-600" onClick={st.openCreateBar}><Plus size={11} /> إضافة شريط</Button>
      </div>
      <div className="max-h-[52vh] lg:max-h-64 overflow-y-auto overscroll-contain pane-scroll space-y-1">
        {st.project.bars.length === 0 && <p className="text-[11px] text-slate-400 py-3 text-center">لا توجد أشرطة</p>}
        {st.project.bars.map(b => (
          <div key={b.id} className={`group flex items-center gap-1.5 px-2 py-2 lg:py-1.5 rounded-xl cursor-pointer min-h-11 lg:min-h-0
            ${st.selection.kind === 'bar' && st.selection.id === b.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
            onClick={() => { st.setSelection({ kind: 'bar', id: b.id }); st.setDropdown(null); if (st.mode.isCompact) st.setMobilePanel('props'); }}>
            <Link2 size={13} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] lg:text-xs text-slate-700 flex-1 truncate min-w-0">{b.name}</span>
            <span className="text-[9px] text-slate-400 flex-shrink-0">{b.scope === 'all' ? 'كل الصفحات' : `${b.pages.length} صفحة`}</span>
            {b.enabled ? <Eye size={12} className="text-emerald-500 flex-shrink-0" /> : <EyeOff size={12} className="text-slate-300 flex-shrink-0" />}
            <IconBtn label="نسخ الشريط" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={() => st.duplicateBar(b.id)}><Copy size={13} /></IconBtn>
            <IconBtn label="حذف الشريط" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={() => st.setDeleteTarget({ kind: 'bar', id: b.id })}><Trash2 size={13} /></IconBtn>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModalsList() {
  const st = useStudio();
  const [q, setQ] = useState('');
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-black text-slate-800">النوافذ المنبثقة ({st.project.modals.length})</p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-8 lg:h-6 text-[10px]" onClick={() => { st.setShowModalLibrary(true); st.setDropdown(null); st.setMobilePanel(null); }}>📚 مكتبة</Button>
          <Button size="sm" className="h-8 lg:h-6 text-[10px] gap-1 bg-violet-600" onClick={st.openCreateModal}><Plus size={11} /> نافذة</Button>
        </div>
      </div>
      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن نافذة…" className="h-10 lg:h-7 text-[15px] lg:text-xs mb-2" />
      <div className="max-h-[52vh] lg:max-h-64 overflow-y-auto overscroll-contain pane-scroll space-y-1">
        {st.project.modals.filter(m => m.name.includes(q)).map(m => {
          const refs = countReferences(st.project, 'openModal', m.id);
          return (
            <div key={m.id} className={`group flex items-center gap-1.5 px-2 py-2 lg:py-1.5 rounded-xl cursor-pointer min-h-11 lg:min-h-0
              ${st.editingModalId === m.id ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
              onClick={() => st.selectModal(m.id)}>
              <MessageSquare size={13} className="text-slate-400 flex-shrink-0" />
              <span className="text-[13px] lg:text-xs text-slate-700 flex-1 truncate min-w-0">{m.name}</span>
              <span className={`text-[9px] flex-shrink-0 ${refs ? 'text-slate-400' : 'text-amber-600 font-bold'}`}>{refs ? `مستخدمة في ${refs}` : 'غير مستخدمة'}</span>
              <IconBtn label="خصائص النافذة" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!h-8 text-blue-600" onClick={stop(() => { st.setSelection({ kind: 'modal', id: m.id }); if (st.mode.isCompact) st.setMobilePanel('props'); })}><Settings size={14} /></IconBtn>
              <IconBtn label="حذف النافذة" tone="danger" className="hover-reveal opacity-0 group-hover:opacity-100 !h-9 !w-9 lg:!h-8 lg:!w-8" onClick={stop(() => st.setDeleteTarget({ kind: 'modal', id: m.id }))}><Trash2 size={13} /></IconBtn>
            </div>
          );
        })}
        {st.project.modals.filter(m => m.name.includes(q)).length === 0 && <p className="text-[11px] text-slate-400 py-3 text-center">لا نتائج مطابقة</p>}
      </div>
    </div>
  );
}

export function TemplatesList() {
  const st = useStudio();
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1">
      <MenuRow icon={<Download size={14} />} label="تصدير JSON كامل" hint="نسخة احتياطية بكل الصور والمكونات" onClick={() => { st.exportJson(false); st.setDropdown(null); st.setMobilePanel(null); }} />
      <MenuRow icon={<Download size={14} />} label="تصدير JSON خفيف" hint="بدون الصور — مناسب للمشاركة" onClick={() => { st.exportJson(true); st.setDropdown(null); st.setMobilePanel(null); }} />
      <MenuRow icon={<Upload size={14} />} label="استيراد تصميم JSON" hint="يُحمّل تصميمًا محفوظًا مكان الحالي" onClick={() => fileRef.current?.click()} />
      <input ref={fileRef} type="file" accept="application/json" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) st.importJson(f); e.currentTarget.value = ''; }} />
    </div>
  );
}

/** الحاوية المشتركة: قائمة منسدلة على الحاسوب، و Sheet على الجوال */
export function StructureSheets() {
  const st = useStudio();
  const { mode } = st;
  if (mode.isWide) return null;
  const map = { pages: 'الصفحات', bars: 'الأشرطة', modals: 'النوافذ المنبثقة', templates: 'القوالب والاستيراد' } as const;
  return (
    <Sheet open={!!st.dropdown && (st.dropdown in map)} onClose={() => st.setDropdown(null)}
      title={st.dropdown ? map[st.dropdown] : ''} icon={<Layers size={15} />} bodyClass="p-3">
      {st.dropdown === 'pages' && <PagesList />}
      {st.dropdown === 'bars' && <BarsList />}
      {st.dropdown === 'modals' && <ModalsList />}
      {st.dropdown === 'templates' && <TemplatesList />}
    </Sheet>
  );
}

// ═══════════════════════ [8] درج مكتبة المكونات ═══════════════════════
export function ComponentsDrawer() {
  const st = useStudio();
  const { componentSearch, setComponentSearch, componentCat, setComponentCat, favorites, setFavorites, nodeTemplates, project } = st;
  const cats: [string, React.ReactNode][] = [['all', 'الكل'], ...Object.entries(CATEGORY_LABELS).map(([k, v]) => [k, v] as [string, string]), ['fav', `⭐ ${favorites.length}`], ['tpl', '📌 قوالبي']];
  const list = useMemo(() => COMPONENT_LIBRARY
    .filter(c => componentCat === 'all' || (componentCat === 'fav' ? favorites.includes(c.type) : c.category === componentCat))
    .filter(c => !componentSearch || c.label.includes(componentSearch) || c.description.includes(componentSearch)),
  [componentSearch, componentCat, favorites]);

  return (
    <Sheet open={st.drawer === 'components'} onClose={() => st.setDrawer(null)}
      title="🧱 مكتبة المكونات" subtitle={`${list.length} مكوّن — اضغط للإضافة، أو اسحبها إلى اللوحة`}
      desktop="left" widthClass="w-[420px] xl:w-[460px]" bodyClass="p-3" fillHeight
      icon={<Blocks size={16} />}>
      <div className="sticky top-0 z-10 -mt-3 -mx-3 px-3 pb-2 pt-3 bg-white border-b border-slate-100 space-y-2">
        <div className="relative">
          <Search size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={componentSearch} onChange={e => setComponentSearch(e.target.value)} placeholder="ابحث عن مكون…"
            className="h-10 lg:h-8 pr-8 text-[15px] lg:text-xs" />
        </div>
        <ChipTabs items={cats} value={componentCat} onChange={setComponentCat} size="sm" />
      </div>

      {componentCat === 'tpl' ? (
        <div className="space-y-2 mt-3">
          {nodeTemplates.length === 0 && <p className="text-xs text-slate-400 text-center py-6">لا توجد قوالب مكونات محفوظة بعد — حدد مكوّنًا ثم «حفظ كقالب»</p>}
          {nodeTemplates.map((t, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
              <button onClick={() => { st.mutateNodes(st.currentOwner.kind, st.currentOwner.id, ns => [...ns, cloneNode(t)]); toast.success('تمت إضافة القالب ✓'); }}
                className="flex-1 text-right text-[12px] font-bold text-slate-700 truncate">{t.name}</button>
              <IconBtn label="حذف القالب" tone="danger" onClick={() => st.setNodeTemplates(x => x.filter((_, j) => j !== i))}><Trash2 size={14} /></IconBtn>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 mt-3">
          {list.map(c => (
            <button key={c.type} title={c.description} onClick={() => st.addComponent(c.type)}
              draggable
              onDragStart={e => e.dataTransfer.setData('text/component', c.type)}
              className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 hover:shadow-md transition-all text-center min-h-[68px]">
              <span onClick={e => { e.stopPropagation(); setFavorites(f => (f.includes(c.type) ? f.filter(x => x !== c.type) : [...f, c.type])); }}
                className={`absolute top-0.5 left-0.5 h-8 w-8 inline-flex items-center justify-center text-[15px] leading-none rounded-lg ${favorites.includes(c.type) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}>★</span>
              <DynIconSafe name={c.icon} />
              <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">{c.label}</p>
              <p className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{c.description}</p>
            </button>
          ))}
          {list.length === 0 && <p className="text-xs text-slate-400 col-span-full text-center py-6">لا يوجد مكوّن بهذا الاسم</p>}
        </div>
      )}
    </Sheet>
  );
}

function DynIconSafe({ name }: { name: string }) {
  return <DynIcon name={name} size={20} className="mx-auto text-indigo-600" />;
}

// ═══════════════════════ [9] درج البيانات ═══════════════════════
export function DataDrawer() {
  const st = useStudio();
  const { project, commit } = st;
  return (
    <Sheet open={st.drawer === 'data'} onClose={() => st.setDrawer(null)} title="📊 البيانات والمتغيرات"
      subtitle="المتغيرات تُستبدل ببيانات المشترك عند العرض" desktop="right" widthClass="w-[420px]" bodyClass="p-3 space-y-3" icon={<Database size={16} />}>
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-[12px] font-black text-slate-700 mb-1.5">متغيرات المشترك الجاهزة</p>
        <div className="flex flex-wrap gap-1.5">
          {['{name}', '{phone}', '{balance}', '{profits}', '{subscription}', '{fees}', '{currency}', '{status}', '{date}'].map(v => (
            <button key={v} onClick={() => { navigator.clipboard?.writeText(v); toast.success(`تم نسخ ${v}`); }}
              className="text-[12px] lg:text-[10px] font-mono px-2.5 py-2 lg:py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-50">{v}</button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-2 leading-6">استخدم هذه الرموز داخل نصوص المكونات — تُستبدل ببيانات المشترك الحقيقية عند العرض.</p>
      </div>
      <div>
        <p className="text-[12px] font-black text-slate-700 mb-1.5">متغيرات مخصصة</p>
        {project.variables.map(v => (
          <div key={v.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-1.5 mb-1.5 rounded-xl border border-slate-200 p-2">
            <Input value={v.name} onChange={e => commit(p => ({ ...p, variables: p.variables.map(x => (x.id === v.id ? { ...x, name: e.target.value } : x)) }))} placeholder="الاسم" className="h-10 lg:h-7 text-[15px] lg:text-[11px]" />
            <Input value={v.value} onChange={e => commit(p => ({ ...p, variables: p.variables.map(x => (x.id === v.id ? { ...x, value: e.target.value } : x)) }))} placeholder="القيمة" className="h-10 lg:h-7 text-[15px] lg:text-[11px]" />
            <IconBtn label="حذف المتغير" tone="danger" onClick={() => commit(p => ({ ...p, variables: p.variables.filter(x => x.id !== v.id) }))}><Trash2 size={14} /></IconBtn>
          </div>
        ))}
        <Button size="sm" variant="outline" className="h-10 lg:h-7 text-[11px] w-full gap-1"
          onClick={() => commit(p => ({ ...p, variables: [...p.variables, { id: Math.random().toString(36).slice(2), name: 'متغير', value: '' }] }))}>
          <Plus size={13} /> إضافة متغير
        </Button>
      </div>
    </Sheet>
  );
}

// ═══════════════════════ [10] شيت الأدوات الكامل (الجوال) ═══════════════════════
export function ToolsSheet() {
  const st = useStudio();
  const { mode } = st;
  const selectDesign = useDesignSelector();
  // إغلاق شيت الأدوات قبل فتح أي لوحة/نافذة أخرى (لا تراكب على الشاشة الصغيرة)
  const go = (fn: () => void) => () => { fn(); st.setMobilePanel(null); };
  if (mode.isWide) return null;
  return (
    <Sheet open={st.mobilePanel === 'tools'} onClose={() => st.setMobilePanel(null)} title="أدوات الاستوديو"
      subtitle="كل الأوامر المتاحة — نفسها الموجودة على الحاسوب" bodyClass="p-3 space-y-4" icon={<Menu size={16} />}>
      <Group title="الملف">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <MiniAction icon={<Save size={15} />} label={st.dirty ? 'حفظ ●' : 'حفظ'} onClick={st.doSave} tone="primary" />
          <MiniAction icon={<Undo2 size={15} />} label="تراجع" onClick={st.undo} disabled={!st.canUndo} />
          <MiniAction icon={<Redo2 size={15} />} label="إعادة" onClick={st.redo} disabled={!st.canRedo} />
          <MiniAction icon={<X size={15} />} label="خروج" onClick={st.requestExit} />
        </div>
      </Group>

      <Group title="البنية">
        <MenuRow icon={<FileText size={15} />} label="الصفحات" hint={`${st.project.pages.length} صفحة`} onClick={go(() => st.setDropdown('pages'))} />
        <MenuRow icon={<Link2 size={15} />} label="الأشرطة" hint={`${st.project.bars.length} شريط`} onClick={go(() => st.setDropdown('bars'))} />
        <MenuRow icon={<MessageSquare size={15} />} label="النوافذ المنبثقة" hint={`${st.project.modals.length} نافذة`} onClick={go(() => st.setDropdown('modals'))} />
        <MenuRow icon={<Map size={15} />} label="خريطة التطبيق" onClick={go(() => st.setShowSitemap(true))} />
        <MenuRow icon={<Blocks size={15} />} label="مكتبة النوافذ الجاهزة" onClick={go(() => st.setShowModalLibrary(true))} />
      </Group>

      <Group title="التخصيص">
        <MenuRow icon={<Blocks size={15} />} label="مكتبة المكونات" hint="إضافة أي مكوّن للوحة" onClick={go(() => st.setDrawer('components'))} />
        <MenuRow icon={<Palette size={15} />} label="التصميم العام" hint="ألوان · خطوط · مقاسات" onClick={selectDesign} />
        <MenuRow icon={<Database size={15} />} label="البيانات والمتغيرات" onClick={go(() => st.setDrawer('data'))} />
        <MenuRow icon={<Settings size={15} />} label="إعدادات التطبيق" hint="هوية · ألوان · لغات · وثائق" onClick={go(() => st.setShowAppSettings(true))} />
        <MenuRow icon={<Package size={15} />} label="القوالب · التصدير · الاستيراد" onClick={go(() => st.setDropdown('templates'))} />
      </Group>

      <Group title="العرض في اللوحة">
        <div className="px-1">
          <p className="text-[11px] font-black text-slate-500 mb-1.5">مقاس المعاينة</p>
          <div className="grid grid-cols-4 gap-1.5">
            {DEVICES.map(d => (
              <button key={d.w} onClick={go(() => st.setDevice(d.w))}
                className={`h-11 rounded-xl text-[10px] font-black border flex flex-col items-center justify-center gap-0.5
                  ${st.device === d.w ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                <d.icon size={14} />{d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <IconBtn label="تصغير" onClick={() => { st.setAutoFit(false); st.setZoom((z: number) => Math.max(40, z - 10)); }} variant="outline">−</IconBtn>
            <span className="text-[12px] font-black text-slate-600 tabular-nums min-w-12 text-center">{st.autoFit ? 'ملاءمة' : `${st.zoom}%`}</span>
            <IconBtn label="تكبير" onClick={() => { st.setAutoFit(false); st.setZoom((z: number) => Math.min(200, z + 10)); }} variant="outline">+</IconBtn>
            <IconBtn label="ملاءمة للعرض" active={st.autoFit} onClick={() => { st.setZoom(100); st.setAutoFit(true); }} variant="outline" className="flex-1 !w-auto px-3 text-[11px]">ملاءمة</IconBtn>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <ToggleRow label="ملاءمة تلقائية للوحة" checked={st.autoFit} onChange={v => { st.setAutoFit(v); if (v) st.setZoom(100); }} />
            <ToggleRow label="الشبكة الإرشادية" checked={st.showGrid} onChange={v => st.setShowGrid(v)} />
            <ToggleRow label="المسطرة" checked={st.showRuler} onChange={v => st.setShowRuler(v)} />
          </div>
        </div>
      </Group>

      <Group title="المعاينة والنشر">
        <div className="grid grid-cols-2 gap-1.5">
          <MiniAction icon={<Eye size={15} />} label="معاينة التطبيق" onClick={go(() => st.setShowPreview(true))} tone="success" />
          <MiniAction icon={<Rocket size={15} />} label="نشر التطبيق" onClick={go(() => st.setShowPublish(true))} tone="violet" />
        </div>
      </Group>
    </Sheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 px-1 mb-1">{title}</p>
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">{children}</div>
    </div>
  );
}

function MiniAction({ icon, label, onClick, disabled, tone = 'default' }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; tone?: 'default' | 'primary' | 'success' | 'violet' }) {
  const pal = tone === 'primary' ? 'bg-blue-600 text-white' : tone === 'success' ? 'bg-emerald-600 text-white' : tone === 'violet' ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-700';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`h-11 rounded-xl text-[11px] font-black inline-flex items-center justify-center gap-1.5 disabled:opacity-40 ${pal}`}>
      {icon}{label}
    </button>
  );
}

// ═══════════════════════ [11] ألواح الجوال (Sheets) ═══════════════════════
export function MobilePanels() {
  const st = useStudio();
  const { mode } = st;
  if (mode.isWide) return null;
  const panel = st.mobilePanel;
  return (
    <>
      {/* شجرة البنية: تأخذ ثلثي الشاشة حتى تبقى اللوحة مرئية خلفها */}
      <Sheet open={panel === 'tree'} onClose={() => st.setMobilePanel(null)} title="بنية التطبيق"
        subtitle="صفحات · أشرطة · نوافذ · مكونات" bodyClass="p-0" icon={<Layers size={16} />}>
        <div className="h-[62vh]"><TreePanel /></div>
      </Sheet>

      {/* لوحة الخصائص: بارتفاع كامل مع تذييل ثابت للأزرار */}
      <Sheet open={panel === 'props'} onClose={() => st.setMobilePanel(null)}
        title={panelTitle(st)} subtitle="كل خصائص العنصر المحدد" bodyClass="p-0" icon={<Settings size={16} />} fillHeight
        panelClass="!h-[86vh] !max-h-[86vh]" headerExtra={<PropsSheetActions />}>
        <div className="h-full min-h-0"><PropsPane embedded /></div>
      </Sheet>
    </>
  );
}

function panelTitle(st: ReturnType<typeof useStudio>) {
  const s = st.selection;
  if (s.kind === 'node') {
    const list = st.nodeListOf(s.ownerKind, s.ownerId);
    const n = list && s.id ? findNode(list, s.id) : null;
    return `⚙️ ${n?.name || 'المكوّن'}`;
  }
  if (s.kind === 'page') return '⚙️ إعدادات الصفحة';
  if (s.kind === 'bar') return '⚙️ إعدادات الشريط';
  if (s.kind === 'modal') return '⚙️ إعدادات النافذة';
  if (s.kind === 'design') return '🎨 التصميم العام';
  return '⚙️ الخصائص';
}

/** أزرار سريعة في رأس شيت الخصائص (نسخ/حذف) — الوصول بدون تمرير طويل */
function PropsSheetActions() {
  const st = useStudio();
  const has = st.selection.kind === 'node' && !!st.selection.id;
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {has && (
        <>
          <IconBtn label="نسخ المكوّن" onClick={st.duplicateSelectedNode} variant="outline"><Copy size={14} /></IconBtn>
          <IconBtn label="حذف المكوّن" tone="danger" onClick={() => st.selection.id && st.setDeleteTarget({ kind: 'node', id: st.selection.id })}><Trash2 size={14} /></IconBtn>
        </>
      )}
    </div>
  );
}

/** زر عائم يفتح الخصائص على الجوال عند تحديد عنصر (لا يضيع الوصول خلف اللوحات) */
export function SelectionFloatingActions() {
  const st = useStudio();
  // على الحاسوب لوحة الخصائص ظاهرة دائمًا، فلا حاجة للزر العائم
  if (st.mode.isWide || st.mobilePanel) return null;
  if (st.selection.kind !== 'node' || !st.selection.id) return null;
  const list = st.nodeListOf(st.selection.ownerKind, st.selection.ownerId);
  const n = list ? findNode(list, st.selection.id) : null;
  if (!n) return null;
  return (
    <FloatingPill onClick={() => st.setMobilePanel('props')} tone="primary" className="!fixed">
      <Settings size={15} /> خصائص «{n.name}»
    </FloatingPill>
  );
}

// ═══════════════════════ [12] محرّر الإجراء ═══════════════════════
export function ActionEditorLayer() {
  const st = useStudio();
  const { selection, project } = st;
  if (!st.showActionEditor || selection.kind !== 'node' || !selection.id || !selection.ownerId) return null;
  const list = st.nodeListOf(selection.ownerKind, selection.ownerId);
  const n = list ? findNode(list, selection.id) : null;
  if (!n) return null;
  return (
    <ActionEditor
      action={n.action}
      project={project}
      onClose={() => st.setShowActionEditor(false)}
      onChange={a => st.mutateNodes(selection.ownerKind || 'page', selection.ownerId!, ns => {
        const upd = (l: AppNode[]): AppNode[] => l.map(x => (x.id === n.id ? { ...x, action: a } : { ...x, children: upd(x.children) }));
        return upd(ns);
      })}
    />
  );
}

/** غلاف اللوحة اليمنى (الخصائص) على الحاسوب */
export function DesktopPropsAside() {
  const st = useStudio();
  if (!st.mode.isWide) return null;
  return (
    <aside className="w-[340px] xl:w-[380px] bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto overscroll-contain pane-scroll thin-scroll" data-testid="builder-props-aside">
      <PropsPane />
    </aside>
  );
}

/** غلاف الشجرة على الحاسوب */
export function DesktopTreeAside() {
  const st = useStudio();
  if (!st.mode.isWide) return null;
  return (
    <aside className="w-[260px] xl:w-[300px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 min-h-0" data-testid="builder-tree-aside">
      <TreePanel />
    </aside>
  );
}
