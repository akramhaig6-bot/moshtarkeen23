// النظام المتقدم — تبويباته الفرعية بصرياً

import { Subscriber, Operation, SystemConfig, LiveStats } from '@/types';
import { AdvancedDashboard } from '@/components/advanced/AdvancedDashboard';
import { AdvancedAdminPanel } from '@/components/advanced/AdvancedAdminPanel';
import { AdvancedOperations } from '@/components/advanced/AdvancedOperations';
import { AdvancedSubscribers } from '@/components/advanced/AdvancedSubscribers';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, LayoutDashboard, CheckCircle2, ClipboardList, Activity, Clock, Crown,
} from 'lucide-react';

export type AdvancedSubTab = 'dashboard' | 'admin' | 'operations' | 'subscribers';

export function AdvancedSystemTab({
  subscribers, operations, stats, systemConfig, onOperationsChange, onSubscribersChange,
}: {
  subscribers: Subscriber[];
  operations: Operation[];
  stats: LiveStats;
  systemConfig: SystemConfig;
  onOperationsChange: (o: Operation[]) => void;
  onSubscribersChange: (s: Subscriber[]) => void;
}) {
  const [subTab, setSubTab] = useState<AdvancedSubTab>('dashboard');

  const subTabs: { id: AdvancedSubTab; label: string; icon: React.ReactNode; from: string; to: string; glow: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={16} />, from: '#3b82f6', to: '#06b6d4', glow: 'rgba(59,130,246,0.4)' },
    { id: 'admin', label: 'الاستعلام', icon: <Search size={16} />, from: '#10b981', to: '#14b8a6', glow: 'rgba(16,185,129,0.4)' },
    { id: 'operations', label: 'العمليات', icon: <ClipboardList size={16} />, from: '#8b5cf6', to: '#7c3aed', glow: 'rgba(139,92,246,0.4)' },
    { id: 'subscribers', label: 'المشتركون', icon: <Users size={16} />, from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.4)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)' }}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden px-4 lg:px-10 pt-8 pb-6">
        {/* خلفية جمالية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* الشعار والعنوان */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={30} className="text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-black text-white">النظام المتقدم</h1>
                  <span className="text-xs font-black px-2 py-1 rounded-full border text-amber-300 border-amber-500/50"
                    style={{ background: 'rgba(245,158,11,0.15)' }}>PRO</span>
                </div>
                <p className="text-slate-400 text-sm">نسخة احترافية محسّنة بصرياً — جميع البيانات مشتركة مع النظام الأصلي</p>
              </div>
            </div>

            {/* KPIs سريعة في الهيدر */}
            <div className="lg:mr-auto flex items-center gap-3 flex-wrap">
              {[
                { label: 'مشترك', value: subscribers.length, icon: <Users size={14} />, color: '#3b82f6' },
                { label: 'عملية', value: operations.length, icon: <Activity size={14} />, color: '#10b981' },
                { label: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, icon: <CheckCircle2 size={14} />, color: '#8b5cf6' },
                { label: 'معلق', value: operations.filter(o => o.status === 'قيد المعالجة').length, icon: <Clock size={14} />, color: '#f59e0b' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  <span className="text-xl font-black text-white">{kpi.value}</span>
                  <span className="text-slate-400 text-xs">{kpi.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── تبويبات داخلية ── */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
            {subTabs.map(tab => (
              <button key={tab.id} onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  subTab === tab.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={subTab === tab.id
                  ? { background: `linear-gradient(135deg, ${tab.from}, ${tab.to})`, boxShadow: `0 4px 20px ${tab.glow}` }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {tab.icon}
                {tab.label}
                {subTab === tab.id && (
                  <motion.span layoutId="adv-tab-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── محتوى التبويب ── */}
      <div className="px-4 lg:px-10 pb-10 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {subTab === 'dashboard' && (
            <motion.div key="adv-dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedDashboard subscribers={subscribers} operations={operations} stats={stats} />
            </motion.div>
          )}
          {subTab === 'admin' && (
            <motion.div key="adv-admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedAdminPanel subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {subTab === 'operations' && (
            <motion.div key="adv-ops" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedOperations operations={operations} onOperationsChange={onOperationsChange} subscriberNames={subscribers.map(s => s.name)} />
            </motion.div>
          )}
          {subTab === 'subscribers' && (
            <motion.div key="adv-subs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedSubscribers subscribers={subscribers} operations={operations} onSubscribersChange={onSubscribersChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
