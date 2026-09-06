/**
 * نظام إدارة المشتركين — Moshtarikeen Hub v2.0
 * لوحة تحكم إدارية متقدمة | بيانات محلية فقط (localStorage)
 */

import { Subscriber, Operation, SystemConfig, Tab } from '@/types';
import { resolveIPhoneCfg, DEFAULT_SYSTEM_CONFIG } from '@/config/system';
import { INITIAL_SUBSCRIBERS, INITIAL_OPERATIONS } from '@/data/seed';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { clampRadius, clampIPhoneScale } from '@/lib/iphone';
import { IPhoneScreenCurvature } from '@/components/iphone/IPhoneScreenCurvature';
import { IPhoneStatusBarOverlay } from '@/components/iphone/IPhoneStatusBarOverlay';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { SystemAdminTab } from '@/components/system-admin/SystemAdminTab';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AddOperationsTab } from '@/components/admin/AddOperationsTab';
import { AddSubscriberTab } from '@/components/subscribers/AddSubscriberTab';
import { AdvancedSystemTab } from '@/components/advanced/AdvancedSystemTab';
import { ReportsTab } from '@/components/reports/ReportsTab';
import { SettingsTab } from '@/components/settings/SettingsTab';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { AppBuilderTab } from '@/components/app-builder/AppBuilderTab';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users, LayoutDashboard, Settings, Bell, LogOut, User, Shield, ClipboardList, UserPlus, ChevronLeft, Lock, Database, PanelLeftClose, PanelLeftOpen, SlidersHorizontal, CalendarClock, Sparkles, Crown, Moon, Sun, Command, BarChart2, Hammer,
} from 'lucide-react';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('msub_v2', INITIAL_SUBSCRIBERS);
  const [operations, setOperations] = useLocalStorage<Operation[]>('mops_v3', INITIAL_OPERATIONS);
  const [systemConfig, setSystemConfig] = useLocalStorage<SystemConfig>('msys_config_v2', DEFAULT_SYSTEM_CONFIG);

  // ── Dark Mode ──
  const [isDark, setIsDark] = useLocalStorage<boolean>('msub_darkmode', false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // ── Command Palette ──
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); setActiveTab('addSubscriber'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); setActiveTab('addOperations'); }
      if (e.key === 'Escape') { setCmdOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateConfig = (partial: Partial<SystemConfig>) => {
    setSystemConfig({ ...systemConfig, ...partial });
  };

  const sn = systemConfig.sectionNames;
  const co = systemConfig.cardOverrides;

  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const liveStats = useMemo(() => ({
    totalSubscribers: co.totalSubscribers || String(subscribers.length),
    totalProfits: co.totalProfits || '١٬٢٨٤٬٥٠٠ ر.س',
    activeSubscriptions: co.activeSubscriptions || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    pendingRequests: co.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length),
    activeCount: co.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    completedOpsStr: co.completedOps || String(completedOps),
    totalSubsCount: co.totalSubsCount || String(subscribers.length),
    activationOpsStr: co.activationOps || String(activationOps),
  }), [subscribers, co, completedOps, activationOps]);

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard', icon: <LayoutDashboard size={20} />, label: sn.dashboard },
    { tab: 'systemAdmin', icon: <SlidersHorizontal size={20} />, label: sn.systemAdmin },
    { tab: 'admin', icon: <Shield size={20} />, label: sn.admin },
    { tab: 'addOperations', icon: <ClipboardList size={20} />, label: sn.addOperations },
    { tab: 'addSubscriber', icon: <UserPlus size={20} />, label: sn.addSubscriber },
    { tab: 'appBuilder', icon: <Hammer size={20} />, label: 'بناء تطبيق العميل' },
    { tab: 'reports', icon: <BarChart2 size={20} />, label: 'التقارير' },
    { tab: 'settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  const isAdvanced = activeTab === 'advanced';
  const iCfg = resolveIPhoneCfg(systemConfig.iPhoneConfig);

  const systemDisplayDate = systemConfig.systemDate
    || new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const appContent = (
    <div className="enterprise-shell min-h-screen bg-background flex" dir="rtl" style={iCfg.enabled ? { minHeight: '100%' } : undefined}>
      {/* ── Enterprise Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 264 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-gradient-to-b from-[#0f2140] via-[#0c1a33] to-[#0a1424] text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-20 overflow-hidden flex-shrink-0 border-l border-white/5"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40 ring-1 ring-white/10 flex-shrink-0">
            <Database size={20} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                <p className="font-black text-sm leading-tight whitespace-nowrap tracking-tight">مركز المشتركين</p>
                <p className="text-[11px] text-blue-300/70 whitespace-nowrap tracking-[0.15em] uppercase">Moshtarikeen Hub</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Pill */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs text-emerald-300 font-semibold">النظام يعمل</span>
              <span className="mr-auto text-xs text-blue-200/60 tabular-nums">{subscribers.length} مشترك</span>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className="flex justify-center mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-3 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                activeTab === item.tab
                  ? 'bg-gradient-to-l from-blue-600/30 to-indigo-600/15 text-white border border-blue-400/30 shadow-lg shadow-blue-950/40'
                  : 'text-blue-100/50 hover:bg-white/5 hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}>
              {activeTab === item.tab && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-blue-400" />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex-1 text-right truncate text-sm">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!sidebarCollapsed && activeTab === item.tab && (
                <ChevronLeft size={13} className="flex-shrink-0 opacity-60" />
              )}
            </button>
          ))}

          {/* ── فاصل قسم النظام المتقدم ── */}
          <div className="pt-2 pb-1">
            <div className="h-px bg-gradient-to-l from-transparent via-amber-500/40 to-transparent" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 px-1 pt-2 pb-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="text-xs font-black text-amber-400/80 tracking-widest uppercase">المتقدم</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── زر النظام المتقدم ── */}
          <button onClick={() => setActiveTab('advanced')}
            title={sidebarCollapsed ? 'النظام المتقدم' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
              activeTab === 'advanced'
                ? 'text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'text-amber-400/70 hover:text-amber-300'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            style={activeTab === 'advanced'
              ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(168,85,247,0.15) 100%)' }
              : { background: 'transparent' }
            }>
            {/* خلفية متحركة عند التحديد */}
            {activeTab !== 'advanced' && (
              <span className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(168,85,247,0.08) 100%)' }} />
            )}
            <span className="flex-shrink-0 relative">
              <Crown size={20} className={activeTab === 'advanced' ? 'text-amber-400' : ''} />
              {activeTab !== 'advanced' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              )}
            </span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex-1 text-right flex items-center gap-2">
                  <span className="truncate text-sm font-bold">النظام المتقدم</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && activeTab === 'advanced' && (
              <ChevronLeft size={13} className="flex-shrink-0 opacity-60 text-amber-400" />
            )}
          </button>

          <Separator className="my-2 bg-white/10" />
          <button title={sidebarCollapsed ? 'الإعدادات' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-white transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Settings size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>الإعدادات</span>}
          </button>
        </nav>

        {/* User + Toggle */}
        <div className="p-3 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 ring-1 ring-white/5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">المدير العام</p>
                <p className="text-[11px] text-blue-200/50 truncate">admin@system.com</p>
              </div>
              <Lock size={12} className="text-blue-300/40 flex-shrink-0" />
            </div>
          )}
          {!sidebarCollapsed && (
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-medium transition-colors mb-2">
              <LogOut size={14} /><span>تسجيل الخروج</span>
            </button>
          )}
          {/* Collapse toggle */}
          <button onClick={() => setSidebarCollapsed(c => !c)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={16} /><span>طي الشريط</span></>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Mobile nav icons */}
            <div className="flex lg:hidden gap-1 overflow-x-auto max-w-[55vw]">
              {navItems.map(item => (
                <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${activeTab === item.tab ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'bg-secondary text-muted-foreground'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 15 })}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-2.5">
              <span className="h-6 w-1 rounded-full bg-blue-600" />
              <h1 className="text-base font-black text-foreground tracking-tight">
                {navItems.find(n => n.tab === activeTab)?.label ?? 'النظام'}
              </h1>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">v2.0</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Command Palette trigger */}
            <button onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 text-xs border border-slate-200">
              <Command size={12} />
              <span>بحث سريع</span>
              <kbd className="text-[10px] bg-white border border-slate-200 rounded px-1">⌘K</kbd>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <CalendarClock size={12} /><span>{systemDisplayDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <Users size={12} /><span>{subscribers.length} مشترك</span>
            </div>
            {/* Dark Mode Toggle */}
            <button onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600" title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Button variant="outline" size="icon" className="rounded-full relative h-8 w-8 border-slate-200">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </Button>
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-1 ring-blue-200">
                <User size={13} className="text-white" />
              </div>
              <p className="text-xs font-bold text-foreground">المدير العام</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <DashboardTab
                stats={liveStats}
                subscribers={subscribers}
                operations={operations}
                institutionalText={systemConfig.institutionalText}
                sectionName={sn.dashboard}
              />
            </motion.div>
          )}
          {activeTab === 'systemAdmin' && (
            <motion.div key="systemAdmin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <SystemAdminTab
                systemConfig={systemConfig}
                onConfigChange={updateConfig}
                subscribersCount={subscribers.length}
                sectionName={sn.systemAdmin}
                operations={operations}
                onOperationsChange={setOperations}
              />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} sectionName={sn.admin} systemConfig={systemConfig} />
            </motion.div>
          )}
          {activeTab === 'addOperations' && (
            <motion.div key="addOps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddOperationsTab operations={operations} onOperationsChange={setOperations} subscriberNames={subscribers.map(s => s.name)} sectionName={sn.addOperations} />
            </motion.div>
          )}
          {activeTab === 'addSubscriber' && (
            <motion.div key="addSub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} sectionName={sn.addSubscriber} operations={operations} onOperationsChange={setOperations} systemConfig={systemConfig} onConfigChange={updateConfig} />
            </motion.div>
          )}
          {activeTab === 'appBuilder' && (
            <motion.div key="appBuilder" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AppBuilderTab subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {activeTab === 'advanced' && (
            <motion.div key="advanced" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full">
              <AdvancedSystemTab
                subscribers={subscribers}
                operations={operations}
                stats={liveStats}
                systemConfig={systemConfig}
                onOperationsChange={setOperations}
                onSubscribersChange={setSubscribers}
              />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <ReportsTab subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <SettingsTab
                isDark={isDark}
                onDarkToggle={() => setIsDark(!isDark)}
                subscribers={subscribers}
                operations={operations}
                systemConfig={systemConfig}
                onSubscribersChange={setSubscribers}
                onOperationsChange={setOperations}
                onConfigChange={updateConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Command Palette Overlay ── */}
      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette
            open={cmdOpen}
            query={cmdQuery}
            onQueryChange={setCmdQuery}
            onClose={() => { setCmdOpen(false); setCmdQuery(''); }}
            subscribers={subscribers}
            operations={operations}
            onNavigate={(tab) => { setActiveTab(tab as Tab); setCmdOpen(false); setCmdQuery(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );

  if (iCfg.enabled) {
    const iRadius = clampRadius(iCfg.screenRadius);
    // حشوة جانبية تتبع انحناء الشاشة حتى لا تُقص العناصر عند الزوايا
    const iSidePad = Math.round(iRadius * 0.32);
    const iBottomPad = iCfg.showHomeIndicator ? 26 : Math.round(iRadius * 0.2);
    const iWidthScale = clampIPhoneScale(iCfg.widthScale);
    const iHeightScale = clampIPhoneScale(iCfg.heightScale);
    // «الوضع السابق» = بلا أي تحجيم مخصص (100%/100%) — في هذه الحالة لا نضيف
    // أي style/transform على الحاوية حتى تبقى مطابقة حرفياً لما كانت عليه قبل هذه الميزة.
    const isIPhoneScaleDefault = iWidthScale === 100 && iHeightScale === 100;
    // نوسّع مساحة التخطيط بعكس المقياس ثم نضغطها بصرياً؛ لذلك تتغير كل العناصر
    // (الخطوط والأزرار والبطاقات) مع العرض والطول، لا الحاوية وحدها.
    const iPhoneScaleStyle: React.CSSProperties | undefined = isIPhoneScaleDefault ? undefined : {
      width: `${10000 / iWidthScale}%`,
      minHeight: `${10000 / iHeightScale}vh`,
      transform: `scale(${iWidthScale / 100}, ${iHeightScale / 100})`,
      transformOrigin: 'top left',
    };

    return (
      <>
        {/* ── انحناء حواف الشاشة + مؤشر الشريط السفلي (بدون هيكل خارجي للجهاز) ── */}
        <IPhoneScreenCurvature cfg={iCfg} />

        <div data-testid="iphone-ui-scale" style={iPhoneScaleStyle}>
          {/* ── Fixed: iPhone Status Bar (always at very top) ── */}
        <IPhoneStatusBarOverlay cfg={iCfg} onExit={() => updateConfig({ iPhoneConfig: { ...iCfg, enabled: false } })} />

        {/* ── Fixed: Mobile-only nav bar (sits below status bar, hidden on desktop) ── */}
        <nav
          className="lg:hidden fixed left-0 right-0 bg-gradient-to-b from-[#0f2140] via-[#0c1a33] to-[#0a1424] flex items-center gap-1 z-[9998] overflow-x-auto"
          style={{ top: 44, height: 44, paddingLeft: 8 + iSidePad, paddingRight: 8 + iSidePad }}
        >
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={`flex-shrink-0 p-2 rounded-xl transition-colors ${activeTab === item.tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-blue-100/50 hover:text-white hover:bg-white/10'}`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 17 })}
            </button>
          ))}
        </nav>

        {/* ── Scrollable content area ── */}
        {/* Mobile: padTop=88 (44 status bar + 44 mobile nav) | Desktop: padTop=44 */}
        <div dir="rtl" className="enterprise-shell bg-slate-50 flex pt-[88px] lg:pt-[44px] min-h-screen"
          style={{ paddingBottom: iBottomPad }}>

          {/* ── Desktop Sidebar ── */}
          <motion.aside
            animate={{ width: sidebarCollapsed ? 72 : 256 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-gradient-to-b from-[#0f2140] via-[#0c1a33] to-[#0a1424] text-white hidden lg:flex flex-col sticky h-[calc(100vh-44px)] shadow-2xl z-10 overflow-hidden flex-shrink-0"
            style={{ top: 44 }}
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Database size={20} className="text-white" />
              </div>
              {!sidebarCollapsed && <div><p className="font-black text-sm leading-tight whitespace-nowrap">مركز المشتركين</p><p className="text-xs text-slate-400 whitespace-nowrap">Moshtarikeen Hub</p></div>}
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
              {navItems.map(item => (
                <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-blue-100/50 hover:text-white hover:bg-white/10'}`}>
                  {item.icon}
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </nav>
          </motion.aside>

          {/* ── Main content (compact for iPhone mode) ── */}
          <main className="flex-1 min-w-0 text-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <motion.div key="db" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><DashboardTab stats={liveStats} subscribers={subscribers} operations={operations} institutionalText={systemConfig.institutionalText} sectionName={sn.dashboard} /></motion.div>}
              {activeTab === 'systemAdmin' && <motion.div key="sa" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><SystemAdminTab systemConfig={systemConfig} onConfigChange={updateConfig} subscribersCount={subscribers.length} sectionName={sn.systemAdmin} operations={operations} onOperationsChange={setOperations} /></motion.div>}
              {activeTab === 'admin' && <motion.div key="adm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><AdminPanel subscribers={subscribers} operations={operations} sectionName={sn.admin} systemConfig={systemConfig} /></motion.div>}
              {activeTab === 'addOperations' && <motion.div key="ao" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><AddOperationsTab operations={operations} onOperationsChange={setOperations} subscriberNames={subscribers.map(s => s.name)} sectionName={sn.addOperations} /></motion.div>}
               {activeTab === 'addSubscriber' && <motion.div key="as" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} sectionName={sn.addSubscriber} operations={operations} onOperationsChange={setOperations} systemConfig={systemConfig} onConfigChange={updateConfig} /></motion.div>}
              {activeTab === 'appBuilder' && <motion.div key="ab" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><AppBuilderTab subscribers={subscribers} operations={operations} /></motion.div>}
              {activeTab === 'reports' && <motion.div key="rep" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><ReportsTab subscribers={subscribers} operations={operations} /></motion.div>}
              {activeTab === 'settings' && <motion.div key="set" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 space-y-3 max-w-[1600px] mx-auto w-full"><SettingsTab isDark={isDark} onDarkToggle={() => setIsDark(!isDark)} subscribers={subscribers} operations={operations} systemConfig={systemConfig} onSubscribersChange={setSubscribers} onOperationsChange={setOperations} onConfigChange={updateConfig} /></motion.div>}
            </AnimatePresence>
          </main>
        </div>
        </div>
      </>
    );
  }

  return appContent;
}
