// حالة قسم «بناء تطبيق العميل» — تخزين محلي + تراجع/إعادة + حفظ تلقائي
import { AppBuilderStore, AppProject } from '@/types/app-builder';
import { EMPTY_STORE, resolveProject } from '@/data/app-builder-defaults';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export const APP_BUILDER_KEY = 'mapp_builder_v1';
const DRAFT_KEY = 'mapp_builder_draft_v1';

export function useAppBuilderStore() {
  const [store, setStore] = useLocalStorage<AppBuilderStore>(APP_BUILDER_KEY, EMPTY_STORE());
  const patch = useCallback((p: Partial<AppBuilderStore>) => setStore({ ...store, ...p }), [store, setStore]);
  return { store, setStore, patch };
}

/** سجل تراجع/إعادة بحد 100 خطوة (القسم 16.5) */
export function useProjectEditor(initial: AppProject) {
  const [project, setProjectState] = useState<AppProject>(initial);
  const past = useRef<AppProject[]>([]);
  const future = useRef<AppProject[]>([]);
  const [dirty, setDirty] = useState(false);
  const [, force] = useState(0);

  useEffect(() => { setProjectState(initial); past.current = []; future.current = []; setDirty(false); }, [initial.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((updater: (p: AppProject) => AppProject) => {
    setProjectState(prev => {
      past.current = [...past.current, prev].slice(-100);
      future.current = [];
      const next = { ...updater(prev), updatedAt: new Date().toISOString() };
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
    setDirty(true);
    force(v => v + 1);
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setProjectState(prev => {
      const last = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [prev, ...future.current].slice(0, 100);
      return last;
    });
    setDirty(true);
    force(v => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setProjectState(prev => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, prev].slice(-100);
      return next;
    });
    setDirty(true);
    force(v => v + 1);
  }, []);

  const replace = useCallback((p: AppProject) => {
    setProjectState(p);
    past.current = [];
    future.current = [];
    setDirty(false);
  }, []);

  return {
    project, commit, undo, redo, replace, dirty, setDirty,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}

/** مسودة الجلسة غير المحفوظة (القسم 16.2) */
export function readDraft(): AppProject | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? resolveProject(JSON.parse(raw)) : null;
  } catch { return null; }
}
export function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }
