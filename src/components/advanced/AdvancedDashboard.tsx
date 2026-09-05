// ── الداشبورد المتقدم ──

import { Subscriber, Operation, LiveStats } from '@/types';
import { CHART_DATA } from '@/data/seed';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, TrendingUp, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, CheckCheck, Zap, DollarSign,
} from 'lucide-react';

export function AdvancedDashboard({ subscribers, operations, stats }: { subscribers: Subscriber[]; operations: Operation[]; stats: LiveStats }) {
  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const pendingOps = operations.filter(o => o.status === 'قيد المعالجة').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;
  const activeSubscribers = subscribers.filter(s => s.subscriberStatus === 'نشط').length;
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);
  const avgSubscription = subscribers.length ? Math.round(subscribers.reduce((a, s) => a + s.subscriptionAmount, 0) / subscribers.length) : 0;

  const glowCards = [
    {
      title: 'إجمالي المشتركين', value: stats.totalSubscribers, sub: `نشط: ${activeSubscribers}`,
      icon: <Users size={24} />, gradientCss: 'linear-gradient(135deg,#2563eb,#06b6d4)', glow: 'rgba(59,130,246,0.4)',
      trend: '+12%', up: true,
    },
    {
      title: 'إجمالي الأرباح', value: stats.totalProfits, sub: `${completedOps} عملية مكتملة`,
      icon: <TrendingUp size={24} />, gradientCss: 'linear-gradient(135deg,#10b981,#2dd4bf)', glow: 'rgba(16,185,129,0.4)',
      trend: '+8.3%', up: true,
    },
    {
      title: 'الاشتراكات النشطة', value: stats.activeSubscriptions, sub: `من ${stats.totalSubsCount} مشترك`,
      icon: <CheckCheck size={24} />, gradientCss: 'linear-gradient(135deg,#7c3aed,#a855f7)', glow: 'rgba(139,92,246,0.4)',
      trend: '+5.1%', up: true,
    },
    {
      title: 'رسوم مستحقة', value: stats.pendingRequests, sub: `${stats.activationOpsStr} تنشيط`,
      icon: <AlertCircle size={24} />, gradientCss: 'linear-gradient(135deg,#f59e0b,#fb923c)', glow: 'rgba(245,158,11,0.4)',
      trend: '-2.4%', up: false,
    },
  ];

  const pieData = [
    { name: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
    { name: 'جديد', value: subscribers.filter(s => s.subscriberStatus === 'مشترك جديد').length, color: '#3b82f6' },
    { name: 'رسوم', value: subscribers.filter(s => s.subscriberStatus === 'رسوم مستحقة').length, color: '#f59e0b' },
    { name: 'أرباح', value: subscribers.filter(s => s.subscriberStatus === 'توزيع أرباح').length, color: '#8b5cf6' },
    { name: 'معلق', value: subscribers.filter(s => s.subscriberStatus === 'معلق').length, color: '#64748b' },
  ].filter(d => d.value > 0);

  return (
    <>
      {/* بطاقات الإحصائيات المضيئة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {glowCards.map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-2xl p-5 overflow-hidden cursor-default"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 30px ${card.glow}` }}>
            {/* توهج خلفي */}
            <div className="absolute inset-0 opacity-10 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${card.glow}, transparent)` }} />
            {/* أيقونة بتدرج */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg"
              style={{ background: card.gradientCss }}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-xs font-medium mb-1">{card.title}</p>
            <h3 className="text-2xl font-black text-white mb-1">{card.value}</h3>
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs">{card.sub}</p>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ثانياً: إضافية KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'متوسط الاشتراك', value: `${avgSubscription.toLocaleString()} ر.س`, icon: <DollarSign size={14} />, color: '#3b82f6' },
          { label: 'إجمالي الرسوم', value: `${totalFees.toLocaleString()} ر.س`, icon: <AlertCircle size={14} />, color: '#f59e0b' },
          { label: 'عمليات معلقة', value: pendingOps, icon: <Clock size={14} />, color: '#8b5cf6' },
          { label: 'عمليات تنشيط', value: activationOps, icon: <Zap size={14} />, color: '#ef4444' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs">{item.label}</p>
              <p className="text-white font-black text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخطط الأرباح */}
        <div className="lg:col-span-2 rounded-2xl p-5 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-black">نمو الأرباح الشهرية</h3>
              <p className="text-slate-500 text-xs mt-0.5">المقارنة مع الهدف المخطط</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">مباشر</span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="advGVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="advGTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} ر.س`, name === 'value' ? 'الأرباح' : 'الهدف']}
                />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#advGTgt)" />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#advGVal)" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مخطط الحالات */}
        <div className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-1">توزيع الحالات</h3>
          <p className="text-slate-500 text-xs mb-4">حسب حالة اشتراك المشترك</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: number, _n: string, p: any) => [`${v} مشترك`, p.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* آخر العمليات */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-black">آخر العمليات</h3>
          <span className="text-xs text-slate-500 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {operations.length} عملية
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {operations.slice(0, 7).map((op, i) => (
            <motion.div key={op.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                op.status === 'مكتمل' ? 'bg-emerald-500/20' :
                op.status === 'تنشيط النظام' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                {op.status === 'مكتمل' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                  op.status === 'تنشيط النظام' ? <AlertCircle size={14} className="text-red-400" /> :
                    <Clock size={14} className="text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{op.subscriberName}</p>
                <p className="text-xs text-slate-500">{op.operation} · {op.date}</p>
              </div>
              <span className={`text-sm font-black ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>
                {op.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* إحصائيات النظام */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'عمليات مكتملة', value: completedOps, total: operations.length, color: '#10b981', icon: <CheckCircle2 size={16} /> },
          { label: 'قيد المعالجة', value: pendingOps, total: operations.length, color: '#3b82f6', icon: <Clock size={16} /> },
          { label: 'تنشيط النظام', value: activationOps, total: operations.length, color: '#ef4444', icon: <Zap size={16} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="text-slate-300 text-sm font-bold">{item.label}</span>
              <span className="mr-auto text-white font-black">{item.value} / {item.total}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.total ? item.value / item.total * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${item.color}99, ${item.color})` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{item.total ? Math.round(item.value / item.total * 100) : 0}% من الإجمالي</p>
          </div>
        ))}
      </div>
    </>
  );
}
