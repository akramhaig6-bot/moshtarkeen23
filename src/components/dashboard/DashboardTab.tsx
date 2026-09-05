// التبويب الرئيسي — النظام الإداري (داشبورد)

import { Subscriber, Operation, LiveStats } from '@/types';
import { CHART_DATA } from '@/data/seed';
import { amountColor } from '@/components/shared/StatusBadges';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users, TrendingUp, CheckCircle2, AlertCircle, Activity, ArrowUpRight, ArrowDownRight, Clock, Download, CheckCheck, Star,
} from 'lucide-react';

export function DashboardTab({ stats, subscribers, operations, institutionalText, sectionName }: {
  stats: LiveStats;
  subscribers: Subscriber[];
  operations: Operation[];
  institutionalText: string;
  sectionName: string;
}) {
  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const pendingOps = operations.filter(o => o.status === 'قيد المعالجة').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const statCards = [
    {
      title: 'إجمالي المشتركين',
      value: stats.totalSubscribers,
      sub: `نشط: ${stats.activeCount}`,
      icon: <Users size={22} className="text-blue-600" />,
      bg: 'bg-blue-50', ring: 'ring-blue-200', trend: '+12%', up: true, color: 'text-blue-700',
    },
    {
      title: 'إجمالي الأرباح',
      value: stats.totalProfits,
      sub: `${stats.completedOpsStr} عملية مكتملة`,
      icon: <TrendingUp size={22} className="text-emerald-600" />,
      bg: 'bg-emerald-50', ring: 'ring-emerald-200', trend: '+8.3%', up: true, color: 'text-emerald-700',
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats.activeSubscriptions,
      sub: `من ${stats.totalSubsCount} مشترك`,
      icon: <CheckCheck size={22} className="text-purple-600" />,
      bg: 'bg-purple-50', ring: 'ring-purple-200', trend: '+5.1%', up: true, color: 'text-purple-700',
    },
    {
      title: 'رسوم مستحقة',
      value: stats.pendingRequests,
      sub: `${stats.activationOpsStr} عملية تنشيط`,
      icon: <AlertCircle size={22} className="text-orange-500" />,
      bg: 'bg-orange-50', ring: 'ring-orange-200', trend: '-2.4%', up: false, color: 'text-orange-600',
    },
  ];

  const pieData = [
    { name: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
    { name: 'جديد', value: subscribers.filter(s => s.subscriberStatus === 'مشترك جديد').length, color: '#3b82f6' },
    { name: 'رسوم', value: subscribers.filter(s => s.subscriberStatus === 'رسوم مستحقة').length, color: '#f59e0b' },
    { name: 'أرباح', value: subscribers.filter(s => s.subscriberStatus === 'توزيع أرباح').length, color: '#8b5cf6' },
    { name: 'معلق', value: subscribers.filter(s => s.subscriberStatus === 'معلق').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء النظام</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 border-slate-200 h-9 hidden sm:flex">
          <Download size={13} /> تصدير
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`border-none shadow-sm ring-1 ${card.ring} hover:shadow-md transition-all duration-200`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.bg} ring-1 ${card.ring}`}>{card.icon}</div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {card.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{card.trend}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">{card.title}</p>
                <h3 className={`text-xl font-black mt-1 ${card.color} leading-tight`}>{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Institutional Text */}
      {institutionalText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-md ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500" />
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-800 leading-relaxed whitespace-pre-wrap">{institutionalText}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-800">نمو الأرباح الشهرية</CardTitle>
                <CardDescription className="text-xs">المقارنة مع الهدف المخطط</CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs gap-1"><Activity size={11} />مباشر</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} ر.س`, name === 'value' ? 'الأرباح' : 'الهدف']} />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#gTgt)" />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gVal)" dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-black text-slate-800">توزيع الحالات</CardTitle>
            <CardDescription className="text-xs">حسب حالة اشتراك المشترك</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: number, _n: string, p: any) => [`${v} مشترك`, p.payload.name]}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-black text-slate-800">آخر العمليات</CardTitle>
              <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{operations.length} إجمالي</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {operations.slice(0, 6).map(op => (
              <div key={op.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${op.status === 'مكتمل' ? 'bg-emerald-100' : op.status === 'تنشيط النظام' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {op.status === 'مكتمل' ? <CheckCircle2 size={15} className="text-emerald-600" /> :
                    op.status === 'تنشيط النظام' ? <AlertCircle size={15} className="text-red-500" /> :
                      <Clock size={15} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{op.subscriberName}</p>
                  <p className="text-xs text-slate-400">{op.operation} · {op.date}</p>
                </div>
                <span className={`text-sm ${amountColor(op.status)}`}>{op.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black text-slate-800">إحصائيات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'عمليات مكتملة', value: completedOps, total: operations.length, color: 'bg-emerald-500' },
              { label: 'قيد المعالجة', value: pendingOps, total: operations.length, color: 'bg-blue-500' },
              { label: 'تنشيط النظام', value: activationOps, total: operations.length, color: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-black text-slate-800">{item.value} / {item.total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.total ? (item.value / item.total * 100) : 0}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center ring-1 ring-slate-200">
                <p className="text-xs text-slate-400 mb-1">متوسط الاشتراك</p>
                <p className="text-sm font-black text-slate-700">
                  {subscribers.length ? Math.round(subscribers.reduce((a, s) => a + s.subscriptionAmount, 0) / subscribers.length).toLocaleString() : 0} ر.س
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center ring-1 ring-slate-200">
                <p className="text-xs text-slate-400 mb-1">إجمالي رسوم مستحقة</p>
                <p className="text-sm font-black text-orange-600">
                  {subscribers.reduce((a, s) => a + s.systemFees, 0).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
