// تبويب التقارير — إحصاءات شهرية ورسوم بيانية

import { Subscriber, Operation } from '@/types';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp, Wallet, AlertCircle, ClipboardList, Activity, Star, Globe, BarChart2, PieChart as PieChartIcon,
} from 'lucide-react';

export function ReportsTab({ subscribers, operations }: { subscribers: Subscriber[]; operations: Operation[] }) {
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; مشتركون: number; عمليات: number; إيرادات: number }> = {};
    const monthNames = ['يناير','فبراير','مارس','إبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    subscribers.forEach(s => {
      if (!s.joinDate) return;
      const d = new Date(s.joinDate);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!months[key]) months[key] = { month: monthNames[d.getMonth()], مشتركون: 0, عمليات: 0, إيرادات: 0 };
      months[key].مشتركون++;
      months[key].إيرادات += s.subscriptionAmount;
    });
    operations.forEach(op => {
      if (!op.date) return;
      const d = new Date(op.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!months[key]) months[key] = { month: String(d.getMonth()+1), مشتركون: 0, عمليات: 0, إيرادات: 0 };
      months[key].عمليات++;
    });
    return Object.entries(months).sort(([a],[b]) => a.localeCompare(b)).slice(-8).map(([,v]) => v);
  }, [subscribers, operations]);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { map[s.subscriberStatus] = (map[s.subscriberStatus] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const platformDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { if (s.platform) map[s.platform] = (map[s.platform] || 0) + 1; });
    return Object.entries(map).sort(([,a],[,b]) => b-a).slice(0,8).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const opsDist = useMemo(() => {
    const map: Record<string, number> = {};
    operations.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [operations]);

  const PIE_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];

  const totalRevenue = subscribers.reduce((a, s) => a + s.subscriptionAmount, 0);
  const totalProfits = subscribers.reduce((a, s) => a + s.profits, 0);
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);
  const activeRate = subscribers.length ? Math.round(subscribers.filter(s => s.subscriberStatus === 'نشط').length / subscribers.length * 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">التقارير والإحصائيات</h2>
          <p className="text-sm text-slate-400 mt-0.5">تحليل شامل لبيانات النظام</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الاشتراكات', value: `${totalRevenue.toLocaleString()} ر.س`, icon: <Wallet size={18} className="text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'إجمالي الأ��باح', value: `${totalProfits.toLocaleString()} ر.س`, icon: <TrendingUp size={18} className="text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-700' },
          { label: 'الرسوم المستحقة', value: `${totalFees.toLocaleString()} ر.س`, icon: <AlertCircle size={18} className="text-orange-500" />, bg: 'bg-orange-50', color: 'text-orange-700' },
          { label: 'نسبة النشاط', value: `${activeRate}%`, icon: <Activity size={18} className="text-purple-600" />, bg: 'bg-purple-50', color: 'text-purple-700' },
        ].map((c, i) => (
          <Card key={i} className={`${c.bg} border-none shadow-sm ring-1 ring-slate-200`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">{c.icon}<span className="text-xs text-slate-500">{c.label}</span></div>
              <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Chart */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-500" /> المشتركون الشهريون والعمليات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="مشتركون" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="عمليات" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple-500" /> توزيع حالات المشتركين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Globe size={18} className="text-cyan-500" /> توزيع منصات التداول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformDist} layout="vertical" margin={{ right: 20, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={55} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operations Status */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-500" /> حالات العمليات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {opsDist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-32 text-right">{item.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${operations.length ? (item.value / operations.length * 100) : 0}%` }}
                      transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                  <span className="text-sm font-black text-slate-700 w-10">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Subscribers by amount */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Star size={18} className="text-amber-500" /> أعلى المشتركين اشتراكاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...subscribers].sort((a,b) => b.subscriptionAmount - a.subscriptionAmount).slice(0,5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${i===0?'bg-amber-400':i===1?'bg-slate-400':i===2?'bg-orange-400':'bg-slate-300'}`}>{i+1}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{s.name}</span>
                  <span className="text-sm font-black text-emerald-600">{s.subscriptionAmount.toLocaleString()} ر.س</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
